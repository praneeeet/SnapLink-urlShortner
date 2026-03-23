import { Injectable, ConflictException, InternalServerErrorException, ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUrlDto } from './dto/create-url.dto';
import { UpdateUrlDto } from './dto/update-url.dto';
import { QueryUrlDto } from './dto/query-url.dto';
import { generateShortCode } from '../common/utils/nanoid.util';
import { fetchOGMetadata } from '../common/utils/og-fetch.util';
import { isURL } from 'class-validator';
import { parse } from 'csv-parse/sync';
import { Prisma } from '@prisma/client';

@Injectable()
export class UrlsService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string, query: QueryUrlDto) {
    const { sort, order, filter, search, page, limit } = query;

    const where: any = { user_id: userId };

    const andConditions: any[] = [];

    if (filter === 'active') {
      andConditions.push({
        is_active: true,
        OR: [{ expires_at: null }, { expires_at: { gt: new Date() } }],
      });
    } else if (filter === 'expired') {
      andConditions.push({
        OR: [
          { is_active: false },
          { expires_at: { lte: new Date() } },
        ],
      });
    }

    if (search) {
      andConditions.push({
        OR: [
          { original_url: { contains: search, mode: 'insensitive' } },
          { short_code: { contains: search, mode: 'insensitive' } },
          { title: { contains: search, mode: 'insensitive' } },
        ],
      });
    }

    if (andConditions.length > 0) {
      where.AND = andConditions;
    }

    const total = await this.prisma.url.count({ where });

    const data = await this.prisma.url.findMany({
      where,
      orderBy: { [sort]: order },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async create(userId: string, dto: CreateUrlDto) {
    let shortCode = dto.customAlias;

    if (shortCode) {
      const existing = await this.prisma.url.findUnique({ where: { short_code: shortCode } });
      if (existing) {
        throw new ConflictException('Custom alias is already taken');
      }
    } else {
      let attempts = 0;
      while (attempts < 5) {
        shortCode = generateShortCode();
        const existing = await this.prisma.url.findUnique({ where: { short_code: shortCode } });
        if (!existing) break;
        attempts++;
      }
      if (attempts === 5) {
        throw new InternalServerErrorException('Failed to generate a unique short code');
      }
    }

    const url = await this.prisma.url.create({
      data: {
        short_code: shortCode as string,
        original_url: dto.originalUrl,
        user_id: userId,
        title: dto.title,
        expires_at: dto.expiresAt ? new Date(dto.expiresAt) : null,
        max_clicks: dto.maxClicks,
        is_public_stats: dto.isPublicStats || false,
      },
    });

    setImmediate(async () => {
      try {
        const og = await fetchOGMetadata(dto.originalUrl);
        if (og.title || og.faviconUrl) {
          await this.prisma.url.update({
            where: { id: url.id },
            data: {
              title: (!dto.title && og.title) ? og.title : undefined,
              favicon_url: og.faviconUrl ? og.faviconUrl : undefined,
            },
          });
        }
      } catch (err) {}
    });

    return url;
  }

  private async findOneOwned(id: string, userId: string) {
    const url = await this.prisma.url.findUnique({ where: { id } });
    if (!url) throw new NotFoundException('URL not found');
    if (url.user_id !== userId) throw new ForbiddenException('You do not own this URL');
    return url;
  }

  async update(id: string, userId: string, dto: UpdateUrlDto) {
    await this.findOneOwned(id, userId);

    const data: any = {};

    if (dto.originalUrl !== undefined) data.original_url = dto.originalUrl;
    if (dto.title !== undefined) data.title = dto.title;
    if (dto.expiresAt !== undefined) data.expires_at = dto.expiresAt === null ? null : new Date(dto.expiresAt);
    if (dto.maxClicks !== undefined) data.max_clicks = dto.maxClicks;
    if (dto.isPublicStats !== undefined) data.is_public_stats = dto.isPublicStats;
    if (dto.isActive !== undefined) data.is_active = dto.isActive;

    return this.prisma.url.update({
      where: { id },
      data,
    });
  }

  async remove(id: string, userId: string) {
    await this.findOneOwned(id, userId);
    await this.prisma.url.delete({ where: { id } });
    return { success: true };
  }

  async bulkCreate(userId: string, csvContent: string) {
    try {
      console.log('Bulk Create - Received CSV length:', csvContent.length);
      console.log('Bulk Create - First 100 chars:', csvContent.substring(0, 100).replace(/\n/g, '\\n'));
      
      if (!csvContent || csvContent.trim().length === 0) {
        throw new BadRequestException('CSV content is empty');
      }

      const parseOptions = {
        bom: true,
        trim: true,
        skip_empty_lines: true,
        relax_column_count: true,
      };

      // Try parsing with headers first
      let records: any[] = [];
      try {
        records = parse(csvContent, { 
          ...parseOptions,
          columns: (header: string[]) => header.map(h => h.trim().toLowerCase()),
        });
      } catch (e: any) {
        console.warn('Initial CSV parse with headers failed, trying fallback:', e.message);
      }

      console.log('Bulk Create - Parsed records count (with headers):', records.length);

      // Fallback: If no records were found or parsing failed, try parsing without headers
      // This handles CSVs that only have a single line (no header)
      if (records.length === 0) {
        const rawRecords = parse(csvContent, parseOptions);
        if (rawRecords.length > 0) {
          console.log('Bulk Create - Fallback to headerless parsing. Row count:', rawRecords.length);
          // If the first cell looks like a URL, treat it as a headerless CSV where column 0 is the URL
          records = rawRecords.map(row => {
            // If row is array, map first column as 'url'
            if (Array.isArray(row)) {
              return { url: row[0], title: row[1] || '' };
            }
            // If row is object (shouldn't happen with columns: false), just return it
            return row;
          });
        }
      }

      const success = [];
      const failed = [];

      let rowNum = 0;
      for (const record of records) {
        rowNum++;
        
        // Support multiple possible column names (lowercased by the parser)
        const targetUrl = record.url || record.original_url || record.originalurl || record.link || 
                         record.destination || record.target_url || record.targeturl || 
                         record.target || record.long_url || record.longurl || record['0'];
        
        if (!targetUrl || targetUrl.toString().trim() === '') {
          // If we are in headerless mode, we might be processing the header as data if it exists
          // but if we can't find a URL, we skip
          continue;
        }

        let trimmedUrl = targetUrl.toString().trim();
        
        // Basic URL cleanup
        if (!trimmedUrl.startsWith('http://') && !trimmedUrl.startsWith('https://')) {
          // Skip the row if it's actually the header row words
          const isHeaderRow = ['url', 'link', 'destination', 'long_url'].includes(trimmedUrl.toLowerCase());
          if (isHeaderRow && rowNum === 1) continue;
          
          trimmedUrl = `https://${trimmedUrl}`;
        }

        if (!isURL(trimmedUrl, { require_protocol: true })) {
          failed.push({ row: rowNum, url: trimmedUrl, reason: 'Invalid URL format' });
          continue;
        }

        try {
          const dto = new CreateUrlDto();
          dto.originalUrl = trimmedUrl;
          if (record.title) dto.title = record.title.toString().trim();
          
          const created = await this.create(userId, dto);
          success.push(created);
        } catch (err: any) {
          failed.push({ row: rowNum, url: trimmedUrl, reason: err.message || 'Error creating URL' });
        }
      }

      return { success, failed };
    } catch (err: any) {
      console.error('CSV Parse Critical Error:', err);
      if (err instanceof BadRequestException) throw err;
      throw new InternalServerErrorException('Failed to parse CSV: ' + err.message);
    }
  }
}
