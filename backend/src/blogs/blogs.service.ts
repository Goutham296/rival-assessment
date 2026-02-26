import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import slugify from 'slugify';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBlogDto, UpdateBlogDto } from './dto/blog.dto';

@Injectable()
export class BlogsService {
  constructor(
    private prisma: PrismaService,
    @InjectQueue('blog-jobs') private blogQueue: Queue,
  ) {}

  async create(userId: string, dto: CreateBlogDto) {
    const slug = await this.generateUniqueSlug(dto.title);

    const blog = await this.prisma.blog.create({
      data: {
        userId,
        title: dto.title,
        slug,
        content: dto.content,
        isPublished: dto.isPublished ?? false,
      },
      include: { user: { select: { id: true, email: true, name: true } } },
    });

    // Enqueue summary generation if published (non-blocking)
    if (blog.isPublished) {
      await this.blogQueue
        .add('generate-summary', { blogId: blog.id }, { attempts: 3 })
        .catch(() => {
          /* Redis unavailable – gracefully skip */
        });
    }

    return blog;
  }

  async findAllByUser(userId: string) {
    return this.prisma.blog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { likes: true, comments: true } },
      },
    });
  }

  async findOne(id: string, userId: string) {
    const blog = await this.prisma.blog.findUnique({
      where: { id },
      include: { _count: { select: { likes: true, comments: true } } },
    });
    if (!blog) throw new NotFoundException('Blog not found');
    if (blog.userId !== userId) throw new ForbiddenException();
    return blog;
  }

  async update(id: string, userId: string, dto: UpdateBlogDto) {
    const blog = await this.prisma.blog.findUnique({ where: { id } });
    if (!blog) throw new NotFoundException('Blog not found');
    if (blog.userId !== userId) throw new ForbiddenException();

    const wasUnpublished = !blog.isPublished;
    const isBeingPublished = dto.isPublished === true;

    const data: {
      title?: string;
      content?: string;
      isPublished?: boolean;
      slug?: string;
    } = {};
    if (dto.title !== undefined) {
      data.title = dto.title;
      data.slug = await this.generateUniqueSlug(dto.title, id);
    }
    if (dto.content !== undefined) data.content = dto.content;
    if (dto.isPublished !== undefined) data.isPublished = dto.isPublished;

    const updated = await this.prisma.blog.update({ where: { id }, data });

    // Enqueue summary job if newly published
    if (wasUnpublished && isBeingPublished) {
      await this.blogQueue
        .add('generate-summary', { blogId: id }, { attempts: 3 })
        .catch(() => {});
    }

    return updated;
  }

  async remove(id: string, userId: string) {
    const blog = await this.prisma.blog.findUnique({ where: { id } });
    if (!blog) throw new NotFoundException('Blog not found');
    if (blog.userId !== userId) throw new ForbiddenException();
    await this.prisma.blog.delete({ where: { id } });
    return { message: 'Blog deleted' };
  }

  private async generateUniqueSlug(
    title: string,
    excludeId?: string,
  ): Promise<string> {
    const base = slugify(title, { lower: true, strict: true });
    let slug = base;
    let counter = 1;

    while (true) {
      const existing = await this.prisma.blog.findUnique({ where: { slug } });
      if (!existing || existing.id === excludeId) break;
      slug = `${base}-${counter++}`;
    }

    return slug;
  }
}
