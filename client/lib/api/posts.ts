import apiClient from './client';
import { CreatePostInput, UpdatePostInput, PostsResponse, Post } from './types';

export const postsApi = {
  // Get all posts (with optional filters)
  getAll: async (params?: {
    page?: number;
    limit?: number;
    locale?: 'tr' | 'en';
    status?: 'draft' | 'published';
    tag?: string;
    search?: string;
  }): Promise<PostsResponse> => {
    const response = await apiClient.get('/posts', { params });
    return response.data;
  },

  // Get post by slug
  getBySlug: async (slug: string, locale?: 'tr' | 'en'): Promise<{ post: Post }> => {
    const params = locale ? { locale } : {};
    const response = await apiClient.get(`/posts/slug/${slug}`, { params });
    return response.data;
  },

  // Get post by ID
  getById: async (id: string): Promise<{ post: Post }> => {
    const response = await apiClient.get(`/posts/${id}`);
    return response.data;
  },

  // Create new post
  create: async (data: CreatePostInput): Promise<{ message: string; post: Post }> => {
    const response = await apiClient.post('/posts', data);
    return response.data;
  },

  // Update post
  update: async (id: string, data: UpdatePostInput): Promise<{ message: string; post: Post }> => {
    const response = await apiClient.put(`/posts/${id}`, data);
    return response.data;
  },

  // Delete post
  delete: async (id: string): Promise<{ message: string }> => {
    const response = await apiClient.delete(`/posts/${id}`);
    return response.data;
  },

  // Get all tags
  getTags: async (locale?: 'tr' | 'en'): Promise<{ tags: string[] }> => {
    const params = locale ? { locale } : {};
    const response = await apiClient.get('/posts/tags', { params });
    return response.data;
  },
};

export default postsApi;
