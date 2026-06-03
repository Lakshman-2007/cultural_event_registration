import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Html5QrcodeScanner } from "html5-qrcode";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  BarChart3,
  Users,
  QrCode,
  FileSpreadsheet,
  Search,
  Filter,
  TrendingUp,
  Coins,
  LogOut,
  MapPin,
  UserCheck,
  RefreshCw,
  FileDown,
  User,
  Shield,
  CreditCard,
  Phone,
  Mail,
  GraduationCap,
  Calendar,
  AlertTriangle,
} from "lucide-react";

import { Layout } from "../components/layout/Layout";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Modal } from "../components/ui/Modal";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import {
  getDashboard,
  getParticipants,
  getParticipantDetail,
  scanQR,
  checkinParticipant,
  downloadExport,
} from "../services/api";
import { isAuthenticated, getAdminName, removeToken } from "../services/auth";
import { formatCurrency, formatDate } from "../utils/formatters";

export const AdminDashboardPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview"); // overview, participants, scanner, reports
  const [adminName, setAdminName] = useState("Administrator");

  // State for Overview Metrics
  const [metrics, setMetrics] = useState(null);
  const [metricsLoading, setMetricsLoading] = useState(true);

  // State for Participant List
  const [participants, setParticipants] = useState([]);
  const [totalParticipants, setTotalParticipants] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [collegeFilter, setCollegeFilter] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("ALL");
  const [attendanceFilter, setAttendanceFilter] = useState("ALL");
  const [listLoading, setListLoading] = useState(false);

  // Participant Detail Modal State
  const [selectedParticipant, setSelectedParticipant] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);

  // Scanner States
  const [scannerActive, setScannerActive] = useState(false);
  const [scanResult, setScanResult] = useState(null); // { status, message, data }
  const [scanModalOpen, setScanModalOpen] = useState(false);
  const [checkinLoading, setCheckinLoading] = useState(false);
  const scannerRef = useRef(null);

  // Verify auth on mount
  useEffect(() => {
    if (!isAuthenticated()) {
      toast.error("Session expired or unauthorized. Please login.");
      navigate("/admin/login");
    } else {
      setAdminName(getAdminName());
    }
  }, [navigate]);

  // Fetch Dashboard Metrics
  const fetchDashboardMetrics = async () => {
    setMetricsLoading(true);
    try {
      const response = await getDashboard();
      if (response.success) {
        setMetrics(response.metrics);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load dashboard metrics.");
    } finally {
      setMetricsLoading(false);
    }
  };

  // Fetch Participant List
  const fetchParticipantList = async (page = 1) => {
    setListLoading(true);
    try {
      const response = await getParticipants({
        search: search || undefined,
        college: collegeFilter || undefined,
        payment_status: paymentFilter !== "ALL" ? paymentFilter : undefined,
        attendance_status: attendanceFilter !== "ALL" ? attendanceFilter : undefined,
        page,
        per_page: 10,
      });

      if (response.success) {
        setParticipants(response.data);
        setTotalParticipants(response.total);
        setTotalPages(response.total_pages);
        setCurrentPage(response.page);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load participant database.");
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "overview") {
      fetchDashboardMetrics();
    } else if (activeTab === "participants") {
      fetchParticipantList(1);
    }
  }, [activeTab]);

  // Handle Search & Filter submit for participants tab
  const handleApplyFilters = (e) => {
    if (e) e.preventDefault();
    fetchParticipantList(1);
  };

  const handleClearFilters = () => {
    setSearch("");
    setCollegeFilter("");
    setPaymentFilter("ALL");
    setAttendanceFilter("ALL");
    // Delay slightly to allow state to clear, then fetch
    setTimeout(() => {
      fetchParticipantList(1);
    }, 50);
  };

  // View Details Modal Trigger
  const handleViewDetails = async (registrationId) => {
    setDetailLoading(true);
    setSelectedParticipant(null);
    setDetailModalOpen(true);
    try {
      const response = await getParticipantDetail(registrationId);
      if (response.success) {
        setSelectedParticipant(response.data);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load detailed profile.");
      setDetailModalOpen(false);
    } finally {
      setDetailLoading(false);
    }
  };

  // QR Scanner Initialization
  useEffect(() => {
    if (activeTab === "scanner" && scannerActive) {
      // Create element selector
      const scanner = new Html5QrcodeScanner(
        "qr-viewfinder-container",
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        false
      );

      scannerRef.current = scanner;

      scanner.render(
        async (decodedText) => {
          // Stop scanner while processing scanned text
          scanner.clear().catch((e) => console.warn(e));
          setScannerActive(false);
          
          let regId = decodedText.trim();
          // Extract ID if the QR code is a full URL (e.g., http://localhost:5173/pass/CUL2026-0001)
          if (regId.includes('/pass/')) {
            regId = regId.split('/pass/')[1].split('/')[0];
          }
          
          const toastId = toast.loading("Fetching scan status...");
          try {
            const response = await scanQR(regId);
            setScanResult(response);
            setScanModalOpen(true);
            toast.dismiss(toastId);
          } catch (err) {
            console.error(err);
            toast.error("Error reading scan data.", { id: toastId });
            // Re-activate scanner on failure
            setScannerActive(true);
          }
        },
        (error) => {
          // Silent polling errors
        }
      );
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch((e) => console.warn(e));
      }
    };
  }, [activeTab, scannerActive]);

  const handleStartScanner = () => {
    setScanResult(null);
    setScannerActive(true);
  };

  const handleStopScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.clear().catch((e) => console.warn(e));
    }
    setScannerActive(false);
  };

  // Check In scanned attendee
  const handleConfirmCheckin = async (registrationId) => {
    setCheckinLoading(true);
    try {
      const response = await checkinParticipant(registrationId);
      if (response.success) {
        toast.success("Check-in successful! Pass validated.");
        
        // Update local scanResult state to reflect already checked in
        setScanResult((prev) => ({
          ...prev,
          status: "ALREADY_CHECKED_IN",
          message: "Check-in completed successfully.",
          data: response.data,
        }));
      }
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.detail || "Check-in failed.";
      toast.error(msg);
    } finally {
      setCheckinLoading(false);
    }
  };

  // Export File Report
  const handleExport = async (format) => {
    const toastId = toast.loading(`Generating ${format.toUpperCase()} export file...`);
    try {
      await downloadExport(
        {
          search: search || undefined,
          college: collegeFilter || undefined,
          payment_status: paymentFilter !== "ALL" ? paymentFilter : undefined,
          attendance_status: attendanceFilter !== "ALL" ? attendanceFilter : undefined,
        },
        format
      );
      toast.success("Report downloaded!", { id: toastId });
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate report export.", { id: toastId });
    }
  };

  const handleLogout = () => {
    removeToken();
    toast.success("Log out successful.");
    navigate("/admin/login");
  };

  // Mock dashboard charts data
  const chartsData = [
    { name: "Day 1", registrations: 120 },
    { name: "Day 2", registrations: 180 },
    { name: "Day 3", registrations: 240 },
    { name: "Day 4", registrations: 310 },
    { name: "Day 5", registrations: 450 },
    { name: "Day 6", registrations: 590 },
    { name: "Day 7", registrations: metrics?.total_registrations || 600 },
  ];

  const pieData = metrics
    ? [
        { name: "Internal", value: metrics.internal_count, color: "#10b981" },
        { name: "External", value: metrics.external_count, color: "#f59e0b" },
      ]
    : [];

  return (
    <Layout>
      <div className="flex flex-col gap-8 w-full mt-4">
        {/* Dashboard Header Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-900 pb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-cyan-950/40 border border-cyan-800/30 flex items-center justify-center text-cyan-400">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold font-display text-white">
                Organizer Dashboard
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Connected as <strong className="text-slate-200">{adminName}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Tab navigation links */}
            <div className="flex bg-slate-950 border border-slate-800/80 p-1.5 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setActiveTab("overview")}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                  activeTab === "overview"
                    ? "bg-slate-900 text-white"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" /> Overview
              </button>
              <button
                onClick={() => setActiveTab("participants")}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                  activeTab === "participants"
                    ? "bg-slate-900 text-white"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Users className="w-3.5 h-3.5" /> Database
              </button>
              <button
                onClick={() => setActiveTab("scanner")}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                  activeTab === "scanner"
                    ? "bg-slate-900 text-white"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <QrCode className="w-3.5 h-3.5" /> QR Entry
              </button>
              <button
                onClick={() => setActiveTab("reports")}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                  activeTab === "reports"
                    ? "bg-slate-900 text-white"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <FileSpreadsheet className="w-3.5 h-3.5" /> Reports
              </button>
            </div>

            <button
              onClick={handleLogout}
              className="p-2.5 bg-slate-950/60 border border-slate-900 text-slate-400 hover:text-rose-400 rounded-xl transition-all"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* -------------------- OVERVIEW TAB -------------------- */}
        {activeTab === "overview" && (
          <div className="flex flex-col gap-6 animate-fade-in">
            {metricsLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-28 bg-slate-900/40 animate-pulse border border-slate-800 rounded-2xl" />
                ))}
              </div>
            ) : metrics ? (
              <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                <Card className="p-5 flex flex-col justify-between border-slate-800/80">
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Total Registers</span>
                  <div className="flex items-end justify-between mt-4">
                    <span className="text-2xl font-black text-white font-display leading-none">{metrics.total_registrations}</span>
                    <Users className="w-4 h-4 text-cyan-400 mb-0.5" />
                  </div>
                </Card>
                <Card className="p-5 flex flex-col justify-between border-slate-800/80">
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Internal Passes</span>
                  <div className="flex items-end justify-between mt-4">
                    <span className="text-2xl font-black text-emerald-400 font-display leading-none">{metrics.internal_count}</span>
                    <GraduationCap className="w-4 h-4 text-emerald-400 mb-0.5" />
                  </div>
                </Card>
                <Card className="p-5 flex flex-col justify-between border-slate-800/80">
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">External Paid</span>
                  <div className="flex items-end justify-between mt-4">
                    <span className="text-2xl font-black text-amber-400 font-display leading-none">{metrics.external_count}</span>
                    <Users className="w-4 h-4 text-amber-400 mb-0.5" />
                  </div>
                </Card>
                <Card className="p-5 flex flex-col justify-between border-slate-800/80">
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Checked In</span>
                  <div className="flex items-end justify-between mt-4">
                    <span className="text-2xl font-black text-cyan-400 font-display leading-none">{metrics.checked_in_count}</span>
                    <UserCheck className="w-4 h-4 text-cyan-400 mb-0.5" />
                  </div>
                </Card>
                <Card className="p-5 flex flex-col justify-between border-slate-800/80">
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Pending Checkin</span>
                  <div className="flex items-end justify-between mt-4">
                    <span className="text-2xl font-black text-slate-400 font-display leading-none">{metrics.pending_count}</span>
                    <ClockIcon className="w-4 h-4 text-slate-400 mb-0.5" />
                  </div>
                </Card>
                <Card className="p-5 flex flex-col justify-between border-slate-800/80">
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Total Revenue</span>
                  <div className="flex items-end justify-between mt-4 col-span-2">
                    <span className="text-2xl font-black text-yellow-500 font-display leading-none">
                      {formatCurrency(metrics.total_revenue)}
                    </span>
                    <Coins className="w-4 h-4 text-yellow-500 mb-0.5" />
                  </div>
                </Card>
              </div>
            ) : null}

            {/* Graphs Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Daily Trend Line/Bar */}
              <Card className="lg:col-span-2 flex flex-col gap-4">
                <div className="flex justify-between items-center border-b border-slate-900 pb-3 mb-2">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-cyan-400" /> Registration Growth
                  </h3>
                  <span className="text-[10px] text-slate-500 font-semibold uppercase">Cumulative</span>
                </div>
                <div className="h-64 w-full text-xs">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartsData} margin={{ left: -20, bottom: -10 }}>
                      <XAxis dataKey="name" stroke="#64748b" tickLine={false} />
                      <YAxis stroke="#64748b" tickLine={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#0f172a",
                          borderColor: "#334155",
                          borderRadius: "12px",
                          color: "#f1f5f9",
                        }}
                      />
                      <Bar dataKey="registrations" fill="#0284c7" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              {/* Pie Distribution */}
              <Card className="flex flex-col gap-4">
                <div className="flex justify-between items-center border-b border-slate-900 pb-3 mb-2">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">
                    Category Distribution
                  </h3>
                </div>
                <div className="h-60 w-full flex items-center justify-center">
                  {metricsLoading ? (
                    <div className="w-32 h-32 rounded-full border-4 border-slate-800 animate-pulse" />
                  ) : pieData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend iconType="circle" wrapperStyle={{ fontSize: "11px" }} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <span className="text-xs text-slate-500">No data available</span>
                  )}
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* -------------------- PARTICIPANTS TAB -------------------- */}
        {activeTab === "participants" && (
          <div className="flex flex-col gap-5 animate-fade-in">
            {/* Filter Card */}
            <Card className="p-5 md:p-6 border-slate-800/80">
              <form onSubmit={handleApplyFilters} className="flex flex-col md:flex-row gap-4 items-end">
                <div className="w-full md:flex-grow">
                  <Input
                    label="Search Attendees"
                    id="search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    icon={<Search className="w-4 h-4" />}
                    placeholder="Search by Name, Reg ID, Mobile, Email..."
                  />
                </div>
                
                <div className="w-full md:w-44 flex flex-col gap-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    College / Institute
                  </label>
                  <input
                    type="text"
                    value={collegeFilter}
                    onChange={(e) => setCollegeFilter(e.target.value)}
                    placeholder="Filter college"
                    className="bg-slate-950/60 border border-slate-800/80 rounded-lg py-2.5 px-4 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500/30 transition-all duration-200"
                  />
                </div>

                <div className="w-full md:w-36 flex flex-col gap-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Payment Status
                  </label>
                  <select
                    value={paymentFilter}
                    onChange={(e) => setPaymentFilter(e.target.value)}
                    className="bg-slate-950/60 border border-slate-800/80 rounded-lg py-2.5 px-4 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500/30 transition-all duration-200"
                  >
                    <option value="ALL">ALL Status</option>
                    <option value="FREE">FREE</option>
                    <option value="PAID">PAID</option>
                    <option value="PENDING">PENDING</option>
                    <option value="FAILED">FAILED</option>
                  </select>
                </div>

                <div className="w-full md:w-36 flex flex-col gap-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Attendance
                  </label>
                  <select
                    value={attendanceFilter}
                    onChange={(e) => setAttendanceFilter(e.target.value)}
                    className="bg-slate-950/60 border border-slate-800/80 rounded-lg py-2.5 px-4 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500/30 transition-all duration-200"
                  >
                    <option value="ALL">ALL Status</option>
                    <option value="PRESENT">PRESENT</option>
                    <option value="ABSENT">ABSENT</option>
                  </select>
                </div>

                <div className="flex gap-2 w-full md:w-auto">
                  <Button type="submit" variant="primary" className="flex-1 md:flex-none">
                    Apply
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleClearFilters}
                    className="p-3"
                    title="Reset Filters"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </div>
              </form>
            </Card>

            {/* List Table Card */}
            <Card className="p-0 overflow-hidden border-slate-800/80">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="bg-slate-950/80 border-b border-slate-850 text-slate-400 text-xs font-bold uppercase tracking-wider">
                      <th className="py-4 px-6">Reg ID</th>
                      <th className="py-4 px-6">Full Name</th>
                      <th className="py-4 px-6">College / School</th>
                      <th className="py-4 px-6">Type</th>
                      <th className="py-4 px-6">Payment</th>
                      <th className="py-4 px-6">Attendance</th>
                      <th className="py-4 px-6 text-right">Details</th>
                    </tr>
                  </thead>
                  
                  <tbody className="divide-y divide-slate-850/60">
                    {listLoading ? (
                      [...Array(5)].map((_, idx) => (
                        <tr key={idx} className="animate-pulse">
                          <td className="py-4 px-6" colSpan="7">
                            <div className="h-4 bg-slate-900/60 rounded w-full" />
                          </td>
                        </tr>
                      ))
                    ) : participants.length === 0 ? (
                      <tr>
                        <td className="py-8 px-6 text-center text-slate-500" colSpan="7">
                          No registration records matched your active filters.
                        </td>
                      </tr>
                    ) : (
                      participants.map((p) => (
                        <tr
                          key={p.registration_id}
                          className="hover:bg-slate-900/30 transition-colors"
                        >
                          <td className="py-4.5 px-6 font-mono font-bold text-cyan-400 text-xs">
                            {p.registration_id}
                          </td>
                          <td className="py-4.5 px-6 font-semibold text-slate-100">
                            {p.full_name}
                          </td>
                          <td className="py-4.5 px-6 text-slate-400 text-xs">
                            {p.college_name}
                          </td>
                          <td className="py-4.5 px-6">
                            <Badge variant={p.participant_type === "INTERNAL" ? "success" : "gold"}>
                              {p.participant_type}
                            </Badge>
                          </td>
                          <td className="py-4.5 px-6">
                            <Badge
                              variant={
                                p.payment_status === "PAID" || p.payment_status === "FREE"
                                  ? "success"
                                  : p.payment_status === "PENDING"
                                  ? "warning"
                                  : "danger"
                              }
                            >
                              {p.payment_status}
                            </Badge>
                          </td>
                          <td className="py-4.5 px-6">
                            <Badge variant={p.attendance_status === "PRESENT" ? "success" : "danger"}>
                              {p.attendance_status}
                            </Badge>
                          </td>
                          <td className="py-4.5 px-6 text-right">
                            <button
                              onClick={() => handleViewDetails(p.registration_id)}
                              className="text-xs font-bold text-cyan-400 hover:text-cyan-300 border border-cyan-500/20 hover:border-cyan-500/50 bg-cyan-950/20 px-3 py-1.5 rounded-lg transition-all"
                            >
                              Open Profile
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Table Pagination */}
              {totalPages > 1 && (
                <div className="bg-slate-950/45 px-6 py-4 flex items-center justify-between border-t border-slate-900 text-xs text-slate-400">
                  <span>
                    Showing page <strong className="text-slate-200">{currentPage}</strong> of <strong className="text-slate-200">{totalPages}</strong> ({totalParticipants} total rows)
                  </span>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      onClick={() => fetchParticipantList(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-3 py-1.5"
                    >
                      Prev
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => fetchParticipantList(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1.5"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          </div>
        )}

        {/* -------------------- QR SCANNER TAB -------------------- */}
        {activeTab === "scanner" && (
          <div className="flex flex-col items-center justify-center max-w-md mx-auto w-full gap-6 py-4 animate-fade-in">
            <div className="text-center">
              <h2 className="text-2xl font-bold font-display text-white">QR Code Gate Entry</h2>
              <p className="text-sm text-slate-400 mt-1 max-w-xs mx-auto">
                Scan attendee digital pass QR codes to check them in and prevent duplicates.
              </p>
            </div>

            {!scannerActive ? (
              <Card className="w-full flex flex-col items-center gap-6 p-8 text-center border-slate-800/80">
                <div className="w-20 h-20 rounded-2xl bg-cyan-950/40 border border-cyan-800/20 flex items-center justify-center text-cyan-400 shadow-inner">
                  <QrCode className="w-10 h-10" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-200">Viewfinder is Offline</h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Camera access is required. Click the button below to turn on the scanner.
                  </p>
                </div>
                <Button
                  onClick={handleStartScanner}
                  variant="primary"
                  className="w-full font-bold py-3 text-sm"
                  icon={<QrCode className="w-4 h-4" />}
                >
                  Activate Scanner Camera
                </Button>
              </Card>
            ) : (
              <div className="w-full flex flex-col gap-4">
                {/* Scanner container for html5-qrcode */}
                <div className="overflow-hidden border border-slate-850 rounded-2xl bg-black w-full aspect-square relative shadow-2xl">
                  <div id="qr-viewfinder-container" className="w-full h-full" />
                </div>
                
                <Button
                  onClick={handleStopScanner}
                  variant="danger"
                  className="w-full font-bold py-2.5 text-xs uppercase tracking-wider"
                >
                  Deactivate Camera
                </Button>
              </div>
            )}
          </div>
        )}

        {/* -------------------- REPORTS TAB -------------------- */}
        {activeTab === "reports" && (
          <div className="max-w-2xl mx-auto w-full flex flex-col gap-6 py-4 animate-fade-in">
            <div className="text-center">
              <h2 className="text-2xl font-bold font-display text-white">Data Export Center</h2>
              <p className="text-sm text-slate-400 mt-1">
                Extract full registration database tables as office-compatible formats.
              </p>
            </div>

            <Card className="flex flex-col gap-6 border-slate-800/80">
              <div className="flex items-center gap-4 bg-slate-950/60 border border-slate-800/40 p-4.5 rounded-xl">
                <div className="w-10 h-10 rounded-lg bg-cyan-950/50 border border-cyan-800/20 flex items-center justify-center text-cyan-400 shadow-inner">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-200">Database Filter State</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Your export will inherit any active filters from the database tab (College, Payment, Attendance).
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 mt-2">
                <button
                  onClick={() => handleExport("csv")}
                  className="flex-1 flex flex-col items-center justify-center gap-3 p-6 border border-slate-800 bg-slate-950/30 hover:bg-slate-950/60 hover:border-slate-700 rounded-2xl transition-all group"
                >
                  <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
                    <FileSpreadsheet className="w-6 h-6" />
                  </div>
                  <div className="text-center">
                    <span className="font-bold text-sm block text-white">Download CSV</span>
                    <span className="text-[10px] text-slate-500 uppercase font-semibold mt-1 inline-flex items-center gap-1">
                      <FileDown className="w-3.5 h-3.5" /> UTF-8 Format
                    </span>
                  </div>
                </button>

                <button
                  onClick={() => handleExport("excel")}
                  className="flex-1 flex flex-col items-center justify-center gap-3 p-6 border border-slate-800 bg-slate-950/30 hover:bg-slate-950/60 hover:border-slate-700 rounded-2xl transition-all group"
                >
                  <div className="w-12 h-12 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition-transform">
                    <FileSpreadsheet className="w-6 h-6" />
                  </div>
                  <div className="text-center">
                    <span className="font-bold text-sm block text-white">Download Excel</span>
                    <span className="text-[10px] text-slate-500 uppercase font-semibold mt-1 inline-flex items-center gap-1">
                      <FileDown className="w-3.5 h-3.5" /> XLSX Format
                    </span>
                  </div>
                </button>
              </div>
            </Card>
          </div>
        )}

        {/* -------------------- ATTENDEE DETAIL MODAL -------------------- */}
        <Modal
          isOpen={detailModalOpen}
          onClose={() => setDetailModalOpen(false)}
          title="Attendee Profile Card"
          size="md"
        >
          {detailLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-slate-400 text-xs">Retrieving database record...</p>
            </div>
          ) : selectedParticipant ? (
            <div className="flex flex-col gap-6">
              {/* Header profile */}
              <div className="flex items-center gap-4 bg-slate-950/40 p-4.5 rounded-xl border border-slate-850">
                <div className="w-12 h-12 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 font-bold uppercase font-display text-lg">
                  {selectedParticipant.full_name.charAt(0)}
                </div>
                <div>
                  <h4 className="text-base font-extrabold font-display text-white">
                    {selectedParticipant.full_name}
                  </h4>
                  <span className="text-xs font-mono font-bold text-cyan-400">
                    {selectedParticipant.registration_id}
                  </span>
                </div>
              </div>

              {/* Grid Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="flex items-center gap-2.5 p-3 bg-slate-950/20 border border-slate-900 rounded-lg">
                  <Phone className="w-4 h-4 text-slate-500 flex-shrink-0" />
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-slate-500 font-semibold block">Mobile</span>
                    <span className="text-slate-200 font-medium">{selectedParticipant.mobile}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 p-3 bg-slate-950/20 border border-slate-900 rounded-lg">
                  <Mail className="w-4 h-4 text-slate-500 flex-shrink-0" />
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-slate-500 font-semibold block">Email</span>
                    <span className="text-slate-200 font-medium break-all">{selectedParticipant.email}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 p-3 bg-slate-950/20 border border-slate-900 rounded-lg md:col-span-2">
                  <MapPin className="w-4 h-4 text-slate-500 flex-shrink-0" />
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-slate-500 font-semibold block">Address</span>
                    <span className="text-slate-200 font-medium leading-normal">{selectedParticipant.address}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 p-3 bg-slate-950/20 border border-slate-900 rounded-lg md:col-span-2">
                  <Shield className="w-4 h-4 text-rose-500 flex-shrink-0" />
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-slate-500 font-semibold block">Aadhaar (Decrypted)</span>
                    <span className="text-rose-400 font-bold font-mono tracking-wider">
                      {selectedParticipant.aadhaar_number || "XXXXXXXXXXXX"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 p-3 bg-slate-950/20 border border-slate-900 rounded-lg md:col-span-2">
                  <GraduationCap className="w-4 h-4 text-slate-500 flex-shrink-0" />
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-slate-500 font-semibold block">College / University</span>
                    <span className="text-slate-200 font-medium">{selectedParticipant.college_name}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 p-3 bg-slate-950/20 border border-slate-900 rounded-lg">
                  <GraduationCap className="w-4 h-4 text-slate-500 flex-shrink-0" />
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-slate-500 font-semibold block">Register Number</span>
                    <span className="text-slate-200 font-medium font-mono">{selectedParticipant.register_number}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 p-3 bg-slate-950/20 border border-slate-900 rounded-lg">
                  <GraduationCap className="w-4 h-4 text-slate-500 flex-shrink-0" />
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-slate-500 font-semibold block">Department</span>
                    <span className="text-slate-200 font-medium">{selectedParticipant.department}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 p-3 bg-slate-950/20 border border-slate-900 rounded-lg">
                  <Calendar className="w-4 h-4 text-slate-500 flex-shrink-0" />
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-slate-500 font-semibold block">Year of Study</span>
                    <span className="text-slate-200 font-medium">{selectedParticipant.year_of_study}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 p-3 bg-slate-950/20 border border-slate-900 rounded-lg">
                  <CreditCard className="w-4 h-4 text-slate-500 flex-shrink-0" />
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-slate-500 font-semibold block">Payment Status</span>
                    <span className="text-slate-200 font-medium">{selectedParticipant.payment_status}</span>
                  </div>
                </div>
              </div>

              {/* Badges footer */}
              <div className="flex items-center justify-between border-t border-slate-800/80 pt-4 mt-2">
                <div className="flex gap-2">
                  <Badge variant={selectedParticipant.participant_type === "INTERNAL" ? "success" : "gold"}>
                    {selectedParticipant.participant_type}
                  </Badge>
                  <Badge variant={selectedParticipant.attendance_status === "PRESENT" ? "success" : "danger"}>
                    {selectedParticipant.attendance_status}
                  </Badge>
                </div>
                <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
                  Registered: {formatDate(selectedParticipant.created_at)}
                </div>
              </div>
            </div>
          ) : null}
        </Modal>

        {/* -------------------- QR SCAN RESULT MODAL -------------------- */}
        <Modal
          isOpen={scanModalOpen}
          onClose={() => {
            setScanModalOpen(false);
            // Re-activate scanner if closed
            setScannerActive(true);
          }}
          title="QR Pass Scan Result"
          size="md"
        >
          {scanResult ? (
            <div className="flex flex-col gap-6">
              {/* Scan status alert message */}
              {scanResult.status === "VALID_PASS" ? (
                <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-xl flex items-center gap-3">
                  <UserCheck className="w-6 h-6 text-emerald-400 flex-shrink-0" />
                  <div>
                    <span className="font-bold text-sm block">✓ Valid Pass</span>
                    <span className="text-xs text-emerald-500/80 leading-normal">
                      Pass is active and verified in database. Ready for entry.
                    </span>
                  </div>
                </div>
              ) : scanResult.status === "ALREADY_CHECKED_IN" ? (
                <div className="bg-amber-500/10 border border-amber-500/20 text-amber-400 p-4 rounded-xl flex items-center gap-3">
                  <AlertTriangle className="w-6 h-6 text-amber-400 flex-shrink-0" />
                  <div>
                    <span className="font-bold text-sm block">⚠ Already Checked In</span>
                    <span className="text-xs text-amber-500/80 leading-normal">
                      Duplicate entry blocked. Checked in at:{" "}
                      {scanResult.data?.checked_in_at ? formatDate(scanResult.data.checked_in_at) : "N/A"}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl flex items-center gap-3">
                  <AlertTriangle className="w-6 h-6 text-rose-400 flex-shrink-0" />
                  <div>
                    <span className="font-bold text-sm block">✗ Invalid Pass</span>
                    <span className="text-xs text-rose-500/80 leading-normal">
                      No matching records found in database tables. Entry denied.
                    </span>
                  </div>
                </div>
              )}

              {/* Scanned Attendee details */}
              {scanResult.data && (
                <div className="flex flex-col gap-4">
                  <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-850 flex justify-between items-center">
                    <div>
                      <h4 className="text-base font-extrabold font-display text-white">
                        {scanResult.data.full_name}
                      </h4>
                      <span className="text-xs font-mono font-bold text-cyan-400">
                        {scanResult.data.registration_id}
                      </span>
                    </div>
                    <Badge variant={scanResult.data.participant_type === "INTERNAL" ? "success" : "gold"}>
                      {scanResult.data.participant_type}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-3.5 text-xs text-slate-300">
                    <div className="bg-slate-950/20 border border-slate-900 p-3 rounded-lg">
                      <span className="text-[9px] uppercase tracking-wider text-slate-500 font-semibold block">College</span>
                      <span className="font-semibold text-slate-200 mt-0.5 block">{scanResult.data.college_name}</span>
                    </div>
                    <div className="bg-slate-950/20 border border-slate-900 p-3 rounded-lg">
                      <span className="text-[9px] uppercase tracking-wider text-slate-500 font-semibold block">Register Number</span>
                      <span className="font-semibold text-slate-200 mt-0.5 block">{scanResult.data.register_number}</span>
                    </div>
                    <div className="bg-slate-950/20 border border-slate-900 p-3 rounded-lg">
                      <span className="text-[9px] uppercase tracking-wider text-slate-500 font-semibold block">Department</span>
                      <span className="font-semibold text-slate-200 mt-0.5 block">{scanResult.data.department}</span>
                    </div>
                    <div className="bg-slate-950/20 border border-slate-900 p-3 rounded-lg">
                      <span className="text-[9px] uppercase tracking-wider text-slate-500 font-semibold block">Aadhaar</span>
                      <span className="font-semibold text-rose-400 font-mono tracking-wider block mt-0.5">
                        {scanResult.data.aadhaar_number || "XXXXXXXXXXXX"}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Button for check-in */}
              {scanResult.status === "VALID_PASS" && scanResult.data && (
                <Button
                  onClick={() => handleConfirmCheckin(scanResult.data.registration_id)}
                  variant="success"
                  loading={checkinLoading}
                  className="w-full font-bold py-3 text-sm mt-2"
                  icon={<UserCheck className="w-4.5 h-4.5" />}
                >
                  Confirm Entry Check-In
                </Button>
              )}

              <Button
                variant="secondary"
                onClick={() => {
                  setScanModalOpen(false);
                  setScannerActive(true);
                }}
                className="w-full font-semibold py-2.5 text-xs text-slate-400"
              >
                Scan Next Code
              </Button>
            </div>
          ) : null}
        </Modal>
      </div>
    </Layout>
  );
};

// Internal clock icon helper
const ClockIcon = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

export default AdminDashboardPage;
