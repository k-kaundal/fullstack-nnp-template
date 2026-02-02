import { Injectable, Logger, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, In } from 'typeorm';
import { Response } from 'express';
import { BlogPost } from './entities/blog-post.entity';
import { BlogCategory } from './entities/blog-category.entity';
import {
  CreateBlogPostDto,
  UpdateBlogPostDto,
  CreateBlogCategoryDto,
  UpdateBlogCategoryDto,
} from './dto';
import { ApiResponse } from '../common/utils/api-response.util';

/**
 * Service for managing blog posts and categories
 * Handles CRUD operations, slug generation, and publishing
 */
@Injectable()
export class BlogService {
  private readonly logger = new Logger(BlogService.name);

  constructor(
    @InjectRepository(BlogPost)
    private readonly blogRepository: Repository<BlogPost>,
    @InjectRepository(BlogCategory)
    private readonly categoryRepository: Repository<BlogCategory>,
  ) {}

  /**
   * Create a new blog post
   * Automatically generates slug from title
   */
  async create(
    createBlogPostDto: CreateBlogPostDto,
    authorId: string,
    res: Response,
  ): Promise<Response> {
    try {
      this.logger.log(`Creating blog post: ${createBlogPostDto.title}`);

      // Generate slug from title
      const slug = await this.generateUniqueSlug(createBlogPostDto.title);

      // Calculate read time (average 200 words per minute)
      const wordCount = createBlogPostDto.content
        .replace(/<[^>]*>/g, '')
        .split(/\s+/).length;
      const readTime = Math.ceil(wordCount / 200);

      // Create blog post
      const blogPost = this.blogRepository.create({
        ...createBlogPostDto,
        slug,
        authorId,
        readTime,
        publishedAt:
          createBlogPostDto.status === 'published' ? new Date() : null,
      });

      const saved = await this.blogRepository.save(blogPost);

      this.logger.log(`Blog post created successfully: ${saved.id}`);

      return ApiResponse.success(res, {
        statusCode: HttpStatus.CREATED,
        data: saved,
        message: 'Blog post created successfully',
        meta: {
          blog_post_id: saved.id,
          slug: saved.slug,
          created_at: saved.createdAt,
        },
      });
    } catch (error) {
      this.logger.error(
        `Failed to create blog post: ${error.message}`,
        error.stack,
      );
      return ApiResponse.error(res, {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Failed to create blog post',
      });
    }
  }

  /**
   * Get all blog posts with pagination, filtering, and search
   */
  async findAll(
    page: number = 1,
    limit: number = 10,
    status?: string,
    category?: string,
    search?: string,
    tags?: string[],
    res?: Response,
  ): Promise<Response> {
    try {
      this.logger.log(`Fetching blog posts - page: ${page}, limit: ${limit}`);

      const skip = (page - 1) * limit;
      const where: Record<string, unknown> = {};

      // Apply filters
      if (status) {
        where.status = status;
      }

      if (category) {
        where.category = category;
      }

      if (search) {
        where.title = Like(`%${search}%`);
      }

      if (tags && tags.length > 0) {
        // This is a simplified approach; for proper tag filtering, you'd need a join table
        where.tags = In(tags);
      }

      const [posts, total] = await this.blogRepository.findAndCount({
        where,
        skip,
        take: limit,
        order: {
          createdAt: 'DESC',
        },
        relations: ['author'],
      });

      const totalPages = Math.ceil(total / limit);

      return ApiResponse.success(res, {
        statusCode: HttpStatus.OK,
        data: posts,
        message: 'Blog posts fetched successfully',
        meta: {
          total,
          count: posts.length,
          page,
          limit,
          total_pages: totalPages,
          has_next: page < totalPages,
          has_previous: page > 1,
        },
      });
    } catch (error) {
      this.logger.error(
        `Failed to fetch blog posts: ${error.message}`,
        error.stack,
      );
      return ApiResponse.error(res, {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Failed to fetch blog posts',
      });
    }
  }

  /**
   * Get published blog posts (public endpoint)
   */
  async findPublished(
    page: number = 1,
    limit: number = 10,
    category?: string,
    search?: string,
    tags?: string[],
    res?: Response,
  ): Promise<Response> {
    return this.findAll(page, limit, 'published', category, search, tags, res);
  }

