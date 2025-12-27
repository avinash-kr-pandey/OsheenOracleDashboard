"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { fetchData, deleteData } from "@/utils/api";
import { toast } from "react-hot-toast";
import AddProduct from "../add/page";
import {
  Search,
  Filter,
  RefreshCw,
  Plus,
  Eye,
  Edit2,
  Trash2,
  MoreVertical,
  Tag,
  TrendingUp,
  Package,
  DollarSign,
  BarChart,
  Grid,
  List,
} from "lucide-react";

/* ======================
   TYPES
====================== */

interface Product {
  _id: string;
  name: string;
  price: number;
  originalPrice: number;
  image: string;
  description: string;
  inStock?: boolean;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

interface ProductsResponse {
  success: boolean;
  count: number;
  data: Product[];
}

/* ======================
   COMPONENT
====================== */

export default function ViewProduct() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("name");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  /* ======================
     FETCH PRODUCTS
  ====================== */
  const loadProducts = async (): Promise<void> => {
    try {
      setLoading(true);
      const res = await fetchData<ProductsResponse>("/products");

      if (res.success && res.data) {
        setProducts(res.data);
      } else {
        setProducts([]);
      }
    } catch (error) {
      toast.error("❌ Failed to fetch products");
      console.error(error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  /* ======================
     DELETE PRODUCT
  ====================== */
  const handleDelete = async (id: string): Promise<void> => {
    if (!window.confirm("Are you sure you want to delete this product?"))
      return;

    try {
      await deleteData(`/products/${id}`);
      toast.success("🗑️ Product deleted successfully");
      loadProducts();
    } catch (error) {
      toast.error("❌ Failed to delete product");
      console.error(error);
    }
  };

  /* ======================
     EDIT PRODUCT - FIXED
  ====================== */
  const handleEdit = (product: Product): void => {
    setEditProduct(product);
    setShowAddForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /* ======================
     FILTER & SORT
  ====================== */
  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.description &&
        p.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case "name":
        return a.name.localeCompare(b.name);
      case "price-high":
        return b.price - a.price;
      case "price-low":
        return a.price - b.price;
      case "date-new":
        return (
          new Date(b.createdAt || "").getTime() -
          new Date(a.createdAt || "").getTime()
        );
      case "date-old":
        return (
          new Date(a.createdAt || "").getTime() -
          new Date(b.createdAt || "").getTime()
        );
      default:
        return 0;
    }
  });

  /* ======================
     STATS CALCULATION
  ====================== */
  const stats = {
    totalProducts: products.length,
    totalValue: products.reduce((sum, p) => sum + p.price, 0),
    averagePrice:
      products.length > 0
        ? products.reduce((sum, p) => sum + p.price, 0) / products.length
        : 0,
    inStock: products.filter((p) => p.inStock).length,
    discountedProducts: products.filter((p) => p.originalPrice > p.price)
      .length,
  };

  /* ======================
     UI
  ====================== */
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Product Catalog
            </h1>
            <p className="text-gray-600 mt-2">
              Manage your products efficiently
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadProducts}
              className="p-3 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
              title="Refresh products"
            >
              <RefreshCw className="h-5 w-5 text-gray-600" />
            </button>

