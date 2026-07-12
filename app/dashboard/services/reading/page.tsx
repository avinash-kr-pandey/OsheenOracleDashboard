// pages/admin/AdminReading.tsx

"use client";
import {
  readingAPI,
  ReadingService,
  ReadingPackage,
  CreateReadingServiceData,
  CreateReadingPackageData,
} from "@/utils/reading.api";
import Image from "next/image";
import React, { useState, useEffect } from "react";
import { getFullImageUrl } from "@/utils/api";

// Define proper types for API errors
interface ApiError {
  message?: string;
  response?: {
    data?: {
      message?: string;
    };
  };
}

// Toast type
type ToastType = "success" | "error";

interface ToastState {
  show: boolean;
  message: string;
  type: ToastType;
}

// Service categories
const serviceCategories = [
  "Tarot Reading",
  "Love Reading",
  "Career Reading",
  "Life Reading",
  "Horoscope Reading",
  "Palm Reading",
  "Numerology Reading",
  "Astrology Reading",
  "Vastu Reading",
  "Other",
];

const AdminReading: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"services" | "packages">(
    "services",
  );
  const [services, setServices] = useState<ReadingService[]>([]);
  const [packages, setPackages] = useState<ReadingPackage[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<
    ReadingService | ReadingPackage | null
  >(null);
  const [modalType, setModalType] = useState<"service" | "package">("service");
  const [showToast, setShowToast] = useState<ToastState>({
    show: false,
    message: "",
    type: "success",
  });

  // Form states for Services
  const [serviceForm, setServiceForm] = useState<CreateReadingServiceData>({
    name: "",
    description: "",
    price: 0,
    duration: "",
    category: "",
    image: "",
    isActive: true,
  });

  // Form states for Packages
  const [packageForm, setPackageForm] = useState<CreateReadingPackageData>({
    id: 0,
    name: "",
    price: "",
    duration: "",
    features: [],
    bestFor: "",
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Fetch data on mount
  useEffect(() => {
    fetchServices();
    fetchPackages();
  }, []);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const response = await readingAPI.getAllServices();
      if (response.success && response.data && Array.isArray(response.data)) {
        setServices(response.data);
      }
    } catch (error) {
      const apiError = error as ApiError;
      showNotification(
        apiError?.message ||
          apiError?.response?.data?.message ||
          "Error fetching services",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchPackages = async () => {
    try {
      const data = await readingAPI.getAllPackages();
      // Backend se directly array aa raha hai as per your controller
      setPackages(Array.isArray(data) ? data : []);
    } catch (error) {
      const apiError = error as ApiError;
      showNotification(
        apiError?.message ||
          apiError?.response?.data?.message ||
          "Error fetching packages",
        "error",
      );
    }
  };

  const showNotification = (message: string, type: ToastType) => {
    setShowToast({ show: true, message, type });
    setTimeout(
      () => setShowToast({ show: false, message: "", type: "success" }),
      3000,
    );
  };

  const resetForms = () => {
    setServiceForm({
      name: "",
      description: "",
      price: 0,
      duration: "",
      category: "",
      image: "",
      isActive: true,
    });
    setPackageForm({
      id: 0,
      name: "",
      price: "",
      duration: "",
      features: [],
      bestFor: "",
    });
    setFormErrors({});
  };

  // ==================== Service Functions ====================
  const validateServiceForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!serviceForm.name.trim()) errors.name = "Service name is required";
    if (!serviceForm.description.trim())
      errors.description = "Description is required";
    if (!serviceForm.price || serviceForm.price <= 0)
      errors.price = "Valid price is required";
    if (!serviceForm.duration.trim()) errors.duration = "Duration is required";
    if (!serviceForm.category) errors.category = "Category is required";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateServiceForm()) return;

    setLoading(true);
    try {
      const response = await readingAPI.createService(serviceForm);
      if (response.success) {
        showNotification("Service added successfully!", "success");
        resetForms();
        fetchServices();
      }
    } catch (error) {
      const apiError = error as ApiError;
      showNotification(
        apiError?.message ||
          apiError?.response?.data?.message ||
          "Error adding service",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  // ==================== Package Functions ====================
  const validatePackageForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!packageForm.id || packageForm.id <= 0)
      errors.id = "Valid package ID is required";
    if (!packageForm.name.trim()) errors.name = "Package name is required";
    if (!packageForm.price.trim()) errors.price = "Price is required";
    if (!packageForm.duration.trim()) errors.duration = "Duration is required";
    if (!packageForm.features.length)
      errors.features = "At least one feature is required";
    if (!packageForm.bestFor.trim())
      errors.bestFor = "Best for field is required";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddPackage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePackageForm()) return;

    setLoading(true);
    try {
      const response = await readingAPI.createPackage(packageForm);
      if (response) {
        showNotification("Package added successfully!", "success");
        resetForms();
        fetchPackages();
      }
    } catch (error) {
      const apiError = error as ApiError;
      showNotification(
        apiError?.message ||
          apiError?.response?.data?.message ||
          "Error adding package",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle features input for packages
  const handleFeaturesChange = (value: string) => {
    const featuresArray = value
      .split(",")
      .map((f) => f.trim())
      .filter((f) => f);
    setPackageForm({ ...packageForm, features: featuresArray });
  };

  // ==================== CRUD Operations ====================
  const handleViewClick = (
    item: ReadingService | ReadingPackage,
    type: "service" | "package",
  ) => {
    setSelectedItem(item);
    setModalType(type);
    setShowViewModal(true);
  };

  const handleEditClick = (
    item: ReadingService | ReadingPackage,
    type: "service" | "package",
  ) => {
    setSelectedItem(item);
    setModalType(type);

    if (type === "service") {
      const service = item as ReadingService;
      setServiceForm({
        name: service.name,
        description: service.description,
        price: service.price,
        duration: service.duration,
        category: service.category,
        image: service.image || "",
        isActive: service.isActive,
      });
    } else {
      const pkg = item as ReadingPackage;
      setPackageForm({
        id: pkg.id,
        name: pkg.name,
        price: pkg.price,
        duration: pkg.duration,
        features: pkg.features,
        bestFor: pkg.bestFor,
      });
    }
    setShowEditModal(true);
  };

  const handleUpdateItem = async () => {
    if (!selectedItem) return;

    setLoading(true);
    try {
      if (modalType === "service") {
        if (!validateServiceForm()) {
          setLoading(false);
          return;
        }
        const response = await readingAPI.updateService(
          (selectedItem as ReadingService)._id,
          serviceForm,
        );
        if (response.success) {
          showNotification("Service updated successfully!", "success");
          fetchServices();
          setShowEditModal(false);
          resetForms();
        }
      } else {
        if (!validatePackageForm()) {
          setLoading(false);
          return;
        }
        const response = await readingAPI.updatePackage(
          (selectedItem as ReadingPackage).id,
          packageForm,
        );
        if (response) {
          showNotification("Package updated successfully!", "success");
          fetchPackages();
          setShowEditModal(false);
          resetForms();
        }
      }
    } catch (error) {
      const apiError = error as ApiError;
      showNotification(
        apiError?.message ||
          apiError?.response?.data?.message ||
          "Error updating item",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (
    item: ReadingService | ReadingPackage,
    type: "service" | "package",
  ) => {
    setSelectedItem(item);
    setModalType(type);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedItem) return;

    setLoading(true);
    try {
      if (modalType === "service") {
        const response = await readingAPI.deleteService(
          (selectedItem as ReadingService)._id,
        );
        if (response.success) {
          showNotification("Service deleted successfully!", "success");
          fetchServices();
        }
      } else {
        const response = await readingAPI.deletePackage(
          (selectedItem as ReadingPackage).id,
        );
        if (response.message) {
          showNotification("Package deleted successfully!", "success");
          fetchPackages();
        }
      }
      setShowDeleteModal(false);
    } catch (error) {
      const apiError = error as ApiError;
      showNotification(
        apiError?.message ||
          apiError?.response?.data?.message ||
          "Error deleting item",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  // Filter functions
  const filteredServices = services.filter(
    (service) =>
      service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.category.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const filteredPackages = packages.filter(
    (pkg) =>
      pkg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pkg.bestFor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pkg.features.some((f) =>
        f.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Reading Services Management
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage reading services and packages
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("services")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "services"
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
                    d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                Reading Services ({services.length})
              </span>
            </button>
            <button
              onClick={() => setActiveTab("packages")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "packages"
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
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
                Reading Packages ({packages.length})
              </span>
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Services Tab */}
        {activeTab === "services" && (
          <div className="space-y-6">
            {/* Add Service Form */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Add New Reading Service
              </h2>

              <form onSubmit={handleAddService} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Service Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={serviceForm.name}
                      onChange={(e) =>
                        setServiceForm({ ...serviceForm, name: e.target.value })
                      }
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        formErrors.name ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="e.g., Tarot Reading"
                    />
                    {formErrors.name && (
                      <p className="mt-1 text-sm text-red-500">
                        {formErrors.name}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={serviceForm.category}
                      onChange={(e) =>
                        setServiceForm({
                          ...serviceForm,
                          category: e.target.value,
                        })
                      }
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        formErrors.category
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    >
                      <option value="">Select Category</option>
                      {serviceCategories.map((cat) => (
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

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price (₹) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={serviceForm.price}
                      onChange={(e) =>
                        setServiceForm({
                          ...serviceForm,
                          price: Number(e.target.value),
                        })
                      }
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        formErrors.price ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="e.g., 999"
                    />
                    {formErrors.price && (
                      <p className="mt-1 text-sm text-red-500">
                        {formErrors.price}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Duration <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={serviceForm.duration}
                      onChange={(e) =>
                        setServiceForm({
                          ...serviceForm,
                          duration: e.target.value,
                        })
                      }
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        formErrors.duration
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      placeholder="e.g., 30 minutes"
                    />
                    {formErrors.duration && (
                      <p className="mt-1 text-sm text-red-500">
                        {formErrors.duration}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={serviceForm.description}
                    onChange={(e) =>
                      setServiceForm({
                        ...serviceForm,
                        description: e.target.value,
                      })
                    }
                    rows={4}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      formErrors.description
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    placeholder="Detailed description of the service..."
                  />
                  {formErrors.description && (
                    <p className="mt-1 text-sm text-red-500">
                      {formErrors.description}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Image URL
                  </label>
                  <input
                    type="url"
                    value={serviceForm.image}
                    onChange={(e) =>
                      setServiceForm({ ...serviceForm, image: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={serviceForm.isActive}
                    onChange={(e) =>
                      setServiceForm({
                        ...serviceForm,
                        isActive: e.target.checked,
                      })
                    }
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="isActive" className="text-sm text-gray-700">
                    Active (visible to users)
                  </label>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                  >
                    {loading ? "Adding..." : "Add Service"}
                  </button>
                </div>
              </form>
            </div>

            {/* Services List */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="p-4 border-b">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search services..."
                  className="w-full md:w-96 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

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
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Category
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Price
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Duration
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredServices.length === 0 ? (
                        <tr>
                          <td
                            colSpan={6}
                            className="px-6 py-4 text-center text-gray-500"
                          >
                            No services found
                          </td>
                        </tr>
                      ) : (
                        filteredServices.map((service) => (
                          <tr key={service._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4">
                              <div className="text-sm font-medium text-gray-900">
                                {service.name}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                                {service.category}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900">
                              ₹{service.price}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900">
                              {service.duration}
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className={`px-2 py-1 text-xs rounded ${
                                  service.isActive
                                    ? "bg-green-100 text-green-800"
                                    : "bg-gray-100 text-gray-800"
                                }`}
                              >
                                {service.isActive ? "Active" : "Inactive"}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm">
                              <div className="flex space-x-2">
                                <button
                                  onClick={() =>
                                    handleViewClick(service, "service")
                                  }
                                  className="text-gray-400 hover:text-gray-600"
                                  title="View"
                                >
                                  👁️
                                </button>
                                <button
                                  onClick={() =>
                                    handleEditClick(service, "service")
                                  }
                                  className="text-blue-400 hover:text-blue-600"
                                  title="Edit"
                                >
                                  ✏️
                                </button>
                                <button
                                  onClick={() =>
                                    handleDeleteClick(service, "service")
                                  }
                                  className="text-red-400 hover:text-red-600"
                                  title="Delete"
                                >
                                  🗑️
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

        {/* Packages Tab */}
        {activeTab === "packages" && (
          <div className="space-y-6">
            {/* Add Package Form */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Add New Reading Package
              </h2>

              <form onSubmit={handleAddPackage} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Package ID <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={packageForm.id}
                      onChange={(e) =>
                        setPackageForm({
                          ...packageForm,
                          id: Number(e.target.value),
                        })
                      }
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        formErrors.id ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="e.g., 1"
                    />
                    {formErrors.id && (
                      <p className="mt-1 text-sm text-red-500">
                        {formErrors.id}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Package Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={packageForm.name}
                      onChange={(e) =>
                        setPackageForm({ ...packageForm, name: e.target.value })
                      }
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        formErrors.name ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="e.g., Basic Package"
                    />
                    {formErrors.name && (
                      <p className="mt-1 text-sm text-red-500">
                        {formErrors.name}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={packageForm.price}
                      onChange={(e) =>
                        setPackageForm({
                          ...packageForm,
                          price: e.target.value,
                        })
                      }
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        formErrors.price ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="e.g., ₹999"
                    />
                    {formErrors.price && (
                      <p className="mt-1 text-sm text-red-500">
                        {formErrors.price}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Duration <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={packageForm.duration}
                      onChange={(e) =>
                        setPackageForm({
                          ...packageForm,
                          duration: e.target.value,
                        })
                      }
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        formErrors.duration
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      placeholder="e.g., 1 Month"
                    />
                    {formErrors.duration && (
                      <p className="mt-1 text-sm text-red-500">
                        {formErrors.duration}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Features (comma separated){" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={packageForm.features.join(", ")}
                    onChange={(e) => handleFeaturesChange(e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      formErrors.features ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="3 Tarot Readings, Priority Support, PDF Report"
                  />
                  {formErrors.features && (
                    <p className="mt-1 text-sm text-red-500">
                      {formErrors.features}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Best For <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={packageForm.bestFor}
                    onChange={(e) =>
                      setPackageForm({
                        ...packageForm,
                        bestFor: e.target.value,
                      })
                    }
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      formErrors.bestFor ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="e.g., Beginners"
                  />
                  {formErrors.bestFor && (
                    <p className="mt-1 text-sm text-red-500">
                      {formErrors.bestFor}
                    </p>
                  )}
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                  >
                    {loading ? "Adding..." : "Add Package"}
                  </button>
                </div>
              </form>
            </div>

            {/* Packages List */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="p-4 border-b">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search packages..."
                  className="w-full md:w-96 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                  {filteredPackages.length === 0 ? (
                    <div className="col-span-full text-center py-12 text-gray-500">
                      No packages found
                    </div>
                  ) : (
                    filteredPackages.map((pkg) => (
                      <div
                        key={pkg._id}
                        className="bg-white border rounded-lg p-6 hover:shadow-lg transition-shadow"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {pkg.name}
                          </h3>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleViewClick(pkg, "package")}
                              className="text-gray-400 hover:text-gray-600"
                              title="View"
                            >
                              👁️
                            </button>
                            <button
                              onClick={() => handleEditClick(pkg, "package")}
                              className="text-blue-400 hover:text-blue-600"
                              title="Edit"
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => handleDeleteClick(pkg, "package")}
                              className="text-red-400 hover:text-red-600"
                              title="Delete"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>

                        <div className="mb-3">
                          <span className="text-2xl font-bold text-blue-600">
                            {pkg.price}
                          </span>
                          <span className="text-sm text-gray-500 ml-2">
                            {pkg.duration}
                          </span>
                        </div>

                        <div className="mb-3">
                          <span className="text-xs font-medium text-gray-500">
                            Package ID: {pkg.id}
                          </span>
                        </div>

                        <div className="mb-3">
                          <span className="inline-block px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded">
                            Best for: {pkg.bestFor}
                          </span>
                        </div>

                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">
                            Features:
                          </h4>
                          <ul className="space-y-1">
                            {pkg.features.map((feature, idx) => (
                              <li
                                key={idx}
                                className="text-sm text-gray-600 flex items-start gap-2"
                              >
                                <span className="text-green-500">✓</span>
                                {feature}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* View Modal */}
      {showViewModal && selectedItem && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">
                {modalType === "service"
                  ? "Service Details"
                  : "Package Details"}
              </h3>
              <button
                onClick={() => setShowViewModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                ✕
              </button>
            </div>
            <div className="px-6 py-4 space-y-4">
              {modalType === "service" ? (
                <>
                  <div>
                    <label className="font-medium text-gray-500">Name:</label>
                    <p className="text-gray-900">
                      {(selectedItem as ReadingService).name}
                    </p>
                  </div>
                  <div>
                    <label className="font-medium text-gray-500">
                      Category:
                    </label>
                    <p className="text-gray-900">
                      {(selectedItem as ReadingService).category}
                    </p>
                  </div>
                  <div>
                    <label className="font-medium text-gray-500">Price:</label>
                    <p className="text-gray-900">
                      ₹{(selectedItem as ReadingService).price}
                    </p>
                  </div>
                  <div>
                    <label className="font-medium text-gray-500">
                      Duration:
                    </label>
                    <p className="text-gray-900">
                      {(selectedItem as ReadingService).duration}
                    </p>
                  </div>
                  <div>
                    <label className="font-medium text-gray-500">
                      Description:
                    </label>
                    <p className="text-gray-700">
                      {(selectedItem as ReadingService).description}
                    </p>
                  </div>
                  {(selectedItem as ReadingService).image && (
                    <div>
                      <label className="font-medium text-gray-500">
                        Image:
                      </label>
                      <div className="mt-2 relative h-40 w-40">
                        <Image
                          src={getFullImageUrl((selectedItem as ReadingService).image as string)}
                          alt={(selectedItem as ReadingService).name}
                          fill
                          className="object-cover rounded"
                          sizes="(max-width: 768px) 100vw, 160px"
                        />
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div>
                    <label className="font-medium text-gray-500">
                      Package ID:
                    </label>
                    <p className="text-gray-900">
                      {(selectedItem as ReadingPackage).id}
                    </p>
                  </div>
                  <div>
                    <label className="font-medium text-gray-500">Name:</label>
                    <p className="text-gray-900">
                      {(selectedItem as ReadingPackage).name}
                    </p>
                  </div>
                  <div>
                    <label className="font-medium text-gray-500">Price:</label>
                    <p className="text-gray-900">
                      {(selectedItem as ReadingPackage).price}
                    </p>
                  </div>
                  <div>
                    <label className="font-medium text-gray-500">
                      Duration:
                    </label>
                    <p className="text-gray-900">
                      {(selectedItem as ReadingPackage).duration}
                    </p>
                  </div>
                  <div>
                    <label className="font-medium text-gray-500">
                      Best For:
                    </label>
                    <p className="text-gray-900">
                      {(selectedItem as ReadingPackage).bestFor}
                    </p>
                  </div>
                  <div>
                    <label className="font-medium text-gray-500">
                      Features:
                    </label>
                    <ul className="list-disc pl-5 mt-1">
                      {(selectedItem as ReadingPackage).features.map((f, i) => (
                        <li key={i} className="text-gray-700">
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              )}
            </div>
            <div className="px-6 py-4 border-t flex justify-end">
              <button
                onClick={() => setShowViewModal(false)}
                className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">
                Edit {modalType === "service" ? "Service" : "Package"}
              </h3>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  resetForms();
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                ✕
              </button>
            </div>
            <div className="px-6 py-4 space-y-4">
              {modalType === "service" ? (
                // Service edit form
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Name
                    </label>
                    <input
                      type="text"
                      value={serviceForm.name}
                      onChange={(e) =>
                        setServiceForm({ ...serviceForm, name: e.target.value })
                      }
                      className="w-full p-2 border rounded"
                      placeholder="Name"
                    />
                    {formErrors.name && (
                      <p className="text-sm text-red-500">{formErrors.name}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category
                    </label>
                    <select
                      value={serviceForm.category}
                      onChange={(e) =>
                        setServiceForm({
                          ...serviceForm,
                          category: e.target.value,
                        })
                      }
                      className="w-full p-2 border rounded"
                    >
                      <option value="">Select Category</option>
                      {serviceCategories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                    {formErrors.category && (
                      <p className="text-sm text-red-500">
                        {formErrors.category}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price
                    </label>
                    <input
                      type="number"
                      value={serviceForm.price}
                      onChange={(e) =>
                        setServiceForm({
                          ...serviceForm,
                          price: Number(e.target.value),
                        })
                      }
                      className="w-full p-2 border rounded"
                      placeholder="Price"
                    />
                    {formErrors.price && (
                      <p className="text-sm text-red-500">{formErrors.price}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Duration
                    </label>
                    <input
                      type="text"
                      value={serviceForm.duration}
                      onChange={(e) =>
                        setServiceForm({
                          ...serviceForm,
                          duration: e.target.value,
                        })
                      }
                      className="w-full p-2 border rounded"
                      placeholder="Duration"
                    />
                    {formErrors.duration && (
                      <p className="text-sm text-red-500">
                        {formErrors.duration}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={serviceForm.description}
                      onChange={(e) =>
                        setServiceForm({
                          ...serviceForm,
                          description: e.target.value,
                        })
                      }
                      className="w-full p-2 border rounded"
                      rows={4}
                      placeholder="Description"
                    />
                    {formErrors.description && (
                      <p className="text-sm text-red-500">
                        {formErrors.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="editIsActive"
                      checked={serviceForm.isActive}
                      onChange={(e) =>
                        setServiceForm({
                          ...serviceForm,
                          isActive: e.target.checked,
                        })
                      }
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <label
                      htmlFor="editIsActive"
                      className="text-sm text-gray-700"
                    >
                      Active
                    </label>
                  </div>
                </div>
              ) : (
                // Package edit form
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Package ID
                    </label>
                    <input
                      type="number"
                      value={packageForm.id}
                      onChange={(e) =>
                        setPackageForm({
                          ...packageForm,
                          id: Number(e.target.value),
                        })
                      }
                      className="w-full p-2 border rounded"
                      placeholder="Package ID"
                    />
                    {formErrors.id && (
                      <p className="text-sm text-red-500">{formErrors.id}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Name
                    </label>
                    <input
                      type="text"
                      value={packageForm.name}
                      onChange={(e) =>
                        setPackageForm({ ...packageForm, name: e.target.value })
                      }
                      className="w-full p-2 border rounded"
                      placeholder="Name"
                    />
                    {formErrors.name && (
                      <p className="text-sm text-red-500">{formErrors.name}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price
                    </label>
                    <input
                      type="text"
                      value={packageForm.price}
                      onChange={(e) =>
                        setPackageForm({
                          ...packageForm,
                          price: e.target.value,
                        })
                      }
                      className="w-full p-2 border rounded"
                      placeholder="Price"
                    />
                    {formErrors.price && (
                      <p className="text-sm text-red-500">{formErrors.price}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Duration
                    </label>
                    <input
                      type="text"
                      value={packageForm.duration}
                      onChange={(e) =>
                        setPackageForm({
                          ...packageForm,
                          duration: e.target.value,
                        })
                      }
                      className="w-full p-2 border rounded"
                      placeholder="Duration"
                    />
                    {formErrors.duration && (
                      <p className="text-sm text-red-500">
                        {formErrors.duration}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Features
                    </label>
                    <input
                      type="text"
                      value={packageForm.features.join(", ")}
                      onChange={(e) => handleFeaturesChange(e.target.value)}
                      className="w-full p-2 border rounded"
                      placeholder="Features (comma separated)"
                    />
                    {formErrors.features && (
                      <p className="text-sm text-red-500">
                        {formErrors.features}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Best For
                    </label>
                    <input
                      type="text"
                      value={packageForm.bestFor}
                      onChange={(e) =>
                        setPackageForm({
                          ...packageForm,
                          bestFor: e.target.value,
                        })
                      }
                      className="w-full p-2 border rounded"
                      placeholder="Best For"
                    />
                    {formErrors.bestFor && (
                      <p className="text-sm text-red-500">
                        {formErrors.bestFor}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="px-6 py-4 border-t flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  resetForms();
                }}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateItem}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? "Updating..." : "Update"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && selectedItem && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="px-6 py-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Confirm Delete
              </h3>
              <p className="text-gray-500">
                Are you sure you want to delete
                {modalType === "service"
                  ? (selectedItem as ReadingService).name
                  : (selectedItem as ReadingPackage).name}
                ?
              </p>
            </div>
            <div className="px-6 py-4 border-t flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
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
          } text-white z-50`}
        >
          {showToast.message}
        </div>
      )}
    </div>
  );
};

export default AdminReading;
