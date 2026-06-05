export default function JoinPage() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      <div className="w-full max-w-2xl bg-zinc-900 p-8 rounded-2xl shadow-xl">
        <h1 className="text-4xl font-bold text-center mb-2 text-yellow-400">
          Join Our Gym
        </h1>

        <p className="text-center text-gray-400 mb-8">
          Start your fitness journey today
        </p>

        <form className="space-y-5">
          <input
            type="text"
            placeholder="Full Name"
            className="w-full p-4 rounded-lg bg-zinc-800 border border-zinc-700"
          />

          <input
            type="email"
            placeholder="Email Address"
            className="w-full p-4 rounded-lg bg-zinc-800 border border-zinc-700"
          />

          <input
            type="tel"
            placeholder="Phone Number"
            className="w-full p-4 rounded-lg bg-zinc-800 border border-zinc-700"
          />

          <select className="w-full p-4 rounded-lg bg-zinc-800 border border-zinc-700">
            <option>Select Membership</option>
            <option>Basic Plan</option>
            <option>Premium Plan</option>
            <option>Elite Plan</option>
          </select>

          <button
            type="submit"
            className="w-full bg-yellow-500 text-black py-4 rounded-lg font-bold hover:scale-105 transition"
          >
            Join Now
          </button>
        </form>
      </div>
    </div>
  );
}