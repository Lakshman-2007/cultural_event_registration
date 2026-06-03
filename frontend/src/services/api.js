import axios from "axios";
import { getToken, removeToken } from "./auth";

const API_BASE_URL = "http://localhost:8000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle errors (e.g. 401 Unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      removeToken();
      // Only redirect if we are inside the admin panel
      if (window.location.pathname.startsWith('/admin')) {
        window.location.href = "/admin/login";
      }
    }
    return Promise.reject(error);
  }
);

// --- Participant Routes ---

export const registerParticipant = async (data) => {
  const response = await api.post("/register", data);
  return response.data;
};

export const checkEmail = async (email) => {
  const response = await api.post("/register/check-email", { email });
  return response.data;
};

export const getPass = async (registrationId) => {
  const response = await api.get(`/pass/${registrationId}`);
  return response.data;
};

// --- Payment Routes ---

export const createPaymentOrder = async (registrationId, amount) => {
  const response = await api.post("/payment/create-order", {
    registration_id: registrationId,
    amount,
  });
  return response.data;
};

export const verifyPayment = async (registrationId, transactionId, orderId) => {
  const response = await api.post("/payment/verify", {
    registration_id: registrationId,
    transaction_id: transactionId,
    order_id: orderId,
  });
  return response.data;
};

// --- Admin Routes ---

export const adminLogin = async (email, password) => {
  const response = await api.post("/admin/login", { email, password });
  return response.data;
};

export const getDashboard = async () => {
  const response = await api.get("/admin/dashboard");
  return response.data;
};

export const getParticipants = async (params = {}) => {
  const response = await api.get("/admin/participants", { params });
  return response.data;
};

export const getParticipantDetail = async (registrationId) => {
  const response = await api.get(`/admin/participants/${registrationId}`);
  return response.data;
};

// --- QR / Attendance Routes ---

export const scanQR = async (registrationId) => {
  const response = await api.get(`/qr/scan/${registrationId}`);
  return response.data;
};

export const checkinParticipant = async (registrationId) => {
  const response = await api.post(`/attendance/checkin/${registrationId}`);
  return response.data;
};

// --- Export Report Helper ---

export const downloadExport = async (params = {}, format = "csv") => {
  const response = await api.get("/admin/export", {
    params: { ...params, format },
    responseType: "blob",
  });

  const blob = new Blob([response.data], {
    type:
      format === "csv"
        ? "text/csv"
        : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute(
    "download",
    `participants_export_${new Date().toISOString().slice(0, 10)}.${
      format === "csv" ? "csv" : "xlsx"
    }`
  );
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

export default api;
