import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsOptional,
  IsArray,
  IsIn,
} from 'class-validator';

/**
 * DTO for creating a new blog post
 */
export class CreateBlogPostDto {
  @ApiProperty({
    example: 'How to Build a Modern Web App',
    minLength: 5,
    maxLength: 200,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(200)
  title: string;

  @ApiProperty({
    example: '<h1>Introduction</h1><p>Content here...</p>',
    description: 'HTML content from rich text editor',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  content: string;

  @ApiProperty({
    example:
      'Learn how to build modern web applications with React and Node.js',
    required: false,
    maxLength: 500,
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  excerpt?: string;

  @ApiProperty({
    example: 'https://example.com/images/post.jpg',
    required: false,
  })
  @IsString()
  @IsOptional()
  featuredImage?: string;

  @ApiProperty({
    example: 'draft',
    enum: ['draft', 'published', 'archived'],
    default: 'draft',
  })
  @IsString()
  @IsOptional()
  @IsIn(['draft', 'published', 'archived'])
  status?: string;

  @ApiProperty({
    example: 'Build modern web applications with the latest technologies',
    required: false,
    maxLength: 160,
  })
  @IsString()
  @IsOptional()
  @MaxLength(160)
  metaDescription?: string;

  @ApiProperty({
    example: 'web development, react, nodejs, tutorial',
    required: false,
  })
  @IsString()
  @IsOptional()
  metaKeywords?: string;

  @ApiProperty({
    example: ['react', 'nodejs', 'tutorial'],
    required: false,
    type: [String],
  })
  @IsArray()
  @IsOptional()
  tags?: string[];

  @ApiProperty({
    example: 'Web Development',
    required: false,
  })
  @IsString()
  @IsOptional()
  category?: string;
}
