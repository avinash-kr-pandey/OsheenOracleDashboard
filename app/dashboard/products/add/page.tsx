"use client";

import React, { useState } from "react";
import { postData, putData } from "@/utils/api";
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
} from "lucide-react";

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
  sizeOptions: number[];
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
  "https://via.placeholder.com/600x400/3b82f6/ffffff?text=Product+Image";

const CATEGORIES = [
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

const COMMON_SIZES = [6, 7, 8, 9, 10, 11, 12];

/* ======================
   COMPONENT
====================== */

interface AddProductProps {
  editProduct?: Product | null;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function AddProduct({
  editProduct,
  onSuccess,
  onCancel,
}: AddProductProps) {
  const [loading, setLoading] = useState<boolean>(false);
  
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
    form.image || DEFAULT_IMAGE
  );

  const [tempColor, setTempColor] = useState<string>("");
  const [tempSize, setTempSize] = useState<string>("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setForm((prev) => ({
        ...prev,
        [name]: checked,
      }));
      return;
    }

    setForm((prev) => ({
      ...prev,
      [name]:
        name === "price" || name === "originalPrice"
          ? value === ""
            ? 0
            : Number(value)
          : value,
    }));

    if (name === "image") {
      setImagePreview(value.trim() || DEFAULT_IMAGE);
    }
  };

  const handleAddColor = () => {
    if (tempColor.trim() && !form.colors.includes(tempColor.trim())) {
      setForm((prev) => ({
        ...prev,
        colors: [...prev.colors, tempColor.trim()],
      }));
      setTempColor("");
    }
  };

  const handleRemoveColor = (colorToRemove: string) => {
    setForm((prev) => ({
      ...prev,
      colors: prev.colors.filter((color) => color !== colorToRemove),
    }));
  };

  const handleAddSize = () => {
    const sizeNum = parseInt(tempSize);
    if (!isNaN(sizeNum) && !form.sizeOptions.includes(sizeNum)) {
      setForm((prev) => ({
        ...prev,
        sizeOptions: [...prev.sizeOptions, sizeNum].sort((a, b) => a - b),
      }));
      setTempSize("");
    }
  };

  const handleRemoveSize = (sizeToRemove: number) => {
    setForm((prev) => ({
      ...prev,
      sizeOptions: prev.sizeOptions.filter((size) => size !== sizeToRemove),
    }));
  };

  const getColorHex = (colorName: string) => {
    const color = colorName.toLowerCase();
    switch (color) {
      case 'white': return '#ffffff';
      case 'black': return '#000000';
      case 'red': return '#ff0000';
      case 'blue': return '#0000ff';
      case 'green': return '#008000';
      case 'yellow': return '#ffff00';
      case 'purple': return '#800080';
      case 'pink': return '#ffc0cb';
      case 'brown': return '#a52a2a';
      case 'gray': return '#808080';
      case 'orange': return '#ffa500';
      case 'navy': return '#000080';
      default: return color;
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Calculate discount percentage
    const discount = form.originalPrice > form.price
      ? Math.round(((form.originalPrice - form.price) / form.originalPrice) * 100) + "%"
      : "0%";

    const payload: ProductPayload = {
      ...form,
      originalPrice: form.originalPrice > 0 ? form.originalPrice : form.price,
      image: form.image.trim() ? form.image : DEFAULT_IMAGE,
      // Ensure arrays are properly formatted
      colors: form.hasColorOptions ? form.colors : [],
      sizeOptions: form.sizeOptions,
    };

    try {
      setLoading(true);

      if (editProduct?._id) {
        await putData(`/products/${editProduct._id}`, payload);
        toast.success("🎉 Product updated successfully!");
      } else {
        await postData("/products", payload);
        toast.success("🎉 Product created successfully!");
      }

      if (!editProduct) {
        setForm({
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
        });
        setImagePreview(DEFAULT_IMAGE);
      }

      if (onSuccess) onSuccess();
    } catch (error) {
      toast.error("❌ Something went wrong");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
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
    });
    setImagePreview(DEFAULT_IMAGE);
    setTempColor("");
    setTempSize("");
    if (onCancel) onCancel();
  };

  /* ======================
     UI
  ====================== */
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
            {/* Two Column Layout */}
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Left Column - Image Preview */}
              <div className="lg:col-span-1">
                <div className="sticky top-8">
                  <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                    <div className="flex items-center gap-2 mb-4">
                      <ImageIcon className="h-5 w-5 text-gray-600" />
                      <h3 className="font-semibold text-gray-700">
                        Image Preview
                      </h3>
                    </div>

                    <div className="aspect-square rounded-xl overflow-hidden border-2 border-dashed border-gray-300 bg-white mb-4">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = DEFAULT_IMAGE;
                        }}
                      />
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                        <span>Recommended size: 600x400px</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <div className="h-2 w-2 rounded-full bg-green-500"></div>
                        <span>Supports JPG, PNG, WebP</span>
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
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Category <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <Folder className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                            <select
                              name="category"
                              value={form.category}
                              onChange={handleChange}
                              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all appearance-none bg-white"
                              required
                            >
                              <option value="">Select a category</option>
                              {CATEGORIES.map((cat) => (
                                <option key={cat} value={cat}>
                                  {cat}
                                </option>
                              ))}
                            </select>
                          </div>
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
                              <div className={`px-3 py-1 rounded-full text-sm font-medium ${form.inStock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                {form.inStock ? 'Available' : 'Out of Stock'}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Image URL
                        </label>
                        <div className="relative">
                          <Upload className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                          <input
                            name="image"
                            value={form.image}
                            onChange={handleChange}
                            placeholder="https://example.com/images/product.jpg"
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                          />
                        </div>
                        <p className="mt-2 text-sm text-gray-500">
                          Leave empty to use default image
                        </p>
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
                          Selling Price <span className="text-red-500">*</span>
                        </label>

                        <div className="relative">
                          <span className="absolute left-3 top-3.5 text-gray-400 font-medium">
                            ₹
                          </span>
                          <input
                            type="number"
                            name="price"
                            value={form.price}
                            onChange={handleChange}
                            placeholder="0.00"
                            className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                            min={0}
                            step={0.01}
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Original Price
                        </label>

                        <div className="relative">
                          <span className="absolute left-3 top-3.5 text-gray-400 font-medium">
                            ₹
                          </span>
                          <input
                            type="number"
                            name="originalPrice"
                            value={form.originalPrice}
                            onChange={handleChange}
                            placeholder="0.00"
                            className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                            min={0}
                            step={0.01}
                          />
                        </div>

                        <p className="mt-2 text-sm text-gray-500">
                          For discounted products. Leave empty to use selling price.
                        </p>
                      </div>
                    </div>

                    {/* Price Summary */}
                    {form.originalPrice > form.price && (
                      <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 border border-green-100 rounded-lg">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div>
                            <span className="text-gray-700 font-medium">
                              You&rsquo;re offering:
                            </span>
                            <p className="text-sm text-gray-600 mt-1">
                              {Math.round(((form.originalPrice - form.price) / form.originalPrice) * 100)}% discount
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="text-2xl font-bold text-green-600">
                              ₹
                              {(form.originalPrice - form.price).toLocaleString(
                                "en-IN"
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
                                <span className="text-gray-700">Has multiple colors</span>
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
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddColor())}
                              />
                              <button
                                type="button"
                                onClick={handleAddColor}
                                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                              >
                                Add
                              </button>
                            </div>

                            {form.colors.length > 0 ? (
                              <div className="space-y-3">
                                <p className="text-sm text-gray-600">Selected colors:</p>
                                <div className="flex flex-wrap gap-2">
                                  {form.colors.map((color) => (
                                    <div
                                      key={color}
                                      className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg"
                                    >
                                      <div 
                                        className="w-4 h-4 rounded-full border border-gray-300"
                                        style={{ 
                                          backgroundColor: getColorHex(color)
                                        }}
                                      />
                                      <span className="text-sm font-medium text-gray-700">{color}</span>
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
                              </div>
                            ) : (
                              <p className="text-sm text-gray-500 italic">No colors added yet</p>
                            )}

                            <div className="mt-4">
                              <p className="text-sm text-gray-600 mb-2">Quick add common colors:</p>
                              <div className="flex flex-wrap gap-2">
                                {COMMON_COLORS.map((color) => (
                                  <button
                                    key={color}
                                    type="button"
                                    onClick={() => {
                                      if (!form.colors.includes(color)) {
                                        setForm(prev => ({
                                          ...prev,
                                          colors: [...prev.colors, color]
                                        }));
                                      }
                                    }}
                                    disabled={form.colors.includes(color)}
                                    className={`px-3 py-1.5 text-sm rounded-lg border transition-all ${form.colors.includes(color)
                                      ? 'bg-green-100 text-green-800 border-green-200 cursor-not-allowed'
                                      : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'
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
                          </div>
                        )}
                      </div>

                      {/* Size Options */}
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Size Options
                          </label>
                          <div className="text-sm text-gray-600 mb-4">
                            Add available sizes for this product
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <input
                            type="number"
                            value={tempSize}
                            onChange={(e) => setTempSize(e.target.value)}
                            placeholder="Add a size (e.g., 8)"
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                            min={1}
                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSize())}
                          />
                          <button
                            type="button"
                            onClick={handleAddSize}
                            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                          >
                            Add
                          </button>
                        </div>

                        {form.sizeOptions.length > 0 ? (
                          <div className="space-y-3">
                            <p className="text-sm text-gray-600">Available sizes:</p>
                            <div className="flex flex-wrap gap-2">
                              {form.sizeOptions.map((size) => (
                                <div
                                  key={size}
                                  className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg"
                                >
                                  <Ruler className="h-4 w-4 text-gray-500" />
                                  <span className="text-sm font-medium text-gray-700">Size {size}</span>
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
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500 italic">No sizes added yet</p>
                        )}

                        <div className="mt-4">
                          <p className="text-sm text-gray-600 mb-2">Quick add common sizes:</p>
                          <div className="flex flex-wrap gap-2">
                            {COMMON_SIZES.map((size) => (
                              <button
                                key={size}
                                type="button"
                                onClick={() => {
                                  if (!form.sizeOptions.includes(size)) {
                                    setForm(prev => ({
                                      ...prev,
                                      sizeOptions: [...prev.sizeOptions, size].sort((a, b) => a - b)
                                    }));
                                  }
                                }}
                                disabled={form.sizeOptions.includes(size)}
                                className={`px-3 py-1.5 text-sm rounded-lg border transition-all ${form.sizeOptions.includes(size)
                                  ? 'bg-green-100 text-green-800 border-green-200 cursor-not-allowed'
                                  : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'
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
                        Product Description <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        name="description"
                        value={form.description}
                        onChange={handleChange}
                        placeholder="Describe your product in detail. Include features, specifications, benefits..."
                        rows={5}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
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
                  disabled={loading}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Saving...
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
    </div>
  );
}