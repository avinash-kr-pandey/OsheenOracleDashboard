"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  CreateHoroscopeData,
  CreateRishiData,
  CreateZodiacData,
  Zodiac,
  HoroscopePrediction,
  Rishi,
} from "@/utils/horoscopemain.api";
import {
  TIME_FRAMES,
  ZODIAC_SIGNS_LIST,
  ELEMENTS,
  fetchAllData,
  addZodiacAPI,
  updateZodiacAPI,
  deleteZodiacAPI,
  addPredictionAPI,
  updatePredictionAPI,
  deletePredictionAPI,
  addRishiAPI,
  updateRishiAPI,
  deleteRishiAPI,
} from "@/lib/horoscopeStore";

type TabType = "zodiacs" | "predictions" | "rishis";
type TimeFrame = "daily" | "weekly" | "monthly" | "yearly";

interface ToastState {
  show: boolean;
  message: string;
  type: "success" | "error";
}

const Horoscope = () => {
  // Data states
  const [zodiacs, setZodiacs] = useState<Zodiac[]>([]);
  const [predictions, setPredictions] = useState<HoroscopePrediction[]>([]);
  const [rishis, setRishis] = useState<Rishi[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // UI states
  const [activeTab, setActiveTab] = useState<TabType>("zodiacs");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [selectedTimeFrame, setSelectedTimeFrame] = useState<TimeFrame | "all">(
    "all",
  );
  const [showModal, setShowModal] = useState<boolean>(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [selectedItem, setSelectedItem] = useState<
    Zodiac | HoroscopePrediction | Rishi | null
  >(null);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState>({
    show: false,
    message: "",
    type: "success",
  });

  // Form states
  const [zodiacForm, setZodiacForm] = useState<CreateZodiacData>({
    name: "",
    nameHindi: "",
    symbol: "",
    icon: "",
    dates: "",
    datesHindi: "",
    element: "",
    elementHindi: "",
  });

  const [predictionForm, setPredictionForm] = useState<CreateHoroscopeData>({
    zodiacSign: "",
    zodiacSignHindi: "",
    rishiName: "",
    rishiNameHindi: "",
    date: new Date().toISOString().split("T")[0],
    prediction: "",
    predictionHindi: "",
    timeFrame: "daily",
  });

  const [rishiForm, setRishiForm] = useState<CreateRishiData>({
    name: "",
    nameHindi: "",
    biography: "",
    biographyHindi: "",
    era: "",
    eraHindi: "",
  });

  const showNotification = useCallback(
    (message: string, type: "success" | "error") => {
      setToast({ show: true, message, type });
      setTimeout(
        () => setToast({ show: false, message: "", type: "success" }),
        3000,
      );
    },
    [],
  );

  // Load data on mount
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchAllData();
      setZodiacs(data.zodiacs);
      setPredictions(data.predictions);
      setRishis(data.rishis);
    } catch (error) {
      console.error("Error loading data:", error);
      showNotification("Failed to load data", "error");
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const resetForms = useCallback(() => {
    setZodiacForm({
      name: "",
      nameHindi: "",
      symbol: "",
      icon: "",
      dates: "",
      datesHindi: "",
      element: "",
      elementHindi: "",
    });
    setPredictionForm({
      zodiacSign: "",
      zodiacSignHindi: "",
      rishiName: "",
      rishiNameHindi: "",
      date: new Date().toISOString().split("T")[0],
      prediction: "",
      predictionHindi: "",
      timeFrame: "daily",
    });
    setRishiForm({
      name: "",
      nameHindi: "",
      biography: "",
      biographyHindi: "",
      era: "",
      eraHindi: "",
    });
  }, []);

  const handleAddClick = useCallback(() => {
    setModalMode("add");
    resetForms();
    setShowModal(true);
  }, [resetForms]);

  const handleEditClick = useCallback(
    (item: Zodiac | HoroscopePrediction | Rishi) => {
      setModalMode("edit");
      setSelectedItem(item);

      if (activeTab === "zodiacs") {
        const zodiac = item as Zodiac;
        setZodiacForm({
          name: zodiac.name || "",
          nameHindi: zodiac.nameHindi || "",
          symbol: zodiac.symbol || "",
          icon: zodiac.icon || "",
          dates: zodiac.dates || "",
          datesHindi: zodiac.datesHindi || "",
          element: zodiac.element || "",
          elementHindi: zodiac.elementHindi || "",
        });
      } else if (activeTab === "predictions") {
        const prediction = item as HoroscopePrediction;
        setPredictionForm({
          zodiacSign: prediction.zodiacSign || "",
          zodiacSignHindi: prediction.zodiacSignHindi || "",
          rishiName: prediction.rishiName || "",
          rishiNameHindi: prediction.rishiNameHindi || "",
          date:
            prediction.date?.split("T")[0] ||
            new Date().toISOString().split("T")[0],
          prediction: prediction.prediction || "",
          predictionHindi: prediction.predictionHindi || "",
          timeFrame: prediction.timeFrame || "daily",
        });
      } else if (activeTab === "rishis") {
        const rishi = item as Rishi;
        setRishiForm({
          name: rishi.name || "",
          nameHindi: rishi.nameHindi || "",
          biography: rishi.biography || "",
          biographyHindi: rishi.biographyHindi || "",
          era: rishi.era || "",
          eraHindi: rishi.eraHindi || "",
        });
      }
      setShowModal(true);
    },
    [activeTab],
  );

  const handleDeleteClick = useCallback((id: string) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteId) return;
    setSubmitting(true);
    try {
      if (activeTab === "zodiacs") {
        await deleteZodiacAPI(deleteId);
        setZodiacs((prev) => prev.filter((z) => z._id !== deleteId));
      } else if (activeTab === "predictions") {
        await deletePredictionAPI(deleteId);
        setPredictions((prev) => prev.filter((p) => p._id !== deleteId));
      } else if (activeTab === "rishis") {
        await deleteRishiAPI(deleteId);
        setRishis((prev) => prev.filter((r) => r._id !== deleteId));
      }
      showNotification("Deleted successfully!", "success");
    } catch (error) {
      showNotification("Error deleting item", "error");
    } finally {
      setSubmitting(false);
      setShowDeleteModal(false);
      setDeleteId(null);
    }
  }, [deleteId, activeTab, showNotification]);

  const handleSubmit = useCallback(async () => {
    setSubmitting(true);
    try {
      if (activeTab === "zodiacs") {
        if (modalMode === "add") {
          const newZodiac = await addZodiacAPI(zodiacForm);
          setZodiacs((prev) => [...prev, newZodiac]);
        } else if (selectedItem) {
          const updated = await updateZodiacAPI(
            (selectedItem as Zodiac)._id,
            zodiacForm,
          );
          setZodiacs((prev) =>
            prev.map((z) =>
              z._id === (selectedItem as Zodiac)._id ? updated : z,
            ),
          );
        }
      } else if (activeTab === "predictions") {
        if (modalMode === "add") {
          const newPrediction = await addPredictionAPI(predictionForm);
          setPredictions((prev) => [...prev, newPrediction]);
        } else if (selectedItem) {
          const updated = await updatePredictionAPI(
            (selectedItem as HoroscopePrediction)._id,
            predictionForm,
          );
          setPredictions((prev) =>
            prev.map((p) =>
              p._id === (selectedItem as HoroscopePrediction)._id ? updated : p,
            ),
          );
        }
      } else if (activeTab === "rishis") {
        if (modalMode === "add") {
          const newRishi = await addRishiAPI(rishiForm);
          setRishis((prev) => [...prev, newRishi]);
        } else if (selectedItem) {
          const updated = await updateRishiAPI(
            (selectedItem as Rishi)._id,
            rishiForm,
          );
          setRishis((prev) =>
            prev.map((r) =>
              r._id === (selectedItem as Rishi)._id ? updated : r,
            ),
          );
        }
      }
      showNotification(
        `${modalMode === "add" ? "Added" : "Updated"} successfully!`,
        "success",
      );
      setShowModal(false);
      resetForms();
    } catch (error) {
      showNotification(
        `Error ${modalMode === "add" ? "adding" : "updating"} item`,
        "error",
      );
    } finally {
      setSubmitting(false);
    }
  }, [
    activeTab,
    modalMode,
    zodiacForm,
    predictionForm,
    rishiForm,
    selectedItem,
    showNotification,
    resetForms,
  ]);

  const getFilteredData = useCallback((): (
    | Zodiac
    | HoroscopePrediction
    | Rishi
  )[] => {
    const term = searchTerm.toLowerCase();
    if (activeTab === "zodiacs") {
      return zodiacs.filter(
        (z) =>
          z.name.toLowerCase().includes(term) || z.nameHindi.includes(term),
      );
    } else if (activeTab === "predictions") {
      let filtered = predictions.filter(
        (p) =>
          p.zodiacSign.toLowerCase().includes(term) ||
          (p.rishiName || "").toLowerCase().includes(term),
      );
      if (selectedTimeFrame !== "all")
        filtered = filtered.filter((p) => p.timeFrame === selectedTimeFrame);
      return filtered;
    } else {
      return rishis.filter(
        (r) =>
          r.name.toLowerCase().includes(term) ||
          (r.nameHindi || "").includes(term),
      );
    }
  }, [activeTab, searchTerm, zodiacs, predictions, rishis, selectedTimeFrame]);

  const renderIcon = (icon: string) => {
    if (!icon) return <span className="text-2xl">♈</span>;
    if (icon.startsWith("data:image") || icon.startsWith("http")) {
      return (
        <Image
          src={icon}
          alt="icon"
          width={32}
          height={32}
          className="w-8 h-8 object-contain"
          unoptimized
        />
      );
    }
    return <span className="text-2xl">{icon}</span>;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Horoscope Management
          </h1>
          <p className="text-gray-500 mt-1">
            Manage zodiac signs, predictions, and rishis
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 bg-white sticky top-[73px] z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="-mb-px flex space-x-8">
            {[
              {
                id: "zodiacs" as TabType,
                label: "Zodiac Signs",
                icon: "♈",
                count: zodiacs.length,
              },
              {
                id: "predictions" as TabType,
                label: "Predictions",
                icon: "📅",
                count: predictions.length,
              },
              {
                id: "rishis" as TabType,
                label: "Rishis",
                icon: "🕉️",
                count: rishis.length,
              },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setSearchTerm("");
                  setSelectedTimeFrame("all");
                }}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === tab.id ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}
              >
                <span className="flex items-center gap-2">
                  <span className="text-lg">{tab.icon}</span>
                  <span>{tab.label}</span>
                  <span
                    className={`ml-1 px-2 py-0.5 rounded-full text-xs ${activeTab === tab.id ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-600"}`}
                  >
                    {tab.count}
                  </span>
                </span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* TimeFrame Filter */}
        {activeTab === "predictions" && (
          <div className="mb-4 flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedTimeFrame("all")}
              className={`px-3 py-1 rounded-full text-sm ${selectedTimeFrame === "all" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"}`}
            >
              All
            </button>
            {TIME_FRAMES.map((tf) => (
              <button
                key={tf.value}
                onClick={() => setSelectedTimeFrame(tf.value)}
                className={`px-3 py-1 rounded-full text-sm capitalize ${selectedTimeFrame === tf.value ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"}`}
              >
                {tf.label}
              </button>
            ))}
          </div>
        )}

        {/* Search and Add */}
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="w-full sm:w-96 relative">
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 pl-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <svg
              className="absolute left-3 top-2.5 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <button
            onClick={handleAddClick}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors"
          >
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
            Add New {activeTab.slice(0, -1)}
          </button>
        </div>

        {/* Table */}
        {loading ? (
          <div className="animate-pulse bg-white rounded-lg p-4 space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 bg-gray-100 rounded-lg"></div>
            ))}
          </div>
        ) : getFilteredData().length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg">
            <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <svg
                className="w-12 h-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No {activeTab} found
            </h3>
            <button
              onClick={handleAddClick}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              + Add New
            </button>
          </div>
        ) : (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  {activeTab === "zodiacs" && (
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Icon
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Hindi Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Element
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Dates
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  )}
                  {activeTab === "predictions" && (
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Zodiac
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rishi
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Time Frame
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Prediction
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  )}
                  {activeTab === "rishis" && (
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Hindi Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Era
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Biography
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  )}
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {getFilteredData().map((item) => (
                    <tr
                      key={item._id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      {activeTab === "zodiacs" && (
                        <>
                          <td className="px-6 py-4">
                            {renderIcon((item as Zodiac).icon)}
                          </td>
                          <td className="px-6 py-4 font-medium text-gray-900">
                            {(item as Zodiac).name}
                          </td>
                          <td className="px-6 py-4 text-gray-600">
                            {(item as Zodiac).nameHindi}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                (item as Zodiac).element === "Fire"
                                  ? "bg-red-100 text-red-700"
                                  : (item as Zodiac).element === "Earth"
                                    ? "bg-green-100 text-green-700"
                                    : (item as Zodiac).element === "Air"
                                      ? "bg-blue-100 text-blue-700"
                                      : "bg-purple-100 text-purple-700"
                              }`}
                            >
                              {(item as Zodiac).element}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-gray-600">
                            {(item as Zodiac).dates}
                          </td>
                        </>
                      )}
                      {activeTab === "predictions" && (
                        <>
                          <td className="px-6 py-4 font-medium text-gray-900">
                            {(item as HoroscopePrediction).zodiacSign}
                          </td>
                          <td className="px-6 py-4 text-gray-600">
                            {(item as HoroscopePrediction).rishiName || "-"}
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium capitalize">
                              {(item as HoroscopePrediction).timeFrame}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-gray-600">
                            {new Date(
                              (item as HoroscopePrediction).date,
                            ).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 max-w-md">
                            <p className="text-gray-600 truncate">
                              {(
                                item as HoroscopePrediction
                              ).prediction.substring(0, 80)}
                              ...
                            </p>
                          </td>
                        </>
                      )}
                      {activeTab === "rishis" && (
                        <>
                          <td className="px-6 py-4 font-medium text-gray-900">
                            {(item as Rishi).name}
                          </td>
                          <td className="px-6 py-4 text-gray-600">
                            {(item as Rishi).nameHindi || "-"}
                          </td>
                          <td className="px-6 py-4 text-gray-600">
                            {(item as Rishi).era}
                          </td>
                          <td className="px-6 py-4 max-w-md">
                            <p className="text-gray-600 truncate">
                              {(item as Rishi).biography.substring(0, 80)}...
                            </p>
                          </td>
                        </>
                      )}
                      <td className="px-6 py-4">
                        <div className="flex space-x-3">
                          <button
                            onClick={() => handleEditClick(item)}
                            className="text-blue-600 hover:text-blue-900 transition-colors"
                            title="Edit"
                          >
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
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteClick(item._id)}
                            className="text-red-600 hover:text-red-900 transition-colors"
                            title="Delete"
                          >
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
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ==================== ADD/EDIT MODAL - ZODIACS ==================== */}
      {showModal && activeTab === "zodiacs" && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-xl font-semibold text-gray-900">
                {modalMode === "add" ? "Add" : "Edit"} Zodiac Sign
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
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
              </button>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name (English) *
                  </label>
                  <input
                    type="text"
                    value={zodiacForm.name}
                    onChange={(e) =>
                      setZodiacForm({ ...zodiacForm, name: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name (Hindi) *
                  </label>
                  <input
                    type="text"
                    value={zodiacForm.nameHindi}
                    onChange={(e) =>
                      setZodiacForm({
                        ...zodiacForm,
                        nameHindi: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Symbol
                  </label>
                  <input
                    type="text"
                    value={zodiacForm.symbol}
                    onChange={(e) =>
                      setZodiacForm({ ...zodiacForm, symbol: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="♈"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Icon (Emoji or URL)
                  </label>
                  <input
                    type="text"
                    value={zodiacForm.icon}
                    onChange={(e) =>
                      setZodiacForm({ ...zodiacForm, icon: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="♈ or image URL"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dates (English)
                  </label>
                  <input
                    type="text"
                    value={zodiacForm.dates}
                    onChange={(e) =>
                      setZodiacForm({ ...zodiacForm, dates: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="Mar 21 - Apr 19"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dates (Hindi)
                  </label>
                  <input
                    type="text"
                    value={zodiacForm.datesHindi}
                    onChange={(e) =>
                      setZodiacForm({
                        ...zodiacForm,
                        datesHindi: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Element (English)
                  </label>
                  <select
                    value={zodiacForm.element}
                    onChange={(e) =>
                      setZodiacForm({ ...zodiacForm, element: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="">Select</option>
                    {ELEMENTS.map((e) => (
                      <option key={e.name} value={e.name}>
                        {e.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Element (Hindi)
                  </label>
                  <input
                    type="text"
                    value={zodiacForm.elementHindi}
                    onChange={(e) =>
                      setZodiacForm({
                        ...zodiacForm,
                        elementHindi: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>
            </div>
            <div className="sticky bottom-0 bg-white px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
              >
                {submitting && (
                  <svg
                    className="animate-spin h-4 w-4 text-white"
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
                )}
                {submitting ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== ADD/EDIT MODAL - PREDICTIONS ==================== */}
      {showModal && activeTab === "predictions" && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-xl font-semibold text-gray-900">
                {modalMode === "add" ? "Add" : "Edit"} Prediction
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
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
              </button>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Zodiac Sign *
                  </label>
                  <select
                    value={predictionForm.zodiacSign}
                    onChange={(e) =>
                      setPredictionForm({
                        ...predictionForm,
                        zodiacSign: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  >
                    <option value="">Select</option>
                    {zodiacs.map((z) => (
                      <option key={z._id} value={z.name}>
                        {z.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Zodiac Sign (Hindi)
                  </label>
                  <input
                    type="text"
                    value={predictionForm.zodiacSignHindi}
                    onChange={(e) =>
                      setPredictionForm({
                        ...predictionForm,
                        zodiacSignHindi: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rishi
                  </label>
                  <select
                    value={predictionForm.rishiName}
                    onChange={(e) =>
                      setPredictionForm({
                        ...predictionForm,
                        rishiName: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="">Select</option>
                    {rishis.map((r) => (
                      <option key={r._id} value={r.name}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rishi (Hindi)
                  </label>
                  <input
                    type="text"
                    value={predictionForm.rishiNameHindi}
                    onChange={(e) =>
                      setPredictionForm({
                        ...predictionForm,
                        rishiNameHindi: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Time Frame *
                  </label>
                  <select
                    value={predictionForm.timeFrame}
                    onChange={(e) =>
                      setPredictionForm({
                        ...predictionForm,
                        timeFrame: e.target.value as TimeFrame,
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  >
                    {TIME_FRAMES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    value={predictionForm.date}
                    onChange={(e) =>
                      setPredictionForm({
                        ...predictionForm,
                        date: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prediction (English) *
                  </label>
                  <textarea
                    value={predictionForm.prediction}
                    onChange={(e) =>
                      setPredictionForm({
                        ...predictionForm,
                        prediction: e.target.value,
                      })
                    }
                    rows={4}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prediction (Hindi)
                  </label>
                  <textarea
                    value={predictionForm.predictionHindi}
                    onChange={(e) =>
                      setPredictionForm({
                        ...predictionForm,
                        predictionHindi: e.target.value,
                      })
                    }
                    rows={4}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>
            </div>
            <div className="sticky bottom-0 bg-white px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
              >
                {submitting && (
                  <svg
                    className="animate-spin h-4 w-4 text-white"
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
                )}
                {submitting ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== ADD/EDIT MODAL - RISHIS ==================== */}
      {showModal && activeTab === "rishis" && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-xl font-semibold text-gray-900">
                {modalMode === "add" ? "Add" : "Edit"} Rishi
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
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
              </button>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name (English) *
                  </label>
                  <input
                    type="text"
                    value={rishiForm.name}
                    onChange={(e) =>
                      setRishiForm({ ...rishiForm, name: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name (Hindi)
                  </label>
                  <input
                    type="text"
                    value={rishiForm.nameHindi}
                    onChange={(e) =>
                      setRishiForm({ ...rishiForm, nameHindi: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Era (English) *
                  </label>
                  <input
                    type="text"
                    value={rishiForm.era}
                    onChange={(e) =>
                      setRishiForm({ ...rishiForm, era: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Era (Hindi)
                  </label>
                  <input
                    type="text"
                    value={rishiForm.eraHindi}
                    onChange={(e) =>
                      setRishiForm({ ...rishiForm, eraHindi: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Biography (English) *
                  </label>
                  <textarea
                    value={rishiForm.biography}
                    onChange={(e) =>
                      setRishiForm({ ...rishiForm, biography: e.target.value })
                    }
                    rows={4}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Biography (Hindi)
                  </label>
                  <textarea
                    value={rishiForm.biographyHindi}
                    onChange={(e) =>
                      setRishiForm({
                        ...rishiForm,
                        biographyHindi: e.target.value,
                      })
                    }
                    rows={4}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>
            </div>
            <div className="sticky bottom-0 bg-white px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
              >
                {submitting && (
                  <svg
                    className="animate-spin h-4 w-4 text-white"
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
                )}
                {submitting ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== DELETE MODAL ==================== */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="px-6 py-4">
              <div className="flex items-center justify-center mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
                Confirm Delete
              </h3>
              <p className="text-gray-500 text-center">
                Are you sure you want to delete this {activeTab.slice(0, -1)}?
                This action cannot be undone.
              </p>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={submitting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== TOAST NOTIFICATION ==================== */}
      {toast.show && (
        <div
          className={`fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg transition-all transform animate-slide-up ${toast.type === "success" ? "bg-green-500" : "bg-red-500"} text-white z-50`}
        >
          <div className="flex items-center gap-2">
            {toast.type === "success" ? (
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
                  d="M5 13l4 4L19 7"
                />
              </svg>
            ) : (
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            )}
            {toast.message}
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Horoscope;
