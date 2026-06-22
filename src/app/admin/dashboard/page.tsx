// src/app/admin/dashboard/page.tsx
import { createClient } from "@/utils/supabase/server";
import { Database, Car, Plus, User } from "lucide-react";
import Link from "next/link";

// Memastikan angka statistik selalu update
export const revalidate = 0;

export default async function AdminDashboard() {
  const supabase = await createClient();

  // Ambil data statistik dari Supabase
  const { count: materialCount } = await supabase
    .from("materials")
    .select("*", { count: "exact", head: true });

  const { count: carCount } = await supabase
    .from("cars")
    .select("*", { count: "exact", head: true });

  return (
    <div className="p-10 relative bg-neutral-50 min-h-screen">
      {/* Header Section */}
      <header className="flex justify-between items-center mb-12 border-b border-neutral-200 pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1 text-neutral-900">
            Ringkasan Sistem
          </h1>
          <p className="text-neutral-500 font-light">
            Selamat datang kembali, Admin.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-white border border-neutral-200 flex items-center justify-center shadow-sm">
            <User size={20} className="text-neutral-500" />
          </div>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12 text-neutral-900">
        {/* Card Bahan - Mengubah bg gelap menjadi putih murni dengan teks gelap */}
        <div className="bg-white border border-neutral-200 p-8 rounded-[2rem] shadow-sm group hover:border-blue-500/30 transition-all duration-500">
          <div className="flex justify-between items-start mb-6">
            <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-600">
              <Database size={24} />
            </div>
            <span className="text-xs font-bold text-blue-600/70 uppercase tracking-widest">
              Materials
            </span>
          </div>
          <h2 className="text-4xl font-bold tracking-tighter mb-1 text-neutral-900">
            {materialCount || 0}
          </h2>
          <p className="text-neutral-500 text-sm">Total varian bahan aktif</p>
        </div>

        {/* Card Mobil - Mengubah bg gelap menjadi putih murni dengan teks gelap */}
        <div className="bg-white border border-neutral-200 p-8 rounded-[2rem] shadow-sm group hover:border-purple-500/30 transition-all duration-500">
          <div className="flex justify-between items-start mb-6">
            <div className="p-3 bg-purple-500/10 rounded-2xl text-purple-600">
              <Car size={24} />
            </div>
            <span className="text-xs font-bold text-purple-600/70 uppercase tracking-widest">
              Cars
            </span>
          </div>
          <h2 className="text-4xl font-bold tracking-tighter mb-1 text-neutral-900">
            {carCount || 0}
          </h2>
          <p className="text-neutral-500 text-sm">Tipe mobil terdaftar</p>
        </div>

        {/* Card Shortcut - Tetap putih kontras tinggi dengan penyesuaian bayangan */}
        <Link
          href="/admin/dashboard/materials"
          className="bg-neutral-900 text-white p-8 rounded-[2rem] flex flex-col justify-between hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-xl shadow-neutral-900/10"
        >
          <div className="flex justify-end">
            <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center">
              <Plus size={24} />
            </div>
          </div>
          <div>
            <h3 className="text-xl font-bold tracking-tight leading-tight">
              Input Data <br /> Baru
            </h3>
          </div>
        </Link>
      </div>

      {/* Footer info */}
      <div className="p-8 bg-white border border-neutral-200 rounded-[2rem] text-center shadow-sm">
        <p className="text-neutral-400 text-[10px] tracking-[0.4em] uppercase font-medium">
          Sistem Database Pixel Sticker &copy; 2026
        </p>
      </div>
    </div>
  );
}
