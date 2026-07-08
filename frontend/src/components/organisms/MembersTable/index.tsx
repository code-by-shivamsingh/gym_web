"use client";

import { useState } from "react";

interface Member {
  _id: string;
  name: string;
  email: string;
  mobile: string;
  plan: string;
  status: string;
  createdAt: string;
}

interface Props {
  members: Member[];
  onDelete: (id: string) => void;
  onEdit: (member: Member) => void;
}

export default function MembersTable({
  members,
  onDelete,
  onEdit,
}: Props) {

  const [selectedMember, setSelectedMember] =
  useState<Member | null>(null);
const [search, setSearch] = useState("");
console.log("members =>", members);
const handleEdit = (member: Member) => {
  setSelectedMember(member);
  onEdit(member);
};
  return (
    <div className="bg-black border border-zinc-800 rounded-3xl p-6">

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">
          Members List
        </h2>

      <input
  type="text"
  placeholder="Search Member..."
  value={search}
  onChange={(e) => setSearch(e.target.value)}
  className="bg-zinc-900 border border-zinc-700 px-4 py-3 rounded-xl text-white"
/>
      </div>

      <div className="overflow-x-auto">

        <table className="w-full text-white">

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

         {members
  .filter((member) =>
    member.name.toLowerCase().includes(search.toLowerCase())
  )
  .map((member: any) => (
  <tr
    key={member._id}
    className="border-b border-zinc-900 hover:bg-zinc-900"
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
      onClick={() => onDelete(member._id)}
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
  );
}