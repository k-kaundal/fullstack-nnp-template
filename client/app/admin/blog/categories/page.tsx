'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { blogService } from '@/lib/api';
import { BlogCategory, CreateBlogCategoryDto } from '@/interfaces';
import { isSuccessResponse, toast } from '@/lib/utils';
import { LoadingSpinner, Confirm, Modal } from '@/components/ui';

/**
 * Category management page with SEO fields
 * Professional admin interface for managing blog categories
 */
export default function CategoriesPage() {
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<BlogCategory | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState<CreateBlogCategoryDto>({
    name: '',
    description: '',
    image: '',
    metaDescription: '',
    metaKeywords: '',
  });

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    setLoading(true);
    const response = await blogService.getAllCategories();
    if (isSuccessResponse<BlogCategory[]>(response)) {
      setCategories(response.data);
    } else {
      toast.error(response.message);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Open modal for creating
  const handleOpenCreate = () => {
    setFormData({
      name: '',
      description: '',
      image: '',
      metaDescription: '',
      metaKeywords: '',
    });
    setEditingCategory(null);
    setShowModal(true);
  };

  // Open modal for editing
  const handleOpenEdit = (category: BlogCategory) => {
    setFormData({
      name: category.name,
      description: category.description || '',
      image: category.image || '',
      metaDescription: category.metaDescription || '',
      metaKeywords: category.metaKeywords || '',
    });
    setEditingCategory(category);
    setShowModal(true);
  };

  // Submit form (create or update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Category name is required');
      return;
    }

    if (editingCategory) {
      // Update
      const response = await blogService.updateCategory(editingCategory.id, formData);
      if (isSuccessResponse<BlogCategory>(response)) {
        toast.success('Category updated successfully');
        fetchCategories();
        setShowModal(false);
      } else {
        toast.error(response.message);
      }
    } else {
      // Create
      const response = await blogService.createCategory(formData);
      if (isSuccessResponse<BlogCategory>(response)) {
        toast.success('Category created successfully');
        fetchCategories();
        setShowModal(false);
      } else {
        toast.error(response.message);
      }
    }
  };

  // Delete category
  const handleDelete = async (id: string) => {
    const response = await blogService.deleteCategory(id);
    if (isSuccessResponse(response)) {
      toast.success('Category deleted successfully');
      fetchCategories();
      setDeleteConfirm(null);
    } else {
      toast.error(response.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Blog Categories</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage blog categories with SEO optimization
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
        >
          + Add Category
        </button>
      </div>

      {/* Categories Grid */}
      {categories.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📁</div>
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
            No Categories Yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Create your first blog category to get started
          </p>
          <button
            onClick={handleOpenCreate}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            + Add Category
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <div
              key={category.id}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow"
            >
              {/* Category Image */}
              {category.image ? (
                <div className="h-48 bg-gray-200 dark:bg-gray-700 overflow-hidden relative">
                  <Image src={category.image} alt={category.name} fill className="object-cover" />
                </div>
              ) : (
                <div className="h-48 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <span className="text-6xl">📁</span>
                </div>
              )}

              {/* Category Content */}
              <div className="p-6 space-y-4">
                {/* Name & Post Count */}
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      {category.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {category.postCount} post{category.postCount !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-medium rounded">
                    {category.slug}
                  </span>
                </div>

                {/* Description */}
                {category.description && (
                  <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-3">
                    {category.description}
                  </p>
                )}

                {/* SEO Info */}
                <div className="space-y-2 text-xs text-gray-500 dark:text-gray-400">
                  {category.metaDescription && (
                    <div className="flex items-start gap-2">
                      <span className="font-semibold">Meta:</span>
                      <span className="line-clamp-2">{category.metaDescription}</span>
                    </div>
                  )}
                  {category.metaKeywords && (
                    <div className="flex items-start gap-2">
                      <span className="font-semibold">Keywords:</span>
                      <span className="line-clamp-1">{category.metaKeywords}</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => handleOpenEdit(category)}
                    className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(category.id)}
                    className="flex-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingCategory ? 'Edit Category' : 'Create Category'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Category Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Technology, Lifestyle, etc."
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description of this category..."
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Image URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Image URL
            </label>
            <input
              type="url"
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              placeholder="https://example.com/image.jpg"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* SEO Section */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              SEO Optimization
            </h4>

            {/* Meta Description */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Meta Description
              </label>
              <textarea
                value={formData.metaDescription}
                onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                placeholder="SEO-friendly description (max 160 characters)"
                maxLength={160}
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {formData.metaDescription?.length || 0}/160 characters
              </p>
            </div>

            {/* Meta Keywords */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Meta Keywords
              </label>
              <input
                type="text"
                value={formData.metaKeywords}
                onChange={(e) => setFormData({ ...formData, metaKeywords: e.target.value })}
                placeholder="keyword1, keyword2, keyword3"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Comma-separated keywords for SEO
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              {editingCategory ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <Confirm
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Delete Category"
        message="Are you sure you want to delete this category? This will remove the category from all posts."
        type="danger"
        onConfirm={async () => {
          if (deleteConfirm) {
            await handleDelete(deleteConfirm);
          }
        }}
      />
    </div>
  );
}
