
import Link from "next/link";

export default function HeroSection() {
  return (
<section
  id="home"
  className="relative min-h-screen pt-24 overflow-hidden"
>      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1920')",
        }}
      />
      <div className="absolute top-20 left-20 h-72 w-72 rounded-full bg-yellow-500/20 blur-[150px]" />

<div className="absolute bottom-20 right-20 h-72 w-72 rounded-full bg-orange-500/20 blur-[150px]" />

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/75" />

      {/* Content */}
    <div className="relative z-10 flex min-h-screen items-center">
  <div className="mx-auto max-w-7xl px-6 lg:px-12">

```
<div className="max-w-4xl">

  <span className="inline-flex items-center gap-2 mb-6 rounded-full border border-yellow-500/50 bg-yellow-500/10 px-5 py-2 text-sm text-yellow-400 backdrop-blur-md">
    🔥 India's Premium Fitness Experience
  </span>

  <h1 className="text-white text-6xl md:text-8xl font-extrabold leading-none">
  TRANSFORM

  <span className="block text-yellow-400">
    YOUR BODY
  </span>

  <span className="block text-white">
    YOUR LIFE
  </span>
</h1>

  <p className="mt-8 text-xl text-gray-300 max-w-2xl leading-8">
    Join FORGE GYM and unlock your strongest version with
    expert trainers, personalized workout plans, premium
    equipment, nutrition guidance, and a fitness community
    that pushes you beyond limits.
  </p>

  <div className="flex flex-wrap gap-5 mt-10">

    <Link
      href="/join"
      className="bg-yellow-400 text-black px-10 py-5 rounded-2xl font-bold text-lg hover:scale-105 transition shadow-xl shadow-yellow-400/30"
    >
      🚀 Start Your Journey
    </Link>

    <Link
      href="/pricing"
      className="border border-white/30 backdrop-blur-md px-10 py-5 rounded-2xl font-bold text-lg hover:bg-white hover:text-black transition"
    >
      💳 View Membership Plans
    </Link>

  </div>

  <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mt-16">

    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6">
      <h2 className="text-4xl font-bold text-yellow-400">
        500+
      </h2>
      <p className="text-gray-400 mt-2">
        Members
      </p>
    </div>

    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6">
      <h2 className="text-4xl font-bold text-yellow-400">
        20+
      </h2>
      <p className="text-gray-400 mt-2">
        Trainers
      </p>
    </div>

    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6">
      <h2 className="text-4xl font-bold text-yellow-400">
        10+
      </h2>
      <p className="text-gray-400 mt-2">
        Years
      </p>
    </div>

    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6">
      <h2 className="text-4xl font-bold text-yellow-400">
        24/7
      </h2>
      <p className="text-gray-400 mt-2">
        Support
      </p>
    </div>

  </div>

</div>
```

  </div>
</div>

    </section>
  );
}
