import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "@/index.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Rakshak AI Learn — Next-Gen AI Education Platform",
  description:
    "Multilingual. Offline. Intelligent. Experience an adaptive-grade AI education platform designed for the next generation.",
  keywords: ["AI", "education", "learning", "multilingual", "offline", "adaptive"],
};

import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col font-sans antialiased">
        <ThemeProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
