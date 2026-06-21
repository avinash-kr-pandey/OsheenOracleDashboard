"use client";

import React, { useState, useRef, useEffect } from "react";
import { toast } from "react-hot-toast";
import {
  Upload,
  X,
  Package,
  Tag,
  Image as ImageIcon,
  FileText,
  Folder,
  Check,
  Palette,
  Ruler,
  Link as LinkIcon,
  Globe,
  Plus,
  Trash2,
} from "lucide-react";
import Image from "next/image";
import productAPI from "@/utils/productApi";
import productCategoryApi, { ProductCategory } from "@/utils/productCategoryApi";

/* ======================
   TYPES
====================== */

interface ProductPayload {
  name: string;
  price: number;
  originalPrice: number;
  image: string;
  description: string;
  category: string;
  inStock: boolean;
  hasColorOptions: boolean;
  colors: string[];
  sizeOptions: string[];
  discount?: string;
}

interface Review {
  admin: string;
  rating: number;
  comment: string;
  createdAt: string;
  _id: string;
}

interface Product extends ProductPayload {
  _id: string;
  discount: string;
  averageRating: number;
  reviewCount: number;
  reviews: Review[];
  createdAt: string;
  updatedAt: string;
  __v: number;
}

/* ======================
   CONSTANTS
====================== */

const DEFAULT_IMAGE =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='600' height='400' viewBox='0 0 600 400'><rect width='100%' height='100%' fill='%23f3f4f6'/><path d='M300 170c16.57 0 30-13.43 30-30s-13.43-30-30-30-30 13.43-30 30 13.43 30 30 30zm0 20c-33.14 0-60-26.86-60-60s26.86-60 60-60 60 26.86 60 60-26.86 60-60 60zm0 30c-55.23 0-100 44.77-100 100h200c0-55.23-44.77-100-100-100z' fill='%239ca3af'/><text x='50%' y='85%' dominant-baseline='middle' text-anchor='middle' font-family='system-ui, sans-serif' font-size='16' font-weight='500' fill='%236b7280'>No Product Image</text></svg>";

const FALLBACK_CATEGORIES = [
  "Footwear",
  "Clothing",
  "Accessories",
  "Electronics",
  "Home & Living",
  "Sports",
  "Beauty",
  "Books",
];

const COMMON_COLORS = [
  "Black",
  "White",
  "Red",
  "Blue",
  "Green",
  "Yellow",
  "Purple",
  "Pink",
  "Brown",
  "Gray",
  "Orange",
  "Navy",
];

const COMMON_SIZES = ["S", "M", "L", "XL"];

/* ======================
   COMPONENT
====================== */

interface AddProductProps {
  editProduct?: Product | null;
  onSuccess?: () => void;
  onCancel?: () => void;
}

type UploadMethod = "url" | "local";

