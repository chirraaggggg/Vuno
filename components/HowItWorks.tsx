import { Download, MessageSquare, Wand2 } from "lucide-react";

const steps = [
  {
    icon: MessageSquare,
    title: "Describe your idea",
    body: "Enter a simple text prompt describing the website you want to build.",
  },
  {
    icon: Wand2,
    title: "AI generates your site",
    body: "Our AI instantly creates a professional, high-fidelity page tailored to your description.",
  },
  {
    icon: Download,
    title: "Export code & ship",
    body: "Get production-ready code to drop directly into your project.",
  },
];

export default function HowItWorks() {
  return (
    <section className="bg-white px-6 py-24 md:px-12">
      <div className="mx-auto max-w-6xl">
        <div className="relative overflow-hidden rounded-[2rem] bg-white px-6 py-16 sm:px-10 lg:px-16">
          <div
            aria-hidden="true"
            className="absolute inset-0 opacity-60"
            style={{
              backgroundImage:
                "radial-gradient(circle, rgba(156, 163, 175, 0.35) 1px, transparent 1px)",
              backgroundSize: "18px 18px",
              backgroundPosition: "0 0",
            }}
          />
          <div className="relative z-10 mx-auto max-w-3xl text-center">
            <h2 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
              Three steps. That is all.
            </h2>
            <p className="mt-4 text-base text-gray-600 sm:text-lg">
              Turn your prompt into a production-ready website in seconds.
            </p>
          </div>
        </div>

        <div className="mt-8 grid overflow-hidden rounded-[2rem] md:grid-cols-3 md:divide-x md:divide-gray-200">
          {steps.map((step) => {
            const Icon = step.icon;

            return (
              <div key={step.title} className="bg-white px-6 py-12 sm:px-10 lg:px-12 lg:py-16">
                <div className="flex flex-col items-start text-left">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gray-100 text-slate-900">
                    <Icon className="h-6 w-6" strokeWidth={1.8} />
                  </div>
                  <h3 className="mt-6 text-xl font-semibold tracking-tight text-slate-900">
                    {step.title}
                  </h3>
                  <p className="mt-3 max-w-sm text-base leading-7 text-gray-600">
                    {step.body}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
