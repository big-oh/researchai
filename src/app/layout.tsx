import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "ResearchAI - AI-Powered Research Paper Generator",
  description: "Generate publication-ready IEEE research papers in minutes using advanced AI. Professional academic writing made simple.",
  keywords: ["AI", "research", "IEEE", "paper", "generator", "academic", "writing"],
  authors: [{ name: "ResearchAI" }],
  openGraph: {
    title: "ResearchAI - AI-Powered Research Paper Generator",
    description: "Generate publication-ready IEEE research papers in minutes using advanced AI.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`scroll-smooth ${inter.variable}`}>
      <body className="bg-[var(--bg-primary)] text-[var(--text-primary)] antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
