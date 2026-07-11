"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Instrument_Serif } from "next/font/google";

const instrumentSerif = Instrument_Serif({
  weight: "400",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

export default function Footer() {
  return (
    <footer className="bg-white">
      {/* CTA section */}
      <div className="px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative mx-auto max-w-4xl overflow-hidden rounded-2xl bg-[#0A0A0A]"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-0"
            style={{
              background:
                "radial-gradient(ellipse at 60% 50%, rgba(59,130,246,0.06) 0%, transparent 70%)",
            }}
          />

          <div className="relative z-10 px-8 py-16 text-center">
            <h2
              className={`${instrumentSerif.className} text-white`}
              style={{ fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: 400 }}
            >
              Design your next site.
            </h2>
            <p
              className="mt-3 text-base text-gray-400"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              From prompt to production-ready. In seconds.
            </p>
            <Link
              href="/login"
              className="mt-8 inline-block rounded-full bg-white px-6 py-3 text-sm font-medium text-gray-900 transition-colors hover:bg-gray-100"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Start creating →
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Footer links */}
      <div className="mx-auto mt-4 max-w-6xl border-t border-gray-100 px-6 pt-12 pb-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div>
            <div
              className="text-base font-semibold text-gray-900"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Vuno
            </div>
            <p className="mt-2 text-xs text-gray-400" style={{ fontFamily: 'Inter, sans-serif' }}>
              © 2026 Vuno. All rights reserved.
            </p>
            <Link
              href="https://x.com/chiragdotxyz"
              target="_blank"
              rel="noreferrer"
              className="mt-1 inline-block text-xs text-gray-400 transition-colors hover:text-gray-700"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Made with ❤️ by Chirag Sharma
            </Link>
          </div>

          <div>
            <div
              className="text-xs font-semibold uppercase tracking-wider text-gray-900"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Product
            </div>
            <div className="mt-4 flex flex-col gap-2 text-sm text-gray-400" style={{ fontFamily: 'Inter, sans-serif' }}>
              <a href="#features" className="transition-colors hover:text-gray-700">Features</a>
              <a href="#pricing" className="transition-colors hover:text-gray-700">Pricing</a>
              <a href="#faq" className="transition-colors hover:text-gray-700">Changelog</a>
            </div>
          </div>

          <div>
            <div
              className="text-xs font-semibold uppercase tracking-wider text-gray-900"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Company
            </div>
            <div className="mt-4 flex flex-col gap-2 text-sm text-gray-400" style={{ fontFamily: 'Inter, sans-serif' }}>
              <a href="#" className="transition-colors hover:text-gray-700">About</a>
              <a href="#" className="transition-colors hover:text-gray-700">Blog</a>
              <a href="#" className="transition-colors hover:text-gray-700">Contact</a>
            </div>
          </div>

          <div>
            <div
              className="text-xs font-semibold uppercase tracking-wider text-gray-900"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Legal
            </div>
            <div className="mt-4 flex flex-col gap-2 text-sm text-gray-400" style={{ fontFamily: 'Inter, sans-serif' }}>
              <a href="#" className="transition-colors hover:text-gray-700">Terms of Service</a>
              <a href="#" className="transition-colors hover:text-gray-700">Privacy Policy</a>
              <a href="#" className="transition-colors hover:text-gray-700">Delete Account</a>
            </div>
          </div>
        </div>
      </div>

      {/* Watermark */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1, delay: 0.2 }}
        className="overflow-hidden select-none pointer-events-none"
      >
        <div className="translate-y-4 text-center text-[clamp(80px,18vw,220px)] font-bold tracking-tighter text-gray-100 leading-none" style={{ fontFamily: 'Inter, sans-serif' }}>
          Vuno
        </div>
      </motion.div>
    </footer>
  );
}
