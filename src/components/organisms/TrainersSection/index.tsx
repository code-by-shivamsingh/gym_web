export default function TrainersSection() {
  const trainers = [
    {
      name: "John Carter",
      specialization: "Strength Training",
      experience: "8 Years Experience",
      image:
        "https://images.unsplash.com/photo-1567013127542-490d757e51fc?q=80&w=800",
    },
    {
      name: "Sarah Wilson",
      specialization: "Weight Loss Coach",
      experience: "6 Years Experience",
      image:
        "https://images.unsplash.com/photo-1594737625785-a6cbdabd333c?q=80&w=800",
    },
    {
      name: "Mike Johnson",
      specialization: "Bodybuilding Expert",
      experience: "10 Years Experience",
      image:
        "https://images.unsplash.com/photo-1550345332-09e3ac987658?q=80&w=800",
    },
  ];

  return (
<section
  id="trainers"
  className="scroll-mt-24 bg-black text-white py-24 px-6"
>      <div className="max-w-7xl mx-auto">
        
        {/* Heading */}
        <div className="text-center mb-16">
          <span className="text-yellow-400 font-semibold">
            OUR TRAINERS
          </span>

          <h2 className="text-4xl md:text-5xl font-bold mt-4">
            Meet Our
            <span className="text-yellow-400">
              {" "}Fitness Experts
            </span>
          </h2>

          <p className="text-gray-400 mt-4 max-w-2xl mx-auto">
            Our certified trainers help members achieve
            their fitness goals with personalized guidance.
          </p>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {trainers.map((trainer, index) => (
            <div
              key={index}
              className="bg-zinc-900 rounded-3xl overflow-hidden border border-zinc-800 hover:border-yellow-400 transition duration-300"
            >
              <img
                src={trainer.image}
                alt={trainer.name}
                className="w-full h-80 object-cover"
              />

              <div className="p-6">
                <h3 className="text-2xl font-bold">
                  {trainer.name}
                </h3>

                <p className="text-yellow-400 mt-2">
                  {trainer.specialization}
                </p>

                <p className="text-gray-400 mt-3">
                  {trainer.experience}
                </p>

                <button className="mt-6 w-full bg-yellow-400 text-black py-3 rounded-xl font-semibold hover:scale-105 transition">
                  View Profile
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}