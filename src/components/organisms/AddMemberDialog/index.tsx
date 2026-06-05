"use client";

import { createMember, updateMember } from "@/src/dialogs/invoice_config/services";
import { useState, useEffect } from "react";
interface Props {
  open: boolean;
  onClose: () => void;
  onAddMember: (member: any) => void;
  selectedMember?: any;
}

export default function AddMemberDialog({
  open,
  onClose,
  onAddMember,
  selectedMember,
}: Props) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    plan: "Basic",
  });
useEffect(() => {
  if (selectedMember) {
    setFormData({
      name: selectedMember.name || "",
      email: selectedMember.email || "",
      mobile: selectedMember.mobile || "",
      plan: selectedMember.plan || "Basic",
    });
  }
}, [selectedMember]);
 const handleSave = async () => {
  try {
    if (!formData.name) {
      alert("Please enter member name");
      return;
    }

    let response;

    if (selectedMember?._id) {
      response = await updateMember(
        selectedMember._id,
        formData
      );
    } else {
      response = await createMember(formData);
    }

    if (response.success) {
      onAddMember(response.data);

      setFormData({
        name: "",
        email: "",
        mobile: "",
        plan: "Basic",
      });

      onClose();

      alert(
        selectedMember
          ? "Member Updated Successfully"
          : "Member Added Successfully"
      );
    }
  } catch (error) {
    console.log(error);
    alert("Operation Failed");
  }
};

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-zinc-900 w-full max-w-xl p-8 rounded-3xl border border-zinc-700">

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-white">
            {selectedMember ? "Edit Member" : "Add Member"}
          </h2>

          <button
            onClick={onClose}
            className="text-red-400 text-2xl"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">

          <input
            type="text"
            placeholder="Full Name"
            className="w-full bg-black border border-zinc-700 p-3 rounded-xl text-white"
            value={formData.name}
            onChange={(e) =>
              setFormData({
                ...formData,
                name: e.target.value,
              })
            }
          />

          <input
            type="email"
            placeholder="Email"
            className="w-full bg-black border border-zinc-700 p-3 rounded-xl text-white"
            value={formData.email}
            onChange={(e) =>
              setFormData({
                ...formData,
                email: e.target.value,
              })
            }
          />

          <input
            type="text"
            placeholder="Mobile Number"
            className="w-full bg-black border border-zinc-700 p-3 rounded-xl text-white"
            value={formData.mobile}
            onChange={(e) =>
              setFormData({
                ...formData,
                mobile: e.target.value,
              })
            }
          />

          <select
            className="w-full bg-black border border-zinc-700 p-3 rounded-xl text-white"
            value={formData.plan}
            onChange={(e) =>
              setFormData({
                ...formData,
                plan: e.target.value,
              })
            }
          >
            <option>Basic</option>
            <option>Premium</option>
            <option>Elite</option>
          </select>

          <button
  onClick={handleSave}
  className="w-full bg-yellow-400 text-black py-3 rounded-xl font-bold hover:scale-105 transition"
>
  {selectedMember ? "Update Member" : "Save Member"}
</button>

        </div>

      </div>
    </div>
  );
}