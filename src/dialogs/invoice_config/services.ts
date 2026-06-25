import axiosClient from "@/src/services/axiosClient";

export interface LoginParams {
  email: string;
  password: string;
}

export interface RegisterParams {
  name: string;
  email: string;
  mobile: string;
  password: string;
  role: string;
  plan?: string;
}

// ==========================================
// AUTH SERVICES
// ==========================================

export const loginUser = async (params: LoginParams) => {
  try {
    const response = await axiosClient.post("/auth/login", params);
    return {
      success: true,
      message: response.data.message,
      token: response.data.token,
      data: response.data,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || "Login failed",
    };
  }
};

export const registerUser = async (params: RegisterParams) => {
  try {
    const response = await axiosClient.post("/auth/register", params);
    return {
      success: true,
      message: response.data.message,
      token: response.data.token,
      data: response.data,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || "Registration failed",
    };
  }
};

export const logoutUser = async () => {
  try {
    const response = await axiosClient.post("/auth/logout");
    return { success: true, message: response.data.message };
  } catch (error: any) {
    return { success: false, message: error.response?.data?.message || "Logout failed" };
  }
};

export const forgotPassword = async (email: string) => {
  try {
    const response = await axiosClient.post("/auth/forgot-password", { email });
    return { success: true, message: response.data.message };
  } catch (error: any) {
    return { success: false, message: error.response?.data?.message || "Operation failed" };
  }
};

export const resetPassword = async (password: string, token: string) => {
  try {
    const response = await axiosClient.post("/auth/reset-password", { password, token });
    return { success: true, message: response.data.message };
  } catch (error: any) {
    return { success: false, message: error.response?.data?.message || "Reset failed" };
  }
};

export const changePassword = async (data: any) => {
  try {
    const response = await axiosClient.post("/auth/change-password", data);
    return { success: true, message: response.data.message };
  } catch (error: any) {
    return { success: false, message: error.response?.data?.message || "Password change failed" };
  }
};

// ==========================================
// USER / PROFILE SERVICES
// ==========================================

export const getUserProfile = async () => {
  try {
    const response = await axiosClient.get("/users/profile");
    return { success: true, data: response.data.data };
  } catch (error: any) {
    return { success: false, message: error.response?.data?.message || "Failed to load profile" };
  }
};

export const updateUserProfile = async (data: any) => {
  try {
    const response = await axiosClient.put("/users/profile", data);
    return { success: true, data: response.data.data };
  } catch (error: any) {
    return { success: false, message: error.response?.data?.message || "Update failed" };
  }
};

