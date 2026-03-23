import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, Request, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { UrlsService } from './urls.service';
import { CreateUrlDto } from './dto/create-url.dto';
import { UpdateUrlDto } from './dto/update-url.dto';
import { QueryUrlDto } from './dto/query-url.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('api/urls')
@UseGuards(JwtAuthGuard)
export class UrlsController {
  constructor(private readonly urlsService: UrlsService) {}

  @Get()
  async findAll(@Request() req: any, @Query() query: QueryUrlDto) {
    const result = await this.urlsService.findAll(req.user.id, query);
    return { success: true, ...result };
  }

  @Post()
  async create(@Request() req: any, @Body() dto: CreateUrlDto) {
    const data = await this.urlsService.create(req.user.id, dto);
    return { success: true, data };
  }

  @Post('bulk')
  @UseInterceptors(FileInterceptor('csv'))
  async bulkCreate(
    @Request() req: any,
    @Body('csv') csvText?: string,
    @UploadedFile() file?: any,
  ) {
    let csvContent = csvText;
    if (file) {
      csvContent = file.buffer.toString('utf8');
    }

    if (!csvContent) {
      throw new BadRequestException('CSV content is required (via body "csv" or file "csv")');
    }

    const data = await this.urlsService.bulkCreate(req.user.id, csvContent);
    return { success: true, data };
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Request() req: any, @Body() dto: UpdateUrlDto) {
    const data = await this.urlsService.update(id, req.user.id, dto);
    return { success: true, data };
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req: any) {
    await this.urlsService.remove(id, req.user.id);
    return { success: true };
  }
}
