import axiosClient from "@/src/services/axiosClient";

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
