// src/app/admin/login/page.tsx
import Link from "next/link";
import { Lock, ArrowRight, AlertCircle } from "lucide-react";
import { login } from "./actions"; // Import fungsi login tadi

// Di Next.js 15, searchParams adalah Promise
export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  // Ambil pesan error dari URL jika ada
  const resolvedSearchParams = await searchParams;
  const error = resolvedSearchParams?.error;

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden selection:bg-blue-500/30">
      {/* Background Glow Effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] md:w-[40vw] h-[40vh] bg-blue-600/20 blur-[120px] rounded-full pointer-events-none z-0"></div>

      {/* Back to Home Link */}
      <Link
        href="/"
        className="absolute top-8 left-8 text-neutral-500 hover:text-white transition-colors text-sm font-medium tracking-wide flex items-center gap-2 z-20"
      >
        <span>←</span> Kembali ke Website
      </Link>

      {/* Login Card */}
      <div className="w-full max-w-[400px] bg-neutral-900/40 backdrop-blur-2xl border border-neutral-800/50 rounded-[2.5rem] p-8 md:p-10 shadow-2xl relative z-10 flex flex-col items-center">
        <div className="w-16 h-16 bg-gradient-to-b from-neutral-800 to-neutral-900 border border-neutral-700 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
          <Lock size={24} className="text-white/80" strokeWidth={1.5} />
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
            Workspace.
          </h1>
          <p className="text-neutral-400 text-sm font-light tracking-wide">
            Masuk untuk mengelola database Pixel Sticker.
          </p>
        </div>

        {/* Notifikasi Error Muncul di Sini */}
        {error && (
          <div className="w-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs px-4 py-3 rounded-xl mb-6 flex items-center gap-2">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        {/* Form Login - Sekarang menggunakan properti action={login} */}
        <form action={login} className="w-full space-y-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-neutral-500 uppercase tracking-widest pl-1">
              Email Address
            </label>
            <input
              type="email"
              name="email" // WAJIB ADA
              required
              placeholder="admin@pixelsticker.com"
              className="w-full bg-neutral-950/50 border border-neutral-800 rounded-2xl px-5 py-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all placeholder:text-neutral-700"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-neutral-500 uppercase tracking-widest pl-1">
              Password
            </label>
            <input
              type="password"
              name="password" // WAJIB ADA
              required
              placeholder="••••••••"
              className="w-full bg-neutral-950/50 border border-neutral-800 rounded-2xl px-5 py-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all placeholder:text-neutral-700"
            />
          </div>

          <button
            type="submit" // Diubah dari type="button" menjadi type="submit"
            className="w-full bg-white text-black font-semibold rounded-2xl px-5 py-4 mt-6 flex items-center justify-center gap-2 hover:bg-neutral-200 hover:scale-[1.02] active:scale-[0.98] transition-all group"
          >
            Masuk ke Sistem
            <ArrowRight
              size={18}
              className="group-hover:translate-x-1 transition-transform"
              strokeWidth={2}
            />
          </button>
        </form>
      </div>

      <div className="absolute bottom-8 text-center text-neutral-600 text-[10px] uppercase tracking-widest z-10">
        Secure Access Area
      </div>
    </div>
  );
}
