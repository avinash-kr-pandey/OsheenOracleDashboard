"use client";


import { AddOn, Benefit, membershipAdminApi, MembershipApplication, MembershipPlan, Stat, StatusUpdateData, Testimonial } from "@/utils/becomeamember.api";
import {
  Edit2,
  Plus,
  Trash2,
  X,
  CheckCircle,
  Star,
  Download,
} from "lucide-react";
import React, { useState, useEffect, ChangeEvent } from "react";

// ==================== TYPES ====================

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

interface DashboardStats {
  totalApplications: number;
  pendingApplications: number;
  activeSubscriptions: number;
  cancelledApplications: number;
  recentApplications: MembershipApplication[];
  plansDistribution: Array<{ plan: string; count: number }>;
}

// ==================== TAB PANEL ====================

const TabPanel = ({ children, value, index }: TabPanelProps) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      className={value === index ? "block p-6" : "hidden"}
    >
      {value === index && children}
    </div>
  );
};

// ==================== MAIN COMPONENT ====================

const Member = () => {
  const [activeTab, setActiveTab] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  // State for data
  const [applications, setApplications] = useState<MembershipApplication[]>([]);
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [benefits, setBenefits] = useState<Benefit[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [addOns, setAddOns] = useState<AddOn[]>([]);
  const [stats, setStats] = useState<Stat[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(
    null,
  );

  // Modal states
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [dialogType, setDialogType] = useState<"add" | "edit">("add");
  const [dialogSection, setDialogSection] = useState<string>("");
  const [selectedItem, setSelectedItem] = useState<
    MembershipPlan | Benefit | Testimonial | AddOn | Stat | null
  >(null);
  const [formData, setFormData] = useState<Record<string, unknown>>({});
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [imageUrlInput, setImageUrlInput] = useState<string>("");
  const [imageSource, setImageSource] = useState<"file" | "url">("file");
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    type: "success" | "error" | "info" | "warning";
  }>({
    open: false,
    message: "",
    type: "success",
  });

  // Fetch all data
  useEffect(() => {
    fetchAllData();
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get("tab");
      if (tab === "stats") {
        setActiveTab(6);
      }
    }
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    setError("");
    try {
      const [
        appsRes,
        plansRes,
        benefitsRes,
        testimonialsRes,
        addOnsRes,
        statsRes,
        dashboardRes,
      ] = await Promise.all([
        membershipAdminApi.getAllApplications(),
        membershipAdminApi.getAllPlans(),
        membershipAdminApi.getAllBenefits(),
        membershipAdminApi.getAllTestimonials(),
        membershipAdminApi.getAllAddOns(),
        membershipAdminApi.getAllStats(),
        membershipAdminApi.getDashboardStats(),
      ]);

      if (appsRes.success) setApplications(appsRes.data || []);
      if (plansRes.success) setPlans(plansRes.data || []);
      if (benefitsRes.success) setBenefits(benefitsRes.data || []);
      if (testimonialsRes.success) setTestimonials(testimonialsRes.data || []);
      if (addOnsRes.success) setAddOns(addOnsRes.data || []);
      if (statsRes.success) setStats(statsRes.data || []);
      if (dashboardRes.success && dashboardRes.data)
        setDashboardStats(dashboardRes.data);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch data";
      setError(errorMessage);
      showSnackbar("Failed to fetch data", "error");
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (
    message: string,
    type: "success" | "error" | "info" | "warning",
  ): void => {
    setSnackbar({ open: true, message, type });
    setTimeout(() => setSnackbar((prev) => ({ ...prev, open: false })), 6000);
  };

  const handleTabChange = (index: number): void => {
    setActiveTab(index);
  };

  const handleOpenDialog = (
    section: string,
    type: "add" | "edit",
    item?: MembershipPlan | Benefit | Testimonial | AddOn | Stat,
  ): void => {
    setDialogSection(section);
    setDialogType(type);
    setSelectedItem(item || null);
    if (type === "add") {
      setFormData(getDefaultFormData(section));
    } else if (item) {
      setFormData(item as unknown as Record<string, unknown>);
    }
    setImageFile(null);
    setImagePreview("");
    setImageUrlInput("");
    setImageSource("file");
    setOpenDialog(true);
  };

  const getDefaultFormData = (section: string): Record<string, unknown> => {
    switch (section) {
      case "plan":
        return {
          id: "",
          name: "",
          price: "",
          period: "month",
          features: [],
          popular: false,
          order: 0,
          isActive: true,
        };
      case "benefit":
        return {
          icon: "",
          title: "",
          description: "",
          order: 0,
          isActive: true,
        };
      case "testimonial":
        return {
          avatar: "",
          content: "",
          name: "",
          role: "",
          rating: 5,
          order: 0,
          isActive: true,
        };
      case "addon":
        return {
          service: "",
          price: "",
          description: "",
          order: 0,
          isActive: true,
        };
      case "stat":
        return {
          number: "",
          label: "",
          order: 0,
          isActive: true,
        };
      default:
        return {};
    }
  };

  const handleCloseDialog = (): void => {
    setOpenDialog(false);
    setSelectedItem(null);
    setFormData({});
    setImageFile(null);
    setImagePreview("");
    setImageUrlInput("");
    setImageSource("file");
  };

  const handleFormChange = (field: string, value: unknown): void => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleArrayFieldChange = (field: string, value: string): void => {
    const features = (formData.features as string[]) || [];
    const newFeatures = value.split("\n").filter((f) => f.trim());
    setFormData((prev) => ({ ...prev, [field]: newFeatures }));
  };

  const handleImageSelect = (e: ChangeEvent<HTMLInputElement>): void => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImageSource("file");
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setFormData((prev) => ({ ...prev, image: "" }));
      setImageUrlInput("");
    }
  };

  const handleImageUrlInput = (url: string): void => {
    setImageUrlInput(url);
    setImageSource("url");
    setImagePreview(url);
    setImageFile(null);
    setFormData((prev) => ({ ...prev, image: url }));
  };

  const handleSubmit = async (): Promise<void> => {
    try {
      let response;
      const imageValue =
        imageSource === "url" && imageUrlInput
          ? imageUrlInput
          : (formData.image as string) || "";

      switch (dialogSection) {
        case "plan": {
          const data = {
            ...formData,
            image: imageValue,
          };
          if (dialogType === "add") {
            response = await membershipAdminApi.createPlan(
              data as any,
            );
          } else {
            response = await membershipAdminApi.updatePlan(
              (selectedItem as MembershipPlan)?._id || "",
              data as any,
            );
          }
          break;
        }
        case "benefit": {
          const data = {
            ...formData,
            image: imageValue,
          };
          if (dialogType === "add") {
            response = await membershipAdminApi.createBenefit(
              data as any,
            );
          } else {
            response = await membershipAdminApi.updateBenefit(
              (selectedItem as Benefit)?._id || "",
              data as any,
            );
          }
          break;
        }
        case "testimonial": {
          const data = {
            ...formData,
            image: imageValue,
          };
          if (dialogType === "add") {
            response = await membershipAdminApi.createTestimonial(
              data as any,
            );
          } else {
            response = await membershipAdminApi.updateTestimonial(
              (selectedItem as Testimonial)?._id || "",
              data as any,
            );
          }
          break;
        }
        case "addon": {
          const data = {
            ...formData,
            image: imageValue,
          };
          if (dialogType === "add") {
            response = await membershipAdminApi.createAddOn(
              data as any,
            );
          } else {
            response = await membershipAdminApi.updateAddOn(
              (selectedItem as AddOn)?._id || "",
              data as any,
            );
          }
          break;
        }
        case "stat": {
          const data = {
            ...formData,
            image: imageValue,
          };
          if (dialogType === "add") {
            response = await membershipAdminApi.createStat(
              data as any,
            );
          } else {
            response = await membershipAdminApi.updateStat(
              (selectedItem as Stat)?._id || "",
              data as any,
            );
          }
          break;
        }
        default:
          return;
      }

      if (response?.success) {
        showSnackbar(
          `${dialogSection} ${dialogType === "add" ? "added" : "updated"} successfully`,
          "success",
        );
        handleCloseDialog();
        fetchAllData();
      } else {
        showSnackbar(response?.message || "Operation failed", "error");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      showSnackbar(
        error instanceof Error ? error.message : "Error submitting form",
        "error",
      );
    }
  };

  const handleDelete = async (section: string, id: string): Promise<void> => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      try {
        let response;
        switch (section) {
          case "plan":
            response = await membershipAdminApi.deletePlan(id);
            break;
          case "benefit":
            response = await membershipAdminApi.deleteBenefit(id);
            break;
          case "testimonial":
            response = await membershipAdminApi.deleteTestimonial(id);
            break;
          case "addon":
            response = await membershipAdminApi.deleteAddOn(id);
            break;
          case "stat":
            response = await membershipAdminApi.deleteStat(id);
            break;
          case "application":
            response = await membershipAdminApi.deleteApplication(id);
            break;
          default:
            return;
        }

        if (response?.success) {
          showSnackbar("Item deleted successfully", "success");
          fetchAllData();
        } else {
          showSnackbar(response?.message || "Delete failed", "error");
        }
      } catch (error) {
        console.error("Error deleting item:", error);
        showSnackbar("Error deleting item", "error");
      }
    }
  };

  const handleStatusUpdate = async (
    id: string,
    status: StatusUpdateData["status"],
  ): Promise<void> => {
    try {
      const response = await membershipAdminApi.updateApplicationStatus(id, {
        status,
      });
      if (response.success) {
        showSnackbar("Status updated successfully", "success");
        fetchAllData();
      }
    } catch (err) {
      showSnackbar("Failed to update status", "error");
    }
  };

  const handleExportCSV = async (): Promise<void> => {
    try {
      const blob = await membershipAdminApi.exportApplications();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `membership-applications-${new Date().toISOString()}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      showSnackbar("Export successful", "success");
    } catch (error) {
      showSnackbar("Export failed", "error");
    }
  };

  const tabs = [
    "Dashboard",
    "Applications",
    "Membership Plans",
    "Benefits",
    "Testimonials",
    "Add-ons",
    "Stats",
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Membership Management
          </h1>
          <p className="mt-2 text-gray-600">
            Manage all membership content from here. Add, edit, or delete
            sections as needed.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex overflow-x-auto">
              {tabs.map((tab, index) => (
                <button
                  key={index}
                  onClick={() => handleTabChange(index)}
                  className={`px-6 py-3 text-sm font-medium whitespace-nowrap ${
                    activeTab === index
                      ? "border-b-2 border-purple-600 text-purple-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>

          <TabPanel value={activeTab} index={0}>
            <DashboardContent
              dashboardStats={dashboardStats}
              applications={applications}
              plans={plans}
            />
          </TabPanel>

          <TabPanel value={activeTab} index={1}>
            <ApplicationsContent
              applications={applications}
              onStatusUpdate={handleStatusUpdate}
              onDelete={(id) => handleDelete("application", id)}
              onExport={handleExportCSV}
            />
          </TabPanel>

          <TabPanel value={activeTab} index={2}>
            <PlansContent
              data={plans}
              onAdd={() => handleOpenDialog("plan", "add")}
              onEdit={(item) => handleOpenDialog("plan", "edit", item)}
              onDelete={(id) => handleDelete("plan", id)}
            />
          </TabPanel>

          <TabPanel value={activeTab} index={3}>
            <BenefitsContent
              data={benefits}
              onAdd={() => handleOpenDialog("benefit", "add")}
              onEdit={(item) => handleOpenDialog("benefit", "edit", item)}
              onDelete={(id) => handleDelete("benefit", id)}
            />
          </TabPanel>

          <TabPanel value={activeTab} index={4}>
            <TestimonialsContent
              data={testimonials}
              onAdd={() => handleOpenDialog("testimonial", "add")}
              onEdit={(item) => handleOpenDialog("testimonial", "edit", item)}
              onDelete={(id) => handleDelete("testimonial", id)}
            />
          </TabPanel>

          <TabPanel value={activeTab} index={5}>
            <AddOnsContent
              data={addOns}
              onAdd={() => handleOpenDialog("addon", "add")}
              onEdit={(item) => handleOpenDialog("addon", "edit", item)}
              onDelete={(id) => handleDelete("addon", id)}
            />
          </TabPanel>

          <TabPanel value={activeTab} index={6}>
            <StatsContent
              data={stats}
              onAdd={() => handleOpenDialog("stat", "add")}
              onEdit={(item) => handleOpenDialog("stat", "edit", item)}
              onDelete={(id) => handleDelete("stat", id)}
            />
          </TabPanel>
        </div>
      </div>

      {/* Dialog Modal */}
      {openDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">
                {dialogType === "add" ? "Add New" : "Edit"} {dialogSection}
              </h2>
              <button
                onClick={handleCloseDialog}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <FormDialogContent
                section={dialogSection}
                formData={formData}
                onFormChange={handleFormChange}
                onArrayFieldChange={handleArrayFieldChange}
                imagePreview={imagePreview}
                imageUrlInput={imageUrlInput}
                imageSource={imageSource}
                onImageSelect={handleImageSelect}
                onImageUrlInput={handleImageUrlInput}
              />
            </div>
            <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
              <button
                onClick={handleCloseDialog}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
              >
                {dialogType === "add" ? "Add" : "Update"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Snackbar */}
      {snackbar.open && (
        <div className="fixed bottom-4 right-4 z-50 animate-slide-up">
          <div
            className={`px-4 py-3 rounded-lg shadow-lg ${
              snackbar.type === "success"
                ? "bg-green-500 text-white"
                : snackbar.type === "error"
                  ? "bg-red-500 text-white"
                  : snackbar.type === "warning"
                    ? "bg-yellow-500 text-white"
                    : "bg-blue-500 text-white"
            }`}
          >
            {snackbar.message}
          </div>
        </div>
      )}
    </div>
  );
};

// ==================== DASHBOARD CONTENT ====================

const DashboardContent: React.FC<{
  dashboardStats: DashboardStats | null;
  applications: MembershipApplication[];
  plans: MembershipPlan[];
}> = ({ dashboardStats, plans }) => {
  if (!dashboardStats) return null;

  const stats = [
    { label: "Total Applications", value: dashboardStats.totalApplications },
    { label: "Pending", value: dashboardStats.pendingApplications },
    {
      label: "Active Subscriptions",
      value: dashboardStats.activeSubscriptions,
    },
    { label: "Cancelled", value: dashboardStats.cancelledApplications },
  ];

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, idx) => (
          <div
            key={idx}
            className="bg-white border border-gray-200 rounded-lg p-6"
          >
            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
            <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Plans Distribution
            </h3>
          </div>
          <div className="p-6 space-y-4">
            {dashboardStats.plansDistribution?.map((item, idx) => {
              const matchedPlan = plans.find(p => p._id === item.plan || p.id === item.plan);
              const planName = matchedPlan ? matchedPlan.name : item.plan;
              return (
                <div key={idx}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">{planName}</span>
                    <span className="text-gray-500">{item.count}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className="bg-purple-600 rounded-full h-2"
                      style={{
                        width: `${(item.count / (dashboardStats.totalApplications || 1)) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Recent Applications
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {dashboardStats.recentApplications?.slice(0, 5).map((app) => (
                <div
                  key={app._id}
                  className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0"
                >
                  <div>
                    <div className="font-medium text-gray-900">{app.name}</div>
                    <div className="text-sm text-gray-500">{app.email}</div>
                  </div>
                  <div>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        app.status === "active"
                          ? "bg-green-100 text-green-700"
                          : app.status === "pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
                      }`}
                    >
                      {app.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==================== APPLICATIONS CONTENT ====================

const ApplicationsContent: React.FC<{
  applications: MembershipApplication[];
  onStatusUpdate: (id: string, status: StatusUpdateData["status"]) => void;
  onDelete: (id: string) => void;
  onExport: () => void;
}> = ({ applications, onStatusUpdate, onDelete, onExport }) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Membership Applications</h3>
        <button
          onClick={onExport}
          className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
        >
          <Download className="w-4 h-4 mr-2" /> Export CSV
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                Name
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                Email
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                Phone
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                Plan
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                Status
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                Newsletter
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {applications.map((app) => (
              <tr
                key={app._id}
                className="border-b border-gray-100 hover:bg-gray-50"
              >
                <td className="py-3 px-4 text-sm text-gray-900">{app.name}</td>
                <td className="py-3 px-4 text-sm text-gray-500">{app.email}</td>
                <td className="py-3 px-4 text-sm text-gray-500">
                  {app.phone || "-"}
                </td>
                <td className="py-3 px-4 text-sm text-gray-500">{app.plan}</td>
                <td className="py-3 px-4">
                  <select
                    value={app.status}
                    onChange={(e) =>
                      onStatusUpdate(
                        app._id,
                        e.target.value as StatusUpdateData["status"],
                      )
                    }
                    className="text-sm border border-gray-300 rounded px-2 py-1 bg-white"
                  >
                    <option value="pending">Pending</option>
                    <option value="contacted">Contacted</option>
                    <option value="active">Active</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </td>
                <td className="py-3 px-4 text-sm text-gray-500">
                  {app.newsletter ? "Yes" : "No"}
                </td>
                <td className="py-3 px-4">
                  <button
                    onClick={() => onDelete(app._id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {applications.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No applications found.
          </div>
        )}
      </div>
    </div>
  );
};

// ==================== PLANS CONTENT ====================

const PlansContent: React.FC<{
  data: MembershipPlan[];
  onAdd: () => void;
  onEdit: (item: MembershipPlan) => void;
  onDelete: (id: string) => void;
}> = ({ data, onAdd, onEdit, onDelete }) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Membership Plans</h3>
        <button
          onClick={onAdd}
          className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
        >
          <Plus className="w-4 h-4 mr-2" /> Add Plan
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.map((plan) => (
          <div
            key={plan._id}
            className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition"
          >
            <div className="p-5">
              <div className="flex justify-between items-start mb-2">
                <h4 className="text-lg font-semibold text-gray-900">
                  {plan.name}
                </h4>
                {plan.popular && (
                  <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                    Popular
                  </span>
                )}
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {plan.price}
              </div>
              <div className="text-sm text-gray-500 mb-3">/{plan.period}</div>
              <ul className="space-y-1 mb-4">
                {plan.features.slice(0, 3).map((feature, idx) => (
                  <li
                    key={idx}
                    className="text-sm text-gray-600 flex items-start gap-2"
                  >
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
                {plan.features.length > 3 && (
                  <li className="text-sm text-gray-400">
                    +{plan.features.length - 3} more features
                  </li>
                )}
              </ul>
              <div className="flex gap-2 pt-2 border-t border-gray-100">
                <button
                  onClick={() => onEdit(plan)}
                  className="flex-1 inline-flex items-center justify-center px-3 py-1.5 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                >
                  <Edit2 className="w-4 h-4 mr-1" /> Edit
                </button>
                <button
                  onClick={() => onDelete(plan._id)}
                  className="flex-1 inline-flex items-center justify-center px-3 py-1.5 text-sm text-red-700 bg-red-50 rounded-lg hover:bg-red-100 transition"
                >
                  <Trash2 className="w-4 h-4 mr-1" /> Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {data.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No plans found. Click Add Plan to create one.
        </div>
      )}
    </div>
  );
};

// ==================== BENEFITS CONTENT ====================

const BenefitsContent: React.FC<{
  data: Benefit[];
  onAdd: () => void;
  onEdit: (item: Benefit) => void;
  onDelete: (id: string) => void;
}> = ({ data, onAdd, onEdit, onDelete }) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Benefits</h3>
        <button
          onClick={onAdd}
          className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
        >
          <Plus className="w-4 h-4 mr-2" /> Add Benefit
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.map((benefit) => (
          <div
            key={benefit._id}
            className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition"
          >
            <div className="text-4xl mb-3">{benefit.icon}</div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">
              {benefit.title}
            </h4>
            <p className="text-sm text-gray-600 mb-4">{benefit.description}</p>
            <div className="flex gap-2 pt-2 border-t border-gray-100">
              <button
                onClick={() => onEdit(benefit)}
                className="flex-1 inline-flex items-center justify-center px-3 py-1.5 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
              >
                <Edit2 className="w-4 h-4 mr-1" /> Edit
              </button>
              <button
                onClick={() => onDelete(benefit._id)}
                className="flex-1 inline-flex items-center justify-center px-3 py-1.5 text-sm text-red-700 bg-red-50 rounded-lg hover:bg-red-100 transition"
              >
                <Trash2 className="w-4 h-4 mr-1" /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>
      {data.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No benefits found. Click Add Benefit to create one.
        </div>
      )}
    </div>
  );
};

// ==================== TESTIMONIALS CONTENT ====================

const TestimonialsContent: React.FC<{
  data: Testimonial[];
  onAdd: () => void;
  onEdit: (item: Testimonial) => void;
  onDelete: (id: string) => void;
}> = ({ data, onAdd, onEdit, onDelete }) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Testimonials</h3>
        <button
          onClick={onAdd}
          className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
        >
          <Plus className="w-4 h-4 mr-2" /> Add Testimonial
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {data.map((testimonial) => (
          <div
            key={testimonial._id}
            className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition"
          >
            <div className="flex gap-4">
              <div className="text-4xl">{testimonial.avatar}</div>
              <div className="flex-1">
                <p className="text-gray-600 italic mb-3">
                  "{testimonial.content}"
                </p>
                <div className="font-semibold text-gray-900">
                  {testimonial.name}
                </div>
                <div className="text-sm text-gray-500 mb-2">
                  {testimonial.role}
                </div>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${i < testimonial.rating ? "text-yellow-400 fill-current" : "text-gray-300"}`}
                    />
                  ))}
                </div>
                <div className="flex gap-2 mt-3 pt-2 border-t border-gray-100">
                  <button
                    onClick={() => onEdit(testimonial)}
                    className="flex-1 inline-flex items-center justify-center px-3 py-1.5 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                  >
                    <Edit2 className="w-4 h-4 mr-1" /> Edit
                  </button>
                  <button
                    onClick={() => onDelete(testimonial._id)}
                    className="flex-1 inline-flex items-center justify-center px-3 py-1.5 text-sm text-red-700 bg-red-50 rounded-lg hover:bg-red-100 transition"
                  >
                    <Trash2 className="w-4 h-4 mr-1" /> Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      {data.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No testimonials found. Click Add Testimonial to create one.
        </div>
      )}
    </div>
  );
};

// ==================== ADD-ONS CONTENT ====================

const AddOnsContent: React.FC<{
  data: AddOn[];
  onAdd: () => void;
  onEdit: (item: AddOn) => void;
  onDelete: (id: string) => void;
}> = ({ data, onAdd, onEdit, onDelete }) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Add-on Services</h3>
        <button
          onClick={onAdd}
          className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
        >
          <Plus className="w-4 h-4 mr-2" /> Add Service
        </button>
      </div>
      <div className="divide-y divide-gray-200 border border-gray-200 rounded-lg">
        {data.map((addon) => (
          <div
            key={addon._id}
            className="flex justify-between items-center p-4 hover:bg-gray-50"
          >
            <div>
              <h4 className="font-medium text-gray-900">{addon.service}</h4>
              {addon.description && (
                <p className="text-sm text-gray-500 mt-1">
                  {addon.description}
                </p>
              )}
            </div>
            <div className="flex items-center gap-4">
              <span className="text-lg font-semibold text-purple-600">
                {addon.price}
              </span>
              <button
                onClick={() => onEdit(addon)}
                className="text-gray-500 hover:text-gray-700"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDelete(addon._id)}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
      {data.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No add-ons found. Click Add Service to create one.
        </div>
      )}
    </div>
  );
};

// ==================== STATS CONTENT ====================

const StatsContent: React.FC<{
  data: Stat[];
  onAdd: () => void;
  onEdit: (item: Stat) => void;
  onDelete: (id: string) => void;
}> = ({ data, onAdd, onEdit, onDelete }) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Statistics</h3>
        <button
          onClick={onAdd}
          className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
        >
          <Plus className="w-4 h-4 mr-2" /> Add Stat
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {data.map((stat) => (
          <div
            key={stat._id}
            className="bg-white border border-gray-200 rounded-lg p-6 text-center hover:shadow-md transition"
          >
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {stat.number}
            </div>
            <div className="text-sm text-gray-500 mb-4">{stat.label}</div>
            <div className="flex gap-2 justify-center pt-2 border-t border-gray-100">
              <button
                onClick={() => onEdit(stat)}
                className="inline-flex items-center px-3 py-1.5 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
              >
                <Edit2 className="w-4 h-4 mr-1" /> Edit
              </button>
              <button
                onClick={() => onDelete(stat._id)}
                className="inline-flex items-center px-3 py-1.5 text-sm text-red-700 bg-red-50 rounded-lg hover:bg-red-100 transition"
              >
                <Trash2 className="w-4 h-4 mr-1" /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>
      {data.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No stats found. Click Add Stat to create one.
        </div>
      )}
    </div>
  );
};

// ==================== FORM DIALOG CONTENT ====================

const FormDialogContent: React.FC<{
  section: string;
  formData: Record<string, unknown>;
  onFormChange: (field: string, value: unknown) => void;
  onArrayFieldChange: (field: string, value: string) => void;
  imagePreview: string;
  imageUrlInput: string;
  imageSource: "file" | "url";
  onImageSelect: (e: ChangeEvent<HTMLInputElement>) => void;
  onImageUrlInput: (url: string) => void;
}> = ({ section, formData, onFormChange, onArrayFieldChange }) => {
  switch (section) {
    case "plan":
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Plan ID
            </label>
            <input
              type="text"
              value={(formData.id as string) || ""}
              onChange={(e) => onFormChange("id", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Plan Name
            </label>
            <input
              type="text"
              value={(formData.name as string) || ""}
              onChange={(e) => onFormChange("name", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Price
            </label>
            <input
              type="text"
              value={(formData.price as string) || ""}
              onChange={(e) => onFormChange("price", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Period
            </label>
            <select
              value={(formData.period as string) || "month"}
              onChange={(e) => onFormChange("period", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="month">Monthly</option>
              <option value="quarter">Quarterly</option>
              <option value="year">Yearly</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Features (one per line)
            </label>
            <textarea
              rows={5}
              value={((formData.features as string[]) || []).join("\n")}
              onChange={(e) => onArrayFieldChange("features", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
              required
            />
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={(formData.popular as boolean) || false}
                onChange={(e) => onFormChange("popular", e.target.checked)}
                className="w-4 h-4 text-purple-600 rounded"
              />
              <span className="text-sm text-gray-700">Popular Plan</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={(formData.isActive as boolean) !== false}
                onChange={(e) => onFormChange("isActive", e.target.checked)}
                className="w-4 h-4 text-purple-600 rounded"
              />
              <span className="text-sm text-gray-700">Active</span>
            </label>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Order
            </label>
            <input
              type="number"
              value={(formData.order as number) || 0}
              onChange={(e) => onFormChange("order", parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
        </div>
      );
    case "benefit":
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Icon (emoji)
            </label>
            <input
              type="text"
              value={(formData.icon as string) || ""}
              onChange={(e) => onFormChange("icon", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              type="text"
              value={(formData.title as string) || ""}
              onChange={(e) => onFormChange("title", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              rows={3}
              value={(formData.description as string) || ""}
              onChange={(e) => onFormChange("description", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              required
            />
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={(formData.isActive as boolean) !== false}
                onChange={(e) => onFormChange("isActive", e.target.checked)}
                className="w-4 h-4 text-purple-600 rounded"
              />
              <span className="text-sm text-gray-700">Active</span>
            </label>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Order
            </label>
            <input
              type="number"
              value={(formData.order as number) || 0}
              onChange={(e) => onFormChange("order", parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
        </div>
      );
    case "testimonial":
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Avatar (emoji)
            </label>
            <input
              type="text"
              value={(formData.avatar as string) || ""}
              onChange={(e) => onFormChange("avatar", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Content
            </label>
            <textarea
              rows={3}
              value={(formData.content as string) || ""}
              onChange={(e) => onFormChange("content", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              value={(formData.name as string) || ""}
              onChange={(e) => onFormChange("name", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <input
              type="text"
              value={(formData.role as string) || ""}
              onChange={(e) => onFormChange("role", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rating (1-5)
            </label>
            <input
              type="number"
              min="1"
              max="5"
              step="0.1"
              value={(formData.rating as number) || 5}
              onChange={(e) =>
                onFormChange("rating", parseFloat(e.target.value))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={(formData.isActive as boolean) !== false}
                onChange={(e) => onFormChange("isActive", e.target.checked)}
                className="w-4 h-4 text-purple-600 rounded"
              />
              <span className="text-sm text-gray-700">Active</span>
            </label>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Order
            </label>
            <input
              type="number"
              value={(formData.order as number) || 0}
              onChange={(e) => onFormChange("order", parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
        </div>
      );
    case "addon":
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Service Name
            </label>
            <input
              type="text"
              value={(formData.service as string) || ""}
              onChange={(e) => onFormChange("service", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Price
            </label>
            <input
              type="text"
              value={(formData.price as string) || ""}
              onChange={(e) => onFormChange("price", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description (optional)
            </label>
            <textarea
              rows={2}
              value={(formData.description as string) || ""}
              onChange={(e) => onFormChange("description", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={(formData.isActive as boolean) !== false}
                onChange={(e) => onFormChange("isActive", e.target.checked)}
                className="w-4 h-4 text-purple-600 rounded"
              />
              <span className="text-sm text-gray-700">Active</span>
            </label>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Order
            </label>
            <input
              type="number"
              value={(formData.order as number) || 0}
              onChange={(e) => onFormChange("order", parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
        </div>
      );
    case "stat":
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Number (e.g., 5,000+)
            </label>
            <input
              type="text"
              value={(formData.number as string) || ""}
              onChange={(e) => onFormChange("number", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Label (e.g., Spiritual Seekers)
            </label>
            <input
              type="text"
              value={(formData.label as string) || ""}
              onChange={(e) => onFormChange("label", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              required
            />
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={(formData.isActive as boolean) !== false}
                onChange={(e) => onFormChange("isActive", e.target.checked)}
                className="w-4 h-4 text-purple-600 rounded"
              />
              <span className="text-sm text-gray-700">Active</span>
            </label>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Order
            </label>
            <input
              type="number"
              value={(formData.order as number) || 0}
              onChange={(e) => onFormChange("order", parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
        </div>
      );
    default:
      return null;
  }
};

export default Member;
