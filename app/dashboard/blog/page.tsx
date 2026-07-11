"use client";
import { format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { toast, Toaster } from "react-hot-toast";
import {
  FileText,
  User,
  Folder,
  Tag as TagIcon,
  Image as ImageIcon,
  Link as LinkIcon,
  Upload,
  Globe,
  Edit,
  Trash2,
  Plus,
  Calendar,
  Eye,
  MessageSquare,
  Check,
  X,
  Search,
  Filter,
  Loader2,
  Grid,
  List,
  Clock,
  ChevronRight
} from "lucide-react";
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

  // View mode state (grid vs list)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Image uploading states
  const [uploadMethod, setUploadMethod] = useState<"url" | "local">("url");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [editUploadMethod, setEditUploadMethod] = useState<"url" | "local">("url");
  const [editUploadingImage, setEditUploadingImage] = useState(false);

  // Comments states
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

  const showNotification = (message: string, type: "success" | "error") => {
    if (type === "success") {
      toast.success(message);
    } else {
      toast.error(message);
    }
  };

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
    setUploadMethod("url");
    setUploadingImage(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!formData.title.trim()) errors.title = "Title is required";
    if (!formData.description.trim())
      errors.description = "Content description is required";
    if (!formData.author.trim()) errors.author = "Author name is required";
    if (!formData.category) errors.category = "Category is required";
    if (!formData.image) errors.image = "Image is required";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Immediate upload flow for Add Blog Form
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file (JPG, PNG, WebP)");
      return;
    }


    setUploadingImage(true);
    try {
      // Local preview fallback
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Upload to server
      const uploadedUrl = await blogAPI.uploadBlogImage(file);
      if (uploadedUrl) {
        setFormData((prev) => ({ ...prev, image: uploadedUrl }));
        toast.success("Image uploaded successfully!");
      } else {
        toast.error("Failed to upload image");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload image");
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Immediate upload flow for Edit Blog Modal
  const handleEditFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file (JPG, PNG, WebP)");
      return;
    }


    setEditUploadingImage(true);
    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      const uploadedUrl = await blogAPI.uploadBlogImage(file);
      if (uploadedUrl) {
        setFormData((prev) => ({ ...prev, image: uploadedUrl }));
        toast.success("Image uploaded successfully!");
      } else {
        toast.error("Failed to upload image");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload image");
    } finally {
      setEditUploadingImage(false);
      if (editFileInputRef.current) editFileInputRef.current.value = "";
    }
  };

  const handleImageUrlChange = (url: string) => {
    setFormData({ ...formData, image: url });
    setImagePreview(url);
  };

  const insertFormatting = (tagStart: string, tagEnd: string, targetId: string) => {
    const textarea = document.getElementById(targetId) as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selectedText = text.substring(start, end);
    const replacement = tagStart + (selectedText || "text") + tagEnd;
    
    const newValue = text.substring(0, start) + replacement + text.substring(end);
    
    setFormData({
      ...formData,
      description: newValue
    });

    // Re-focus and set selection
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + tagStart.length, start + tagStart.length + (selectedText || "text").length);
    }, 0);
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
    // Detect whether current image is a URL or uploaded path
    const isUrl = blog.image && (blog.image.startsWith("http") || blog.image.startsWith("data:"));
    setEditUploadMethod(isUrl ? "url" : "local");
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

  const getCategoryColor = (cat: string) => {
    const colors: Record<string, string> = {
      Astrology: "bg-purple-100 text-purple-800",
      Horoscope: "bg-indigo-100 text-indigo-800",
      "Moon Magic": "bg-blue-100 text-blue-800",
      Tarot: "bg-pink-100 text-pink-800",
      Spirituality: "bg-teal-100 text-teal-800",
      Planets: "bg-amber-100 text-amber-800",
      Zodiac: "bg-rose-100 text-rose-800",
      Cosmic: "bg-purple-50 text-purple-600",
      Vastu: "bg-orange-100 text-orange-800",
      Numerology: "bg-emerald-100 text-emerald-800",
      Palmistry: "bg-amber-100 text-amber-800",
      Gemstones: "bg-indigo-50 text-indigo-700",
      Muhurat: "bg-teal-50 text-teal-700",
      Remedies: "bg-cyan-100 text-cyan-800",
      Other: "bg-gray-100 text-gray-800",
    };
    return colors[cat] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="min-h-screen bg-gray-50/50 pb-12 animate-fade-in">
      <Toaster position="top-right" />

      {/* Modern Premium Header */}
      <div className="bg-gradient-to-r from-orange-50 to-amber-50 border-b border-orange-100 py-6 px-4 sm:px-6 lg:px-8 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
              <span className="p-2.5 bg-orange-600 text-white rounded-xl shadow-md">
                <FileText className="h-6 w-6" />
              </span>
              Blog Management
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Create, edit, manage blog posts and verify reader comments.
            </p>
          </div>
        </div>
      </div>

      {/* Tabs Sticky Navigation */}
      <div className="border-b border-gray-200 bg-white sticky top-0 z-10 shadow-xs mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => { setActiveTab("add"); resetForm(); }}
              className={`py-4 px-1 border-b-2 font-semibold text-sm transition-all duration-200 flex items-center gap-2 cursor-pointer ${
                activeTab === "add"
                  ? "border-orange-500 text-orange-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <Plus className="h-4 w-4" /> Add New Blog
            </button>
            <button
              onClick={() => setActiveTab("view")}
              className={`py-4 px-1 border-b-2 font-semibold text-sm transition-all duration-200 flex items-center gap-2 cursor-pointer ${
                activeTab === "view"
                  ? "border-orange-500 text-orange-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <List className="h-4 w-4" /> View All Blogs
              <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full font-medium">
                {blogs.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab("comments")}
              className={`py-4 px-1 border-b-2 font-semibold text-sm transition-all duration-200 flex items-center gap-2 cursor-pointer ${
                activeTab === "comments"
                  ? "border-orange-500 text-orange-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <MessageSquare className="h-4 w-4" /> Verify Comments
              {pendingComments.length > 0 && (
                <span className="px-2 py-0.5 text-xs bg-amber-500 text-white rounded-full animate-pulse font-medium">
                  {pendingComments.length}
                </span>
              )}
            </button>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Add Blog Tab */}
        {activeTab === "add" && (
          <div className="bg-white shadow-md rounded-2xl border border-gray-100 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Plus className="h-5 w-5 text-orange-600" /> Create New Blog Post
              </h2>
              <p className="text-xs text-gray-500 mt-1">Publish a new astrology, horoscope, tarot, or cosmic insights blog.</p>
            </div>
            
            <form onSubmit={handleCreateBlog} className="p-6 md:p-8 space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Image & Metadata */}
                <div className="space-y-6 lg:col-span-1">
                  {/* Image Upload card */}
                  <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                    <div className="flex items-center gap-2 mb-3">
                      <ImageIcon className="h-4 w-4 text-gray-600" />
                      <h3 className="font-semibold text-sm text-gray-700">Cover Image *</h3>
                    </div>

                    {/* Upload Method Tabs */}
                    <div className="flex gap-1.5 mb-4 bg-white rounded-lg p-1 border border-gray-200">
                      <button
                        type="button"
                        onClick={() => setUploadMethod("url")}
                        className={`flex-1 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                          uploadMethod === "url"
                            ? "bg-orange-600 text-white shadow-sm"
                            : "text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        <Globe className="h-3.5 w-3.5" />
                        URL
                      </button>
                      <button
                        type="button"
                        onClick={() => setUploadMethod("local")}
                        className={`flex-1 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                          uploadMethod === "local"
                            ? "bg-orange-600 text-white shadow-sm"
                            : "text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        <Upload className="h-3.5 w-3.5" />
                        Upload
                      </button>
                    </div>

                    {/* Image Preview Container */}
                    <div className="aspect-video w-full rounded-xl overflow-hidden border border-gray-200 bg-white mb-4 relative flex items-center justify-center group shadow-sm">
                      {uploadingImage && (
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center gap-2 z-10">
                          <Loader2 className="animate-spin h-6 w-6 text-white" />
                          <span className="text-white text-xs font-medium">Uploading image...</span>
                        </div>
                      )}
                      {imagePreview ? (
                        <img
                          src={imagePreview}
                          alt="Cover preview"
                          className="w-full h-full object-cover animate-fade-in"
                          onError={() => {
                            setImagePreview("");
                            toast.error("Invalid image URL provided");
                          }}
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center text-gray-400 p-4">
                          <ImageIcon className="h-8 w-8 mb-1.5 text-orange-500 opacity-60" />
                          <p className="text-xs text-center">No image selected</p>
                        </div>
                      )}
                    </div>

                    {/* URL or Local input container */}
                    {uploadMethod === "url" ? (
                      <div className="space-y-1">
                        <div className="relative">
                          <LinkIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                          <input
                            type="url"
                            value={typeof formData.image === "string" ? formData.image : ""}
                            onChange={(e) => handleImageUrlChange(e.target.value)}
                            placeholder="https://example.com/cover.jpg"
                            className={`w-full pl-9 pr-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all ${
                              formErrors.image ? "border-red-500" : "border-gray-300"
                            }`}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="w-full text-xs text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100 cursor-pointer"
                        />
                        <p className="text-[10px] text-gray-400 mt-1">PNG, JPG, WebP.</p>
                      </div>
                    )}
                    {formErrors.image && (
                      <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                        <X className="h-3 w-3" /> {formErrors.image}
                      </p>
                    )}
                  </div>

                  {/* Category Selection Box */}
                  <div className="bg-white rounded-xl p-5 border border-gray-200">
                    <div className="flex items-center gap-2 mb-3">
                      <Folder className="h-4 w-4 text-gray-600" />
                      <h3 className="font-semibold text-sm text-gray-700">Category *</h3>
                    </div>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all ${
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
                      <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                        <X className="h-3 w-3" /> {formErrors.category}
                      </p>
                    )}
                  </div>

                  {/* Tags Card */}
                  <div className="bg-white rounded-xl p-5 border border-gray-200">
                    <div className="flex items-center gap-2 mb-3">
                      <TagIcon className="h-4 w-4 text-gray-600" />
                      <h3 className="font-semibold text-sm text-gray-700">Tags</h3>
                    </div>
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
                      placeholder="astrology, predictions, horoscope"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                    />
                    <p className="text-[10px] text-gray-400 mt-1">Separate keywords with commas.</p>
                  </div>
                </div>

                {/* Right Column: Blog Metadata & Content */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Title */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Blog Title <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <FileText className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="Enter a catchy blog title..."
                        className={`w-full pl-9 pr-3 py-2.5 text-sm border rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-medium ${
                          formErrors.title ? "border-red-500" : "border-gray-300"
                        }`}
                      />
                    </div>
                    {formErrors.title && (
                      <p className="text-xs text-red-500 flex items-center gap-1">
                        <X className="h-3 w-3" /> {formErrors.title}
                      </p>
                    )}
                  </div>

                  {/* Author and Date Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        Author <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                        <input
                          type="text"
                          value={formData.author}
                          onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                          placeholder="Author name"
                          className={`w-full pl-9 pr-3 py-2.5 text-sm border rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all ${
                            formErrors.author ? "border-red-500" : "border-gray-300"
                          }`}
                        />
                      </div>
                      {formErrors.author && (
                        <p className="text-xs text-red-500 flex items-center gap-1">
                          <X className="h-3 w-3" /> {formErrors.author}
                        </p>
                      )}
                      {formData.authorInitials && (
                        <p className="text-[10px] text-gray-500 flex items-center gap-1.5 mt-1">
                          <span className="w-4 h-4 bg-orange-100 text-orange-700 rounded-full flex items-center justify-center font-bold text-[8px]">
                            {formData.authorInitials}
                          </span>
                          Initials: <strong className="text-gray-700">{formData.authorInitials}</strong>
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        Publication Date
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                        <input
                          type="text"
                          value={format(new Date(), "dd MMMM yyyy")}
                          disabled
                          className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 bg-gray-50 text-gray-500 rounded-lg cursor-not-allowed"
                        />
                      </div>
                      <p className="text-[10px] text-gray-400">Date is set automatically.</p>
                    </div>
                  </div>

                  {/* Excerpt (Short description) */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Excerpt (Short Summary)
                    </label>
                    <textarea
                      value={formData.excerpt}
                      onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                      rows={2}
                      placeholder="Provide a short summary to engage readers..."
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all resize-none"
                    />
                  </div>

                  {/* Blog Content */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Blog Content *
                    </label>
                    <div className="flex gap-2 mb-2 p-1.5 bg-gray-50 border border-gray-200 rounded-lg flex-wrap items-center">
                      <button
                        type="button"
                        onClick={() => insertFormatting("<strong>", "</strong>", "blog-content-area")}
                        className="px-2.5 py-1 bg-white border border-gray-300 rounded text-xs font-bold text-gray-700 hover:bg-gray-100 cursor-pointer shadow-2xs"
                      >
                        B (Bold)
                      </button>
                      <button
                        type="button"
                        onClick={() => insertFormatting("<span class='font-heading'>", "</span>", "blog-content-area")}
                        className="px-2.5 py-1 bg-white border border-gray-300 rounded text-xs text-gray-700 hover:bg-gray-100 cursor-pointer shadow-2xs font-semibold"
                      >
                        Font: Charm
                      </button>
                      <button
                        type="button"
                        onClick={() => insertFormatting("<span class='font-subheading'>", "</span>", "blog-content-area")}
                        className="px-2.5 py-1 bg-white border border-gray-300 rounded text-xs text-gray-700 hover:bg-gray-100 cursor-pointer shadow-2xs font-semibold"
                      >
                        Font: Cormorant
                      </button>
                    </div>
                    <textarea
                      id="blog-content-area"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={12}
                      placeholder="Write your cosmic wisdom here..."
                      className={`w-full px-3 py-3 text-sm border rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-mono ${
                        formErrors.description ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    {formErrors.description && (
                      <p className="text-xs text-red-500 flex items-center gap-1">
                        <X className="h-3 w-3" /> {formErrors.description}
                      </p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-end pt-4 border-t border-gray-100">
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-6 py-2.5 bg-orange-600 text-white rounded-xl text-sm font-semibold hover:bg-orange-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="animate-spin h-4 w-4" /> Creating...
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4" /> Publish Blog
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* View Blogs Tab */}
        {activeTab === "view" && (
          <div className="space-y-6">
            {/* Filters Bar */}
            <div className="bg-white shadow-sm rounded-2xl border border-gray-100 p-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search blogs by title, author..."
                      className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                    />
                  </div>
                  <div className="relative">
                    <Filter className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                    >
                      <option value="">All Categories</option>
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-3 border-l border-gray-100 pl-0 md:pl-4 self-end md:self-auto">
                  {/* View Toggles */}
                  <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`p-1.5 rounded-md transition-all cursor-pointer ${
                        viewMode === "grid" ? "bg-white text-orange-600 shadow-xs" : "text-gray-500 hover:text-gray-800"
                      }`}
                      title="Grid View"
                    >
                      <Grid className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setViewMode("list")}
                      className={`p-1.5 rounded-md transition-all cursor-pointer ${
                        viewMode === "list" ? "bg-white text-orange-600 shadow-xs" : "text-gray-500 hover:text-gray-800"
                      }`}
                      title="Table View"
                    >
                      <List className="h-4 w-4" />
                    </button>
                  </div>

                  {(searchTerm || selectedCategory) && (
                    <button
                      onClick={() => {
                        setSearchTerm("");
                        setSelectedCategory("");
                      }}
                      className="text-xs font-semibold text-orange-600 hover:text-orange-800 transition-colors cursor-pointer"
                    >
                      Reset Filters
                    </button>
                  )}
                </div>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center items-center h-64 bg-white rounded-2xl border border-gray-100 shadow-xs">
                <Loader2 className="animate-spin h-8 w-8 text-orange-600" />
              </div>
            ) : filteredBlogs.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-xs">
                <ImageIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">No blog posts found matching your search filters.</p>
              </div>
            ) : viewMode === "grid" ? (
              /* GRID VIEW */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredBlogs.map((blog) => (
                  <div key={blog._id} className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex flex-col group h-full shadow-xs">
                    <div className="relative aspect-video w-full bg-gray-50 overflow-hidden">
                      {blog.image ? (
                        <img
                          src={blog.image}
                          alt={blog.title}
                          className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <ImageIcon className="h-10 w-10 opacity-30 text-orange-500" />
                        </div>
                      )}
                      <span className={`absolute top-3 left-3 text-[10px] font-extrabold tracking-wide px-2.5 py-1 rounded-full shadow-xs ${getCategoryColor(blog.category)}`}>
                        {blog.category}
                      </span>
                    </div>
                    
                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-3 text-[10px] text-gray-500 mb-2 font-medium">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            {format(new Date(blog.createdAt || blog.date), "dd MMM yyyy")}
                          </span>
                        </div>
                        
                        <h3 className="font-bold text-gray-900 group-hover:text-orange-600 transition-colors line-clamp-2 mb-2 leading-snug text-sm">
                          {blog.title}
                        </h3>
                        
                        <p className="text-xs text-gray-500 line-clamp-3 mb-4 leading-relaxed">
                          {blog.excerpt || blog.description?.substring(0, 120) + "..."}
                        </p>
                      </div>
                      
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 bg-orange-50 text-orange-700 rounded-full flex items-center justify-center font-bold text-[10px]">
                            {blog.authorInitials || getAuthorInitials(blog.author)}
                          </div>
                          <div className="text-[10px]">
                            <p className="font-semibold text-gray-800 line-clamp-1 leading-none">{blog.author}</p>
                            <span className="text-[8px] text-gray-400">Author</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3 text-gray-500 text-[10px]">
                          <span className="flex items-center gap-1" title="Views">
                            <Eye className="h-3.5 w-3.5" /> {blog.views || 0}
                          </span>
                          <span className="flex items-center gap-1" title="Comments">
                            <MessageSquare className="h-3.5 w-3.5" /> {blog.comments || 0}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 border-t border-gray-100 px-5 py-3 flex justify-end gap-2 shrink-0">
                      <button
                        onClick={() => handleEditClick(blog)}
                        className="p-1.5 bg-white border border-gray-200 hover:border-orange-500 text-gray-600 hover:text-orange-600 rounded-lg hover:shadow-xs transition-all cursor-pointer"
                        title="Edit Post"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(blog._id)}
                        className="p-1.5 bg-white border border-gray-200 hover:border-red-500 text-gray-600 hover:text-red-600 rounded-lg hover:shadow-xs transition-all cursor-pointer"
                        title="Delete Post"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* TABLE LIST VIEW */
              <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-100">
                    <thead className="bg-gray-50/70">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Cover</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Title</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Author</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Engagement</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Created</th>
                        <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                      {filteredBlogs.map((blog) => (
                        <tr key={blog._id} className="hover:bg-gray-50/30 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="relative w-12 aspect-video rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                              {blog.image ? (
                                <img src={blog.image} alt={blog.title} className="object-cover w-full h-full" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                  <ImageIcon className="h-4 w-4" />
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm font-semibold text-gray-900 line-clamp-1">{blog.title}</div>
                            {blog.excerpt && <p className="text-xs text-gray-400 line-clamp-1 mt-0.5">{blog.excerpt}</p>}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 bg-orange-50 text-orange-700 rounded-full flex items-center justify-center font-bold text-[9px]">
                                {blog.authorInitials || getAuthorInitials(blog.author)}
                              </div>
                              <span className="text-xs text-gray-700 font-medium">{blog.author}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full shadow-2xs ${getCategoryColor(blog.category)}`}>
                              {blog.category}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3 text-xs text-gray-500 font-medium">
                              <span className="flex items-center gap-1" title="Views"><Eye className="h-3.5 w-3.5" /> {blog.views || 0}</span>
                              <span className="flex items-center gap-1" title="Comments"><MessageSquare className="h-3.5 w-3.5" /> {blog.comments || 0}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                            {format(new Date(blog.createdAt || blog.date), "dd MMM yyyy")}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                            <div className="flex justify-end gap-2.5">
                              <button
                                onClick={() => handleEditClick(blog)}
                                className="p-1 text-orange-600 hover:text-orange-950 hover:bg-orange-50 rounded-lg transition-colors cursor-pointer"
                                title="Edit"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteClick(blog._id)}
                                className="p-1 text-red-600 hover:text-red-950 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                title="Delete"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Verify Comments Tab */}
        {activeTab === "comments" && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-indigo-500 via-indigo-600 to-indigo-700 rounded-2xl p-5 text-white shadow-md relative overflow-hidden group">
                <div className="absolute right-0 bottom-0 opacity-10 translate-y-2 translate-x-2 group-hover:scale-105 transition-transform duration-300">
                  <MessageSquare className="h-32 w-32" />
                </div>
                <p className="text-[10px] uppercase font-bold tracking-wider opacity-80">Total Comments</p>
                <p className="text-3xl font-extrabold mt-2">{comments.length}</p>
              </div>
              <div className="bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 rounded-2xl p-5 text-white shadow-md relative overflow-hidden group">
                <div className="absolute right-0 bottom-0 opacity-10 translate-y-2 translate-x-2 group-hover:scale-105 transition-transform duration-300">
                  <Clock className="h-32 w-32" />
                </div>
                <p className="text-[10px] uppercase font-bold tracking-wider opacity-80">Pending Approval</p>
                <p className="text-3xl font-extrabold mt-2">{pendingComments.length}</p>
              </div>
              <div className="bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-700 rounded-2xl p-5 text-white shadow-md relative overflow-hidden group">
                <div className="absolute right-0 bottom-0 opacity-10 translate-y-2 translate-x-2 group-hover:scale-105 transition-transform duration-300">
                  <Check className="h-32 w-32" />
                </div>
                <p className="text-[10px] uppercase font-bold tracking-wider opacity-80">Approved Comments</p>
                <p className="text-3xl font-extrabold mt-2">{approvedComments.length}</p>
              </div>
            </div>

            {/* Search Bar */}
            <div className="bg-white shadow-sm border border-gray-100 rounded-2xl p-4 flex items-center gap-3">
              <Search className="h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={commentsSearchTerm}
                onChange={(e) => setCommentsSearchTerm(e.target.value)}
                placeholder="Search comments by commenter name, email, or message..."
                className="w-full text-sm border-0 focus:ring-0 focus:outline-hidden text-gray-700 placeholder-gray-400"
              />
            </div>

            {/* Comments list container */}
            <div className="bg-white shadow-sm border border-gray-100 rounded-2xl overflow-hidden">
              {commentsLoading ? (
                <div className="flex justify-center items-center h-64">
                  <Loader2 className="animate-spin h-8 w-8 text-orange-600" />
                </div>
              ) : filteredComments.length === 0 ? (
                <div className="text-center py-12">
                  <MessageSquare className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">No comments found matching search</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {filteredComments.map((comment) => (
                    <div key={comment._id} className="p-6 hover:bg-gray-50/30 transition-colors">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div className="flex items-start gap-4 flex-1">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white font-bold shrink-0 shadow-xs">
                            {comment.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-gray-900 text-sm">{comment.name}</span>
                              <span className="text-xs text-gray-400">•</span>
                              <span className="text-xs text-gray-500">{comment.email}</span>
                            </div>
                            
                            <p className="text-[10px] text-gray-400 mt-0.5">
                              {format(new Date(comment.createdAt), "dd MMM yyyy, hh:mm a")}
                            </p>
                            
                            <p className="text-gray-700 text-sm mt-3 bg-gray-50 border border-gray-100 rounded-xl p-3.5 leading-relaxed inline-block max-w-full">
                              {comment.comment}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 sm:self-start self-end">
                          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0 shadow-2xs mr-1 ${
                            comment.isApproved ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                          }`}>
                            {comment.isApproved ? "Approved" : "Pending Approval"}
                          </span>
                          
                          {!comment.isApproved && (
                            <button
                              onClick={() => handleApproveComment(comment._id)}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-2xs hover:shadow-xs transition-all flex items-center gap-1 cursor-pointer"
                            >
                              <Check className="h-3.5 w-3.5" /> Approve
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteCommentClick(comment)}
                            className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 hover:border-red-300 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" /> Delete
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-[100] animate-fade-in">
          <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col border border-gray-100">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center shrink-0">
              <div>
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Edit className="h-5 w-5 text-orange-600" /> Edit Blog Post
                </h3>
                <p className="text-xs text-gray-500">Update the cover image, category, metadata, or content details.</p>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600 bg-white hover:bg-gray-100 p-1.5 rounded-lg border border-gray-200 transition-colors shadow-2xs"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Image upload & Category */}
                <div className="space-y-6 lg:col-span-1">
                  {/* Cover Image editing card */}
                  <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                    <div className="flex items-center gap-2 mb-3">
                      <ImageIcon className="h-4 w-4 text-gray-600" />
                      <h3 className="font-semibold text-sm text-gray-700">Cover Image *</h3>
                    </div>

                    {/* Upload Method Toggle */}
                    <div className="flex gap-1.5 mb-4 bg-white rounded-lg p-1 border border-gray-200">
                      <button
                        type="button"
                        onClick={() => setEditUploadMethod("url")}
                        className={`flex-1 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                          editUploadMethod === "url"
                            ? "bg-orange-600 text-white shadow-sm"
                            : "text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        <Globe className="h-3.5 w-3.5" />
                        URL
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditUploadMethod("local")}
                        className={`flex-1 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                          editUploadMethod === "local"
                            ? "bg-orange-600 text-white shadow-sm"
                            : "text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        <Upload className="h-3.5 w-3.5" />
                        Upload
                      </button>
                    </div>

                    {/* Preview */}
                    <div className="aspect-video w-full rounded-xl overflow-hidden border border-gray-200 bg-white mb-4 relative flex items-center justify-center shadow-sm">
                      {editUploadingImage && (
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center gap-2 z-10">
                          <Loader2 className="animate-spin h-6 w-6 text-white" />
                          <span className="text-white text-xs font-medium">Uploading image...</span>
                        </div>
                      )}
                      {imagePreview ? (
                        <img
                          src={imagePreview}
                          alt="Edit preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center text-gray-400 p-4">
                          <ImageIcon className="h-8 w-8 mb-1.5 text-orange-500 opacity-60" />
                          <p className="text-xs">No image selected</p>
                        </div>
                      )}
                    </div>

                    {/* Inputs */}
                    {editUploadMethod === "url" ? (
                      <div className="space-y-1">
                        <div className="relative">
                          <LinkIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                          <input
                            type="url"
                            value={typeof formData.image === "string" ? formData.image : ""}
                            onChange={(e) => handleImageUrlChange(e.target.value)}
                            placeholder="https://example.com/cover.jpg"
                            className={`w-full pl-9 pr-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all ${
                              formErrors.image ? "border-red-500" : "border-gray-300"
                            }`}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <input
                          ref={editFileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleEditFileUpload}
                          className="w-full text-xs text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100 cursor-pointer"
                        />
                      </div>
                    )}
                    {formErrors.image && (
                      <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                        <X className="h-3 w-3" /> {formErrors.image}
                      </p>
                    )}
                  </div>

                  {/* Category Selection Box */}
                  <div className="bg-white rounded-xl p-5 border border-gray-200">
                    <div className="flex items-center gap-2 mb-3">
                      <Folder className="h-4 w-4 text-gray-600" />
                      <h3 className="font-semibold text-sm text-gray-700">Category *</h3>
                    </div>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all ${
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
                      <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                        <X className="h-3 w-3" /> {formErrors.category}
                      </p>
                    )}
                  </div>

                  {/* Tags Card */}
                  <div className="bg-white rounded-xl p-5 border border-gray-200">
                    <div className="flex items-center gap-2 mb-3">
                      <TagIcon className="h-4 w-4 text-gray-600" />
                      <h3 className="font-semibold text-sm text-gray-700">Tags</h3>
                    </div>
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
                      placeholder="predictions, horoscope"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                    />
                  </div>
                </div>

                {/* Right Column: Title, Author, Excerpt & Content */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Blog Title *
                    </label>
                    <div className="relative">
                      <FileText className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className={`w-full pl-9 pr-3 py-2.5 text-sm border rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-medium ${
                          formErrors.title ? "border-red-500" : "border-gray-300"
                        }`}
                      />
                    </div>
                    {formErrors.title && (
                      <p className="text-xs text-red-500 flex items-center gap-1">
                        <X className="h-3 w-3" /> {formErrors.title}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        Author *
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                        <input
                          type="text"
                          value={formData.author}
                          onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                          className={`w-full pl-9 pr-3 py-2.5 text-sm border rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all ${
                            formErrors.author ? "border-red-500" : "border-gray-300"
                          }`}
                        />
                      </div>
                      {formErrors.author && (
                        <p className="text-xs text-red-500 flex items-center gap-1">
                          <X className="h-3 w-3" /> {formErrors.author}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        Date Updated
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                        <input
                          type="text"
                          value={format(new Date(), "dd MMMM yyyy")}
                          disabled
                          className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 bg-gray-50 text-gray-500 rounded-lg cursor-not-allowed"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Excerpt
                    </label>
                    <textarea
                      value={formData.excerpt}
                      onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                      rows={2}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all resize-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Content *
                    </label>
                    <div className="flex gap-2 mb-2 p-1.5 bg-gray-50 border border-gray-200 rounded-lg flex-wrap items-center">
                      <button
                        type="button"
                        onClick={() => insertFormatting("<strong>", "</strong>", "edit-blog-content-area")}
                        className="px-2.5 py-1 bg-white border border-gray-300 rounded text-xs font-bold text-gray-700 hover:bg-gray-100 cursor-pointer shadow-2xs"
                      >
                        B (Bold)
                      </button>
                      <button
                        type="button"
                        onClick={() => insertFormatting("<span class='font-heading'>", "</span>", "edit-blog-content-area")}
                        className="px-2.5 py-1 bg-white border border-gray-300 rounded text-xs text-gray-700 hover:bg-gray-100 cursor-pointer shadow-2xs font-semibold"
                      >
                        Font: Charm
                      </button>
                      <button
                        type="button"
                        onClick={() => insertFormatting("<span class='font-subheading'>", "</span>", "edit-blog-content-area")}
                        className="px-2.5 py-1 bg-white border border-gray-300 rounded text-xs text-gray-700 hover:bg-gray-100 cursor-pointer shadow-2xs font-semibold"
                      >
                        Font: Cormorant
                      </button>
                    </div>
                    <textarea
                      id="edit-blog-content-area"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={10}
                      className={`w-full px-3 py-3 text-sm border rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-mono ${
                        formErrors.description ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    {formErrors.description && (
                      <p className="text-xs text-red-500 flex items-center gap-1">
                        <X className="h-3 w-3" /> {formErrors.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 shrink-0">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 border border-gray-200 hover:bg-gray-100 text-gray-700 rounded-xl text-sm font-semibold transition-colors bg-white shadow-2xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateBlog}
                disabled={loading}
                className="px-5 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-sm font-semibold shadow-md hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
              >
                {loading ? <Loader2 className="animate-spin h-4 w-4" /> : null}
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Blog Modal */}
      {showDeleteModal && selectedBlog && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-[100] animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-gray-100 overflow-hidden animate-scale-up">
            <div className="p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4 border border-red-100">
                <Trash2 className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Delete Blog Post</h3>
              <p className="text-sm text-gray-500 mt-2">
                Are you sure you want to permanently delete <strong className="text-gray-800">"{selectedBlog.title}"</strong>? This action cannot be undone.
              </p>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-gray-200 hover:bg-gray-100 text-gray-700 rounded-xl text-xs font-semibold bg-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={loading}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold shadow-xs hover:shadow-md transition-all cursor-pointer flex items-center gap-1"
              >
                {loading ? <Loader2 className="animate-spin h-3.5 w-3.5" /> : null}
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Comment Modal */}
      {showCommentDeleteModal && selectedComment && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-[100] animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-gray-100 overflow-hidden animate-scale-up">
            <div className="p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4 border border-red-100">
                <Trash2 className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Delete Comment</h3>
              <p className="text-sm text-gray-500 mt-2">
                Are you sure you want to delete the comment from <strong className="text-gray-800">{selectedComment.name}</strong>?
              </p>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
              <button
                onClick={() => setShowCommentDeleteModal(false)}
                className="px-4 py-2 border border-gray-200 hover:bg-gray-100 text-gray-700 rounded-xl text-xs font-semibold bg-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteCommentConfirm}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold shadow-xs hover:shadow-md transition-all cursor-pointer"
              >
                Delete Comment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBlogs;
