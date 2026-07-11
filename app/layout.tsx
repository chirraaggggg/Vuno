import type { Metadata } from "next";
import { Inter } from 'next/font/google';
import { Instrument_Serif } from 'next/font/google';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { SupabaseProvider } from "@/components/auth";
import { QueryProvider } from "@/components/query-provider";

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const instrumentSerif = Instrument_Serif({ weight: '400', subsets: ['latin'], style: ['normal', 'italic'], variable: '--font-instrument-serif' });

export const metadata: Metadata = {
  title: "Vuno — Design websites with AI",
  description: "Describe your site. Get a production-ready page in seconds.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${instrumentSerif.variable}`} suppressHydrationWarning>
      <body className="bg-white text-slate-900 antialiased font-sans">
        <SupabaseProvider>
          <QueryProvider>
            <NuqsAdapter>
              <ThemeProvider
                attribute="class"
                defaultTheme="light"
                enableSystem={false}
                disableTransitionOnChange
              >
                <TooltipProvider>
                  {children}

                  <Toaster richColors />
                </TooltipProvider>
              </ThemeProvider>

            </NuqsAdapter>
          </QueryProvider>
        </SupabaseProvider>
      </body>
    </html>
  );
}
