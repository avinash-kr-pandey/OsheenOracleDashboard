"use client";
import {
  DashboardStats,
  Service,
  serviceAPI,
  ServiceRequest,
  serviceRequestAPI,
} from "@/utils/services.package";
import React, { useState, useEffect } from "react";
import Image from "next/image";

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

interface ServiceCardProps {
  service: Service;
  onEdit: (service: Service) => void;
  onDelete: (service: Service) => void;
  onToggle: (service: Service) => void;
}

interface StatCardProps {
  title: string;
  value: number;
  icon: string;
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
type ActiveTab = "services" | "requests" | "stats";

// ==================== COMPONENTS ====================

const TabButton: React.FC<TabButtonProps> = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`px-6 py-3 text-sm font-medium transition-all duration-200 rounded-lg ${
      active
        ? "bg-purple-600 text-white shadow-lg shadow-purple-500/30"
        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
    }`}
  >
    {children}
  </button>
);

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            &times;
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

// Request Details Modal Component
const RequestDetailsModal: React.FC<RequestDetailsModalProps> = ({
  request,
  isOpen,
  onClose,
  onStatusUpdate,
}) => {
  const [adminNotes, setAdminNotes] = useState(request?.adminNotes || "");
  const [status, setStatus] = useState(request?.status || "pending");

  if (!isOpen || !request) return null;

  const statusColors: Record<StatusType, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    confirmed: "bg-blue-100 text-blue-800",
    in_progress: "bg-purple-100 text-purple-800",
    completed: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
  };

  const communicationLabels: Record<CommunicationMode, string> = {
    voice_call: "📞 Voice Call",
    video_call: "📹 Video Call",
    voice_note: "🎤 Voice Note",
  };

  const handleSave = () => {
    onStatusUpdate(request._id, status, adminNotes);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">
            Request Details
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            &times;
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Header Section */}
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">
                {request.name}
              </h3>
              <p className="text-gray-500">{request.email}</p>
              <p className="text-gray-500">{request.phone}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Submitted on</p>
              <p className="font-medium">
                {new Date(request.createdAt).toLocaleString()}
              </p>
            </div>
          </div>

          {/* Status Section */}
          <div className="border-t pt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as StatusType)}
              className={`px-3 py-2 text-sm rounded-lg font-medium border ${statusColors[status as StatusType]}`}
            >
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4 border-t pt-4">
            <div>
              <label className="text-sm text-gray-500">Service</label>
              <p className="font-medium text-gray-800">{request.serviceName}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">
                Communication Mode
              </label>
              <p className="font-medium text-gray-800">
                {
                  communicationLabels[
                    request.communicationMode as CommunicationMode
                  ]
                }
              </p>
            </div>
            <div className="col-span-2">
              <label className="text-sm text-gray-500">Address</label>
              <p className="font-medium text-gray-800">{request.address}</p>
            </div>
            <div className="col-span-2">
              <label className="text-sm text-gray-500">Description</label>
              <p className="text-gray-700 mt-1 whitespace-pre-wrap">
                {request.description}
              </p>
            </div>
            {request.preferredDate && (
              <div>
                <label className="text-sm text-gray-500">Preferred Date</label>
                <p className="font-medium text-gray-800">
                  {new Date(request.preferredDate).toLocaleDateString()}
                </p>
              </div>
            )}
            {request.preferredTimeSlot && (
              <div>
                <label className="text-sm text-gray-500">Preferred Time</label>
                <p className="font-medium text-gray-800">
                  {request.preferredTimeSlot}
                </p>
              </div>
            )}
            <div>
              <label className="text-sm text-gray-500">Guest User</label>
              <p className="font-medium text-gray-800">
                {request.isGuest ? "Yes" : "No"}
              </p>
            </div>
          </div>

          {/* Admin Notes */}
          <div className="border-t pt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Admin Notes
            </label>
            <textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Add notes here..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              rows={3}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <button
              onClick={handleSave}
              className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Save Changes
            </button>
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ServiceCard: React.FC<ServiceCardProps> = ({
  service,
  onEdit,
  onDelete,
  onToggle,
}) => (
  <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
    <div className="relative h-32 bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
      {service.icon ? (
        <Image
          src={service.icon}
          alt={service.name}
          width={64}
          height={64}
          className="w-16 h-16 object-contain"
        />
      ) : (
        <div className="text-4xl">✨</div>
      )}
      <div className="absolute top-3 right-3">
        <span
          className={`px-2 py-1 text-xs rounded-full ${
            service.isActive
              ? "bg-green-500 text-white"
              : "bg-gray-500 text-white"
          }`}
        >
          {service.isActive ? "Active" : "Inactive"}
        </span>
      </div>
    </div>
    <div className="p-4">
      <h3 className="font-semibold text-lg text-gray-800 mb-1">
        {service.name}
      </h3>
      <p className="text-gray-500 text-sm mb-2 line-clamp-2">
        {service.description}
      </p>
      <div className="flex justify-between items-center mb-3">
        <span className="text-purple-600 font-bold">₹{service.price}</span>
        <span className="text-gray-400 text-sm">{service.duration}</span>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => onEdit(service)}
          className="flex-1 px-3 py-1.5 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"
        >
          Edit
        </button>
        <button
          onClick={() => onToggle(service)}
          className={`flex-1 px-3 py-1.5 text-sm rounded-lg ${
            service.isActive
              ? "bg-yellow-50 text-yellow-600 hover:bg-yellow-100"
              : "bg-green-50 text-green-600 hover:bg-green-100"
          }`}
        >
          {service.isActive ? "Deactivate" : "Activate"}
        </button>
        <button
          onClick={() => onDelete(service)}
          className="px-3 py-1.5 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
        >
          Delete
        </button>
      </div>
    </div>
  </div>
);

