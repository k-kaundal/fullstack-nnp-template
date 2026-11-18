import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Response } from 'express';
import { HttpStatus } from '@nestjs/common';
import { BlogService } from './blog.service';
import { BlogPost } from './entities/blog-post.entity';
import { BlogCategory } from './entities/blog-category.entity';
import { CreateBlogPostDto } from './dto';

/**
 * Test suite for BlogService
 */
describe('BlogService', () => {
  let service: BlogService;
  let blogRepository: Repository<BlogPost>;
  let mockResponse: Partial<Response>;

  const mockBlogPost: Partial<BlogPost> = {
    id: '223e4567-e89b-12d3-a456-426614174000',
    title: 'Test Post',
    slug: 'test-post',
    content: 'Test content for blog post',
    status: 'published',
    authorId: 'author-id',
    readTime: 1,
    publishedAt: new Date(),
  };

  beforeEach(async () => {
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BlogService,
        {
          provide: getRepositoryToken(BlogPost),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            find: jest.fn(),
            findAndCount: jest.fn(),
            remove: jest.fn(),
            count: jest.fn(),
            createQueryBuilder: jest.fn(() => ({
              leftJoinAndSelect: jest.fn().mockReturnThis(),
              where: jest.fn().mockReturnThis(),
              andWhere: jest.fn().mockReturnThis(),
              orderBy: jest.fn().mockReturnThis(),
              skip: jest.fn().mockReturnThis(),
              take: jest.fn().mockReturnThis(),
              getManyAndCount: jest.fn().mockResolvedValue([[mockBlogPost], 1]),
              getOne: jest.fn().mockResolvedValue(mockBlogPost),
            })),
          },
        },
        {
          provide: getRepositoryToken(BlogCategory),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            find: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<BlogService>(BlogService);
    blogRepository = module.get<Repository<BlogPost>>(
      getRepositoryToken(BlogPost),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a blog post successfully', async () => {
      const createDto: CreateBlogPostDto = {
        title: 'Test Post',
        content: 'Test content',
        status: 'published',
      } as CreateBlogPostDto;

      jest
        .spyOn(blogRepository, 'findOne')
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null);
      jest
        .spyOn(blogRepository, 'create')
        .mockReturnValue(mockBlogPost as BlogPost);
      jest
        .spyOn(blogRepository, 'save')
        .mockResolvedValue(mockBlogPost as BlogPost);

      await service.create(createDto, 'author-id', mockResponse as Response);

      expect(blogRepository.save).toHaveBeenCalled();
    });
  });

  describe('findOne (by id)', () => {
    it('should return 404 if post not found', async () => {
      jest.spyOn(blogRepository, 'findOne').mockResolvedValue(null);

      await service.findOne('invalid-id', mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    });
  });

  describe('remove', () => {
    it('should return 404 if post not found', async () => {
      jest.spyOn(blogRepository, 'findOne').mockResolvedValue(null);

      await service.remove('invalid-id', mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    });
  });
});
