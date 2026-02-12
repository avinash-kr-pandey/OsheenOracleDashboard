"use client";

import { aboutAPI, AboutDataType } from "@/utils/about.api";
import React, { useState, useEffect } from "react";

const ViewPage = () => {
  const [aboutData, setAboutData] = useState<AboutDataType | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<AboutDataType | null>(null);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // GET: Load about data
  const loadAboutData = async () => {
    try {
      setLoading(true);
      const data = await aboutAPI.getAbout();
      setAboutData(data);
    } catch (error) {
      console.error("Load about error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAboutData();
  }, []);

  // Start editing
  const handleEdit = () => {
    if (aboutData) {
      setEditForm({ ...aboutData });
      setIsEditing(true);
    }
  };

  // Handle edit form change
  const handleEditChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setEditForm((prev) => (prev ? { ...prev, [name]: value } : null));
  };

  // PUT: Save updates
  const handleSaveUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm) return;

    setLoading(true);
    setMessage(null);

    try {
      const updatedData = {
        title: editForm.title,
        description: editForm.description,
        content: editForm.content,
        image: editForm.image,
        updatedAt: new Date().toISOString(),
      };

      const savedData = await aboutAPI.updateAbout(updatedData);

      if (savedData) {
        setAboutData(savedData);
        setMessage({
          type: "success",
          text: "✅ About page updated successfully!",
        });
        setIsEditing(false);
        setEditForm(null);

        // Auto hide message after 3 seconds
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (error: any) {
      setMessage({
        type: "error",
        text:
          error.response?.data?.message || "❌ Failed to update about page.",
      });
      console.error("Update error:", error);

      // Auto hide message after 3 seconds
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditForm(null);
  };

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

  if (!aboutData) {
    return null; // Or redirect to add page
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">📖 About Page</h1>
          {!isEditing && (
            <button
              onClick={handleEdit}
              className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white py-2 px-6 rounded-lg font-semibold hover:from-yellow-600 hover:to-yellow-700 transition flex items-center gap-2"
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
              Edit Page
            </button>
          )}
        </div>

        {/* Message */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              message.type === "success"
                ? "bg-green-50 text-green-800 border border-green-200"
                : "bg-red-50 text-red-800 border border-red-200"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Edit Modal */}
        {isEditing && editForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-800">
                    ✏️ Edit About Page
                  </h2>
                  <button
                    onClick={handleCancelEdit}
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

                <form onSubmit={handleSaveUpdate} className="space-y-4">
                  {/* Title */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={editForm.title}
                      onChange={handleEditChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="description"
                      value={editForm.description}
                      onChange={handleEditChange}
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  {/* Content */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Content <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="content"
                      value={editForm.content}
                      onChange={handleEditChange}
                      rows={6}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  {/* Image Preview - Read Only */}
                  {editForm.image && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Current Image
                      </label>
                      <div className="relative w-48 h-32 border rounded-lg overflow-hidden bg-gray-50">
                        <img
                          src={editForm.image}
                          alt="About"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        Image cannot be changed. Create a new about page to
                        upload a different image.
                      </p>
                    </div>
                  )}

                  {/* Buttons */}
                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2 px-4 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 transition"
                    >
                      {loading ? (
                        <span className="flex items-center justify-center gap-2">
                          <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
                          Updating...
                        </span>
                      ) : (
                        "Save Changes"
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg font-semibold hover:bg-gray-300 transition"
                    >
                      Cancel
                    </button>
                  </div>
                </form>

                {/* API Info */}
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <div className="text-xs text-gray-500">
                    <span className="font-semibold">API:</span> PUT /api/about
                    <br />
                    <span className="font-semibold">Authentication:</span>{" "}
                    Bearer Token (auto-injected)
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* About Page Content */}
        {!isEditing && aboutData && (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {/* Hero Image */}
            {aboutData.image && (
              <div className="relative h-80 w-full bg-gray-100">
                <img
                  src={aboutData.image}
                  alt={aboutData.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Content */}
            <div className="p-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">
                {aboutData.title}
              </h2>

              <div className="prose max-w-none">
                {/* Description */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">
                    Description
                  </h3>
                  <p className="text-gray-600 whitespace-pre-wrap leading-relaxed">
                    {aboutData.description}
                  </p>
                </div>

                {/* Content */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">
                    Content
                  </h3>
                  <div className="text-gray-600 whitespace-pre-wrap leading-relaxed">
                    {aboutData.content}
                  </div>
                </div>

                {/* Metadata */}
                <div className="border-t pt-6 mt-6">
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-500">
                    {aboutData.createdAt && (
                      <div className="flex items-center gap-2">
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
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        <span>
                          Created:{" "}
                          {new Date(aboutData.createdAt).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            },
                          )}
                        </span>
                      </div>
                    )}
                    {aboutData.updatedAt && (
                      <div className="flex items-center gap-2">
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
                        <span>
                          Updated:{" "}
                          {new Date(aboutData.updatedAt).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            },
                          )}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewPage;
