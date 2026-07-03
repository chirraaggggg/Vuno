import type { Metadata } from "next";
import { GeistSans } from 'geist/font/sans';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { SupabaseProvider } from "@/components/auth";
import { QueryProvider } from "@/components/query-provider";

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
    <html lang="en" className={GeistSans.className} suppressHydrationWarning>
      <body className="bg-white text-slate-900 antialiased">
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
