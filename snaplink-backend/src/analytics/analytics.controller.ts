import { Controller, Get, Param, UseGuards, Request } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('api/analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @UseGuards(JwtAuthGuard)
  @Get('overview')
  async getOverview(@Request() req: any) {
    const data = await this.analyticsService.getOverview(req.user.id);
    return { success: true, data };
  }

  @UseGuards(JwtAuthGuard)
  @Get('aggregate')
  async getAggregateAnalytics(@Request() req: any) {
    const data = await this.analyticsService.getAggregateAnalytics(req.user.id);
    return { success: true, data };
  }

  @UseGuards(JwtAuthGuard)
  @Get('feed')
  async getFeed(@Request() req: any) {
    const data = await this.analyticsService.getFeed(req.user.id);
    return { success: true, data };
  }

  @Get('global')
  async getGlobalStats() {
    const data = await this.analyticsService.getGlobalStats();
    return { success: true, data };
  }

  @Get('public/:code')
  async getPublicStats(@Param('code') code: string) {
    const data = await this.analyticsService.getPublicStats(code);
    return { success: true, data };
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getUrlAnalytics(@Param('id') id: string, @Request() req: any) {
    const data = await this.analyticsService.getUrlAnalytics(id, req.user.id);
    return { success: true, data };
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/heatmap')
  async getHeatmap(@Param('id') id: string, @Request() req: any) {
    const data = await this.analyticsService.getHeatmap(id, req.user.id);
    return { success: true, data };
  }
}
