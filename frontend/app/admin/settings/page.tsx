"use client";

import { useEffect, useState } from "react";
import AdminLayout from "@/src/components/organisms/AdminLayout";
import { getSettings, updateSettings } from "@/src/dialogs/invoice_config/services";

export default function AdminSettingsPage() {
  const [formData, setFormData] = useState({
    gymName: "Forge Gym",
    address: "Airport Rd, near SBI Bank, Shubhanjalipuram, Maharajpura, Gwalior, Madhya Pradesh 474002, India",
    mobile: "+1234567890",
    whatsapp: "+919876543210",
    taxRate: 18,
    latitude: 26.2669994,
    longitude: 78.2169687,
    allowedRadius: 50,
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
          address: res.data.address || "Airport Rd, near SBI Bank, Shubhanjalipuram, Maharajpura, Gwalior, Madhya Pradesh 474002, India",
          mobile: res.data.mobile || "+1234567890",
          whatsapp: res.data.whatsapp || "+919876543210",
          taxRate: res.data.taxRate || 18,
          latitude: res.data.gymLocation?.latitude ?? 26.2669994,
          longitude: res.data.gymLocation?.longitude ?? 78.2169687,
          allowedRadius: res.data.gymLocation?.allowedRadius ?? 50,
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
        fetchSettings();
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
        <p className="text-gray-400 mb-8">Manage global gym variables, billing parameters, and GPS Geofencing.</p>

        <form onSubmit={handleSave} className="bg-black border border-zinc-800 rounded-3xl p-8 space-y-6">
          <div>
            <h2 className="text-xl font-bold text-yellow-400 mb-4 border-b border-zinc-850 pb-2">Business Details</h2>
          </div>
          
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

          <div className="grid md:grid-cols-2 gap-6">
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

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">WhatsApp Support Number</label>
              <input
                type="text"
                value={formData.whatsapp}
                onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
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

          <div className="grid md:grid-cols-2 gap-6">
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
          </div>

          {/* GPS Config Section */}
          <div className="pt-4">
            <h2 className="text-xl font-bold text-yellow-400 mb-4 border-b border-zinc-850 pb-2">📍 Gym GPS Geofencing Settings</h2>
            <p className="text-zinc-500 text-xs mb-4">Set the exact geolocation of the gym for automated GPS attendance logs.</p>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Latitude</label>
                <input
                  type="number"
                  step="any"
                  value={formData.latitude}
                  onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-zinc-900 border border-zinc-700 p-4 rounded-xl text-white outline-none focus:border-yellow-400"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Longitude</label>
                <input
                  type="number"
                  step="any"
                  value={formData.longitude}
                  onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-zinc-900 border border-zinc-700 p-4 rounded-xl text-white outline-none focus:border-yellow-400"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Geofence Radius (meters)</label>
                <input
                  type="number"
                  value={formData.allowedRadius}
                  onChange={(e) => setFormData({ ...formData, allowedRadius: parseInt(e.target.value) || 50 })}
                  className="w-full bg-zinc-900 border border-zinc-700 p-4 rounded-xl text-white outline-none focus:border-yellow-400"
                  required
                />
              </div>
            </div>
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
