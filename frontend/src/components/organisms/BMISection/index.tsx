"use client";

import { useState } from "react";

export default function BMISection() {
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [bmi, setBmi] = useState<number | null>(null);
  const [status, setStatus] = useState("");
  const [healthyRange, setHealthyRange] = useState("");
const [recommendation, setRecommendation] = useState("");
const [bodyFat, setBodyFat] = useState("");
  

  const calculateBMI = () => {
  if (!height || !weight) return;

  const h = Number(height) / 100;
  const w = Number(weight);

  const bmiResult = w / (h * h);
  const finalBMI = Number(bmiResult.toFixed(1));

  setBmi(finalBMI);

  let bmiStatus = "";
  let advice = "";

  if (bmiResult < 18.5) {
    bmiStatus = "Underweight";
    advice =
      "Increase calories and focus on strength training.";
  } else if (bmiResult < 25) {
    bmiStatus = "Normal Weight";
    advice =
      "Perfect! Continue your current lifestyle.";
  } else if (bmiResult < 30) {
    bmiStatus = "Overweight";
    advice =
      "Add cardio sessions and improve nutrition.";
  } else {
    bmiStatus = "Obese";
    advice =
      "Start a weight-loss program with professional guidance.";
  }

  setStatus(bmiStatus);
  setRecommendation(advice);

  const minWeight = (
    18.5 *
    h *
    h
  ).toFixed(1);

  const maxWeight = (
    24.9 *
    h *
    h
  ).toFixed(1);

  setHealthyRange(`${minWeight}kg - ${maxWeight}kg`);

  const bodyFatEstimate =
    bmiResult * 1.2 - 5.4;

  setBodyFat(bodyFatEstimate.toFixed(1));
};

  return (
    <section
      id="bmi"
      className="py-28 bg-black text-white"
    >
      <div className="max-w-5xl mx-auto px-6">

        <div className="text-center mb-16">
          <span className="text-yellow-400 font-semibold">
            BMI CALCULATOR
          </span>

          <h2 className="text-5xl font-black mt-4">
            Check Your
            <span className="text-yellow-400">
              {" "}BMI
            </span>
          </h2>

          <p className="text-gray-400 mt-4">
            Calculate your Body Mass Index instantly
          </p>
        </div>

        <div
          className="
          max-w-2xl
          mx-auto
          bg-white/5
          backdrop-blur-xl
          border border-yellow-400/20
          rounded-[32px]
          p-8
          "
        >
          <div className="grid md:grid-cols-2 gap-5">

          <input
  type="number"
  placeholder="Weight (kg)"
  value={weight}
  onChange={(e) => setWeight(e.target.value)}
  className="
  w-full
  p-4
  rounded-xl
  bg-zinc-900
  border border-zinc-700
  text-white
  placeholder:text-gray-500
  outline-none
  focus:border-yellow-400
  "
/>

           <input
  type="number"
  placeholder="Height (cm)"
  value={height}
  onChange={(e) => setHeight(e.target.value)}
  className="
  w-full
  p-4
  rounded-xl
  bg-zinc-900
  border border-zinc-700
  text-white
  placeholder:text-gray-500
  outline-none
  focus:border-yellow-400
  "
/>

          </div>

          <button
            onClick={calculateBMI}
            className="
            w-full
            mt-6
            py-4
            rounded-xl
            font-bold
            bg-gradient-to-r
            from-yellow-400
            to-orange-500
            text-black
            "
          >
            Calculate BMI
          </button>

         {bmi && (
  <div
    className="
    mt-8
    rounded-3xl
    border border-yellow-400/20
    bg-gradient-to-b
    from-yellow-500/10
    to-orange-500/5
    p-8
    "
  >
    <div className="text-center">

      <h3 className="text-6xl font-black text-yellow-400">
        {bmi}
      </h3>

      <p
        className={`
        mt-2 text-2xl font-bold
        ${
          status === "Normal Weight"
            ? "text-green-400"
            : status === "Overweight"
            ? "text-orange-400"
            : status === "Obese"
            ? "text-red-400"
            : "text-blue-400"
        }
        `}
      >
        {status}
      </p>

      <div className="mt-6">
        <div className="w-full h-4 bg-zinc-800 rounded-full overflow-hidden">
          <div
            className="
            h-full
            bg-gradient-to-r
            from-green-400
            via-yellow-400
            to-red-500
            "
            style={{
              width: `${Math.min((bmi / 40) * 100, 100)}%`,
            }}
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mt-8">

        <div className="p-5 rounded-2xl bg-black/30">
          <p className="text-gray-400">
            Healthy Weight Range
          </p>

          <h4 className="text-yellow-400 text-2xl font-bold mt-2">
            {healthyRange}
          </h4>
        </div>

        <div className="p-5 rounded-2xl bg-black/30">
          <p className="text-gray-400">
            Estimated Body Fat
          </p>

          <h4 className="text-yellow-400 text-2xl font-bold mt-2">
            {bodyFat}%
          </h4>
        </div>

      </div>

      <div className="mt-6 p-5 rounded-2xl bg-yellow-400/10 border border-yellow-400/20">
        <h4 className="font-bold text-yellow-400">
          Fitness Recommendation
        </h4>

        <p className="text-gray-300 mt-2">
          {recommendation}
        </p>
      </div>

      <button
        className="
        mt-6
        px-8
        py-4
        rounded-2xl
        font-black
        bg-gradient-to-r
        from-yellow-400
        via-orange-500
        to-red-500
        text-black
        "
      >
        🚀 Get Personalized Plan
      </button>

    </div>
  </div>
)}
        </div>

      </div>
    </section>
  );
}