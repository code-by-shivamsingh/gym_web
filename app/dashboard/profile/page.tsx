import DashboardLayout from "@/src/components/organisms/DashboardLayout";

export default function ProfilePage() {
  const user = {
    name: "ritu singh",
    email: "ritusingh@gmail.com",
    membership: "Premium",
    joinDate: "01 Jan 2026",
    profileImage:
      "https://lh3.googleusercontent.com/a/ACg8ocLli9ZojYsIV0nEHzO6CkeCDlz5MWKuiB0yiTV2vT4J-yvmNbE=s400-c",
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto">

        <h1 className="text-4xl font-bold mb-8">
          My Profile
        </h1>

        <div className="bg-black rounded-3xl p-8 border border-zinc-800">

          <div className="flex flex-col md:flex-row gap-8 items-center">

            {/* Profile Image */}
            <img
              src={user.profileImage}
              alt={user.name}
              className="w-40 h-40 rounded-full object-cover border-4 border-yellow-400"
            />

            {/* User Info */}
            <div className="flex-1">

              <div className="grid md:grid-cols-2 gap-6">

                <div>
                  <p className="text-gray-400">
                    Full Name
                  </p>

                  <h3 className="text-xl font-bold">
                    {user.name}
                  </h3>
                </div>

                <div>
                  <p className="text-gray-400">
                    Email
                  </p>

                  <h3 className="text-xl font-bold">
                    {user.email}
                  </h3>
                </div>

                <div>
                  <p className="text-gray-400">
                    Membership
                  </p>

                  <h3 className="text-xl font-bold text-yellow-400">
                    {user.membership}
                  </h3>
                </div>

                <div>
                  <p className="text-gray-400">
                    Join Date
                  </p>

                  <h3 className="text-xl font-bold">
                    {user.joinDate}
                  </h3>
                </div>

              </div>

              <button className="mt-8 bg-yellow-400 text-black px-8 py-3 rounded-xl font-bold hover:scale-105 transition">
                Edit Profile
              </button>

            </div>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}