export default function ContactSection() {
  return (
<section
  id="contact"
  className="scroll-mt-24 py-24 px-6"
>      <div className="max-w-7xl mx-auto">

        {/* Heading */}
        <div className="text-center mb-16">
          <span className="text-yellow-400 font-semibold">
            CONTACT US
          </span>

          <h2 className="text-4xl md:text-5xl font-bold mt-4">
            Get In
            <span className="text-yellow-400"> Touch</span>
          </h2>

          <p className="text-gray-400 mt-4 max-w-2xl mx-auto">
            Have questions about memberships, training programs,
            or fitness goals? Reach out to us today.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">

          {/* Left Side */}
          <div className="bg-zinc-900 p-8 rounded-3xl border border-zinc-800">

            <h3 className="text-3xl font-bold mb-8">
              Contact Information
            </h3>

            <div className="space-y-6">

              <div>
                <h4 className="text-yellow-400 font-semibold">
                  📍 Address
                </h4>
                <p className="text-gray-400">
                  Airport Rd, near SBI Bank, Shubhanjalipuram, Maharajpura, Gwalior, Madhya Pradesh 474002, India
                </p>
              </div>

              <div>
                <h4 className="text-yellow-400 font-semibold">
                  📞 Phone
                </h4>
                <p className="text-gray-400">
                  +91 98765 43210
                </p>
              </div>

              <div>
                <h4 className="text-yellow-400 font-semibold">
                  📧 Email
                </h4>
                <p className="text-gray-400">
                  info@forgefitness.com
                </p>
              </div>

              <div>
                <h4 className="text-yellow-400 font-semibold">
                  🕒 Working Hours
                </h4>
                <p className="text-gray-400">
                  Monday - Sunday
                </p>
                <p className="text-gray-400">
                  5:00 AM - 11:00 PM
                </p>
              </div>

            </div>
          </div>

          {/* Right Side */}
          <div className="bg-zinc-900 p-8 rounded-3xl border border-zinc-800">

            <form className="space-y-5">

              <div>
               <input
  type="text"
   placeholder="Your Name"
  className="w-full bg-zinc-900 text-white border border-zinc-700 px-4 py-3 rounded-xl"
/>
              </div>

              <div>
               <input
  type="email"
  placeholder="Your Email"
  className="w-full p-4 rounded-xl bg-black text-white placeholder:text-gray-400 border border-zinc-700 outline-none focus:border-yellow-400"
/>
              </div>

              <div>
                <input
  type="tel"
  placeholder="Phone Number"
  className="w-full p-4 rounded-xl bg-black text-white placeholder:text-gray-400 border border-zinc-700 outline-none focus:border-yellow-400"
/>
              </div>

              <div>
                <textarea
  rows={5}
  placeholder="Your Message"
  className="w-full p-4 rounded-xl bg-black text-white placeholder:text-gray-400 border border-zinc-700 outline-none focus:border-yellow-400"
/>
              </div>

              <button
                type="submit"
                className="w-full bg-yellow-400 text-black py-4 rounded-xl font-bold hover:scale-105 transition"
              >
                Send Message
              </button>

            </form>
          </div>

        </div>
      </div>
    </section>
  );
}