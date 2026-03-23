import { Injectable, NotFoundException, GoneException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RedirectService {
  constructor(private prisma: PrismaService) {}

  async findAndValidate(shortCode: string) {
    const url = await this.prisma.url.findUnique({
      where: { short_code: shortCode },
    });

    if (!url) {
      throw new NotFoundException('URL not found');
    }

    if (!url.is_active) {
      throw new GoneException('URL is no longer active');
    }

    if (url.expires_at && url.expires_at < new Date()) {
      throw new GoneException('URL has expired');
    }

    if (url.max_clicks && url.clicks >= url.max_clicks) {
      throw new GoneException('URL has reached its click limit');
    }

    return url;
  }

  async logVisit(
    urlId: string,
    currentClicks: number,
    maxClicks: number | null,
    visitData: {
      ip_hash: string | null;
      country: string | null;
      city: string | null;
      device: string;
      browser: string;
      os: string;
      referrer: string | null;
      referrer_source: string;
    },
  ) {
    const nextClicks = currentClicks + 1;
    const shouldDeactivate = maxClicks !== null && nextClicks >= maxClicks;

    await Promise.all([
      this.prisma.visit.create({
        data: {
          url_id: urlId,
          ...visitData,
        },
      }),
      this.prisma.url.update({
        where: { id: urlId },
        data: {
          clicks: { increment: 1 },
          ...(shouldDeactivate ? { is_active: false } : {}),
        },
      }),
    ]);
  }
}
