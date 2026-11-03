import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ScrollProgress from "@/components/ScrollProgress";
import CursorGlow from "@/components/CursorGlow";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "MarsChain — Beyond Bitcoin",
  description:
    "MarsChain is the next generation of decentralized value. Built for what comes after Bitcoin.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="antialiased bg-black text-white">
        <div className="starfield" />
        <div className="grid-overlay" />
        <ScrollProgress />
        <CursorGlow />
        <div className="relative z-10">{children}</div>
      </body>
    </html>
  );
}