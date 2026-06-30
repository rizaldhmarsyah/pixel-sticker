import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";
import ChatAI from "./components/ChatAi";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pixel Sticker - Precision Protection",
  description:
    "Penyedia layanan proteksi dan sticker bodi mobil premium dengan pemotongan presisi dan pengalaman lebih dari 10 tahun.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} font-sans h-full antialiased bg-neutral-950 text-white`}
    >
      <body className="min-h-full flex flex-col">
        <Navbar />
        <main className="flex-1">{children}</main>
        <ChatAI />
      </body>
    </html>
  );
}
