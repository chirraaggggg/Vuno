"use client";

import { motion } from "framer-motion";
import { Download, MessageSquare, Wand2 } from "lucide-react";
import { Instrument_Serif } from "next/font/google";

const instrumentSerif = Instrument_Serif({
  weight: "400",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

const steps = [
  {
    icon: MessageSquare,
    title: "Describe your idea",
    body: "Enter a simple text prompt describing the website you want to build.",
  },
  {
    icon: Wand2,
    title: "AI builds it",
    body: "Our AI instantly creates a professional, high-fidelity page tailored to your description.",
  },
  {
    icon: Download,
    title: "Export & ship",
    body: "Get production-ready code to drop directly into your project.",
  },
];

export default function HowItWorks() {
  return (
    <section id="features" className="bg-white px-6 py-24 md:px-12">
      <div className="mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <div className="text-xs font-medium uppercase tracking-widest text-gray-400">
            HOW IT WORKS
          </div>
          <h2
            className={`${instrumentSerif.className} mt-3 text-[#0A0A0A]`}
            style={{ fontSize: 'clamp(36px, 5vw, 52px)', fontWeight: 400 }}
          >
            <span className="block leading-tight">Three steps.</span>
            <span className="block leading-tight">That is all.</span>
          </h2>
        </motion.div>

        <div className="mt-12 border-t border-gray-100" />

        <div className="grid grid-cols-1 md:grid-cols-3">
          {steps.map((step, index) => {
            const Icon = step.icon;

            return (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, ease: "easeOut", delay: index * 0.1 }}
                className="group border-r-0 px-8 pb-8 pt-10 md:border-r md:border-gray-100 last:border-r-0"
              >
                <div className="text-xs font-mono text-gray-300 mb-8">
                  0{index + 1}
                </div>
                <Icon className="h-8 w-8 text-gray-900 transition-all duration-200 group-hover:scale-110 group-hover:text-gray-600" />
                <h3
                  className="mt-6 text-lg text-gray-900"
                  style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600 }}
                >
                  {step.title}
                </h3>
                <p
                  className="mt-2 text-sm leading-relaxed text-gray-400"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  {step.body}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
