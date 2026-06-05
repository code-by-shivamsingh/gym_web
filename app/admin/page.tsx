"use client";

import { useEffect, useState } from "react";
import AddMemberDialog from "@/src/components/organisms/AddMemberDialog";
import AdminLayout from "@/src/components/organisms/AdminLayout";
import { getAllMembers } from "@/src/dialogs/invoice_config/services";

export default function AdminDashboard() {
const [openDialog, setOpenDialog] = useState(false);

const [members, setMembers] = useState<any[]>([]);

const handleAddMember = (newMember: any) => {
setMembers((prev) => [
newMember,
...prev,
]);
};
const fetchMembers = async () => {
  try {
    const response = await getAllMembers();

    if (response.success) {
      setMembers(response.data);
    }
  } catch (error) {
    console.log(error);
  }
};
useEffect(() => {
  fetchMembers();
}, []);
return ( <AdminLayout> <div className="text-white">

```
    {/* Header */}
    <div className="flex justify-between items-center mb-8">
      <div>
        <h1 className="text-5xl font-bold">
          Admin Dashboard
        </h1>

        <p className="text-gray-400 mt-2">
          Welcome back, Gym Owner 👋
        </p>
      </div>

      <button
        onClick={() => setOpenDialog(true)}
        className="bg-yellow-400 text-black px-6 py-3 rounded-xl font-bold hover:scale-105 transition"
      >
        + Add Member
      </button>
    </div>

    {/* Stats */}
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">

      <div className="bg-black p-6 rounded-3xl border border-zinc-800">
        <h2 className="text-4xl font-bold text-yellow-400">
          {members.length}
        </h2>

        <p className="text-gray-400 mt-2">
          Total Members
        </p>
      </div>

      <div className="bg-black p-6 rounded-3xl border border-zinc-800">
        <h2 className="text-4xl font-bold text-green-400">
          ₹5,00,000
        </h2>

        <p className="text-gray-400 mt-2">
          Monthly Revenue
        </p>
      </div>

      <div className="bg-black p-6 rounded-3xl border border-zinc-800">
        <h2 className="text-4xl font-bold text-blue-400">
          15
        </h2>

        <p className="text-gray-400 mt-2">
          Trainers
        </p>
      </div>

      <div className="bg-black p-6 rounded-3xl border border-zinc-800">
        <h2 className="text-4xl font-bold text-red-400">
          92%
        </h2>

        <p className="text-gray-400 mt-2">
          Attendance Rate
        </p>
      </div>

    </div>

    {/* Revenue */}
    <div className="bg-black border border-zinc-800 rounded-3xl p-8 mb-8">

      <h2 className="text-2xl font-bold mb-4">
        Revenue Overview
      </h2>

      <div className="w-full bg-zinc-800 rounded-full h-5">
        <div
          className="bg-green-500 h-5 rounded-full"
          style={{ width: "75%" }}
        />
      </div>

      <p className="mt-4 text-gray-400">
        Monthly Target: ₹7,00,000
      </p>

    </div>

    {/* Recent Members */}
    <div className="bg-black border border-zinc-800 rounded-3xl p-8">

      <h2 className="text-2xl font-bold mb-6">
        Recent Members
      </h2>

      <div className="overflow-x-auto">

        <table className="w-full">

          <thead>
            <tr className="border-b border-zinc-800">
              <th className="text-left py-4">Name</th>
              <th className="text-left py-4">Plan</th>
              <th className="text-left py-4">Status</th>
            </tr>
          </thead>

          <tbody>

            {members.map((member, index) => (
              <tr
                key={index}
                className="border-b border-zinc-900 hover:bg-zinc-900 transition"
              >
                <td className="py-4">
                  {member.name}
                </td>

                <td className="py-4">
                  {member.plan}
                </td>

                <td className="py-4">
                  <span
                    className={`px-4 py-2 rounded-full ${
                      member.status === "Active"
                        ? "bg-green-500/20 text-green-400"
                        : "bg-red-500/20 text-red-400"
                    }`}
                  >
                    {member.status}
                  </span>
                </td>
              </tr>
            ))}

          </tbody>

        </table>

      </div>

    </div>

  </div>

  <AddMemberDialog
    open={openDialog}
    onClose={() => setOpenDialog(false)}
    onAddMember={handleAddMember}
  />
</AdminLayout>


);
}
