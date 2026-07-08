import axiosClient from "@/src/services/axiosClient";

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
