"use client";

import React, { useEffect, useState } from "react";
import { fetchData } from "@/utils/api";
import type { Contact, ContactResponse } from "@/utils/api";
import { toast } from "react-hot-toast";
import {
  Search,
  RefreshCw,
  Mail,
  Phone,
  MessageSquare,
  Calendar,
  User,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Filter,
  Eye,
  CheckCircle2,
  Clock,
} from "lucide-react";

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const loadContacts = async (page: number = 1): Promise<void> => {
    try {
      setLoading(true);
      const res = await fetchData<ContactResponse>(`/contact?page=${page}`);

      if (res.success && res.data) {
        setContacts(res.data);
        setTotalPages(res.pagination.totalPages);
        setCurrentPage(res.pagination.currentPage);
      } else {
        setContacts([]);
      }
    } catch (error) {
      toast.error("❌ Failed to fetch contacts");
      console.error(error);
      setContacts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContacts(currentPage);
  }, [currentPage]);

  const filteredContacts = contacts.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm)
  );

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-amber-100 text-amber-700 border-amber-200";
      case "completed":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
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
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Contact Submissions</h1>
          <p className="text-gray-500 mt-1">Manage and respond to user inquiries from the contact form.</p>
        </div>
        <button
          onClick={() => loadContacts(currentPage)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all shadow-sm text-gray-700 font-medium"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh Data
        </button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <MessageSquare className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Requests</p>
              <p className="text-2xl font-bold text-gray-900">{contacts.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Pending</p>
              <p className="text-2xl font-bold text-gray-900">
                {contacts.filter(c => c.status === 'pending').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Completed</p>
              <p className="text-2xl font-bold text-gray-900">
                {contacts.filter(c => c.status === 'completed').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
              <Calendar className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Today</p>
              <p className="text-2xl font-bold text-gray-900">
                {contacts.filter(c => new Date(c.createdAt).toDateString() === new Date().toDateString()).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Filter Bar */}
        <div className="p-4 md:p-6 border-b border-gray-50 flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500/20 transition-all outline-none text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 text-gray-600 rounded-xl hover:bg-gray-100 transition-all text-sm font-medium">
              <Filter className="h-4 w-4" />
              Filter
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact Info</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-10 w-40 bg-gray-100 rounded-lg"></div></td>
                    <td className="px-6 py-4"><div className="h-10 w-40 bg-gray-100 rounded-lg"></div></td>
                    <td className="px-6 py-4"><div className="h-6 w-24 bg-gray-100 rounded-lg"></div></td>
                    <td className="px-6 py-4"><div className="h-6 w-20 bg-gray-100 rounded-lg"></div></td>
                    <td className="px-6 py-4"><div className="h-8 w-8 bg-gray-100 rounded-lg ml-auto"></div></td>
                  </tr>
                ))
              ) : filteredContacts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center gap-3">
                      <div className="p-4 bg-gray-50 rounded-full">
                        <User className="h-8 w-8 text-gray-300" />
                      </div>
                      <p>No contact submissions found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredContacts.map((contact) => (
                  <tr key={contact._id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-sm">
                          {contact.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{contact.name}</p>
                          <p className="text-xs text-gray-500 line-clamp-1 max-w-[200px]">{contact.message}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <Mail className="h-3 w-3" />
                          {contact.email}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <Phone className="h-3 w-3" />
                          {contact.phone}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs font-medium text-gray-700">{formatDate(contact.createdAt)}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(contact.status)}`}>
                        {contact.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setSelectedContact(contact)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && filteredContacts.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-50 flex items-center justify-between bg-gray-50/30">
            <p className="text-xs text-gray-500 font-medium">
              Page <span className="text-gray-900">{currentPage}</span> of <span className="text-gray-900">{totalPages}</span>
            </p>
            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => prev - 1)}
                className="p-2 border border-gray-200 rounded-lg hover:bg-white disabled:opacity-50 disabled:hover:bg-transparent transition-all"
              >
                <ChevronLeft className="h-4 w-4 text-gray-600" />
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => prev + 1)}
                className="p-2 border border-gray-200 rounded-lg hover:bg-white disabled:opacity-50 disabled:hover:bg-transparent transition-all"
              >
                <ChevronRight className="h-4 w-4 text-gray-600" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {selectedContact && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="relative h-32 bg-gradient-to-r from-blue-600 to-indigo-700 p-6">
              <button
                onClick={() => setSelectedContact(null)}
                className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
              >
                <ChevronLeft className="h-5 w-5 rotate-180" />
              </button>
              <div className="flex items-center gap-4 mt-8">
                <div className="h-20 w-20 rounded-2xl bg-white p-1 shadow-xl">
                  <div className="h-full w-full rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-3xl font-bold">
                    {selectedContact.name.charAt(0).toUpperCase()}
                  </div>
                </div>
                <div className="mt-4">
                  <h3 className="text-xl font-bold text-white">{selectedContact.name}</h3>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/20 text-white border border-white/30 backdrop-blur-md`}>
                    {selectedContact.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-8 pt-12 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Email Address</p>
                  <a href={`mailto:${selectedContact.email}`} className="flex items-center gap-2 text-sm font-semibold text-gray-900 hover:text-blue-600 transition-colors">
                    {selectedContact.email}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Phone Number</p>
                  <a href={`tel:${selectedContact.phone}`} className="flex items-center gap-2 text-sm font-semibold text-gray-900 hover:text-blue-600 transition-colors">
                    {selectedContact.phone}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Submission Date</p>
                <p className="text-sm font-semibold text-gray-900">{formatDate(selectedContact.createdAt)}</p>
              </div>

              <div className="space-y-2 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Message</p>
                <p className="text-sm text-gray-700 leading-relaxed italic">
                  "{selectedContact.message}"
                </p>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  onClick={() => setSelectedContact(null)}
                  className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-all text-sm"
                >
                  Close
                </button>
                <a
                  href={`mailto:${selectedContact.email}?subject=Reply to your inquiry`}
                  className="flex-1 px-4 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 text-sm text-center"
                >
                  Reply via Email
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
