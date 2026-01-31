import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, CallHandler } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Reflector } from '@nestjs/core';
import { of } from 'rxjs';
import { HttpCacheInterceptor } from './cache.interceptor';

/**
 * Test suite for HttpCacheInterceptor
 * Tests caching logic and cache key generation
 */
describe('HttpCacheInterceptor', () => {
  let interceptor: HttpCacheInterceptor;
  let cacheManager: any;
  let reflector: Reflector;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HttpCacheInterceptor,
        {
          provide: CACHE_MANAGER,
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
          },
        },
        {
          provide: Reflector,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    interceptor = module.get<HttpCacheInterceptor>(HttpCacheInterceptor);
    cacheManager = module.get(CACHE_MANAGER);
    reflector = module.get<Reflector>(Reflector);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  describe('intercept', () => {
    it('should return cached data if available', async () => {
      const cachedData = { id: '1', name: 'Test User' };
      const mockExecutionContext = createMockExecutionContext();
      const mockCallHandler = createMockCallHandler();

      jest.spyOn(reflector, 'get').mockReturnValue('user');
      jest.spyOn(cacheManager, 'get').mockResolvedValue(cachedData);

      const result = await interceptor.intercept(
        mockExecutionContext,
        mockCallHandler,
      );

      result.subscribe((data) => {
        expect(data).toEqual(cachedData);
      });

      expect(cacheManager.get).toHaveBeenCalled();
      expect(mockCallHandler.handle).not.toHaveBeenCalled();
    });

    it('should fetch and cache data if not in cache', async () => {
      const freshData = { id: '1', name: 'New User' };
      const mockExecutionContext = createMockExecutionContext();
      const mockCallHandler = createMockCallHandler(freshData);

      jest.spyOn(reflector, 'get').mockReturnValue('user');
      jest.spyOn(cacheManager, 'get').mockResolvedValue(null);

      const result = await interceptor.intercept(
        mockExecutionContext,
        mockCallHandler,
      );

      result.subscribe((data) => {
        expect(data).toEqual(freshData);
      });

      expect(cacheManager.get).toHaveBeenCalled();
      expect(mockCallHandler.handle).toHaveBeenCalled();

      // Wait for tap to complete
      await new Promise((resolve) => setTimeout(resolve, 10));
      expect(cacheManager.set).toHaveBeenCalledWith(
        expect.any(String),
        freshData,
      );
    });

    it('should generate correct cache key', async () => {
      const mockExecutionContext = createMockExecutionContext();
      const mockCallHandler = createMockCallHandler();

      jest.spyOn(reflector, 'get').mockReturnValue('user');
      jest.spyOn(cacheManager, 'get').mockResolvedValue(null);

      await interceptor.intercept(mockExecutionContext, mockCallHandler);

      expect(cacheManager.get).toHaveBeenCalledWith(
        expect.stringContaining('user_/test_'),
      );
    });
  });
});

/**
 * Creates a mock ExecutionContext for testing
 */
function createMockExecutionContext(): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => ({
        url: '/test',
        params: { id: '1' },
        query: { filter: 'active' },
      }),
    }),
    getHandler: () => ({}),
  } as unknown as ExecutionContext;
}

/**
 * Creates a mock CallHandler for testing
 */
function createMockCallHandler(data?: unknown): CallHandler {
  return {
    handle: jest.fn().mockReturnValue(of(data)),
  } as unknown as CallHandler;
}
