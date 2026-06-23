"use client";

import React, { useEffect, useState } from "react";
import { fetchData, postData } from "@/utils/api";
import type { Announcement, AnnouncementResponse, AnnouncementsListResponse } from "@/utils/api";
import { toast, Toaster } from "react-hot-toast";
import {
  Megaphone,
  Save,
  RefreshCw,
  History,
  CheckCircle2,
  XCircle,
  Link as LinkIcon,
  MessageSquare,
  Calendar,
  Eye,
  Plus,
} from "lucide-react";

export default function AnnouncementsPage() {
  const [latestAnnouncement, setLatestAnnouncement] = useState<Announcement | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  
  // Form State
  const [content, setContent] = useState("");
  const [link, setLink] = useState("");
  const [isActive, setIsActive] = useState(true);

  const loadData = async (): Promise<void> => {
    try {
      setLoading(true);
      // Fetch latest
      const latestRes = await fetchData<AnnouncementResponse>("/announcements/latest");
      if (latestRes.success && latestRes.data) {
        setLatestAnnouncement(latestRes.data);
        setContent(latestRes.data.content || "");
        setLink(latestRes.data.link || "");
        setIsActive(latestRes.data.isActive ?? true);
      }

      // Fetch history
      const listRes = await fetchData<AnnouncementsListResponse>("/announcements");
      if (listRes.success && listRes.data) {
        setAnnouncements(listRes.data);
      }
    } catch (error) {
      toast.error("❌ Failed to fetch announcements");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      toast.error("Please provide announcement content");
      return;
    }

    try {
      setSaving(true);
      const res = await postData<AnnouncementResponse>("/announcements", {
        content,
        link,
        isActive
      });

      if (res.success) {
        toast.success("🎉 Announcement updated successfully!");
        loadData();
      }
    } catch (error) {
      toast.error("❌ Failed to update announcement");
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 md:p-8">
      <Toaster position="top-right" />
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Announcements</h1>
          <p className="text-gray-500 mt-1">Manage the global announcement bar shown on your website.</p>
        </div>
        <button
          onClick={loadData}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all shadow-sm text-gray-700 font-medium"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Management Form */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-50 bg-gray-50/30">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                  <Megaphone className="h-5 w-5" />
                </div>
                <h2 className="text-lg font-bold text-gray-900">Live Announcement</h2>
              </div>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-gray-400" />
                  Announcement Content
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Enter the announcement message (e.g. Special Offer: 20% OFF on all consultations!)"
                  rows={4}
                  className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500/20 transition-all outline-none text-gray-800 placeholder:text-gray-400 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <LinkIcon className="h-4 w-4 text-gray-400" />
                    Target Link (Optional)
                  </label>
                  <input
                    type="text"
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                    placeholder="/consultation or https://..."
                    className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500/20 transition-all outline-none text-gray-800 placeholder:text-gray-400"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">Status</label>
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={() => setIsActive(true)}
                      className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl border transition-all ${
                        isActive
                          ? "bg-emerald-50 border-emerald-200 text-emerald-700 font-bold"
                          : "bg-white border-gray-100 text-gray-400 hover:bg-gray-50"
                      }`}
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      Active
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsActive(false)}
                      className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl border transition-all ${
                        !isActive
                          ? "bg-gray-100 border-gray-200 text-gray-700 font-bold"
                          : "bg-white border-gray-100 text-gray-400 hover:bg-gray-50"
                      }`}
                    >
                      <XCircle className="h-4 w-4" />
                      Inactive
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-bold rounded-2xl hover:from-blue-700 hover:to-indigo-800 transition-all shadow-xl shadow-blue-100 flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {saving ? <RefreshCw className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                  {latestAnnouncement ? "Update Announcement" : "Create Announcement"}
                </button>
              </div>
            </form>
          </div>

          {/* Preview Card */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-1 rounded-[2rem] shadow-2xl overflow-hidden group">
            <div className="bg-white/95 backdrop-blur-md rounded-[1.8rem] p-8 border border-white/20">
              <p className="text-[10px] font-bold text-purple-600 uppercase tracking-[0.2em] mb-4">Live Preview</p>
              <div className="flex items-center justify-between gap-6">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 leading-tight">
                    {content || "Your announcement content will appear here..."}
                  </h3>
                  {link && (
                    <div className="mt-3 flex items-center gap-2 text-sm text-blue-600 font-semibold group-hover:gap-3 transition-all cursor-pointer">
                      View Details
                      <Plus className="h-4 w-4 rotate-45" />
                    </div>
                  )}
                </div>
                <div className="h-16 w-16 bg-gradient-to-br from-purple-100 to-blue-100 rounded-2xl flex items-center justify-center text-blue-600">
                  <Megaphone className="h-8 w-8" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar: History */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-full max-h-[800px]">
            <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                  <History className="h-5 w-5" />
                </div>
                <h2 className="text-lg font-bold text-gray-900">History</h2>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="animate-pulse bg-gray-50 h-24 rounded-2xl"></div>
                ))
              ) : announcements.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <p>No history available</p>
                </div>
              ) : (
                announcements.map((item) => (
                  <div
                    key={item._id}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer group hover:border-blue-200 ${
                      item._id === latestAnnouncement?._id
                        ? "bg-blue-50 border-blue-100"
                        : "bg-white border-gray-100"
                    }`}
                    onClick={() => {
                      setContent(item.content);
                      setLink(item.link);
                      setIsActive(item.isActive);
                    }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase border ${
                        item.isActive ? "bg-emerald-50 border-emerald-100 text-emerald-600" : "bg-gray-100 border-gray-200 text-gray-500"
                      }`}>
                        {item.isActive ? "Active" : "Archived"}
                      </span>
                      <span className="text-[10px] text-gray-400 font-medium">{formatDate(item.createdAt)}</span>
                    </div>
                    <p className="text-xs text-gray-700 font-medium line-clamp-2 mb-2 group-hover:text-blue-700 transition-colors">
                      {item.content}
                    </p>
                    <div className="flex items-center gap-1.5 text-[10px] text-gray-400 italic">
                      <Calendar className="h-3 w-3" />
                      Updated {formatDate(item.updatedAt || item.createdAt)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
