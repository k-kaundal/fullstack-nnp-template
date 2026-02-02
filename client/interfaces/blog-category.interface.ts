/**
 * Blog category interface with SEO fields
 */
export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  metaDescription?: string;
  metaKeywords?: string;
  postCount: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * DTO for creating blog category
 */
export interface CreateBlogCategoryDto {
  name: string;
  description?: string;
  image?: string;
  metaDescription?: string;
  metaKeywords?: string;
}

/**
 * DTO for updating blog category
 */
export interface UpdateBlogCategoryDto {
  name?: string;
  description?: string;
  image?: string;
  metaDescription?: string;
  metaKeywords?: string;
}
