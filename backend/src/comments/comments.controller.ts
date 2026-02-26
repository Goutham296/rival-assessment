import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { IsString, MinLength } from 'class-validator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CommentsService } from './comments.service';

export class CreateCommentDto {
  @IsString()
  @MinLength(1)
  content!: string;
}

@Controller('blogs/:blogId/comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get()
  findAll(
    @Param('blogId') blogId: string,
    @Query('page') page = '1',
    @Query('limit') limit = '10',
  ) {
    return this.commentsService.findAll(blogId, +page, +limit);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(
    @Param('blogId') blogId: string,
    @Body() dto: CreateCommentDto,
    @CurrentUser() user: any,
  ) {
    return this.commentsService.create(blogId, dto.content, user.id);
  }
}
