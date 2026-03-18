// pages/admin/AdminSpells.tsx

"use client";
import { CreateSpellTypeData, spellsAPI, SpellType } from "@/utils/spells.api";
import React, { useState, useEffect } from "react";

// Define proper types for API errors
interface ApiError {
  message?: string;
  response?: {
    data?: {
      message?: string;
    };
  };
}

// Predefined icons for selection
const iconOptions = [
  { value: "fa-heart", label: "Heart", emoji: "❤️" },
  { value: "fa-star", label: "Star", emoji: "⭐" },
  { value: "fa-moon", label: "Moon", emoji: "🌙" },
  { value: "fa-sun", label: "Sun", emoji: "☀️" },
  { value: "fa-fire", label: "Fire", emoji: "🔥" },
  { value: "fa-water", label: "Water", emoji: "💧" },
  { value: "fa-leaf", label: "Leaf", emoji: "🍃" },
  { value: "fa-crystal", label: "Crystal", emoji: "💎" },
  { value: "fa-feather", label: "Feather", emoji: "🪶" },
  { value: "fa-candle", label: "Candle", emoji: "🕯️" },
  { value: "fa-skull", label: "Skull", emoji: "💀" },
  { value: "fa-dragon", label: "Dragon", emoji: "🐉" },
  { value: "fa-owl", label: "Owl", emoji: "🦉" },
  { value: "fa-wolf", label: "Wolf", emoji: "🐺" },
  { value: "fa-tree", label: "Tree", emoji: "🌳" },
];

// Toast type
type ToastType = "success" | "error";

interface ToastState {
  show: boolean;
  message: string;
  type: ToastType;
}

