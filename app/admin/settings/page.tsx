"use client";

import { useEffect, useState } from "react";
import AdminLayout from "@/src/components/organisms/AdminLayout";
import { getSettings, updateSettings } from "@/src/dialogs/invoice_config/services";

export default function AdminSettingsPage() {
  const [formData, setFormData] = useState({
    gymName: "Forge Gym",
    address: "123 Strength Ave, Fitness City",
    mobile: "+1234567890",
    taxRate: 18,
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await getSettings();
      if (res.success && res.data) {
        setFormData({
          gymName: res.data.gymName || "Forge Gym",
          address: res.data.address || "123 Strength Ave, Fitness City",
          mobile: res.data.mobile || "+1234567890",
          taxRate: res.data.taxRate || 18,
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await updateSettings(formData);
      if (res.success) {
        setMessage("Settings updated successfully!");
      } else {
        setMessage("Failed to update settings.");
      }
    } catch (err) {
      console.error(err);
      setMessage("Operation failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto text-white p-8">
        <h1 className="text-4xl font-bold mb-2">General Settings</h1>
        <p className="text-gray-400 mb-8">Manage global gym variables and billing parameters.</p>

        <form onSubmit={handleSave} className="bg-black border border-zinc-800 rounded-3xl p-8 space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Gym Name</label>
              <input
                type="text"
                value={formData.gymName}
                onChange={(e) => setFormData({ ...formData, gymName: e.target.value })}
                className="w-full bg-zinc-900 border border-zinc-700 p-4 rounded-xl text-white outline-none focus:border-yellow-400"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Contact Mobile</label>
              <input
                type="text"
                value={formData.mobile}
                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                className="w-full bg-zinc-900 border border-zinc-700 p-4 rounded-xl text-white outline-none focus:border-yellow-400"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">Address</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full bg-zinc-900 border border-zinc-700 p-4 rounded-xl text-white outline-none focus:border-yellow-400"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">Tax Rate (GST %)</label>
            <input
              type="number"
              value={formData.taxRate}
              onChange={(e) => setFormData({ ...formData, taxRate: parseInt(e.target.value) || 0 })}
              className="w-full bg-zinc-900 border border-zinc-700 p-4 rounded-xl text-white outline-none focus:border-yellow-400"
              required
            />
          </div>

          {message && (
            <div className={`p-4 rounded-xl text-center font-bold ${message.includes("success") ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-yellow-400 text-black py-4 rounded-xl font-bold text-lg hover:scale-[1.02] transition duration-300"
          >
            {loading ? "Saving..." : "Save Settings"}
          </button>
        </form>
      </div>
    </AdminLayout>
  );
}