// Request Table Component
const RequestTable: React.FC<{
  requests: ServiceRequest[];
  onViewDetails: (request: ServiceRequest) => void;
}> = ({ requests, onViewDetails }) => {
  const statusColors: Record<StatusType, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    confirmed: "bg-blue-100 text-blue-800",
    in_progress: "bg-purple-100 text-purple-800",
    completed: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">
                Customer
              </th>
              <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">
                Phone
              </th>
              <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">
                Service
              </th>
              <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">
                Status
              </th>
              <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">
                Date
              </th>
              <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {requests.map((request) => (
              <tr
                key={request._id}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="px-4 py-3">
                  <p className="font-medium text-gray-800">{request.name}</p>
                  <p className="text-xs text-gray-500">{request.email}</p>
                </td>
                <td className="px-4 py-3 text-gray-600">{request.phone}</td>
                <td className="px-4 py-3">
                  <span className="text-sm text-gray-700">
                    {request.serviceName}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${statusColors[request.status as StatusType]}`}
                  >
                    {request.status.replace("_", " ")}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">
                  {new Date(request.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => onViewDetails(request)}
                    className="px-3 py-1 text-sm bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors"
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
  <div className="bg-white rounded-xl shadow-md p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-500 text-sm">{title}</p>
        <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
      </div>
      <div
        className={`w-12 h-12 rounded-full flex items-center justify-center ${color}`}
      >
        <span className="text-2xl">{icon}</span>
      </div>
    </div>
  </div>
);

// ==================== MAIN COMPONENT ====================

const Package: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>("services");
  const [services, setServices] = useState<Service[]>([]);
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState<boolean>(false);
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(
    null,
  );
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [formData, setFormData] = useState<Partial<Service>>({
    name: "",
    description: "",
    price: 0,
    duration: "1 hour",
    category: "General",
    isActive: true,
  });

  const fetchAllData = async (): Promise<void> => {
    setLoading(true);
    try {
      if (activeTab === "services") {
        const res = await serviceAPI.getAllServices();
        setServices(res.data || []);
      } else if (activeTab === "requests") {
        const res = await serviceRequestAPI.getAllRequests();
        setRequests(res.data || []);
      } else if (activeTab === "stats") {
        const res = await serviceRequestAPI.getDashboardStats();
        setStats(res.data);
        const requestsRes = await serviceRequestAPI.getAllRequests();
        setRequests(requestsRes.data || []);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [activeTab]);

  const handleSaveService = async (): Promise<void> => {
    try {
      if (editingService?._id) {
        const res = await serviceAPI.updateService(
          editingService._id,
          formData,
        );
        if (res.success) {
          alert("Service updated successfully!");
          fetchAllData();
          setModalOpen(false);
        }
      } else {
        const res = await serviceAPI.createService(formData);
        if (res.success) {
          alert("Service created successfully!");
          fetchAllData();
          setModalOpen(false);
        }
      }
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      alert(err.response?.data?.message || "Error saving service");
    }
  };

  const handleDeleteService = async (service: Service): Promise<void> => {
    if (confirm(`Are you sure you want to delete "${service.name}"?`)) {
      try {
        const res = await serviceAPI.deleteService(service._id);
        if (res.success) {
          alert("Service deleted successfully!");
          fetchAllData();
        }
      } catch (error) {
        const err = error as { response?: { data?: { message?: string } } };
        alert(err.response?.data?.message || "Error deleting service");
      }
    }
  };

  const handleToggleService = async (service: Service): Promise<void> => {
    try {
      const res = await serviceAPI.toggleServiceStatus(service._id);
      if (res.success) {
        fetchAllData();
      }
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      alert(err.response?.data?.message || "Error toggling status");
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
        fetchAllData();
        if (selectedRequest?._id === id) {
          const updatedRequest = await serviceRequestAPI.getRequestById(id);
          setSelectedRequest(updatedRequest.data);
        }
      }
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      alert(err.response?.data?.message || "Error updating status");
    }
  };

  const handleViewDetails = (request: ServiceRequest): void => {
    setSelectedRequest(request);
    setDetailsModalOpen(true);
  };

  const openEditModal = (service?: Service): void => {
    if (service) {
      setEditingService(service);
      setFormData(service);
    } else {
      setEditingService(null);
      setFormData({
        name: "",
        description: "",
        price: 0,
        duration: "1 hour",
        category: "General",
        isActive: true,
      });
    }
    setModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-800">
            🏆 Admin Dashboard
          </h1>
          <p className="text-gray-500 mt-1">
            Manage services, view requests, and track analytics
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-3 mb-8">
          <TabButton
            active={activeTab === "services"}
            onClick={() => setActiveTab("services")}
          >
            📦 Services
          </TabButton>
          <TabButton
            active={activeTab === "requests"}
            onClick={() => setActiveTab("requests")}
          >
            📋 Service Requests
          </TabButton>
          <TabButton
            active={activeTab === "stats"}
            onClick={() => setActiveTab("stats")}
          >
            📊 Statistics
          </TabButton>
        </div>

        {/* Services Tab */}
        {activeTab === "services" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">
                All Services
              </h2>
              <button
                onClick={() => openEditModal()}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
              >
                <span>+</span> Add New Service
              </button>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              </div>
            ) : services.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl">
                <p className="text-gray-500">
                  No services found. Create your first service!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.map((service) => (
                  <ServiceCard
                    key={service._id}
                    service={service}
                    onEdit={openEditModal}
                    onDelete={handleDeleteService}
                    onToggle={handleToggleService}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Requests Tab - Table View */}
        {activeTab === "requests" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">
                All Service Requests
              </h2>
              <p className="text-sm text-gray-500">
                Total: {requests.length} requests
              </p>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              </div>
            ) : requests.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl">
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
            <h2 className="text-xl font-semibold text-gray-800 mb-6">
              Dashboard Statistics
            </h2>
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                  <StatCard
                    title="Total Requests"
                    value={stats?.totalRequests || 0}
                    icon="📊"
                    color="bg-purple-100"
                  />
                  <StatCard
                    title="Pending"
                    value={stats?.pendingRequests || 0}
                    icon="⏳"
                    color="bg-yellow-100"
                  />
                  <StatCard
                    title="Completed"
                    value={stats?.completedRequests || 0}
                    icon="✅"
                    color="bg-green-100"
                  />
                  <StatCard
                    title="Cancelled"
                    value={stats?.cancelledRequests || 0}
                    icon="❌"
                    color="bg-red-100"
                  />
                </div>

                {stats?.serviceDistribution &&
                  stats.serviceDistribution.length > 0 && (
                    <div className="bg-white rounded-xl shadow-md p-6 mb-8">
                      <h3 className="font-semibold text-gray-800 mb-4">
                        Service Distribution
                      </h3>
                      <div className="space-y-3">
                        {stats.serviceDistribution.map((item, idx) => (
                          <div key={idx}>
                            <div className="flex justify-between text-sm mb-1">
                              <span>{item._id}</span>
                              <span className="text-purple-600 font-medium">
                                {item.count} requests
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-purple-600 h-2 rounded-full"
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

                {requests.length > 0 && (
                  <div className="bg-white rounded-xl shadow-md p-6">
                    <h3 className="font-semibold text-gray-800 mb-4">
                      Recent Requests
                    </h3>
                    <div className="space-y-3">
                      {requests.slice(0, 5).map((request) => (
                        <div
                          key={request._id}
                          className="flex justify-between items-center py-2 border-b"
                        >
                          <div>
                            <p className="font-medium text-gray-800">
                              {request.name}
                            </p>
                            <p className="text-sm text-gray-500">
                              {request.serviceName}
                            </p>
                          </div>
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${
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

      {/* Modal for Create/Edit Service */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingService ? "Edit Service" : "Add New Service"}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Service Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="e.g., Tarot Reading"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Describe the service..."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price (₹)
              </label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    price: parseFloat(e.target.value),
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duration
              </label>
              <input
                type="text"
                value={formData.duration}
                onChange={(e) =>
                  setFormData({ ...formData, duration: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="e.g., 30 mins"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="e.g., Readings"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Icon URL (optional)
              </label>
              <input
                type="text"
                value={formData.icon}
                onChange={(e) =>
                  setFormData({ ...formData, icon: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="https://..."
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) =>
                setFormData({ ...formData, isActive: e.target.checked })
              }
              className="w-4 h-4 text-purple-600"
            />
            <label className="text-sm text-gray-700">
              Active (visible to customers)
            </label>
          </div>
          <div className="flex gap-3 pt-4">
            <button
              onClick={handleSaveService}
              className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              {editingService ? "Update Service" : "Create Service"}
            </button>
            <button
              onClick={() => setModalOpen(false)}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
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