const AdminSpells: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"add" | "view">("add");
  const [spellTypes, setSpellTypes] = useState<SpellType[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedSpell, setSelectedSpell] = useState<SpellType | null>(null);
  const [showToast, setShowToast] = useState<ToastState>({
    show: false,
    message: "",
    type: "success",
  });

  // Form states
  const [formData, setFormData] = useState<CreateSpellTypeData>({
    type: "",
    description: "",
    idealFor: "",
    icon: "",
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Fetch spell types on mount
  useEffect(() => {
    fetchSpellTypes();
  }, []);

  const fetchSpellTypes = async () => {
    setLoading(true);
    try {
      const response = await spellsAPI.getAllSpellTypes();
      if (response.success && response.data && Array.isArray(response.data)) {
        setSpellTypes(response.data);
      }
    } catch (error) {
      const apiError = error as ApiError;
      showNotification(
        apiError?.message ||
          apiError?.response?.data?.message ||
          "Error fetching spell types",
        "error",
      );
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message: string, type: ToastType) => {
    setShowToast({ show: true, message, type });
    setTimeout(
      () => setShowToast({ show: false, message: "", type: "success" }),
      3000,
    );
  };

  const resetForm = () => {
    setFormData({
      type: "",
      description: "",
      idealFor: "",
      icon: "",
    });
    setFormErrors({});
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!formData.type.trim()) errors.type = "Spell type name is required";
    if (!formData.description.trim())
      errors.description = "Description is required";
    if (!formData.idealFor.trim())
      errors.idealFor = "Ideal for field is required";
    if (!formData.icon) errors.icon = "Please select an icon";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle Add Spell Type
  const handleAddSpell = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await spellsAPI.createSpellType(formData);
      if (response.success) {
        showNotification("Spell type added successfully!", "success");
        resetForm();
        fetchSpellTypes();
        setActiveTab("view");
      }
    } catch (error) {
      const apiError = error as ApiError;
      showNotification(
        apiError?.message ||
          apiError?.response?.data?.message ||
          "Error adding spell type",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle View Spell
  const handleViewClick = (spell: SpellType) => {
    setSelectedSpell(spell);
    setShowViewModal(true);
  };

  // Handle Edit Spell
  const handleEditClick = (spell: SpellType) => {
    setSelectedSpell(spell);
    setFormData({
      type: spell.type,
      description: spell.description,
      idealFor: spell.idealFor,
      icon: spell.icon,
    });
    setShowEditModal(true);
  };

  const handleUpdateSpell = async () => {
    if (!selectedSpell || !validateForm()) return;

    setLoading(true);
    try {
      const response = await spellsAPI.updateSpellType(
        selectedSpell._id,
        formData,
      );
      if (response.success) {
        showNotification("Spell type updated successfully!", "success");
        setShowEditModal(false);
        fetchSpellTypes();
        resetForm();
      }
    } catch (error) {
      const apiError = error as ApiError;
      showNotification(
        apiError?.message ||
          apiError?.response?.data?.message ||
          "Error updating spell type",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle Delete Spell
  const handleDeleteClick = (spell: SpellType) => {
    setSelectedSpell(spell);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedSpell) return;

    setLoading(true);
    try {
      const response = await spellsAPI.deleteSpellType(selectedSpell._id);
      if (response.success) {
        showNotification("Spell type deleted successfully!", "success");
        setShowDeleteModal(false);
        fetchSpellTypes();
      }
    } catch (error) {
      const apiError = error as ApiError;
      showNotification(
        apiError?.message ||
          apiError?.response?.data?.message ||
          "Error deleting spell type",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  // Filter spell types based on search
  const filteredSpells = spellTypes.filter((spell) => {
    return (
      spell.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      spell.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      spell.idealFor.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Get icon emoji for display
  const getIconEmoji = (iconValue: string): string => {
    const icon = iconOptions.find((i) => i.value === iconValue);
    return icon ? icon.emoji : "📿";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Spell Types Management
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Add and manage different types of spells and their descriptions
          </p>
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
                  ? "border-blue-500 text-blue-600"
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
                Add New Spell Type
              </span>
            </button>
            <button
              onClick={() => setActiveTab("view")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "view"
                  ? "border-blue-500 text-blue-600"
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
                View All Spell Types ({spellTypes.length})
              </span>
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Add Spell Tab */}
        {activeTab === "add" && (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Add New Spell Type
            </h2>

            <form onSubmit={handleAddSpell} className="space-y-6">
              {/* Spell Type Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Spell Type Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value })
                  }
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    formErrors.type ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="e.g., Love Spell, Protection Spell, Healing Spell"
                />
                {formErrors.type && (
                  <p className="mt-1 text-sm text-red-500">{formErrors.type}</p>
                )}
              </div>

              {/* Icon Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Icon <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-7 gap-3">
                  {iconOptions.map((icon) => (
                    <button
                      key={icon.value}
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, icon: icon.value })
                      }
                      className={`p-3 border rounded-lg flex flex-col items-center gap-1 transition-all ${
                        formData.icon === icon.value
                          ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
                          : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                      }`}
                    >
                      <span className="text-2xl">{icon.emoji}</span>
                      <span className="text-xs text-gray-600">
                        {icon.label}
                      </span>
                    </button>
                  ))}
                </div>
                {formErrors.icon && (
                  <p className="mt-1 text-sm text-red-500">{formErrors.icon}</p>
                )}
              </div>

              {/* Ideal For */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ideal For <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.idealFor}
                  onChange={(e) =>
                    setFormData({ ...formData, idealFor: e.target.value })
                  }
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    formErrors.idealFor ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="e.g., Love seekers, Protection from negativity, Health issues"
                />
                {formErrors.idealFor && (
                  <p className="mt-1 text-sm text-red-500">
                    {formErrors.idealFor}
                  </p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={6}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    formErrors.description
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  placeholder="Write detailed description of this spell type, its uses, and benefits..."
                />
                {formErrors.description && (
                  <p className="mt-1 text-sm text-red-500">
                    {formErrors.description}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
                      Adding...
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
                      Add Spell Type
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* View Spell Types Tab */}
        {activeTab === "view" && (
          <div className="space-y-6">
            {/* Search */}
            <div className="bg-white shadow rounded-lg p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Search Spell Types
                  </label>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by name, description, or ideal for..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    onClick={() => setSearchTerm("")}
                    className="px-4 py-2 text-gray-600 hover:text-gray-900"
                  >
                    Clear Search
                  </button>
                </div>
              </div>
            </div>

            {/* Spell Types Grid */}
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <svg
                  className="animate-spin h-8 w-8 text-blue-600"
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredSpells.length === 0 ? (
                  <div className="col-span-full text-center py-12">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">
                      No spell types found
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {searchTerm
                        ? "Try clearing the search"
                        : "Get started by adding a new spell type."}
                    </p>
                    {!searchTerm && (
                      <div className="mt-6">
                        <button
                          onClick={() => setActiveTab("add")}
                          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                        >
                          <svg
                            className="-ml-1 mr-2 h-5 w-5"
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
                          Add New Spell Type
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  filteredSpells.map((spell) => (
                    <div
                      key={spell._id}
                      className="bg-white shadow rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300"
                    >
                      <div className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-3xl">
                              {getIconEmoji(spell.icon)}
                            </span>
                            <h3 className="text-lg font-semibold text-gray-900">
                              {spell.type}
                            </h3>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleViewClick(spell)}
                              className="text-gray-400 hover:text-gray-600"
                              title="View Details"
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
                                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleEditClick(spell)}
                              className="text-blue-400 hover:text-blue-600"
                              title="Edit"
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
                              onClick={() => handleDeleteClick(spell)}
                              className="text-red-400 hover:text-red-600"
                              title="Delete"
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
                        </div>

                        <div className="mt-3">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            Ideal for: {spell.idealFor}
                          </span>
                        </div>

                        <p className="mt-3 text-sm text-gray-600 line-clamp-3">
                          {spell.description}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* View Modal */}
      {showViewModal && selectedSpell && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">
                Spell Type Details
              </h3>
              <button
                onClick={() => setShowViewModal(false)}
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
              <div className="flex items-center gap-4">
                <span className="text-4xl">
                  {getIconEmoji(selectedSpell.icon)}
                </span>
                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    Spell Type
                  </label>
                  <p className="mt-1 text-xl text-gray-900">
                    {selectedSpell.type}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500">
                  Ideal For
                </label>
                <p className="mt-1">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800">
                    {selectedSpell.idealFor}
                  </span>
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500">
                  Description
                </label>
                <p className="mt-1 text-gray-700 whitespace-pre-line">
                  {selectedSpell.description}
                </p>
              </div>

              {selectedSpell.createdAt && (
                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    Added On
                  </label>
                  <p className="mt-1 text-sm text-gray-600">
                    {new Date(selectedSpell.createdAt).toLocaleDateString(
                      "en-IN",
                      {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      },
                    )}
                  </p>
                </div>
              )}
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setShowViewModal(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedSpell && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">
                Edit Spell Type
              </h3>
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
                  Spell Type Name
                </label>
                <input
                  type="text"
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Icon
                </label>
                <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto p-2 border rounded-lg">
                  {iconOptions.map((icon) => (
                    <button
                      key={icon.value}
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, icon: icon.value })
                      }
                      className={`p-2 border rounded-lg flex flex-col items-center ${
                        formData.icon === icon.value
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-blue-300"
                      }`}
                    >
                      <span className="text-xl">{icon.emoji}</span>
                      <span className="text-xs">{icon.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ideal For
                </label>
                <input
                  type="text"
                  value={formData.idealFor}
                  onChange={(e) =>
                    setFormData({ ...formData, idealFor: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={6}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                onClick={handleUpdateSpell}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? "Updating..." : "Update Spell Type"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && selectedSpell && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="px-6 py-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Delete Spell Type
              </h3>
              <p className="text-gray-500">
                Are you sure you want to delete{" "}
                <span className="font-semibold text-gray-900">
                  {selectedSpell.type}
                </span>
                ? This action cannot be undone.
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

      {/* Toast Notification */}
      {showToast.show && (
        <div
          className={`fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg ${
            showToast.type === "success" ? "bg-green-500" : "bg-red-500"
          } text-white animate-fade-in-up z-50`}
        >
          <div className="flex items-center gap-2">
            {showToast.type === "success" ? (
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
            {showToast.message}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSpells;
