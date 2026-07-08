import axiosClient from "@/src/services/axiosClient";

export const getWorkoutPlans = async () => {
  try {
    const response = await axiosClient.get("/workouts");
    return { success: true, data: response.data.data };
  } catch (error: any) {
    return { success: false, data: [] };
  }
};
