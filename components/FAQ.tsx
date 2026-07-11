"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { Plus } from "lucide-react";
import { Instrument_Serif } from "next/font/google";

const instrumentSerif = Instrument_Serif({
  weight: "400",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

const faqs = [
  {
    q: "How does the AI generation work?",
    a: "You describe the site in plain language. Vuno turns that prompt into a full, styled web page — layout, type, color, and copy — not just a wireframe.",
  },
  {
    q: "Can I export to code?",
    a: "Yes. Export as a ready-to-run Next.js project, hand it to Claude or Codex for further development, or send the layers to Figma for design handoff.",
  },
  {
    q: "Can I use designs commercially?",
    a: "All plans include full commercial usage rights for anything you generate.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes, from your billing settings. You'll keep access through the end of your current billing period.",
  },
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="bg-white px-6 py-24 md:px-12">
      <div className="mx-auto max-w-2xl">
        <span className="text-sm font-medium text-gray-400 uppercase tracking-widest" style={{ fontFamily: 'Inter, sans-serif' }}>FAQ</span>
        <h2
          className={`${instrumentSerif.className} mt-3 text-[#0A0A0A]`}
          style={{ fontSize: 'clamp(36px, 5vw, 52px)', fontWeight: 400 }}
        >
          Questions answered.
        </h2>

        <div className="mt-10">
          {faqs.map((faq, i) => (
            <motion.div
              key={faq.q}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, ease: "easeOut", delay: i * 0.08 }}
              className="border-b border-gray-100 py-5 last:border-b-0"
            >
              <button
                type="button"
                onClick={() => setOpen(open === i ? null : i)}
                className="flex w-full items-center justify-between text-left"
              >
                <span
                  className="pr-4 text-lg text-gray-900"
                  style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}
                >
                  {faq.q}
                </span>
                <Plus
                  className={`h-5 w-5 shrink-0 text-gray-400 transition-transform duration-200 ${
                    open === i ? "rotate-45" : ""
                  }`}
                />
              </button>
              <div
                className={`grid overflow-hidden transition-all duration-300 ${
                  open === i ? "grid-rows-[1fr] pt-4" : "grid-rows-[0fr] pt-0"
                }`}
              >
                <div className="overflow-hidden">
                  <p
                    className="text-[15px] leading-relaxed text-gray-400"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    {faq.a}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