            <button
              onClick={() => {
                setEditProduct(null);
                setShowAddForm(!showAddForm);
              }}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
            >
              <Plus className="h-5 w-5" />
              {showAddForm ? "Hide Form" : "Add Product"}
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Products</p>
                <p className="text-2xl font-bold text-gray-800 mt-2">
                  {stats.totalProducts}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Value</p>
                <p className="text-2xl font-bold text-gray-800 mt-2">
                  ₹{stats.totalValue.toLocaleString("en-IN")}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-xl">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg. Price</p>
                <p className="text-2xl font-bold text-gray-800 mt-2">
                  ₹{Math.round(stats.averagePrice).toLocaleString("en-IN")}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-xl">
                <BarChart className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">In Stock</p>
                <p className="text-2xl font-bold text-gray-800 mt-2">
                  {stats.inStock}/{stats.totalProducts}
                </p>
              </div>
              <div className="p-3 bg-orange-100 rounded-xl">
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Form - यहाँ AddProduct component show होगा */}
      {showAddForm && (
        <AddProduct
          editProduct={editProduct}
          onSuccess={() => {
            loadProducts();
            setEditProduct(null);
            setShowAddForm(false);
            toast.success(
              editProduct ? "✅ Product updated!" : "🎉 Product added!"
            );
          }}
          onCancel={() => {
            setEditProduct(null);
            setShowAddForm(false);
          }}
        />
      )}

      {/* Filters Bar */}
      <div className="bg-white rounded-2xl p-6 mb-6 border border-gray-200 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex-1 w-full">
            <div className="relative">
              <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search products by name or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-xl">
              <button
                onClick={() => setViewMode("grid")}
                className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
                  viewMode === "grid"
                    ? "bg-white shadow-sm text-blue-600"
                    : "hover:bg-gray-200 text-gray-600"
                }`}
              >
                <Grid className="h-4 w-4" />
                Grid
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
                  viewMode === "list"
                    ? "bg-white shadow-sm text-blue-600"
                    : "hover:bg-gray-200 text-gray-600"
                }`}
              >
                <List className="h-4 w-4" />
                List
              </button>
            </div>

            <div className="relative">
              <Filter className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
              >
                <option value="name">Sort by Name</option>
                <option value="price-high">Price: High to Low</option>
                <option value="price-low">Price: Low to High</option>
                <option value="date-new">Date: Newest First</option>
                <option value="date-old">Date: Oldest First</option>
              </select>
            </div>
          </div>
        </div>

        {searchTerm && (
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Found {sortedProducts.length} product
              {sortedProducts.length !== 1 ? "s" : ""} matching {searchTerm}
            </p>
            <button
              onClick={() => setSearchTerm("")}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              Clear search
            </button>
          </div>
        )}
      </div>

      {/* Products Display */}
      {loading ? (
        <div className="flex flex-col items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading products...</p>
        </div>
      ) : sortedProducts.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-200">
          <div className="max-w-md mx-auto">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Package className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              {searchTerm ? "No products found" : "No products yet"}
            </h3>
            <p className="text-gray-600 mb-8">
              {searchTerm
                ? "Try adjusting your search or filter to find what you're looking for."
                : "Get started by adding your first product to the catalog."}
            </p>
            {!searchTerm && (
              <button
                onClick={() => setShowAddForm(true)}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all inline-flex items-center gap-2"
              >
                <Plus className="h-5 w-5" />
                Add First Product
              </button>
            )}
          </div>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedProducts.map((product) => (
            <div
              key={product._id}
              className="bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Product Image */}
              <div className="relative h-48 bg-gray-100">
                <Image
                  src={
                    product.image ||
                    "https://via.placeholder.com/400x300?text=Product"
                  }
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                <div className="absolute top-3 right-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      product.inStock
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {product.inStock ? "In Stock" : "Out of Stock"}
                  </span>
                </div>
              </div>

              {/* Product Info */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-gray-800 line-clamp-1">
                    {product.name}
                  </h3>
                  <button className="text-gray-400 hover:text-gray-600">
                    <MoreVertical className="h-5 w-5" />
                  </button>
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {product.description || "No description available"}
                </p>

                <div className="flex items-center justify-between mb-6">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-bold text-gray-800">
                        ₹{product.price.toLocaleString("en-IN")}
                      </span>
                      {product.originalPrice > product.price && (
                        <span className="text-sm text-gray-500 line-through">
                          ₹{product.originalPrice.toLocaleString("en-IN")}
                        </span>
                      )}
                    </div>
                    {product.originalPrice > product.price && (
                      <span className="text-xs text-green-600 font-medium">
                        Save ₹
                        {(product.originalPrice - product.price).toLocaleString(
                          "en-IN"
                        )}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions - EDIT BUTTON FIXED */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(product)}
                    className="flex-1 px-4 py-2.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center gap-2"
                  >
                    <Edit2 className="h-4 w-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(product._id)}
                    className="flex-1 px-4 py-2.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* List View */
        <div className="bg-white rounded-2xl overflow-hidden border border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="py-4 px-6 text-left font-semibold text-gray-700">
                    Product
                  </th>
                  <th className="py-4 px-6 text-left font-semibold text-gray-700">
                    Pricing
                  </th>
                  <th className="py-4 px-6 text-left font-semibold text-gray-700">
                    Status
                  </th>
                  <th className="py-4 px-6 text-left font-semibold text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {sortedProducts.map((product) => (
                  <tr
                    key={product._id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 relative rounded-lg overflow-hidden bg-gray-100">
                          <Image
                            src={
                              product.image ||
                              "https://via.placeholder.com/150?text=Product"
                            }
                            alt={product.name}
                            fill
                            className="object-cover"
                            sizes="64px"
                          />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-800">
                            {product.name}
                          </h4>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-1">
                            {product.description || "No description"}
                          </p>
                          <span className="text-xs text-gray-500 mt-2 block">
                            ID: {product._id.substring(0, 8)}...
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="space-y-1">
                        <div className="text-lg font-bold text-gray-800">
                          ₹{product.price.toLocaleString("en-IN")}
                        </div>
                        {product.originalPrice > product.price && (
                          <>
                            <div className="text-sm text-gray-500 line-through">
                              ₹{product.originalPrice.toLocaleString("en-IN")}
                            </div>
                            <div className="text-xs text-green-600 font-medium">
                              Save ₹
                              {(
                                product.originalPrice - product.price
                              ).toLocaleString("en-IN")}
                            </div>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-col gap-2">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium w-fit ${
                            product.inStock
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {product.inStock ? "In Stock" : "Out of Stock"}
                        </span>
                        {product.createdAt && (
                          <span className="text-xs text-gray-500">
                            Added:{" "}
                            {new Date(product.createdAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(product)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(product._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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

          {/* Footer Summary */}
          <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="text-sm text-gray-600">
                Showing {sortedProducts.length} of {products.length} products
              </div>
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <p className="text-sm text-gray-500">Average Price</p>
                  <p className="font-semibold text-gray-800">
                    ₹{Math.round(stats.averagePrice).toLocaleString("en-IN")}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-500">Total Value</p>
                  <p className="font-semibold text-gray-800">
                    ₹{stats.totalValue.toLocaleString("en-IN")}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-500">Discounted</p>
                  <p className="font-semibold text-gray-800">
                    {stats.discountedProducts}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
