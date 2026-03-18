// services/blog.api.ts
import { fetchData, postData, putData, deleteData } from "../utils/api";

// Blog type definition based on your backend schema
export interface Blog {
  _id: string;
  title: string;
  content: string;
  excerpt?: string;
  author: string;
  category: string;
  tags?: string[];
  coverImage?: string;
  views: number;
  comments: number;
  createdAt: string;
  updatedAt: string;
}

export interface BlogResponse {
  success: boolean;
  count?: number;
  data?: Blog | Blog[];
  message?: string;
  error?: string;
}

export interface CreateBlogData {
  title: string;
  content: string;
  excerpt?: string;
  author: string;
  category: string;
  tags?: string[];
  coverImage?: string;
}

export const blogAPI = {
  /**
   * Create a new blog post
   * POST /api/blogs
   */
  createBlog: (blogData: CreateBlogData): Promise<BlogResponse> => {
    return postData<BlogResponse>("/blogs", blogData);
  },

  /**
   * Get all blog posts
   * GET /api/blogs
   */
  getAllBlogs: (): Promise<BlogResponse> => {
    return fetchData<BlogResponse>("/blogs");
  },

  /**
   * Get single blog post by ID
   * GET /api/blogs/:id
   */
  getBlogById: (id: string): Promise<BlogResponse> => {
    return fetchData<BlogResponse>(`/blogs/${id}`);
  },

  /**
   * Update blog post
   * PUT /api/blogs/:id
   */
  updateBlog: (
    id: string,
    blogData: Partial<CreateBlogData>,
  ): Promise<BlogResponse> => {
    return putData<BlogResponse>(`/blogs/${id}`, blogData);
  },

  /**
   * Delete blog post
   * DELETE /api/blogs/:id
   */
  deleteBlog: (id: string): Promise<BlogResponse> => {
    return deleteData<BlogResponse>(`/blogs/${id}`);
  },

  /**
   * Get blogs by category
   * GET /api/blogs/category/:category
   */
  getBlogsByCategory: (category: string): Promise<BlogResponse> => {
    return fetchData<BlogResponse>(`/blogs/category/${category}`);
  },

  /**
   * Increment comment count
   * PUT /api/blogs/:id/comments
   */
  incrementComments: (id: string): Promise<BlogResponse> => {
    return putData<BlogResponse>(`/blogs/${id}/comments`, {});
  },
};
