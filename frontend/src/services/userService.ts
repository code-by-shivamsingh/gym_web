import axiosClient from "@/src/services/axiosClient";

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

export const uploadAvatar = async (formData: FormData) => {
  try {
    const response = await axiosClient.post("/users/profile/avatar", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return { success: true, data: response.data.data };
  } catch (error: any) {
    return { success: false, message: error.response?.data?.message || "Upload failed" };
  }
};
