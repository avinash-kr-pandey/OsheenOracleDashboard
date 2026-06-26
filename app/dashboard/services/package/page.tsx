"use client";
import {
  Category,
  categoryAPI,
  ServiceRequest,
  serviceRequestAPI,
  DashboardStats,
  subcategoryAPI,
  uploadFile,
} from "@/utils/services.package.api";
import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { toast, Toaster } from "react-hot-toast";

// ==================== TYPES ====================

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

interface Subcategory {
  _id?: string;
  name: string;
  description: string;
  price: number;
  duration: string;
  icon: string;
  image: string;
  order: number;
  isActive: boolean;
}

interface CategoryCardProps {
  category: Category;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
  onToggle: (category: Category) => void;
  onAddSubcategory: (category: Category) => void;
  onEditSubcategory: (category: Category, subcategory: Subcategory) => void;
  onDeleteSubcategory: (category: Category, subcategoryId: string) => void;
  onToggleSubcategory: (category: Category, subcategoryId: string) => void;
}

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}

interface RequestDetailsModalProps {
  request: ServiceRequest | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdate: (id: string, status: string, adminNotes?: string) => void;
}

type StatusType =
  | "pending"
  | "confirmed"
  | "in_progress"
  | "completed"
  | "cancelled";
type CommunicationMode = "voice_call" | "video_call" | "voice_note";
type ActiveTab = "categories" | "requests" | "stats";

// ==================== ICONS ====================

const Icons = {
  category: () => (
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
        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
      />
    </svg>
  ),
  request: () => (
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
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
    </svg>
  ),
  stats: () => (
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
        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
      />
    </svg>
  ),
  edit: () => (
    <svg
      className="w-4 h-4"
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
  ),
  delete: () => (
    <svg
      className="w-4 h-4"
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
  ),
  toggle: () => (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
      />
    </svg>
  ),
  add: () => (
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
  ),
  close: () => (
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
  ),
  expand: () => (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 9l-7 7-7-7"
      />
    </svg>
  ),
  collapse: () => (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M5 15l7-7 7 7"
      />
    </svg>
  ),
  service: () => (
    <svg
      className="w-4 h-4"
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
  ),
  upload: () => (
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
        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
      />
    </svg>
  ),
};


interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  label: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  value,
  onChange,
  label,
}) => {
  const [uploading, setUploading] = useState(false);
  const [inputType, setInputType] = useState<"url" | "local">("url");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }


    setUploading(true);
    try {
      const url = await uploadFile(file);
      onChange(url);
      toast.success("Image uploaded successfully!");
    } catch (error) {
      toast.error("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        {label}
      </label>

      {/* Toggle between URL and Local Upload */}
      <div className="flex gap-2 mb-3">
        <button
          type="button"
          onClick={() => setInputType("url")}
          className={`px-3 py-1 text-sm rounded-lg transition-colors ${
            inputType === "url"
              ? "bg-purple-600 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          URL Link
        </button>
        <button
          type="button"
          onClick={() => setInputType("local")}
          className={`px-3 py-1 text-sm rounded-lg transition-colors ${
            inputType === "local"
              ? "bg-purple-600 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          Upload from Computer
        </button>
      </div>

      {inputType === "url" ? (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          placeholder="https://example.com/image.jpg"
        />
      ) : (
        <div className="flex items-center gap-3">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*"
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex-1 px-4 py-2.5 border-2 border-dashed border-gray-300 rounded-xl hover:border-purple-400 transition-colors flex items-center justify-center gap-2"
          >
            {uploading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600"></div>
            ) : (
              <Icons.upload />
            )}
            {uploading ? "Uploading..." : "Choose Image"}
          </button>
          {value && (
            <div className="relative w-12 h-12">
              <Image
                src={value}
                alt="Preview"
                fill
                className="object-cover rounded-lg"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ==================== COMPONENTS ====================

const TabButton: React.FC<TabButtonProps> = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`px-6 py-3 text-sm font-medium transition-all duration-200 rounded-xl flex items-center gap-2 ${
      active
        ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30"
        : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
    }`}
  >
    {children}
  </button>
);

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-gray-100 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <Icons.close />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

// Category Card Component
const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  onEdit,
  onDelete,
  onToggle,
  onAddSubcategory,
  onEditSubcategory,
  onDeleteSubcategory,
  onToggleSubcategory,
}) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 group">
      <div className="relative h-40 bg-gradient-to-br from-purple-500 via-purple-600 to-pink-600 flex items-center justify-center">
        {category.icon ? (
          <Image
            src={category.icon}
            alt={category.name}
            width={80}
            height={80}
            className="w-20 h-20 object-contain drop-shadow-lg"
          />
        ) : (
          <div className="text-6xl filter drop-shadow-lg">📂</div>
        )}
        <div className="absolute top-3 right-3">
          <div
            className={`px-2.5 py-1 rounded-full text-xs font-medium shadow-sm ${
              category.isActive
                ? "bg-green-500 text-white"
                : "bg-gray-500 text-white"
            }`}
          >
            {category.isActive ? "Active" : "Inactive"}
          </div>
        </div>
      </div>

      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-xl text-gray-800">{category.name}</h3>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onEdit(category)}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Edit Category"
            >
              <Icons.edit />
            </button>
            <button
              onClick={() => onToggle(category)}
              className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
              title={category.isActive ? "Deactivate" : "Activate"}
            >
              <Icons.toggle />
            </button>
            <button
              onClick={() => onDelete(category)}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete Category"
            >
              <Icons.delete />
            </button>
          </div>
        </div>

        <p className="text-gray-500 text-sm mb-4 line-clamp-2">
          {category.description}
        </p>

        <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
              <Icons.service />
            </div>
            <span className="text-sm font-medium text-gray-700">
              {category.subcategories.length} Services
            </span>
          </div>
          <button
            onClick={() => onAddSubcategory(category)}
            className="px-3 py-1.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm rounded-lg hover:shadow-lg transition-all flex items-center gap-1"
          >
            <Icons.add />
            Add Service
          </button>
        </div>

        {category.subcategories.length > 0 && (
          <div>
            <button
              onClick={() => setExpanded(!expanded)}
              className="w-full flex items-center justify-between py-2 text-gray-600 hover:text-purple-600 transition-colors"
            >
              <span className="text-sm font-medium">
                {expanded ? "Hide Services" : "View All Services"}
              </span>
              {expanded ? <Icons.collapse /> : <Icons.expand />}
            </button>

            {expanded && (
              <div className="mt-3 space-y-2 max-h-96 overflow-y-auto">
                {category.subcategories.map((sub) => (
                  <div
                    key={sub._id}
                    className="bg-gray-50 rounded-xl p-3 hover:bg-purple-50 transition-all group/sub"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-gray-800 text-sm">
                            {sub.name}
                          </h4>
                          <span
                            className={`px-1.5 py-0.5 text-xs rounded-full ${
                              sub.isActive
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-200 text-gray-600"
                            }`}
                          >
                            {sub.isActive ? "Active" : "Inactive"}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mb-2 line-clamp-1">
                          {sub.description}
                        </p>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-bold text-purple-600">
                            ₹{sub.price}
                          </span>
                          <span className="text-xs text-gray-400">•</span>
                          <span className="text-xs text-gray-500">
                            {sub.duration}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover/sub:opacity-100 transition-opacity">
                        <button
                          onClick={() => onEditSubcategory(category, sub)}
                          className="p-1.5 text-blue-600 hover:bg-blue-100 rounded"
                          title="Edit Service"
                        >
                          <Icons.edit />
                        </button>
                        <button
                          onClick={() =>
                            onToggleSubcategory(category, sub._id!)
                          }
                          className="p-1.5 text-yellow-600 hover:bg-yellow-100 rounded"
                          title="Toggle Status"
                        >
                          <Icons.toggle />
                        </button>
                        <button
                          onClick={() =>
                            onDeleteSubcategory(category, sub._id!)
                          }
                          className="p-1.5 text-red-600 hover:bg-red-100 rounded"
                          title="Delete Service"
                        >
                          <Icons.delete />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Request Details Modal
const RequestDetailsModal: React.FC<RequestDetailsModalProps> = ({
  request,
  isOpen,
  onClose,
  onStatusUpdate,
}) => {
  const [adminNotes, setAdminNotes] = useState(request?.adminNotes || "");
  const [status, setStatus] = useState(request?.status || "pending");

  if (!isOpen || !request) return null;

  const statusColors: Record<StatusType, { bg: string; text: string }> = {
    pending: { bg: "bg-yellow-100", text: "text-yellow-800" },
    confirmed: { bg: "bg-blue-100", text: "text-blue-800" },
    in_progress: { bg: "bg-purple-100", text: "text-purple-800" },
    completed: { bg: "bg-green-100", text: "text-green-800" },
    cancelled: { bg: "bg-red-100", text: "text-red-800" },
  };

  const communicationIcons: Record<CommunicationMode, string> = {
    voice_call: "📞",
    video_call: "📹",
    voice_note: "🎤",
  };

  const handleSave = () => {
    onStatusUpdate(request._id, status, adminNotes);
    onClose();
    toast.success("Request status updated successfully!");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-white">Request Details</h2>
          <button onClick={onClose} className="text-white hover:text-gray-200">
            <Icons.close />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Customer Info */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-2xl font-bold text-gray-800">
                  {request.name}
                </h3>
                <p className="text-gray-600 mt-1">{request.email}</p>
                <p className="text-gray-600">{request.phone}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Submitted on</p>
                <p className="font-medium text-gray-700">
                  {new Date(request.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Status Update */}
          <div className="border rounded-xl p-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Update Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as StatusType)}
              className={`px-4 py-2 text-sm font-medium rounded-xl border-2 focus:outline-none focus:ring-2 focus:ring-purple-500 ${statusColors[status].bg} ${statusColors[status].text}`}
            >
              <option value="pending">⏳ Pending</option>
              <option value="confirmed">✅ Confirmed</option>
              <option value="in_progress">🔄 In Progress</option>
              <option value="completed">🎉 Completed</option>
              <option value="cancelled">❌ Cancelled</option>
            </select>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border rounded-xl p-4">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Category
              </label>
              <p className="text-gray-800 font-medium mt-1">
                {request.categoryName}
              </p>
            </div>
            <div className="border rounded-xl p-4">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Service
              </label>
              <p className="text-gray-800 font-medium mt-1">
                {request.subcategoryName}
              </p>
            </div>
            <div className="border rounded-xl p-4">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Price
              </label>
              <p className="text-purple-600 font-bold text-xl mt-1">
                ₹{request.price}
              </p>
            </div>
            <div className="border rounded-xl p-4">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Communication
              </label>
              <p className="text-gray-800 font-medium mt-1">
                {
                  communicationIcons[
                    request.communicationMode as CommunicationMode
                  ]
                }{" "}
                {request.communicationMode.replace("_", " ")}
              </p>
            </div>
            <div className="md:col-span-2 border rounded-xl p-4">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Address
              </label>
              <p className="text-gray-700 mt-1">{request.address}</p>
            </div>
            <div className="md:col-span-2 border rounded-xl p-4">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Description
              </label>
              <p className="text-gray-700 mt-1 whitespace-pre-wrap">
                {request.description}
              </p>
            </div>
            {request.preferredDate && (
              <div className="border rounded-xl p-4">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Preferred Date
                </label>
                <p className="text-gray-800 font-medium mt-1">
                  {new Date(request.preferredDate).toLocaleDateString()}
                </p>
              </div>
            )}
            {request.preferredTimeSlot && (
              <div className="border rounded-xl p-4">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Preferred Time
                </label>
                <p className="text-gray-800 font-medium mt-1">
                  {request.preferredTimeSlot}
                </p>
              </div>
            )}
          </div>

          {/* Admin Notes */}
          <div className="border rounded-xl p-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Admin Notes
            </label>
            <textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Add internal notes here..."
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              rows={4}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleSave}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:shadow-lg transition-all font-semibold"
            >
              Save Changes
            </button>
            <button
              onClick={onClose}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all font-semibold"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Request Table Component
const RequestTable: React.FC<{
  requests: ServiceRequest[];
  onViewDetails: (request: ServiceRequest) => void;
}> = ({ requests, onViewDetails }) => {
  const statusConfig: Record<
    StatusType,
    { bg: string; text: string; icon: string }
  > = {
    pending: { bg: "bg-yellow-100", text: "text-yellow-800", icon: "⏳" },
    confirmed: { bg: "bg-blue-100", text: "text-blue-800", icon: "✅" },
    in_progress: { bg: "bg-purple-100", text: "text-purple-800", icon: "🔄" },
    completed: { bg: "bg-green-100", text: "text-green-800", icon: "🎉" },
    cancelled: { bg: "bg-red-100", text: "text-red-800", icon: "❌" },
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
            <tr>
              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                Customer
              </th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                Phone
              </th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                Service
              </th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                Price
              </th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                Status
              </th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                Date
              </th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {requests.map((request) => (
              <tr
                key={request._id}
                className="hover:bg-purple-50/30 transition-colors group"
              >
                <td className="px-6 py-4">
                  <p className="font-semibold text-gray-800">{request.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {request.email}
                  </p>
                </td>
                <td className="px-6 py-4 text-gray-600">{request.phone}</td>
                <td className="px-6 py-4">
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      {request.subcategoryName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {request.categoryName}
                    </p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="font-semibold text-purple-600">
                    ₹{request.price}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full ${statusConfig[request.status as StatusType].bg} ${statusConfig[request.status as StatusType].text}`}
                  >
                    <span>
                      {statusConfig[request.status as StatusType].icon}
                    </span>
                    {request.status.replace("_", " ")}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {new Date(request.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => onViewDetails(request)}
                    className="px-4 py-2 text-sm bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-all font-medium"
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color }) => (
  <div className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition-all border border-gray-100 group">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
        <p className="text-3xl font-bold text-gray-800 group-hover:text-purple-600 transition-colors">
          {value}
        </p>
      </div>
      <div
        className={`w-14 h-14 rounded-2xl flex items-center justify-center ${color} group-hover:scale-110 transition-transform`}
      >
        {icon}
      </div>
    </div>
  </div>
);

// ==================== MAIN COMPONENT ====================

const Package: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>("categories");
  const [categories, setCategories] = useState<Category[]>([]);
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState<boolean>(false);
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(
    null,
  );
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingSubcategory, setEditingSubcategory] = useState<{
    category: Category;
    subcategory: Subcategory;
  } | null>(null);
  const [modalType, setModalType] = useState<"category" | "subcategory">(
    "category",
  );
  const [selectedCategoryForSub, setSelectedCategoryForSub] =
    useState<Category | null>(null);

  // Category Form State
  const [categoryFormData, setCategoryFormData] = useState({
    name: "",
    description: "",
    icon: "",
    image: "",
    order: 0,
    isActive: true,
  });

  // Subcategory Form State
  const [subcategoryFormData, setSubcategoryFormData] = useState<Subcategory>({
    name: "",
    description: "",
    price: 0,
    duration: "30 mins",
    icon: "",
    image: "",
    order: 0,
    isActive: true,
  });

  const fetchAllData = async (): Promise<void> => {
    setLoading(true);
    try {
      if (activeTab === "categories") {
        const res = await categoryAPI.getAllCategories();
        setCategories(res.data || []);
      } else if (activeTab === "requests") {
        const res = await serviceRequestAPI.getAllRequests();
        setRequests(res.data || []);
      } else if (activeTab === "stats") {
        const [statsRes, requestsRes] = await Promise.all([
          serviceRequestAPI.getDashboardStats(),
          serviceRequestAPI.getAllRequests(),
        ]);
        setStats(statsRes.data);
        setRequests(requestsRes.data || []);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [activeTab]);

  const handleSaveCategory = async (): Promise<void> => {
    try {
      if (editingCategory?._id) {
        const res = await categoryAPI.updateCategory(
          editingCategory._id,
          categoryFormData,
        );
        if (res.success) {
          toast.success("Category updated successfully!");
          fetchAllData();
          setModalOpen(false);
        }
      } else {
        const res = await categoryAPI.createCategory(categoryFormData);
        if (res.success) {
          toast.success("Category created successfully!");
          fetchAllData();
          setModalOpen(false);
        }
      }
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Error saving category");
    }
  };

  const handleSaveSubcategory = async (): Promise<void> => {
    if (!selectedCategoryForSub) return;
    try {
      if (editingSubcategory) {
        const res = await subcategoryAPI.updateSubcategory(
          selectedCategoryForSub._id,
          editingSubcategory.subcategory._id!,
          subcategoryFormData,
        );
        if (res.success) {
          toast.success("Service updated successfully!");
          fetchAllData();
          setModalOpen(false);
        }
      } else {
        const res = await subcategoryAPI.addSubcategory(
          selectedCategoryForSub._id,
          subcategoryFormData,
        );
        if (res.success) {
          toast.success("Service added successfully!");
          fetchAllData();
          setModalOpen(false);
        }
      }
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Error saving service");
    }
  };

  const handleDeleteCategory = async (category: Category): Promise<void> => {
    if (
      confirm(
        `Are you sure you want to delete "${category.name}"? This will also delete all services under it.`,
      )
    ) {
      try {
        const res = await categoryAPI.deleteCategory(category._id);
        if (res.success) {
          toast.success("Category deleted successfully!");
          fetchAllData();
        } else {
          toast.error(
            res.message || "Cannot delete category with active requests",
          );
        }
      } catch (error) {
        const err = error as { response?: { data?: { message?: string } } };
        toast.error(err.response?.data?.message || "Error deleting category");
      }
    }
  };

  const handleToggleCategory = async (category: Category): Promise<void> => {
    try {
      const res = await categoryAPI.toggleCategoryStatus(category._id);
      if (res.success) {
        toast.success(
          `Category ${res.data.isActive ? "activated" : "deactivated"}!`,
        );
        fetchAllData();
      }
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Error toggling status");
    }
  };

  const handleDeleteSubcategory = async (
    category: Category,
    subcategoryId: string,
  ): Promise<void> => {
    if (confirm("Are you sure you want to delete this service?")) {
      try {
        const res = await subcategoryAPI.deleteSubcategory(
          category._id,
          subcategoryId,
        );
        if (res.success) {
          toast.success("Service deleted successfully!");
          fetchAllData();
        }
      } catch (error) {
        const err = error as { response?: { data?: { message?: string } } };
        toast.error(err.response?.data?.message || "Error deleting service");
      }
    }
  };

  const handleToggleSubcategory = async (
    category: Category,
    subcategoryId: string,
  ): Promise<void> => {
    try {
      const res = await subcategoryAPI.toggleSubcategoryStatus(
        category._id,
        subcategoryId,
      );
      if (res.success) {
        toast.success(`Service status toggled!`);
        fetchAllData();
      }
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Error toggling status");
    }
  };

  const handleUpdateRequestStatus = async (
    id: string,
    status: string,
    adminNotes?: string,
  ): Promise<void> => {
    try {
      const res = await serviceRequestAPI.updateRequestStatus(
        id,
        status,
        adminNotes,
      );
      if (res.success) {
        toast.success(`Request status updated to ${status}!`);
        fetchAllData();
        if (selectedRequest?._id === id) {
          const updatedRequest = await serviceRequestAPI.getRequestById(id);
          setSelectedRequest(updatedRequest.data);
        }
      }
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Error updating status");
    }
  };

  const handleViewDetails = (request: ServiceRequest): void => {
    setSelectedRequest(request);
    setDetailsModalOpen(true);
  };

  const openCategoryModal = (category?: Category): void => {
    setModalType("category");
    if (category) {
      setEditingCategory(category);
      setCategoryFormData({
        name: category.name,
        description: category.description,
        icon: category.icon || "",
        image: category.image || "",
        order: category.order || 0,
        isActive: category.isActive,
      });
    } else {
      setEditingCategory(null);
      setCategoryFormData({
        name: "",
        description: "",
        icon: "",
        image: "",
        order: 0,
        isActive: true,
      });
    }
    setModalOpen(true);
  };

  const openSubcategoryModal = (
    category: Category,
    subcategory?: Subcategory,
  ): void => {
    setModalType("subcategory");
    setSelectedCategoryForSub(category);
    if (subcategory) {
      setEditingSubcategory({ category, subcategory });
      setSubcategoryFormData({
        name: subcategory.name,
        description: subcategory.description || "",
        price: subcategory.price,
        duration: subcategory.duration,
        icon: subcategory.icon || "",
        image: subcategory.image || "",
        order: subcategory.order || 0,
        isActive: subcategory.isActive,
      });
    } else {
      setEditingSubcategory(null);
      setSubcategoryFormData({
        name: "",
        description: "",
        price: 0,
        duration: "30 mins",
        icon: "",
        image: "",
        order: 0,
        isActive: true,
      });
    }
    setModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Toaster position="top-right" />

      

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex gap-3 mb-8 flex-wrap">
          <TabButton
            active={activeTab === "categories"}
            onClick={() => setActiveTab("categories")}
          >
            <Icons.category />
            Categories & Services
          </TabButton>
          <TabButton
            active={activeTab === "requests"}
            onClick={() => setActiveTab("requests")}
          >
            <Icons.request />
            Service Requests
          </TabButton>
          <TabButton
            active={activeTab === "stats"}
            onClick={() => setActiveTab("stats")}
          >
            <Icons.stats />
            Statistics
          </TabButton>
        </div>

        {/* Categories Tab */}
        {activeTab === "categories" && (
          <div>
            <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Categories</h2>
                <p className="text-gray-500 text-sm mt-1">
                  Manage your service categories and sub-services
                </p>
              </div>
              <button
                onClick={() => openCategoryModal()}
                className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:shadow-lg transition-all flex items-center gap-2 font-medium"
              >
                <Icons.add />
                New Category
              </button>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
              </div>
            ) : categories.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl">
                <div className="text-6xl mb-4">📂</div>
                <p className="text-gray-500">
                  No categories found. Create your first category!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.map((category) => (
                  <CategoryCard
                    key={category._id}
                    category={category}
                    onEdit={openCategoryModal}
                    onDelete={handleDeleteCategory}
                    onToggle={handleToggleCategory}
                    onAddSubcategory={openSubcategoryModal}
                    onEditSubcategory={openSubcategoryModal}
                    onDeleteSubcategory={handleDeleteSubcategory}
                    onToggleSubcategory={handleToggleSubcategory}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Requests Tab */}
        {activeTab === "requests" && (
          <div>
            <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  Service Requests
                </h2>
                <p className="text-gray-500 text-sm mt-1">
                  Manage and track customer requests
                </p>
              </div>
              <div className="px-4 py-2 bg-purple-100 rounded-xl">
                <span className="text-purple-600 font-semibold">
                  Total: {requests.length}
                </span>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
              </div>
            ) : requests.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl">
                <div className="text-6xl mb-4">📋</div>
                <p className="text-gray-500">No service requests yet.</p>
              </div>
            ) : (
              <RequestTable
                requests={requests}
                onViewDetails={handleViewDetails}
              />
            )}
          </div>
        )}

        {/* Stats Tab */}
        {activeTab === "stats" && (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Dashboard Statistics
            </h2>
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <StatCard
                    title="Total Requests"
                    value={stats?.totalRequests || 0}
                    icon={<span className="text-2xl">📊</span>}
                    color="bg-gradient-to-br from-purple-100 to-purple-200"
                  />
                  <StatCard
                    title="Pending"
                    value={stats?.pendingRequests || 0}
                    icon={<span className="text-2xl">⏳</span>}
                    color="bg-gradient-to-br from-yellow-100 to-yellow-200"
                  />
                  <StatCard
                    title="Completed"
                    value={stats?.completedRequests || 0}
                    icon={<span className="text-2xl">✅</span>}
                    color="bg-gradient-to-br from-green-100 to-green-200"
                  />
                  <StatCard
                    title="Cancelled"
                    value={stats?.cancelledRequests || 0}
                    icon={<span className="text-2xl">❌</span>}
                    color="bg-gradient-to-br from-red-100 to-red-200"
                  />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                  <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                        <Icons.category />
                      </div>
                      <h3 className="font-semibold text-gray-800">
                        Active Categories
                      </h3>
                    </div>
                    <p className="text-4xl font-bold text-purple-600">
                      {stats?.activeCategories || 0}
                    </p>
                  </div>
                  <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-pink-100 rounded-xl flex items-center justify-center">
                        <Icons.service />
                      </div>
                      <h3 className="font-semibold text-gray-800">
                        Total Services
                      </h3>
                    </div>
                    <p className="text-4xl font-bold text-pink-600">
                      {stats?.totalSubcategories || 0}
                    </p>
                  </div>
                </div>

                {stats?.categoryDistribution &&
                  stats.categoryDistribution.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-sm p-6 mb-8 border border-gray-100">
                      <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <span className="text-xl">📊</span>
                        Category Distribution
                      </h3>
                      <div className="space-y-4">
                        {stats.categoryDistribution.map((item, idx) => (
                          <div key={idx}>
                            <div className="flex justify-between text-sm mb-2">
                              <span className="font-medium text-gray-700">
                                {item._id}
                              </span>
                              <span className="text-purple-600 font-semibold">
                                {item.count} requests
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                              <div
                                className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500"
                                style={{
                                  width: `${(item.count / (stats.totalRequests || 1)) * 100}%`,
                                }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                {stats?.subcategoryDistribution &&
                  stats.subcategoryDistribution.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-sm p-6 mb-8 border border-gray-100">
                      <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <span className="text-xl">⭐</span>
                        Most Requested Services
                      </h3>
                      <div className="space-y-3">
                        {stats.subcategoryDistribution
                          .slice(0, 5)
                          .map((item, idx) => (
                            <div
                              key={idx}
                              className="flex justify-between items-center p-3 bg-gray-50 rounded-xl"
                            >
                              <span className="text-gray-700 font-medium">
                                {item._id}
                              </span>
                              <span className="px-3 py-1 bg-purple-100 text-purple-600 rounded-lg font-semibold text-sm">
                                {item.count} requests
                              </span>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                {requests.length > 0 && (
                  <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                    <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <span className="text-xl">🕒</span>
                      Recent Requests
                    </h3>
                    <div className="space-y-3">
                      {requests.slice(0, 5).map((request) => (
                        <div
                          key={request._id}
                          className="flex justify-between items-center p-3 border-b last:border-0"
                        >
                          <div>
                            <p className="font-medium text-gray-800">
                              {request.name}
                            </p>
                            <p className="text-sm text-gray-500">
                              {request.subcategoryName}
                            </p>
                          </div>
                          <span
                            className={`px-3 py-1 text-xs font-medium rounded-full ${
                              request.status === "pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : request.status === "completed"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {request.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Modal for Create/Edit Category */}
      <Modal
        isOpen={modalOpen && modalType === "category"}
        onClose={() => setModalOpen(false)}
        title={editingCategory ? "Edit Category" : "Create New Category"}
      >
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Category Name *
            </label>
            <input
              type="text"
              value={categoryFormData.name}
              onChange={(e) =>
                setCategoryFormData({
                  ...categoryFormData,
                  name: e.target.value,
                })
              }
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="e.g., Readings, Spells, Reiki"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              value={categoryFormData.description}
              onChange={(e) =>
                setCategoryFormData({
                  ...categoryFormData,
                  description: e.target.value,
                })
              }
              rows={3}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Describe what this category offers..."
            />
          </div>

          {/* Image Upload with both URL and Local options */}
          <ImageUpload
            value={categoryFormData.icon}
            onChange={(url) =>
              setCategoryFormData({ ...categoryFormData, icon: url })
            }
            label="Icon Image"
          />

          <ImageUpload
            value={categoryFormData.image}
            onChange={(url) =>
              setCategoryFormData({ ...categoryFormData, image: url })
            }
            label="Banner Image"
          />

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Display Order
            </label>
            <input
              type="number"
              value={categoryFormData.order}
              onChange={(e) =>
                setCategoryFormData({
                  ...categoryFormData,
                  order: parseInt(e.target.value),
                })
              }
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl"
              placeholder="Used for sorting categories"
            />
            <p className="text-xs text-gray-500 mt-1">
              Lower numbers appear first
            </p>
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={categoryFormData.isActive}
              onChange={(e) =>
                setCategoryFormData({
                  ...categoryFormData,
                  isActive: e.target.checked,
                })
              }
              className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
            />
            <span className="text-sm text-gray-700">
              Active (visible to customers)
            </span>
          </label>

          <div className="flex gap-3 pt-4">
            <button
              onClick={handleSaveCategory}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:shadow-lg transition-all font-semibold"
            >
              {editingCategory ? "Update Category" : "Create Category"}
            </button>
            <button
              onClick={() => setModalOpen(false)}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all font-semibold"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal for Create/Edit Subcategory */}
      <Modal
        isOpen={modalOpen && modalType === "subcategory"}
        onClose={() => setModalOpen(false)}
        title={
          editingSubcategory
            ? "Edit Service"
            : `Add Service to ${selectedCategoryForSub?.name}`
        }
      >
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Service Name *
            </label>
            <input
              type="text"
              value={subcategoryFormData.name}
              onChange={(e) =>
                setSubcategoryFormData({
                  ...subcategoryFormData,
                  name: e.target.value,
                })
              }
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500"
              placeholder="e.g., Audio Note Session"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={subcategoryFormData.description}
              onChange={(e) =>
                setSubcategoryFormData({
                  ...subcategoryFormData,
                  description: e.target.value,
                })
              }
              rows={2}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500"
              placeholder="Describe the service details..."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Price (₹) *
              </label>
              <input
                type="number"
                value={subcategoryFormData.price}
                onChange={(e) =>
                  setSubcategoryFormData({
                    ...subcategoryFormData,
                    price: parseFloat(e.target.value),
                  })
                }
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl"
                placeholder="e.g., 700"
              />
              <p className="text-xs text-gray-500 mt-1">
                Service price in Indian Rupees
              </p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Duration *
              </label>
              <input
                type="text"
                value={subcategoryFormData.duration}
                onChange={(e) =>
                  setSubcategoryFormData({
                    ...subcategoryFormData,
                    duration: e.target.value,
                  })
                }
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl"
                placeholder="e.g., 30 mins, 1 hour"
              />
            </div>
          </div>

          {/* Image Upload for Subcategory */}
          <ImageUpload
            value={subcategoryFormData.icon}
            onChange={(url) =>
              setSubcategoryFormData({ ...subcategoryFormData, icon: url })
            }
            label="Service Icon"
          />

          <ImageUpload
            value={subcategoryFormData.image}
            onChange={(url) =>
              setSubcategoryFormData({ ...subcategoryFormData, image: url })
            }
            label="Service Image"
          />

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Display Order
            </label>
            <input
              type="number"
              value={subcategoryFormData.order}
              onChange={(e) =>
                setSubcategoryFormData({
                  ...subcategoryFormData,
                  order: parseInt(e.target.value),
                })
              }
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl"
              placeholder="Used for sorting services within category"
            />
            <p className="text-xs text-gray-500 mt-1">
              Lower numbers appear first in this category
            </p>
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={subcategoryFormData.isActive}
              onChange={(e) =>
                setSubcategoryFormData({
                  ...subcategoryFormData,
                  isActive: e.target.checked,
                })
              }
              className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
            />
            <span className="text-sm text-gray-700">
              Active (available for booking)
            </span>
          </label>

          <div className="flex gap-3 pt-4">
            <button
              onClick={handleSaveSubcategory}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:shadow-lg transition-all font-semibold"
            >
              {editingSubcategory ? "Update Service" : "Add Service"}
            </button>
            <button
              onClick={() => setModalOpen(false)}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all font-semibold"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>

      {/* Request Details Modal */}
      <RequestDetailsModal
        request={selectedRequest}
        isOpen={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        onStatusUpdate={handleUpdateRequestStatus}
      />
    </div>
  );
};

export default Package;
