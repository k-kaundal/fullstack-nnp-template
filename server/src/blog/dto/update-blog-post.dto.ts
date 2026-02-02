import { PartialType } from '@nestjs/swagger';
import { CreateBlogPostDto } from './create-blog-post.dto';

/**
 * DTO for updating a blog post
 * All fields from CreateBlogPostDto are optional
 * Includes system-managed fields that are set automatically
 */
export class UpdateBlogPostDto extends PartialType(CreateBlogPostDto) {
  slug?: string;
  readTime?: number;
  publishedAt?: Date;
}
