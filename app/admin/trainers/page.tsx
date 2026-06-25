"use client";

import { useEffect, useState } from "react";
import AdminLayout from "@/src/components/organisms/AdminLayout";
import {
  getTrainers,
  createTrainer,
  updateTrainer,
  deleteTrainer,
} from "@/src/dialogs/invoice_config/services";

export default function TrainersPage() {
  const [trainers, setTrainers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedTrainer, setSelectedTrainer] = useState<any>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    password: "",
    specialization: "",
    experience: "",
  });

  const fetchTrainers = async () => {
    try {
      const res = await getTrainers();
      if (res.success) {
        setTrainers(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrainers();
  }, []);

  const handleOpenAdd = () => {
    setSelectedTrainer(null);
    setFormData({
      name: "",
      email: "",
      mobile: "",
      password: "",
      specialization: "",
      experience: "",
    });
    setOpenDialog(true);
  };

  const handleOpenEdit = (trainer: any) => {
    setSelectedTrainer(trainer);
    setFormData({
      name: trainer.name || "",
      email: trainer.email || "",
      mobile: trainer.mobile || "",
      password: "", // Leave blank for edit
      specialization: trainer.specialization || "",
      experience: trainer.experience || "",
    });
    setOpenDialog(true);
  };

  const handleDeleteTrainer = async (id: string) => {
    if (!confirm("Are you sure you want to delete this trainer?")) return;
    try {
      const res = await deleteTrainer(id);
      if (res.success) {
        alert("Trainer deleted successfully!");
        fetchTrainers();
      } else {
        alert(res.message || "Failed to delete trainer.");
      }
    } catch (err) {
      console.error(err);
      alert("Error deleting trainer.");
    }
  };

  const handleSave = async () => {
    if (!formData.name || !formData.email) {
      alert("Name and Email are required!");
      return;
    }

    try {
      let res;
      if (selectedTrainer?._id) {
        // Edit flow
        const { password, ...updateData } = formData;
        res = await updateTrainer(selectedTrainer._id, updateData);
      } else {
        // Create flow
        res = await createTrainer(formData);
      }

      if (res.success) {
        alert(selectedTrainer ? "Trainer updated successfully!" : "Trainer created successfully!");
        setOpenDialog(false);
        fetchTrainers();
      } else {
        alert(res.message || "Failed to save trainer.");
      }
    } catch (err) {
      console.error(err);
      alert("Error saving trainer.");
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[50vh] text-yellow-400 font-bold text-xl animate-pulse">
          Loading Trainers...
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-8 text-white">
        <h1 className="text-4xl font-bold">Trainers Management</h1>
        <button
          onClick={handleOpenAdd}
          className="bg-yellow-400 text-black px-6 py-3 rounded-xl font-bold hover:scale-105 transition"
        >
          + Add Trainer
        </button>
      </div>

      {trainers.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trainers.map((trainer, index) => (
            <div key={trainer._id || index} className="bg-black border border-zinc-800 rounded-3xl p-6 flex flex-col justify-between">
              <div>
                {trainer.profileImage && trainer.profileImage.includes("/uploads/") ? (
                  <img
                    src={trainer.profileImage}
                    alt={trainer.name}
                    className="w-24 h-24 rounded-full object-cover border-2 border-yellow-400 mx-auto mb-4 bg-zinc-800"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full border-2 border-yellow-400 bg-zinc-900 flex items-center justify-center mx-auto mb-4 text-3xl font-extrabold text-yellow-400 uppercase">
                    {trainer.name ? trainer.name.charAt(0) : "T"}
                  </div>
                )}

                <h2 className="text-2xl font-bold text-center text-white">{trainer.name}</h2>
                <p className="text-yellow-400 text-center mt-2 font-semibold">
                  {trainer.specialization || "General Trainer"}
                </p>
                <p className="text-gray-400 text-center text-sm mt-1">
                  Experience: {trainer.experience || "N/A"}
                </p>
                <p className="text-gray-400 text-center text-sm mt-1">
                  Contact: {trainer.mobile || "N/A"}
                </p>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => handleOpenEdit(trainer)}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 font-bold text-white py-2 rounded-xl transition"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteTrainer(trainer._id)}
                  className="flex-1 bg-red-500 hover:bg-red-600 font-bold text-white py-2 rounded-xl transition"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-400">No trainers registered yet.</p>
      )}

      {/* Add/Edit Trainer Dialog */}
      {openDialog && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-zinc-900 w-full max-w-lg p-8 rounded-3xl border border-zinc-800 text-white">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">{selectedTrainer ? "Edit Trainer" : "Add Trainer"}</h2>
              <button onClick={() => setOpenDialog(false)} className="text-red-400 text-xl font-bold">✕</button>
            </div>

            <div className="space-y-4">
              <input
                type="text"
                placeholder="Full Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-black border border-zinc-700 p-3 rounded-xl text-white outline-none focus:border-yellow-400"
              />

              <input
                type="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-black border border-zinc-700 p-3 rounded-xl text-white outline-none focus:border-yellow-400"
                disabled={!!selectedTrainer}
              />

              {!selectedTrainer && (
                <input
                  type="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full bg-black border border-zinc-700 p-3 rounded-xl text-white outline-none focus:border-yellow-400"
                />
              )}

              <input
                type="text"
                placeholder="Mobile Number"
                value={formData.mobile}
                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                className="w-full bg-black border border-zinc-700 p-3 rounded-xl text-white outline-none focus:border-yellow-400"
              />

              <input
                type="text"
                placeholder="Specialization (e.g. Strength Training)"
                value={formData.specialization}
                onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                className="w-full bg-black border border-zinc-700 p-3 rounded-xl text-white outline-none focus:border-yellow-400"
              />

              <input
                type="text"
                placeholder="Experience (e.g. 5 Years)"
                value={formData.experience}
                onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                className="w-full bg-black border border-zinc-700 p-3 rounded-xl text-white outline-none focus:border-yellow-400"
              />

              <button
                onClick={handleSave}
                className="w-full bg-yellow-400 text-black py-3 rounded-xl font-bold text-lg hover:scale-105 transition mt-4"
              >
                {selectedTrainer ? "Update Trainer" : "Save Trainer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}