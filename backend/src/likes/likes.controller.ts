import {
  Controller,
  Post,
  Delete,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, AuthUser } from '../auth/decorators/current-user.decorator';
import { PrismaService } from '../prisma/prisma.service';

@Controller('blogs/:blogId/like')
@UseGuards(JwtAuthGuard)
export class LikesController {
  constructor(private prisma: PrismaService) {}

  @Post()
  async like(
    @Param('blogId') blogId: string,
    @CurrentUser() user: AuthUser,
  ) {
    const blog = await this.prisma.blog.findUnique({ where: { id: blogId } });
    if (!blog) throw new NotFoundException('Blog not found');

    try {
      await this.prisma.like.create({ data: { userId: user.id, blogId } });
    } catch {
      throw new ConflictException('Already liked');
    }

    const likeCount = await this.prisma.like.count({ where: { blogId } });
    return { liked: true, likeCount };
  }

  @Delete()
  @HttpCode(HttpStatus.OK)
  async unlike(
    @Param('blogId') blogId: string,
    @CurrentUser() user: AuthUser,
  ) {
    const like = await this.prisma.like.findUnique({
      where: { userId_blogId: { userId: user.id, blogId } },
    });
    if (!like) throw new NotFoundException('Like not found');

    await this.prisma.like.delete({
      where: { userId_blogId: { userId: user.id, blogId } },
    });

    const likeCount = await this.prisma.like.count({ where: { blogId } });
    return { liked: false, likeCount };
  }
}
