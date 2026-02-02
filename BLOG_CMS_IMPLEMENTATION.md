# Blog CMS Implementation Guide

## Overview

A comprehensive blog post management system with a professional rich text editor
(TipTap), advanced features, and SEO optimization.

## 🚀 Features

### Backend Features

- ✅ Full CRUD operations for blog posts
- ✅ Automatic slug generation from title
- ✅ Auto-calculated read time (200 words/minute)
- ✅ Multiple post statuses (draft, published, archived)
- ✅ Categories and tags support
- ✅ SEO meta fields (description, keywords)
- ✅ View count tracking
- ✅ Automatic excerpt generation
- ✅ Author association (User entity)
- ✅ Advanced filtering (status, category, search, tags)
- ✅ Pagination support
- ✅ Blog statistics endpoint
- ✅ Slug uniqueness validation
- ✅ Published date tracking

### Frontend Features

- ✅ **Professional TipTap rich text editor** with toolbar
- ✅ Admin blog management dashboard
- ✅ Blog post list with filtering and search
- ✅ Create/Edit blog posts with live preview
- ✅ Statistics cards (total, published, drafts, views)
- ✅ Category and tag management
- ✅ Featured image support
- ✅ SEO metadata fields
- ✅ Draft/Published toggle
- ✅ Dark mode support
- ✅ Responsive design

### TipTap Editor Features

- **Text Formatting**: Bold, Italic, Underline, Strikethrough
- **Headings**: H1, H2, H3
- **Lists**: Bullet lists, Numbered lists
- **Code**: Inline code, Code blocks with syntax highlighting
- **Alignment**: Left, Center, Right
- **Links**: Add/remove links
- **Images**: Insert images by URL
- **Blockquotes**: Quote formatting
- **Highlight**: Text highlighting
- **Clear Formatting**: Remove all formatting

## 📁 File Structure

### Backend (`server/src/blog/`)

```
blog/
├── dto/
│   ├── create-blog-post.dto.ts     # Create blog post validation
│   ├── update-blog-post.dto.ts     # Update blog post validation
│   └── index.ts                     # Barrel export
├── entities/
│   └── blog-post.entity.ts         # Blog post database entity
├── blog.controller.ts               # REST API endpoints
├── blog.service.ts                  # Business logic
└── blog.module.ts                   # Module configuration
```

### Frontend (`client/`)

```
app/admin/blog/
├── page.tsx                         # Blog post list (admin)
├── create/
│   └── page.tsx                     # Create new blog post
└── [id]/
    └── edit/
        └── page.tsx                 # Edit existing blog post

components/ui/
└── RichTextEditor.tsx               # TipTap rich text editor

interfaces/
└── blog.interface.ts                # TypeScript interfaces

lib/api/
└── blog.service.ts                  # API client service
```

## 🗄️ Database Schema

### Blog Posts Table

```sql
CREATE TABLE "blog_posts" (
  "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  "slug" varchar UNIQUE NOT NULL,
  "title" varchar(200) NOT NULL,
  "content" text NOT NULL,
  "excerpt" text,
  "featuredImage" varchar,
  "status" varchar DEFAULT 'draft',
  "publishedAt" timestamp,
  "metaDescription" varchar,
  "metaKeywords" varchar,
  "tags" text[],
  "category" varchar,
  "viewCount" int DEFAULT 0,
  "readTime" int DEFAULT 0,
  "author_id" uuid NOT NULL,
  "createdAt" timestamp DEFAULT now(),
  "updatedAt" timestamp DEFAULT now(),
  FOREIGN KEY ("author_id") REFERENCES "users"("id")
);

-- Indexes
CREATE INDEX idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX idx_blog_posts_status ON blog_posts(status);
CREATE INDEX idx_blog_posts_view_count ON blog_posts(viewCount);
```

## 🔌 API Endpoints

### Admin Endpoints (Protected)

```
POST   /api/v1/blog                    # Create blog post
GET    /api/v1/blog/admin              # Get all posts (admin)
GET    /api/v1/blog/statistics         # Get blog statistics
GET    /api/v1/blog/:id                # Get post by ID
PATCH  /api/v1/blog/:id                # Update post
DELETE /api/v1/blog/:id                # Delete post (soft delete)
```

### Public Endpoints

