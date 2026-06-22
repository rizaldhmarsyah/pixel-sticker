"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Plus,
  Car,
  ChevronLeft,
  CheckCircle2,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { addCar } from "./actions";
import CarRow from "./CarRow";

export default function CarsPage() {
  const formRef = useRef<HTMLFormElement>(null);
  const supabase = createClient();

  // --- STATE MANAGEMENT ---
  const [cars, setCars] = useState<any[]>([]);
  const [loadingPage, setLoadingPage] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // --- FUNGSI REFRESH DATA SINKRONISASI ---
  const refreshData = async () => {
    try {
      const { data, error } = await supabase
        .from("cars")
        .select("*")
        .order("brand", { ascending: true });

      if (error) {
        console.error("Gagal fetch data mobil:", error.message);
      } else if (data) {
        setCars(data);
      }
    } catch (err) {
      console.error("Sistem error fetch data:", err);
    } finally {
      setLoadingPage(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  // Otomatis tutup pop-up setelah 4 detik jika didiamkan
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // --- LOGIKA SUBMIT FORM INTERAKTIF ---
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setNotification(null);

    const formData = new FormData(e.currentTarget);

    try {
      // Jalankan Server Action bawaan kamu
      await addCar(formData);

      // 1. Set Notifikasi Pop-up Berhasil
      setNotification({
        type: "success",
        message: "Mobil baru berhasil didaftarkan ke database!",
      });

      // 2. Auto-reset Form (Kolom input otomatis kosong kembali)
      formRef.current?.reset();

      // 3. Langsung refresh isi tabel kanan secara real-time
      await refreshData();
    } catch (err: any) {
      setNotification({
        type: "error",
        message: err.message || "Gagal menyimpan data mobil.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-8 md:p-12 bg-[#F5F5F7] min-h-screen relative select-none antialiased">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-10 text-neutral-900">
          <Link
            href="/admin/dashboard"
            className="inline-flex items-center gap-1.5 text-neutral-400 hover:text-neutral-900 transition-colors mb-4 group text-xs font-semibold uppercase tracking-wider"
          >
            <ChevronLeft
              size={14}
              className="group-hover:-translate-x-0.5 transition-transform"
            />
            <span>Dashboard</span>
          </Link>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white rounded-2xl text-neutral-900 shadow-sm border border-neutral-200/60">
              <Car size={24} />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-neutral-900">
                Database Mobil
              </h1>
              <p className="text-neutral-400 text-xs font-normal mt-1">
                Kel Kelola daftar tipe mobil dan estimasi bahan.
              </p>
            </div>
          </div>
        </div>

        {/* --- POP-UP MODAL HIT DI TENGAH LAYAR + BACKDROP BLUR (TEMA APPLE GLASS) --- */}
        {notification && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/10 backdrop-blur-md animate-in fade-in duration-200">
            <div className="bg-white/80 backdrop-blur-xl border border-neutral-200 p-8 rounded-[2rem] max-w-sm w-full text-center shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200">
              <div
                className={`absolute top-0 inset-x-0 h-1.5 ${notification.type === "success" ? "bg-purple-500" : "bg-rose-500"}`}
              />

              <div className="mx-auto w-12 h-12 rounded-2xl flex items-center justify-center mb-4 bg-neutral-50 border border-neutral-200/60">
                {notification.type === "success" ? (
                  <CheckCircle2 size={24} className="text-purple-600" />
                ) : (
                  <AlertTriangle size={24} className="text-rose-600" />
                )}
              </div>

              <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900 mb-1.5">
                {notification.type === "success" ? "Sukses" : "Gagal Sistem"}
              </h3>
              <p className="text-neutral-500 text-xs font-normal leading-relaxed mb-6 px-2 text-center">
                {notification.message}
              </p>

              <button
                type="button"
                onClick={() => setNotification(null)}
                className={`w-full font-bold py-3 rounded-xl text-xs uppercase tracking-widest transition-all active:scale-98 text-white ${
                  notification.type === "success"
                    ? "bg-purple-600 hover:bg-purple-700 shadow-md shadow-purple-600/10"
                    : "bg-rose-600 hover:bg-rose-700 shadow-md shadow-rose-600/10"
                }`}
              >
                Oke, Mantap
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Form Input */}
          <div className="lg:sticky lg:top-10 text-neutral-900">
            <div className="bg-white border border-neutral-200/60 p-8 rounded-[2rem] shadow-sm">
              <h2 className="text-sm font-bold uppercase tracking-wider mb-6 flex items-center gap-2 text-neutral-900">
                <Plus size={16} className="text-purple-600" />
                Tambah Mobil
              </h2>

              <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest ml-0.5">
                    Merk
                  </label>
                  <input
                    name="brand"
                    placeholder="Contoh: Honda"
                    className="w-full bg-[#F5F5F7] border border-neutral-200/80 rounded-xl px-4 py-3 text-neutral-900 text-xs font-medium outline-none transition-all focus:bg-white focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 placeholder:text-neutral-400"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest ml-0.5">
                    Model
                  </label>
                  <input
                    name="model"
                    placeholder="Contoh: Civic"
                    className="w-full bg-[#F5F5F7] border border-neutral-200/80 rounded-xl px-4 py-3 text-neutral-900 text-xs font-medium outline-none transition-all focus:bg-white focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 placeholder:text-neutral-400"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest ml-0.5">
                    Estimasi Meter
                  </label>
                  <input
                    name="meters"
                    type="number"
                    step="0.1"
                    placeholder="Contoh: 15.5"
                    className="w-full bg-[#F5F5F7] border border-neutral-200/80 rounded-xl px-4 py-3 text-neutral-900 text-xs font-semibold outline-none transition-all focus:bg-white focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 font-mono placeholder:text-neutral-400"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-neutral-900 text-white font-bold py-3.5 rounded-xl mt-4 hover:bg-black transition-all active:scale-95 shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-xs uppercase tracking-wider"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={14} className="animate-spin text-white" />
                      <span>Memproses...</span>
                    </>
                  ) : (
                    <span>Simpan Mobil</span>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Tabel Daftar Kendaraan */}
          <div className="lg:col-span-2">
            <div className="bg-white border border-neutral-200/60 rounded-[2rem] overflow-hidden shadow-sm">
              <div className="max-h-[440px] overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-200 scrollbar-track-transparent">
                {loadingPage ? (
                  <div className="py-24 text-center">
                    <Loader2
                      size={20}
                      className="animate-spin mx-auto text-neutral-400 mb-2"
                    />
                    <p className="text-xs text-neutral-400 italic">
                      Sinkronisasi data database...
                    </p>
                  </div>
                ) : (
                  <table className="w-full text-left border-collapse">
                    <thead className="sticky top-0 z-10 bg-white border-b border-neutral-100 shadow-none">
                      <tr>
                        <th className="px-8 py-4.5 text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                          Merk & Model
                        </th>
                        <th className="px-8 py-4.5 text-[10px] font-bold text-neutral-400 uppercase tracking-widest text-center">
                          Estimasi
                        </th>
                        <th className="px-8 py-4.5"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100 bg-white text-neutral-900">
                      {cars.map((car) => (
                        <CarRow
                          key={car.id}
                          car={car}
                          onRefresh={refreshData}
                        />
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {!loadingPage && cars.length === 0 && (
                <div className="py-24 text-center">
                  <Car size={28} className="mx-auto text-neutral-200 mb-3" />
                  <p className="text-neutral-400 text-xs italic">
                    Belum ada data mobil terdaftar.
                  </p>
                </div>
              )}
            </div>

            <p className="mt-6 text-[10px] text-neutral-400 uppercase tracking-[0.3em] text-center font-medium">
              Pixel Sticker Database System &copy; 2026
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
