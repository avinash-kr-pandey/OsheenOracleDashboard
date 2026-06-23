// app/add-testimonial/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { postData } from "@/utils/api";
import { toast, Toaster } from "react-hot-toast";
import { FiUser, FiStar, FiCalendar, FiMessageSquare, FiZap, FiArrowLeft, FiSend, FiCheckCircle } from "react-icons/fi";
import { motion } from "framer-motion";

const AddTestimonial = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    zodiac: "",
    rating: 5,
    comment: "",
    date: new Date().toISOString().split("T")[0],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [selectedRating, setSelectedRating] = useState(5);

  const zodiacSigns = [
    { value: "Aries", emoji: "♈", label: "Aries (मेष)" },
    { value: "Taurus", emoji: "♉", label: "Taurus (वृषभ)" },
    { value: "Gemini", emoji: "♊", label: "Gemini (मिथुन)" },
    { value: "Cancer", emoji: "♋", label: "Cancer (कर्क)" },
    { value: "Leo", emoji: "♌", label: "Leo (सिंह)" },
    { value: "Virgo", emoji: "♍", label: "Virgo (कन्या)" },
    { value: "Libra", emoji: "♎", label: "Libra (तुला)" },
    { value: "Scorpio", emoji: "♏", label: "Scorpio (वृश्चिक)" },
    { value: "Sagittarius", emoji: "♐", label: "Sagittarius (धनु)" },
    { value: "Capricorn", emoji: "♑", label: "Capricorn (मकर)" },
    { value: "Aquarius", emoji: "♒", label: "Aquarius (कुम्भ)" },
    { value: "Pisces", emoji: "♓", label: "Pisces (मीन)" },
  ];

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "rating" ? parseInt(value) : value,
    }));
    if (name === "rating") {
      setSelectedRating(parseInt(value));
    }
    if (error) setError("");
  };

  const handleRatingClick = (rating: number) => {
    setFormData((prev) => ({ ...prev, rating }));
    setSelectedRating(rating);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Basic validation
    if (!formData.name.trim()) {
      setError("Please enter your name");
      toast.error("Please enter your name");
      setLoading(false);
      return;
    }
    if (!formData.comment.trim()) {
      setError("Please enter your testimonial");
      toast.error("Please enter your testimonial");
      setLoading(false);
      return;
    }

    try {
      const testimonialData = {
        name: formData.name,
        zodiac: formData.zodiac,
        rating: formData.rating,
        comment: formData.comment,
        date: formData.date,
      };

      console.log("Submitting testimonial:", testimonialData);
      const response = await postData("/testimonials", testimonialData);
      
      console.log("Response:", response);
      toast.success("🎉 Testimonial submitted successfully!");
      setSuccess(true);
      
      // Reset form
      setFormData({
        name: "",
        zodiac: "",
        rating: 5,
        comment: "",
        date: new Date().toISOString().split("T")[0],
      });
      setSelectedRating(5);
      
      // Auto redirect after 2 seconds
      setTimeout(() => {
        router.push("/view-testimonials");
      }, 2000);
      
    } catch (err: any) {
      console.error("Error adding testimonial:", err);
      const errMsg = err.response?.data?.message ||
        err.message ||
        "Failed to add testimonial. Please try again.";
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

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

  // Form animations
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center"
        >
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FiCheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">Success!</h2>
          <p className="text-gray-600 mb-6">
            Your testimonial has been submitted successfully.
          </p>
          <div className="space-y-3">
            <div className="animate-pulse text-sm text-gray-500">
              Redirecting to testimonials page...
            </div>
            <button
              onClick={() => router.push("/view-testimonials")}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-medium hover:shadow-lg transition-all duration-300"
            >
              Go to Testimonials
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Toaster position="top-right" />
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />

      <div className="container mx-auto px-4 py-8 relative">
        {/* Header */}
        <div className="max-w-6xl mx-auto mb-8">
          <button
            onClick={() => router.push("/view-testimonials")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
          >
            <FiArrowLeft className="w-5 h-5" />
            <span>Back to Testimonials</span>
          </button>

          <div className="text-center mb-10">
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4"
            >
              Share Your Experience
            </motion.h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Your feedback helps us improve and inspires others on their journey.
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-3xl mx-auto">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-6 md:p-8"
          >
            {/* Form Header */}
            <div className="flex items-center gap-3 mb-8 pb-6 border-b">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                <FiMessageSquare className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Testimonial Form</h2>
                <p className="text-gray-500">Fill in your details below</p>
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                    <span className="text-red-600 font-bold">!</span>
                  </div>
                  <p className="text-red-700">{error}</p>
                </div>
              </motion.div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Name Field */}
                <motion.div variants={itemVariants} className="space-y-2">
                  <label className="flex items-center gap-2 text-gray-700 font-medium">
                    <FiUser className="w-4 h-4" />
                    Full Name *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                      placeholder="John Doe"
                    />
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                      <FiUser className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                </motion.div>

                {/* Zodiac Field */}
                <motion.div variants={itemVariants} className="space-y-2">
                  <label className="flex items-center gap-2 text-gray-700 font-medium">
                    <FiZap className="w-4 h-4" />
                    Zodiac Sign *
                  </label>
                  <div className="relative">
                    <select
                      name="zodiac"
                      value={formData.zodiac}
                      onChange={handleChange}
                      required
                      className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none cursor-pointer transition-all duration-300"
                    >
                      <option value="">Select your zodiac sign</option>
                      {zodiacSigns.map((sign) => (
                        <option key={sign.value} value={sign.value}>
                          {sign.emoji} {sign.label}
                        </option>
                      ))}
                    </select>
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      <FiZap className="w-5 h-5 text-gray-400" />
                    </div>
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </motion.div>

                {/* Rating Field */}
                <motion.div variants={itemVariants} className="md:col-span-2 space-y-4">
                  <label className="flex items-center gap-2 text-gray-700 font-medium">
                    <FiStar className="w-4 h-4 text-yellow-500" />
                    Rating *
                  </label>
                  <div className="flex flex-col space-y-4">
                    <div className="flex items-center justify-center space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => handleRatingClick(star)}
                          className={`p-2 transform transition-all duration-300 ${
                            selectedRating >= star
                              ? "scale-110 text-yellow-500"
                              : "text-gray-300 hover:text-yellow-400"
                          }`}
                        >
                          <FiStar className="w-8 h-8" />
                        </button>
                      ))}
                    </div>
                    <div className="text-center">
                      <span className="text-2xl font-bold text-gray-800">
                        {selectedRating}.0
                      </span>
                      <span className="text-gray-500 ml-2">
                        {selectedRating === 5
                          ? "Excellent"
                          : selectedRating === 4
                          ? "Good"
                          : selectedRating === 3
                          ? "Average"
                          : selectedRating === 2
                          ? "Poor"
                          : "Very Poor"}
                      </span>
                    </div>
                    <input
                      type="range"
                      name="rating"
                      min="1"
                      max="5"
                      value={formData.rating}
                      onChange={handleChange}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gradient-to-r [&::-webkit-slider-thumb]:from-blue-600 [&::-webkit-slider-thumb]:to-purple-600"
                    />
                  </div>
                </motion.div>

                {/* Comment Field */}
                <motion.div variants={itemVariants} className="md:col-span-2 space-y-2">
                  <label className="flex items-center gap-2 text-gray-700 font-medium">
                    <FiMessageSquare className="w-4 h-4" />
                    Your Testimonial *
                  </label>
                  <div className="relative">
                    <textarea
                      name="comment"
                      value={formData.comment}
                      onChange={handleChange}
                      required
                      rows={5}
                      className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 resize-none"
                      placeholder="Share your experience with us..."
                    />
                    <div className="absolute left-4 top-4">
                      <FiMessageSquare className="w-5 h-5 text-gray-400" />
                    </div>
                    <div className="absolute bottom-3 right-3 text-xs text-gray-400">
                      {formData.comment.length}/500
                    </div>
                  </div>
                  <p className="text-sm text-gray-500">
                    Share how our services helped you. Your story matters!
                  </p>
                </motion.div>

                {/* Date Field */}
                <motion.div variants={itemVariants} className="space-y-2">
                  <label className="flex items-center gap-2 text-gray-700 font-medium">
                    <FiCalendar className="w-4 h-4" />
                    Date *
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                      required
                      className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                    />
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                      <FiCalendar className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Action Buttons */}
              <motion.div
                variants={itemVariants}
                className="flex flex-col sm:flex-row gap-4 pt-6 border-t"
              >
                <button
                  type="submit"
                  disabled={loading}
                  className={`flex-1 py-4 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-3 ${
                    loading
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl"
                  }`}
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span className="text-white">Submitting...</span>
                    </>
                  ) : (
                    <>
                      <FiSend className="w-5 h-5" />
                      <span className="text-white">Submit Testimonial</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => router.push("/dashboard/testimonial/view")}
                  className="py-4 px-8 border-2 border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 hover:border-gray-400 transition-all duration-300"
                >
                  View All Testimonials
                  
                </button>
              </motion.div>
            </form>

            {/* Info Box */}
            <motion.div
              variants={itemVariants}
              className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100"
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FiStar className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-800 mb-1">
                    Why share your testimonial?
                  </h3>
                  <p className="text-sm text-gray-600">
                    Your honest feedback helps others make informed decisions and helps us
                    improve our services. We appreciate every testimonial!
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AddTestimonial;