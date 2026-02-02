import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  MaxLength,
  IsUrl,
} from 'class-validator';

export class CreateBlogCategoryDto {
  @ApiProperty({ example: 'Technology', description: 'Category name' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({
    example: 'Latest technology news and tutorials',
    description: 'Category description',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @ApiProperty({
    example: 'https://example.com/images/tech.jpg',
    description: 'Category image URL',
    required: false,
  })
  @IsUrl()
  @IsOptional()
  image?: string;

  @ApiProperty({
    example: 'Explore the latest in technology',
    description: 'Meta description for SEO',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(160)
  metaDescription?: string;

  @ApiProperty({
    example: 'technology, tech news, tutorials',
    description: 'Meta keywords for SEO',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  metaKeywords?: string;
}