  /**
   * Get single blog post by ID
   */
  async findOne(id: string, res: Response): Promise<Response> {
    try {
      this.logger.log(`Fetching blog post: ${id}`);

      const post = await this.blogRepository.findOne({
        where: { id },
        relations: ['author'],
      });

      if (!post) {
        return ApiResponse.error(res, {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Blog post not found',
        });
      }

      return ApiResponse.success(res, {
        statusCode: HttpStatus.OK,
        data: post,
        message: 'Blog post fetched successfully',
      });
    } catch (error) {
      this.logger.error(
        `Failed to fetch blog post: ${error.message}`,
        error.stack,
      );
      return ApiResponse.error(res, {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Failed to fetch blog post',
      });
    }
  }

  /**
   * Get blog post by slug (public endpoint)
   */
  async findBySlug(slug: string, res: Response): Promise<Response> {
    try {
      this.logger.log(`Fetching blog post by slug: ${slug}`);

      const post = await this.blogRepository.findOne({
        where: { slug, status: 'published' },
        relations: ['author'],
      });

      if (!post) {
        return ApiResponse.error(res, {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Blog post not found',
        });
      }

      // Increment view count
      post.viewCount += 1;
      await this.blogRepository.save(post);

      return ApiResponse.success(res, {
        statusCode: HttpStatus.OK,
        data: post,
        message: 'Blog post fetched successfully',
      });
    } catch (error) {
      this.logger.error(
        `Failed to fetch blog post by slug: ${error.message}`,
        error.stack,
      );
      return ApiResponse.error(res, {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Failed to fetch blog post',
      });
    }
  }

  /**
   * Update blog post
   */
  async update(
    id: string,
    updateBlogPostDto: UpdateBlogPostDto,
    res: Response,
  ): Promise<Response> {
    try {
      this.logger.log(`Updating blog post: ${id}`);

      const post = await this.blogRepository.findOne({ where: { id } });

      if (!post) {
        return ApiResponse.error(res, {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Blog post not found',
        });
      }

      // Update slug if title changed
      if (updateBlogPostDto.title && updateBlogPostDto.title !== post.title) {
        updateBlogPostDto['slug'] = await this.generateUniqueSlug(
          updateBlogPostDto.title,
          id,
        );
      }

      // Recalculate read time if content changed
      if (updateBlogPostDto.content) {
        const wordCount = updateBlogPostDto.content
          .replace(/<[^>]*>/g, '')
          .split(/\s+/).length;
        updateBlogPostDto['readTime'] = Math.ceil(wordCount / 200);
      }

      // Set published date when status changes to published
      if (
        updateBlogPostDto.status === 'published' &&
        post.status !== 'published'
      ) {
        updateBlogPostDto['publishedAt'] = new Date();
      }

      Object.assign(post, updateBlogPostDto);
      const updated = await this.blogRepository.save(post);

      this.logger.log(`Blog post updated successfully: ${id}`);

      return ApiResponse.success(res, {
        statusCode: HttpStatus.OK,
        data: updated,
        message: 'Blog post updated successfully',
        meta: {
          blog_post_id: updated.id,
          updated_at: updated.updatedAt,
        },
      });
    } catch (error) {
      this.logger.error(
        `Failed to update blog post: ${error.message}`,
        error.stack,
      );
      return ApiResponse.error(res, {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Failed to update blog post',
      });
    }
  }

  /**
   * Delete blog post (soft delete by archiving)
   */
  async remove(id: string, res: Response): Promise<Response> {
    try {
      this.logger.log(`Deleting blog post: ${id}`);

      const post = await this.blogRepository.findOne({ where: { id } });

      if (!post) {
        return ApiResponse.error(res, {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Blog post not found',
        });
      }

      // Soft delete by setting status to archived
      post.status = 'archived';
      await this.blogRepository.save(post);

      this.logger.log(`Blog post deleted successfully: ${id}`);

      return ApiResponse.success(res, {
        statusCode: HttpStatus.OK,
        data: { id },
        message: 'Blog post deleted successfully',
      });
    } catch (error) {
      this.logger.error(
        `Failed to delete blog post: ${error.message}`,
        error.stack,
      );
      return ApiResponse.error(res, {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Failed to delete blog post',
      });
    }
  }

