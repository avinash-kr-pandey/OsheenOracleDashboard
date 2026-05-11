import { fetchData, postData, putData, deleteData, postFormData } from "./api";

// ==================== TYPES ====================

export interface Blog {
  _id: string;
  title: string;
  description: string;
  image: string;
  category: string;
  author: string;
  authorInitials: string;
  date: string;
  comments: number;
  views: number;
  tags?: string[];
  excerpt?: string;
  createdAt?: string;
  updatedAt?: string;
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
  description: string;
  image: string;
  category: string;
  author: string;
  authorInitials: string;
  excerpt?: string;
  tags?: string[];
}

export interface CreateBlogFormData {
  title: string;
  description: string;
  image: File | string;
  category: string;
  author: string;
  authorInitials: string;
  excerpt?: string;
  tags?: string[];
}

export interface UploadResponse {
  success: boolean;
  message: string;
  file?: {
    url: string;
    filename: string;
    originalname: string;
    mimetype: string;
    size: number;
    type: string;
  };
  url?: string;
}

// ✅ Renamed from Comment to BlogComment to avoid conflict with DOM Comment type
export interface BlogComment {
  _id: string;
  blogId: string;
  name: string;
  email: string;
  comment: string;
  isApproved: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CommentResponse {
  success: boolean;
  count?: number;
  data?: BlogComment | BlogComment[];
  message?: string;
  error?: string;
}

export interface AddCommentData {
  name: string;
  email: string;
  comment: string;
}

// ==================== FILE UPLOAD ====================

export const uploadBlogImage = async (file: File): Promise<string | null> => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await postFormData<UploadResponse>(
      "/uploads/file-upload",
      formData,
    );

    if (response.success) {
      if (response.file?.url) return response.file.url;
      if (response.url) return response.url;
    }

    return null;
  } catch (error) {
    console.error("Blog image upload error:", error);
    return "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format";
  }
};

// ==================== PUBLIC BLOG APIs ====================

export const getAllBlogs = async (): Promise<BlogResponse> => {
  try {
    const response = await fetchData<BlogResponse>("/blogs");
    return response;
  } catch (error) {
    return { success: false, error: "Failed to fetch blogs", data: [] };
  }
};

export const getBlogById = async (id: string): Promise<BlogResponse> => {
  try {
    const response = await fetchData<BlogResponse>(`/blogs/${id}`);
    return response;
  } catch (error) {
    return { success: false, error: "Failed to fetch blog" };
  }
};

// ==================== COMMENT APIs (PUBLIC) ====================

export const getBlogComments = async (
  blogId: string,
): Promise<CommentResponse> => {
  try {
    const response = await fetchData<CommentResponse>(
      `/blogs/${blogId}/comments`,
    );
    return response;
  } catch (error) {
    return { success: false, error: "Failed to fetch comments" };
  }
};

export const addBlogComment = async (
  blogId: string,
  commentData: AddCommentData,
): Promise<CommentResponse> => {
  try {
    const response = await postData<CommentResponse>(
      `/blogs/${blogId}/comments`,
      commentData,
    );
    return response;
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } } };
    return {
      success: false,
      error: err?.response?.data?.message || "Failed to add comment",
    };
  }
};

// ==================== ADMIN COMMENT APIs ====================

export const getAllComments = async (): Promise<CommentResponse> => {
  try {
    const response = await fetchData<CommentResponse>("/blogs/comments");
    return response;
  } catch (error) {
    return { success: false, error: "Failed to fetch comments" };
  }
};

export const approveComment = async (
  commentId: string,
): Promise<CommentResponse> => {
  try {
    const response = await putData<CommentResponse>(
      `/blogs/comments/${commentId}/approve`,
      {},
    );
    return response;
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } } };
    return {
      success: false,
      error: err?.response?.data?.message || "Failed to approve comment",
    };
  }
};

export const deleteComment = async (
  commentId: string,
): Promise<CommentResponse> => {
  try {
    const response = await deleteData<CommentResponse>(
      `/blogs/comments/${commentId}`,
    );
    return response;
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } } };
    return {
      success: false,
      error: err?.response?.data?.message || "Failed to delete comment",
    };
  }
};

// ==================== ADMIN BLOG APIs ====================

export const createBlog = async (
  blogData: CreateBlogData,
): Promise<BlogResponse> => {
  try {
    const response = await postData<BlogResponse>("/blogs", blogData);
    return response;
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } } };
    return {
      success: false,
      error: err?.response?.data?.message || "Failed to create blog",
    };
  }
};