export const uploadAvatar = async (formData: FormData) => {
  try {
    const response = await axiosClient.post("/users/profile/avatar", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return { success: true, data: response.data.data };
  } catch (error: any) {
    return { success: false, message: error.response?.data?.message || "Upload failed" };
  }
};

// ==========================================
// MEMBER SERVICES
// ==========================================

export const getMembers = async () => {
  try {
    const response = await axiosClient.get("/members");
    return { success: true, data: response.data.data };
  } catch (error: any) {
    return { success: false, data: [] };
  }
};

export const getAllMembers = async () => {
  try {
    const response = await axiosClient.get("/members");
    return { success: true, data: response.data.data };
  } catch (error: any) {
    return { success: false, data: [] };
  }
};

export const createMember = async (data: any) => {
  try {
    const response = await axiosClient.post("/members/create", data);
    return { success: true, data: response.data.data };
  } catch (error: any) {
    return { success: false, message: error.response?.data?.message || "Creation failed" };
  }
};

export const updateMember = async (id: string, data: any) => {
  try {
    const response = await axiosClient.patch(`/members/${id}`, data);
    return { success: true, data: response.data.data };
  } catch (error: any) {
    return { success: false, message: error.response?.data?.message || "Update failed" };
  }
};

export const deleteMember = async (id: string) => {
  try {
    const response = await axiosClient.delete(`/members/${id}`);
    return { success: true, data: response.data.data };
  } catch (error: any) {
    return { success: false, message: error.response?.data?.message || "Deletion failed" };
  }
};

// ==========================================
// TRAINER SERVICES
// ==========================================

export const getTrainers = async () => {
  try {
    const response = await axiosClient.get("/trainers");
    return { success: true, data: response.data.data };
  } catch (error: any) {
    return { success: false, data: [] };
  }
};

export const createTrainer = async (data: any) => {
  try {
    const response = await axiosClient.post("/trainers", data);
    return { success: true, data: response.data.data };
  } catch (error: any) {
    return { success: false, message: error.response?.data?.message || "Trainer creation failed" };
  }
};

export const updateTrainer = async (id: string, data: any) => {
  try {
    const response = await axiosClient.put(`/trainers/${id}`, data);
    return { success: true, data: response.data.data };
  } catch (error: any) {
    return { success: false, message: error.response?.data?.message || "Trainer update failed" };
  }
};

export const deleteTrainer = async (id: string) => {
  try {
    const response = await axiosClient.delete(`/trainers/${id}`);
    return { success: true, data: response.data.data };
  } catch (error: any) {
    return { success: false, message: error.response?.data?.message || "Trainer deletion failed" };
  }
};

export const assignMembersToTrainer = async (trainerId: string, memberIds: string[]) => {
  try {
    const response = await axiosClient.post(`/trainers/${trainerId}/assign`, { memberIds });
    return { success: true, data: response.data.data };
  } catch (error: any) {
    return { success: false, message: error.response?.data?.message || "Assignment failed" };
  }
};

// ==========================================
// ATTENDANCE SERVICES
// ==========================================

export const getAttendanceHistory = async () => {
  try {
    const response = await axiosClient.get("/attendance/history");
    return { success: true, data: response.data.data };
  } catch (error: any) {
    return { success: false, data: [] };
  }
};

export const getAdminAttendanceOverview = async () => {
  try {
    const response = await axiosClient.get("/attendance/admin-overview");
    return { success: true, data: response.data.data };
  } catch (error: any) {
    return { success: false, data: [] };
  }
};

export const checkInAttendance = async () => {
  try {
    const response = await axiosClient.post("/attendance/check-in");
    return { success: true, data: response.data.data };
  } catch (error: any) {
    return { success: false, message: error.response?.data?.message || "Check-in failed" };
  }
};

export const checkOutAttendance = async () => {
  try {
    const response = await axiosClient.post("/attendance/check-out");
    return { success: true, data: response.data.data };
  } catch (error: any) {
    return { success: false, message: error.response?.data?.message || "Check-out failed" };
  }
};

// ==========================================
// WORKOUT / DIET SERVICES
// ==========================================

export const getWorkoutPlans = async () => {
  try {
    const response = await axiosClient.get("/workouts");
    return { success: true, data: response.data.data };
  } catch (error: any) {
    return { success: false, data: [] };
  }
};

export const getDietPlans = async () => {
  try {
    const response = await axiosClient.get("/diet");
    return { success: true, data: response.data.data };
  } catch (error: any) {
    return { success: false, data: {} };
  }
};

// ==========================================
// PAYMENTS & INVOICES SERVICES
// ==========================================

export const getPayments = async () => {
  try {
    const response = await axiosClient.get("/payments/history");
    return { success: true, data: response.data.data };
  } catch (error: any) {
    return { success: false, data: [] };
  }
};

export const createPaymentOrder = async (amount: number, method: string) => {
  try {
    const response = await axiosClient.post("/payments/create-order", { amount, method });
    return { success: true, data: response.data.data };
  } catch (error: any) {
    return { success: false, message: error.response?.data?.message || "Failed to create order" };
  }
};

export const verifyPayment = async (payload: any) => {
  try {
    const response = await axiosClient.post("/payments/verify", payload);
    return { success: true, data: response.data.data };
  } catch (error: any) {
    return { success: false, message: error.response?.data?.message || "Verification failed" };
  }
};

export const downloadInvoicePdf = async (paymentId: string) => {
  try {
    const response = await axiosClient.get(`/invoices/${paymentId}`, {
      responseType: "blob",
    });
    return { success: true, data: response.data };
  } catch (error: any) {
    return { success: false, message: "Failed to download invoice PDF" };
  }
};

// ==========================================
// DASHBOARD & REPORTS SERVICES
// ==========================================

export const getDashboardStats = async () => {
  try {
    const response = await axiosClient.get("/dashboard/stats");
    return { success: true, data: response.data.data };
  } catch (error: any) {
    return { success: false, data: null };
  }
};

export const getReportsStats = async () => {
  try {
    const response = await axiosClient.get("/reports/summary");
    return { success: true, data: response.data.data };
  } catch (error: any) {
    return { success: false, data: null };
  }
};

// ==========================================
// SETTINGS SERVICES
// ==========================================

export const getSettings = async () => {
  try {
    const response = await axiosClient.get("/settings");
    return { success: true, data: response.data.data };
  } catch (error: any) {
    return { success: false, data: null };
  }
};

export const updateSettings = async (data: any) => {
  try {
    const response = await axiosClient.put("/settings", data);
    return { success: true, data: response.data.data };
  } catch (error: any) {
    return { success: false, message: error.response?.data?.message || "Failed to update settings" };
  }
};

// ==========================================
// NOTIFICATION SERVICES
// ==========================================

export const getUserNotifications = async () => {
  try {
    const response = await axiosClient.get("/notifications");
    return { success: true, data: response.data.data };
  } catch (error: any) {
    return { success: false, data: [] };
  }
};