"use client";

import { aboutAPI, AboutDataType } from "@/utils/about.api";
import React, { useState, useEffect } from "react";
import { toast, Toaster } from "react-hot-toast";

const AboutPage = () => {
  const [aboutData, setAboutData] = useState<AboutDataType | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    heroTitle: "",
    heroDescription: "",
    mission: "",
    vision: "",
    stats: [] as { label: string; value: string }[],
    sections: [] as { title: string; content: string; image?: string }[],
  });

  const [previewImages, setPreviewImages] = useState<{ [key: number]: string }>(
    {},
  );

  // Fetch about data
  const fetchAboutData = async (showMessage = false) => {
    try {
      setLoading(true);
      console.log("🔄 Fetching about data...");
      const data = await aboutAPI.getAbout();
      console.log("📦 Received data:", data);

      setAboutData(data);

      if (data) {
        setFormData({
          heroTitle: data.heroTitle || "",
          heroDescription: data.heroDescription || "",
          mission: data.mission || "",
          vision: data.vision || "",
          stats: data.stats || [],
          sections: data.sections || [],
        });
      }

      if (showMessage) {
        toast.success("Data refreshed successfully!");
      }
    } catch (error) {
      console.error("❌ Fetch error:", error);
      toast.error("Failed to fetch about data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAboutData();
  }, []);

  // Handle input change
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle stats
  const handleStatChange = (
    index: number,
    field: "label" | "value",
    value: string,
  ) => {
    const newStats = [...formData.stats];
    newStats[index] = { ...newStats[index], [field]: value };
    setFormData((prev) => ({ ...prev, stats: newStats }));
  };

  const addStat = () => {
    setFormData((prev) => ({
      ...prev,
      stats: [...prev.stats, { label: "", value: "" }],
    }));
  };

  const removeStat = (index: number) => {
    if (formData.stats.length <= 1) {
      toast.error("At least one stat is required");
      return;
    }
    setFormData((prev) => ({
      ...prev,
      stats: prev.stats.filter((_, i) => i !== index),
    }));
  };

  // Handle sections with image
  const handleSectionChange = (
    index: number,
    field: "title" | "content" | "image",
    value: string,
  ) => {
    const newSections = [...formData.sections];
    newSections[index] = { ...newSections[index], [field]: value };
    setFormData((prev) => ({ ...prev, sections: newSections }));
  };

  const addSection = () => {
    setFormData((prev) => ({
      ...prev,
      sections: [...prev.sections, { title: "", content: "", image: "" }],
    }));
  };

  const removeSection = (index: number) => {
    const newSections = formData.sections.filter((_, i) => i !== index);
    setFormData((prev) => ({
      ...prev,
      sections: newSections,
    }));
    // Clean up preview
    const newPreviews = { ...previewImages };
    delete newPreviews[index];
    setPreviewImages(newPreviews);
  };

  // Handle image file selection
  const handleImageSelect = (index: number, file: File) => {
    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    setPreviewImages((prev) => ({ ...prev, [index]: previewUrl }));

    // Convert file to base64 for saving
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      handleSectionChange(index, "image", base64String);
    };
    reader.readAsDataURL(file);
  };

  // Handle update
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Validation
    if (!formData.heroTitle.trim()) {
      toast.error("Hero title is required");
      setLoading(false);
      return;
    }

    try {
      console.log("Sending data:", formData); // Debug log
      const response = await aboutAPI.updateAbout(formData);

      if (response) {
        toast.success("About page updated successfully!");
        setAboutData(response);
        setIsEditing(false);
        setPreviewImages({}); // Clear previews
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update about page");
      console.error("Update error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Clean up preview URLs on unmount
  useEffect(() => {
    return () => {
      Object.values(previewImages).forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previewImages]);

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading about page...</p>
        </div>
      </div>
    );
  }

  // No Data State
  if (!aboutData) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <div className="text-gray-400 mb-4">
              <svg
                className="w-16 h-16 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No About Page Data
            </h3>
            <p className="text-gray-500 mb-6">
              Create your first about page content to get started.
            </p>
            <button
              onClick={() => {
                const defaultData = {
                  heroTitle: "About Us",
                  heroDescription: "Learn more about our mission and vision.",
                  mission: "",
                  vision: "",
                  stats: [{ label: "Happy Clients", value: "1000+" }],
                  sections: [{ title: "Our Story", content: "", image: "" }],
                };
                setFormData(defaultData as any);
                setIsEditing(true);
              }}
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition shadow-md"
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
                  strokeWidth="2"
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Create About Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main Render - API Data
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <Toaster position="top-right" />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
              📄 About Page Management
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              View and manage your about page content
            </p>
          </div>

          <div className="flex gap-2">
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition flex items-center gap-2 shadow-sm"
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
                    strokeWidth="2"
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                <span>Edit Page</span>
              </button>
            )}

            <button
              onClick={() => fetchAboutData(true)}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition flex items-center gap-2 shadow-sm"
              title="Refresh data"
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
                  strokeWidth="2"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </button>
          </div>
        </div>



        {/* View Mode */}
        {!isEditing && aboutData && (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            {/* Hero Section */}
            <div className="relative h-64 bg-gradient-to-r from-blue-600 to-purple-600">
              <div className="absolute inset-0 bg-black opacity-50"></div>
              <div className="absolute inset-0 flex items-center justify-center text-center p-6">
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
                    {aboutData.heroTitle}
                  </h1>
                  <p className="text-lg text-white max-w-2xl">
                    {aboutData.heroDescription}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 md:p-8 space-y-8">
              {/* Mission & Vision Cards */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <svg
                        className="w-5 h-5 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-blue-800">
                      Our Mission
                    </h3>
                  </div>
                  <p className="text-gray-700 leading-relaxed">
                    {aboutData.mission}
                  </p>
                </div>

                <div className="bg-green-50 p-6 rounded-xl border border-green-100">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <svg
                        className="w-5 h-5 text-green-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-green-800">
                      Our Vision
                    </h3>
                  </div>
                  <p className="text-gray-700 leading-relaxed">
                    {aboutData.vision}
                  </p>
                </div>
              </div>

              {/* Stats Section */}
              {aboutData.stats && aboutData.stats.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <svg
                      className="w-5 h-5 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                    Key Statistics
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {aboutData.stats.map((stat, index) => (
                      <div
                        key={stat._id || index}
                        className="bg-gray-50 p-4 rounded-lg text-center border border-gray-100 hover:shadow-md transition"
                      >
                        <div className="text-2xl md:text-3xl font-bold text-blue-600 mb-1">
                          {stat.value}
                        </div>
                        <div className="text-sm text-gray-600">
                          {stat.label}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Additional Sections with Images */}
              {aboutData.sections && aboutData.sections.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <svg
                      className="w-5 h-5 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M4 6h16M4 12h16M4 18h7"
                      />
                    </svg>
                    More Information
                  </h3>
                  <div className="space-y-6">
                    {aboutData.sections.map((section, index) => (
                      <div
                        key={section._id || index}
                        className="bg-white rounded-lg overflow-hidden border border-gray-200 shadow-sm"
                      >
                        {section.image && (
                          <div className="relative h-64 w-full bg-gray-100">
                            <img
                              src={section.image}
                              alt={section.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.currentTarget;
                                const svgPlaceholder = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='800' height='400' viewBox='0 0 800 400'><rect width='100%' height='100%' fill='%23f3f4f6'/><path d='M400 170c16.57 0 30-13.43 30-30s-13.43-30-30-30-30 13.43-30 30 13.43 30 30 30zm0 20c-33.14 0-60-26.86-60-60s26.86-60 60-60 60 26.86 60 60-26.86 60-60 60zm0 30c-55.23 0-100 44.77-100 100h200c0-55.23-44.77-100-100-100z' fill='%239ca3af'/><text x='50%' y='85%' dominant-baseline='middle' text-anchor='middle' font-family='system-ui, sans-serif' font-size='18' font-weight='500' fill='%236b7280'>Image Not Found</text></svg>";
                                if (target.src !== svgPlaceholder) {
                                  target.src = svgPlaceholder;
                                }
                              }}
                            />
                          </div>
                        )}
                        <div className="p-6">
                          <h4 className="font-semibold text-gray-800 mb-2 text-lg">
                            {section.title}
                          </h4>
                          <p className="text-gray-600 leading-relaxed">
                            {section.content}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Metadata Footer */}
              {(aboutData.createdAt || aboutData.updatedAt) && (
                <div className="border-t pt-4 mt-4">
                  <p className="text-xs text-gray-400 flex items-center gap-1">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Last updated:{" "}
                    {new Date(aboutData.updatedAt!).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Edit Mode Modal */}
        {isEditing && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <svg
                    className="w-6 h-6 text-yellow-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                  Edit About Page
                </h2>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    if (aboutData) {
                      setFormData({
                        heroTitle: aboutData.heroTitle || "",
                        heroDescription: aboutData.heroDescription || "",
                        mission: aboutData.mission || "",
                        vision: aboutData.vision || "",
                        stats: aboutData.stats || [],
                        sections: aboutData.sections || [],
                      });
                    }
                  }}
                  className="text-gray-500 hover:text-gray-700"
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
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleUpdate} className="p-6 space-y-6">
                {/* Hero Section */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-700 border-b pb-2">
                    Hero Section
                  </h3>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Hero Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="heroTitle"
                      value={formData.heroTitle}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter hero title"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Hero Description
                    </label>
                    <textarea
                      name="heroDescription"
                      value={formData.heroDescription}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter hero description"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mission
                    </label>
                    <textarea
                      name="mission"
                      value={formData.mission}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter mission statement"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Vision
                    </label>
                    <textarea
                      name="vision"
                      value={formData.vision}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter vision statement"
                    />
                  </div>
                </div>

                {/* Stats */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Statistics
                    </label>
                    <button
                      type="button"
                      onClick={addStat}
                      className="text-sm bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-600 transition flex items-center gap-1"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                      Add Stat
                    </button>
                  </div>

                  <div className="space-y-2">
                    {formData.stats.map((stat, index) => (
                      <div key={index} className="flex gap-2 items-center">
                        <input
                          type="text"
                          value={stat.label}
                          onChange={(e) =>
                            handleStatChange(index, "label", e.target.value)
                          }
                          placeholder="Label (e.g., Projects)"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                          type="text"
                          value={stat.value}
                          onChange={(e) =>
                            handleStatChange(index, "value", e.target.value)
                          }
                          placeholder="Value (e.g., 1200+)"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                          type="button"
                          onClick={() => removeStat(index)}
                          className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
                          title="Remove stat"
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
                              strokeWidth="2"
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sections with Image Upload */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Additional Sections (with Images)
                    </label>
                    <button
                      type="button"
                      onClick={addSection}
                      className="text-sm bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-600 transition flex items-center gap-1"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                      Add Section
                    </button>
                  </div>

                  <div className="space-y-4">
                    {formData.sections.map((section, index) => (
                      <div
                        key={index}
                        className="border rounded-lg p-4 bg-gray-50"
                      >
                        <div className="flex justify-between items-center mb-3">
                          <h4 className="font-medium text-gray-700">
                            Section {index + 1}
                          </h4>
                          <button
                            type="button"
                            onClick={() => removeSection(index)}
                            className="text-red-500 hover:text-red-700"
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
                                strokeWidth="2"
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </div>

                        {/* Title Input */}
                        <input
                          type="text"
                          value={section.title}
                          onChange={(e) =>
                            handleSectionChange(index, "title", e.target.value)
                          }
                          placeholder="Section Title (e.g., Our Journey)"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 mb-2"
                        />

                        {/* Content Textarea */}
                        <textarea
                          value={section.content}
                          onChange={(e) =>
                            handleSectionChange(
                              index,
                              "content",
                              e.target.value,
                            )
                          }
                          placeholder="Section Content (e.g., Started small, now global)"
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 mb-3"
                        />

                        {/* Image Upload - Direct to same API */}
                        <div className="space-y-3">
                          <label className="block text-sm font-medium text-gray-700">
                            Section Image
                          </label>

                          {/* Image Preview */}
                          {(section.image || previewImages[index]) && (
                            <div className="relative w-full h-40 mb-2 rounded-lg overflow-hidden border border-gray-200 bg-white">
                              <img
                                src={previewImages[index] || section.image}
                                alt="Preview"
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  const target = e.currentTarget;
                                  const svgPlaceholder = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='200' viewBox='0 0 400 200'><rect width='100%' height='100%' fill='%23f3f4f6'/><path d='M200 85c8.28 0 15-6.72 15-15s-6.72-15-15-15-15 6.72-15 15 6.72 15 15 15zm0 10c-16.57 0-30-13.43-30-30s13.43-30 30-30 30 13.43 30 30-13.43 30-30 30zm0 15c-27.61 0-50 22.39-50 50h100c0-27.61-22.39-50-50-50z' fill='%239ca3af'/><text x='50%' y='85%' dominant-baseline='middle' text-anchor='middle' font-family='system-ui, sans-serif' font-size='14' font-weight='500' fill='%236b7280'>Invalid Image</text></svg>";
                                  if (target.src !== svgPlaceholder) {
                                    target.src = svgPlaceholder;
                                  }
                                }}
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  handleSectionChange(index, "image", "");
                                  const newPreviews = { ...previewImages };
                                  delete newPreviews[index];
                                  setPreviewImages(newPreviews);
                                }}
                                className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 shadow-lg transition"
                                title="Remove image"
                              >
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M6 18L18 6M6 6l12 12"
                                  />
                                </svg>
                              </button>
                            </div>
                          )}

                          {/* Two Ways to Add Image */}
                          <div className="space-y-3">
                            {/* Option 1: Manual URL */}
                            <div>
                              <p className="text-xs text-gray-500 mb-1">
                                Option 1: Enter Image URL
                              </p>
                              <input
                                type="text"
                                value={section.image || ""}
                                onChange={(e) => {
                                  handleSectionChange(
                                    index,
                                    "image",
                                    e.target.value,
                                  );
                                  // Clear preview if user starts typing URL
                                  if (previewImages[index]) {
                                    const newPreviews = { ...previewImages };
                                    delete newPreviews[index];
                                    setPreviewImages(newPreviews);
                                  }
                                }}
                                placeholder="Enter image URL (e.g., /uploads/journey.jpg)"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                              />
                            </div>

                            {/* Option 2: File Upload - Direct to same API */}
                            <div>
                              <p className="text-xs text-gray-500 mb-1">
                                Option 2: Upload Image File
                              </p>
                              <div className="flex items-center gap-2">
                                <input
                                  type="file"
                                  id={`image-upload-${index}`}
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      handleImageSelect(index, file);
                                    }
                                  }}
                                />
                                <label
                                  htmlFor={`image-upload-${index}`}
                                  className="cursor-pointer bg-blue-50 hover:bg-blue-100 text-blue-700 px-4 py-2 rounded-lg border border-blue-200 flex items-center gap-2"
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
                                      strokeWidth="2"
                                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                                    />
                                  </svg>
                                  Choose File
                                </label>
                                <span className="text-sm text-gray-500">
                                  PNG, JPG, GIF (Max 15MB)
                                </span>
                              </div>
                              <p className="text-xs text-gray-400 mt-1">
                                Image will be converted to base64 and saved with
                                the section data
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex gap-3 pt-4 border-t">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
                        Saving...
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
                            strokeWidth="2"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        Save Changes
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      if (aboutData) {
                        setFormData({
                          heroTitle: aboutData.heroTitle || "",
                          heroDescription: aboutData.heroDescription || "",
                          mission: aboutData.mission || "",
                          vision: aboutData.vision || "",
                          stats: aboutData.stats || [],
                          sections: aboutData.sections || [],
                        });
                      }
                    }}
                    className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AboutPage;
