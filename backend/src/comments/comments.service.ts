import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CommentsService {
  constructor(private prisma: PrismaService) {}

  async findAll(blogId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;
    const [comments, total] = await Promise.all([
      this.prisma.comment.findMany({
        where: { blogId },
        include: { user: { select: { id: true, name: true, email: true } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.comment.count({ where: { blogId } }),
    ]);
    return { comments, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async create(blogId: string, content: string, userId: string) {
    return this.prisma.comment.create({
      data: { content, blogId, userId },
      include: { user: { select: { id: true, name: true, email: true } } },
    });
  }
}
