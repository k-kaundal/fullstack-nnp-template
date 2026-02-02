import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Req,
  Res,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse as ApiResponseDecorator,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { Response } from 'express';
import { BlogService } from './blog.service';
import {
  CreateBlogPostDto,
  UpdateBlogPostDto,
  CreateBlogCategoryDto,
  UpdateBlogCategoryDto,
} from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  ApiUnauthorizedResponse,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiConflictResponse,
} from '../common/decorators';

/**
 * Controller for blog post management
 * Handles CRUD operations and public blog endpoints
 */
@ApiTags('blog')
@Controller('blog')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  /**
   * Create new blog post (admin only)
   */
  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new blog post' })
  @ApiResponseDecorator({
    status: HttpStatus.CREATED,
    description: 'Blog post created successfully',
    schema: {
      example: {
        status: 'success',
        statusCode: 201,
        message: 'Blog post created successfully',
        data: {
          id: 'uuid',
          title: 'How to Build a Modern Web App',
          slug: 'how-to-build-a-modern-web-app',
          content: '<h1>Introduction</h1>',
          status: 'draft',
          readTime: 5,
          createdAt: '2026-02-02T10:00:00.000Z',
        },
        meta: {
          blog_post_id: 'uuid',
          slug: 'how-to-build-a-modern-web-app',
          created_at: '2026-02-02T10:00:00.000Z',
        },
      },
    },
  })
  @ApiBadRequestResponse('/api/v1/blog')
  @ApiUnauthorizedResponse('/api/v1/blog')
  async create(
    @Body() createBlogPostDto: CreateBlogPostDto,
    @Req() req: Request & { user: { sub: string } },
    @Res() res: Response,
  ): Promise<Response> {
    return this.blogService.create(createBlogPostDto, req.user.sub, res);
  }

  /**
   * Get all blog posts (admin - includes drafts)
   */
  @Get('admin')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all blog posts (admin)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'category', required: false, type: String })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiResponseDecorator({
    status: HttpStatus.OK,
    description: 'Blog posts fetched successfully',
  })
  @ApiUnauthorizedResponse('/api/v1/blog/admin')
  async findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('status') status?: string,
    @Query('category') category?: string,
    @Query('search') search?: string,
    @Res() res?: Response,
  ): Promise<Response> {
    return this.blogService.findAll(
      parseInt(page),
      parseInt(limit),
      status,
      category,
      search,
      undefined,
      res,
    );
  }

  /**
   * Get published blog posts (public)
   */
  @Get('published')
  @ApiOperation({ summary: 'Get published blog posts (public)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'category', required: false, type: String })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiResponseDecorator({
    status: HttpStatus.OK,
    description: 'Published blog posts fetched successfully',
  })
  async findPublished(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('category') category?: string,
    @Query('search') search?: string,
    @Res() res?: Response,
  ): Promise<Response> {
    return this.blogService.findPublished(
      parseInt(page),
      parseInt(limit),
      category,
      search,
      undefined,
      res,
    );
  }

  /**
   * Get blog post by slug (public)
   */
  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get blog post by slug (public)' })
  @ApiResponseDecorator({
    status: HttpStatus.OK,
    description: 'Blog post fetched successfully',
  })
  @ApiNotFoundResponse('Blog post', '/api/v1/blog/slug/:slug')
  async findBySlug(
    @Param('slug') slug: string,
    @Res() res: Response,
  ): Promise<Response> {
    return this.blogService.findBySlug(slug, res);
  }

  /**
   * Get blog statistics (admin)
   */
  @Get('statistics')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get blog statistics' })
  @ApiResponseDecorator({
    status: HttpStatus.OK,
    description: 'Blog statistics fetched successfully',
  })
  @ApiUnauthorizedResponse('/api/v1/blog/statistics')
  async getStatistics(@Res() res: Response): Promise<Response> {
    return this.blogService.getStatistics(res);
  }

  /**
   * Get all categories (public)
   */
  @Get('categories')
  @ApiOperation({ summary: 'Get all blog categories with post counts' })
  @ApiResponseDecorator({
    status: HttpStatus.OK,
    description: 'Categories fetched successfully',
  })
  async getCategories(@Res() res: Response): Promise<Response> {
    return this.blogService.getAllCategories(res);
  }

  /**
   * Get category by ID (public)
   */
  @Get('categories/:id')
  @ApiOperation({ summary: 'Get blog category by ID' })
  @ApiResponseDecorator({
    status: HttpStatus.OK,
    description: 'Category fetched successfully',
  })
  @ApiNotFoundResponse('Category', '/api/v1/blog/categories/:id')
  async getCategoryById(
    @Param('id') id: string,
    @Res() res: Response,
  ): Promise<Response> {
    return this.blogService.getCategoryById(id, res);
  }

  /**
   * Get all tags (public)
   */
  @Get('tags')
  @ApiOperation({ summary: 'Get all blog tags' })
  @ApiResponseDecorator({
    status: HttpStatus.OK,
    description: 'Tags fetched successfully',
  })
  async getTags(@Res() res: Response): Promise<Response> {
    return this.blogService.getTags(res);
  }

  /**
   * Create new category (admin only)
   */
  @Post('categories')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create new blog category with SEO fields' })
  @ApiResponseDecorator({
    status: HttpStatus.CREATED,
    description: 'Category created successfully',
  })
  @ApiBadRequestResponse('/api/v1/blog/categories')
  @ApiConflictResponse('Category already exists', '/api/v1/blog/categories')
  @ApiUnauthorizedResponse('/api/v1/blog/categories')
  async createCategory(
    @Body() dto: CreateBlogCategoryDto,
    @Res() res: Response,
  ): Promise<Response> {
    return this.blogService.createCategory(dto, res);
  }

  /**
   * Update category (admin only)
   */
  @Patch('categories/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update blog category' })
  @ApiResponseDecorator({
    status: HttpStatus.OK,
    description: 'Category updated successfully',
  })
  @ApiBadRequestResponse('/api/v1/blog/categories/:id')
  @ApiNotFoundResponse('Category', '/api/v1/blog/categories/:id')
  @ApiUnauthorizedResponse('/api/v1/blog/categories/:id')
  async updateCategory(
    @Param('id') id: string,
    @Body() dto: UpdateBlogCategoryDto,
    @Res() res: Response,
  ): Promise<Response> {
    return this.blogService.updateCategory(id, dto, res);
  }

  /**
   * Delete category (admin only)
   */
  @Delete('categories/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete blog category' })
  @ApiResponseDecorator({
    status: HttpStatus.OK,
    description: 'Category deleted successfully',
  })
  @ApiNotFoundResponse('Category', '/api/v1/blog/categories/:id')
  @ApiUnauthorizedResponse('/api/v1/blog/categories/:id')
  async deleteCategory(
    @Param('id') id: string,
    @Res() res: Response,
  ): Promise<Response> {
    return this.blogService.deleteCategory(id, res);
  }

  /**
   * Get blog post by ID (admin)
   */
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get blog post by ID' })
  @ApiResponseDecorator({
    status: HttpStatus.OK,
    description: 'Blog post fetched successfully',
  })
  @ApiNotFoundResponse('Blog post', '/api/v1/blog/:id')
  @ApiUnauthorizedResponse('/api/v1/blog/:id')
  async findOne(
    @Param('id') id: string,
    @Res() res: Response,
  ): Promise<Response> {
    return this.blogService.findOne(id, res);
  }

  /**
   * Update blog post (admin)
   */
  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update blog post' })
  @ApiResponseDecorator({
    status: HttpStatus.OK,
    description: 'Blog post updated successfully',
  })
  @ApiNotFoundResponse('Blog post', '/api/v1/blog/:id')
  @ApiBadRequestResponse('/api/v1/blog/:id')
  @ApiUnauthorizedResponse('/api/v1/blog/:id')
  async update(
    @Param('id') id: string,
    @Body() updateBlogPostDto: UpdateBlogPostDto,
    @Res() res: Response,
  ): Promise<Response> {
    return this.blogService.update(id, updateBlogPostDto, res);
  }

  /**
   * Delete blog post (admin)
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete blog post' })
  @ApiResponseDecorator({
    status: HttpStatus.OK,
    description: 'Blog post deleted successfully',
  })
  @ApiNotFoundResponse('Blog post', '/api/v1/blog/:id')
  @ApiUnauthorizedResponse('/api/v1/blog/:id')
  async remove(
    @Param('id') id: string,
    @Res() res: Response,
  ): Promise<Response> {
    return this.blogService.remove(id, res);
  }
}
