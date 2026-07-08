import axiosClient from "@/src/services/axiosClient";

export const getDietPlans = async () => {
  try {
    const response = await axiosClient.get("/diet");
    return { success: true, data: response.data.data };
  } catch (error: any) {
    return { success: false, data: {} };
  }
};
