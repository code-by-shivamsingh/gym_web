import axios from "axios";
import * as Keychain from "react-native-keychain";

export const BASE_URL = "https://gym-web-fadr.onrender.com";

const axiosClient = axios.create({
  baseURL: `${BASE_URL}/api`,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// Request Interceptor: Attach JWT Token from Secure Keychain
axiosClient.interceptors.request.use(
  async (config) => {
    try {
      const credentials = await Keychain.getGenericPassword({
        service: "user_session",
      });
      if (credentials) {
        config.headers["Authorization"] = `Bearer ${credentials.password}`;
      }
    } catch (err) {
      console.warn("Could not retrieve secure credentials:", err);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Catch auth errors and drop session if unauthorized
axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        await Keychain.resetGenericPassword({ service: "user_session" });

        // Dynamically require store and action to prevent circular dependency issues
        const { store } = require("../store/store");
        const { setUserProfile } = require("../store/slices/userDetailsSlice");
        store.dispatch(setUserProfile(null));
      } catch (err) {
        console.warn("Failed to clear expired session from Keychain:", err);
      }
    }
    return Promise.reject(error);
  }
);

// Helper to store session tokens securely
export const saveUserSession = async (token: string, email: string) => {
  try {
    await Keychain.setGenericPassword(email, token, {
      service: "user_session",
    });
  } catch (error) {
    console.error("Secure session save failed:", error);
  }
};

// Helper to clear session tokens
export const clearUserSession = async () => {
  try {
    await Keychain.resetGenericPassword({ service: "user_session" });
  } catch (error) {
    console.error("Secure session reset failed:", error);
  }
};

// ==========================================
// TYPE INTERFACES
// ==========================================

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
    console.log("Before API call: login");
    const response = await axiosClient.post("/auth/login", params);
    console.log("API Response", response.data);
    if (response.data.success && response.data.token) {
      await saveUserSession(response.data.token, params.email);
      console.log("After saveUserSession");
    }
    return {
      success: true,
      message: response.data.message,
      token: response.data.token,
      data: response.data.data,
    };
  } catch (error: any) {
    console.error("Login Error:", error.response?.data || error.message);
    return {
      success: false,
      message: error.response?.data?.message || "Login failed",
    };
  }
};

export const registerUser = async (params: RegisterParams) => {
  try {
    console.log("Before API call: register");
    const response = await axiosClient.post("/auth/register", params);
    console.log("API Response", response.data);
    if (response.data.success && response.data.token) {
      await saveUserSession(response.data.token, params.email);
      console.log("After saveUserSession");
    }
    return {
      success: true,
      message: response.data.message,
      token: response.data.token,
      data: response.data.data,
    };
  } catch (error: any) {
    console.error("Register Error:", error.response?.data || error.message);
    return {
      success: false,
      message: error.response?.data?.message || "Registration failed",
    };
  }
};

