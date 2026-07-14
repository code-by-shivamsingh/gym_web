"use client";

import { useEffect, useState } from "react";
import AdminLayout from "@/src/components/organisms/AdminLayout";
import { 
  getAdminVideos, 
  createAdminVideo, 
  updateAdminVideo, 
  deleteAdminVideo,
  uploadVideoFile
} from "@/src/services/workoutService";

export default function AdminWorkoutsPage() {
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  // Modal & form states
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    category: "Strength",
    muscleGroup: "Chest",
    level: "Beginner",
    day: "Day 1",
    duration: 10,
    videoUrl: "",
    thumbnail: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=500&auto=format&fit=crop&q=60",
    description: "",
    caloriesBurn: 80,
    equipmentRequired: "None",
    sets: 3,
    reps: "10",
    restTime: 30,
    tips: "",
    commonMistakes: "",
    safetyInstructions: "",
    order: 1
  });

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const res = await getAdminVideos();
      if (res.success) {
        setVideos(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const handleEditClick = (video: any) => {
    setEditingId(video._id);
    setFormData({
      title: video.title || "",
      category: video.category || "Strength",
      muscleGroup: video.muscleGroup || "Chest",
      level: video.level || "Beginner",
      day: video.day || "Day 1",
      duration: video.duration || 10,
      videoUrl: video.videoUrl || "",
      thumbnail: video.thumbnail || "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=500&auto=format&fit=crop&q=60",
      description: video.description || "",
      caloriesBurn: video.caloriesBurn || 80,
      equipmentRequired: video.equipmentRequired || "None",
      sets: video.sets || 3,
      reps: video.reps || "10",
      restTime: video.restTime || 30,
      tips: video.tips || "",
      commonMistakes: video.commonMistakes || "",
      safetyInstructions: video.safetyInstructions || "",
      order: video.order || 1
    });
    setSelectedFile(null);
    setShowModal(true);
  };

  const handleAddClick = () => {
    setEditingId(null);
    setFormData({
      title: "",
      category: "Strength",
      muscleGroup: "Chest",
      level: "Beginner",
      day: "Day 1",
      duration: 10,
      videoUrl: "",
      thumbnail: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=500&auto=format&fit=crop&q=60",
      description: "",
      caloriesBurn: 80,
      equipmentRequired: "None",
      sets: 3,
      reps: "10",
      restTime: 30,
      tips: "",
      commonMistakes: "",
      safetyInstructions: "",
      order: videos.length + 1
    });
    setSelectedFile(null);
    setShowModal(true);
  };

  // Video File Upload handler
  const handleFileUpload = async () => {
    if (!selectedFile) return;
    setUploading(true);
    try {
      const upData = new FormData();
      upData.append("video", selectedFile);
      upData.append("program", "beginner");
      // Normalize Day name, e.g. Day 1 -> day1
      const dayFolder = formData.day.toLowerCase().replace(/\s+/g, "");
      upData.append("day", dayFolder);
      // Slugify filename based on exercise title
      const slugFilename = formData.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      upData.append("filename", slugFilename || `video-${Date.now()}`);

      const res = await uploadVideoFile(upData);
      if (res.success && res.data) {
        setFormData((prev) => ({
          ...prev,
          videoUrl: res.data.url
        }));
        alert(`Video uploaded successfully and saved at:\n${res.data.url}`);
      } else {
        alert(res.message || "Failed to upload video.");
      }
    } catch (err) {
      console.error("Upload error:", err);
      alert("Error occurred during video upload.");
    } finally {
      setUploading(false);
      setSelectedFile(null);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let res;
      if (editingId) {
        res = await updateAdminVideo(editingId, formData);
      } else {
        res = await createAdminVideo(formData);
      }

      if (res.success) {
        alert(editingId ? "Exercise updated successfully!" : "Exercise created successfully!");
        setShowModal(false);
        fetchVideos();
      } else {
        alert(res.message || "Failed to save exercise.");
      }
    } catch (err) {
      console.error(err);
      alert("Error occurred during save.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this exercise? It will be removed from all program day playlists.")) return;
    try {
      const res = await deleteAdminVideo(id);
      if (res.success) {
        alert("Exercise deleted successfully!");
        fetchVideos();
      } else {
        alert(res.message || "Failed to delete exercise.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleOrderChange = async (video: any, direction: "up" | "down") => {
    const sortedList = [...filteredVideos].sort((a, b) => (a.order || 0) - (b.order || 0));
    const idx = sortedList.findIndex((v) => v._id === video._id);
    if (idx === -1) return;

    let targetIdx = direction === "up" ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= sortedList.length) return; // out of bounds

    const targetVideo = sortedList[targetIdx];
    const originalOrder = video.order || 1;
    const targetOrder = targetVideo.order || 1;

    // Swap order
    await updateAdminVideo(video._id, { ...video, order: targetOrder });
    await updateAdminVideo(targetVideo._id, { ...targetVideo, order: originalOrder });
    fetchVideos();
  };

  const filteredVideos = videos.filter((vid) =>
    vid.title.toLowerCase().includes(search.toLowerCase()) ||
    vid.muscleGroup.toLowerCase().includes(search.toLowerCase()) ||
    vid.level.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="text-white p-6">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-extrabold text-white">Workout & Video Management</h1>
            <p className="text-zinc-400 text-sm mt-1">Upload exercise video streams and structure them into training day progression plans.</p>
          </div>
          <button
            onClick={handleAddClick}
            className="bg-yellow-400 text-black px-6 py-3.5 rounded-xl font-bold hover:scale-105 transition cursor-pointer border-none"
          >
            ➕ Create Exercise Video
          </button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search exercises by title, level, target muscles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-md bg-zinc-900 border border-zinc-800 p-4 rounded-xl text-white outline-none focus:border-yellow-400"
          />
        </div>

        {/* Videos Grid */}
        {loading ? (
          <p className="text-yellow-400 font-bold animate-pulse text-lg">Retrieving Exercise Database...</p>
        ) : filteredVideos.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVideos.map((video) => (
              <div
                key={video._id}
                className="bg-black border border-zinc-850 rounded-3xl overflow-hidden flex flex-col justify-between hover:border-yellow-400/20 transition-all duration-300"
              >
                <div className="relative aspect-video w-full bg-zinc-950 border-b border-zinc-850">
                  <img
                    src={video.thumbnail || "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=500"}
                    alt={video.title}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute top-3 right-3 bg-black/80 text-yellow-400 text-xs px-2.5 py-1 rounded font-bold border border-yellow-400/20">
                    {video.level}
                  </span>
                  <span className="absolute bottom-3 left-3 bg-black/80 text-white text-xs px-2.5 py-1 rounded font-bold">
                    Order: {video.order || 1}
                  </span>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="text-lg font-bold line-clamp-1">{video.title}</h3>
                      {/* Order shifting buttons */}
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleOrderChange(video, "up")}
                          className="bg-zinc-900 border border-zinc-800 hover:border-yellow-400/40 text-xs p-1 rounded transition"
                          title="Shift order up"
                        >
                          ▲
                        </button>
                        <button
                          onClick={() => handleOrderChange(video, "down")}
                          className="bg-zinc-900 border border-zinc-800 hover:border-yellow-400/40 text-xs p-1 rounded transition"
                          title="Shift order down"
                        >
                          ▼
                        </button>
                      </div>
                    </div>
                    
                    <p className="text-zinc-500 text-xs mt-1.5 font-semibold">{video.category} • {video.muscleGroup}</p>
                    <p className="text-zinc-400 text-xs mt-3 line-clamp-2">{video.description || "No instruction details configured."}</p>
                    
                    <div className="grid grid-cols-2 gap-2 mt-4 text-[10px] text-zinc-400 font-bold">
                      <div className="bg-zinc-900/50 p-2 rounded-lg text-center">
                        🕒 {video.duration} MINS
                      </div>
                      <div className="bg-zinc-900/50 p-2 rounded-lg text-center">
                        🔥 {video.caloriesBurn} KCAL
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-6">
                    <button
                      onClick={() => handleEditClick(video)}
                      className="flex-1 bg-zinc-900 border border-zinc-850 text-white py-2.5 rounded-xl text-xs font-bold hover:bg-zinc-850 transition cursor-pointer"
                    >
                      ✏️ Edit Exercise
                    </button>
                    <button
                      onClick={() => handleDelete(video._id)}
                      className="bg-red-500/20 border border-red-500/30 text-red-400 px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-red-500/35 transition cursor-pointer"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-zinc-500 text-sm">No exercises found.</p>
        )}

        {/* Modal Form */}
        {showModal && (
          <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-zinc-950 border border-zinc-800 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8 shadow-2xl text-white">
              <h2 className="text-2xl font-bold text-yellow-400 mb-6">
                {editingId ? "✏️ Edit Exercise Details" : "➕ Create Exercise"}
              </h2>

              <form onSubmit={handleSave} className="space-y-4">
                
                {/* Title */}
                <div>
                  <label className="block text-xs uppercase font-bold text-zinc-500 mb-1.5">Exercise Name</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-800 p-3.5 rounded-xl text-white outline-none focus:border-yellow-400"
                    placeholder="e.g. Jumping Jacks"
                    required
                  />
                </div>

                {/* Day Assign & Order */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase font-bold text-zinc-500 mb-1.5">Assign Workout Day</label>
                    <select
                      value={formData.day}
                      onChange={(e) => setFormData({ ...formData, day: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-800 p-3.5 rounded-xl text-white outline-none focus:border-yellow-400"
                    >
                      <option value="Day 1">Day 1 - Full Body</option>
                      <option value="Day 2">Day 2 - Chest & Triceps</option>
                      <option value="Day 3">Day 3 - Back & Biceps</option>
                      <option value="Day 4">Day 4 - Legs</option>
                      <option value="Day 5">Day 5 - Shoulders</option>
                      <option value="Day 6">Day 6 - Core</option>
                      <option value="Day 7">Day 7 - Cardio & Recovery</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs uppercase font-bold text-zinc-500 mb-1.5">Playlist Order Sequence</label>
                    <input
                      type="number"
                      value={formData.order}
                      onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 1 })}
                      className="w-full bg-zinc-900 border border-zinc-800 p-3.5 rounded-xl text-white outline-none focus:border-yellow-400"
                      required
                    />
                  </div>
                </div>

                {/* Category & Muscles */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase font-bold text-zinc-500 mb-1.5">Primary Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-800 p-3.5 rounded-xl text-white outline-none focus:border-yellow-400"
                    >
                      <option value="Strength">Strength Training</option>
                      <option value="Cardio">Cardio Conditioning</option>
                      <option value="Recovery">Recovery / Flexibility</option>
                      <option value="HIIT">High Intensity Interval</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs uppercase font-bold text-zinc-500 mb-1.5">Muscle Groups (comma separated)</label>
                    <input
                      type="text"
                      value={formData.muscleGroup}
                      onChange={(e) => setFormData({ ...formData, muscleGroup: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-800 p-3.5 rounded-xl text-white outline-none focus:border-yellow-400"
                      placeholder="e.g. Quads, Glutes"
                      required
                    />
                  </div>
                </div>

                {/* Level & Duration & Calories */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs uppercase font-bold text-zinc-500 mb-1.5">Difficulty Grade</label>
                    <select
                      value={formData.level}
                      onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-800 p-3 rounded-xl text-white outline-none focus:border-yellow-400"
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs uppercase font-bold text-zinc-500 mb-1.5">Est. Duration (mins)</label>
                    <input
                      type="number"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })}
                      className="w-full bg-zinc-900 border border-zinc-800 p-3.5 rounded-xl text-white outline-none focus:border-yellow-400"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase font-bold text-zinc-500 mb-1.5">Calories (kcal)</label>
                    <input
                      type="number"
                      value={formData.caloriesBurn}
                      onChange={(e) => setFormData({ ...formData, caloriesBurn: parseInt(e.target.value) || 0 })}
                      className="w-full bg-zinc-900 border border-zinc-800 p-3.5 rounded-xl text-white outline-none focus:border-yellow-400"
                      required
                    />
                  </div>
                </div>

                {/* Sets & Reps & Rest */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs uppercase font-bold text-zinc-500 mb-1.5">Default Sets</label>
                    <input
                      type="number"
                      value={formData.sets}
                      onChange={(e) => setFormData({ ...formData, sets: parseInt(e.target.value) || 3 })}
                      className="w-full bg-zinc-900 border border-zinc-800 p-3 rounded-xl text-white outline-none focus:border-yellow-400"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase font-bold text-zinc-500 mb-1.5">Target Reps</label>
                    <input
                      type="text"
                      value={formData.reps}
                      onChange={(e) => setFormData({ ...formData, reps: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-800 p-3.5 rounded-xl text-white outline-none focus:border-yellow-400"
                      placeholder="e.g. 10 reps or 30s"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase font-bold text-zinc-500 mb-1.5">Rest Interval (secs)</label>
                    <input
                      type="number"
                      value={formData.restTime}
                      onChange={(e) => setFormData({ ...formData, restTime: parseInt(e.target.value) || 30 })}
                      className="w-full bg-zinc-900 border border-zinc-800 p-3.5 rounded-xl text-white outline-none focus:border-yellow-400"
                      required
                    />
                  </div>
                </div>

                {/* Equipment & Thumbnail */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase font-bold text-zinc-500 mb-1.5">Equipment Required</label>
                    <input
                      type="text"
                      value={formData.equipmentRequired}
                      onChange={(e) => setFormData({ ...formData, equipmentRequired: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-800 p-3.5 rounded-xl text-white outline-none focus:border-yellow-400"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase font-bold text-zinc-500 mb-1.5">Thumbnail Image URL</label>
                    <input
                      type="text"
                      value={formData.thumbnail}
                      onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-800 p-3.5 rounded-xl text-white outline-none focus:border-yellow-400"
                      required
                    />
                  </div>
                </div>

                {/* Local Video File Upload Section */}
                <div className="border border-zinc-800 p-4 rounded-2xl bg-zinc-900/40">
                  <label className="block text-xs uppercase font-bold text-yellow-400 mb-2">Upload Local Video File (MP4/WebM)</label>
                  <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                    <input
                      type="file"
                      accept=".mp4,.webm"
                      onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0) {
                          setSelectedFile(e.target.files[0]);
                        }
                      }}
                      className="text-xs text-zinc-400 file:bg-zinc-900 file:text-white file:border file:border-zinc-800 file:py-2 file:px-4 file:rounded-xl file:cursor-pointer hover:file:bg-zinc-800"
                    />
                    <button
                      type="button"
                      onClick={handleFileUpload}
                      disabled={!selectedFile || uploading}
                      className="w-full sm:w-auto bg-yellow-400 hover:bg-yellow-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-black px-5 py-2.5 rounded-xl font-bold transition text-xs cursor-pointer border-none shrink-0"
                    >
                      {uploading ? "Uploading file..." : "🚀 Upload Video"}
                    </button>
                  </div>
                  <p className="text-[10px] text-zinc-500 mt-2">
                    Note: Uploading compiles files locally into `uploads/workouts/beginner/{formData.day.toLowerCase().replace(/\s+/g, "")}/`.
                  </p>
                </div>

                {/* Video URL */}
                <div>
                  <label className="block text-xs uppercase font-bold text-zinc-500 mb-1.5">Stream Video Path / URL</label>
                  <input
                    type="text"
                    value={formData.videoUrl}
                    onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-800 p-3.5 rounded-xl text-white outline-none focus:border-yellow-400"
                    placeholder="e.g. /uploads/workouts/beginner/day1/jumping-jacks.mp4"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs uppercase font-bold text-zinc-500 mb-1.5">Instructions / Description</label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-800 p-3.5 rounded-xl text-white outline-none focus:border-yellow-400 resize-none"
                  />
                </div>

                {/* Tips & Mistakes & Safety */}
                <div className="space-y-3 pt-2 border-t border-zinc-800">
                  <div>
                    <label className="block text-xs uppercase font-bold text-zinc-500 mb-1.5">Trainer Pro-Tips (comma separated)</label>
                    <input
                      type="text"
                      value={formData.tips}
                      onChange={(e) => setFormData({ ...formData, tips: e.target.value })}
                      placeholder="e.g. Land softly, Keep back flat"
                      className="w-full bg-zinc-900 border border-zinc-800 p-3.5 rounded-xl text-white outline-none focus:border-yellow-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase font-bold text-zinc-500 mb-1.5">Common Mistakes (comma separated)</label>
                    <input
                      type="text"
                      value={formData.commonMistakes}
                      onChange={(e) => setFormData({ ...formData, commonMistakes: e.target.value })}
                      placeholder="e.g. Arching back, Flaring elbows"
                      className="w-full bg-zinc-900 border border-zinc-800 p-3.5 rounded-xl text-white outline-none focus:border-yellow-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase font-bold text-zinc-500 mb-1.5">Safety Instructions (comma separated)</label>
                    <input
                      type="text"
                      value={formData.safetyInstructions}
                      onChange={(e) => setFormData({ ...formData, safetyInstructions: e.target.value })}
                      placeholder="e.g. Use a spotter, Maintain posture"
                      className="w-full bg-zinc-900 border border-zinc-800 p-3.5 rounded-xl text-white outline-none focus:border-yellow-400"
                    />
                  </div>
                </div>

                {/* Submit / Cancel */}
                <div className="flex gap-4 pt-4 border-t border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 bg-zinc-900 border border-zinc-800 text-white py-3.5 rounded-xl font-bold hover:bg-zinc-850 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-yellow-400 text-black py-3.5 rounded-xl font-black hover:scale-[1.02] transition cursor-pointer border-none"
                  >
                    Save Exercise Config
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
