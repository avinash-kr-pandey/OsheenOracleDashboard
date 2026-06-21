"use client";
import { format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import {
  Blog,
  blogAPI,
  CreateBlogFormData,
  getAuthorInitials,
  BlogComment,
} from "@/utils/blog.api";

const categories = [
  "Astrology",
  "Horoscope",
  "Moon Magic",
  "Tarot",
  "Spirituality",
  "Planets",
  "Zodiac",
  "Cosmic",
  "Vastu",
  "Numerology",
  "Palmistry",
  "Gemstones",
  "Muhurat",
  "Remedies",
  "Other",
];

const Toast = ({
  message,
  type,
  onClose,
}: {
  message: string;
  type: "success" | "error";
  onClose: () => void;
}) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg animate-slide-up ${
        type === "success" ? "bg-green-500" : "bg-red-500"
      } text-white flex items-center gap-3`}
    >
      {type === "success" ? (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
      ) : (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      )}
      {message}
    </div>
  );
};

const AdminBlogs: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"add" | "view" | "comments">(
    "add",
  );
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  // Comments states - ✅ FIXED: Using BlogComment instead of Comment
  const [comments, setComments] = useState<BlogComment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentsSearchTerm, setCommentsSearchTerm] = useState("");

  // Modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCommentDeleteModal, setShowCommentDeleteModal] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null);
  const [selectedComment, setSelectedComment] = useState<BlogComment | null>(
    null,
  );
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success" as "success" | "error",
  });

  // Form states
  const [formData, setFormData] = useState<CreateBlogFormData>({
    title: "",
    description: "",
    excerpt: "",
    author: user?.name || "",
    authorInitials: "",
    category: "",
    tags: [],
    image: "",
  });
  const [imagePreview, setImagePreview] = useState("");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchBlogs();
  }, []);

  useEffect(() => {
    if (activeTab === "comments") fetchComments();
  }, [activeTab]);

  useEffect(() => {
    if (formData.author) {
      setFormData((prev) => ({
        ...prev,
        authorInitials: getAuthorInitials(formData.author),
      }));
    }
  }, [formData.author]);

  const showNotification = (message: string, type: "success" | "error") =>
    setToast({ show: true, message, type });

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const response = await blogAPI.getAllBlogs();
      if (response.success && Array.isArray(response.data))
        setBlogs(response.data);
    } catch (error) {
      showNotification("Failed to fetch blogs", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    setCommentsLoading(true);
    try {
      const response = await blogAPI.getAllComments();
      if (response.success && Array.isArray(response.data))
        setComments(response.data);
      else setComments([]);
    } catch (error) {
      showNotification("Failed to fetch comments", "error");
    } finally {
      setCommentsLoading(false);
    }
  };

  const handleApproveComment = async (commentId: string) => {
    try {
      const response = await blogAPI.approveComment(commentId);
      if (response.success) {
        showNotification("Comment approved successfully!", "success");
        fetchComments();
      } else {
        showNotification(
          response.error || "Failed to approve comment",
          "error",
        );
      }
    } catch (error) {
      showNotification("Error approving comment", "error");
    }
  };

  const handleDeleteCommentClick = (comment: BlogComment) => {
    setSelectedComment(comment);
    setShowCommentDeleteModal(true);
  };

  const handleDeleteCommentConfirm = async () => {
    if (!selectedComment) return;
    try {
      const response = await blogAPI.deleteComment(selectedComment._id);
      if (response.success) {
        showNotification("Comment deleted successfully!", "success");
        setShowCommentDeleteModal(false);
        fetchComments();
        fetchBlogs();
      } else {
        showNotification(response.error || "Failed to delete comment", "error");
      }
    } catch (error) {
      showNotification("Error deleting comment", "error");
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      excerpt: "",
      author: user?.name || "",
      authorInitials: "",
      category: "",
      tags: [],
      image: "",
    });
    setImagePreview("");
    setFormErrors({});
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!formData.title.trim()) errors.title = "Title is required";
    if (!formData.description.trim())
      errors.description = "Description is required";
    if (!formData.author.trim()) errors.author = "Author is required";
    if (!formData.category) errors.category = "Category is required";
    if (!formData.image) errors.image = "Image is required";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showNotification("Image size should be less than 5MB", "error");
        return;
      }
      if (!file.type.startsWith("image/")) {
        showNotification("Please upload an image file", "error");
        return;
      }
      setFormData({ ...formData, image: file });
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleImageUrlChange = (url: string) => {
    setFormData({ ...formData, image: url });
    setImagePreview(url);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleCreateBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    try {
      const response = await blogAPI.createBlogWithImage(formData);
      if (response.success) {
        showNotification("Blog created successfully!", "success");
        resetForm();
        fetchBlogs();
        setActiveTab("view");
      } else {
        showNotification(response.error || "Error creating blog", "error");
      }
    } catch (err) {
      showNotification("Error creating blog", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (blog: Blog) => {
    setSelectedBlog(blog);
    setFormData({
      title: blog.title,
      description: blog.description,
      excerpt: blog.excerpt || "",
      author: blog.author,
      authorInitials: blog.authorInitials,
      category: blog.category,
      tags: blog.tags || [],
      image: blog.image,
    });
    setImagePreview(blog.image);
    setShowEditModal(true);
    if (editFileInputRef.current) editFileInputRef.current.value = "";
  };

  const handleUpdateBlog = async () => {
    if (!selectedBlog || !validateForm()) return;
    setLoading(true);
    try {
      const response = await blogAPI.updateBlogWithImage(
        selectedBlog._id,
        formData,
      );
      if (response.success) {
        showNotification("Blog updated successfully!", "success");
        setShowEditModal(false);
        fetchBlogs();
        resetForm();
      } else {
        showNotification(response.error || "Error updating blog", "error");
      }
    } catch (err) {
      showNotification("Error updating blog", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (blogId: string) => {
    const blog = blogs.find((b) => b._id === blogId);
    if (blog) {
      setSelectedBlog(blog);
      setShowDeleteModal(true);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedBlog) return;
    setLoading(true);
    try {
      const response = await blogAPI.deleteBlog(selectedBlog._id);
      if (response.success) {
        showNotification("Blog deleted successfully!", "success");
        setShowDeleteModal(false);
        await fetchBlogs();
      } else {
        showNotification(response.error || "Error deleting blog", "error");
      }
    } catch (err) {
      showNotification("Error deleting blog", "error");
    } finally {
      setLoading(false);
    }
  };

  const filteredBlogs = blogs.filter((blog) => {
    const matchesSearch =
      blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      !selectedCategory || blog.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const filteredComments = comments.filter(
    (comment) =>
      comment.name.toLowerCase().includes(commentsSearchTerm.toLowerCase()) ||
      comment.email.toLowerCase().includes(commentsSearchTerm.toLowerCase()) ||
      comment.comment.toLowerCase().includes(commentsSearchTerm.toLowerCase()),
  );

  const pendingComments = comments.filter((c) => !c.isApproved);
  const approvedComments = comments.filter((c) => c.isApproved);

  return (
    <div className="min-h-screen bg-gray-50">
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() =>
            setToast({ show: false, message: "", type: "success" })
          }
        />
      )}

      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Blog Management</h1>
        </div>
      </div>

      <div className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("add")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "add"
                  ? "border-orange-500 text-orange-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <span className="flex items-center gap-2">➕ Add New Blog</span>
            </button>
            <button
              onClick={() => setActiveTab("view")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "view"
                  ? "border-orange-500 text-orange-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <span className="flex items-center gap-2">
                📋 View All Blogs ({blogs.length})
              </span>
            </button>
            <button
              onClick={() => setActiveTab("comments")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "comments"
                  ? "border-orange-500 text-orange-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <span className="flex items-center gap-2">
                💬 Verify Comments ({pendingComments.length})
              </span>
            </button>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Add Blog Tab */}
        {activeTab === "add" && (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Create New Blog Post
            </h2>
            <form onSubmit={handleCreateBlog} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 ${
                    formErrors.title ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Enter blog title"
                />
                {formErrors.title && (
                  <p className="mt-1 text-sm text-red-500">
                    {formErrors.title}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Author *
                  </label>
                  <input
                    type="text"
                    value={formData.author}
                    onChange={(e) =>
                      setFormData({ ...formData, author: e.target.value })
                    }
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 ${
                      formErrors.author ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Author name"
                  />
                  {formData.authorInitials && (
                    <p className="mt-1 text-xs text-gray-500">
                      Initials: {formData.authorInitials}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 ${
                      formErrors.category ? "border-red-500" : "border-gray-300"
                    }`}
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Image *
                </label>
                <div className="space-y-3">
                  <input
                    type="url"
                    value={
                      typeof formData.image === "string" ? formData.image : ""
                    }
                    onChange={(e) => handleImageUrlChange(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    placeholder="https://example.com/image.jpg"
                  />
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500">
                        OR upload file
                      </span>
                    </div>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700"
                  />
                  {(imagePreview ||
                    (typeof formData.image === "string" && formData.image)) && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-500 mb-2">Preview:</p>
                      <div className="relative w-32 h-32 rounded-lg overflow-hidden border border-gray-200">
                        <img
                          src={
                            imagePreview ||
                            (typeof formData.image === "string"
                              ? formData.image
                              : "")
                          }
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Excerpt (Short Description)
                </label>
                <textarea
                  value={formData.excerpt}
                  onChange={(e) =>
                    setFormData({ ...formData, excerpt: e.target.value })
                  }
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  placeholder="Brief description of the blog..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={8}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 ${
                    formErrors.description
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  placeholder="Write your blog content here..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={formData.tags?.join(", ")}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      tags: e.target.value
                        .split(",")
                        .map((tag) => tag.trim())
                        .filter((tag) => tag),
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  placeholder="astrology, horoscope, predictions"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50"
                >
                  {loading ? "Creating..." : "Create Blog"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* View Blogs Tab */}
        {activeTab === "view" && (
          <div className="space-y-6">
            <div className="bg-white shadow rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by title, author, category..."
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedCategory("");
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-900"
                >
                  Clear Filters
                </button>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg overflow-hidden">
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Image
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Title
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Author
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Category
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Views/Comments
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Created
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredBlogs.map((blog) => (
                        <tr key={blog._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="relative w-10 h-10 rounded-lg overflow-hidden">
                              <Image
                                src={blog.image}
                                alt={blog.title}
                                fill
                                className="object-cover"
                              />
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900">
                              {blog.title}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {blog.author}
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800">
                              {blog.category}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            👁️ {blog.views} | 💬 {blog.comments}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {format(
                              new Date(blog.createdAt || blog.date),
                              "dd MMM yyyy",
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleEditClick(blog)}
                                className="text-orange-600 hover:text-orange-900"
                              >
                                ✏️
                              </button>
                              <button
                                onClick={() => handleDeleteClick(blog._id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                🗑️
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Verify Comments Tab */}
        {activeTab === "comments" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg p-4 text-white">
                <p className="text-sm opacity-90">Total Comments</p>
                <p className="text-2xl font-bold">{comments.length}</p>
              </div>
              <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg p-4 text-white">
                <p className="text-sm opacity-90">Pending Approval</p>
                <p className="text-2xl font-bold">{pendingComments.length}</p>
              </div>
              <div className="bg-gradient-to-r from-green-500 to-teal-500 rounded-lg p-4 text-white">
                <p className="text-sm opacity-90">Approved</p>
                <p className="text-2xl font-bold">{approvedComments.length}</p>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-4">
              <input
                type="text"
                value={commentsSearchTerm}
                onChange={(e) => setCommentsSearchTerm(e.target.value)}
                placeholder="Search by name, email, or comment..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div className="bg-white shadow rounded-lg overflow-hidden">
              {commentsLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
                </div>
              ) : filteredComments.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">No comments found</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {filteredComments.map((comment) => (
                    <div key={comment._id} className="p-6 hover:bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2 flex-wrap">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-orange-400 to-purple-500 flex items-center justify-center text-white font-bold">
                              {comment.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">
                                {comment.name}
                              </p>
                              <p className="text-sm text-gray-500">
                                {comment.email}
                              </p>
                            </div>
                            <span
                              className={`px-2 py-1 text-xs rounded-full ${comment.isApproved ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}
                            >
                              {comment.isApproved ? "Approved" : "Pending"}
                            </span>
                          </div>
                          <p className="text-gray-700 mt-2 ml-12">
                            {comment.comment}
                          </p>
                          <p className="text-xs text-gray-400 mt-2 ml-12">
                            {format(
                              new Date(comment.createdAt),
                              "dd MMM yyyy, hh:mm a",
                            )}
                          </p>
                        </div>
                        <div className="flex gap-2 ml-4">
                          {!comment.isApproved && (
                            <button
                              onClick={() => handleApproveComment(comment._id)}
                              className="px-3 py-1 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700"
                            >
                              ✓ Approve
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteCommentClick(comment)}
                            className="px-3 py-1 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700"
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {showEditModal && selectedBlog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b flex justify-between">
              <h3 className="text-lg font-semibold">Edit Blog</h3>
              <button onClick={() => setShowEditModal(false)}>✕</button>
            </div>
            <div className="px-6 py-4 space-y-4">
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Title"
                className="w-full px-4 py-2 border rounded-lg"
              />
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  value={formData.author}
                  onChange={(e) =>
                    setFormData({ ...formData, author: e.target.value })
                  }
                  placeholder="Author"
                  className="px-4 py-2 border rounded-lg"
                />
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="px-4 py-2 border rounded-lg"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
              <input
                type="url"
                value={typeof formData.image === "string" ? formData.image : ""}
                onChange={(e) => handleImageUrlChange(e.target.value)}
                placeholder="Image URL"
                className="w-full px-4 py-2 border rounded-lg"
              />
              <input
                ref={editFileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full px-4 py-2 border rounded-lg"
              />
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={6}
                placeholder="Content"
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>
            <div className="px-6 py-4 border-t flex justify-end gap-3">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 border rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateBlog}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Blog Modal */}
      {showDeleteModal && selectedBlog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="px-6 py-4">
              <h3 className="text-lg font-semibold">Delete Blog</h3>
              <p className="text-gray-500 mt-2">
                Are you sure you want to delete {selectedBlog.title}?
              </p>
            </div>
            <div className="px-6 py-4 border-t flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-red-600 text-white rounded-lg"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Comment Modal */}
      {showCommentDeleteModal && selectedComment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="px-6 py-4">
              <h3 className="text-lg font-semibold">Delete Comment</h3>
              <p className="text-gray-500 mt-2">
                Delete comment from {selectedComment.name}?
              </p>
            </div>
            <div className="px-6 py-4 border-t flex justify-end gap-3">
              <button
                onClick={() => setShowCommentDeleteModal(false)}
                className="px-4 py-2 border rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteCommentConfirm}
                className="px-4 py-2 bg-red-600 text-white rounded-lg"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBlogs;
