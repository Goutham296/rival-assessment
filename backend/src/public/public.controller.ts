import { Controller, Get, Param, Query, NotFoundException } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { PrismaService } from '../prisma/prisma.service';
import { IsOptional, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

class FeedQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number = 10;
}

@Controller('public')
@Throttle({ medium: { ttl: 60000, limit: 60 } })
export class PublicController {
  constructor(private prisma: PrismaService) {}

  @Get('feed')
  async getFeed(@Query() query: FeedQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    // Single optimized query — avoids N+1 by using _count aggregation
    const [blogs, total] = await Promise.all([
      this.prisma.blog.findMany({
        where: { isPublished: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          title: true,
          slug: true,
          summary: true,
          createdAt: true,
          user: { select: { id: true, name: true, email: true } },
          _count: { select: { likes: true, comments: true } },
        },
      }),
      this.prisma.blog.count({ where: { isPublished: true } }),
    ]);

    return {
      data: blogs,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    };
  }

  @Get('blogs/:slug')
  @Throttle({ medium: { ttl: 60000, limit: 30 } })
  async getBlogBySlug(@Param('slug') slug: string) {
    const blog = await this.prisma.blog.findUnique({
      where: { slug },
      select: {
        id: true,
        title: true,
        slug: true,
        content: true,
        summary: true,
        createdAt: true,
        updatedAt: true,
        user: { select: { id: true, name: true, email: true } },
        _count: { select: { likes: true, comments: true } },
      },
    });

    if (!blog || !blog) throw new NotFoundException('Blog not found');

    // Re-fetch to check isPublished (not in select above to keep response clean)
    const raw = await this.prisma.blog.findUnique({
      where: { slug },
      select: { isPublished: true },
    });
    if (!raw?.isPublished) throw new NotFoundException('Blog not found');

    return blog;
  }
}
