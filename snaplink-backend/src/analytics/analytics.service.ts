import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { calculateHealthScore } from '../common/utils/health-score.util';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  private async verifyOwnership(urlId: string, userId: string) {
    const url = await this.prisma.url.findUnique({ where: { id: urlId } });
    if (!url) throw new NotFoundException('URL not found');
    if (url.user_id !== userId) throw new ForbiddenException('You do not own this URL');
    return url;
  }

  private fillDailyGaps(rows: { date: string | Date; clicks: number | bigint }[], days: number) {
    const result: { date: string; clicks: number }[] = [];
    const _now = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(_now.getTime() - i * 24 * 60 * 60 * 1000);
      const ds = d.toISOString().split('T')[0];
      const match = rows.find(r => {
        const dateStr = r.date instanceof Date ? r.date.toISOString().split('T')[0] : r.date;
        return dateStr === ds;
      });
      result.push({ date: ds, clicks: match ? Number(match.clicks) : 0 });
    }
    return result;
  }

  private fillHourlyGaps(rows: { hour: number | bigint; clicks: number | bigint }[]) {
    const result: { hour: number; clicks: number }[] = [];
    for (let i = 0; i < 24; i++) {
      const match = rows.find(r => Number(r.hour) === i);
      result.push({ hour: i, clicks: match ? Number(match.clicks) : 0 });
    }
    return result;
  }

  async getUrlAnalytics(urlId: string, userId: string) {
    const url = await this.verifyOwnership(urlId, userId);

    const [
      lastVisitedArr,
      uniqueVisitorsArr,
      dailyClicks,
      hourlyHeatmap,
      deviceBreakdown,
      browserBreakdown,
      osBreakdown,
      countryBreakdown,
      referrerBreakdown,
      recentVisits,
      clicksLast7DaysArr,
      hasVisitLast24hArr,
      distinctDeviceCountArr,
    ] = await Promise.all([
      this.prisma.$queryRaw<any[]>`SELECT visited_at FROM visits WHERE url_id = CAST(${urlId} AS UUID) ORDER BY visited_at DESC LIMIT 1`,
      this.prisma.$queryRaw<any[]>`SELECT COUNT(DISTINCT ip_hash) as count FROM visits WHERE url_id = CAST(${urlId} AS UUID)`,
      this.prisma.$queryRaw<any[]>`SELECT DATE(visited_at) as date, COUNT(*) as clicks FROM visits WHERE url_id = CAST(${urlId} AS UUID) AND visited_at >= NOW() - INTERVAL '30 days' GROUP BY date ORDER BY date ASC`,
      this.prisma.$queryRaw<any[]>`SELECT EXTRACT(HOUR FROM visited_at) as hour, COUNT(*) as clicks FROM visits WHERE url_id = CAST(${urlId} AS UUID) GROUP BY hour ORDER BY hour ASC`,
      this.prisma.$queryRaw<any[]>`SELECT device, COUNT(*) as count FROM visits WHERE url_id = CAST(${urlId} AS UUID) GROUP BY device`,
      this.prisma.$queryRaw<any[]>`SELECT browser, COUNT(*) as count FROM visits WHERE url_id = CAST(${urlId} AS UUID) GROUP BY browser`,
      this.prisma.$queryRaw<any[]>`SELECT os, COUNT(*) as count FROM visits WHERE url_id = CAST(${urlId} AS UUID) GROUP BY os`,
      this.prisma.$queryRaw<any[]>`SELECT country, COUNT(*) as count FROM visits WHERE url_id = CAST(${urlId} AS UUID) GROUP BY country ORDER BY count DESC LIMIT 10`,
      this.prisma.$queryRaw<any[]>`SELECT referrer_source, COUNT(*) as count FROM visits WHERE url_id = CAST(${urlId} AS UUID) GROUP BY referrer_source`,
      this.prisma.visit.findMany({ where: { url_id: urlId }, orderBy: { visited_at: 'desc' }, take: 20 }),
      this.prisma.$queryRaw<any[]>`SELECT COUNT(*) as count FROM visits WHERE url_id = CAST(${urlId} AS UUID) AND visited_at >= NOW() - INTERVAL '7 days'`,
      this.prisma.$queryRaw<any[]>`SELECT COUNT(*) as count FROM visits WHERE url_id = CAST(${urlId} AS UUID) AND visited_at >= NOW() - INTERVAL '24 hours'`,
      this.prisma.$queryRaw<any[]>`SELECT COUNT(DISTINCT device) as count FROM visits WHERE url_id = CAST(${urlId} AS UUID)`,
    ]);

    const clicksLast7Days = Number(clicksLast7DaysArr[0]?.count ?? 0);
    const hasVisitLast24h = Number(hasVisitLast24hArr[0]?.count ?? 0) > 0;
    const distinctDeviceCount = Number(distinctDeviceCountArr[0]?.count ?? 0);

    const healthScore = calculateHealthScore({
      clicksLast7Days,
      hasVisitLast24h,
      distinctDeviceCount,
      totalClicks: url.clicks,
    });

    const convertCount = (arr: any[]) => arr.map(item => ({ ...item, count: Number(item.count) }));

    return {
      url,
      healthScore,
      lastVisited: lastVisitedArr[0]?.visited_at || null,
      uniqueVisitors: Number(uniqueVisitorsArr[0]?.count ?? 0),
      dailyClicks: this.fillDailyGaps(dailyClicks, 30),
      hourlyHeatmap: this.fillHourlyGaps(hourlyHeatmap),
      deviceBreakdown: convertCount(deviceBreakdown),
      browserBreakdown: convertCount(browserBreakdown),
      osBreakdown: convertCount(osBreakdown),
      countryBreakdown: convertCount(countryBreakdown),
      referrerBreakdown: convertCount(referrerBreakdown),
      recentVisits,
    };
  }

  async getHeatmap(urlId: string, userId: string) {
    await this.verifyOwnership(urlId, userId);
    const hourlyHeatmap = await this.prisma.$queryRaw<any[]>`SELECT EXTRACT(HOUR FROM visited_at) as hour, COUNT(*) as clicks FROM visits WHERE url_id = CAST(${urlId} AS UUID) GROUP BY hour ORDER BY hour ASC`;
    return this.fillHourlyGaps(hourlyHeatmap);
  }

  async getOverview(userId: string) {
    const urls = await this.prisma.url.findMany({
      where: { user_id: userId },
      select: { id: true, short_code: true, original_url: true, title: true, favicon_url: true, clicks: true, is_active: true, created_at: true },
      orderBy: { clicks: 'desc' },
    });

    if (urls.length === 0) {
      return {
        clicksToday: 0,
        clicksThisWeek: 0,
        clicksThisMonth: 0,
        topUrl: null,
        topCountry: null,
        bestHour: null,
        totalUrls: 0,
        totalClicks: 0,
        urls: [],
      };
    }

    const totalClicks = urls.reduce((sum: number, u: any) => sum + u.clicks, 0);

    const [clicksTodayArr, clicksThisWeekArr, clicksThisMonthArr, topCountryArr, bestHourArr, sparklineRows] = await Promise.all([
      this.prisma.$queryRaw<any[]>`SELECT COUNT(*) as count FROM visits v JOIN urls u ON v.url_id = u.id WHERE u.user_id = CAST(${userId} AS UUID) AND DATE(v.visited_at) >= CURRENT_DATE`,
      this.prisma.$queryRaw<any[]>`SELECT COUNT(*) as count FROM visits v JOIN urls u ON v.url_id = u.id WHERE u.user_id = CAST(${userId} AS UUID) AND v.visited_at >= DATE_TRUNC('week', NOW())`,
      this.prisma.$queryRaw<any[]>`SELECT COUNT(*) as count FROM visits v JOIN urls u ON v.url_id = u.id WHERE u.user_id = CAST(${userId} AS UUID) AND v.visited_at >= DATE_TRUNC('month', NOW())`,
      this.prisma.$queryRaw<any[]>`SELECT country, COUNT(*) as count FROM visits v JOIN urls u ON v.url_id = u.id WHERE u.user_id = CAST(${userId} AS UUID) AND country IS NOT NULL GROUP BY country ORDER BY count DESC LIMIT 1`,
      this.prisma.$queryRaw<any[]>`SELECT EXTRACT(HOUR FROM v.visited_at) as hour, COUNT(*) as count FROM visits v JOIN urls u ON v.url_id = u.id WHERE u.user_id = CAST(${userId} AS UUID) GROUP BY hour ORDER BY count DESC LIMIT 1`,
      this.prisma.$queryRaw<any[]>`SELECT url_id, DATE(visited_at) as date, COUNT(*) as clicks FROM visits v JOIN urls u ON v.url_id = u.id WHERE u.user_id = CAST(${userId} AS UUID) AND visited_at >= NOW() - INTERVAL '7 days' GROUP BY url_id, date`,
    ]);

    const resultUrls = urls.map((u: any) => {
      const uRows = sparklineRows.filter((r: any) => r.url_id === u.id);
      return {
        ...u,
        sparkline: this.fillDailyGaps(uRows, 7).map(d => d.clicks),
      };
    });

    return {
      clicksToday: Number(clicksTodayArr[0]?.count ?? 0),
      clicksThisWeek: Number(clicksThisWeekArr[0]?.count ?? 0),
      clicksThisMonth: Number(clicksThisMonthArr[0]?.count ?? 0),
      topUrl: urls[0] || null,
      topCountry: topCountryArr[0] ? { country: topCountryArr[0].country, count: Number(topCountryArr[0].count) } : null,
      bestHour: bestHourArr[0] ? { hour: Number(bestHourArr[0].hour), count: Number(bestHourArr[0].count) } : null,
      totalUrls: urls.length,
      totalClicks,
      urls: resultUrls,
    };
  }

  async getPublicStats(shortCode: string) {
    const url = await this.prisma.url.findUnique({ where: { short_code: shortCode } });
    if (!url) throw new NotFoundException('URL not found');
    if (!url.is_public_stats) throw new ForbiddenException('Stats are private');

    const [dailyClicks, countryBreakdown, deviceBreakdown] = await Promise.all([
      this.prisma.$queryRaw<any[]>`SELECT DATE(visited_at) as date, COUNT(*) as clicks FROM visits WHERE url_id = CAST(${url.id} AS UUID) AND visited_at >= NOW() - INTERVAL '30 days' GROUP BY date ORDER BY date ASC`,
      this.prisma.$queryRaw<any[]>`SELECT country, COUNT(*) as count FROM visits WHERE url_id = CAST(${url.id} AS UUID) AND country IS NOT NULL GROUP BY country ORDER BY count DESC LIMIT 10`,
      this.prisma.$queryRaw<any[]>`SELECT device, COUNT(*) as count FROM visits WHERE url_id = CAST(${url.id} AS UUID) GROUP BY device`,
    ]);

    const convertCount = (arr: any[]) => arr.map(item => ({ ...item, count: Number(item.count) }));

    return {
      shortCode: url.short_code,
      title: url.title,
      totalClicks: url.clicks,
      createdAt: url.created_at,
      dailyClicks: this.fillDailyGaps(dailyClicks, 30),
      countryBreakdown: convertCount(countryBreakdown),
      deviceBreakdown: convertCount(deviceBreakdown),
    };
  }

  async getFeed(userId: string) {
    const visits = await this.prisma.visit.findMany({
      where: {
        Url: {
          user_id: userId,
        },
      },
      include: {
        Url: {
          select: {
            short_code: true,
            title: true,
            favicon_url: true,
          },
        },
      },
      orderBy: {
        visited_at: 'desc',
      },
      take: 10,
    });

    return visits.map(v => ({
      id: v.id,
      shortCode: v.Url.short_code,
      title: v.Url.title || 'Untitled',
      favicon: v.Url.favicon_url,
      country: v.country,
      city: v.city,
      device: v.device,
      browser: v.browser,
      timestamp: v.visited_at,
      referrer: v.referrer_source,
    }));
  }

  async getGlobalStats() {
    const [totalUrls, totalClicksArr] = await Promise.all([
      this.prisma.url.count(),
      this.prisma.$queryRaw<any[]>`SELECT SUM(clicks) as count FROM urls`,
    ]);

    return {
      totalUrls: Number(totalUrls),
      totalClicks: Number(totalClicksArr[0]?.sum || totalClicksArr[0]?.count || 0),
    };
  }

  async getAggregateAnalytics(userId: string) {
    const [
      totalUrls,
      totalClicksArr,
      uniqueVisitorsArr,
      dailyClicks,
      hourlyHeatmap,
      deviceBreakdown,
      browserBreakdown,
      osBreakdown,
      countryBreakdown,
      referrerBreakdown,
      recentVisits,
      clicksLast7DaysArr,
      hasVisitLast24hArr,
      distinctDeviceCountArr,
    ] = await Promise.all([
      this.prisma.url.count({ where: { user_id: userId } }),
      this.prisma.$queryRaw<any[]>`SELECT SUM(clicks) as count FROM urls WHERE user_id = CAST(${userId} AS UUID)`,
      this.prisma.$queryRaw<any[]>`SELECT COUNT(DISTINCT ip_hash) as count FROM visits v JOIN urls u ON v.url_id = u.id WHERE u.user_id = CAST(${userId} AS UUID)`,
      this.prisma.$queryRaw<any[]>`SELECT DATE(v.visited_at) as date, COUNT(*) as clicks FROM visits v JOIN urls u ON v.url_id = u.id WHERE u.user_id = CAST(${userId} AS UUID) AND v.visited_at >= NOW() - INTERVAL '30 days' GROUP BY date ORDER BY date ASC`,
      this.prisma.$queryRaw<any[]>`SELECT EXTRACT(HOUR FROM v.visited_at) as hour, COUNT(*) as clicks FROM visits v JOIN urls u ON v.url_id = u.id WHERE u.user_id = CAST(${userId} AS UUID) GROUP BY hour ORDER BY hour ASC`,
      this.prisma.$queryRaw<any[]>`SELECT v.device, COUNT(*) as count FROM visits v JOIN urls u ON v.url_id = u.id WHERE u.user_id = CAST(${userId} AS UUID) GROUP BY v.device`,
      this.prisma.$queryRaw<any[]>`SELECT v.browser, COUNT(*) as count FROM visits v JOIN urls u ON v.url_id = u.id WHERE u.user_id = CAST(${userId} AS UUID) GROUP BY v.browser`,
      this.prisma.$queryRaw<any[]>`SELECT v.os, COUNT(*) as count FROM visits v JOIN urls u ON v.url_id = u.id WHERE u.user_id = CAST(${userId} AS UUID) GROUP BY v.os`,
      this.prisma.$queryRaw<any[]>`SELECT v.country, COUNT(*) as count FROM visits v JOIN urls u ON v.url_id = u.id WHERE u.user_id = CAST(${userId} AS UUID) GROUP BY v.country ORDER BY count DESC LIMIT 10`,
      this.prisma.$queryRaw<any[]>`SELECT v.referrer_source, COUNT(*) as count FROM visits v JOIN urls u ON v.url_id = u.id WHERE u.user_id = CAST(${userId} AS UUID) GROUP BY v.referrer_source`,
      this.prisma.visit.findMany({ 
        where: { Url: { user_id: userId } }, 
        orderBy: { visited_at: 'desc' }, 
        take: 20,
        include: { Url: { select: { short_code: true, title: true } } }
      }),
      this.prisma.$queryRaw<any[]>`SELECT COUNT(*) as count FROM visits v JOIN urls u ON v.url_id = u.id WHERE u.user_id = CAST(${userId} AS UUID) AND v.visited_at >= NOW() - INTERVAL '7 days'`,
      this.prisma.$queryRaw<any[]>`SELECT COUNT(*) as count FROM visits v JOIN urls u ON v.url_id = u.id WHERE u.user_id = CAST(${userId} AS UUID) AND v.visited_at >= NOW() - INTERVAL '24 hours'`,
      this.prisma.$queryRaw<any[]>`SELECT COUNT(DISTINCT v.device) as count FROM visits v JOIN urls u ON v.url_id = u.id WHERE u.user_id = CAST(${userId} AS UUID)`,
    ]);
    
    const totalClicks = Number(totalClicksArr[0]?.count || 0);
    const clicksLast7Days = Number(clicksLast7DaysArr[0]?.count ?? 0);
    const hasVisitLast24h = Number(hasVisitLast24hArr[0]?.count ?? 0) > 0;
    const distinctDeviceCount = Number(distinctDeviceCountArr[0]?.count ?? 0);

    const healthScore = calculateHealthScore({
      clicksLast7Days,
      hasVisitLast24h,
      distinctDeviceCount,
      totalClicks,
    });

    const convertCount = (arr: any[]) => arr.map(item => ({ ...item, count: Number(item.count) }));

    return {
      totalUrls,
      totalClicks,
      uniqueVisitors: Number(uniqueVisitorsArr[0]?.count ?? 0),
      dailyClicks: this.fillDailyGaps(dailyClicks, 30),
      hourlyHeatmap: this.fillHourlyGaps(hourlyHeatmap),
      deviceBreakdown: convertCount(deviceBreakdown),
      browserBreakdown: convertCount(browserBreakdown),
      osBreakdown: convertCount(osBreakdown),
      countryBreakdown: convertCount(countryBreakdown),
      referrerBreakdown: convertCount(referrerBreakdown),
      recentVisits: recentVisits.map(v => ({
        ...v,
        shortCode: v.Url.short_code,
        urlTitle: v.Url.title
      })),
      healthScore,
    };
  }
}
