/**
 * Blog post interface
 */
export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  content: string;
  excerpt?: string;
  featuredImage?: string;
  status: 'draft' | 'published' | 'archived';
  publishedAt?: Date;
  metaDescription?: string;
  metaKeywords?: string;
  tags?: string[];
  category?: string;
  viewCount: number;
  readTime: number;
  author: {
    id: string;
    email: string;
    firstName: string;
    lastName?: string;
  };
  authorId: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Create blog post DTO
 */
export interface CreateBlogPostDto {
  title: string;
  content: string;
  excerpt?: string;
  featuredImage?: string;
  status?: 'draft' | 'published' | 'archived';
  metaDescription?: string;
  metaKeywords?: string;
  tags?: string[];
  category?: string;
}

/**
 * Update blog post DTO
 * Allows partial updates to blog posts
 */
export interface UpdateBlogPostDto {
  title?: string;
  content?: string;
  excerpt?: string;
  featuredImage?: string;
  status?: string;
  metaDescription?: string;
  metaKeywords?: string;
  tags?: string[];
  category?: string;
}

/**
 * Blog statistics
 */
export interface BlogStatistics {
  total: number;
  published: number;
  drafts: number;
  archived: number;
  totalViews: number;
}