  /**
   * Get blog statistics
   */
  async getStatistics(res: Response): Promise<Response> {
    try {
      const [total, published, drafts, archived] = await Promise.all([
        this.blogRepository.count(),
        this.blogRepository.count({ where: { status: 'published' } }),
        this.blogRepository.count({ where: { status: 'draft' } }),
        this.blogRepository.count({ where: { status: 'archived' } }),
      ]);

      const totalViews = await this.blogRepository
        .createQueryBuilder('post')
        .select('SUM(post.viewCount)', 'sum')
        .getRawOne()
        .then((result) => parseInt(result.sum) || 0);

      return ApiResponse.success(res, {
        statusCode: HttpStatus.OK,
        data: {
          total,
          published,
          drafts,
          archived,
          totalViews,
        },
        message: 'Blog statistics fetched successfully',
      });
    } catch (error) {
      this.logger.error(
        `Failed to fetch blog statistics: ${error.message}`,
        error.stack,
      );
      return ApiResponse.error(res, {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Failed to fetch blog statistics',
      });
    }
  }

  /**
   * Get all categories
   */
  async getCategories(res: Response): Promise<Response> {
    try {
      const categories = await this.blogRepository
        .createQueryBuilder('post')
        .select('DISTINCT post.category', 'category')
        .where('post.category IS NOT NULL')
        .andWhere('post.status = :status', { status: 'published' })
        .getRawMany();

      return ApiResponse.success(res, {
        statusCode: HttpStatus.OK,
        data: categories.map((c) => c.category),
        message: 'Categories fetched successfully',
      });
    } catch (error) {
      this.logger.error(
        `Failed to fetch categories: ${error.message}`,
        error.stack,
      );
      return ApiResponse.error(res, {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Failed to fetch categories',
      });
    }
  }

  /**
   * Get all tags
   */
  async getTags(res: Response): Promise<Response> {
    try {
      const posts = await this.blogRepository.find({
        where: { status: 'published' },
        select: ['tags'],
      });

      const tags = [...new Set(posts.flatMap((post) => post.tags || []))];

      return ApiResponse.success(res, {
        statusCode: HttpStatus.OK,
        data: tags,
        message: 'Tags fetched successfully',
      });
    } catch (error) {
      this.logger.error(`Failed to fetch tags: ${error.message}`, error.stack);
      return ApiResponse.error(res, {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Failed to fetch tags',
      });
    }
  }

  /**
   * Create new category with full SEO fields
   */
  async createCategory(
    dto: CreateBlogCategoryDto,
    res: Response,
  ): Promise<Response> {
    try {
      this.logger.log(`Creating category: ${dto.name}`);

      // Check if category already exists
      const existing = await this.categoryRepository.findOne({
        where: { name: dto.name.trim() },
      });

      if (existing) {
        return ApiResponse.error(res, {
          statusCode: HttpStatus.CONFLICT,
          message: 'Category already exists',
        });
      }

      // Generate slug
      const slug = await this.generateUniqueCategorySlug(dto.name);

      const category = this.categoryRepository.create({
        ...dto,
        name: dto.name.trim(),
        slug,
      });

      const saved = (await this.categoryRepository.save(
        category,
      )) as BlogCategory;

      this.logger.log(`Category created: ${saved.id}`);

      return ApiResponse.success(res, {
        statusCode: HttpStatus.CREATED,
        data: saved,
        message: 'Category created successfully',
        meta: {
          category_id: saved.id,
          created_at: saved.createdAt,
        },
      });
    } catch (error) {
      this.logger.error(
        `Failed to create category: ${error.message}`,
        error.stack,
      );
      return ApiResponse.error(res, {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Failed to create category',
      });
    }
  }

  /**
   * Get all categories with post counts
   */
  async getAllCategories(res: Response): Promise<Response> {
    try {
      const categories = await this.categoryRepository.find({
        order: { name: 'ASC' },
      });

      // Update post counts
      for (const category of categories) {
        const count = await this.blogRepository.count({
          where: { category: category.name },
        });
        category.postCount = count;
      }

      await this.categoryRepository.save(categories);

      return ApiResponse.success(res, {
        statusCode: HttpStatus.OK,
        data: categories,
        message: 'Categories fetched successfully',
        meta: {
          total: categories.length,
        },
      });
    } catch (error) {
      this.logger.error(
        `Failed to fetch categories: ${error.message}`,
        error.stack,
      );
      return ApiResponse.error(res, {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Failed to fetch categories',
      });
    }
  }

