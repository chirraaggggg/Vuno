"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { generateSlugId } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { ArrowUp } from 'lucide-react';
import { Instrument_Serif } from 'next/font/google';

const instrumentSerif = Instrument_Serif({
  weight: '400',
  subsets: ['latin'],
  style: ['normal', 'italic'],
});

export default function Hero() {
  const [prompt, setPrompt] = useState("");
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push(`/login?prompt=${encodeURIComponent(prompt.trim())}`);
      return;
    }
    const slugId = generateSlugId();
    router.push(`/project/${slugId}?prompt=${encodeURIComponent(prompt.trim())}`);
  };

  return (
    <section className="bg-[#F7F7F5]">
      {/* ── NAVBAR ── */}
      <nav className="w-full bg-transparent">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between px-8 py-5">
          <Link href="/" className="flex items-center">
            <div className="flex items-center gap-2">
              <img 
                src="/vuno-logo.png" 
                alt="Vuno" 
                className="h-8 w-auto"
                style={{ minWidth: '32px' }}
              />
              <span style={{ fontFamily: 'var(--font-instrument-serif)' }} className="text-xl text-gray-900 tracking-tight">
                vuno
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-7">
            <div className="hidden items-center gap-7 md:flex">
              <a
                href="#features"
                className="text-[15px] text-gray-600 hover:text-gray-900 transition-colors"
              >
                Features
              </a>
              <a
                href="#pricing"
                className="text-[15px] text-gray-600 hover:text-gray-900 transition-colors"
              >
                Pricing
              </a>
            </div>

            {user ? (
              <button
                onClick={async () => { await supabase.auth.signOut(); window.location.href = '/' }}
                className="bg-gray-900 text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors"
              >
                Sign out
              </button>
            ) : (
              <Link
                href="/login"
                className="bg-gray-900 text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors"
              >
                Sign in
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* ── HERO CONTENT ── */}
      <div className="flex flex-col items-center text-center px-6 pt-20 pb-16">

        {/* Badge */}
        <div
          className="mb-8 inline-flex items-center rounded-full border bg-white px-[14px] py-[6px]"
          style={{ borderColor: '#E0E0E0' }}
        >
          <span className="text-[13px] text-[#666]">New: Export to HTML &amp; Next.js →</span>
        </div>

        {/* Headline */}
        <h1
          className={`${instrumentSerif.className} text-[#0A0A0A] leading-none tracking-[-0.02em]`}
          style={{ fontSize: 'clamp(52px, 8vw, 88px)', fontWeight: 400 }}
        >
          Design websites{' '}
          <span className="relative inline-block">
            <span
              className="absolute rounded-sm bg-blue-50 -z-10 skew-x-1"
              style={{ top: '8px', bottom: '4px', left: 0, right: 0 }}
            />
            <em>Fast.</em>
          </span>
        </h1>

        {/* Subtext */}
        <p
          className="mx-auto mt-4 text-[#888] leading-relaxed"
          style={{ fontSize: '16px', maxWidth: '480px', fontFamily: 'Inter, sans-serif', lineHeight: 1.6 }}
        >
          Turn any website idea into beautiful, editable pages, code exports, and Figma-ready layouts in minutes.
        </p>

        {/* Prompt Card */}
        <div
          className="mx-auto mt-8 w-full bg-white"
          style={{
            maxWidth: '680px',
            border: '1px solid #E5E5E5',
            borderRadius: '14px',
            padding: '18px 18px 14px',
            boxShadow: '0 2px 16px rgba(0,0,0,0.05)',
          }}
        >
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleGenerate();
              }
            }}
            placeholder="I'm ready to create your website. Please describe it for me"
            className="w-full resize-none border-none bg-transparent text-[#333] outline-none placeholder:text-gray-400"
            style={{ fontSize: '15px', minHeight: '56px', fontFamily: 'Inter, sans-serif' }}
          />
          <div className="mt-3 flex items-center justify-between">
            <button className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
              💡 Inspiration ▾
            </button>

            <button
              onClick={handleGenerate}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-900 text-white hover:bg-gray-800 transition-colors"
            >
              <ArrowUp className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* ── PRODUCT SCREENSHOT MOCKUP ── */}
        <div className="mt-12 w-full max-w-5xl mx-auto px-4">
          <div
            className="rounded-2xl overflow-hidden"
            style={{
              background: 'linear-gradient(160deg, #1B2D5B 0%, #0F1F42 100%)',
              padding: '24px 24px 0',
            }}
          >
            {/* Browser chrome top bar */}
            <div className="flex items-center gap-2 mb-3">
              <span className="w-3 h-3 rounded-full bg-red-400 inline-block" />
              <span className="w-3 h-3 rounded-full bg-yellow-400 inline-block" />
              <span className="w-3 h-3 rounded-full bg-green-400 inline-block" />
              <div className="flex-1 flex justify-center">
                <div className="h-6 max-w-xs w-full rounded-full bg-white/10" />
              </div>
            </div>

            {/* App UI mockup */}
            <div className="flex rounded-t-xl overflow-hidden" style={{ height: '400px' }}>
              {/* Left sidebar */}
              <div className="w-64 flex-shrink-0 bg-white/5 rounded-tl-xl p-4 flex flex-col">
                <div className="text-white font-bold text-sm mb-4">VUNO</div>
                <div className="text-white/80 text-sm mb-4 flex items-center gap-1">
                  <span>←</span>
                  <span>My Website</span>
                </div>

                {/* Chat messages */}
                <div className="flex flex-col gap-2 flex-1">
                  {/* User bubble */}
                  <div className="ml-auto max-w-[160px] rounded-2xl bg-white/20 px-3 py-2 text-xs text-white">
                    design a portfolio website
                  </div>

                  {/* AI bubble */}
                  <div className="text-white/60 text-xs leading-relaxed">
                    <span className="font-medium text-white/40 text-[10px]">Vuno · just now</span>
                    <p className="mt-0.5">All done! Your website looks great. Let me know if you want any changes.</p>
                  </div>
                </div>
              </div>

              {/* Right content area */}
              <div className="flex-1 bg-white rounded-tr-xl overflow-hidden flex flex-col">
                {/* Top tab bar */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 flex-shrink-0">
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-semibold text-gray-800">Home</span>
                    <span className="text-xs text-gray-400">About</span>
                    <span className="text-xs text-gray-400">Portfolio</span>
                  </div>
                  <button className="rounded-full bg-amber-500 px-3 py-1 text-xs font-medium text-white">
                    Export
                  </button>
                </div>

                {/* Content */}
                <div className="p-6 flex-1 overflow-auto">
                  {/* Hero mockup */}
                  <div className="rounded-xl bg-gray-900 p-6 mb-4">
                    <div className="text-lg font-bold text-white">Creative Portfolio</div>
                    <div className="mt-1 text-xs text-gray-400">Designer &amp; Developer</div>
                    <button className="mt-3 rounded-full border border-white/30 px-3 py-1 text-xs text-white">
                      View Work
                    </button>
                  </div>

                  {/* Two cards */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-lg bg-gray-50 p-3 flex items-center gap-2">
                      <div className="w-6 h-6 rounded bg-violet-200 flex-shrink-0" />
                      <span className="text-xs text-gray-600">Project 1</span>
                    </div>
                    <div className="rounded-lg bg-gray-50 p-3 flex items-center gap-2">
                      <div className="w-6 h-6 rounded bg-blue-200 flex-shrink-0" />
                      <span className="text-xs text-gray-600">Project 2</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
