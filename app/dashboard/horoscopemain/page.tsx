// pages/admin/Horoscope.tsx
"use client";

import { CreateHoroscopeData, CreateRishiData, CreateZodiacData, horoscopeAPI, HoroscopePrediction, Rishi, rishiAPI, Zodiac, zodiacAPI } from "@/utils/horoscopemain.api";
import React, { useState, useEffect } from "react";

type TabType = "zodiacs" | "predictions" | "rishis";
type TimeFrame = "daily" | "weekly" | "monthly" | "yearly";

// Union type for all possible item types
type DataItem = Zodiac | HoroscopePrediction | Rishi;

// Form types
type ZodiacForm = CreateZodiacData;
type PredictionForm = CreateHoroscopeData;
type RishiForm = CreateRishiData;

const Horoscope = () => {
  const [activeTab, setActiveTab] = useState<TabType>("zodiacs");

  // Data states
  const [zodiacs, setZodiacs] = useState<Zodiac[]>([]);
  const [predictions, setPredictions] = useState<HoroscopePrediction[]>([]);
  const [rishis, setRishis] = useState<Rishi[]>([]);

  // UI states
  const [loading, setLoading] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedTimeFrame] = useState<TimeFrame>("daily");
  const [] = useState<string>("");

  // Modal states
  const [showModal, setShowModal] = useState<boolean>(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [selectedItem, setSelectedItem] = useState<DataItem | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showToast, setShowToast] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error";
  }>({
    show: false,
    message: "",
    type: "success",
  });

  // Form states for different tabs
  const [zodiacForm, setZodiacForm] = useState<ZodiacForm>({
    name: "",
    nameHindi: "",
    symbol: "",
    icon: "",
    dates: "",
    datesHindi: "",
    element: "",
    elementHindi: "",
  });

  const [predictionForm, setPredictionForm] = useState<PredictionForm>({
    zodiacSign: "",
    zodiacSignHindi: "",
    rishiName: "",
    rishiNameHindi: "",
    date: new Date().toISOString().split("T")[0],
    prediction: "",
    predictionHindi: "",
    timeFrame: "daily",
  });

  const [rishiForm, setRishiForm] = useState<RishiForm>({
    name: "",
    nameHindi: "",
    biography: "",
    biographyHindi: "",
    era: "",
    eraHindi: "",
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Fetch all data on mount
  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async (): Promise<void> => {
    setLoading(true);
    try {
      const [zodiacData, predictionData, rishiData] = await Promise.all([
        zodiacAPI.getAll(),
        horoscopeAPI.getAll(),
        rishiAPI.getAll(),
      ]);

      setZodiacs(Array.isArray(zodiacData) ? zodiacData : []);
      setPredictions(Array.isArray(predictionData) ? predictionData : []);
      setRishis(Array.isArray(rishiData) ? rishiData : []);
    } catch (error) {
      showNotification("Error fetching data", "error");
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (
    message: string,
    type: "success" | "error",
  ): void => {
    setShowToast({ show: true, message, type });
    setTimeout(
      () => setShowToast({ show: false, message: "", type: "success" }),
      3000,
    );
  };

  // Reset forms
  const resetForms = (): void => {
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
    setFormErrors({});
  };

  // Handle Add click
  const handleAddClick = (): void => {
    setModalMode("add");
    resetForms();
    setShowModal(true);
  };

  // Handle Edit click
  const handleEditClick = (item: DataItem): void => {
    setModalMode("edit");
    setSelectedItem(item);

    switch (activeTab) {
      case "zodiacs": {
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
        break;
      }
      case "predictions": {
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
        break;
      }
      case "rishis": {
        const rishi = item as Rishi;
        setRishiForm({
          name: rishi.name || "",
          nameHindi: rishi.nameHindi || "",
          biography: rishi.biography || "",
          biographyHindi: rishi.biographyHindi || "",
          era: rishi.era || "",
          eraHindi: rishi.eraHindi || "",
        });
        break;
      }
    }
    setShowModal(true);
  };

  // Handle Delete
  const handleDeleteClick = (id: string): void => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async (): Promise<void> => {
    if (!deleteId) return;

    setLoading(true);
    try {
      switch (activeTab) {
        case "zodiacs":
          await zodiacAPI.delete(deleteId);
          break;
        case "predictions":
          await horoscopeAPI.delete(deleteId);
          break;
        case "rishis":
          await rishiAPI.delete(deleteId);
          break;
      }
      showNotification("Deleted successfully!", "success");
      fetchAllData();
    } catch (error) {
      showNotification("Error deleting", "error");
    } finally {
      setLoading(false);
      setShowDeleteModal(false);
      setDeleteId(null);
    }
  };

  // Handle Form Submit
  const handleSubmit = async (): Promise<void> => {
    setLoading(true);
    try {
      switch (activeTab) {
        case "zodiacs":
          if (modalMode === "add") {
            await zodiacAPI.create(zodiacForm);
          } else {
            if (selectedItem) {
              await zodiacAPI.update((selectedItem as Zodiac)._id, zodiacForm);
            }
          }
          break;
        case "predictions":
          if (modalMode === "add") {
            await horoscopeAPI.create(predictionForm);
          } else {
            if (selectedItem) {
              await horoscopeAPI.update(
                (selectedItem as HoroscopePrediction)._id,
                predictionForm,
              );
            }
          }
          break;
        case "rishis":
          if (modalMode === "add") {
            await rishiAPI.create(rishiForm);
          } else {
            if (selectedItem) {
              await rishiAPI.update((selectedItem as Rishi)._id, rishiForm);
            }
          }
          break;
      }
      showNotification(
        `${modalMode === "add" ? "Added" : "Updated"} successfully!`,
        "success",
      );
      setShowModal(false);
      fetchAllData();
    } catch (error) {
      showNotification(
        `Error ${modalMode === "add" ? "adding" : "updating"}`,
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  // Filter data based on search
  const getFilteredData = (): DataItem[] => {
    switch (activeTab) {
      case "zodiacs":
        return zodiacs.filter(
          (z: Zodiac) =>
            z.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            z.nameHindi.includes(searchTerm),
        );
      case "predictions":
        return predictions.filter(
          (p: HoroscopePrediction) =>
            p.zodiacSign.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (p.rishiName || "")
              .toLowerCase()
              .includes(searchTerm.toLowerCase()),
        );
      case "rishis":
        return rishis.filter(
          (r: Rishi) =>
            r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (r.nameHindi || "").includes(searchTerm),
        );
      default:
        return [];
    }
  };

  const timeFrames: TimeFrame[] = ["daily", "weekly", "monthly", "yearly"];
  const elements: string[] = ["Fire", "Earth", "Air", "Water"];

  // Type guard functions
  const isZodiac = (item: DataItem): item is Zodiac => {
    return (
      (item as Zodiac).name !== undefined && (item as Zodiac).icon !== undefined
    );
  };

  const isPrediction = (item: DataItem): item is HoroscopePrediction => {
    return (item as HoroscopePrediction).zodiacSign !== undefined;
  };

  const isRishi = (item: DataItem): item is Rishi => {
    return (item as Rishi).biography !== undefined;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Horoscope Management
          </h1>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("zodiacs")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "zodiacs"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Zodiac Signs ({zodiacs.length})
            </button>
            <button
              onClick={() => setActiveTab("predictions")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "predictions"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Predictions ({predictions.length})
            </button>
            <button
              onClick={() => setActiveTab("rishis")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "rishis"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Rashi ({rishis.length})
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Add Bar */}
        <div className="mb-6 flex justify-between items-center">
          <div className="w-96">
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setSearchTerm(e.target.value)
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={handleAddClick}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
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
            Add New
          </button>
        </div>

        {/* Tables */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  {activeTab === "zodiacs" && (
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Icon
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Hindi Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Element
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Dates
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Actions
                      </th>
                    </tr>
                  )}
                  {activeTab === "predictions" && (
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Zodiac
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Rishi
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Time Frame
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Prediction
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Actions
                      </th>
                    </tr>
                  )}
                  {activeTab === "rishis" && (
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Hindi Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Era
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Biography
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Actions
                      </th>
                    </tr>
                  )}
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {getFilteredData().length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-6 py-4 text-center text-gray-500"
                      >
                        No data found
                      </td>
                    </tr>
                  ) : (
                    getFilteredData().map((item: DataItem, index: number) => (
                      <tr key={item._id || index} className="hover:bg-gray-50">
                        {activeTab === "zodiacs" && isZodiac(item) && (
                          <>
                            <td className="px-6 py-4 text-2xl">{item.icon}</td>
                            <td className="px-6 py-4">{item.name}</td>
                            <td className="px-6 py-4">{item.nameHindi}</td>
                            <td className="px-6 py-4">
                              <span
                                className={`px-2 py-1 rounded-full text-xs ${
                                  item.element === "Fire"
                                    ? "bg-red-100 text-red-700"
                                    : item.element === "Earth"
                                      ? "bg-green-100 text-green-700"
                                      : item.element === "Air"
                                        ? "bg-blue-100 text-blue-700"
                                        : "bg-purple-100 text-purple-700"
                                }`}
                              >
                                {item.element}
                              </span>
                            </td>
                            <td className="px-6 py-4">{item.dates}</td>
                          </>
                        )}
                        {activeTab === "predictions" && isPrediction(item) && (
                          <>
                            <td className="px-6 py-4">{item.zodiacSign}</td>
                            <td className="px-6 py-4">
                              {item.rishiName || "-"}
                            </td>
                            <td className="px-6 py-4">
                              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                                {item.timeFrame}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              {new Date(item.date).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 max-w-xs truncate">
                              {item.prediction.substring(0, 50)}...
                            </td>
                          </>
                        )}
                        {activeTab === "rishis" && isRishi(item) && (
                          <>
                            <td className="px-6 py-4">{item.name}</td>
                            <td className="px-6 py-4">
                              {item.nameHindi || "-"}
                            </td>
                            <td className="px-6 py-4">{item.era}</td>
                            <td className="px-6 py-4 max-w-xs truncate">
                              {item.biography.substring(0, 50)}...
                            </td>
                          </>
                        )}
                        <td className="px-6 py-4">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEditClick(item)}
                              className="text-blue-600 hover:text-blue-900"
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
                              className="text-red-600 hover:text-red-900"
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
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">
                {modalMode === "add" ? "Add" : "Edit"} {activeTab.slice(0, -1)}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-500"
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
              {activeTab === "zodiacs" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Name (English)
                    </label>
                    <input
                      type="text"
                      value={zodiacForm.name}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setZodiacForm({ ...zodiacForm, name: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Name (Hindi)
                    </label>
                    <input
                      type="text"
                      value={zodiacForm.nameHindi}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setZodiacForm({
                          ...zodiacForm,
                          nameHindi: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Symbol
                    </label>
                    <input
                      type="text"
                      value={zodiacForm.symbol}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setZodiacForm({ ...zodiacForm, symbol: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Icon
                    </label>
                    <input
                      type="text"
                      value={zodiacForm.icon}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setZodiacForm({ ...zodiacForm, icon: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      placeholder="♈"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Dates (English)
                    </label>
                    <input
                      type="text"
                      value={zodiacForm.dates}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setZodiacForm({ ...zodiacForm, dates: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      placeholder="Mar 21 - Apr 19"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Dates (Hindi)
                    </label>
                    <input
                      type="text"
                      value={zodiacForm.datesHindi}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setZodiacForm({
                          ...zodiacForm,
                          datesHindi: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Element (English)
                    </label>
                    <select
                      value={zodiacForm.element}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                        setZodiacForm({
                          ...zodiacForm,
                          element: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="">Select</option>
                      {elements.map((e) => (
                        <option key={e} value={e}>
                          {e}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Element (Hindi)
                    </label>
                    <input
                      type="text"
                      value={zodiacForm.elementHindi}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setZodiacForm({
                          ...zodiacForm,
                          elementHindi: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </>
              )}

              {activeTab === "predictions" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Zodiac Sign (English)
                    </label>
                    <select
                      value={predictionForm.zodiacSign}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                        setPredictionForm({
                          ...predictionForm,
                          zodiacSign: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="">Select</option>
                      {zodiacs.map((z: Zodiac) => (
                        <option key={z._id} value={z.name}>
                          {z.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Zodiac Sign (Hindi)
                    </label>
                    <input
                      type="text"
                      value={predictionForm.zodiacSignHindi}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setPredictionForm({
                          ...predictionForm,
                          zodiacSignHindi: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rashi Name (English)
                    </label>
                    <select
                      value={predictionForm.rishiName}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                        setPredictionForm({
                          ...predictionForm,
                          rishiName: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="">Select</option>
                      {rishis.map((r: Rishi) => (
                        <option key={r._id} value={r.name}>
                          {r.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rashi Name (Hindi)
                    </label>
                    <input
                      type="text"
                      value={predictionForm.rishiNameHindi}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setPredictionForm({
                          ...predictionForm,
                          rishiNameHindi: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Time Frame
                    </label>
                    <select
                      value={predictionForm.timeFrame}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                        setPredictionForm({
                          ...predictionForm,
                          timeFrame: e.target.value as TimeFrame,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    >
                      {timeFrames.map((t: TimeFrame) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date
                    </label>
                    <input
                      type="date"
                      value={predictionForm.date}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setPredictionForm({
                          ...predictionForm,
                          date: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Prediction (English)
                    </label>
                    <textarea
                      value={predictionForm.prediction}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                        setPredictionForm({
                          ...predictionForm,
                          prediction: e.target.value,
                        })
                      }
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Prediction (Hindi)
                    </label>
                    <textarea
                      value={predictionForm.predictionHindi}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                        setPredictionForm({
                          ...predictionForm,
                          predictionHindi: e.target.value,
                        })
                      }
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </>
              )}

              {activeTab === "rishis" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Name (English)
                    </label>
                    <input
                      type="text"
                      value={rishiForm.name}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setRishiForm({ ...rishiForm, name: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Name (Hindi)
                    </label>
                    <input
                      type="text"
                      value={rishiForm.nameHindi}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setRishiForm({
                          ...rishiForm,
                          nameHindi: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Era (English)
                    </label>
                    <input
                      type="text"
                      value={rishiForm.era}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setRishiForm({ ...rishiForm, era: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Era (Hindi)
                    </label>
                    <input
                      type="text"
                      value={rishiForm.eraHindi}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setRishiForm({ ...rishiForm, eraHindi: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Biography (English)
                    </label>
                    <textarea
                      value={rishiForm.biography}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                        setRishiForm({
                          ...rishiForm,
                          biography: e.target.value,
                        })
                      }
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Biography (Hindi)
                    </label>
                    <textarea
                      value={rishiForm.biographyHindi}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                        setRishiForm({
                          ...rishiForm,
                          biographyHindi: e.target.value,
                        })
                      }
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </>
              )}
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="px-6 py-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Confirm Delete
              </h3>
              <p className="text-gray-500">
                Are you sure you want to delete this item?
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
                disabled={loading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {loading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {showToast.show && (
        <div
          className={`fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg ${
            showToast.type === "success" ? "bg-green-500" : "bg-red-500"
          } text-white`}
        >
          {showToast.message}
        </div>
      )}
    </div>
  );
};

export default Horoscope;
