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
  DollarSign,
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
}

interface Product extends ProductPayload {
  _id: string;
}

/* ======================
   CONSTANTS
====================== */

const DEFAULT_IMAGE =
  "https://via.placeholder.com/600x400/3b82f6/ffffff?text=Product+Image";

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
  });

  const [imagePreview, setImagePreview] = useState<string>(
    form.image || DEFAULT_IMAGE
  );

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]:
        name === "price" || name === "originalPrice" ? Number(value) : value,
    }));

    if (name === "image") {
      setImagePreview(value.trim() || DEFAULT_IMAGE);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const payload: ProductPayload = {
      ...form,
      originalPrice: form.originalPrice > 0 ? form.originalPrice : form.price,
      image: form.image.trim() ? form.image : DEFAULT_IMAGE,
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
    });
    setImagePreview(DEFAULT_IMAGE);
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
                            placeholder="e.g., Premium Wireless Headphones"
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                            required
                          />
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
                            placeholder="https://example.com/image.jpg"
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
                          <DollarSign className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                          <input
                            type="number"
                            name="price"
                            value={form.price}
                            onChange={handleChange}
                            placeholder="0.00"
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
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
                          <DollarSign className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                          <input
                            type="number"
                            name="originalPrice"
                            value={form.originalPrice}
                            onChange={handleChange}
                            placeholder="0.00"
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                            min={0}
                            step={0.01}
                          />
                        </div>
                        <p className="mt-2 text-sm text-gray-500">
                          For discounted products. Leave empty to use selling
                          price.
                        </p>
                      </div>
                    </div>

                    {/* Price Summary */}
                    {form.originalPrice > form.price && (
                      <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-700">
                            You&rsquo;re offering:
                          </span>
                          <div className="text-right">
                            <span className="text-2xl font-bold text-blue-600">
                              ₹
                              {(form.originalPrice - form.price).toLocaleString(
                                "en-IN"
                              )}
                            </span>
                            <p className="text-sm text-gray-600">
                              discount on this product
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Description Section */}
                  <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex items-center gap-2 mb-6">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <FileText className="h-5 w-5 text-purple-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-800">
                        Description
                      </h3>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Product Description
                      </label>
                      <textarea
                        name="description"
                        value={form.description}
                        onChange={handleChange}
                        placeholder="Describe your product in detail. Include features, specifications, benefits..."
                        rows={5}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
                      />
                      <p className="mt-2 text-sm text-gray-500">
                        {form.description.length} characters
                      </p>
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
