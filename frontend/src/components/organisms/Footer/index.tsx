import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-zinc-950 text-white border-t border-zinc-800">
      <div className="max-w-7xl mx-auto px-6 py-16">

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Logo & About */}
          <div>
            <h2 className="text-3xl font-bold text-yellow-400">
              FORGE
            </h2>

            <p className="text-gray-400 mt-4 leading-7">
              Transform your body, build strength, and achieve
              your fitness goals with expert trainers and
              world-class equipment.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-bold mb-5">
              Quick Links
            </h3>

            <ul className="space-y-3 text-gray-400">
              <li>
                <Link href="/">Home</Link>
              </li>

              <li>
                <Link href="/about">About</Link>
              </li>

              <li>
                <Link href="/services">Services</Link>
              </li>

              <li>
                <Link href="/membership">Membership</Link>
              </li>

              <li>
                <Link href="/contact">Contact</Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-xl font-bold mb-5">
              Services
            </h3>

            <ul className="space-y-3 text-gray-400">
              <li>Personal Training</li>
              <li>Weight Loss</li>
              <li>Body Building</li>
              <li>Nutrition Plans</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-xl font-bold mb-5">
              Contact
            </h3>

            <ul className="space-y-3 text-gray-400">
              <li>📍 Gwalior, Madhya Pradesh, India</li>
              <li>📞 +91 98765 43210</li>
              <li>📧 info@forgefitness.com</li>
            </ul>
          </div>

        </div>

        {/* Bottom Footer */}
        <div className="border-t border-zinc-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">

          <p className="text-gray-500 text-sm">
            © 2026 FORGE Fitness. All rights reserved.
          </p>

          <div className="flex gap-6 mt-4 md:mt-0">

            <a
              href="#"
              className="text-gray-400 hover:text-yellow-400 transition"
            >
              Instagram
            </a>

            <a
              href="#"
              className="text-gray-400 hover:text-yellow-400 transition"
            >
              Facebook
            </a>

            <a
              href="#"
              className="text-gray-400 hover:text-yellow-400 transition"
            >
              YouTube
            </a>

          </div>
        </div>

      </div>
    </footer>
  );
}