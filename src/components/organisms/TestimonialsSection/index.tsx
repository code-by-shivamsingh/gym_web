export default function TestimonialsSection() {
  const testimonials = [
    {
      name: "Rahul Sharma",
      review:
        "I lost 12kg in just 4 months. The trainers and workout plans are amazing!",
      image:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=500",
    },
    {
      name: "Priya Verma",
      review:
        "The nutrition guidance and personal coaching helped me transform my lifestyle.",
      image:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=500",
    },
    {
      name: "Aman Singh",
      review:
        "Best gym experience ever. Modern equipment and highly professional trainers.",
      image:
        "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=500",
    },
  ];

  return (
    <section className="bg-black text-white py-24 px-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Heading */}
        <div className="text-center mb-16">
          <span className="text-yellow-400 font-semibold">
            TESTIMONIALS
          </span>

          <h2 className="text-4xl md:text-5xl font-bold mt-4">
            What Our
            <span className="text-yellow-400">
              {" "}Members Say
            </span>
          </h2>

          <p className="text-gray-400 mt-4 max-w-2xl mx-auto">
            Real stories from members who transformed their fitness journey with us.
          </p>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((item, index) => (
            <div
              key={index}
              className="bg-zinc-900 p-8 rounded-3xl border border-zinc-800 hover:border-yellow-400 transition"
            >
              <div className="flex items-center gap-4 mb-6">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-16 h-16 rounded-full object-cover"
                />

                <div>
                  <h3 className="font-bold text-lg">
                    {item.name}
                  </h3>

                  <p className="text-yellow-400">
                    ⭐⭐⭐⭐⭐
                  </p>
                </div>
              </div>

              <p className="text-gray-400 leading-7">
                "{item.review}"
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}