export const logoutUser = async () => {
  try {
    const response = await axiosClient.post("/auth/logout");
    await clearUserSession();
    return { success: true, message: response.data.message };
  } catch (error: any) {
    await clearUserSession();
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

export const verifyOtp = async (email: string, otp: string) => {
  try {
    const response = await axiosClient.post("/auth/verify-otp", { email, otp });
    return { success: true, message: response.data.message, token: response.data.token };
  } catch (error: any) {
    return { success: false, message: error.response?.data?.message || "Verification failed" };
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

export const uploadAvatar = async (avatarUri: string) => {
  try {
    const formData = new FormData();
    const filename = avatarUri.split("/").pop() || "avatar.jpg";
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : `image/jpeg`;

    formData.append("avatar", {
      uri: avatarUri,
      name: filename,
      type,
    } as any);

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
    return { success: false, data: null };
  }
};

export const getDietPlans = async () => {
  try {
    const response = await axiosClient.get("/diet");
    return { success: true, data: response.data.data };
  } catch (error: any) {
    return { success: false, data: null };
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

export const getMembershipPlans = async () => {
  try {
    const response = await axiosClient.get("/payments/plans");
    return { success: true, data: response.data.data };
  } catch (error: any) {
    return { success: false, message: error.response?.data?.message || "Failed to fetch plans" };
  }
};

export const createPaymentOrder = async (amount: number, method: string, plan: string, planId?: string) => {
  try {
    const response = await axiosClient.post("/payments/create-order", { amount, method, plan, planId });
    return {
      success: true,
      data: response.data.data,
      paymentUrl: response.data.paymentUrl,
      gateway: response.data.gateway,
      upiUrl: response.data.upiUrl,
      qrCodeBase64: response.data.qrCodeBase64
    };
  } catch (error: any) {
    return { success: false, message: error.response?.data?.message || "Checkout failed" };
  }
};

export const verifyPayment = async (orderId: string) => {
  try {
    const response = await axiosClient.post("/payments/verify", { orderId });
    return { success: true, data: response.data.data };
  } catch (error: any) {
    return { success: false, message: error.response?.data?.message || "Verification failed" };
  }
};

export const cancelPayment = async (orderId: string) => {
  try {
    const response = await axiosClient.post("/payments/cancel", { orderId });
    return { success: true, data: response.data.data };
  } catch (error: any) {
    return { success: false, message: error.response?.data?.message || "Cancellation failed" };
  }
};

export const downloadInvoicePdf = async (paymentId: string) => {
  try {
    // downloads via endpoint
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

// Location logging API
export const logLocationTelemetry = async (latitude: number, longitude: number, accuracy = 0, deviceType = "mobile") => {
  try {
    const response = await axiosClient.post("/users/location", { latitude, longitude, deviceType, accuracy });
    return { success: true, data: response.data.data, message: response.data.message };
  } catch (error: any) {
    return { success: false, message: error.response?.data?.message || "Location logging failed" };
  }
};

// Recommended Today's Workout API (Compatibility wrapper on top of new progression structure)
export const getTodayRecommendedWorkout = async () => {
  try {
    const response = await axiosClient.get("/workouts/progress");
    const progressRes = response.data.data;
    const currentDay = progressRes ? progressRes.currentDay : 1;

    // Fetch detailed day
    const dayResponse = await axiosClient.get(`/workouts/day/${currentDay}`);
    return {
      success: true,
      data: {
        day: `Day ${currentDay}`,
        dayName: dayResponse.data.data.dayName || '',
        description: dayResponse.data.data.description || '',
        isBeginner: true,
        workout: dayResponse.data.data.exercises.map((ex: any) => ({
          _id: ex._id,
          title: ex.name,
          category: ex.targetMuscles[0] || 'Strength',
          muscleGroup: ex.targetMuscles.join(', '),
          duration: Math.round(ex.duration / 60),
          caloriesBurn: ex.calories,
          thumbnail: ex.thumbnailUrl || 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=500&auto=format&fit=crop&q=60',
          videoUrl: ex.videoUrl,
          description: ex.description,
          completed: progressRes ? progressRes.completedExercises.includes(ex._id) : false
        }))
      }
    };
  } catch (error: any) {
    return { success: false, message: error.response?.data?.message || "Failed to load recommended workouts" };
  }
};

// Complete Workout Video progress API (Compatibility wrapper on top of new progression structure)
export const completeWorkoutVideo = async (workoutVideoId: string) => {
  try {
    const progressResponse = await axiosClient.get("/workouts/progress");
    const progress = progressResponse.data.data;
    if (!progress) throw new Error("Progress context missing");

    const response = await axiosClient.post("/workouts/complete-exercise", {
      programId: progress.programId,
      dayNumber: progress.currentDay,
      exerciseId: workoutVideoId
    });
    return { success: true, data: response.data.data };
  } catch (error: any) {
    return { success: false, message: error.response?.data?.message || "Failed to complete workout" };
  }
};

// New Structured Progression APIs
export const getWorkoutProgram = async () => {
  try {
    const response = await axiosClient.get("/workouts/program");
    return { success: true, data: response.data.data };
  } catch (error: any) {
    return { success: false, data: null };
  }
};

export const getWorkoutDay = async (dayNumber: number) => {
  try {
    const response = await axiosClient.get(`/workouts/day/${dayNumber}`);
    return { success: true, data: response.data.data };
  } catch (error: any) {
    return { success: false, data: null };
  }
};

export const getWorkoutProgress = async () => {
  try {
    const response = await axiosClient.get("/workouts/progress");
    return { success: true, data: response.data.data };
  } catch (error: any) {
    return { success: false, data: null };
  }
};

export const startWorkoutProgram = async () => {
  try {
    const response = await axiosClient.post("/workouts/start");
    return { success: true, data: response.data.data };
  } catch (error: any) {
    return { success: false, data: null };
  }
};

export const completeExercise = async (programId: string, dayNumber: number, exerciseId: string) => {
  try {
    const response = await axiosClient.post("/workouts/complete-exercise", { programId, dayNumber, exerciseId });
    return { success: true, data: response.data.data };
  } catch (error: any) {
    return { success: false, message: error.response?.data?.message || "Failed to complete exercise" };
  }
};

export const completeWorkoutDay = async (programId: string, dayNumber: number, caloriesBurned: number, timeSpent: number) => {
  try {
    const response = await axiosClient.post("/workouts/complete-day", { programId, dayNumber, caloriesBurned, timeSpent });
    return { success: true, data: response.data.data };
  } catch (error: any) {
    return { success: false, message: error.response?.data?.message || "Failed to complete day" };
  }
};

export const getWorkoutHistory = async () => {
  try {
    const response = await axiosClient.get("/workouts/history");
    return { success: true, data: response.data.data };
  } catch (error: any) {
    return { success: false, data: [] };
  }
};

// Current check-in geofence status API
export const getCurrentAttendanceStatus = async () => {
  try {
    const response = await axiosClient.get("/attendance/current-status");
    return { success: true, data: response.data.data };
  } catch (error: any) {
    return { success: false, message: error.response?.data?.message || "Failed to fetch status" };
  }
};

