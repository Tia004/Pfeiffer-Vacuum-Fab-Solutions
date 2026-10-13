import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pfeiffer Vacuum+Fab Solutions — Ultra-High Vacuum Engineering",
  description:
    "Pioneering turbomolecular vacuum pumps, active 5-axis magnetic levitation, and molecular diagnostics for semiconductor EUV lithography, CERN, and aerospace simulation.",
  keywords: [
    "Pfeiffer Vacuum",
    "Turbomolecular Pump",
    "Ultra-High Vacuum",
    "UHV",
    "Semiconductor Fab Solutions",
    "HiPace",
    "HiScroll",
    "Magnetic Levitation",
    "CERN Vacuum Systems",
  ],
  authors: [{ name: "Pfeiffer Vacuum Technology AG" }],
};

export const viewport: Viewport = {
  themeColor: "#070708",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="it"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-[#070708] text-[#f2f2f4] font-sans selection:bg-[#ff3b1d] selection:text-black">
        {children}
      </body>
    </html>
  );
}
