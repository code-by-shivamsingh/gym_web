export default function GallerySection() {
  const galleryImages = [
    "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1200",
    "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=1200",
    "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?q=80&w=1200",
    "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1200",
    "https://images.unsplash.com/photo-1599058917765-a780eda07a3e?q=80&w=1200",
    "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=1200",
  ];

  return (
    <section className="bg-zinc-950 text-white py-24 px-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Heading */}
        <div className="text-center mb-16">
          <span className="text-yellow-400 font-semibold">
            GALLERY
          </span>

          <h2 className="text-4xl md:text-5xl font-bold mt-4">
            Explore Our
            <span className="text-yellow-400">
              {" "}Fitness Space
            </span>
          </h2>

          <p className="text-gray-400 mt-4 max-w-2xl mx-auto">
            Take a look at our world-class equipment,
            training zones, and fitness environment.
          </p>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {galleryImages.map((image, index) => (
            <div
              key={index}
              className="overflow-hidden rounded-3xl group"
            >
              <img
                src={image}
                alt={`Gym ${index + 1}`}
                className="w-full h-80 object-cover transition duration-500 group-hover:scale-110"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}