```
GET    /api/v1/blog/published          # Get published posts
GET    /api/v1/blog/slug/:slug         # Get post by slug
GET    /api/v1/blog/categories         # Get all categories
GET    /api/v1/blog/tags               # Get all tags
```

## 📊 API Response Examples

### Create Blog Post

```typescript
POST /api/v1/blog
Body: {
  "title": "How to Build Modern Web Apps",
  "content": "<h1>Introduction</h1><p>Content here...</p>",
  "excerpt": "Learn modern web development",
  "status": "draft",
  "category": "Web Development",
  "tags": ["react", "nodejs", "tutorial"],
  "metaDescription": "Complete guide to modern web development",
  "metaKeywords": "web, development, react, nodejs"
}

Response: {
  "status": "success",
  "statusCode": 201,
  "message": "Blog post created successfully",
  "data": {
    "id": "uuid",
    "slug": "how-to-build-modern-web-apps",
    "title": "How to Build Modern Web Apps",
    "readTime": 5,
    "viewCount": 0,
    "status": "draft",
    "createdAt": "2026-02-02T10:00:00.000Z"
  },
  "meta": {
    "blog_post_id": "uuid",
    "slug": "how-to-build-modern-web-apps",
    "created_at": "2026-02-02T10:00:00.000Z"
  }
}
```

### Get All Posts (Admin)

```typescript
GET /api/v1/blog/admin?page=1&limit=10&status=published&category=Tech&search=react

Response: {
  "status": "success",
  "statusCode": 200,
  "message": "Blog posts fetched successfully",
  "data": [
    {
      "id": "uuid",
      "slug": "post-slug",
      "title": "Post Title",
      "excerpt": "Short summary",
      "status": "published",
      "category": "Tech",
      "tags": ["react", "tutorial"],
      "viewCount": 150,
      "readTime": 5,
      "author": {
        "id": "uuid",
        "email": "author@example.com",
        "firstName": "John",
        "lastName": "Doe"
      },
      "publishedAt": "2026-02-01T10:00:00.000Z",
      "createdAt": "2026-01-31T10:00:00.000Z"
    }
  ],
  "meta": {
    "total": 45,
    "count": 10,
    "page": 1,
    "limit": 10,
    "total_pages": 5,
    "has_next": true,
    "has_previous": false
  }
}
```

### Get Blog Statistics

```typescript
GET /api/v1/blog/statistics

Response: {
  "status": "success",
  "statusCode": 200,
  "data": {
    "total": 45,
    "published": 30,
    "drafts": 12,
    "archived": 3,
    "totalViews": 5420
  }
}
```

## 🎨 Frontend Usage

### Admin Blog Management

```typescript
// Navigate to admin blog pages
/admin/blog                  # List all posts
/admin/blog/create          # Create new post
/admin/blog/:id/edit        # Edit existing post
```

### Rich Text Editor Usage

```typescript
import dynamic from 'next/dynamic';

const RichTextEditor = dynamic(() => import('@/components/ui/RichTextEditor'), {
  ssr: false,
  loading: () => <LoadingSpinner />,
});

function BlogEditor() {
  const [content, setContent] = useState('');

  return (
    <RichTextEditor
      content={content}
      onChange={setContent}
      placeholder="Start writing your blog post..."
    />
  );
}
```

### Blog API Service

```typescript
import { blogService } from '@/lib/api';
import { isSuccessResponse } from '@/lib/utils';
import { toast } from '@/lib/utils';

// Create blog post
const response = await blogService.create({
  title: 'My Blog Post',
  content: '<p>Content</p>',
  status: 'draft',
});

if (isSuccessResponse(response)) {
  toast.success('Blog post created!');
} else {
  toast.error(response.message);
}

// Get all posts
const posts = await blogService.getAll(page, limit, status, category, search);

// Get published posts (public)
const published = await blogService.getPublished(page, limit);

// Get by slug
const post = await blogService.getBySlug('my-post-slug');
```

## 🎯 Key Features Explained

### 1. Automatic Slug Generation

- Converts title to URL-friendly slug
- Ensures uniqueness by appending numbers if needed
- Updates automatically when title changes

### 2. Read Time Calculation

- Automatically calculated based on content word count
- Uses industry standard: 200 words per minute
- Strips HTML tags for accurate word count

