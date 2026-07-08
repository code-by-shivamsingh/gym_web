import axiosClient from "@/src/services/axiosClient";

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
