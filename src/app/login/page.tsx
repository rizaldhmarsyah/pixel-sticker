"use client";

import React, { useState } from "react";
import { ChevronLeft, Loader2, ShieldCheck, Sparkles } from "lucide-react";
import Link from "next/link";
import { FcGoogle } from "react-icons/fc";
import { createClient } from "@/utils/supabase/client";

export default function LoginPage() {
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const supabase = createClient();

  // --- HANDLER LOGIN GOOGLE OAUTH ---
  const handleGoogleLogin = async () => {
    setIsLoggingIn(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          // Otomatis diarahkan kembali ke halaman booking setelah sukses login
          redirectTo: `${window.location.origin}/booking`,
        },
      });

      if (error) throw error;
    } catch (err: any) {
      console.error("Gagal inisiasi Google Login:", err.message);
      alert("Gagal terhubung ke Google: " + err.message);
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-center items-center px-4 select-none relative overflow-hidden">
      {/* Sorot Lampu Studio Elegan di Background */}
      <div className="absolute w-[350px] h-[350px] bg-blue-600/5 rounded-full blur-[140px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

      <div className="w-full max-w-sm relative z-10">
        {/* Tombol Kembali ke Beranda */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-white transition-all mb-8 group"
        >
          <ChevronLeft
            size={14}
            className="group-hover:-translate-x-0.5 transition-transform"
          />
          <span>Kembali ke Beranda</span>
        </Link>

        {/* --- CARD UTAMA LOGIN (WARNA BG SOLID AGAR KONTRAS & MUDAH DIBACA) --- */}
        <div className="bg-neutral-900 border border-white/10 p-8 rounded-[2.5rem] shadow-2xl text-center relative overflow-hidden">
          {/* Garis Aksen Desain Atas */}
          <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-blue-500/40 to-transparent" />

          {/* Ikon Header */}
          <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4 text-blue-400">
            <ShieldCheck size={24} />
          </div>

          <h2 className="text-xl font-black uppercase tracking-tight text-white">
            Pixel Gate
          </h2>
          <p className="text-xs text-neutral-200 font-normal mt-2 mb-8 px-4 leading-relaxed">
            Satu akses aman terverifikasi untuk mengelola profil dan slot
            booking workshop kamu.
          </p>

          {/* --- TOMBOL SAKTI GOOGLE OAUTH --- */}
          <button
            type="button"
            disabled={isLoggingIn}
            onClick={handleGoogleLogin}
            className="w-full bg-white text-black hover:bg-neutral-200 disabled:opacity-50 font-bold py-4 px-6 rounded-xl text-xs uppercase tracking-widest transition-all active:scale-[0.97] flex items-center justify-center gap-3 shadow-xl shadow-white/5 disabled:cursor-not-allowed"
          >
            {isLoggingIn ? (
              <>
                <Loader2 size={16} className="animate-spin text-blue-600" />
                <span className="text-neutral-600">Menghubungkan...</span>
              </>
            ) : (
              <>
                <FcGoogle size={18} className="shrink-0" />
                <span>Masuk Dengan Google</span>
              </>
            )}
          </button>

          {/* Info Tambahan di Bawah */}
          <div className="mt-8 flex items-center justify-center gap-1.5 text-[10px] text-neutral-400 font-mono uppercase tracking-wider">
            <Sparkles size={10} className="text-blue-400/70" />
            <span>Verified by Google OAuth 2.0</span>
          </div>
        </div>

        <p className="text-[9px] text-neutral-700 text-center mt-6 font-mono uppercase tracking-widest">
          Pixel Sticker Studio © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