### 3. Soft Delete (Archive)

- Posts are never permanently deleted
- Status changes to "archived" instead
- Can be restored by changing status back

### 4. View Count Tracking

- Automatically increments when post is viewed
- Only for published posts via slug endpoint
- Tracked per request (not per unique visitor)

### 5. SEO Optimization

- Meta description (160 char limit)
- Meta keywords
- Automatic slug generation
- Excerpt for previews
- Structured data ready

## 🔐 Security & Validation

### Backend Validation

- **Title**: 5-200 characters, required
- **Content**: Minimum 10 characters, required
- **Excerpt**: Maximum 500 characters
- **Status**: Must be 'draft', 'published', or 'archived'
- **Meta Description**: Maximum 160 characters
- **Slug**: Automatically validated for uniqueness

### Authentication

- All admin endpoints require JWT authentication
- Public endpoints (published posts, slug, categories, tags) are open
- Author automatically associated with authenticated user

## 📝 Best Practices

### Creating Blog Posts

1. Start with a clear, descriptive title
2. Write engaging content with proper formatting
3. Add an excerpt for previews (max 500 chars)
4. Use categories to organize posts
5. Add relevant tags for discoverability
6. Fill SEO fields (meta description, keywords)
7. Add featured image for social sharing
8. Save as draft first, review, then publish

### Content Editor

1. Use headings (H1-H3) for structure
2. Format text with bold, italic, underline
3. Add code blocks for technical content
4. Use blockquotes for emphasis
5. Insert images to break up text
6. Add links to external resources
7. Use lists for easy scanning
8. Preview before publishing

## 🚀 Getting Started

### 1. Database Migration

```bash
cd server
./src/scripts/generate-migration.sh AddBlogPostEntity
yarn migration:run
```

### 2. Install Dependencies

Already installed:

- `@tiptap/react`
- `@tiptap/starter-kit`
- `@tiptap/extension-link`
- `@tiptap/extension-image`
- `@tiptap/extension-underline`
- `@tiptap/extension-text-align`
- `@tiptap/extension-highlight`
- `@tiptap/extension-code-block-lowlight`
- `lowlight`

### 3. Access Admin Panel

```
http://localhost:3000/admin/blog
```

## 🎨 Customization

### Editor Toolbar

Customize toolbar in `RichTextEditor.tsx`:

```typescript
// Add custom buttons
<button
  onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
>
  H4
</button>
```

### Editor Extensions

Add more TipTap extensions:

```typescript
import Table from '@tiptap/extension-table';
import Youtube from '@tiptap/extension-youtube';

const editor = useEditor({
  extensions: [
    StarterKit,
    Table,
    Youtube,
    // ... other extensions
  ],
});
```

### Styling

Customize editor styles in `globals.css`:

```css
.ProseMirror {
  /* Your custom styles */
}
```

## 🐛 Troubleshooting

### Editor Not Loading

- Ensure dynamic import with `ssr: false`
- Check that all TipTap packages are installed
- Verify `globals.css` includes TipTap styles

### Slug Conflicts

- Slugs are automatically made unique
- Check database for existing slugs
- Service appends numbers to duplicates

### Images Not Displaying

- Verify image URL is accessible
- Check CORS settings if external images
- Consider using cloud storage (S3, Cloudinary)

## 📚 Additional Resources

- [TipTap Documentation](https://tiptap.dev/docs)
- [TypeORM Documentation](https://typeorm.io/)
- [Next.js Documentation](https://nextjs.org/docs)
- [NestJS Documentation](https://docs.nestjs.com/)

## ✅ Next Steps

1. ✅ Blog CMS implemented with TipTap editor
2. 🔄 Optional: Add image upload functionality
3. 🔄 Optional: Add blog post comments system
4. 🔄 Optional: Add post scheduling (publish at specific time)
5. 🔄 Optional: Add public blog pages for reading
6. 🔄 Optional: Add RSS feed generation
7. 🔄 Optional: Add social sharing buttons

## 🎉 Summary

You now have a fully functional blog CMS with:

- Professional rich text editor (TipTap)
- Complete CRUD operations
- Admin dashboard with statistics
- SEO optimization
- Categories and tags
- Dark mode support
- Responsive design
- Production-ready backend API
- Type-safe frontend with TypeScript

Happy blogging! 🚀
