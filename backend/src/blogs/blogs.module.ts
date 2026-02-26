import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { BlogsService } from './blogs.service';
import { BlogsController } from './blogs.controller';
import { BlogJobProcessor } from '../jobs/blog-job.processor';

@Module({
  imports: [
    BullModule.registerQueue({ name: 'blog-jobs' }),
  ],
  providers: [BlogsService, BlogJobProcessor],
  controllers: [BlogsController],
  exports: [BlogsService],
})
export class BlogsModule {}
