import axiosClient from "@/src/services/axiosClient";

export const getUserNotifications = async () => {
  try {
    const response = await axiosClient.get("/notifications");
    return { success: true, data: response.data.data };
  } catch (error: any) {
    return { success: false, data: [] };
  }
};
