"use client";
import { format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { Blog, blogAPI, CreateBlogFormData, getAuthorInitials } from "@/utils/blog.api";

// Categories for dropdown
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

// Toast Component
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
  const [activeTab, setActiveTab] = useState<"add" | "view">("add");
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  // Modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null);
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error";
  }>({
    show: false,
    message: "",
    type: "success",
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

  const [imagePreview, setImagePreview] = useState<string>("");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Fetch blogs on mount
  useEffect(() => {
    fetchBlogs();
  }, []);

  // Update author initials when author changes
  useEffect(() => {
    if (formData.author) {
      setFormData((prev) => ({
        ...prev,
        authorInitials: getAuthorInitials(formData.author),
      }));
    }
  }, [formData.author]);

  const showNotification = (message: string, type: "success" | "error") => {
    setToast({ show: true, message, type });
  };

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const response = await blogAPI.getAllBlogs();
      if (response.success && Array.isArray(response.data)) {
        setBlogs(response.data);
      }
    } catch (error) {
      console.error("Error fetching blogs:", error);
      showNotification("Failed to fetch blogs", "error");
    } finally {
      setLoading(false);
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
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
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

  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    isEdit: boolean = false,
  ) => {
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
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const handleImageUrlChange = (url: string) => {
    setFormData({ ...formData, image: url });
    setImagePreview(url);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Handle Create Blog
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
      console.error("Error creating blog:", err);
      showNotification("Error creating blog", "error");
    } finally {
      setLoading(false);
    }
  };

  // Handle Edit Blog
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
    // Reset edit file input
    if (editFileInputRef.current) {
      editFileInputRef.current.value = "";
    }
  };

  const handleUpdateBlog = async () => {
    if (!selectedBlog || !validateForm()) return;

    setLoading(true);
    try {
      const response = await blogAPI.updateBlogWithImage(
        selectedBlog._id,
        formData,
        selectedBlog.image,
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
      console.error("Error updating blog:", err);
      showNotification("Error updating blog", "error");
    } finally {
      setLoading(false);
    }
  };

  // Handle Delete Blog
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
        await fetchBlogs(); // Refresh the list
      } else {
        showNotification(response.error || "Error deleting blog", "error");
      }
    } catch (err) {
      console.error("Error deleting blog:", err);
      showNotification("Error deleting blog", "error");
    } finally {
      setLoading(false);
    }
  };

  // Filter blogs based on search and category
  const filteredBlogs = blogs.filter((blog) => {
    const matchesSearch =
      blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      !selectedCategory || blog.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toast Notification */}
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() =>
            setToast({ show: false, message: "", type: "success" })
          }
        />
      )}

      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Blog Management</h1>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("add")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "add"
                  ? "border-orange-500 text-orange-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <span className="flex items-center gap-2">
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
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Add New Blog
              </span>
            </button>
            <button
              onClick={() => setActiveTab("view")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "view"
                  ? "border-orange-500 text-orange-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <span className="flex items-center gap-2">
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
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
                View All Blogs ({blogs.length})
              </span>
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content - Add Blog Tab */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "add" && (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Create New Blog Post
            </h2>

            <form onSubmit={handleCreateBlog} className="space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title <span className="text-red-500">*</span>
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

              {/* Author and Category */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Author <span className="text-red-500">*</span>
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
                  {formErrors.author && (
                    <p className="mt-1 text-sm text-red-500">
                      {formErrors.author}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category <span className="text-red-500">*</span>
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
                  {formErrors.category && (
                    <p className="mt-1 text-sm text-red-500">
                      {formErrors.category}
                    </p>
                  )}
                </div>
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Image <span className="text-red-500">*</span>
                </label>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      Image URL
                    </label>
                    <input
                      type="url"
                      value={
                        typeof formData.image === "string" ? formData.image : ""
                      }
                      onChange={(e) => handleImageUrlChange(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>

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

                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageChange(e, false)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
                    />
                  </div>

                  {(imagePreview ||
                    (typeof formData.image === "string" && formData.image)) && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-500 mb-2">Preview:</p>
                      <div className="relative w-32 h-32 rounded-lg overflow-hidden border border-gray-200">
                        <Image
                          src={
                            imagePreview ||
                            (typeof formData.image === "string"
                              ? formData.image
                              : "")
                          }
                          alt="Preview"
                          fill
                          className="object-cover"
                        />
                      </div>
                    </div>
                  )}
                </div>
                {formErrors.image && (
                  <p className="mt-1 text-sm text-red-500">
                    {formErrors.image}
                  </p>
                )}
              </div>

              {/* Excerpt */}
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

              {/* Content */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content <span className="text-red-500">*</span>
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
                {formErrors.description && (
                  <p className="mt-1 text-sm text-red-500">
                    {formErrors.description}
                  </p>
                )}
              </div>

              {/* Tags */}
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

              {/* Submit Button */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <svg
                        className="animate-spin h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Creating...
                    </>
                  ) : (
                    <>
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
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                      Create Blog
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* View Blogs Tab */}
        {activeTab === "view" && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white shadow rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Search
                  </label>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by title, author, category..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Filter by Category
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="">All Categories</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-end">
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
            </div>

            {/* Blogs Table */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <svg
                    className="animate-spin h-8 w-8 text-orange-600"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Image
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Title
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Author
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Category
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Views/Comments
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Created
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredBlogs.length === 0 ? (
                        <tr>
                          <td
                            colSpan={7}
                            className="px-6 py-4 text-center text-gray-500"
                          >
                            No blogs found
                          </td>
                        </tr>
                      ) : (
                        filteredBlogs.map((blog) => (
                          <tr key={blog._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
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
                              {blog.excerpt && (
                                <div className="text-sm text-gray-500 truncate max-w-xs">
                                  {blog.excerpt}
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {blog.author}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-orange-100 text-orange-800">
                                {blog.category}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              👁️ {blog.views} | 💬 {blog.comments}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {format(
                                new Date(blog.createdAt || blog.date),
                                "dd MMM yyyy",
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleEditClick(blog)}
                                  className="text-orange-600 hover:text-orange-900"
                                >
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
                                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                    />
                                  </svg>
                                </button>
                                <button
                                  onClick={() => handleDeleteClick(blog._id)}
                                  className="text-red-600 hover:text-red-900"
                                >
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
                                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                    />
                                  </svg>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {showEditModal && selectedBlog && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Edit Blog</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg
                  className="w-6 h-6"
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
              </button>
            </div>
            <div className="px-6 py-4 space-y-4">
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  />
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Edit Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Image
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
                        OR upload new image
                      </span>
                    </div>
                  </div>
                  <input
                    ref={editFileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageChange(e, true)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
                  />
                  {(imagePreview || formData.image) && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-500 mb-2">Preview:</p>
                      <div className="relative w-32 h-32 rounded-lg overflow-hidden border border-gray-200">
                        <Image
                          src={
                            imagePreview ||
                            (typeof formData.image === "string"
                              ? formData.image
                              : "")
                          }
                          alt="Preview"
                          fill
                          className="object-cover"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description/Content *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={6}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateBlog}
                disabled={loading}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50"
              >
                {loading ? "Updating..." : "Update Blog"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && selectedBlog && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="px-6 py-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Delete Blog
              </h3>
              <p className="text-gray-500">
                Are you sure you want to delete {selectedBlog.title}? This
                action cannot be undone.
              </p>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={loading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {loading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slideUp {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slide-up {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default AdminBlogs;
