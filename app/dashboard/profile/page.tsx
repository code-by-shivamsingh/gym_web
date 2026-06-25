"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/src/components/organisms/DashboardLayout";
import { getUserProfile, updateUserProfile, uploadAvatar } from "@/src/dialogs/invoice_config/services";

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [uploading, setUploading] = useState(false);

  const fetchProfile = async () => {
    try {
      const res = await getUserProfile();
      if (res.success) {
        setProfile(res.data);
        setName(res.data.name || "");
        setMobile(res.data.mobile || "");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSave = async () => {
    try {
      setLoading(true);
      const res = await updateUserProfile({ name, mobile });
      if (res.success) {
        setProfile(res.data);
        setIsEditing(false);
        alert("Profile updated successfully!");
      } else {
        alert(res.message || "Failed to update profile");
      }
    } catch (err) {
      console.error(err);
      alert("Error saving profile");
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("avatar", file);

    try {
      setUploading(true);
      const res = await uploadAvatar(formData);
      if (res.success) {
        setProfile((prev: any) => ({ ...prev, profileImage: res.data.profileImage }));
        alert("Avatar uploaded successfully!");
      } else {
        alert(res.message || "Avatar upload failed");
      }
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  if (loading && !profile) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <p className="text-yellow-400 font-bold text-xl animate-pulse">Loading Profile...</p>
        </div>
      </DashboardLayout>
    );
  }

  const joinDate = profile?.memberDetails?.joinedDate
    ? new Date(profile.memberDetails.joinedDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "01 Jan 2026";

  const membership = profile?.memberDetails?.plan || profile?.role || "Member";

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">My Profile</h1>

        <div className="bg-black rounded-3xl p-8 border border-zinc-800">
          <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
            
            {/* Profile Image Column */}
            <div className="flex flex-col items-center gap-4">
              {profile?.profileImage && profile.profileImage.includes("/uploads/") ? (
                <img
                  src={profile.profileImage}
                  alt={name}
                  className="w-40 h-40 rounded-full object-cover border-4 border-yellow-400 shadow-lg shadow-yellow-400/20 bg-zinc-800"
                />
              ) : (
                <div className="w-40 h-40 rounded-full border-4 border-yellow-400 bg-zinc-900 flex items-center justify-center shadow-lg shadow-yellow-400/20 text-6xl font-extrabold text-yellow-400 uppercase">
                  {name ? name.charAt(0) : "U"}
                </div>
              )}
              <label className="cursor-pointer bg-zinc-900 border border-zinc-700 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-zinc-800 transition">
                {uploading ? "Uploading..." : "Change Photo"}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                  disabled={uploading}
                />
              </label>
            </div>

            {/* User Info Column */}
            <div className="flex-1 w-full">
              {isEditing ? (
                <div className="space-y-6">
                  <div>
                    <label className="block text-gray-400 mb-2 font-semibold">Full Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-700 text-white p-3 rounded-xl outline-none focus:border-yellow-400"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-400 mb-2 font-semibold">Mobile Number</label>
                    <input
                      type="text"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-700 text-white p-3 rounded-xl outline-none focus:border-yellow-400"
                    />
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button
                      onClick={handleSave}
                      className="bg-yellow-400 text-black px-6 py-3 rounded-xl font-bold hover:scale-105 transition"
                    >
                      Save Changes
                    </button>
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        setName(profile?.name || "");
                        setMobile(profile?.mobile || "");
                      }}
                      className="bg-zinc-800 border border-zinc-700 text-white px-6 py-3 rounded-xl font-bold hover:scale-105 transition"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-gray-400">Full Name</p>
                      <h3 className="text-xl font-bold mt-1 text-white">{profile?.name}</h3>
                    </div>

                    <div>
                      <p className="text-gray-400">Email Address</p>
                      <h3 className="text-xl font-bold mt-1 text-zinc-300">{profile?.email}</h3>
                    </div>

                    <div>
                      <p className="text-gray-400">Mobile Number</p>
                      <h3 className="text-xl font-bold mt-1 text-zinc-300">{profile?.mobile || "Not specified"}</h3>
                    </div>

                    <div>
                      <p className="text-gray-400">Membership Tier</p>
                      <h3 className="text-xl font-bold mt-1 text-yellow-400 uppercase">{membership}</h3>
                    </div>

                    <div>
                      <p className="text-gray-400">Join Date</p>
                      <h3 className="text-xl font-bold mt-1 text-zinc-300">{joinDate}</h3>
                    </div>

                    {profile?.role === "Trainer" && (
                      <>
                        <div>
                          <p className="text-gray-400">Specialization</p>
                          <h3 className="text-xl font-bold mt-1 text-zinc-300">{profile?.specialization || "General Trainer"}</h3>
                        </div>
                        <div>
                          <p className="text-gray-400">Experience</p>
                          <h3 className="text-xl font-bold mt-1 text-zinc-300">{profile?.experience || "N/A"}</h3>
                        </div>
                      </>
                    )}
                  </div>

                  <button
                    onClick={() => setIsEditing(true)}
                    className="mt-8 bg-yellow-400 text-black px-8 py-3 rounded-xl font-bold hover:scale-105 transition"
                  >
                    Edit Profile
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}