  /**
   * Get category by ID
   */
  async getCategoryById(id: string, res: Response): Promise<Response> {
    try {
      const category = await this.categoryRepository.findOne({ where: { id } });

      if (!category) {
        return ApiResponse.error(res, {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Category not found',
        });
      }

      // Update post count
      const postCount = await this.blogRepository.count({
        where: { category: category.name },
      });
      category.postCount = postCount;
      await this.categoryRepository.save(category);

      return ApiResponse.success(res, {
        statusCode: HttpStatus.OK,
        data: category,
        message: 'Category fetched successfully',
      });
    } catch (error) {
      this.logger.error(
        `Failed to fetch category: ${error.message}`,
        error.stack,
      );
      return ApiResponse.error(res, {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Failed to fetch category',
      });
    }
  }

  /**
   * Update category
   */
  async updateCategory(
    id: string,
    dto: UpdateBlogCategoryDto,
    res: Response,
  ): Promise<Response> {
    try {
      const category = await this.categoryRepository.findOne({ where: { id } });

      if (!category) {
        return ApiResponse.error(res, {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Category not found',
        });
      }

      const oldName = category.name;

      // If name changed, check for duplicates and update slug
      if (dto.name && dto.name.trim() !== oldName) {
        const existing = await this.categoryRepository.findOne({
          where: { name: dto.name.trim() },
        });

        if (existing && existing.id !== id) {
          return ApiResponse.error(res, {
            statusCode: HttpStatus.CONFLICT,
            message: 'Category name already exists',
          });
        }

        const newSlug = await this.generateUniqueCategorySlug(dto.name, id);

        // Update all blog posts with this category
        await this.blogRepository.update(
          { category: oldName },
          { category: dto.name.trim() },
        );

        // Assign updates including slug
        Object.assign(category, dto, { slug: newSlug });
      } else {
        // No name change, just update other fields
        Object.assign(category, dto);
      }

      const updated = await this.categoryRepository.save(category);

      this.logger.log(`Category updated: ${updated.id}`);

      return ApiResponse.success(res, {
        statusCode: HttpStatus.OK,
        data: updated,
        message: 'Category updated successfully',
        meta: {
          category_id: updated.id,
          updated_at: updated.updatedAt,
        },
      });
    } catch (error) {
      this.logger.error(
        `Failed to update category: ${error.message}`,
        error.stack,
      );
      return ApiResponse.error(res, {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Failed to update category',
      });
    }
  }

  /**
   * Delete category
   */
  async deleteCategory(id: string, res: Response): Promise<Response> {
    try {
      const category = await this.categoryRepository.findOne({ where: { id } });

      if (!category) {
        return ApiResponse.error(res, {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Category not found',
        });
      }

      // Clear category from all posts
      await this.blogRepository.update(
        { category: category.name },
        { category: '' },
      );

      await this.categoryRepository.remove(category);

      this.logger.log(`Category deleted: ${id}`);

      return ApiResponse.success(res, {
        statusCode: HttpStatus.OK,
        data: { id },
        message: 'Category deleted successfully',
        meta: {
          deleted_at: new Date(),
        },
      });
    } catch (error) {
      this.logger.error(
        `Failed to delete category: ${error.message}`,
        error.stack,
      );
      return ApiResponse.error(res, {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Failed to delete category',
      });
    }
  }

  /**
   * Generate unique slug for category
   */
  private async generateUniqueCategorySlug(
    name: string,
    excludeId?: string,
  ): Promise<string> {
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    let count = 1;
    let uniqueSlug = slug;

    while (true) {
      const existing = await this.categoryRepository.findOne({
        where: { slug: uniqueSlug },
      });

      if (!existing || (excludeId && existing.id === excludeId)) {
        break;
      }

      uniqueSlug = `${slug}-${count}`;
      count++;
    }

    return uniqueSlug;
  }

  /**
   * Generate unique slug from title
   */
  private async generateUniqueSlug(
    title: string,
    excludeId?: string,
  ): Promise<string> {
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    let count = 1;
    let uniqueSlug = slug;

    while (true) {
      const whereClause: Record<string, unknown> = { slug: uniqueSlug };
      if (excludeId) {
        // Use Not operator from typeorm
        whereClause.id = { $ne: excludeId } as unknown;
      }

      const existing = await this.blogRepository.findOne({
        where: { slug: uniqueSlug },
      });

      if (!existing || (excludeId && existing.id === excludeId)) {
        break;
      }

      uniqueSlug = `${slug}-${count}`;
      count++;
    }

    return uniqueSlug;
  }
}
