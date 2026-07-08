"use client";
import AddMemberDialog from "@/src/components/organisms/AddMemberDialog";
import AdminLayout from "@/src/components/organisms/AdminLayout";
import { deleteMember, getMembers } from "@/src/dialogs/invoice_config/services";
import { useEffect, useState } from "react";

export default function MembersPage() {
  
const [members, setMembers] = useState<any[]>([]);
const [openDialog, setOpenDialog] = useState(false);
const [selectedMember, setSelectedMember] = useState<any>(null);
const [search, setSearch] = useState("");
useEffect(() => {
  fetchMembers();
}, []);

const fetchMembers = async () => {
  try {
    const res = await getMembers();

    if (res.success) {
      setMembers(res.data);
    }
  } catch (error) {
    console.log(error);
  }
};
const filteredMembers = members.filter((member) =>
  member.name?.toLowerCase().includes(search.toLowerCase())
);
const handleDelete = async (id: string) => {
  try {
    await deleteMember(id);

    setMembers((prev) =>
      prev.filter((member) => member._id !== id)
    );

    alert("Member Deleted Successfully");
  } catch (error) {
    console.log(error);
  }
};
const handleEdit = (member: any) => {
  setSelectedMember(member);
  setOpenDialog(true);
};
  return (
    <AdminLayout>
      <div className="text-white p-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold">
              Members Management
            </h1>

            <p className="text-gray-400 mt-2">
              Manage all gym members from one place.
            </p>
          </div>

         <button
  onClick={() => setOpenDialog(true)}
  className="bg-yellow-400 text-black px-6 py-3 rounded-xl font-bold"
>
  + Add Member
</button>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">

          <div className="bg-black border border-zinc-800 rounded-3xl p-6">
            <h2 className="text-4xl font-bold text-yellow-400">
              250
            </h2>

            <p className="text-gray-400 mt-2">
              Total Members
            </p>
          </div>

          <div className="bg-black border border-zinc-800 rounded-3xl p-6">
            <h2 className="text-4xl font-bold text-green-400">
              220
            </h2>

            <p className="text-gray-400 mt-2">
              Active Members
            </p>
          </div>

          <div className="bg-black border border-zinc-800 rounded-3xl p-6">
            <h2 className="text-4xl font-bold text-red-400">
              30
            </h2>

            <p className="text-gray-400 mt-2">
              Expired Members
            </p>
          </div>

        </div>

        {/* Members Table */}
        <div className="bg-black border border-zinc-800 rounded-3xl p-6">

          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">
              Members List
            </h2>

            <input
  type="text"
  placeholder="Search Member..."
  value={search}
  onChange={(e) => setSearch(e.target.value)}
  className="bg-zinc-900 border border-zinc-700 px-4 py-3 rounded-xl outline-none"
/>
          </div>

          <div className="overflow-x-auto">

            <table className="w-full">

              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left py-4">Name</th>
                  <th className="text-left py-4">Plan</th>
                  <th className="text-left py-4">Status</th>
                  <th className="text-left py-4">Join Date</th>
                  <th className="text-left py-4">Actions</th>
                </tr>
              </thead>

              <tbody>

                {filteredMembers.map((member) => (
  <tr
    key={member._id}
    className="border-b border-zinc-900 hover:bg-zinc-900 transition"
  >
    <td className="py-4">{member.name}</td>

    <td className="py-4">{member.plan}</td>

    <td className="py-4">
      <span
        className={`px-4 py-2 rounded-full text-sm ${
          member.status === "Active"
            ? "bg-green-500/20 text-green-400"
            : "bg-red-500/20 text-red-400"
        }`}
      >
        {member.status}
      </span>
    </td>

    <td className="py-4">
      {new Date(member.createdAt).toLocaleDateString()}
    </td>

    <td className="py-4">
      <div className="flex gap-2">
       <button
  onClick={() => handleEdit(member)}
  className="bg-blue-500 px-4 py-2 rounded-lg"
>
  Edit
</button>

        <button
          onClick={() => handleDelete(member._id)}
          className="bg-red-500 px-4 py-2 rounded-lg"
        >
          Delete
        </button>
      </div>
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
  onClose={() => {
    setOpenDialog(false);
    setSelectedMember(null);
  }}
  onAddMember={fetchMembers}
  selectedMember={selectedMember}
/>
    </AdminLayout>
    
  );
} 