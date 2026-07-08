import axiosClient from "@/src/services/axiosClient";

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