export default function AddProduct({
  editProduct,
  onSuccess,
  onCancel,
}: AddProductProps) {
  const [loading, setLoading] = useState<boolean>(false);
  const [uploadingImage, setUploadingImage] = useState<boolean>(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploadMethod, setUploadMethod] = useState<UploadMethod>("url");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize form with editProduct data or empty values
  const [form, setForm] = useState<ProductPayload>({
    name: editProduct?.name || "",
    price: editProduct?.price || 0,
    originalPrice: editProduct?.originalPrice || 0,
    image: editProduct?.image || "",
    description: editProduct?.description || "",
    category: editProduct?.category || "",
    inStock: editProduct?.inStock !== undefined ? editProduct.inStock : true,
    hasColorOptions: editProduct?.hasColorOptions || false,
    colors: editProduct?.colors || [],
    sizeOptions: editProduct?.sizeOptions || [],
  });

  const [imagePreview, setImagePreview] = useState<string>(
    form.image || DEFAULT_IMAGE,
  );

  const [tempColor, setTempColor] = useState<string>("");
  const [tempSize, setTempSize] = useState<string>("");

  // Dynamic product categories state
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [fetchingCategories, setFetchingCategories] = useState<boolean>(false);
  const [showCategoryModal, setShowCategoryModal] = useState<boolean>(false);
  const [newCategoryName, setNewCategoryName] = useState<string>("");
  const [submittingCategory, setSubmittingCategory] = useState<boolean>(false);

  // Load categories from database
  const loadCategories = async () => {
    try {
      setFetchingCategories(true);
      const data = await productCategoryApi.getProductCategories();
      setCategories(data);
    } catch (err) {
      console.error("Failed to load categories:", err);
      toast.error("⚠️ Failed to fetch product categories");
    } finally {
      setFetchingCategories(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  // Validation function
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!form.name.trim()) {
      newErrors.name = "Product name is required";
    } else if (form.name.trim().length < 3) {
      newErrors.name = "Product name must be at least 3 characters";
    }

    if (form.price <= 0) {
      newErrors.price = "Price must be greater than 0";
    }

    if (form.originalPrice < form.price) {
      newErrors.originalPrice =
        "Original price cannot be less than selling price";
    }

    if (!form.category) {
      newErrors.category = "Category is required";
    }

    if (!form.description.trim()) {
      newErrors.description = "Description is required";
    } else if (form.description.trim().length < 20) {
      newErrors.description = "Description must be at least 20 characters";
    }

    if (!form.image.trim()) {
      newErrors.image = "Product image is required";
    }

    if (form.hasColorOptions && form.colors.length === 0) {
      newErrors.colors =
        "At least one color is required when color options are enabled";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value, type } = e.target;

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      const updatedForm = {
        ...form,
        [name]: checked,
      };

      // If turning off color options, clear colors
      if (name === "hasColorOptions" && !checked) {
        updatedForm.colors = [];
      }

      setForm(updatedForm);
      return;
    }

    const updatedForm = {
      ...form,
      [name]:
        name === "price" || name === "originalPrice"
          ? value === ""
            ? 0
            : Number(value)
          : value,
    };

    setForm(updatedForm);

    if (name === "image") {
      const imageUrl = value.trim();
      setImagePreview(imageUrl || DEFAULT_IMAGE);
    }
  };

  // Handle local file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file (JPG, PNG, WebP)");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    setUploadingImage(true);

    try {
      // Show local preview immediately
      const localPreview = URL.createObjectURL(file);
      setImagePreview(localPreview);

      // Upload to server
      const uploadedUrl = await productAPI.uploadProductImage(file);

      if (uploadedUrl) {
        setForm((prev) => ({ ...prev, image: uploadedUrl }));
        setImagePreview(uploadedUrl);
        toast.success("Image uploaded successfully!");

        // Clear image error if any
        if (errors.image) {
          setErrors((prev) => {
            const newErrors = { ...prev };
            delete newErrors.image;
            return newErrors;
          });
        }
      } else {
        toast.error("Failed to upload image");
        setImagePreview(DEFAULT_IMAGE);
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload image");
      setImagePreview(DEFAULT_IMAGE);
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleAddColor = () => {
    if (tempColor.trim()) {
      if (form.colors.includes(tempColor.trim())) {
        setErrors((prev) => ({
          ...prev,
          colors: "Color already exists",
        }));
        return;
      }

      const updatedColors = [...form.colors, tempColor.trim()];
      setForm((prev) => ({
        ...prev,
        colors: updatedColors,
      }));

      if (errors.colors) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.colors;
          return newErrors;
        });
      }

      setTempColor("");
    }
  };

  const handleRemoveColor = (colorToRemove: string) => {
    const updatedColors = form.colors.filter(
      (color) => color !== colorToRemove,
    );
    setForm((prev) => ({
      ...prev,
      colors: updatedColors,
    }));
  };

  const handleAddSize = () => {
    const sizeStr = tempSize.trim().toUpperCase();
    if (sizeStr) {
      if (form.sizeOptions.includes(sizeStr)) {
        setErrors((prev) => ({
          ...prev,
          size: "Size already exists",
        }));
        return;
      }

      const updatedSizes = [...form.sizeOptions, sizeStr];
      setForm((prev) => ({
        ...prev,
        sizeOptions: updatedSizes,
      }));

      setTempSize("");
    }
  };

  const handleRemoveSize = (sizeToRemove: string) => {
    const updatedSizes = form.sizeOptions.filter(
      (size) => size !== sizeToRemove,
    );
    setForm((prev) => ({
      ...prev,
      sizeOptions: updatedSizes,
    }));
  };

  const getColorHex = (colorName: string) => {
    const color = colorName.toLowerCase();
    const colors: Record<string, string> = {
      white: "#ffffff",
      black: "#000000",
      red: "#ff0000",
      blue: "#0000ff",
      green: "#008000",
      yellow: "#ffff00",
      purple: "#800080",
      pink: "#ffc0cb",
      brown: "#a52a2a",
      gray: "#808080",
      orange: "#ffa500",
      navy: "#000080",
    };
    return colors[color] || "#cccccc";
  };

  const resetFormToInitial = () => {
    const initialForm = {
      name: "",
      price: 0,
      originalPrice: 0,
      image: "",
      description: "",
      category: "",
      inStock: true,
      hasColorOptions: false,
      colors: [],
      sizeOptions: [],
    };

    setForm(initialForm);
    setImagePreview(DEFAULT_IMAGE);
    setTempColor("");
    setTempSize("");
    setErrors({});
    setUploadMethod("url");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("❌ Please fix the errors before submitting");
      return;
    }

    const discount =
      form.originalPrice > form.price
        ? Math.round(
            ((form.originalPrice - form.price) / form.originalPrice) * 100,
          ) + "%"
        : "0%";

    const payload: ProductPayload = {
      name: form.name.trim(),
      price: Number(form.price.toFixed(2)),
      originalPrice:
        form.originalPrice > 0
          ? Number(form.originalPrice.toFixed(2))
          : Number(form.price.toFixed(2)),
      image: form.image.trim(),
      description: form.description.trim(),
      category: form.category,
      inStock: form.inStock,
      hasColorOptions: form.hasColorOptions,
      colors: form.hasColorOptions ? form.colors.map((c) => c.trim()) : [],
      sizeOptions: form.sizeOptions,
      discount: form.originalPrice > form.price ? discount + " off" : "",
    };

    try {
      setLoading(true);

      if (editProduct?._id) {
        // Update existing product
        const updated = await productAPI.updateProduct(
          editProduct._id,
          payload,
        );
        if (updated) {
          toast.success("✅ Product updated successfully!");
          if (onSuccess) {
            setTimeout(() => {
              onSuccess();
            }, 500);
          } else {
            // If no onSuccess callback, reset form
            resetFormToInitial();
          }
        } else {
          toast.error("❌ Failed to update product");
        }
      } else {
        // Create new product
        const created = await productAPI.createProduct(payload);
        if (created) {
          toast.success("🎉 Product created successfully!");
          resetFormToInitial();
          if (onSuccess) {
            setTimeout(() => {
              onSuccess();
            }, 500);
          }
        } else {
          toast.error("❌ Failed to create product");
        }
      }
    } catch (error: unknown) {
      console.error("Product submission error:", error);
      let errorMessage = "Failed to save product. Please try again";

      if (error instanceof Error) {
        if (error.message.includes("Validation Error")) {
          errorMessage =
            "❌ Validation Error: Please check all required fields";
        } else if (error.message.includes("already exists")) {
          errorMessage = "❌ Product with this name already exists";
        }
      }

      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    if (editProduct?._id) {
      setForm({
        name: editProduct.name || "",
        price: editProduct.price || 0,
        originalPrice: editProduct.originalPrice || 0,
        image: editProduct.image || "",
        description: editProduct.description || "",
        category: editProduct.category || "",
        inStock: editProduct.inStock !== undefined ? editProduct.inStock : true,
        hasColorOptions: editProduct.hasColorOptions || false,
        colors: editProduct.colors || [],
        sizeOptions: editProduct.sizeOptions || [],
      });
      setImagePreview(editProduct.image || DEFAULT_IMAGE);
    } else {
      resetFormToInitial();
    }
    setErrors({});
    toast.success("Form reset successfully!");

    if (onCancel) {
      setTimeout(() => onCancel(), 300);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;

    try {
      setSubmittingCategory(true);
      const name = newCategoryName.trim();
      const created = await productCategoryApi.createProductCategory(name);

      if (created) {
        toast.success(`🎉 Category "${created.name}" added successfully!`);
        setNewCategoryName("");

        // Reload list
        await loadCategories();

        // Auto select in form
        setForm((prev) => ({
          ...prev,
          category: created.name,
        }));

        // Clear category validation error if any
        if (errors.category) {
          setErrors((prev) => {
            const nextErrors = { ...prev };
            delete nextErrors.category;
            return nextErrors;
          });
        }
      } else {
        toast.error("❌ Failed to add category");
      }
    } catch (error: unknown) {
      console.error("Error creating category:", error);
      let errMsg = "Failed to create category";
      if (error instanceof Error) {
        errMsg = error.message;
      }
      toast.error(errMsg);
    } finally {
      setSubmittingCategory(false);
    }
  };

  const handleDeleteCategory = async (id: string, name: string) => {
    if (
      !window.confirm(
        `Are you sure you want to delete category "${name}"?\nProducts under this category will NOT be deleted, but the category option will be removed.`,
      )
    ) {
      return;
    }

    try {
      const success = await productCategoryApi.deleteProductCategory(id);
      if (success) {
        toast.success(`🗑️ Category "${name}" deleted successfully`);

        // Reload list
        await loadCategories();

        // If current product selection was this category, clear it
        if (form.category === name) {
          setForm((prev) => ({
            ...prev,
            category: "",
          }));
        }
      } else {
        toast.error("❌ Failed to delete category");
      }
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error("Failed to delete category");
    }
  };

  return (
    <div className="max-w-6xl mx-auto my-8">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200 px-8 py-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white rounded-xl shadow-sm">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                {editProduct?._id ? "Edit Product" : "Add New Product"}
              </h2>
              <p className="text-gray-600 mt-1">
                {editProduct?._id
                  ? "Update your product details below"
                  : "Fill in the product details to add it to your store"}
              </p>
            </div>
          </div>
        </div>

        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Left Column - Image Upload */}
              <div className="lg:col-span-1">
                <div className="sticky top-8">
                  <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                    <div className="flex items-center gap-2 mb-4">
                      <ImageIcon className="h-5 w-5 text-gray-600" />
                      <h3 className="font-semibold text-gray-700">
                        Product Image
                      </h3>
                    </div>

                    {/* Upload Method Toggle */}
                    <div className="flex gap-2 mb-4 bg-white rounded-lg p-1 border border-gray-200">
                      <button
                        type="button"
                        onClick={() => setUploadMethod("url")}
                        className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                          uploadMethod === "url"
                            ? "bg-blue-600 text-white shadow-sm"
                            : "text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        <Globe className="h-4 w-4" />
                        URL
                      </button>
                      <button
                        type="button"
                        onClick={() => setUploadMethod("local")}
                        className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                          uploadMethod === "local"
                            ? "bg-blue-600 text-white shadow-sm"
                            : "text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        <Upload className="h-4 w-4" />
                        Upload
                      </button>
                    </div>

                    {/* Image Preview */}
                    <div className="aspect-square rounded-xl overflow-hidden border-2 border-dashed border-gray-300 bg-white mb-4 relative">
                      {uploadingImage && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                        </div>
                      )}
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        onError={() => {
                          if (imagePreview !== DEFAULT_IMAGE) {
                            setImagePreview(DEFAULT_IMAGE);
                          }
                        }}
                      />
                    </div>

                    {/* URL Input */}
                    {uploadMethod === "url" ? (
                      <div className="space-y-3">
                        <div className="relative">
                          <LinkIcon className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                          <input
                            name="image"
                            value={form.image}
                            onChange={handleChange}
                            placeholder="https://example.com/images/product.jpg"
                            className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                              errors.image
                                ? "border-red-500"
                                : "border-gray-300"
                            }`}
                          />
                        </div>
                        {errors.image && (
                          <p className="text-sm text-red-600">{errors.image}</p>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                        <p className="text-xs text-gray-500">
                          Supported formats: JPG, PNG, WebP. Max size: 5MB
                        </p>
                      </div>
                    )}

                    <div className="mt-4 space-y-2">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                        <span>Recommended size: 600x400px</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Form Fields */}
              <div className="lg:col-span-2">
                <div className="space-y-8">
                  {/* Basic Info Section */}
                  <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex items-center gap-2 mb-6">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Package className="h-5 w-5 text-blue-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-800">
                        Basic Information
                      </h3>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Product Name <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <Package className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                          <input
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            placeholder="e.g., Men's Casual Sneakers"
                            className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                              errors.name ? "border-red-500" : "border-gray-300"
                            }`}
                            required
                          />
                        </div>
                        {errors.name && (
                          <p className="mt-2 text-sm text-red-600">
                            {errors.name}
                          </p>
                        )}
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <label className="block text-sm font-medium text-gray-700">
                              Category <span className="text-red-500">*</span>
                            </label>
                            <button
                              type="button"
                              onClick={() => setShowCategoryModal(true)}
                              className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-all flex items-center gap-1 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100 hover:bg-blue-100"
                            >
                              <Plus className="h-3 w-3" /> Manage Categories
                            </button>
                          </div>
                          <div className="relative">
                            <Folder className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                            <select
                              name="category"
                              value={form.category}
                              onChange={handleChange}
                              className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all appearance-none bg-white ${
                                errors.category
                                  ? "border-red-500"
                                  : "border-gray-300"
                              }`}
                              required
                            >
                              <option value="">Select a category</option>
                              {categories.length > 0 ? (
                                categories.map((cat) => (
                                  <option key={cat._id} value={cat.name}>
                                    {cat.name}
                                  </option>
                                ))
                              ) : (
                                FALLBACK_CATEGORIES.map((cat) => (
                                  <option key={cat} value={cat}>
                                    {cat}
                                  </option>
                                ))
                              )}
                            </select>
                          </div>
                          {errors.category && (
                            <p className="mt-2 text-sm text-red-600">
                              {errors.category}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Stock Status
                            </label>
                            <div className="flex items-center gap-4 mt-1">
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  name="inStock"
                                  checked={form.inStock}
                                  onChange={handleChange}
                                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                />
                                <span className="text-gray-700">In Stock</span>
                              </label>
                              <div
                                className={`px-3 py-1 rounded-full text-sm font-medium ${form.inStock ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                              >
                                {form.inStock ? "Available" : "Out of Stock"}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Pricing Section */}
                  <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex items-center gap-2 mb-6">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Tag className="h-5 w-5 text-green-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-800">
                        Pricing Details
                      </h3>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Selling Price (₹){" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-3.5 text-gray-400 font-medium">
                            ₹
                          </span>
                          <input
                            type="number"
                            name="price"
                            value={form.price || ""}
                            onChange={handleChange}
                            placeholder="0.00"
                            className={`w-full pl-8 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                              errors.price
                                ? "border-red-500"
                                : "border-gray-300"
                            }`}
                            min={0}
                            step={0.01}
                            required
                          />
                        </div>
                        {errors.price && (
                          <p className="mt-2 text-sm text-red-600">
                            {errors.price}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Original Price (₹)
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-3.5 text-gray-400 font-medium">
                            ₹
                          </span>
                          <input
                            type="number"
                            name="originalPrice"
                            value={form.originalPrice || ""}
                            onChange={handleChange}
                            placeholder="0.00"
                            className={`w-full pl-8 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                              errors.originalPrice
                                ? "border-red-500"
                                : "border-gray-300"
                            }`}
                            min={0}
                            step={0.01}
                          />
                        </div>
                        {errors.originalPrice && (
                          <p className="mt-2 text-sm text-red-600">
                            {errors.originalPrice}
                          </p>
                        )}
                      </div>
                    </div>

                    {form.originalPrice > form.price && (
                      <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 border border-green-100 rounded-lg">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div>
                            <span className="text-gray-700 font-medium">
                              You&apos;re offering:
                            </span>
                            <p className="text-sm text-gray-600 mt-1">
                              {Math.round(
                                ((form.originalPrice - form.price) /
                                  form.originalPrice) *
                                  100,
                              )}
                              % discount
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="text-2xl font-bold text-green-600">
                              ₹
                              {(form.originalPrice - form.price).toLocaleString(
                                "en-IN",
                              )}
                            </span>
                            <p className="text-sm text-gray-600">
                              savings per item
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Variants Section */}
                  <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex items-center gap-2 mb-6">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <Palette className="h-5 w-5 text-purple-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-800">
                        Product Variants
                      </h3>
                    </div>

                    <div className="space-y-8">
                      {/* Color Options */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Color Options
                            </label>
                            <div className="flex items-center gap-4">
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  name="hasColorOptions"
                                  checked={form.hasColorOptions}
                                  onChange={handleChange}
                                  className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                                />
                                <span className="text-gray-700">
                                  Has multiple colors
                                </span>
                              </label>
                            </div>
                          </div>
                        </div>

                        {form.hasColorOptions && (
                          <div className="space-y-4">
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={tempColor}
                                onChange={(e) => setTempColor(e.target.value)}
                                placeholder="Add a color (e.g., Red)"
                                className={`flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all ${
                                  errors.colors
                                    ? "border-red-500"
                                    : "border-gray-300"
                                }`}
                                onKeyPress={(e) =>
                                  e.key === "Enter" &&
                                  (e.preventDefault(), handleAddColor())
                                }
                              />
                              <button
                                type="button"
                                onClick={handleAddColor}
                                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                              >
                                Add
                              </button>
                            </div>

                            {form.colors.length > 0 && (
                              <div className="flex flex-wrap gap-2">
                                {form.colors.map((color) => (
                                  <div
                                    key={color}
                                    className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg"
                                  >
                                    <div
                                      className="w-4 h-4 rounded-full border border-gray-300"
                                      style={{
                                        backgroundColor: getColorHex(color),
                                      }}
                                    />
                                    <span className="text-sm font-medium text-gray-700">
                                      {color}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveColor(color)}
                                      className="ml-2 text-gray-400 hover:text-red-500 transition-colors"
                                    >
                                      <X className="h-4 w-4" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}

                            <div className="flex flex-wrap gap-2">
                              {COMMON_COLORS.map((color) => (
                                <button
                                  key={color}
                                  type="button"
                                  onClick={() => {
                                    if (!form.colors.includes(color)) {
                                      setForm((prev) => ({
                                        ...prev,
                                        colors: [...prev.colors, color],
                                      }));
                                    }
                                  }}
                                  disabled={form.colors.includes(color)}
                                  className={`px-3 py-1.5 text-sm rounded-lg border transition-all ${
                                    form.colors.includes(color)
                                      ? "bg-green-100 text-green-800 border-green-200 cursor-not-allowed"
                                      : "bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200"
                                  }`}
                                >
                                  {color}
                                  {form.colors.includes(color) && (
                                    <Check className="h-3 w-3 inline ml-1" />
                                  )}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Size Options */}
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Size Options
                          </label>
                        </div>

                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={tempSize}
                            onChange={(e) => setTempSize(e.target.value)}
                            placeholder="Add a size (e.g., S)"
                            className={`flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all ${
                              errors.size ? "border-red-500" : "border-gray-300"
                            }`}
                            onKeyPress={(e) =>
                              e.key === "Enter" &&
                              (e.preventDefault(), handleAddSize())
                            }
                          />
                          <button
                            type="button"
                            onClick={handleAddSize}
                            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                          >
                            Add
                          </button>
                        </div>

                        {form.sizeOptions.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {form.sizeOptions.map((size) => (
                              <div
                                key={size}
                                className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg"
                              >
                                <Ruler className="h-4 w-4 text-gray-500" />
                                <span className="text-sm font-medium text-gray-700">
                                  Size {size}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveSize(size)}
                                  className="ml-2 text-gray-400 hover:text-red-500 transition-colors"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="flex flex-wrap gap-2">
                          {COMMON_SIZES.map((size) => (
                            <button
                              key={size}
                              type="button"
                              onClick={() => {
                                if (!form.sizeOptions.includes(size)) {
                                  setForm((prev) => ({
                                    ...prev,
                                    sizeOptions: [
                                      ...prev.sizeOptions,
                                      size,
                                    ],
                                  }));
                                }
                              }}
                              disabled={form.sizeOptions.includes(size)}
                              className={`px-3 py-1.5 text-sm rounded-lg border transition-all ${
                                form.sizeOptions.includes(size)
                                  ? "bg-green-100 text-green-800 border-green-200 cursor-not-allowed"
                                  : "bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200"
                              }`}
                            >
                              Size {size}
                              {form.sizeOptions.includes(size) && (
                                <Check className="h-3 w-3 inline ml-1" />
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Description Section */}
                  <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex items-center gap-2 mb-6">
                      <div className="p-2 bg-indigo-100 rounded-lg">
                        <FileText className="h-5 w-5 text-indigo-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-800">
                        Description
                      </h3>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Product Description{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        name="description"
                        value={form.description}
                        onChange={handleChange}
                        placeholder="Describe your product in detail. Include features, specifications, benefits..."
                        rows={5}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none ${
                          errors.description
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        required
                      />
                      <div className="mt-2 flex justify-between items-center">
                        <p className="text-sm text-gray-500">
                          {form.description.length} characters
                        </p>
                        <p className="text-sm text-gray-500">
                          Minimum 20 characters recommended
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between pt-6 border-t border-gray-200">
              <div className="text-sm text-gray-500">
                <span className="text-red-500">*</span> Required fields
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-medium flex items-center justify-center gap-2"
                >
                  <X className="h-5 w-5" />
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={loading || uploadingImage}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading || uploadingImage ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      {uploadingImage
                        ? "Uploading..."
                        : editProduct?._id
                          ? "Updating..."
                          : "Adding..."}
                    </>
                  ) : editProduct?._id ? (
                    <>
                      <Upload className="h-5 w-5" />
                      Update Product
                    </>
                  ) : (
                    <>
                      <Package className="h-5 w-5" />
                      Add Product
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Premium Category Management Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-all duration-300 animate-fadeIn">
          <div className="bg-white/95 border border-gray-100 shadow-2xl rounded-2xl w-full max-w-md overflow-hidden transform transition-all duration-300 scale-100 max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-150 px-6 py-4 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-white rounded-lg shadow-sm">
                  <Folder className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 text-lg">Manage Categories</h3>
                  <p className="text-xs text-gray-500">Add or remove product categories</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowCategoryModal(false);
                  setNewCategoryName("");
                }}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 flex-1 overflow-y-auto space-y-6">
              {/* Add New Category form */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  New Category Name
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="e.g., Summer Collection"
                    className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm outline-none transition-all"
                    disabled={submittingCategory}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddCategory();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleAddCategory}
                    disabled={submittingCategory || !newCategoryName.trim()}
                    className="bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-1.5 shadow-md shadow-blue-200"
                  >
                    {submittingCategory ? (
                      <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    ) : (
                      <Plus className="h-4 w-4" />
                    )}
                    Add
                  </button>
                </div>
              </div>

              {/* Categories list */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-gray-700">Existing Categories</h4>
                {fetchingCategories ? (
                  <div className="flex flex-col items-center justify-center py-8 gap-2">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    <span className="text-xs text-gray-500">Loading categories...</span>
                  </div>
                ) : categories.length === 0 ? (
                  <div className="text-center py-8 text-gray-400 text-sm border border-dashed border-gray-200 rounded-xl">
                    No categories found. Click Add to create one.
                  </div>
                ) : (
                  <div className="grid gap-2 max-h-[30vh] overflow-y-auto pr-1">
                    {categories.map((cat) => (
                      <div
                        key={cat._id}
                        className="flex items-center justify-between p-3 rounded-xl border border-gray-100 bg-gray-50 hover:bg-white hover:border-blue-100 hover:shadow-sm transition-all duration-200"
                      >
                        <span className="text-sm font-medium text-gray-700">{cat.name}</span>
                        <button
                          type="button"
                          onClick={() => handleDeleteCategory(cat._id, cat.name)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all duration-200"
                          title="Delete category"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-150 px-6 py-4 bg-gray-50 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setShowCategoryModal(false);
                  setNewCategoryName("");
                }}
                className="bg-white border border-gray-300 text-gray-700 px-5 py-2 rounded-xl text-sm font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all shadow-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
