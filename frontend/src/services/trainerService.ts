import axiosClient from "@/src/services/axiosClient";

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
