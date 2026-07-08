export default function AboutSection() {
  return (
<section
  id="about"
  className="scroll-mt-24 bg-zinc-950 text-white py-24 px-6"
>      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
        {/* Left Side */}
        <div>
          <span className="text-yellow-400 font-semibold">
            ABOUT US
          </span>

          <h2 className="text-4xl md:text-5xl font-bold mt-4 mb-6">
            We Help You Build
            <span className="text-yellow-400"> Strength</span>,
            Confidence & Discipline
          </h2>

          <p className="text-gray-400 leading-8 mb-6">
            Our gym is designed for people who want real
            results. Whether your goal is weight loss,
            muscle gain, strength training, or overall
            fitness, our expert trainers and modern
            equipment help you reach your full potential.
          </p>

          <div className="grid grid-cols-2 gap-6 mt-8">
            <div>
              <h3 className="text-3xl font-bold text-yellow-400">
                500+
              </h3>
              <p className="text-gray-400">Happy Members</p>
            </div>

            <div>
              <h3 className="text-3xl font-bold text-yellow-400">
                20+
              </h3>
              <p className="text-gray-400">Expert Trainers</p>
            </div>

            <div>
              <h3 className="text-3xl font-bold text-yellow-400">
                10+
              </h3>
              <p className="text-gray-400">Years Experience</p>
            </div>

            <div>
              <h3 className="text-3xl font-bold text-yellow-400">
                24/7
              </h3>
              <p className="text-gray-400">Support</p>
            </div>
          </div>
        </div>

        {/* Right Side */}
        <div>
          <img
           src="/images/about-gym.jpg"
            alt="Gym"
            className="rounded-3xl w-full h-[500px] object-cover"
          />
        </div>
      </div>
    </section>
  );
}