// src/app/harga/page.tsx
import { createClient } from "@/utils/supabase/server";
import PriceCalculator from "@/app/components/PriceCalculator";

export default async function HargaPage() {
  // 1. Inisialisasi Supabase Client
  const supabase = await createClient();

  // 2. Ambil data dari Supabase secara paralel (biar cepet)
  // Kita ambil 'error' nya juga buat jaga-jaga kalau koneksi bermasalah
  const { data: materials, error: materialError } = await supabase
    .from("materials")
    .select("*")
    .order("name");

  const { data: cars, error: carError } = await supabase
    .from("cars")
    .select("*")
    .order("brand");

  // 3. DEBUGGING: Cek di Terminal VS Code kamu (Bukan di Inspect Element Browser)
  // Ini penting banget buat tau datanya masuk atau nggak
  console.log("=== DEBUG SUPABASE DATA ===");
  console.log("Materials:", materials);
  console.log("Cars:", cars);

  if (materialError || carError) {
    console.error("Supabase Error Materials:", materialError?.message);
    console.error("Supabase Error Cars:", carError?.message);
  }

  return (
    <main className="min-h-screen bg-black flex flex-col items-center pt-24 px-6">
      {/* Background Glow (Biar makin Apple-look) */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-64 bg-blue-500/10 blur-[120px] rounded-full"></div>
      </div>

      {/* Header */}
      <div className="relative z-10 text-center mb-16">
        <h1 className="text-6xl md:text-8xl font-bold text-white tracking-tighter mb-4 bg-gradient-to-b from-white to-neutral-500 bg-clip-text text-transparent">
          Pricelist.
        </h1>
        <p className="text-neutral-400 text-lg max-w-md mx-auto">
          Hitung kebutuhan stiker untuk mobil kesayanganmu secara instan.
        </p>
      </div>

      {/* 4. Tampilkan error di UI kalau datanya gagal ditarik */}
      {materialError || carError ? (
        <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl text-red-400 text-sm">
          Ada masalah koneksi ke database. Cek API Key atau tabel Supabase kamu.
        </div>
      ) : (
        <PriceCalculator materials={materials || []} cars={cars || []} />
      )}

      {/* Footer info */}
      <p className="relative z-10 mt-10 text-[10px] text-neutral-600 uppercase tracking-[0.2em] font-medium">
        Harga belum termasuk biaya jasa pemasangan
      </p>
    </main>
  );
}
