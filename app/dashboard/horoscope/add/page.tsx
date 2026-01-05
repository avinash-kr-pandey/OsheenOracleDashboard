"use client";

import React, { useState, useEffect } from "react";
import { toast, Toaster } from "react-hot-toast";
import { horoscopeAPI } from "@/utils/api";

const AddHoroscope: React.FC = () => {
  // Updated form state with all required fields
  const [formData, setFormData] = useState({
    // English fields
    zodiacSign: "",
    date: "",
    prediction: "",
    timeFrame: "daily",
    rishiName: "",

    // Hindi fields
    zodiacSignHindi: "",
    predictionHindi: "",
    rishiNameHindi: "",
  });

  const [loading, setLoading] = useState(false);

  // Zodiac signs with Hindi translations
  const zodiacSigns = [
    { english: "Aries", hindi: "मेष" },
    { english: "Taurus", hindi: "वृषभ" },
    { english: "Gemini", hindi: "मिथुन" },
    { english: "Cancer", hindi: "कर्क" },
    { english: "Leo", hindi: "सिंह" },
    { english: "Virgo", hindi: "कन्या" },
    { english: "Libra", hindi: "तुला" },
    { english: "Scorpio", hindi: "वृश्चिक" },
    { english: "Sagittarius", hindi: "धनु" },
    { english: "Capricorn", hindi: "मकर" },
    { english: "Aquarius", hindi: "कुंभ" },
    { english: "Pisces", hindi: "मीन" },
  ];

  const timeFrames = [
    { value: "daily", label: "Daily", hindiLabel: "दैनिक" },
    { value: "weekly", label: "Weekly", hindiLabel: "साप्ताहिक" },
    { value: "monthly", label: "Monthly", hindiLabel: "मासिक" },
    { value: "yearly", label: "Yearly", hindiLabel: "वार्षिक" },
  ];

  // Rishi/Sage names
  const rishiNames = [
    { english: "Vashishta", hindi: "वशिष्ठ" },
    { english: "Vishwamitra", hindi: "विश्वामित्र" },
    { english: "Kanad", hindi: "कणाद" },
    { english: "Bhrigu", hindi: "भृगु" },
    { english: "Garga", hindi: "गर्ग" },
    { english: "Parashara", hindi: "पराशर" },
    { english: "Varahamihira", hindi: "वराहमिहिर" },
    { english: "Aryabhata", hindi: "आर्यभट्ट" },
  ];

  // Set today's date as default
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setFormData((prev) => ({ ...prev, date: today }));
  }, []);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle zodiac sign selection
  const handleSignSelect = (sign: { english: string; hindi: string }) => {
    setFormData((prev) => ({
      ...prev,
      zodiacSign: sign.english,
      zodiacSignHindi: sign.hindi,
    }));
  };

  // Handle rishi selection
  const handleRishiSelect = (rishi: { english: string; hindi: string }) => {
    setFormData((prev) => ({
      ...prev,
      rishiName: rishi.english,
      rishiNameHindi: rishi.hindi,
    }));
  };

  // handleSubmit function update karein
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation for all required fields
    const validationErrors = [];

    if (!formData.zodiacSign) validationErrors.push("Zodiac Sign (English)");
    if (!formData.zodiacSignHindi) validationErrors.push("Zodiac Sign (Hindi)");
    if (!formData.date) validationErrors.push("Date");
    if (!formData.prediction) validationErrors.push("Prediction (English)");
    if (!formData.predictionHindi) validationErrors.push("Prediction (Hindi)");
    if (!formData.timeFrame) validationErrors.push("Time Frame");
    if (!formData.rishiName) validationErrors.push("Rishi Name (English)");
    if (!formData.rishiNameHindi) validationErrors.push("Rishi Name (Hindi)");

    if (validationErrors.length > 0) {
      toast.error(
        `Please fill all required fields: ${validationErrors.join(", ")}`
      );
      return;
    }

    if (formData.prediction.length < 20) {
      toast.error("Prediction (English) should be at least 20 characters long");
      return;
    }

    if (formData.predictionHindi.length < 10) {
      toast.error("Prediction (Hindi) should be at least 10 characters long");
      return;
    }

    setLoading(true);

    try {
      console.log("Submitting form data:", formData);

      // Prepare data for API - REMOVE the extra 'sign' field
      const apiData = {
        // Only send what backend expects
        zodiacSign: formData.zodiacSign,
        zodiacSignHindi: formData.zodiacSignHindi,
        date: formData.date,
        prediction: formData.prediction,
        predictionHindi: formData.predictionHindi,
        timeFrame: formData.timeFrame,
        rishiName: formData.rishiName,
        rishiNameHindi: formData.rishiNameHindi,
        // Remove: sign: formData.zodiacSign, // This is causing confusion
      };

      console.log("Sending to API:", apiData);

      // API call - use try-catch properly
      const response = await horoscopeAPI.addHoroscope(apiData);

      console.log("✅ API Response:", response);
      console.log("Response type:", typeof response);
      console.log("Response keys:", Object.keys(response || {}));

      // Check success in multiple ways
      if (response) {
        // Check if response has success property
        if (response.success === true) {
          toast.success(response.message || "Horoscope added successfully!");
        }
        // Check if response has status 201
        else if (response.status === 201 || response.statusCode === 201) {
          toast.success(response.message || "Horoscope added successfully!");
        }
        // Check if response has a message with success
        else if (
          response.message &&
          response.message.toLowerCase().includes("success")
        ) {
          toast.success(response.message);
        }
        else if (
          response.message &&
          response.message.toLowerCase().includes("success")
        ) {
          toast.success("Horoscope added successfully!");
        }
        // Default success if we got a response but no clear success indicator
        else {
          console.log("No clear success indicator, but assuming success");
          toast.success("Horoscope added successfully!");
        }

        // Reset form only on success
        setFormData({
          zodiacSign: "",
          zodiacSignHindi: "",
          date: new Date().toISOString().split("T")[0],
          prediction: "",
          predictionHindi: "",
          timeFrame: "daily",
          rishiName: "",
          rishiNameHindi: "",
        });
      } else {
        // Empty response
        toast.error("No response received from server");
      }
    } catch (error: any) {
      console.error("❌ Error details:", error);

      // If error has response with status 201, it's actually success
      if (error.response && error.response.status === 201) {
        toast.success("Horoscope added successfully!");
        // Reset form
        setFormData({
          zodiacSign: "",
          zodiacSignHindi: "",
          date: new Date().toISOString().split("T")[0],
          prediction: "",
          predictionHindi: "",
          timeFrame: "daily",
          rishiName: "",
          rishiNameHindi: "",
        });
      } else if (error.response) {
        // Server responded with error
        console.error("Error response data:", error.response.data);
        const errorMessage =
          error.response.data?.message ||
          error.response.data?.error ||
          `Server error (${error.response.status})`;
        toast.error(`Error: ${errorMessage}`);
      } else if (error.request) {
        // No response from server
        console.error("No response received:", error.request);
        toast.error("No response from server. Check your connection.");
      } else {
        // Other errors
        console.error("Error message:", error.message);
        toast.error(error.message || "Failed to add horoscope");
      }
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 p-4 md:p-6">
      <Toaster position="top-right" />

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
            Add New Horoscope
          </h1>
          <p className="text-gray-600">
            Add horoscope predictions in English and Hindi for zodiac signs
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Section 1: Zodiac Sign Selection */}
            <div className="border-b border-gray-200 pb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                1. Zodiac Sign Selection
              </h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Zodiac Sign <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {zodiacSigns.map((sign) => (
                    <button
                      key={sign.english}
                      type="button"
                      onClick={() => handleSignSelect(sign)}
                      className={`p-3 rounded-lg border-2 transition-all duration-200 flex flex-col items-center ${
                        formData.zodiacSign === sign.english
                          ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                          : "border-gray-200 hover:border-indigo-300 hover:bg-indigo-50"
                      }`}
                    >
                      <span className="font-medium text-sm">
                        {sign.english}
                      </span>
                      <span className="text-xs mt-1">{sign.hindi}</span>
                    </button>
                  ))}
                </div>
                {formData.zodiacSign && (
                  <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-700">
                      <span className="font-semibold">Selected:</span>{" "}
                      {formData.zodiacSign} ({formData.zodiacSignHindi})
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Section 2: Date and Time Frame */}
            <div className="border-b border-gray-200 pb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                2. Date & Time Frame
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    required
                  />
                </div>

                {/* Time Frame */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Time Frame <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="timeFrame"
                    value={formData.timeFrame}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    required
                  >
                    <option value="">Select Time Frame</option>
                    {timeFrames.map((time) => (
                      <option key={time.value} value={time.value}>
                        {time.label} ({time.hindiLabel})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Section 3: Rishi/Sage Selection */}
            <div className="border-b border-gray-200 pb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                3. Select Rishi/Sage <span className="text-red-500">*</span>
              </h2>

              <div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {rishiNames.map((rishi) => (
                    <button
                      key={rishi.english}
                      type="button"
                      onClick={() => handleRishiSelect(rishi)}
                      className={`p-3 rounded-lg border-2 transition-all duration-200 flex flex-col items-center ${
                        formData.rishiName === rishi.english
                          ? "border-green-500 bg-green-50 text-green-700"
                          : "border-gray-200 hover:border-green-300 hover:bg-green-50"
                      }`}
                    >
                      <span className="font-medium text-sm">
                        {rishi.english}
                      </span>
                      <span className="text-xs mt-1">{rishi.hindi}</span>
                    </button>
                  ))}
                </div>
                {formData.rishiName && (
                  <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-700">
                      <span className="font-semibold">Selected Sage:</span>{" "}
                      {formData.rishiName} ({formData.rishiNameHindi})
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Section 4: Predictions */}
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                4. Predictions <span className="text-red-500">*</span>
              </h2>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* English Prediction */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prediction (English) <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="prediction"
                    value={formData.prediction}
                    onChange={handleChange}
                    rows={8}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors resize-none"
                    placeholder="Enter detailed horoscope prediction in English (minimum 20 characters)..."
                    required
                    minLength={20}
                  />
                  <div className="flex justify-between mt-2">
                    <span
                      className={`text-sm ${
                        formData.prediction.length < 20
                          ? "text-red-500"
                          : "text-green-500"
                      }`}
                    >
                      {formData.prediction.length} characters
                    </span>
                    <span className="text-sm text-gray-500">
                      Minimum 20 characters
                    </span>
                  </div>
                </div>

                {/* Hindi Prediction */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prediction (Hindi) <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="predictionHindi"
                    value={formData.predictionHindi}
                    onChange={handleChange}
                    rows={8}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors resize-none font-hindi"
                    placeholder="हिंदी में विस्तृत भविष्यवाणी दर्ज करें (कम से कम 10 वर्ण)..."
                    required
                    minLength={10}
                  />
                  <div className="flex justify-between mt-2">
                    <span
                      className={`text-sm ${
                        formData.predictionHindi.length < 10
                          ? "text-red-500"
                          : "text-green-500"
                      }`}
                    >
                      {formData.predictionHindi.length} वर्ण
                    </span>
                    <span className="text-sm text-gray-500">
                      कम से कम 10 वर्ण
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-6">
              <button
                type="submit"
                disabled={
                  loading ||
                  !formData.zodiacSign ||
                  !formData.prediction ||
                  formData.prediction.length < 20 ||
                  !formData.predictionHindi ||
                  formData.predictionHindi.length < 10 ||
                  !formData.rishiName
                }
                className={`w-full px-8 py-4 rounded-lg font-semibold text-white transition-all duration-200 ${
                  loading ||
                  !formData.zodiacSign ||
                  !formData.prediction ||
                  formData.prediction.length < 20 ||
                  !formData.predictionHindi ||
                  formData.predictionHindi.length < 10 ||
                  !formData.rishiName
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl"
                }`}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Adding Horoscope...
                  </div>
                ) : (
                  "Add Horoscope"
                )}
              </button>
            </div>
          </form>

          {/* Preview Section */}
          {formData.zodiacSign &&
            formData.prediction &&
            formData.predictionHindi && (
              <div className="mt-8 pt-8 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Preview
                </h3>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* English Preview */}
                  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-xl">
                    <div className="flex flex-wrap items-center justify-between mb-4 gap-2">
                      <div className="flex flex-wrap gap-2">
                        <span className="inline-block px-4 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
                          {formData.zodiacSign}
                        </span>
                        <span className="inline-block px-4 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                          {timeFrames.find(
                            (t) => t.value === formData.timeFrame
                          )?.label || formData.timeFrame}
                        </span>
                      </div>
                      <span className="text-gray-600 text-sm">
                        {new Date(formData.date).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                    <div className="mb-3">
                      <span className="text-sm font-medium text-gray-600">
                        Sage:{" "}
                      </span>
                      <span className="text-sm text-gray-800">
                        {formData.rishiName}
                      </span>
                    </div>
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {formData.prediction}
                    </p>
                  </div>

                  {/* Hindi Preview */}
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl">
                    <div className="flex flex-wrap items-center justify-between mb-4 gap-2">
                      <div className="flex flex-wrap gap-2">
                        <span className="inline-block px-4 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium font-hindi">
                          {formData.zodiacSignHindi}
                        </span>
                        <span className="inline-block px-4 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium font-hindi">
                          {
                            timeFrames.find(
                              (t) => t.value === formData.timeFrame
                            )?.hindiLabel
                          }
                        </span>
                      </div>
                      <span className="text-gray-600 text-sm font-hindi">
                        {new Date(formData.date).toLocaleDateString("hi-IN", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                    <div className="mb-3">
                      <span className="text-sm font-medium text-gray-600 font-hindi">
                        ऋषि:{" "}
                      </span>
                      <span className="text-sm text-gray-800 font-hindi">
                        {formData.rishiNameHindi}
                      </span>
                    </div>
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap font-hindi">
                      {formData.predictionHindi}
                    </p>
                  </div>
                </div>
              </div>
            )}
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-indigo-800 mb-3">
            📝 Important Instructions:
          </h3>
          <ul className="space-y-2 text-indigo-700">
            <li className="flex items-start">
              <span className="mr-2">✅</span>
              <span>
                <strong>All fields are required</strong> - Both English and
                Hindi versions
              </span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">✅</span>
              <span>
                Select a zodiac sign (both English and Hindi will auto-fill)
              </span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">✅</span>
              <span>Choose a Rishi/Sage name (both languages required)</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">✅</span>
              <span>
                Write predictions in both English (min 20 chars) and Hindi (min
                10 chars)
              </span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">✅</span>
              <span>
                Preview shows both language versions before submission
              </span>
            </li>
          </ul>
        </div>

        {/* Required Fields Summary */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <h4 className="font-semibold text-gray-800 mb-2">English Fields</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Zodiac Sign: {formData.zodiacSign || "Not selected"}</li>
              <li>• Rishi Name: {formData.rishiName || "Not selected"}</li>
              <li>
                • Prediction:{" "}
                {formData.prediction
                  ? `${formData.prediction.length} chars`
                  : "Empty"}
              </li>
            </ul>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <h4 className="font-semibold text-gray-800 mb-2">Hindi Fields</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• राशि चिह्न: {formData.zodiacSignHindi || "चयनित नहीं"}</li>
              <li>• ऋषि नाम: {formData.rishiNameHindi || "चयनित नहीं"}</li>
              <li>
                • भविष्यवाणी:{" "}
                {formData.predictionHindi
                  ? `${formData.predictionHindi.length} वर्ण`
                  : "खाली"}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddHoroscope;
