import axiosClient from "@/src/services/axiosClient";

// Existing Compatibility APIs
export const getWorkoutPlans = async () => {
  try {
    const response = await axiosClient.get("/workouts");
    return { success: true, data: response.data.data };
  } catch (error: any) {
    return { success: false, data: [] };
  }
};

export const getTodayWorkout = async () => {
  try {
    const response = await axiosClient.get("/workouts/progress");
    const progressRes = response.data.data;
    const currentDay = progressRes ? progressRes.currentDay : 1;
    
    // Fetch detailed day
    const dayResponse = await axiosClient.get(`/workouts/day/${currentDay}`);
    return {
      success: true,
      data: {
        day: `Day ${currentDay}`,
        dayName: dayResponse.data.data.dayName || '',
        description: dayResponse.data.data.description || '',
        isBeginner: true,
        workout: dayResponse.data.data.exercises.map((ex: any) => ({
          _id: ex._id,
          title: ex.name,
          category: ex.targetMuscles[0] || 'Strength',
          muscleGroup: ex.targetMuscles.join(', '),
          duration: Math.round(ex.duration / 60),
          caloriesBurn: ex.calories,
          thumbnail: ex.thumbnailUrl || 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=500&auto=format&fit=crop&q=60',
          videoUrl: ex.videoUrl,
          description: ex.description,
          completed: progressRes ? progressRes.completedExercises.includes(ex._id) : false
        }))
      }
    };
  } catch (error: any) {
    return { success: false, data: null, message: error.response?.data?.message || "Failed to load recommended workouts" };
  }
};

export const completeWorkoutVideo = async (workoutVideoId: string) => {
  try {
    const progressResponse = await axiosClient.get("/workouts/progress");
    const progress = progressResponse.data.data;
    if (!progress) throw new Error("Progress context missing");

    const response = await axiosClient.post("/workouts/complete-exercise", {
      programId: progress.programId,
      dayNumber: progress.currentDay,
      exerciseId: workoutVideoId
    });
    return { success: true, data: response.data.data };
  } catch (error: any) {
    return { success: false, message: error.response?.data?.message || "Failed to complete workout" };
  }
};

export const logWorkoutProgress = async (workoutVideoId: string) => {
  return completeWorkoutVideo(workoutVideoId);
};

// Admin CRUD APIs (compatibility)
export const getAdminVideos = async () => {
  try {
    const response = await axiosClient.get("/workouts/videos");
    return { success: true, data: response.data.data };
  } catch (error: any) {
    return { success: false, data: [] };
  }
};

export const createAdminVideo = async (data: any) => {
  try {
    const response = await axiosClient.post("/workouts/videos", data);
    return { success: true, data: response.data.data };
  } catch (error: any) {
    return { success: false, message: error.response?.data?.message || "Failed to create video" };
  }
};

export const updateAdminVideo = async (id: string, data: any) => {
  try {
    const response = await axiosClient.put(`/workouts/videos/${id}`, data);
    return { success: true, data: response.data.data };
  } catch (error: any) {
    return { success: false, message: error.response?.data?.message || "Failed to update video" };
  }
};

export const deleteAdminVideo = async (id: string) => {
  try {
    const response = await axiosClient.delete(`/workouts/videos/${id}`);
    return { success: true, data: response.data.data };
  } catch (error: any) {
    return { success: false, message: error.response?.data?.message || "Failed to delete video" };
  }
};

// NEW Enterprise Structured APIs
export const getWorkoutProgram = async () => {
  try {
    const response = await axiosClient.get("/workouts/program");
    return { success: true, data: response.data.data };
  } catch (error: any) {
    return { success: false, data: null };
  }
};

export const getWorkoutDay = async (dayNumber: number) => {
  try {
    const response = await axiosClient.get(`/workouts/day/${dayNumber}`);
    return { success: true, data: response.data.data };
  } catch (error: any) {
    return { success: false, data: null };
  }
};

export const getExerciseDetails = async (id: string) => {
  try {
    const response = await axiosClient.get(`/workouts/exercise/${id}`);
    return { success: true, data: response.data.data };
  } catch (error: any) {
    return { success: false, data: null };
  }
};

export const getWorkoutProgress = async () => {
  try {
    const response = await axiosClient.get("/workouts/progress");
    return { success: true, data: response.data.data };
  } catch (error: any) {
    return { success: false, data: null };
  }
};

export const startWorkoutProgram = async () => {
  try {
    const response = await axiosClient.post("/workouts/start");
    return { success: true, data: response.data.data };
  } catch (error: any) {
    return { success: false, data: null };
  }
};

export const completeExercise = async (programId: string, dayNumber: number, exerciseId: string) => {
  try {
    const response = await axiosClient.post("/workouts/complete-exercise", { programId, dayNumber, exerciseId });
    return { success: true, data: response.data.data };
  } catch (error: any) {
    return { success: false, message: error.response?.data?.message || "Failed to complete exercise" };
  }
};

export const completeWorkoutDay = async (programId: string, dayNumber: number, caloriesBurned: number, timeSpent: number) => {
  try {
    const response = await axiosClient.post("/workouts/complete-day", { programId, dayNumber, caloriesBurned, timeSpent });
    return { success: true, data: response.data.data };
  } catch (error: any) {
    return { success: false, message: error.response?.data?.message || "Failed to complete day" };
  }
};

export const getWorkoutHistory = async () => {
  try {
    const response = await axiosClient.get("/workouts/history");
    return { success: true, data: response.data.data };
  } catch (error: any) {
    return { success: false, data: [] };
  }
};

export const uploadVideoFile = async (formData: FormData) => {
  try {
    const response = await axiosClient.post("/workouts/upload-video", formData, {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    });
    return { success: true, data: response.data.data };
  } catch (error: any) {
    return { success: false, message: error.response?.data?.message || "Failed to upload video" };
  }
};
