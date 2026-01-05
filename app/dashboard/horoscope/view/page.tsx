"use client";

import React, { useState } from "react";
import { toast, Toaster } from "react-hot-toast";
import { horoscopeAPI, HoroscopeResponse, Horoscope } from "@/utils/api";
import {
  FiSearch,
  FiCalendar,
  FiRefreshCw,
  FiCopy,
  FiDownload,
  FiShare2,
  FiPrinter,
  FiExternalLink,
} from "react-icons/fi";
import { HiOutlineDocumentDuplicate } from "react-icons/hi";

const ViewHoroscope: React.FC = () => {
  const [selectedSign, setSelectedSign] = useState("");
  const [selectedTimeFrame, setSelectedTimeFrame] = useState("");
  const [loading, setLoading] = useState(false);
  const [horoscopeData, setHoroscopeData] = useState<HoroscopeResponse | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  const zodiacSigns = [
    "Aries",
    "Taurus",
    "Gemini",
    "Cancer",
    "Leo",
    "Virgo",
    "Libra",
    "Scorpio",
    "Sagittarius",
    "Capricorn",
    "Aquarius",
    "Pisces",
  ];

  const timeFrames = [
    { value: "daily", label: "Daily", color: "bg-blue-100 text-blue-800" },
    {
      value: "weekly",
      label: "Weekly",
      color: "bg-purple-100 text-purple-800",
    },
    {
      value: "monthly",
      label: "Monthly",
      color: "bg-green-100 text-green-800",
    },
    {
      value: "yearly",
      label: "Yearly",
      color: "bg-yellow-100 text-yellow-800",
    },
  ];

  const rishiOptions = [
    {
      english: "Vashishta",
      hindi: "वशिष्ठ",
      color: "bg-indigo-100 text-indigo-800",
    },
    {
      english: "Vishwamitra",
      hindi: "विश्वामित्र",
      color: "bg-pink-100 text-pink-800",
    },
    { english: "Kanad", hindi: "कणाद", color: "bg-teal-100 text-teal-800" },
    {
      english: "Bhrigu",
      hindi: "भृगु",
      color: "bg-orange-100 text-orange-800",
    },
    { english: "Garga", hindi: "गर्ग", color: "bg-cyan-100 text-cyan-800" },
    {
      english: "Parashara",
      hindi: "पराशर",
      color: "bg-lime-100 text-lime-800",
    },
    {
      english: "Varahamihira",
      hindi: "वराहमिहिर",
      color: "bg-rose-100 text-rose-800",
    },
    {
      english: "Aryabhata",
      hindi: "आर्यभट्ट",
      color: "bg-violet-100 text-violet-800",
    },
  ];

  const fetchHoroscope = async () => {
    if (!selectedSign) {
      toast.error("Please select a zodiac sign");
      return;
    }

    setLoading(true);
    setError(null);
    setHoroscopeData(null);

    try {
      const response: HoroscopeResponse = await (selectedSign &&
      selectedTimeFrame
        ? horoscopeAPI.getHoroscopeBySignAndTime(
            selectedSign,
            selectedTimeFrame
          )
        : horoscopeAPI.getHoroscopeBySign(selectedSign));

      console.log("API Response:", response);

      // ✅ Extract horoscope items safely
      const items = getHoroscopeItems(response);

      // ✅ Data-based validation (BEST PRACTICE)
      if (items.length > 0) {
        setHoroscopeData(response);
        toast.success(`Found ${items.length} horoscope prediction(s)`);
      } else {
        setError(response?.message || "No horoscope data found");
        toast.success(response?.message || "No horoscope data found");
      }
    } catch (error: any) {
      console.error("Error fetching horoscope:", error);

      let errorMessage = "Failed to fetch horoscope";

      if (error.response?.status === 404) {
        errorMessage = `No horoscope found for ${selectedSign}`;
        toast.success(errorMessage);
      } else if (error.response?.status === 500) {
        errorMessage = "Server error. Please try again later.";
        toast.error(errorMessage);
      } else if (error.request) {
        errorMessage = "No response from server. Check your connection.";
        toast.error(errorMessage);
      } else {
        errorMessage = error.message || "Failed to fetch horoscope";
        toast.error(errorMessage);
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to extract horoscope items from response
  const getHoroscopeItems = (response: HoroscopeResponse): Horoscope[] => {
    const items: Horoscope[] = [];

    if (!response) return items;

    // Case 1: Response is directly a Horoscope object
    if (response._id && response.zodiacSign && response.prediction) {
      items.push(response as Horoscope);
    }

    // Case 2: Response has data property (single object or array)
    if (response.data) {
      if (Array.isArray(response.data)) {
        items.push(...response.data);
      } else if (response.data._id) {
        items.push(response.data);
      }
    }

    // Case 3: Response has horoscope property
    if (response.horoscope) {
      items.push(response.horoscope);
    }

    // Case 4: Response has horoscopes array
    if (response.horoscopes && Array.isArray(response.horoscopes)) {
      items.push(...response.horoscopes);
    }

    return Array.from(new Map(items.map((item) => [item._id, item])).values());
  };

  // Get items from current horoscopeData
  const getCurrentHoroscopeItems = (): Horoscope[] => {
    return horoscopeData ? getHoroscopeItems(horoscopeData) : [];
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchHoroscope();
  };

  const resetSearch = () => {
    setSelectedSign("");
    setSelectedTimeFrame("");
    setHoroscopeData(null);
    setError(null);
  };

  const formatDate = (dateString: string): string => {
    if (!dateString) return "Unknown date";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const formatDateTime = (dateString: string): string => {
    if (!dateString) return "Unknown";
    try {
      return new Date(dateString).toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  const copyToClipboard = (text: string, label: string = "Text") => {
    navigator.clipboard
      .writeText(text)
      .then(() => toast.success(`${label} copied to clipboard!`))
      .catch(() => toast.error("Failed to copy"));
  };

  const downloadPrediction = (horoscope: Horoscope) => {
    const content = `
🔮 HOROSCOPE PREDICTION
=======================

📅 Date: ${formatDate(horoscope.date)}
⏰ Time Frame: ${
      timeFrames.find((t) => t.value === horoscope.timeFrame)?.label ||
      horoscope.timeFrame
    }

♊ Zodiac Sign: ${horoscope.zodiacSign}
🪐 Hindi Sign: ${horoscope.zodiacSignHindi}

👨‍🏫 Rishi/Sage: ${horoscope.rishiName}
📿 Hindi Rishi: ${horoscope.rishiNameHindi}

📝 English Prediction:
${horoscope.prediction}

📝 Hindi Prediction:
${horoscope.predictionHindi}

📊 Metadata:
- Created: ${formatDateTime(horoscope.createdAt)}
- Last Updated: ${formatDateTime(horoscope.updatedAt)}
- ID: ${horoscope._id}
    `.trim();

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `horoscope-${horoscope.zodiacSign}-${horoscope.date}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success("Horoscope downloaded!");
  };

  const sharePrediction = async (horoscope: Horoscope) => {
    const shareText = `♊ ${horoscope.zodiacSign} Horoscope for ${formatDate(
      horoscope.date
    )}\n\n${
      horoscope.prediction
    }\n\nGet your daily horoscope at Osheen Oracle!`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `${horoscope.zodiacSign} Horoscope`,
          text: shareText,
          url: window.location.href,
        });
        toast.success("Shared successfully!");
      } catch (err) {
        console.error("Error sharing:", err);
        copyToClipboard(shareText, "Horoscope");
      }
    } else {
      copyToClipboard(shareText, "Horoscope");
    }
  };

  const printPrediction = (horoscope: Horoscope) => {
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>${horoscope.zodiacSign} Horoscope - ${formatDate(
        horoscope.date
      )}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; max-width: 800px; margin: 0 auto; }
            .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
            .section { margin-bottom: 25px; }
            .label { font-weight: bold; color: #555; margin-bottom: 5px; }
            .content { background: #f5f5f5; padding: 15px; border-radius: 5px; margin-bottom: 10px; }
            .hindi { font-family: 'Arial Unicode MS', 'Mangal', sans-serif; }
            @media print {
              .no-print { display: none; }
              body { padding: 0; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🔮 ${horoscope.zodiacSign} Horoscope</h1>
            <h2>${formatDate(horoscope.date)}</h2>
            <p>Time Frame: ${
              timeFrames.find((t) => t.value === horoscope.timeFrame)?.label ||
              horoscope.timeFrame
            }</p>
          </div>
          
          <div class="section">
            <div class="label">Zodiac Details</div>
            <p><strong>English:</strong> ${horoscope.zodiacSign}</p>
            <p><strong>Hindi:</strong> <span class="hindi">${
              horoscope.zodiacSignHindi
            }</span></p>
          </div>
          
          <div class="section">
            <div class="label">Rishi/Sage</div>
            <p><strong>English:</strong> ${horoscope.rishiName}</p>
            <p><strong>Hindi:</strong> <span class="hindi">${
              horoscope.rishiNameHindi
            }</span></p>
          </div>
          
          <div class="section">
            <div class="label">English Prediction</div>
            <div class="content">${horoscope.prediction.replace(
              /\n/g,
              "<br>"
            )}</div>
          </div>
          
          <div class="section">
            <div class="label">Hindi Prediction</div>
            <div class="content hindi">${horoscope.predictionHindi.replace(
              /\n/g,
              "<br>"
            )}</div>
          </div>
          
          <div class="section no-print">
            <p><em>Printed from Osheen Oracle on ${new Date().toLocaleString()}</em></p>
          </div>
        </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 250);
    }
  };

  const getRishiColor = (rishiName: string): string => {
    const rishi = rishiOptions.find((r) => r.english === rishiName);
    return rishi ? rishi.color : "bg-gray-100 text-gray-800";
  };

  const getTimeFrameColor = (timeFrame: string): string => {
    const tf = timeFrames.find((t) => t.value === timeFrame);
    return tf ? tf.color : "bg-gray-100 text-gray-800";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-6">
      <Toaster position="top-right" />

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
            🔮 View Horoscope Predictions
          </h1>
          <p className="text-gray-600">
            Search and view detailed horoscope predictions
          </p>
        </div>

        {/* Search Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">
            🔍 Search Horoscope
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Zodiac Sign */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ♊ Zodiac Sign <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedSign}
                  onChange={(e) => setSelectedSign(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  required
                >
                  <option value="">Select Zodiac Sign</option>
                  {zodiacSigns.map((sign) => (
                    <option key={sign} value={sign}>
                      {sign}
                    </option>
                  ))}
                </select>
              </div>

              {/* Time Frame */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ⏰ Time Frame (Optional)
                </label>
                <select
                  value={selectedTimeFrame}
                  onChange={(e) => setSelectedTimeFrame(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  <option value="">All Time Frames</option>
                  {timeFrames.map((time) => (
                    <option key={time.value} value={time.value}>
                      {time.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4 pt-4">
              <button
                type="submit"
                disabled={loading || !selectedSign}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  loading || !selectedSign
                    ? "bg-gray-400 cursor-not-allowed text-white"
                    : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl"
                }`}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Searching...
                  </>
                ) : (
                  <>
                    <FiSearch className="w-5 h-5" />
                    Search Horoscope
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={resetSearch}
                className="flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <FiRefreshCw className="w-5 h-5" />
                Reset Search
              </button>
            </div>
          </form>
        </div>

        {/* Results Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          {/* Results Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">📊 Results</h2>
              {selectedSign && (
                <p className="text-gray-600 mt-1">
                  Showing predictions for{" "}
                  <span className="font-semibold text-blue-600">
                    {selectedSign}
                  </span>
                  {selectedTimeFrame && (
                    <>
                      {" "}
                      with time frame{" "}
                      <span className="font-semibold text-purple-600">
                        {
                          timeFrames.find((t) => t.value === selectedTimeFrame)
                            ?.label
                        }
                      </span>
                    </>
                  )}
                </p>
              )}
            </div>

            {horoscopeData && getCurrentHoroscopeItems().length > 0 && (
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                  ✅ {getCurrentHoroscopeItems().length} prediction(s) found
                </span>
              </div>
            )}
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <div className="relative inline-block">
                <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-8 border-2 border-blue-300 border-t-blue-500 rounded-full animate-spin"></div>
                </div>
              </div>
              <p className="mt-6 text-gray-700 font-medium">
                Searching for horoscope predictions...
              </p>
              <p className="text-gray-500 text-sm mt-2">
                Please wait while we fetch predictions for {selectedSign}
              </p>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-yellow-100 rounded-full mb-6">
                <span className="text-3xl">🔍</span>
              </div>
              <h3 className="text-2xl font-semibold text-gray-800 mb-3">
                No Results Found
              </h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">{error}</p>
              <div className="flex flex-wrap justify-center gap-3">
                <button
                  onClick={() => {
                    setSelectedTimeFrame("");
                    fetchHoroscope();
                  }}
                  className="px-5 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors font-medium"
                >
                  Try without time filter
                </button>
                <button
                  onClick={resetSearch}
                  className="px-5 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Start New Search
                </button>
              </div>
            </div>
          )}

          {/* Results Display */}
          {!loading && !error && getCurrentHoroscopeItems().length > 0 && (
            <div className="space-y-8">
              {getCurrentHoroscopeItems().map((horoscope, index) => (
                <div
                  key={horoscope._id || index}
                  className="border-2 border-gray-100 rounded-2xl overflow-hidden hover:border-blue-200 transition-all duration-300 shadow-sm hover:shadow-lg"
                >
                  {/* Header Section */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-b border-gray-200">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-white rounded-xl shadow-sm flex items-center justify-center">
                          <span className="text-3xl">
                            {horoscope.zodiacSign === "Aries"
                              ? "♈"
                              : horoscope.zodiacSign === "Taurus"
                              ? "♉"
                              : horoscope.zodiacSign === "Gemini"
                              ? "♊"
                              : horoscope.zodiacSign === "Cancer"
                              ? "♋"
                              : horoscope.zodiacSign === "Leo"
                              ? "♌"
                              : horoscope.zodiacSign === "Virgo"
                              ? "♍"
                              : horoscope.zodiacSign === "Libra"
                              ? "♎"
                              : horoscope.zodiacSign === "Scorpio"
                              ? "♏"
                              : horoscope.zodiacSign === "Sagittarius"
                              ? "♐"
                              : horoscope.zodiacSign === "Capricorn"
                              ? "♑"
                              : horoscope.zodiacSign === "Aquarius"
                              ? "♒"
                              : horoscope.zodiacSign === "Pisces"
                              ? "♓"
                              : "♊"}
                          </span>
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-gray-800">
                            {horoscope.zodiacSign}
                          </h3>
                          <p className="text-gray-600 font-hindi text-lg">
                            {horoscope.zodiacSignHindi}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <span
                          className={`px-4 py-2 rounded-full text-sm font-medium ${getTimeFrameColor(
                            horoscope.timeFrame
                          )}`}
                        >
                          ⏰{" "}
                          {timeFrames.find(
                            (t) => t.value === horoscope.timeFrame
                          )?.label || horoscope.timeFrame}
                        </span>
                        <span
                          className={`px-4 py-2 rounded-full text-sm font-medium ${getRishiColor(
                            horoscope.rishiName
                          )}`}
                        >
                          👨‍🏫 {horoscope.rishiName}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Main Content */}
                  <div className="p-6">
                    {/* Date and Metadata */}
                    <div className="mb-8 p-4 bg-gray-50 rounded-xl">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center">
                          <div className="text-sm text-gray-500 mb-1">
                            📅 Date
                          </div>
                          <div className="font-semibold text-gray-800">
                            {formatDate(horoscope.date)}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm text-gray-500 mb-1">
                            🕐 Created
                          </div>
                          <div className="font-medium text-gray-700">
                            {formatDateTime(horoscope.createdAt)}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm text-gray-500 mb-1">
                            ✏️ Updated
                          </div>
                          <div className="font-medium text-gray-700">
                            {formatDateTime(horoscope.updatedAt)}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Predictions Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                      {/* English Prediction */}
                      <div className="bg-gradient-to-br from-blue-50 to-white p-6 rounded-2xl border border-blue-100">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-lg font-bold text-blue-800 flex items-center gap-2">
                            <span>🇺🇸</span>
                            English Prediction
                          </h4>
                          <button
                            onClick={() =>
                              copyToClipboard(
                                horoscope.prediction,
                                "English prediction"
                              )
                            }
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Copy English prediction"
                          >
                            <FiCopy className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="bg-white p-5 rounded-xl shadow-sm min-h-[200px]">
                          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-justify">
                            {horoscope.prediction}
                          </p>
                        </div>
                        <div className="mt-4 text-right text-sm text-gray-500">
                          {horoscope.prediction.length} characters
                        </div>
                      </div>

                      {/* Hindi Prediction */}
                      <div className="bg-gradient-to-br from-green-50 to-white p-6 rounded-2xl border border-green-100">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-lg font-bold text-green-800 flex items-center gap-2">
                            <span>🇮🇳</span>
                            Hindi Prediction
                          </h4>
                          <button
                            onClick={() =>
                              copyToClipboard(
                                horoscope.predictionHindi,
                                "Hindi prediction"
                              )
                            }
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Copy Hindi prediction"
                          >
                            <FiCopy className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="bg-white p-5 rounded-xl shadow-sm min-h-[200px]">
                          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-justify font-hindi text-lg">
                            {horoscope.predictionHindi}
                          </p>
                        </div>
                        <div className="mt-4 text-right text-sm text-gray-500 font-hindi">
                          {horoscope.predictionHindi.length} वर्ण
                        </div>
                      </div>
                    </div>

                    {/* Rishi Details */}
                    <div className="mb-8 p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl">
                      <h4 className="text-lg font-bold text-purple-800 mb-4 flex items-center gap-2">
                        👨‍🏫 Rishi/Sage Details
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white p-4 rounded-xl">
                          <div className="text-sm text-gray-500 mb-1">
                            English Name
                          </div>
                          <div className="font-semibold text-gray-800 text-lg">
                            {horoscope.rishiName}
                          </div>
                        </div>
                        <div className="bg-white p-4 rounded-xl">
                          <div className="text-sm text-gray-500 mb-1 font-hindi">
                            हिंदी नाम
                          </div>
                          <div className="font-semibold text-gray-800 text-lg font-hindi">
                            {horoscope.rishiNameHindi}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Stats Summary */}
              {getCurrentHoroscopeItems().length > 0 && (
                <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white p-5 rounded-xl">
                    <div className="text-sm opacity-90 mb-2">
                      Total Predictions
                    </div>
                    <div className="text-2xl font-bold">
                      {getCurrentHoroscopeItems().length}
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white p-5 rounded-xl">
                    <div className="text-sm opacity-90 mb-2">Zodiac Sign</div>
                    <div className="text-xl font-bold">
                      {getCurrentHoroscopeItems()[0].zodiacSign}
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-5 rounded-xl">
                    <div className="text-sm opacity-90 mb-2">Time Frame</div>
                    <div className="text-xl font-bold">
                      {
                        timeFrames.find(
                          (t) =>
                            t.value === getCurrentHoroscopeItems()[0].timeFrame
                        )?.label
                      }
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-5 rounded-xl">
                    <div className="text-sm opacity-90 mb-2">Rishi</div>
                    <div className="text-xl font-bold">
                      {getCurrentHoroscopeItems()[0].rishiName}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Empty State */}
          {!loading &&
            !error &&
            (!horoscopeData || getCurrentHoroscopeItems().length === 0) && (
              <div className="text-center py-16">
                <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full mb-8">
                  <span className="text-4xl">🔮</span>
                </div>
                <h3 className="text-2xl font-semibold text-gray-800 mb-4">
                  Ready to Explore Horoscopes
                </h3>
                <p className="text-gray-600 max-w-md mx-auto mb-8">
                  Select a zodiac sign above to view detailed predictions. You
                  can also filter by time frame for specific results.
                </p>
                <div className="inline-flex items-center gap-2 text-blue-600">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <div
                    className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"
                    style={{ animationDelay: "0.4s" }}
                  ></div>
                  <span className="text-sm">Waiting for your selection</span>
                </div>
              </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default ViewHoroscope;
