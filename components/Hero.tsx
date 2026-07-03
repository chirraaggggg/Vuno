"use client";

import { useState } from "react";
import Link from "next/link";

export default function Hero() {
  const [prompt, setPrompt] = useState("");

  return (
    <section className="relative min-h-screen overflow-hidden bg-black">
      <div className="absolute inset-0">
        <img
          src="/hero-bg.jpg"
          alt=""
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50" />
      </div>

      <nav className="absolute left-0 right-0 top-0 z-50 bg-transparent">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-8 py-5">
          <Link href="/" className="flex items-center">
            <img
              src="/vuno-logo.png"
              alt="Vuno"
              className="h-25 w-auto"
              style={{ filter: "brightness(0) invert(1)" }}
            />
          </Link>

          <div className="hidden items-center gap-8 md:flex">
            <a href="#features" className="text-sm font-medium text-white/70 transition-colors duration-200 hover:text-white">
              Features
            </a>
            <a href="#examples" className="text-sm font-medium text-white/70 transition-colors duration-200 hover:text-white">
              Examples
            </a>
            <a href="#pricing" className="text-sm font-medium text-white/70 transition-colors duration-200 hover:text-white">
              Pricing
            </a>
            <a href="#faq" className="text-sm font-medium text-white/70 transition-colors duration-200 hover:text-white">
              FAQ
            </a>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-white/70 transition-colors hover:text-white">
              Log in
            </Link>
            <Link href="/signup" className="rounded-full bg-white px-5 py-2.5 text-sm font-medium text-gray-900 shadow-sm transition-colors hover:bg-white/90">
              Sign up
            </Link>
          </div>
        </div>
      </nav>

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 pt-24 text-center">
        <h1 className="whitespace-pre-line text-5xl font-bold leading-tight tracking-tight text-white md:text-7xl">
          Design websites{"\n"}
          <span className="italic">in seconds.</span>
        </h1>

        <p className="mx-auto mt-5 max-w-lg text-base text-white/60 md:text-lg">
          Describe what you want. Vuno handles the design, code, and everything in between.
        </p>

        <div className="mx-auto mt-10 w-full max-w-xl rounded-2xl bg-white p-2 shadow-2xl">
          <div className="flex items-center gap-2 px-3">
            <input
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="A clean portfolio for a product designer…"
              className="flex-1 border-none bg-transparent py-3 text-sm text-gray-700 outline-none placeholder:text-gray-400"
            />
            <button className="flex-shrink-0 rounded-xl bg-gray-900 px-5 py-2.5 text-sm text-white transition-colors hover:bg-gray-700">
              Generate →
            </button>
          </div>
        </div>

        <p className="mt-4 text-xs text-white/40">No credit card needed · 5 free generations</p>
      </div>
    </section>
  );
}
