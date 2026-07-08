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
