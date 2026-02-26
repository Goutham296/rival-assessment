import { Processor, Process } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { PrismaService } from '../prisma/prisma.service';

@Processor('blog-jobs')
export class BlogJobProcessor {
  private readonly logger = new Logger(BlogJobProcessor.name);

  constructor(private prisma: PrismaService) {}

  @Process('generate-summary')
  async handleSummaryGeneration(job: Job<{ blogId: string }>) {
    const { blogId } = job.data;
    this.logger.log({ msg: 'Processing summary job', blogId, jobId: job.id });

    try {
      const blog = await this.prisma.blog.findUnique({
        where: { id: blogId },
        select: { content: true },
      });

      if (!blog) {
        this.logger.warn({ msg: 'Blog not found for summary', blogId });
        return;
      }

      // Generate a basic extractive summary (first 200 chars of plain text)
      const plainText = blog.content.replace(/<[^>]+>/g, '').trim();
      const summary =
        plainText.length > 200
          ? plainText.slice(0, 200).trimEnd() + '…'
          : plainText;

      await this.prisma.blog.update({
        where: { id: blogId },
        data: { summary },
      });

      this.logger.log({
        msg: 'Summary generated successfully',
        blogId,
        jobId: job.id,
      });
    } catch (error) {
      this.logger.error({
        msg: 'Failed to generate summary',
        blogId,
        jobId: job.id,
        error,
      });
      throw error; // Allow BullMQ retry
    }
  }
}
