// app/view-testimonials/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { fetchData, putData, deleteData } from "@/utils/api";
import { toast, Toaster } from "react-hot-toast";
import {
  FiStar,
  FiCalendar,
  FiEdit2,
  FiTrash2,
  FiUser,
  FiZap,
  FiMessageSquare,
  FiPlus,
  FiRefreshCw,
  FiSearch,
  FiFilter,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

interface Testimonial {
  id: number;
  name: string;
  zodiac: string;
  rating: number;
  comment: string;
  date: string;
  [key: string]: any; // For additional fields
}

const ViewTestimonials = () => {
  const router = useRouter();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [filteredTestimonials, setFilteredTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editFormData, setEditFormData] = useState<Omit<Testimonial, "id">>({
    name: "",
    zodiac: "",
    rating: 5,
    comment: "",
    date: "",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRating, setFilterRating] = useState<number | "all">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);

  const zodiacSigns = [
    { value: "Aries", emoji: "♈", label: "Aries" },
    { value: "Taurus", emoji: "♉", label: "Taurus" },
    { value: "Gemini", emoji: "♊", label: "Gemini" },
    { value: "Cancer", emoji: "♋", label: "Cancer" },
    { value: "Leo", emoji: "♌", label: "Leo" },
    { value: "Virgo", emoji: "♍", label: "Virgo" },
    { value: "Libra", emoji: "♎", label: "Libra" },
    { value: "Scorpio", emoji: "♏", label: "Scorpio" },
    { value: "Sagittarius", emoji: "♐", label: "Sagittarius" },
    { value: "Capricorn", emoji: "♑", label: "Capricorn" },
    { value: "Aquarius", emoji: "♒", label: "Aquarius" },
    { value: "Pisces", emoji: "♓", label: "Pisces" },
  ];

  // Fetch testimonials
  const fetchTestimonials = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await fetchData<Testimonial[]>("/testimonials");
      console.log("Fetched testimonials:", response);
      setTestimonials(response);
      setFilteredTestimonials(response);
    } catch (err: any) {
      console.error("Fetch error:", err);
      setError(err.response?.data?.message || "Failed to fetch testimonials");
    } finally {
      setLoading(false);
    }
  };

  // Apply filters
  useEffect(() => {
    let filtered = [...testimonials];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (t) =>
          t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          t.comment.toLowerCase().includes(searchTerm.toLowerCase()) ||
          t.zodiac.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Rating filter
    if (filterRating !== "all") {
      filtered = filtered.filter((t) => t.rating === filterRating);
    }

    setFilteredTestimonials(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [searchTerm, filterRating, testimonials]);

  // Initial fetch
  useEffect(() => {
    fetchTestimonials();
  }, []);

  // Check authentication
  useEffect(() => {
    const checkAuth = () => {
      if (typeof window !== "undefined") {
        const token = localStorage.getItem("token");
        if (!token) {
          router.push("/login");
        }
      }
    };
    checkAuth();
  }, [router]);

  // Delete testimonial
  const handleDelete = async (id: number) => {
    try {
      await deleteData(`/testimonials/${id}`);
      toast.success("🗑️ Testimonial deleted successfully!");
      await fetchTestimonials();
      setShowDeleteConfirm(null);
    } catch (err: any) {
      console.error("Delete error:", err);
      toast.error(err.response?.data?.message || "Failed to delete testimonial");
    }
  };

  // Save edited testimonial
  const saveEdit = async () => {
    if (!editingId) return;

    try {
      await putData(`/testimonials/${editingId}`, editFormData);
      toast.success("✨ Testimonial updated successfully!");
      setEditingId(null);
      await fetchTestimonials();
    } catch (err: any) {
      console.error("Update error:", err);
      toast.error(err.response?.data?.message || "Failed to update testimonial");
    }
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingId(null);
  };

  // Start editing
  const startEditing = (testimonial: Testimonial) => {
    setEditingId(testimonial.id);
    setEditFormData({
      name: testimonial.name,
      zodiac: testimonial.zodiac,
      rating: testimonial.rating,
      comment: testimonial.comment,
      date: testimonial.date,
    });
  };

  // Get zodiac emoji
  const getZodiacEmoji = (sign: string) => {
    const zodiac = zodiacSigns.find((z) => z.value === sign);
    return zodiac ? zodiac.emoji : "⭐";
  };

  // Render stars
  const renderStars = (rating: number) => {
    return Array(5)
      .fill(0)
      .map((_, i) => (
        <FiStar
          key={i}
          className={`w-4 h-4 ${i < rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`}
        />
      ));
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredTestimonials.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredTestimonials.length / itemsPerPage);

  // Loading skeleton
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4">
        <div className="max-w-7xl mx-auto">
          {/* Header skeleton */}
          <div className="h-32 bg-white/50 rounded-2xl mb-8 animate-pulse" />
          
          {/* Grid skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                className="bg-white/50 rounded-2xl p-6 animate-pulse"
              >
                <div className="space-y-4">
                  <div className="h-6 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                  <div className="h-20 bg-gray-200 rounded" />
                  <div className="h-4 bg-gray-200 rounded w-1/4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <Toaster position="top-right" />
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />

      <div className="container mx-auto px-4 py-8 relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-7xl mx-auto mb-8"
        >
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                Customer Testimonials
              </h1>
              <p className="text-gray-600">
                See what our clients have to say about their experiences
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => router.push("/dashboard/testimonial/add")}
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg transition-all duration-300 group"
              >
                <FiPlus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                Add New Testimonial
              </button>
              <button
                onClick={fetchTestimonials}
                className="flex items-center justify-center gap-2 border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-xl font-medium hover:bg-gray-50 transition-all duration-300"
              >
                <FiRefreshCw className="w-5 h-5" />
                Refresh
              </button>
            </div>
          </div>

          {/* Stats Card */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-sm">
              <div className="text-3xl font-bold text-gray-800">{testimonials.length}</div>
              <div className="text-gray-500 text-sm">Total Testimonials</div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-sm">
              <div className="text-3xl font-bold text-gray-800">
                {testimonials.length > 0
                  ? (testimonials.reduce((acc, t) => acc + t.rating, 0) / testimonials.length).toFixed(1)
                  : "0.0"}
              </div>
              <div className="text-gray-500 text-sm">Average Rating</div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-sm">
              <div className="text-3xl font-bold text-gray-800">
                {[...new Set(testimonials.map((t) => t.zodiac))].length}
              </div>
              <div className="text-gray-500 text-sm">Zodiac Signs</div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-sm">
              <div className="text-3xl font-bold text-gray-800">
                {testimonials.filter((t) => t.rating === 5).length}
              </div>
              <div className="text-gray-500 text-sm">5-Star Reviews</div>
            </div>
          </div>
        </motion.div>

        {/* Filters & Search */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-7xl mx-auto mb-8"
        >
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Search */}
              <div className="relative">
                <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search testimonials..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                />
              </div>

              {/* Rating Filter */}
              <div className="relative">
                <FiFilter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  value={filterRating}
                  onChange={(e) => setFilterRating(e.target.value === "all" ? "all" : parseInt(e.target.value))}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none cursor-pointer transition-all duration-300"
                >
                  <option value="all">All Ratings</option>
                  <option value="5">⭐⭐⭐⭐⭐ (5 Stars)</option>
                  <option value="4">⭐⭐⭐⭐ (4 Stars)</option>
                  <option value="3">⭐⭐⭐ (3 Stars)</option>
                  <option value="2">⭐⭐ (2 Stars)</option>
                  <option value="1">⭐ (1 Star)</option>
                </select>
              </div>

              {/* Results Count */}
              <div className="flex items-center justify-between md:justify-end">
                <span className="text-gray-600">
                  Showing {filteredTestimonials.length} of {testimonials.length} testimonials
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-7xl mx-auto mb-8"
          >
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-red-600 font-bold">!</span>
                </div>
                <div>
                  <h3 className="font-medium text-red-800">Error Loading Testimonials</h3>
                  <p className="text-red-600">{error}</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Testimonials Grid */}
        <div className="max-w-7xl mx-auto">
          {filteredTestimonials.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-16"
            >
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <FiMessageSquare className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-700 mb-3">No Testimonials Found</h3>
              <p className="text-gray-500 mb-8 max-w-md mx-auto">
                {searchTerm || filterRating !== "all"
                  ? "No testimonials match your search criteria. Try adjusting your filters."
                  : "Be the first to share your experience!"}
              </p>
              <button
                onClick={() => router.push("/add-testimonial")}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-xl font-medium hover:shadow-lg transition-all duration-300"
              >
                <FiPlus className="w-5 h-5" />
                Add First Testimonial
              </button>
            </motion.div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <AnimatePresence>
                  {currentItems.map((testimonial, index) => (
                    <motion.div
                      key={testimonial.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ delay: index * 0.1 }}
                      layout
                      className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group"
                    >
                      {editingId === testimonial.id ? (
                        // Edit Form
                        <div className="p-6">
                          <div className="space-y-4">
                            <input
                              type="text"
                              value={editFormData.name}
                              onChange={(e) =>
                                setEditFormData({ ...editFormData, name: e.target.value })
                              }
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Name"
                            />
                            <select
                              value={editFormData.zodiac}
                              onChange={(e) =>
                                setEditFormData({ ...editFormData, zodiac: e.target.value })
                              }
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                              <option value="">Select Zodiac</option>
                              {zodiacSigns.map((sign) => (
                                <option key={sign.value} value={sign.value}>
                                  {sign.emoji} {sign.label}
                                </option>
                              ))}
                            </select>
                            <div className="flex space-x-2">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                  key={star}
                                  type="button"
                                  onClick={() =>
                                    setEditFormData({ ...editFormData, rating: star })
                                  }
                                  className={`text-2xl ${
                                    editFormData.rating >= star
                                      ? "text-yellow-500"
                                      : "text-gray-300"
                                  }`}
                                >
                                  ★
                                </button>
                              ))}
                            </div>
                            <textarea
                              value={editFormData.comment}
                              onChange={(e) =>
                                setEditFormData({ ...editFormData, comment: e.target.value })
                              }
                              rows={3}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                              placeholder="Testimonial"
                            />
                            <input
                              type="date"
                              value={editFormData.date}
                              onChange={(e) =>
                                setEditFormData({ ...editFormData, date: e.target.value })
                              }
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <div className="flex space-x-2 pt-4">
                              <button
                                onClick={saveEdit}
                                className="flex-1 bg-green-600 text-white py-2 rounded-lg font-medium hover:bg-green-700 transition-colors"
                              >
                                Save
                              </button>
                              <button
                                onClick={cancelEdit}
                                className="flex-1 bg-gray-600 text-white py-2 rounded-lg font-medium hover:bg-gray-700 transition-colors"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        // Display Card
                        <>
                          <div className="p-6">
                            {/* Header */}
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                  <FiUser className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                  <h3 className="font-bold text-gray-800 text-lg">
                                    {testimonial.name}
                                  </h3>
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className="text-2xl">
                                      {getZodiacEmoji(testimonial.zodiac)}
                                    </span>
                                    <span className="text-gray-600 text-sm">
                                      {testimonial.zodiac}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="text-yellow-500 flex items-center gap-1">
                                {renderStars(testimonial.rating)}
                                <span className="text-gray-700 font-bold ml-1">
                                  {testimonial.rating}.0
                                </span>
                              </div>
                            </div>

                            {/* Comment */}
                            <div className="mb-6">
                              <div className="relative">
                                <FiMessageSquare className="absolute left-0 top-1 w-5 h-5 text-gray-400" />
                                <p className="pl-7 text-gray-600 italic line-clamp-3">
                                  "{testimonial.comment}"
                                </p>
                              </div>
                            </div>

                            {/* Footer */}
                            <div className="flex items-center justify-between pt-4 border-t">
                              <div className="flex items-center gap-2 text-gray-500">
                                <FiCalendar className="w-4 h-4" />
                                <span className="text-sm">
                                  {new Date(testimonial.date).toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                  })}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => startEditing(testimonial)}
                                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                  title="Edit"
                                >
                                  <FiEdit2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => setShowDeleteConfirm(testimonial.id)}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Delete"
                                >
                                  <FiTrash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Gradient Border Effect */}
                          <div className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                  >
                    <FiChevronLeft className="w-5 h-5" />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-10 h-10 rounded-lg font-medium transition-all duration-300 ${
                        currentPage === page
                          ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                          : "border border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                  >
                    <FiChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowDeleteConfirm(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiTrash2 className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Delete Testimonial</h3>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to delete this testimonial? This action cannot be
                  undone.
                </p>
                <div className="flex gap-4">
                  <button
                    onClick={() => setShowDeleteConfirm(null)}
                    className="flex-1 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDelete(showDeleteConfirm)}
                    className="flex-1 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-xl font-medium hover:shadow-lg transition-all duration-300"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ViewTestimonials;