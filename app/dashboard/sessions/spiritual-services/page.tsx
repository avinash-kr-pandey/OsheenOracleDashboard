"use client";

import React, { useState, useEffect, Suspense } from "react";
import { toast, Toaster } from "react-hot-toast";
import Image from "next/image";
import homeAPI, { CatalogueItem } from "@/utils/home.api";
import { uploadFile } from "@/utils/services.package.api";

// ==================== MAIN PAGE CONTENT ====================

const SpiritualServicesContent = () => {
  const [cards, setCards] = useState<CatalogueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCard, setSelectedCard] = useState<CatalogueItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    description: "",
    image: "",
    isActive: true,
    benefits: [] as string[],
    readingIncludes: [] as string[],
    traits: [] as string[],
  });

  // Dynamic lists helpers
  const [newBenefit, setNewBenefit] = useState("");
  const [newInclude, setNewInclude] = useState("");
  const [newTrait, setNewTrait] = useState("");

  const fetchCards = async () => {
    try {
      setLoading(true);
      const res = await homeAPI.getCatalogue();
      setCards(res || []);
    } catch (error) {
      console.error("Error loading catalogue cards:", error);
      toast.error("Failed to load spiritual service cards");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCards();
  }, []);

  const openEditModal = (card: CatalogueItem) => {
    setSelectedCard(card);
    setFormData({
      name: card.name || "",
      price: card.price || "",
      description: card.description || "",
      image: card.image || "",
      isActive: card.isActive !== false,
      benefits: card.benefits || [],
      readingIncludes: card.readingIncludes || [],
      traits: card.traits || [],
    });
    setIsModalOpen(true);
  };

  const openAddModal = () => {
    setSelectedCard(null);
    setFormData({
      name: "",
      price: "",
      description: "",
      image: "",
      isActive: true,
      benefits: ["Connect with spiritual realm", "Gain personal clarity"],
      readingIncludes: ["Personalized reading session", "Detailed analysis report"],
      traits: ["Clarity", "Healing"],
    });
    setIsModalOpen(true);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    try {
      toast.loading("Uploading image...");
      const response = await uploadFile(file);
      if (response && response.success && response.fileUrl) {
        setFormData((prev) => ({ ...prev, image: response.fileUrl }));
        toast.dismiss();
        toast.success("Image uploaded successfully!");
      } else {
        toast.dismiss();
        toast.error("Upload failed");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.dismiss();
      toast.error("Image upload failed");
    }
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error("Card Name is required");
      return;
    }
    setIsSaving(true);
    try {
      if (selectedCard?._id) {
        // Update existing card
        const res = await homeAPI.updateCatalogue(selectedCard._id, formData);
        if (res.success) {
          toast.success("Spiritual Service card updated successfully!");
          fetchCards();
          setIsModalOpen(false);
        } else {
          toast.error(res.message || "Failed to update card");
        }
      } else {
        // Add new card
        const res = await homeAPI.addCatalogue(formData);
        if (res.success) {
          toast.success("New Spiritual Service card added!");
          fetchCards();
          setIsModalOpen(false);
        } else {
          toast.error(res.message || "Failed to create card");
        }
      }
    } catch (error) {
      console.error("Save error:", error);
      toast.error("An error occurred while saving the card");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;
    try {
      const res = await homeAPI.deleteCatalogue(id);
      if (res.success) {
        toast.success("Card deleted successfully!");
        fetchCards();
      } else {
        toast.error(res.message || "Delete failed");
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("An error occurred during deletion");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 text-left">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Spiritual Service Cards</h1>
          <p className="text-gray-500 mt-1">Manage the cards that appear under the "Our Spiritual Services" section on your website</p>
        </div>
        <button
          onClick={openAddModal}
          className="px-5 py-3 bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white rounded-xl shadow-md font-semibold transition-all"
        >
          + Add Service Card
        </button>
      </div>

      {/* Grid List */}
      {loading ? (
        <div className="text-center py-20 bg-white rounded-2xl border">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600"></div>
          <p className="text-gray-500 mt-4 text-sm">Loading cards...</p>
        </div>
      ) : cards.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border">
          <div className="text-6xl mb-4">🔮</div>
          <p className="text-gray-800 font-semibold text-lg">No spiritual service cards found</p>
          <p className="text-gray-500 mt-1">Click "Add Service Card" to create your first card.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((card) => (
            <div
              key={card._id}
              className={`bg-white rounded-2xl border transition-all duration-300 overflow-hidden shadow-sm flex flex-col justify-between ${
                card.isActive ? "border-gray-100 hover:border-purple-200" : "border-red-200 bg-red-50/20"
              }`}
            >
              {/* Card Header & Content */}
              <div className="p-5 relative flex-grow">
                {!card.isActive && (
                  <span className="absolute top-5 right-5 px-2.5 py-1 bg-red-100 text-red-800 text-xs font-bold rounded-full">
                    Inactive
                  </span>
                )}
                <h3 className="text-xl font-bold text-gray-800 mb-1 pr-16">{card.name}</h3>
                <div className="text-purple-600 font-bold text-lg mb-3">₹{card.price}</div>
                <p className="text-gray-600 text-sm line-clamp-3 mb-4 leading-relaxed">
                  {card.description}
                </p>

                {/* Highlights */}
                {card.traits && card.traits.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {card.traits.map((trait, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 bg-purple-50 text-purple-600 rounded-md text-[10px] font-semibold"
                      >
                        {trait}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Card Actions */}
              <div className="p-5 border-t border-gray-50 flex gap-2">
                <button
                  onClick={() => openEditModal(card)}
                  className="flex-1 py-2 text-sm bg-purple-50 hover:bg-purple-100 text-purple-700 font-semibold rounded-xl transition"
                >
                  Edit Card
                </button>
                <button
                  onClick={() => card._id && handleDelete(card._id, card.name)}
                  className="px-4 py-2 text-sm bg-red-50 hover:bg-red-100 text-red-600 font-semibold rounded-xl transition"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Editor Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100">
            <div className="p-6 border-b bg-gradient-to-r from-purple-600 to-pink-500 text-white flex justify-between items-center">
              <h2 className="text-xl font-bold">{selectedCard ? "Edit Service Card" : "Add Service Card"}</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-white hover:text-gray-200 text-2xl font-bold"
              >
                &times;
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Form Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Card Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g. Angel Card Reading"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-gray-800 text-sm outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Price (INR) *</label>
                  <input
                    type="text"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="e.g. 599"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-gray-800 text-sm outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Describe what the customer gets in this session..."
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-gray-800 text-sm outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Dynamic Benefits Lists */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Benefits</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newBenefit}
                    onChange={(e) => setNewBenefit(e.target.value)}
                    placeholder="Add a benefit..."
                    className="flex-1 px-4 py-2 rounded-xl border border-gray-300 text-gray-800 text-sm outline-none"
                  />
                  <button
                    onClick={() => {
                      if (newBenefit.trim()) {
                        setFormData((p) => ({ ...p, benefits: [...p.benefits, newBenefit.trim()] }));
                        setNewBenefit("");
                      }
                    }}
                    className="px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-xl text-sm font-medium"
                  >
                    + Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {formData.benefits.map((item, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 border border-green-200 rounded-xl text-xs font-semibold"
                    >
                      {item}
                      <button
                        onClick={() =>
                          setFormData((p) => ({ ...p, benefits: p.benefits.filter((_, i) => i !== idx) }))
                        }
                        className="text-red-500 font-bold hover:text-red-700"
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Dynamic Includes Lists */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">What's Included</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newInclude}
                    onChange={(e) => setNewInclude(e.target.value)}
                    placeholder="Add what is included..."
                    className="flex-1 px-4 py-2 rounded-xl border border-gray-300 text-gray-800 text-sm outline-none"
                  />
                  <button
                    onClick={() => {
                      if (newInclude.trim()) {
                        setFormData((p) => ({ ...p, readingIncludes: [...p.readingIncludes, newInclude.trim()] }));
                        setNewInclude("");
                      }
                    }}
                    className="px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-xl text-sm font-medium"
                  >
                    + Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {formData.readingIncludes.map((item, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-xl text-xs font-semibold"
                    >
                      {item}
                      <button
                        onClick={() =>
                          setFormData((p) => ({ ...p, readingIncludes: p.readingIncludes.filter((_, i) => i !== idx) }))
                        }
                        className="text-red-500 font-bold hover:text-red-700"
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Dynamic Traits Lists */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Key Tags/Traits</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTrait}
                    onChange={(e) => setNewTrait(e.target.value)}
                    placeholder="Add a tag..."
                    className="flex-1 px-4 py-2 rounded-xl border border-gray-300 text-gray-800 text-sm outline-none"
                  />
                  <button
                    onClick={() => {
                      if (newTrait.trim()) {
                        setFormData((p) => ({ ...p, traits: [...p.traits, newTrait.trim()] }));
                        setNewTrait("");
                      }
                    }}
                    className="px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-xl text-sm font-medium"
                  >
                    + Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {formData.traits.map((item, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-50 text-purple-700 border border-purple-200 rounded-xl text-xs font-semibold"
                    >
                      {item}
                      <button
                        onClick={() =>
                          setFormData((p) => ({ ...p, traits: p.traits.filter((_, i) => i !== idx) }))
                        }
                        className="text-red-500 font-bold hover:text-red-700"
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Active Switch */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData((p) => ({ ...p, isActive: e.target.checked }))}
                  className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
                <label htmlFor="isActive" className="text-sm font-semibold text-gray-700">
                  Active (available on website)
                </label>
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-500 text-white font-semibold rounded-xl transition-all shadow-md disabled:opacity-50"
                >
                  {isSaving ? "Saving..." : "Save Card"}
                </button>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default function SpiritualServicesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex justify-center items-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600"></div>
        </div>
      }
    >
      <SpiritualServicesContent />
    </Suspense>
  );
}
