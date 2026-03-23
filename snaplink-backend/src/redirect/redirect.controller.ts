import { Controller, Get, Param, Req, Res } from '@nestjs/common';
import { RedirectService } from './redirect.service';
import { Request, Response } from 'express';
import { lookupGeo } from '../common/utils/geoip.util';
import { parseUA } from '../common/utils/ua-parser.util';
import { classifyReferrer } from '../common/utils/referrer.util';
import { hashIP } from '../common/utils/ip.util';

@Controller()
export class RedirectController {
  constructor(private readonly redirectService: RedirectService) {}

  @Get(':shortCode')
  async redirect(@Param('shortCode') shortCode: string, @Req() req: Request, @Res() res: Response): Promise<void> {
    const url = await this.redirectService.findAndValidate(shortCode);
    
    res.redirect(302, url.original_url);

    setImmediate(async () => {
      try {
        let ip = (req.headers['x-forwarded-for'] as string) || req.ip || '';
        if (ip && ip.includes(',')) {
          ip = ip.split(',')[0].trim();
        }

        const userAgent = req.headers['user-agent'] || '';
        const referer = (req.headers['referer'] || req.headers['referrer']) as string | undefined;

        const { country, city } = lookupGeo(ip);
        const { device, browser, os } = parseUA(userAgent);
        const referrer_source = classifyReferrer(referer);
        const ip_hash = ip ? hashIP(ip) : null;

        await this.redirectService.logVisit(url.id, url.clicks, url.max_clicks, {
          ip_hash,
          country,
          city,
          device,
          browser,
          os,
          referrer: referer || null,
          referrer_source,
        });
      } catch (err) {}
    });
  }
}
