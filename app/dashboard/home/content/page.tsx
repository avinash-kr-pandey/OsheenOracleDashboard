"use client";

import homeAPI, {
  Catalogue,
  DiscoverPath,
  ExpertGuide,
  HomeData,
  MediaSpotlight,
  DiscoverSection,
  AchievementsSection,
  CatalogueItem,
} from "@/utils/home.api";
import { API_BASE_URL } from "@/utils/api";
import {
  CheckCircle,
  Edit2,
  Plus,
  Star,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import Image from "next/image";
import React, { useState, useEffect, ChangeEvent } from "react";

// ==================== TYPES ====================

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

interface DiscoverPathItem extends DiscoverPath {
  _id: string;
}

interface MediaSpotlightItem extends MediaSpotlight {
  _id: string;
}

interface ExpertGuideItem extends ExpertGuide {
  _id: string;
}

interface CatalogueItemType extends CatalogueItem {
  _id: string;
}

// ==================== UTILITY FUNCTIONS ====================

const ensureFields = <T extends Record<string, unknown>>(
  data: Partial<T>,
  defaults: T,
): T => {
  return { ...defaults, ...data } as T;
};

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

const Home: React.FC = () => {
  const [activeTab, setActiveTab] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [homeData, setHomeData] = useState<HomeData | null>(null);
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [dialogType, setDialogType] = useState<"add" | "edit">("add");
  const [dialogSection, setDialogSection] = useState<string>("");
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [formData, setFormData] = useState<Record<string, unknown>>({});
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    type: "success" | "error" | "info" | "warning";
  }>({
    open: false,
    message: "",
    type: "success",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [imageUrlInput, setImageUrlInput] = useState<string>("");
  const [imageSource, setImageSource] = useState<"file" | "url">("file");

  useEffect(() => {
    fetchHomeData();
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get("tab");
      if (tab === "catalogue") {
        setActiveTab(4);
      }
    }
  }, []);

  const fetchHomeData = async (): Promise<void> => {
    try {
      setLoading(true);
      const response = await homeAPI.getAllHomeData();
      if (response.success && response.data) {
        setHomeData(response.data);
      } else {
        showSnackbar(response.message || "Error fetching home data", "error");
      }
    } catch (error) {
      console.error("Error fetching home data:", error);
      showSnackbar(
        error instanceof Error ? error.message : "Error fetching home data",
        "error",
      );
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
    item?: any,
  ): void => {
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
    setImageUrlInput("");
    setImageSource("file");
    setOpenDialog(true);
  };

  const getDefaultFormData = (section: string): Record<string, unknown> => {
    switch (section) {
      case "discoverPath":
        return {
          title: "",
          description: "",
          image: "",
          order: 0,
          isActive: true,
        };
      case "mediaSpotlight":
        return {
          title: "",
          logo: "",
          link: "",
          image: "",
          order: 0,
          isActive: true,
        };
      case "catalogue":
        return {
          title: "",
          description: "",
          image: "",
          price: "0",
          rating: 4.5,
          traits: [] as string[],
          benefits: [] as string[],
          readingIncludes: [] as string[],
          strengths: [] as string[],
          challenges: [] as string[],
          order: 0,
          isActive: true,
        };
      case "expertGuide":
        return {
          name: "",
          image: "",
          rating: 4.8,
          reviews: 892,
          satisfactionRate: 92,
          expertise: "",
          experience: "15+ years",
          languages: [] as string[],
          expertiseAreas: [] as string[],
          isVerified: true,
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

  const handleArrayFieldChange = (
    field: string,
    index: number,
    subField: string,
    value: string,
  ): void => {
    const currentArray =
      (formData[field] as Array<Record<string, string>>) || [];
    const newArray = [...currentArray];
    if (!newArray[index]) {
      newArray[index] = {};
    }
    newArray[index] = { ...newArray[index], [subField]: value };
    setFormData((prev) => ({ ...prev, [field]: newArray }));
  };

  const addArrayItem = (
    field: string,
    newItem: Record<string, string>,
  ): void => {
    const currentArray =
      (formData[field] as Array<Record<string, string>>) || [];
    setFormData((prev) => ({ ...prev, [field]: [...currentArray, newItem] }));
  };

  const removeArrayItem = (field: string, index: number): void => {
    const currentArray =
      (formData[field] as Array<Record<string, string>>) || [];
    const newArray = currentArray.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, [field]: newArray }));
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

  const getFinalImageValue = (): string => {
    if (imageSource === "url" && imageUrlInput) {
      return imageUrlInput;
    }
    if (imageFile) {
      return "";
    }
    return (formData.image as string) || "";
  };

  const handleSubmit = async (): Promise<void> => {
    try {
      let response;
      const imageValue = getFinalImageValue();

      switch (dialogSection) {
        case "discoverPath": {
          const defaults = {
            title: "",
            description: "",
            image: "",
            order: 0,
            isActive: true,
          };
          const data = ensureFields(
            { ...formData, image: imageValue },
            defaults,
          );
          if (dialogType === "add") {
            response = await homeAPI.addDiscoverPath(
              data as Omit<DiscoverPath, "_id">,
            );
          } else {
            response = await homeAPI.updateDiscoverPath(
              (selectedItem?._id as string) || "",
              data,
            );
          }
          break;
        }
        case "mediaSpotlight": {
          const defaults = {
            title: "",
            logo: "",
            link: "",
            image: "",
            order: 0,
            isActive: true,
          };
          const data = ensureFields(
            { ...formData, image: imageValue },
            defaults,
          );
          if (dialogType === "add" && imageFile) {
            response = await homeAPI.addMediaSpotlight(
              imageFile,
              data as {
                title: string;
                logo?: string;
                link?: string;
                order?: number;
              },
            );
          } else if (dialogType === "add" && imageValue) {
            const formDataToSend = new FormData();
            formDataToSend.append("title", data.title as string);
            formDataToSend.append("logo", (data.logo as string) || "");
            formDataToSend.append("link", (data.link as string) || "");
            formDataToSend.append("order", String(data.order || 0));
            formDataToSend.append("imageUrl", imageValue);
            const token = localStorage.getItem("token");
            const fetchResponse = await fetch(
              `${API_BASE_URL}/admin/media-spotlight`,
              {
                method: "POST",
                headers: { Authorization: token ? `Bearer ${token}` : "" },
                body: formDataToSend,
              },
            );
            response = await fetchResponse.json();
          } else {
            response = await homeAPI.updateMediaSpotlight(
              (selectedItem?._id as string) || "",
              data,
            );
          }
          break;
        }
        case "catalogue": {
          const transformedData = {
            name: (formData.title as string) || "",
            description: (formData.description as string) || "",
            price: (formData.price as string) || "0",
            rating: (formData.rating as number) || 4.5,
            image: imageValue,
            traits: (formData.traits as string[]) || [],
            benefits: (formData.benefits as string[]) || [],
            readingIncludes: (formData.readingIncludes as string[]) || [],
            strengths: (formData.strengths as string[]) || [],
            challenges: (formData.challenges as string[]) || [],
            order: (formData.order as number) || 0,
            isActive: (formData.isActive as boolean) !== false,
          };

          if (dialogType === "add") {
            response = await homeAPI.addCatalogue(transformedData);
          } else {
            response = await homeAPI.updateCatalogue(
              (selectedItem?._id as string) || "",
              transformedData,
            );
          }
          break;
        }
        case "expertGuide": {
          const data = {
            name: (formData.name as string) || "",
            image: imageValue,
            rating: (formData.rating as number) || 4.8,
            reviews: (formData.reviews as number) || 892,
            satisfactionRate: (formData.satisfactionRate as number) || 92,
            expertise: (formData.expertise as string) || "",
            experience: (formData.experience as string) || "15+ years",
            languages: (formData.languages as string[]) || [],
            expertiseAreas: (formData.expertiseAreas as string[]) || [],
            isVerified: (formData.isVerified as boolean) !== false,
            order: (formData.order as number) || 0,
            isActive: (formData.isActive as boolean) !== false,
            stats: {
              professionalExperience:
                (formData.experience as string) || "15+ years",
              satisfiedClients: "4200+",
            },
          };

          if (dialogType === "add") {
            response = await homeAPI.addExpertGuide(
              data as Omit<ExpertGuide, "_id">,
            );
          } else {
            response = await homeAPI.updateExpertGuide(
              (selectedItem?._id as string) || "",
              data,
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
        fetchHomeData();
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
      } catch (error) {
        console.error("Error deleting item:", error);
        showSnackbar(
          error instanceof Error ? error.message : "Error deleting item",
          "error",
        );
      }
    }
  };

  const handleImageUpload = async (
    section: string,
    id: string,
    file: File,
  ): Promise<void> => {
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
    } catch (error) {
      console.error("Error uploading image:", error);
      showSnackbar(
        error instanceof Error ? error.message : "Error uploading image",
        "error",
      );
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Home Page Management
          </h1>
          <p className="mt-2 text-gray-600">
            Manage all home page content from here. Add, edit, or delete
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
            <DiscoverSectionEditor
              homeData={homeData}
              onUpdate={fetchHomeData}
              showSnackbar={showSnackbar}
            />
          </TabPanel>
          <TabPanel value={activeTab} index={1}>
            <DiscoverPathEditor
              data={(homeData?.discoverYourPath as DiscoverPathItem[]) || []}
              onAdd={() => handleOpenDialog("discoverPath", "add")}
              onEdit={(item: DiscoverPathItem) =>
                handleOpenDialog("discoverPath", "edit", item)
              }
              onDelete={(id: string) => handleDelete("discoverPath", id)}
              onImageUpload={(id: string, file: File) =>
                handleImageUpload("discoverPath", id, file)
              }
            />
          </TabPanel>
          <TabPanel value={activeTab} index={2}>
            <AchievementsEditor
              homeData={homeData}
              onUpdate={fetchHomeData}
              showSnackbar={showSnackbar}
            />
          </TabPanel>
          <TabPanel value={activeTab} index={3}>
            <MediaSpotlightEditor
              data={(homeData?.mediaSpotlight as MediaSpotlightItem[]) || []}
              onAdd={() => handleOpenDialog("mediaSpotlight", "add")}
              onEdit={(item: MediaSpotlightItem) =>
                handleOpenDialog("mediaSpotlight", "edit", item)
              }
              onDelete={(id: string) => handleDelete("mediaSpotlight", id)}
            />
          </TabPanel>
          <TabPanel value={activeTab} index={4}>
            <CatalogueEditor
              data={(homeData?.catalogue as CatalogueItemType[]) || []}
              onAdd={() => handleOpenDialog("catalogue", "add")}
              onEdit={(item: CatalogueItemType) =>
                handleOpenDialog("catalogue", "edit", item)
              }
              onDelete={(id: string) => handleDelete("catalogue", id)}
              onImageUpload={(id: string, file: File) =>
                handleImageUpload("catalogue", id, file)
              }
            />
          </TabPanel>
          <TabPanel value={activeTab} index={5}>
            <ExpertGuidesEditor
              data={(homeData?.expertGuides as ExpertGuideItem[]) || []}
              onAdd={() => handleOpenDialog("expertGuide", "add")}
              onEdit={(item: ExpertGuideItem) =>
                handleOpenDialog("expertGuide", "edit", item)
              }
              onDelete={(id: string) => handleDelete("expertGuide", id)}
              onImageUpload={(id: string, file: File) =>
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
                onArrayItemAdd={addArrayItem}
                onArrayItemRemove={removeArrayItem}
                onArrayItemChange={handleArrayFieldChange}
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

// ==================== DISCOVER SECTION EDITOR ====================

const DiscoverSectionEditor: React.FC<{
  homeData: HomeData | null;
  onUpdate: () => void;
  showSnackbar: (
    message: string,
    type: "success" | "error" | "info" | "warning",
  ) => void;
}> = ({ homeData, onUpdate, showSnackbar }) => {
  const [osheenMaa, setOsheenMaa] = useState<{
    title: string;
    description: string;
    image: string;
    link: string;
  }>(
    homeData?.discoverSection?.osheenMaa || {
      title: "",
      description: "",
      image: "",
      link: "",
    },
  );
  const [osheenOracle, setOsheenOracle] = useState<{
    title: string;
    description: string;
    image: string;
    link: string;
  }>(
    homeData?.discoverSection?.osheenOracle || {
      title: "",
      description: "",
      image: "",
      link: "",
    },
  );
  const [saving, setSaving] = useState<boolean>(false);
  const [maaImageFile, setMaaImageFile] = useState<File | null>(null);
  const [maaImagePreview, setMaaImagePreview] = useState<string>("");
  const [maaImageSource, setMaaImageSource] = useState<"file" | "url">("file");
  const [maaImageUrl, setMaaImageUrl] = useState<string>("");
  const [oracleImageFile, setOracleImageFile] = useState<File | null>(null);
  const [oracleImagePreview, setOracleImagePreview] = useState<string>("");
  const [oracleImageSource, setOracleImageSource] = useState<"file" | "url">(
    "file",
  );
  const [oracleImageUrl, setOracleImageUrl] = useState<string>("");

  useEffect(() => {
    if (homeData?.discoverSection) {
      setOsheenMaa(homeData.discoverSection.osheenMaa);
      setOsheenOracle(homeData.discoverSection.osheenOracle);
    }
  }, [homeData]);

  const handleMaaImageSelect = (e: ChangeEvent<HTMLInputElement>): void => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setMaaImageFile(file);
      setMaaImageSource("file");
      const reader = new FileReader();
      reader.onloadend = () => setMaaImagePreview(reader.result as string);
      reader.readAsDataURL(file);
      setMaaImageUrl("");
      setOsheenMaa((prev) => ({ ...prev, image: "" }));
    }
  };

  const handleMaaImageUrl = (url: string): void => {
    setMaaImageUrl(url);
    setMaaImageSource("url");
    setMaaImagePreview(url);
    setMaaImageFile(null);
    setOsheenMaa((prev) => ({ ...prev, image: url }));
  };

  const handleOracleImageSelect = (e: ChangeEvent<HTMLInputElement>): void => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setOracleImageFile(file);
      setOracleImageSource("file");
      const reader = new FileReader();
      reader.onloadend = () => setOracleImagePreview(reader.result as string);
      reader.readAsDataURL(file);
      setOracleImageUrl("");
      setOsheenOracle((prev) => ({ ...prev, image: "" }));
    }
  };

  const handleOracleImageUrl = (url: string): void => {
    setOracleImageUrl(url);
    setOracleImageSource("url");
    setOracleImagePreview(url);
    setOracleImageFile(null);
    setOsheenOracle((prev) => ({ ...prev, image: url }));
  };

  const handleSave = async (): Promise<void> => {
    try {
      setSaving(true);

      const updateData = {
        osheenMaa: {
          title: osheenMaa.title || "",
          description: osheenMaa.description || "",
          image:
            maaImageSource === "file" && maaImageFile
              ? ""
              : maaImageUrl || osheenMaa.image || "",
          link: osheenMaa.link || "",
        },
        osheenOracle: {
          title: osheenOracle.title || "",
          description: osheenOracle.description || "",
          image:
            oracleImageSource === "file" && oracleImageFile
              ? ""
              : oracleImageUrl || osheenOracle.image || "",
          link: osheenOracle.link || "",
        },
      };

      const response = await homeAPI.updateDiscoverSection(updateData);

      if (response.success) {
        if (maaImageFile) {
          await homeAPI.uploadDiscoverImage(maaImageFile, "osheenMaa");
        }
        if (oracleImageFile) {
          await homeAPI.uploadDiscoverImage(oracleImageFile, "osheenOracle");
        }
        showSnackbar("Discover section updated successfully", "success");
        onUpdate();
      } else {
        showSnackbar(response.message || "Update failed", "error");
      }
    } catch (error) {
      console.error("Error:", error);
      showSnackbar("Error updating discover section", "error");
    } finally {
      setSaving(false);
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
            value={osheenMaa.title}
            onChange={(e) =>
              setOsheenMaa({ ...osheenMaa, title: e.target.value })
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
            value={osheenMaa.description}
            onChange={(e) =>
              setOsheenMaa({ ...osheenMaa, description: e.target.value })
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
            value={osheenMaa.link}
            onChange={(e) =>
              setOsheenMaa({ ...osheenMaa, link: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Image
          </label>
          <div className="flex gap-2 mb-2">
            <button
              onClick={() => setMaaImageSource("file")}
              className={`px-3 py-1 text-sm rounded ${maaImageSource === "file" ? "bg-purple-600 text-white" : "bg-gray-200"}`}
            >
              Upload File
            </button>
            <button
              onClick={() => setMaaImageSource("url")}
              className={`px-3 py-1 text-sm rounded ${maaImageSource === "url" ? "bg-purple-600 text-white" : "bg-gray-200"}`}
            >
              Enter URL
            </button>
          </div>
          {maaImageSource === "file" ? (
            <label className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 cursor-pointer">
              <Upload className="w-4 h-4 mr-2" /> Upload Image
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={handleMaaImageSelect}
              />
            </label>
          ) : (
            <input
              type="text"
              placeholder="Enter image URL"
              value={maaImageUrl}
              onChange={(e) => handleMaaImageUrl(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          )}
          {(maaImagePreview || osheenMaa.image) && (
            <div className="mt-2">
              <img
                src={maaImagePreview || osheenMaa.image}
                alt="Preview"
                className="w-full max-h-48 object-cover rounded-lg"
              />
            </div>
          )}
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
            value={osheenOracle.title}
            onChange={(e) =>
              setOsheenOracle({ ...osheenOracle, title: e.target.value })
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
            value={osheenOracle.description}
            onChange={(e) =>
              setOsheenOracle({ ...osheenOracle, description: e.target.value })
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
            value={osheenOracle.link}
            onChange={(e) =>
              setOsheenOracle({ ...osheenOracle, link: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Image
          </label>
          <div className="flex gap-2 mb-2">
            <button
              onClick={() => setOracleImageSource("file")}
              className={`px-3 py-1 text-sm rounded ${oracleImageSource === "file" ? "bg-purple-600 text-white" : "bg-gray-200"}`}
            >
              Upload File
            </button>
            <button
              onClick={() => setOracleImageSource("url")}
              className={`px-3 py-1 text-sm rounded ${oracleImageSource === "url" ? "bg-purple-600 text-white" : "bg-gray-200"}`}
            >
              Enter URL
            </button>
          </div>
          {oracleImageSource === "file" ? (
            <label className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 cursor-pointer">
              <Upload className="w-4 h-4 mr-2" /> Upload Image
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={handleOracleImageSelect}
              />
            </label>
          ) : (
            <input
              type="text"
              placeholder="Enter image URL"
              value={oracleImageUrl}
              onChange={(e) => handleOracleImageUrl(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          )}
          {(oracleImagePreview || osheenOracle.image) && (
            <div className="mt-2">
              <img
                src={oracleImagePreview || osheenOracle.image}
                alt="Preview"
                className="w-full max-h-48 object-cover rounded-lg"
              />
            </div>
          )}
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

// ==================== DISCOVER PATH EDITOR ====================

const DiscoverPathEditor: React.FC<{
  data: DiscoverPathItem[];
  onAdd: () => void;
  onEdit: (item: DiscoverPathItem) => void;
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
          <Plus className="w-4 h-4 mr-2" /> Add New
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
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${item.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}
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
                <Edit2 className="w-4 h-4 mr-1" /> Edit
              </button>
              <button
                onClick={() => onDelete(item._id)}
                className="flex-1 inline-flex items-center justify-center px-3 py-1.5 text-sm text-red-700 bg-red-50 rounded-lg hover:bg-red-100 transition"
              >
                <Trash2 className="w-4 h-4 mr-1" /> Delete
              </button>
              <label className="flex-1 inline-flex items-center justify-center px-3 py-1.5 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 cursor-pointer">
                <Upload className="w-4 h-4 mr-1" /> Upload
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files?.[0])
                      onImageUpload(item._id, e.target.files[0]);
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

// ==================== ACHIEVEMENTS EDITOR ====================

const AchievementsEditor: React.FC<{
  homeData: HomeData | null;
  onUpdate: () => void;
  showSnackbar: (
    message: string,
    type: "success" | "error" | "info" | "warning",
  ) => void;
}> = ({ homeData, onUpdate, showSnackbar }) => {
  const [title, setTitle] = useState<string>(
    homeData?.achievements?.title || "",
  );
  const [description, setDescription] = useState<string>(
    homeData?.achievements?.description || "",
  );
  const [stats, setStats] = useState(
    homeData?.achievements?.stats || {
      yearsOfExperience: 15,
      satisfiedClients: 4200,
      reviews: 892,
      satisfactionRate: 92,
    },
  );
  const [saving, setSaving] = useState<boolean>(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [imageUrl, setImageUrl] = useState<string>("");
  const [imageSource, setImageSource] = useState<"file" | "url">("file");

  useEffect(() => {
    if (homeData?.achievements) {
      setTitle(homeData.achievements.title || "");
      setDescription(homeData.achievements.description || "");
      setStats(homeData.achievements.stats);
    }
  }, [homeData]);

  const handleImageSelect = (e: ChangeEvent<HTMLInputElement>): void => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImageSource("file");
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
      setImageUrl("");
    }
  };

  const handleImageUrl = (url: string): void => {
    setImageUrl(url);
    setImageSource("url");
    setImagePreview(url);
    setImageFile(null);
  };

  const handleAddImage = async (): Promise<void> => {
    const caption = prompt("Enter image caption:");
    if (!caption) return;

    try {
      let response;
      if (imageSource === "file" && imageFile) {
        response = await homeAPI.addAchievementImage(imageFile, caption);
      } else if (imageSource === "url" && imageUrl) {
        const blob = await fetch(imageUrl).then((r) => r.blob());
        const file = new File([blob], "image.jpg", { type: blob.type });
        response = await homeAPI.addAchievementImage(file, caption);
      } else {
        showSnackbar("Please select an image", "error");
        return;
      }

      if (response?.success) {
        showSnackbar("Image added successfully", "success");
        setImageFile(null);
        setImagePreview("");
        setImageUrl("");
        onUpdate();
      } else {
        showSnackbar(response?.message || "Add failed", "error");
      }
    } catch (error) {
      showSnackbar("Error adding image", "error");
    }
  };

  const handleDeleteImage = async (imageId: string): Promise<void> => {
    if (window.confirm("Are you sure you want to delete this image?")) {
      try {
        const response = await homeAPI.deleteAchievementImage(imageId);
        if (response?.success) {
          showSnackbar("Image deleted successfully", "success");
          onUpdate();
        } else {
          showSnackbar(response?.message || "Delete failed", "error");
        }
      } catch (error) {
        showSnackbar("Error deleting image", "error");
      }
    }
  };

  const handleSave = async (): Promise<void> => {
    try {
      setSaving(true);
      const updateData: Partial<AchievementsSection> = {
        title,
        description,
        stats,
      };
      const response = await homeAPI.updateAchievements(updateData);
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
              value={stats.yearsOfExperience}
              onChange={(e) =>
                setStats({
                  ...stats,
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
              value={stats.satisfiedClients}
              onChange={(e) =>
                setStats({
                  ...stats,
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
              value={stats.reviews}
              onChange={(e) =>
                setStats({ ...stats, reviews: parseInt(e.target.value) })
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
              value={stats.satisfactionRate}
              onChange={(e) =>
                setStats({
                  ...stats,
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
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-purple-500 transition">
            <div className="flex gap-2 mb-3">
              <button
                onClick={() => setImageSource("file")}
                className={`px-3 py-1 text-sm rounded flex-1 ${imageSource === "file" ? "bg-purple-600 text-white" : "bg-gray-200"}`}
              >
                File
              </button>
              <button
                onClick={() => setImageSource("url")}
                className={`px-3 py-1 text-sm rounded flex-1 ${imageSource === "url" ? "bg-purple-600 text-white" : "bg-gray-200"}`}
              >
                URL
              </button>
            </div>
            {imageSource === "file" ? (
              <label className="flex items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-purple-500">
                <div className="text-center">
                  <Upload className="w-6 h-6 text-gray-400 mx-auto" />
                  <span className="text-xs text-gray-500">Click to upload</span>
                </div>
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleImageSelect}
                />
              </label>
            ) : (
              <input
                type="text"
                placeholder="Enter image URL"
                value={imageUrl}
                onChange={(e) => handleImageUrl(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            )}
            {imagePreview && (
              <img
                src={imagePreview}
                alt="Preview"
                className="mt-2 w-full h-24 object-cover rounded-lg"
              />
            )}
            <button
              onClick={handleAddImage}
              className="mt-3 w-full py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-sm"
            >
              Add Image
            </button>
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

// ==================== MEDIA SPOTLIGHT EDITOR ====================

const MediaSpotlightEditor: React.FC<{
  data: MediaSpotlightItem[];
  onAdd: () => void;
  onEdit: (item: MediaSpotlightItem) => void;
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
          <Plus className="w-4 h-4 mr-2" /> Add New
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
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${item.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}
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
                <Edit2 className="w-4 h-4 mr-1" /> Edit
              </button>
              <button
                onClick={() => onDelete(item._id)}
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
          No media spotlight items found. Click Add New to create one.
        </div>
      )}
    </div>
  );
};

// ==================== CATALOGUE EDITOR ====================

const CatalogueEditor: React.FC<{
  data: CatalogueItemType[];
  onAdd: () => void;
  onEdit: (item: CatalogueItemType) => void;
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
          <Plus className="w-4 h-4 mr-2" /> Add New
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
                alt={item.name}
                className="w-full h-48 object-cover"
              />
            )}
            <div className="p-4">
              <h4 className="text-lg font-semibold text-gray-900">
                {item.name}
              </h4>
              <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                {item.description}
              </p>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-purple-600 font-bold">₹{item.price}</span>
                <span className="text-yellow-400">★</span>
                <span>{item.rating}</span>
              </div>
              <div className="mt-2">
                <span
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${item.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}
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
                <Edit2 className="w-4 h-4 mr-1" /> Edit
              </button>
              <button
                onClick={() => onDelete(item._id)}
                className="flex-1 inline-flex items-center justify-center px-3 py-1.5 text-sm text-red-700 bg-red-50 rounded-lg hover:bg-red-100 transition"
              >
                <Trash2 className="w-4 h-4 mr-1" /> Delete
              </button>
              <label className="flex-1 inline-flex items-center justify-center px-3 py-1.5 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 cursor-pointer">
                <Upload className="w-4 h-4 mr-1" /> Upload
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files?.[0])
                      onImageUpload(item._id, e.target.files[0]);
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

// ==================== EXPERT GUIDES EDITOR ====================

const ExpertGuidesEditor: React.FC<{
  data: ExpertGuideItem[];
  onAdd: () => void;
  onEdit: (item: ExpertGuideItem) => void;
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
          <Plus className="w-4 h-4 mr-2" /> Add New
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
                    <CheckCircle className="w-3 h-3 mr-1" /> Verified
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
                <Edit2 className="w-4 h-4 mr-1" /> Edit
              </button>
              <button
                onClick={() => onDelete(guide._id)}
                className="flex-1 inline-flex items-center justify-center px-3 py-1.5 text-sm text-red-700 bg-red-50 rounded-lg hover:bg-red-100 transition"
              >
                <Trash2 className="w-4 h-4 mr-1" /> Delete
              </button>
              <label className="flex-1 inline-flex items-center justify-center px-3 py-1.5 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 cursor-pointer">
                <Upload className="w-4 h-4 mr-1" /> Upload
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files?.[0])
                      onImageUpload(guide._id, e.target.files[0]);
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

// ==================== FORM DIALOG CONTENT ====================

const FormDialogContent: React.FC<{
  section: string;
  formData: Record<string, unknown>;
  onFormChange: (field: string, value: unknown) => void;
  onArrayItemAdd: (field: string, newItem: Record<string, string>) => void;
  onArrayItemRemove: (field: string, index: number) => void;
  onArrayItemChange: (
    field: string,
    index: number,
    subField: string,
    value: string,
  ) => void;
  imagePreview: string;
  imageUrlInput: string;
  imageSource: "file" | "url";
  onImageSelect: (e: ChangeEvent<HTMLInputElement>) => void;
  onImageUrlInput: (url: string) => void;
}> = ({
  section,
  formData,
  onFormChange,
  onArrayItemAdd,
  onArrayItemRemove,
  onArrayItemChange,
  imagePreview,
  imageUrlInput,
  imageSource,
  onImageSelect,
  onImageUrlInput,
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
              value={(formData.title as string) || ""}
              onChange={(e) => onFormChange("title", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
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
            />
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
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={(formData.isActive as boolean) || false}
              onChange={(e) => onFormChange("isActive", e.target.checked)}
              className="w-4 h-4 text-purple-600 rounded"
            />
            <label className="ml-2 text-sm text-gray-700">Active</label>
          </div>
          <ImageUploadSection
            imagePreview={imagePreview}
            imageUrlInput={imageUrlInput}
            imageSource={imageSource}
            onImageSelect={onImageSelect}
            onImageUrlInput={onImageUrlInput}
          />
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
              value={(formData.title as string) || ""}
              onChange={(e) => onFormChange("title", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Logo URL
            </label>
            <input
              type="text"
              value={(formData.logo as string) || ""}
              onChange={(e) => onFormChange("logo", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Link URL
            </label>
            <input
              type="text"
              value={(formData.link as string) || ""}
              onChange={(e) => onFormChange("link", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
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
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={(formData.isActive as boolean) || false}
              onChange={(e) => onFormChange("isActive", e.target.checked)}
              className="w-4 h-4 text-purple-600 rounded"
            />
            <label className="ml-2 text-sm text-gray-700">Active</label>
          </div>
          <ImageUploadSection
            imagePreview={imagePreview}
            imageUrlInput={imageUrlInput}
            imageSource={imageSource}
            onImageSelect={onImageSelect}
            onImageUrlInput={onImageUrlInput}
          />
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
              value={(formData.title as string) || ""}
              onChange={(e) => onFormChange("title", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              rows={2}
              value={(formData.description as string) || ""}
              onChange={(e) => onFormChange("description", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Price
            </label>
            <input
              type="text"
              value={(formData.price as string) || "0"}
              onChange={(e) => onFormChange("price", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rating
            </label>
            <input
              type="number"
              step="0.1"
              value={(formData.rating as number) || 4.5}
              onChange={(e) =>
                onFormChange("rating", parseFloat(e.target.value))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div className="border-t pt-4">
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-medium text-gray-900">Traits</h4>
              <button
                type="button"
                onClick={() => onArrayItemAdd("traits", { trait: "" })}
                className="text-sm text-purple-600"
              >
                + Add Trait
              </button>
            </div>
            {((formData.traits as Array<{ trait: string }>) || []).map(
              (trait: { trait: string }, idx: number) => (
                <div key={idx} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="Trait"
                    value={trait.trait || ""}
                    onChange={(e) =>
                      onArrayItemChange("traits", idx, "trait", e.target.value)
                    }
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => onArrayItemRemove("traits", idx)}
                    className="p-2 text-red-500"
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
                onClick={() => onArrayItemAdd("benefits", { benefit: "" })}
                className="text-sm text-purple-600"
              >
                + Add Benefit
              </button>
            </div>
            {((formData.benefits as Array<{ benefit: string }>) || []).map(
              (benefit: { benefit: string }, idx: number) => (
                <div key={idx} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="Benefit"
                    value={benefit.benefit || ""}
                    onChange={(e) =>
                      onArrayItemChange(
                        "benefits",
                        idx,
                        "benefit",
                        e.target.value,
                      )
                    }
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => onArrayItemRemove("benefits", idx)}
                    className="p-2 text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ),
            )}
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
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={(formData.isActive as boolean) || false}
              onChange={(e) => onFormChange("isActive", e.target.checked)}
              className="w-4 h-4 text-purple-600 rounded"
            />
            <label className="ml-2 text-sm text-gray-700">Active</label>
          </div>
          <ImageUploadSection
            imagePreview={imagePreview}
            imageUrlInput={imageUrlInput}
            imageSource={imageSource}
            onImageSelect={onImageSelect}
            onImageUrlInput={onImageUrlInput}
          />
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
              value={(formData.name as string) || ""}
              onChange={(e) => onFormChange("name", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm text-gray-600">Rating</label>
              <input
                type="number"
                step="0.1"
                value={(formData.rating as number) || 4.8}
                onChange={(e) =>
                  onFormChange("rating", parseFloat(e.target.value))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600">Reviews</label>
              <input
                type="number"
                value={(formData.reviews as number) || 892}
                onChange={(e) =>
                  onFormChange("reviews", parseInt(e.target.value))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600">
                Satisfaction (%)
              </label>
              <input
                type="number"
                value={(formData.satisfactionRate as number) || 92}
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
              value={(formData.expertise as string) || ""}
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
              value={(formData.experience as string) || ""}
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
              value={((formData.languages as string[]) || []).join(", ")}
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
              value={((formData.expertiseAreas as string[]) || []).join(", ")}
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
              checked={(formData.isVerified as boolean) || false}
              onChange={(e) => onFormChange("isVerified", e.target.checked)}
              className="w-4 h-4 text-purple-600 rounded"
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
              value={(formData.order as number) || 0}
              onChange={(e) => onFormChange("order", parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={(formData.isActive as boolean) || false}
              onChange={(e) => onFormChange("isActive", e.target.checked)}
              className="w-4 h-4 text-purple-600 rounded"
            />
            <label className="ml-2 text-sm text-gray-700">Active</label>
          </div>
          <ImageUploadSection
            imagePreview={imagePreview}
            imageUrlInput={imageUrlInput}
            imageSource={imageSource}
            onImageSelect={onImageSelect}
            onImageUrlInput={onImageUrlInput}
          />
        </div>
      );
    default:
      return null;
  }
};

// ==================== IMAGE UPLOAD SECTION ====================

const ImageUploadSection: React.FC<{
  imagePreview: string;
  imageUrlInput: string;
  imageSource: "file" | "url";
  onImageSelect: (e: ChangeEvent<HTMLInputElement>) => void;
  onImageUrlInput: (url: string) => void;
}> = ({
  imagePreview,
  imageUrlInput,
  imageSource,
  onImageSelect,
  onImageUrlInput,
}) => {
  const [source, setSource] = useState<"file" | "url">(imageSource);

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Image
      </label>
      <div className="flex gap-2 mb-2">
        <button
          onClick={() => setSource("file")}
          className={`px-3 py-1 text-sm rounded ${source === "file" ? "bg-purple-600 text-white" : "bg-gray-200"}`}
        >
          Upload File
        </button>
        <button
          onClick={() => setSource("url")}
          className={`px-3 py-1 text-sm rounded ${source === "url" ? "bg-purple-600 text-white" : "bg-gray-200"}`}
        >
          Enter URL
        </button>
      </div>
      {source === "file" ? (
        <label className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 cursor-pointer">
          <Upload className="w-4 h-4 mr-2" /> Choose Image
          <input type="file" hidden accept="image/*" onChange={onImageSelect} />
        </label>
      ) : (
        <input
          type="text"
          placeholder="Enter image URL"
          value={imageUrlInput}
          onChange={(e) => onImageUrlInput(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
        />
      )}
      {imagePreview && (
        <div className="mt-2">
          <img
            src={imagePreview}
            alt="Preview"
            className="w-full max-h-48 object-cover rounded-lg"
          />
        </div>
      )}
    </div>
  );
};

export default Home;
