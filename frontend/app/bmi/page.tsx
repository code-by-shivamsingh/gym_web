"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Navbar from "@/src/components/organisms/Navbar";
import Footer from "@/src/components/organisms/Footer";

export default function BMIPage() {
  const [gender, setGender] = useState("male");
  const [age, setAge] = useState(25);
  const [height, setHeight] = useState(175); // cm
  const [weight, setWeight] = useState(70); // kg
  const [bmi, setBmi] = useState<number | null>(null);
  const [status, setStatus] = useState("");
  const [idealWeight, setIdealWeight] = useState("");
  const [advice, setAdvice] = useState<string[]>([]);

  const calculateBMI = (e: React.FormEvent) => {
    e.preventDefault();
    if (height <= 0 || weight <= 0) return;

    const heightM = height / 100;
    const bmiVal = parseFloat((weight / (heightM * heightM)).toFixed(1));
    setBmi(bmiVal);

    // Calculate Status & Advice
    let statusStr = "";
    let adviceList: string[] = [];
    if (bmiVal < 18.5) {
      statusStr = "Underweight";
      adviceList = [
        "Focus on calorie-dense, nutrient-rich diets.",
        "Integrate progressive overload resistance training to build muscle mass.",
        "Limit high-intensity cardio exercises to preserve energy balances."
      ];
    } else if (bmiVal >= 18.5 && bmiVal < 25) {
      statusStr = "Normal Weight";
      adviceList = [
        "Maintain current balanced diets containing clean proteins and carbs.",
        "Perform a mix of strength training and cardio sessions weekly.",
        "Prioritize solid sleep cycles and recovery periods."
      ];
    } else if (bmiVal >= 25 && bmiVal < 30) {
      statusStr = "Overweight";
      adviceList = [
        "Create a moderate calorie deficit, focusing on high protein intake.",
        "Increase active caloric burn with HIIT or strength supersets.",
        "Drink at least 3-4 liters of water daily to enhance metabolisms."
      ];
    } else {
      statusStr = "Obese";
      adviceList = [
        "Seek a professional nutritionist program to secure proper food logs.",
        "Start with low-impact cardio (swimming, walking) and light weight sessions.",
        "Avoid sugar-dense and highly processed fast foods."
      ];
    }
    setStatus(statusStr);

    // Ideal Weight Range (Devine formula estimate)
    const idealLow = Math.round(18.5 * heightM * heightM);
    const idealHigh = Math.round(24.9 * heightM * heightM);
    setIdealWeight(`${idealLow} kg - ${idealHigh} kg`);
  };

  return (
    <div className="bg-zinc-950 text-white min-h-screen flex flex-col font-sans">
      <Navbar />

      {/* Hero Banner */}
      <section className="relative h-[450px] flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center" 
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1518310383802-640c2de311b2?q=80&w=1920')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/80 to-zinc-950" />
        
        <div className="relative z-10 text-center px-6 max-w-4xl">
          <motion.span 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="px-5 py-2 rounded-full border border-yellow-400/30 bg-yellow-400/10 text-yellow-400 font-bold uppercase tracking-wider text-xs inline-block mb-6"
          >
            Body Metrics
          </motion.span>
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.8 }}
            className="text-5xl md:text-7xl font-black tracking-tight"
          >
            BMI <span className="text-yellow-400 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">Calculator</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-gray-300 mt-6 text-lg md:text-xl font-medium max-w-2xl mx-auto leading-relaxed"
          >
            Instantly measure your Body Mass Index (BMI) parameters and obtain dynamic suggestions on diet profiles and exercises.
          </motion.p>
        </div>
      </section>

      {/* Calculator Section */}
      <section className="py-24 bg-zinc-950">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-12">
          
          {/* Calculator Inputs Form */}
          <motion.div 
            initial={{ opacity: 0, x: -35 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-zinc-900 border border-zinc-800 rounded-[32px] p-8"
          >
            <h3 className="text-2xl font-black mb-6 text-white">Input Dimensions</h3>
            <form onSubmit={calculateBMI} className="space-y-6">
              
              {/* Gender */}
              <div>
                <label className="block text-gray-400 text-sm font-semibold mb-2">Gender</label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setGender("male")}
                    className={`py-3 rounded-xl font-bold border-none transition cursor-pointer text-sm ${gender === "male" ? "bg-yellow-400 text-black" : "bg-black text-gray-400 hover:text-white"}`}
                  >
                    🙋‍♂️ Male
                  </button>
                  <button
                    type="button"
                    onClick={() => setGender("female")}
                    className={`py-3 rounded-xl font-bold border-none transition cursor-pointer text-sm ${gender === "female" ? "bg-yellow-400 text-black" : "bg-black text-gray-400 hover:text-white"}`}
                  >
                    🙋‍♀️ Female
                  </button>
                </div>
              </div>

              {/* Age */}
              <div>
                <div className="flex justify-between text-gray-400 text-sm font-semibold mb-2">
                  <span>Age</span>
                  <span className="text-yellow-400">{age} Years</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="80"
                  value={age}
                  onChange={(e) => setAge(parseInt(e.target.value))}
                  className="w-full accent-yellow-400 cursor-pointer"
                />
              </div>

              {/* Height */}
              <div>
                <div className="flex justify-between text-gray-400 text-sm font-semibold mb-2">
                  <span>Height</span>
                  <span className="text-yellow-400">{height} cm</span>
                </div>
                <input
                  type="range"
                  min="120"
                  max="220"
                  value={height}
                  onChange={(e) => setHeight(parseInt(e.target.value))}
                  className="w-full accent-yellow-400 cursor-pointer"
                />
              </div>

              {/* Weight */}
              <div>
                <div className="flex justify-between text-gray-400 text-sm font-semibold mb-2">
                  <span>Weight</span>
                  <span className="text-yellow-400">{weight} kg</span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="150"
                  value={weight}
                  onChange={(e) => setWeight(parseInt(e.target.value))}
                  className="w-full accent-yellow-400 cursor-pointer"
                />
              </div>

              <button
                type="submit"
                className="w-full py-4 rounded-xl font-black bg-gradient-to-r from-yellow-400 to-orange-500 text-black shadow-lg cursor-pointer border-none text-base"
              >
                CALCULATE NOW
              </button>
            </form>
          </motion.div>

          {/* Results Panel */}
          <motion.div 
            initial={{ opacity: 0, x: 35 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex flex-col justify-center"
          >
            {bmi === null ? (
              <div className="bg-zinc-900 border border-zinc-800 rounded-[32px] p-8 text-center text-gray-400 flex flex-col justify-center h-full min-h-[300px]">
                <div className="text-5xl mb-4">📊</div>
                <h3 className="text-xl font-bold text-white mb-2">Awaiting Parameters</h3>
                <p className="text-sm max-w-xs mx-auto">Fill out your age, weight, and height and click Calculate to view your fitness profile analysis.</p>
              </div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-zinc-900 border border-zinc-800 rounded-[32px] p-8 h-full flex flex-col justify-between"
              >
                <div>
                  <h3 className="text-2xl font-black mb-6 text-white text-center md:text-left">Your BMI Result</h3>
                  <div className="flex flex-col sm:flex-row items-center gap-6 mb-6">
                    <div className="w-32 h-32 bg-yellow-400/10 rounded-full flex flex-col items-center justify-center border border-yellow-400/30">
                      <span className="text-4xl font-black text-yellow-400 leading-none">{bmi}</span>
                      <span className="text-xs text-yellow-400 font-bold mt-1">SCORE</span>
                    </div>
                    <div className="text-center sm:text-left">
                      <span className="text-gray-400 text-xs font-bold uppercase tracking-wider">Classification</span>
                      <h4 className="text-3xl font-black text-white mt-1">{status}</h4>
                      <p className="text-gray-400 text-sm mt-1">Ideal Weight for height: <span className="text-yellow-400 font-bold">{idealWeight}</span></p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-zinc-800 pt-6">
                  <h5 className="text-lg font-bold text-white mb-3">Health & Training Advice</h5>
                  <ul className="space-y-3">
                    {advice.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-sm text-gray-400 leading-relaxed">
                        <span className="text-yellow-400">✓</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </section>

      {/* BMI Chart Guide */}
      <section className="py-24 bg-zinc-900 border-t border-zinc-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-yellow-400 font-bold uppercase tracking-wider text-xs">Reference Guide</span>
            <h2 className="text-4xl md:text-5xl font-black mt-3">BMI Range Classifications</h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-zinc-950 p-6 rounded-2xl border border-zinc-800">
              <span className="text-blue-400 font-bold text-xs uppercase tracking-wider">Underweight</span>
              <h4 className="text-xl font-bold mt-1 text-white">Below 18.5</h4>
              <p className="text-gray-400 text-sm mt-2">Body mass is lower than ideal requirements. Focus on muscle building.</p>
            </div>
            <div className="bg-zinc-950 p-6 rounded-2xl border border-zinc-800 border-green-500/25">
              <span className="text-green-400 font-bold text-xs uppercase tracking-wider">Normal Range</span>
              <h4 className="text-xl font-bold mt-1 text-white">18.5 - 24.9</h4>
              <p className="text-gray-400 text-sm mt-2">Perfect weight proportion to height. Maintain healthy lifestyle.</p>
            </div>
            <div className="bg-zinc-950 p-6 rounded-2xl border border-zinc-800">
              <span className="text-orange-400 font-bold text-xs uppercase tracking-wider">Overweight</span>
              <h4 className="text-xl font-bold mt-1 text-white">25.0 - 29.9</h4>
              <p className="text-gray-400 text-sm mt-2">Moderate body mass excess. Consider cardiovascular programs.</p>
            </div>
            <div className="bg-zinc-950 p-6 rounded-2xl border border-zinc-800 border-red-500/25">
              <span className="text-red-400 font-bold text-xs uppercase tracking-wider">Obese</span>
              <h4 className="text-xl font-bold mt-1 text-white">30.0 & Above</h4>
              <p className="text-gray-400 text-sm mt-2">High proportion of fat deposits. Consultation and diet control advised.</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
