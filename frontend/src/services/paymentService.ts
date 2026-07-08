import axiosClient from "@/src/services/axiosClient";

export const getPayments = async () => {
  try {
    const response = await axiosClient.get("/payments/history");
    return { success: true, data: response.data.data };
  } catch (error: any) {
    return { success: false, data: [] };
  }
};

export const getMembershipPlans = async () => {
  try {
    const response = await axiosClient.get("/payments/plans");
    return { success: true, data: response.data.data };
  } catch (error: any) {
    return { success: false, data: [], message: error.response?.data?.message || "Failed to load plans" };
  }
};

export const createPaymentOrder = async (method: string, planId: string): Promise<
  | { success: true; data: any; paymentUrl: any; gateway: any; qrCodeBase64?: any; message?: undefined }
  | { success: false; message: any; data?: undefined; paymentUrl?: undefined; gateway?: undefined; qrCodeBase64?: undefined }
> => {
  try {
    const response = await axiosClient.post("/payments/create-order", { method, planId });
    return { 
      success: true, 
      data: response.data.data, 
      paymentUrl: response.data.paymentUrl, 
      gateway: response.data.gateway,
      qrCodeBase64: response.data.qrCodeBase64
    };
  } catch (error: any) {
    return { success: false, message: error.response?.data?.message || "Failed to create order" };
  }
};

export const verifyPayment = async (orderId: string) => {
  try {
    const response = await axiosClient.post("/payments/verify", { orderId });
    return { success: true, data: response.data.data };
  } catch (error: any) {
    return { success: false, message: error.response?.data?.message || "Verification failed" };
  }
};

export const cancelPayment = async (orderId: string) => {
  try {
    const response = await axiosClient.post("/payments/cancel", { orderId });
    return { success: true, data: response.data.data };
  } catch (error: any) {
    return { success: false, message: error.response?.data?.message || "Cancellation failed" };
  }
};

export const downloadInvoicePdf = async (paymentId: string) => {
  try {
    const response = await axiosClient.get(`/invoices/${paymentId}`, {
      responseType: "blob",
    });
    return { success: true, data: response.data };
  } catch (error: any) {
    return { success: false, message: "Failed to download invoice PDF" };
  }
};
