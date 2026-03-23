"use client";

import homeAPI, { Catalogue, DiscoverPath, ExpertGuide, HomeData, MediaSpotlight } from "@/utils/home.api";
import { CheckCircle, Edit2, Plus, Star, Trash2, Upload, X } from "lucide-react";
import Image from "next/image";
import React, { useState, useEffect } from "react";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

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

const Home: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [homeData, setHomeData] = useState<HomeData | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState<"add" | "edit">("add");
  const [dialogSection, setDialogSection] = useState<string>("");
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    type: "success" as "success" | "error" | "info" | "warning",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  useEffect(() => {
    fetchHomeData();
  }, []);

  const fetchHomeData = async () => {
    try {
      setLoading(true);
      const response = await homeAPI.getAllHomeData();
      if (response.success) {
        setHomeData(response.data);
      } else {
        showSnackbar(response.message || "Error fetching home data", "error");
      }
    } catch (error: any) {
      console.error("Error fetching home data:", error);
      showSnackbar(error?.message || "Error fetching home data", "error");
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (
    message: string,
    type: "success" | "error" | "info" | "warning",
  ) => {
    setSnackbar({ open: true, message, type });
    setTimeout(() => setSnackbar({ ...snackbar, open: false }), 6000);
  };

  const handleTabChange = (index: number) => {
    setActiveTab(index);
  };

  const handleOpenDialog = (
    section: string,
    type: "add" | "edit",
    item?: any,
  ) => {
    setDialogSection(section);
    setDialogType(type);
    setSelectedItem(item || null);
    if (type === "add") {
      setFormData(getDefaultFormData(section));
    } else if (item) {
      setFormData(item);
    }
    setImageFile(null);
    setImagePreview("");
    setOpenDialog(true);
  };

  const getDefaultFormData = (section: string) => {
    switch (section) {
      case "discoverPath":
        return { title: "", description: "", order: 0, isActive: true };
      case "mediaSpotlight":
        return { title: "", logo: "", link: "", order: 0, isActive: true };
      case "catalogue":
        return {
          title: "",
          description: "",
          details: {
            bookYourReading: {
              title: "Book Your Reading",
              description: "",
              price: 0,
              duration: "60 mins",
              buttonText: "Book Now",
            },
            keyTraits: [],
            benefits: [],
            completePackage: {
              title: "Complete Package",
              includes: [],
              price: 0,
              discountPrice: 0,
            },
          },
          order: 0,
          isActive: true,
        };
      case "expertGuide":
        return {
          name: "",
          rating: 4.8,
          reviews: 892,
          satisfactionRate: 92,
          expertise: "",
          experience: "15+ years",
          languages: [],
          expertiseAreas: [],
          isVerified: true,
          order: 0,
          isActive: true,
        };
      default:
        return {};
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedItem(null);
    setFormData({});
    setImageFile(null);
    setImagePreview("");
  };

  const handleFormChange = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleNestedFormChange = (
    parent: string,
    field: string,
    value: any,
  ) => {
    setFormData({
      ...formData,
      [parent]: {
        ...formData[parent],
        [field]: value,
      },
    });
  };

  const handleArrayFieldChange = (
    parent: string,
    arrayField: string,
    index: number,
    field: string,
    value: string,
  ) => {
    const newArray = [...(formData[parent]?.[arrayField] || [])];
    newArray[index] = { ...newArray[index], [field]: value };
    setFormData({
      ...formData,
      [parent]: {
        ...formData[parent],
        [arrayField]: newArray,
      },
    });
  };

  const addArrayItem = (parent: string, arrayField: string, newItem: any) => {
    setFormData({
      ...formData,
      [parent]: {
        ...formData[parent],
        [arrayField]: [...(formData[parent]?.[arrayField] || []), newItem],
      },
    });
  };

  const removeArrayItem = (
    parent: string,
    arrayField: string,
    index: number,
  ) => {
    const newArray = [...(formData[parent]?.[arrayField] || [])];
    newArray.splice(index, 1);
    setFormData({
      ...formData,
      [parent]: {
        ...formData[parent],
        [arrayField]: newArray,
      },
    });
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    try {
      let response;
      switch (dialogSection) {
        case "discoverPath":
          if (dialogType === "add") {
            response = await homeAPI.addDiscoverPath(formData);
          } else {
            response = await homeAPI.updateDiscoverPath(
              selectedItem._id,
              formData,
            );
          }
          break;
        case "mediaSpotlight":
          if (dialogType === "add" && imageFile) {
            response = await homeAPI.addMediaSpotlight(imageFile, formData);
          } else if (dialogType === "edit") {
            response = await homeAPI.updateMediaSpotlight(
              selectedItem._id,
              formData,
            );
          }
          break;
        case "catalogue":
          if (dialogType === "add") {
            response = await homeAPI.addCatalogue(formData);
          } else {
            response = await homeAPI.updateCatalogue(
              selectedItem._id,
              formData,
            );
          }
          break;
        case "expertGuide":
          if (dialogType === "add") {
            response = await homeAPI.addExpertGuide(formData);
          } else {
            response = await homeAPI.updateExpertGuide(
              selectedItem._id,
              formData,
            );
          }
          break;
        default:
          return;
      }

      if (response?.success) {
        showSnackbar(
          `${dialogSection} ${dialogType === "add" ? "added" : "updated"} successfully`,
          "success",
        );
        handleCloseDialog();
        fetchHomeData();
      } else {
        showSnackbar(response?.message || "Operation failed", "error");
      }
    } catch (error: any) {
      console.error("Error submitting form:", error);
      showSnackbar(error?.message || "Error submitting form", "error");
    }
  };

  const handleDelete = async (section: string, id: string) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      try {
        let response;
        switch (section) {
          case "discoverPath":
            response = await homeAPI.deleteDiscoverPath(id);
            break;
          case "mediaSpotlight":
            response = await homeAPI.deleteMediaSpotlight(id);
            break;
          case "catalogue":
            response = await homeAPI.deleteCatalogue(id);
            break;
          case "expertGuide":
            response = await homeAPI.deleteExpertGuide(id);
            break;
          default:
            return;
        }

        if (response?.success) {
          showSnackbar("Item deleted successfully", "success");
          fetchHomeData();
        } else {
          showSnackbar(response?.message || "Delete failed", "error");
        }
      } catch (error: any) {
        console.error("Error deleting item:", error);
        showSnackbar(error?.message || "Error deleting item", "error");
      }
    }
  };

  const handleImageUpload = async (section: string, id: string, file: File) => {
    try {
      let response;
      switch (section) {
        case "discoverPath":
          response = await homeAPI.uploadDiscoverPathImage(id, file);
          break;
        case "catalogue":
          response = await homeAPI.uploadCatalogueImage(id, file);
          break;
        case "expertGuide":
          response = await homeAPI.uploadExpertGuideImage(id, file);
          break;
        default:
          return;
      }

      if (response?.success) {
        showSnackbar("Image uploaded successfully", "success");
        fetchHomeData();
      } else {
        showSnackbar(response?.message || "Upload failed", "error");
      }
    } catch (error: any) {
      console.error("Error uploading image:", error);
      showSnackbar(error?.message || "Error uploading image", "error");
    }
  };

  const tabs = [
    "Discover Section",
    "Discover Your Path",
    "Achievements",
    "Media Spotlight",
    "Catalogue",
    "Expert Guides",
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
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Home Page Management
          </h1>
          <p className="mt-2 text-gray-600">
            Manage all home page content from here. Add, edit, or delete
            sections as needed.
          </p>
        </div>

        {/* Tabs */}
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

          {/* Discover Section Tab */}
          <TabPanel value={activeTab} index={0}>
            <DiscoverSectionEditor
              homeData={homeData}
              onUpdate={fetchHomeData}
              showSnackbar={showSnackbar}
            />
          </TabPanel>

          {/* Discover Your Path Tab */}
          <TabPanel value={activeTab} index={1}>
            <DiscoverPathEditor
              data={homeData?.discoverYourPath || []}
              onAdd={() => handleOpenDialog("discoverPath", "add")}
              onEdit={(item) => handleOpenDialog("discoverPath", "edit", item)}
              onDelete={(id) => handleDelete("discoverPath", id)}
              onImageUpload={(id, file) =>
                handleImageUpload("discoverPath", id, file)
              }
            />
          </TabPanel>

          {/* Achievements Tab */}
          <TabPanel value={activeTab} index={2}>
            <AchievementsEditor
              homeData={homeData}
              onUpdate={fetchHomeData}
              showSnackbar={showSnackbar}
            />
          </TabPanel>

          {/* Media Spotlight Tab */}
          <TabPanel value={activeTab} index={3}>
            <MediaSpotlightEditor
              data={homeData?.mediaSpotlight || []}
              onAdd={() => handleOpenDialog("mediaSpotlight", "add")}
              onEdit={(item) =>
                handleOpenDialog("mediaSpotlight", "edit", item)
              }
              onDelete={(id) => handleDelete("mediaSpotlight", id)}
            />
          </TabPanel>

          {/* Catalogue Tab */}
          <TabPanel value={activeTab} index={4}>
            <CatalogueEditor
              data={homeData?.catalogue || []}
              onAdd={() => handleOpenDialog("catalogue", "add")}
              onEdit={(item) => handleOpenDialog("catalogue", "edit", item)}
              onDelete={(id) => handleDelete("catalogue", id)}
              onImageUpload={(id, file) =>
                handleImageUpload("catalogue", id, file)
              }
            />
          </TabPanel>

          {/* Expert Guides Tab */}
          <TabPanel value={activeTab} index={5}>
            <ExpertGuidesEditor
              data={homeData?.expertGuides || []}
              onAdd={() => handleOpenDialog("expertGuide", "add")}
              onEdit={(item) => handleOpenDialog("expertGuide", "edit", item)}
              onDelete={(id) => handleDelete("expertGuide", id)}
              onImageUpload={(id, file) =>
                handleImageUpload("expertGuide", id, file)
              }
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
                onNestedChange={handleNestedFormChange}
                onArrayItemAdd={addArrayItem}
                onArrayItemRemove={removeArrayItem}
                onArrayItemChange={handleArrayFieldChange}
                imageFile={imageFile}
                imagePreview={imagePreview}
                onImageSelect={handleImageSelect}
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

// ==================== SUB-COMPONENTS ====================

const DiscoverSectionEditor: React.FC<{
  homeData: HomeData | null;
  onUpdate: () => void;
  showSnackbar: (message: string, type: any) => void;
}> = ({ homeData, onUpdate, showSnackbar }) => {
  const [osheenMaa, setOsheenMaa] = useState(
    homeData?.discoverSection?.osheenMaa,
  );
  const [osheenOracle, setOsheenOracle] = useState(
    homeData?.discoverSection?.osheenOracle,
  );
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setOsheenMaa(homeData?.discoverSection?.osheenMaa);
    setOsheenOracle(homeData?.discoverSection?.osheenOracle);
  }, [homeData]);

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await homeAPI.updateDiscoverSection({
        osheenMaa,
        osheenOracle,
      });
      if (response.success) {
        showSnackbar("Discover section updated successfully", "success");
        onUpdate();
      } else {
        showSnackbar(response.message || "Update failed", "error");
      }
    } catch (error) {
      showSnackbar("Error updating discover section", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (
    type: "osheenMaa" | "osheenOracle",
    file: File,
  ) => {
    try {
      const response = await homeAPI.uploadDiscoverImage(file, type);
      if (response.success) {
        showSnackbar("Image uploaded successfully", "success");
        onUpdate();
      } else {
        showSnackbar(response.message || "Upload failed", "error");
      }
    } catch (error) {
      showSnackbar("Error uploading image", "error");
    }
  };

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Osheen MAA</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Title
          </label>
          <input
            type="text"
            value={osheenMaa?.title || ""}
            onChange={(e) =>
              setOsheenMaa({ ...osheenMaa!, title: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            rows={3}
            value={osheenMaa?.description || ""}
            onChange={(e) =>
              setOsheenMaa({ ...osheenMaa!, description: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Link
          </label>
          <input
            type="text"
            value={osheenMaa?.link || ""}
            onChange={(e) =>
              setOsheenMaa({ ...osheenMaa!, link: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
        <div>
          {osheenMaa?.image && (
            <div className="mt-2">
              <Image
                src={osheenMaa.image}
                alt="Osheen MAA"
                className="w-full max-h-48 object-cover rounded-lg"
                width={300}
                height={300}
              />
            </div>
          )}
          <label className="mt-2 inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 cursor-pointer">
            <Upload className="w-4 h-4 mr-2" />
            Upload Image
            <input
              type="file"
              hidden
              accept="image/*"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  handleImageUpload("osheenMaa", e.target.files[0]);
                }
              }}
            />
          </label>
        </div>
      </div>

      <h3 className="text-lg font-semibold mb-4 mt-8">Osheen Oracle</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Title
          </label>
          <input
            type="text"
            value={osheenOracle?.title || ""}
            onChange={(e) =>
              setOsheenOracle({ ...osheenOracle!, title: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            rows={3}
            value={osheenOracle?.description || ""}
            onChange={(e) =>
              setOsheenOracle({ ...osheenOracle!, description: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Link
          </label>
          <input
            type="text"
            value={osheenOracle?.link || ""}
            onChange={(e) =>
              setOsheenOracle({ ...osheenOracle!, link: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
        <div>
          {osheenOracle?.image && (
            <div className="mt-2">
              <img
                src={osheenOracle.image}
                alt="Osheen Oracle"
                className="w-full max-h-48 object-cover rounded-lg"
              />
            </div>
          )}
          <label className="mt-2 inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 cursor-pointer">
            <Upload className="w-4 h-4 mr-2" />
            Upload Image
            <input
              type="file"
              hidden
              accept="image/*"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  handleImageUpload("osheenOracle", e.target.files[0]);
                }
              }}
            />
          </label>
        </div>
      </div>

      <div className="flex justify-end mt-6">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
};

const DiscoverPathEditor: React.FC<{
  data: DiscoverPath[];
  onAdd: () => void;
  onEdit: (item: DiscoverPath) => void;
  onDelete: (id: string) => void;
  onImageUpload: (id: string, file: File) => void;
}> = ({ data, onAdd, onEdit, onDelete, onImageUpload }) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Discover Your Path Items</h3>
        <button
          onClick={onAdd}
          className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add New
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {data.map((item) => (
          <div
            key={item._id}
            className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition"
          >
            {item.image && (
              <Image
                src={item.image}
                alt={item.title}
                className="w-full h-48 object-cover"
                width={300}
                height={300}

              />
            )}
            <div className="p-4">
              <h4 className="text-lg font-semibold text-gray-900">
                {item.title}
              </h4>
              <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                {item.description}
              </p>
              <div className="mt-2">
                <span
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    item.isActive
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {item.isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
            <div className="border-t border-gray-100 p-3 flex gap-2">
              <button
                onClick={() => onEdit(item)}
                className="flex-1 inline-flex items-center justify-center px-3 py-1.5 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
              >
                <Edit2 className="w-4 h-4 mr-1" />
                Edit
              </button>
              <button
                onClick={() => onDelete(item._id!)}
                className="flex-1 inline-flex items-center justify-center px-3 py-1.5 text-sm text-red-700 bg-red-50 rounded-lg hover:bg-red-100 transition"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Delete
              </button>
              <label className="flex-1 inline-flex items-center justify-center px-3 py-1.5 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 cursor-pointer">
                <Upload className="w-4 h-4 mr-1" />
                Upload
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      onImageUpload(item._id!, e.target.files[0]);
                    }
                  }}
                />
              </label>
            </div>
          </div>
        ))}
      </div>

      {data.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No items found. Click Add New to create one.
        </div>
      )}
    </div>
  );
};

const AchievementsEditor: React.FC<{
  homeData: HomeData | null;
  onUpdate: () => void;
  showSnackbar: (message: string, type: any) => void;
}> = ({ homeData, onUpdate, showSnackbar }) => {
  const [title, setTitle] = useState(homeData?.achievements?.title || "");
  const [description, setDescription] = useState(
    homeData?.achievements?.description || "",
  );
  const [stats, setStats] = useState(homeData?.achievements?.stats);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setTitle(homeData?.achievements?.title || "");
    setDescription(homeData?.achievements?.description || "");
    setStats(homeData?.achievements?.stats);
  }, [homeData]);

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await homeAPI.updateAchievements({
        title,
        description,
        stats,
      });
      if (response.success) {
        showSnackbar("Achievements updated successfully", "success");
        onUpdate();
      } else {
        showSnackbar(response.message || "Update failed", "error");
      }
    } catch (error) {
      showSnackbar("Error updating achievements", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleAddImage = async (file: File, caption: string) => {
    try {
      const response = await homeAPI.addAchievementImage(file, caption);
      if (response.success) {
        showSnackbar("Image added successfully", "success");
        onUpdate();
      } else {
        showSnackbar(response.message || "Add failed", "error");
      }
    } catch (error) {
      showSnackbar("Error adding image", "error");
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    if (window.confirm("Are you sure you want to delete this image?")) {
      try {
        const response = await homeAPI.deleteAchievementImage(imageId);
        if (response.success) {
          showSnackbar("Image deleted successfully", "success");
          onUpdate();
        } else {
          showSnackbar(response.message || "Delete failed", "error");
        }
      } catch (error) {
        showSnackbar("Error deleting image", "error");
      }
    }
  };

  return (
    <div>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <h4 className="font-medium text-gray-900 mt-4">Statistics</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm text-gray-600">
              Years of Experience
            </label>
            <input
              type="number"
              value={stats?.yearsOfExperience || 0}
              onChange={(e) =>
                setStats({
                  ...stats!,
                  yearsOfExperience: parseInt(e.target.value),
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600">
              Satisfied Clients
            </label>
            <input
              type="number"
              value={stats?.satisfiedClients || 0}
              onChange={(e) =>
                setStats({
                  ...stats!,
                  satisfiedClients: parseInt(e.target.value),
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600">Reviews</label>
            <input
              type="number"
              value={stats?.reviews || 0}
              onChange={(e) =>
                setStats({ ...stats!, reviews: parseInt(e.target.value) })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600">
              Satisfaction Rate (%)
            </label>
            <input
              type="number"
              value={stats?.satisfactionRate || 0}
              onChange={(e) =>
                setStats({
                  ...stats!,
                  satisfactionRate: parseInt(e.target.value),
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
        </div>

        <h4 className="font-medium text-gray-900 mt-6">Achievement Images</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {homeData?.achievements?.images?.map((img) => (
            <div key={img._id} className="relative group">
              <img
                src={img.url}
                alt={img.caption}
                className="w-full h-32 object-cover rounded-lg"
              />
              <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition rounded-lg flex items-center justify-center">
                <button
                  onClick={() => handleDeleteImage(img._id!)}
                  className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1 truncate">
                {img.caption}
              </p>
            </div>
          ))}
          <div className="border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center h-32 hover:border-purple-500 transition">
            <label className="cursor-pointer text-center p-4">
              <Plus className="w-6 h-6 text-gray-400 mx-auto" />
              <span className="text-xs text-gray-500 mt-1 block">
                Add Image
              </span>
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    const caption = prompt("Enter image caption:");
                    if (caption) {
                      handleAddImage(e.target.files[0], caption);
                    }
                  }
                }}
              />
            </label>
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
};

const MediaSpotlightEditor: React.FC<{
  data: MediaSpotlight[];
  onAdd: () => void;
  onEdit: (item: MediaSpotlight) => void;
  onDelete: (id: string) => void;
}> = ({ data, onAdd, onEdit, onDelete }) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Media Spotlight Items</h3>
        <button
          onClick={onAdd}
          className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add New
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {data.map((item) => (
          <div
            key={item._id}
            className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm"
          >
            {item.image && (
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-48 object-cover"
              />
            )}
            <div className="p-4">
              <h4 className="font-semibold text-gray-900">{item.title}</h4>
              {item.logo && (
                <p className="text-sm text-gray-500 mt-1">Logo: {item.logo}</p>
              )}
              {item.link && (
                <p className="text-sm text-gray-500 truncate">
                  Link: {item.link}
                </p>
              )}
              <div className="mt-2">
                <span
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    item.isActive
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {item.isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
            <div className="border-t border-gray-100 p-3 flex gap-2">
              <button
                onClick={() => onEdit(item)}
                className="flex-1 inline-flex items-center justify-center px-3 py-1.5 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
              >
                <Edit2 className="w-4 h-4 mr-1" />
                Edit
              </button>
              <button
                onClick={() => onDelete(item._id!)}
                className="flex-1 inline-flex items-center justify-center px-3 py-1.5 text-sm text-red-700 bg-red-50 rounded-lg hover:bg-red-100 transition"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {data.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No media spotlight items found. Click Add New to create one.
        </div>
      )}
    </div>
  );
};

const CatalogueEditor: React.FC<{
  data: Catalogue[];
  onAdd: () => void;
  onEdit: (item: Catalogue) => void;
  onDelete: (id: string) => void;
  onImageUpload: (id: string, file: File) => void;
}> = ({ data, onAdd, onEdit, onDelete, onImageUpload }) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Catalogue Items</h3>
        <button
          onClick={onAdd}
          className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add New
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {data.map((item) => (
          <div
            key={item._id}
            className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm"
          >
            {item.image && (
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-48 object-cover"
              />
            )}
            <div className="p-4">
              <h4 className="text-lg font-semibold text-gray-900">
                {item.title}
              </h4>
              <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                {item.description}
              </p>
              <div className="mt-2">
                <span
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    item.isActive
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {item.isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
            <div className="border-t border-gray-100 p-3 flex gap-2">
              <button
                onClick={() => onEdit(item)}
                className="flex-1 inline-flex items-center justify-center px-3 py-1.5 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
              >
                <Edit2 className="w-4 h-4 mr-1" />
                Edit Details
              </button>
              <button
                onClick={() => onDelete(item._id!)}
                className="flex-1 inline-flex items-center justify-center px-3 py-1.5 text-sm text-red-700 bg-red-50 rounded-lg hover:bg-red-100 transition"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Delete
              </button>
              <label className="flex-1 inline-flex items-center justify-center px-3 py-1.5 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 cursor-pointer">
                <Upload className="w-4 h-4 mr-1" />
                Upload
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      onImageUpload(item._id!, e.target.files[0]);
                    }
                  }}
                />
              </label>
            </div>
          </div>
        ))}
      </div>

      {data.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No catalogue items found. Click Add New to create one.
        </div>
      )}
    </div>
  );
};

const ExpertGuidesEditor: React.FC<{
  data: ExpertGuide[];
  onAdd: () => void;
  onEdit: (item: ExpertGuide) => void;
  onDelete: (id: string) => void;
  onImageUpload: (id: string, file: File) => void;
}> = ({ data, onAdd, onEdit, onDelete, onImageUpload }) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Expert Guides</h3>
        <button
          onClick={onAdd}
          className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add New
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {data.map((guide) => (
          <div
            key={guide._id}
            className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm"
          >
            {guide.image && (
              <img
                src={guide.image}
                alt={guide.name}
                className="w-full h-56 object-cover"
              />
            )}
            <div className="p-4">
              <div className="flex justify-between items-start">
                <h4 className="text-lg font-semibold text-gray-900">
                  {guide.name}
                </h4>
                {guide.isVerified && (
                  <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Verified
                  </span>
                )}
              </div>
              <div className="flex items-center mt-1">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${i < Math.floor(guide.rating) ? "text-yellow-400 fill-current" : "text-gray-300"}`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600 ml-2">
                  ({guide.reviews} reviews)
                </span>
                <span className="text-sm text-green-600 ml-2">
                  {guide.satisfactionRate}%
                </span>
              </div>
              <p className="text-gray-600 text-sm mt-2">{guide.expertise}</p>
              <p className="text-sm text-gray-500 mt-1">
                Experience: {guide.experience}
              </p>
              <p className="text-sm text-gray-500">
                Languages: {guide.languages?.join(", ")}
              </p>
              <div className="flex flex-wrap gap-1 mt-2">
                {guide.expertiseAreas?.slice(0, 3).map((area, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full"
                  >
                    {area}
                  </span>
                ))}
                {guide.expertiseAreas?.length > 3 && (
                  <span className="px-2 py-0.5 text-gray-500 text-xs">
                    +{guide.expertiseAreas.length - 3}
                  </span>
                )}
              </div>
            </div>
            <div className="border-t border-gray-100 p-3 flex gap-2">
              <button
                onClick={() => onEdit(guide)}
                className="flex-1 inline-flex items-center justify-center px-3 py-1.5 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
              >
                <Edit2 className="w-4 h-4 mr-1" />
                Edit
              </button>
              <button
                onClick={() => onDelete(guide._id!)}
                className="flex-1 inline-flex items-center justify-center px-3 py-1.5 text-sm text-red-700 bg-red-50 rounded-lg hover:bg-red-100 transition"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Delete
              </button>
              <label className="flex-1 inline-flex items-center justify-center px-3 py-1.5 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 cursor-pointer">
                <Upload className="w-4 h-4 mr-1" />
                Upload
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      onImageUpload(guide._id!, e.target.files[0]);
                    }
                  }}
                />
              </label>
            </div>
          </div>
        ))}
      </div>

      {data.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No expert guides found. Click Add New to create one.
        </div>
      )}
    </div>
  );
};

const FormDialogContent: React.FC<{
  section: string;
  formData: any;
  onFormChange: (field: string, value: any) => void;
  onNestedChange: (parent: string, field: string, value: any) => void;
  onArrayItemAdd: (parent: string, arrayField: string, newItem: any) => void;
  onArrayItemRemove: (
    parent: string,
    arrayField: string,
    index: number,
  ) => void;
  onArrayItemChange: (
    parent: string,
    arrayField: string,
    index: number,
    field: string,
    value: string,
  ) => void;
  imageFile: File | null;
  imagePreview: string;
  onImageSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
}> = ({
  section,
  formData,
  onFormChange,
  onNestedChange,
  onArrayItemAdd,
  onArrayItemRemove,
  onArrayItemChange,
  imagePreview,
  onImageSelect,
}) => {
  switch (section) {
    case "discoverPath":
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              type="text"
              value={formData.title || ""}
              onChange={(e) => onFormChange("title", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              rows={3}
              value={formData.description || ""}
              onChange={(e) => onFormChange("description", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Order
            </label>
            <input
              type="number"
              value={formData.order || 0}
              onChange={(e) => onFormChange("order", parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={formData.isActive || false}
              onChange={(e) => onFormChange("isActive", e.target.checked)}
              className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
            />
            <label className="ml-2 text-sm text-gray-700">Active</label>
          </div>
          {imagePreview && (
            <div>
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full max-h-48 object-cover rounded-lg"
              />
            </div>
          )}
          <label className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 cursor-pointer">
            <Upload className="w-4 h-4 mr-2" />
            Upload Image
            <input
              type="file"
              hidden
              accept="image/*"
              onChange={onImageSelect}
            />
          </label>
        </div>
      );

    case "mediaSpotlight":
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              type="text"
              value={formData.title || ""}
              onChange={(e) => onFormChange("title", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Logo URL
            </label>
            <input
              type="text"
              value={formData.logo || ""}
              onChange={(e) => onFormChange("logo", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Link URL
            </label>
            <input
              type="text"
              value={formData.link || ""}
              onChange={(e) => onFormChange("link", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Order
            </label>
            <input
              type="number"
              value={formData.order || 0}
              onChange={(e) => onFormChange("order", parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={formData.isActive || false}
              onChange={(e) => onFormChange("isActive", e.target.checked)}
              className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
            />
            <label className="ml-2 text-sm text-gray-700">Active</label>
          </div>
          {imagePreview && (
            <div>
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full max-h-48 object-cover rounded-lg"
              />
            </div>
          )}
          <label className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 cursor-pointer">
            <Upload className="w-4 h-4 mr-2" />
            Upload Image
            <input
              type="file"
              hidden
              accept="image/*"
              onChange={onImageSelect}
            />
          </label>
        </div>
      );

    case "catalogue":
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              type="text"
              value={formData.title || ""}
              onChange={(e) => onFormChange("title", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              rows={2}
              value={formData.description || ""}
              onChange={(e) => onFormChange("description", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="border-t pt-4">
            <h4 className="font-medium text-gray-900 mb-3">
              Book Your Reading
            </h4>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Reading Title"
                value={formData.details?.bookYourReading?.title || ""}
                onChange={(e) =>
                  onNestedChange("details", "bookYourReading", {
                    ...formData.details?.bookYourReading,
                    title: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
              <input
                type="text"
                placeholder="Description"
                value={formData.details?.bookYourReading?.description || ""}
                onChange={(e) =>
                  onNestedChange("details", "bookYourReading", {
                    ...formData.details?.bookYourReading,
                    description: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  placeholder="Price"
                  value={formData.details?.bookYourReading?.price || 0}
                  onChange={(e) =>
                    onNestedChange("details", "bookYourReading", {
                      ...formData.details?.bookYourReading,
                      price: parseInt(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
                <input
                  type="text"
                  placeholder="Duration"
                  value={formData.details?.bookYourReading?.duration || ""}
                  onChange={(e) =>
                    onNestedChange("details", "bookYourReading", {
                      ...formData.details?.bookYourReading,
                      duration: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-medium text-gray-900">Key Traits</h4>
              <button
                type="button"
                onClick={() =>
                  onArrayItemAdd("details", "keyTraits", {
                    trait: "",
                    description: "",
                  })
                }
                className="text-sm text-purple-600 hover:text-purple-700"
              >
                + Add Trait
              </button>
            </div>
            {(formData.details?.keyTraits || []).map(
              (trait: any, idx: number) => (
                <div key={idx} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="Trait"
                    value={trait.trait || ""}
                    onChange={(e) =>
                      onArrayItemChange(
                        "details",
                        "keyTraits",
                        idx,
                        "trait",
                        e.target.value,
                      )
                    }
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                  <input
                    type="text"
                    placeholder="Description"
                    value={trait.description || ""}
                    onChange={(e) =>
                      onArrayItemChange(
                        "details",
                        "keyTraits",
                        idx,
                        "description",
                        e.target.value,
                      )
                    }
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      onArrayItemRemove("details", "keyTraits", idx)
                    }
                    className="p-2 text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ),
            )}
          </div>

          <div className="border-t pt-4">
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-medium text-gray-900">Benefits</h4>
              <button
                type="button"
                onClick={() =>
                  onArrayItemAdd("details", "benefits", {
                    benefit: "",
                    description: "",
                  })
                }
                className="text-sm text-purple-600 hover:text-purple-700"
              >
                + Add Benefit
              </button>
            </div>
            {(formData.details?.benefits || []).map(
              (benefit: any, idx: number) => (
                <div key={idx} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="Benefit"
                    value={benefit.benefit || ""}
                    onChange={(e) =>
                      onArrayItemChange(
                        "details",
                        "benefits",
                        idx,
                        "benefit",
                        e.target.value,
                      )
                    }
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                  <input
                    type="text"
                    placeholder="Description"
                    value={benefit.description || ""}
                    onChange={(e) =>
                      onArrayItemChange(
                        "details",
                        "benefits",
                        idx,
                        "description",
                        e.target.value,
                      )
                    }
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      onArrayItemRemove("details", "benefits", idx)
                    }
                    className="p-2 text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ),
            )}
          </div>

          <div className="border-t pt-4">
            <h4 className="font-medium text-gray-900 mb-3">Complete Package</h4>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Package Title"
                value={formData.details?.completePackage?.title || ""}
                onChange={(e) =>
                  onNestedChange("details", "completePackage", {
                    ...formData.details?.completePackage,
                    title: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
              <input
                type="text"
                placeholder="Includes (comma separated)"
                value={
                  formData.details?.completePackage?.includes?.join(", ") || ""
                }
                onChange={(e) =>
                  onNestedChange("details", "completePackage", {
                    ...formData.details?.completePackage,
                    includes: e.target.value.split(",").map((s) => s.trim()),
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  placeholder="Price"
                  value={formData.details?.completePackage?.price || 0}
                  onChange={(e) =>
                    onNestedChange("details", "completePackage", {
                      ...formData.details?.completePackage,
                      price: parseInt(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
                <input
                  type="number"
                  placeholder="Discount Price"
                  value={formData.details?.completePackage?.discountPrice || 0}
                  onChange={(e) =>
                    onNestedChange("details", "completePackage", {
                      ...formData.details?.completePackage,
                      discountPrice: parseInt(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Order
            </label>
            <input
              type="number"
              value={formData.order || 0}
              onChange={(e) => onFormChange("order", parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={formData.isActive || false}
              onChange={(e) => onFormChange("isActive", e.target.checked)}
              className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
            />
            <label className="ml-2 text-sm text-gray-700">Active</label>
          </div>
          {imagePreview && (
            <div>
              <Image
                src={imagePreview}
                alt="Preview"
                className="w-full max-h-48 object-cover rounded-lg"
                width={300}
                height={200}
              />
            </div>
          )}
          <label className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 cursor-pointer">
            <Upload className="w-4 h-4 mr-2" />
            Upload Image
            <input
              type="file"
              hidden
              accept="image/*"
              onChange={onImageSelect}
            />
          </label>
        </div>
      );

    case "expertGuide":
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              value={formData.name || ""}
              onChange={(e) => onFormChange("name", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Rating</label>
              <input
                type="number"
                step="0.1"
                value={formData.rating || 4.8}
                onChange={(e) =>
                  onFormChange("rating", parseFloat(e.target.value))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Reviews
              </label>
              <input
                type="number"
                value={formData.reviews || 892}
                onChange={(e) =>
                  onFormChange("reviews", parseInt(e.target.value))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Satisfaction (%)
              </label>
              <input
                type="number"
                value={formData.satisfactionRate || 92}
                onChange={(e) =>
                  onFormChange("satisfactionRate", parseInt(e.target.value))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Expertise
            </label>
            <textarea
              rows={2}
              value={formData.expertise || ""}
              onChange={(e) => onFormChange("expertise", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Experience
            </label>
            <input
              type="text"
              value={formData.experience || ""}
              onChange={(e) => onFormChange("experience", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Languages (comma separated)
            </label>
            <input
              type="text"
              value={formData.languages?.join(", ") || ""}
              onChange={(e) =>
                onFormChange(
                  "languages",
                  e.target.value.split(",").map((l) => l.trim()),
                )
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Expertise Areas (comma separated)
            </label>
            <input
              type="text"
              value={formData.expertiseAreas?.join(", ") || ""}
              onChange={(e) =>
                onFormChange(
                  "expertiseAreas",
                  e.target.value.split(",").map((a) => a.trim()),
                )
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={formData.isVerified || false}
              onChange={(e) => onFormChange("isVerified", e.target.checked)}
              className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
            />
            <label className="ml-2 text-sm text-gray-700">
              Verified Expert
            </label>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Order
            </label>
            <input
              type="number"
              value={formData.order || 0}
              onChange={(e) => onFormChange("order", parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={formData.isActive || false}
              onChange={(e) => onFormChange("isActive", e.target.checked)}
              className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
            />
            <label className="ml-2 text-sm text-gray-700">Active</label>
          </div>
          {imagePreview && (
            <div>
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full max-h-48 object-cover rounded-lg"
              />
            </div>
          )}
          <label className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 cursor-pointer">
            <Upload className="w-4 h-4 mr-2" />
            Upload Image
            <input
              type="file"
              hidden
              accept="image/*"
              onChange={onImageSelect}
            />
          </label>
        </div>
      );

    default:
      return null;
  }
};

export default Home;
