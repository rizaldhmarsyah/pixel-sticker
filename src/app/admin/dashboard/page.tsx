import { createClient } from "@/utils/supabase/server";
import {
  Database,
  Car,
  Plus,
  User,
  DollarSign,
  CalendarClock,
  ArrowUpRight,
  Clock,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";

// Memastikan angka statistik dashboard selalu riil terpantau tanpa cache
export const revalidate = 0;

export default async function AdminDashboard() {
  const supabase = await createClient();

  // 1. Tarik Jumlah Varian Bahan
  const { count: materialCount } = await supabase
    .from("materials")
    .select("*", { count: "exact", head: true });

  // 2. Tarik Jumlah Jenis Model Mobil
  const { count: carCount } = await supabase
    .from("cars")
    .select("*", { count: "exact", head: true });

  // 3. Tarik Jumlah Antrean Booking Masuk (Status Pending)
  const { count: pendingBookingCount } = await supabase
    .from("bookings")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending");

  // 4. Ambil 5 Rekaman Aktivitas Booking Terbaru untuk Mengisi Komponen Feed Activity
  const { data: recentBookings } = await supabase
    .from("bookings")
    .select(
      "id_bookings, full_name, car_model, total_price, status, created_at",
    )
    .order("created_at", { ascending: false })
    .limit(5);

  // 5. Hitung Akumulasi Total Pemasukan Riil (Bookings Selesai + Nota Toko Bukan KAS_KELUAR)
  const { data: bookingsIncome } = await supabase
    .from("bookings")
    .select("total_price")
    .eq("status", "selesai");
  const { data: receiptsIncome } = await supabase
    .from("receipts")
    .select("total_amount")
    .neq("customer_name", "KAS_KELUAR");

  const totalMasukBookings = (bookingsIncome || []).reduce(
    (acc, curr) => acc + (curr.total_price || 0),
    0,
  );
  const totalMasukReceipts = (receiptsIncome || []).reduce(
    (acc, curr) => acc + (curr.total_amount || 0),
    0,
  );
  const akumulasiTotalPemasukan = totalMasukBookings + totalMasukReceipts;

  return (
    <div className="p-6 md:p-10 relative bg-neutral-50 min-h-screen font-sans text-left">
      {/* HEADER SECTION */}
      <header className="flex justify-between items-center mb-10 border-b border-neutral-200 pb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-neutral-900 uppercase">
            Ringkasan Eksekutif Sistem
          </h1>
          <p className="text-xs text-neutral-500 font-medium mt-1">
            Selamat datang kembali, Manajer Kendali Workshop Pixel Sticker.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex flex-col text-right">
            <span className="text-xs font-black text-neutral-800 uppercase">
              Admin Workshop
            </span>
            <span className="text-[10px] text-green-600 font-bold flex items-center gap-1 justify-end">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>{" "}
              Online
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-white border border-neutral-200 flex items-center justify-center shadow-sm">
            <User size={18} className="text-neutral-500" />
          </div>
        </div>
      </header>

      {/* RANCANGAN 4 UTAMA KARTU ARUS DATA STATISTIK */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10 text-neutral-900">
        {/* KARTU 1: TOTAL OMZET WORKSHOP */}
        <div className="bg-white border border-neutral-200 p-6 rounded-[2rem] shadow-sm relative overflow-hidden group hover:border-emerald-500/30 transition-all duration-300">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
              <DollarSign size={20} />
            </div>
            <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">
              Revenue
            </span>
          </div>
          <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
            Total Pemasukan Kas
          </p>
          <h2 className="text-xl font-black tracking-tight text-neutral-900 mt-1">
            Rp {akumulasiTotalPemasukan.toLocaleString("id-ID")}
          </h2>
        </div>

        {/* KARTU 2: ANTRIAN RESERVASI */}
        <div className="bg-white border border-neutral-200 p-6 rounded-[2rem] shadow-sm relative overflow-hidden group hover:border-amber-500/30 transition-all duration-300">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
              <CalendarClock size={20} />
            </div>
            <span className="text-[9px] font-black text-amber-600 uppercase tracking-widest">
              Queue
            </span>
          </div>
          <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
            Booking Pending
          </p>
          <h2 className="text-xl font-black tracking-tight text-neutral-900 mt-1">
            {pendingBookingCount || 0} Unit Mobil
          </h2>
        </div>

        {/* KARTU 3: DATA MASTER MATERIALS */}
        <div className="bg-white border border-neutral-200 p-6 rounded-[2rem] shadow-sm relative overflow-hidden group hover:border-blue-500/30 transition-all duration-300">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
              <Database size={20} />
            </div>
            <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest">
              Gudang
            </span>
          </div>
          <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
            Varian Vynil Aktif
          </p>
          <h2 className="text-xl font-black tracking-tight text-neutral-900 mt-1">
            {materialCount || 0} Kategori
          </h2>
        </div>

        {/* KARTU 4: DATA MASTER CARS */}
        <div className="bg-white border border-neutral-200 p-6 rounded-[2rem] shadow-sm relative overflow-hidden group hover:border-purple-500/30 transition-all duration-300">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl">
              <Car size={20} />
            </div>
            <span className="text-[9px] font-black text-purple-600 uppercase tracking-widest">
              Dimensi
            </span>
          </div>
          <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
            Database Tipe Mobil
          </p>
          <h2 className="text-xl font-black tracking-tight text-neutral-900 mt-1">
            {carCount || 0} Model Bodi
          </h2>
        </div>
      </div>

      {/* RANCANGAN LAYOUT TENGAH: SHORTCUT PANEL & LIVE ACTIVITY STREAM */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-10 items-start">
        {/* PANEL A: PINTASAN MENU / SHORTCUT NAVIGATION (4 COLUMNS) */}
        <div className="lg:col-span-4 space-y-4">
          <h3 className="text-xs font-black uppercase text-neutral-400 tracking-wider">
            Aksi Cepat Menu Utama
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <Link
              href="/admin/dashboard/nota"
              className="bg-neutral-900 text-white p-5 rounded-3xl flex flex-col justify-between hover:bg-neutral-800 transition-all shadow-md group h-32"
            >
              <div className="flex justify-between items-start">
                <div className="p-2 bg-white/10 rounded-xl">
                  <Plus size={16} />
                </div>
                <ArrowUpRight
                  size={14}
                  className="opacity-40 group-hover:opacity-100 transition-opacity"
                />
              </div>
              <span className="text-xs font-bold leading-tight uppercase">
                Buka Kasir
                <br />
                Buat Nota
              </span>
            </Link>

            <Link
              href="/admin/dashboard/laporan"
              className="bg-white border border-neutral-200 text-neutral-900 p-5 rounded-3xl flex flex-col justify-between hover:border-neutral-400 transition-all shadow-sm group h-32"
            >
              <div className="flex justify-between items-start">
                <div className="p-2 bg-neutral-100 rounded-xl text-neutral-700">
                  <TrendingUp size={16} />
                </div>
                <ArrowUpRight
                  size={14}
                  className="opacity-40 group-hover:opacity-100 text-neutral-500 transition-opacity"
                />
              </div>
              <span className="text-xs font-bold leading-tight text-neutral-800 uppercase">
                Analisis
                <br />
                Laporan Omzet
              </span>
            </Link>
          </div>

          <div className="p-4 bg-blue-600 text-white rounded-3xl shadow-sm space-y-2 flex items-center justify-between gap-4">
            <div className="space-y-1">
              <h4 className="text-xs font-black uppercase tracking-wide">
                Mode Penjualan Aman
              </h4>
              <p className="text-[10px] text-blue-100 font-light leading-relaxed">
                Seluruh relasi modifikasi data stok bergulir riil dan
                terenkripsi menggunakan arsitektur Supabase SSL.
              </p>
            </div>
            <ShieldCheck size={40} className="text-blue-400 shrink-0" />
          </div>
        </div>

        {/* PANEL B: REKAM JEJAK LOG AKTIVITAS RESERVASI TERBARU (8 COLUMNS) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-black uppercase text-neutral-400 tracking-wider">
              Log Antrean Riwayat Masuk Terbaru
            </h3>
            <Link
              href="/admin/dashboard/booking"
              className="text-[10px] font-black uppercase text-blue-600 hover:text-blue-700 flex items-center gap-0.5"
            >
              Kelola Semua <ChevronRight size={12} />
            </Link>
          </div>

          <div className="bg-white border border-neutral-200 rounded-[2rem] shadow-sm overflow-hidden p-4 md:p-6">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-neutral-200 text-neutral-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="pb-3 font-semibold">Nama Pelanggan</th>
                    <th className="pb-3 font-semibold">Model Mobil</th>
                    <th className="pb-3 font-semibold">Status Pengerjaan</th>
                    <th className="pb-3 text-right font-semibold">
                      Total Biaya
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 font-medium text-neutral-800">
                  {!recentBookings || recentBookings.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="pt-6 text-center text-neutral-400 font-light italic"
                      >
                        Belum ada rekaman order masuk pada database.
                      </td>
                    </tr>
                  ) : (
                    recentBookings.map((rb) => (
                      <tr
                        key={rb.id_bookings}
                        className="hover:bg-neutral-50/60 transition-colors"
                      >
                        <td className="py-3.5 font-bold text-neutral-900 uppercase">
                          {rb.full_name}
                        </td>
                        <td className="py-3.5 text-neutral-500 font-mono">
                          {rb.car_model || "-"}
                        </td>
                        <td className="py-3.5">
                          <span
                            className={`px-2 py-0.5 text-[9px] font-extrabold uppercase rounded border ${
                              rb.status === "selesai"
                                ? "bg-green-50 text-green-600 border-green-200"
                                : rb.status === "proses"
                                  ? "bg-blue-50 text-blue-600 border-blue-200"
                                  : "bg-amber-50 text-amber-600 border-amber-200"
                            }`}
                          >
                            {rb.status}
                          </span>
                        </td>
                        <td className="py-3.5 text-right font-black font-mono text-neutral-900">
                          Rp {(rb.total_price || 0).toLocaleString("id-ID")}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER PENGENCANG INFORMASI */}
      <footer className="p-6 bg-white border border-neutral-200 rounded-[1.5rem] text-center shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-neutral-400 text-[9px] tracking-[0.3em] uppercase font-semibold">
          Sistem Informasi Manajemen Otomotif &copy; 2026
        </p>
        <div className="flex items-center gap-1.5 text-[10px] font-bold text-neutral-400 uppercase font-mono">
          <Clock size={12} />
          <span>Sync Status: Sukses Terintegrasi</span>
        </div>
      </footer>
    </div>
  );
}