export const createBlogWithImage = async (
  blogData: CreateBlogFormData,
): Promise<BlogResponse> => {
  let imageUrl: string;

  if (blogData.image instanceof File) {
    const uploadedUrl = await uploadBlogImage(blogData.image);
    imageUrl =
      uploadedUrl ||
      "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format";
  } else {
    imageUrl =
      blogData.image ||
      "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format";
  }

  const finalData: CreateBlogData = {
    title: blogData.title,
    description: blogData.description,
    image: imageUrl,
    category: blogData.category,
    author: blogData.author,
    authorInitials:
      blogData.authorInitials || getAuthorInitials(blogData.author),
    excerpt: blogData.excerpt,
    tags: blogData.tags,
  };

  return createBlog(finalData);
};

export const updateBlog = async (
  id: string,
  blogData: Partial<CreateBlogData>,
): Promise<BlogResponse> => {
  try {
    const response = await putData<BlogResponse>(`/blogs/${id}`, blogData);
    return response;
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } } };
    return {
      success: false,
      error: err?.response?.data?.message || "Failed to update blog",
    };
  }
};

export const updateBlogWithImage = async (
  id: string,
  blogData: Partial<CreateBlogFormData>,
): Promise<BlogResponse> => {
  let imageUrl: string | undefined;

  if (blogData.image instanceof File) {
    const uploadedUrl = await uploadBlogImage(blogData.image);
    if (uploadedUrl) imageUrl = uploadedUrl;
  } else if (blogData.image && typeof blogData.image === "string") {
    imageUrl = blogData.image;
  }

  const updateData: Partial<CreateBlogData> = {};
  if (blogData.title !== undefined) updateData.title = blogData.title;
  if (blogData.description !== undefined)
    updateData.description = blogData.description;
  if (blogData.category !== undefined) updateData.category = blogData.category;
  if (blogData.author !== undefined) updateData.author = blogData.author;
  if (blogData.authorInitials !== undefined) {
    updateData.authorInitials = blogData.authorInitials;
  } else if (blogData.author) {
    updateData.authorInitials = getAuthorInitials(blogData.author);
  }
  if (blogData.excerpt !== undefined) updateData.excerpt = blogData.excerpt;
  if (blogData.tags !== undefined) updateData.tags = blogData.tags;
  if (imageUrl) updateData.image = imageUrl;

  return updateBlog(id, updateData);
};

export const deleteBlog = async (id: string): Promise<BlogResponse> => {
  try {
    const response = await deleteData<BlogResponse>(`/blogs/${id}`);
    return response;
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } } };
    return {
      success: false,
      error: err?.response?.data?.message || "Failed to delete blog",
    };
  }
};

export const getBlogsByCategory = async (
  category: string,
): Promise<BlogResponse> => {
  try {
    const response = await fetchData<BlogResponse>(
      `/blogs/category/${category}`,
    );
    return response;
  } catch (error) {
    return { success: false, error: "Failed to fetch blogs by category" };
  }
};

export const incrementComments = async (id: string): Promise<BlogResponse> => {
  try {
    const response = await putData<BlogResponse>(`/blogs/${id}/comments`, {});
    return response;
  } catch (error) {
    return { success: false, error: "Failed to increment comments" };
  }
};

// ==================== HELPER FUNCTIONS ====================

export const getAuthorInitials = (author: string): string => {
  if (!author) return "AN";
  return author
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);
};

export const formatBlogDate = (dateString?: string): string => {
  if (!dateString) {
    return new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const transformBlogForUI = (blog: Blog) => ({
  id: blog._id,
  title: blog.title,
  description: blog.description,
  image: blog.image,
  category: blog.category,
  date: blog.date || formatBlogDate(blog.createdAt),
  comments: blog.comments || 0,
  views: blog.views || 0,
  author: blog.author,
  authorInitials: blog.authorInitials || getAuthorInitials(blog.author),
  tags: blog.tags || [],
  excerpt: blog.excerpt || blog.description?.substring(0, 100) + "..." || "",
});

// ==================== EXPORT ====================

export const blogAPI = {
  getAllBlogs,
  getBlogById,
  createBlog,
  createBlogWithImage,
  updateBlog,
  updateBlogWithImage,
  deleteBlog,
  getBlogsByCategory,
  incrementComments,
  uploadBlogImage,
  getBlogComments,
  addBlogComment,
  getAllComments,
  approveComment,
  deleteComment,
};
