"use client";

import { useState } from "react";

export default function FAQSection() {
  const [open, setOpen] = useState<number | null>(0);

  const faqs = [
    {
      question: "What are your gym timings?",
      answer:
        "We are open from 5:00 AM to 11:00 PM, 7 days a week.",
    },
    {
      question: "Do you provide personal trainers?",
      answer:
        "Yes, Premium and Elite memberships include certified personal trainers.",
    },
    {
      question: "Do I get a diet plan?",
      answer:
        "Yes, Premium and Elite members receive customized diet plans.",
    },
    {
      question: "Is there a free trial available?",
      answer:
        "Yes, new members can enjoy a free one-day trial workout session.",
    },
    {
      question: "Do you have locker facilities?",
      answer:
        "Yes, secure locker facilities are available for all members.",
    },
  ];

  return (
    <section
      id="faq"
      className="py-28 bg-zinc-950 text-white"
    >
      <div className="max-w-4xl mx-auto px-6">

        <div className="text-center mb-16">
          <span className="text-yellow-400 font-semibold">
            FAQ
          </span>

          <h2 className="text-5xl font-black mt-4">
            Frequently Asked
            <span className="text-yellow-400"> Questions</span>
          </h2>
        </div>

        <div className="space-y-5">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="
              border border-yellow-400/20
              rounded-2xl
              bg-white/5
              overflow-hidden
              "
            >
              <button
                onClick={() =>
                  setOpen(open === index ? null : index)
                }
                className="
                w-full
                flex
                justify-between
                items-center
                p-6
                text-left
                font-bold
                "
              >
                {faq.question}

                <span className="text-yellow-400 text-2xl">
                  {open === index ? "−" : "+"}
                </span>
              </button>

              {open === index && (
                <div className="px-6 pb-6 text-gray-300">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}