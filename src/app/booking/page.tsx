"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation"; // Tambahkan router untuk navigasi manual
import { createClient } from "@/utils/supabase/client";
import {
  Calendar,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Clock,
  Car,
  FileText,
  Loader2,
  Phone,
  User,
  History,
} from "lucide-react";

export default function BookingPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [availableDates, setAvailableDates] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- STATE UNTUK MENGECEK APAKAH USER SUDAH PERNAH MEMILIKI DATA BOOKING ---
  const [hasBookingHistory, setHasBookingHistory] = useState(false);

  const [form, setForm] = useState({
    fullName: "",
    whatsapp: "",
    vehicleInput: "",
    note: "",
    selectedDate: "",
  });

  const supabase = createClient();

  useEffect(() => {
    const fetchDatabaseInfo = async (currentUser: any) => {
      // a. Cek apakah user ini sudah pernah submit data booking sebelumnya
      const { data: bookings } = await supabase
        .from("bookings")
        .select("id")
        .eq("user_id", currentUser.id)
        .limit(1);

      if (bookings && bookings.length > 0) {
        setHasBookingHistory(true);
      } else {
        setHasBookingHistory(false);
      }

      // b. Tarik slot tanggal aktif
      const today = new Date();
      const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

      const { data: dates } = await supabase
        .from("available_dates")
        .select("*")
        .eq("is_available", true)
        .gte("available_date", todayStr)
        .order("available_date", { ascending: true });
      if (dates) setAvailableDates(dates);

      setAuthLoading(false);
    };

    const initData = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUser(session?.user || null);

      if (session?.user) {
        await fetchDatabaseInfo(session.user);
      } else {
        setAuthLoading(false);
      }
    };

    initData();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      if (session?.user) {
        setAuthLoading(true);
        fetchDatabaseInfo(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName.trim()) return alert("Silakan isi Nama Lengkap Anda!");
    if (!form.selectedDate) return alert("Silakan pilih tanggal pengerjaan!");
    if (!form.whatsapp) return alert("Nomor WhatsApp wajib diisi!");
    if (!form.vehicleInput) return alert("Jenis kendaraan wajib diisi!");

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("bookings").insert([
        {
          user_id: user.id,
          full_name: form.fullName,
          whatsapp_number: form.whatsapp,
          car_model: form.vehicleInput,
          customer_note: form.note,
          booking_date: form.selectedDate,
          status: "pending",
        },
      ]);

      if (error) throw error;

      alert(
        "Booking berhasil diajukan! Admin kami akan segera menghubungi via WA.",
      );

      // Setelah sukses mengisi form, izinkan akses ke halaman riwayat
      setHasBookingHistory(true);
      setForm({
        fullName: "",
        whatsapp: "",
        vehicleInput: "",
        note: "",
        selectedDate: "",
      });
    } catch (err: any) {
      alert("Gagal melakukan booking: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- INTERCEPTOR KLIK TOMBOL RIWAYAT (RULES VALIDASI) ---
  const handleHistoryClick = (e: React.MouseEvent) => {
    e.preventDefault(); // Kunci perpindahan default tag Link

    if (!hasBookingHistory) {
      alert(
        "Akses Ditolak! Anda belum bisa melihat halaman riwayat karena belum pernah mengisi formulir reservasi.",
      );
    } else {
      router.push("/booking/history");
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-blue-600" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white pt-28 pb-16 px-4 md:px-8 select-none overflow-x-hidden">
        <div className="max-w-4xl mx-auto text-center relative">
          <div className="absolute top-[-100px] left-1/2 -translate-x-1/2 w-[300px] h-[300px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-neutral-400 mb-5">
            <Sparkles size={14} className="text-blue-400 animate-pulse" />
            <span>Sistem Booking Workshop Pixel Sticker</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-black tracking-tight max-w-2xl mx-auto leading-tight uppercase mt-4">
            Amankan Slot Jasa <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-blue-300">
              Premium Car Wrap
            </span>{" "}
            Kamu
          </h1>

          <div className="mt-10 p-6 md:p-8 rounded-[2rem] bg-neutral-900/40 border border-white/5 backdrop-blur-md max-w-md mx-auto shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="text-blue-400" size={24} />
            </div>
            <h3 className="font-bold text-lg">Siap Melakukan Booking?</h3>
            <p className="text-xs text-neutral-500 mt-1 mb-6 px-4">
              Kamu harus masuk ke dalam sistem terlebih dahulu untuk melihat
              ketersediaan slot tanggal workshop kami.
            </p>
            <Link
              href="/login"
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-6 rounded-xl text-sm transition-all shadow-lg shadow-blue-600/20 active:scale-[0.98] group"
            >
              <span>Masuk dengan Google</span>
              <ArrowRight
                size={16}
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-16 px-4 md:px-8 font-sans">
      <div className="max-w-3xl mx-auto space-y-12">
        <div className="bg-white text-neutral-900 border border-neutral-200 rounded-[2rem] p-6 md:p-10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-1 bg-blue-600" />

          <div className="mb-8">
            <h2 className="text-2xl font-black uppercase tracking-tight flex items-center gap-2 text-neutral-900">
              <Calendar className="text-blue-600" size={24} />
              Formulir Booking Jasa
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Silakan isi data diri Anda dan kendaraan Anda secara valid untuk
              keperluan antrean workshop.
            </p>
          </div>

          <form onSubmit={handleSubmitBooking} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[11px] font-extrabold uppercase tracking-wider text-neutral-600 flex items-center gap-1.5">
                <User size={13} className="text-neutral-400" /> Nama Lengkap
                Sesuai KTP / STNK
              </label>
              <input
                type="text"
                required
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                placeholder="Masukkan nama asli Anda (Contoh: Rizal Nur)"
                className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-4 py-3.5 text-sm text-neutral-900 outline-none focus:border-blue-500 focus:bg-white transition-all placeholder:text-neutral-400"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[11px] font-extrabold uppercase tracking-wider text-neutral-600 flex items-center gap-1.5">
                  <Phone size={13} className="text-neutral-400" /> No. WhatsApp
                  Aktif
                </label>
                <input
                  type="tel"
                  required
                  value={form.whatsapp}
                  onChange={(e) =>
                    setForm({ ...form, whatsapp: e.target.value })
                  }
                  placeholder="Contoh: 08123456789"
                  className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-4 py-3.5 text-sm text-neutral-900 outline-none focus:border-blue-500 focus:bg-white transition-all placeholder:text-neutral-400"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-extrabold uppercase tracking-wider text-neutral-600 flex items-center gap-1.5">
                  <Car size={13} className="text-neutral-400" /> Jenis Kendaraan
                </label>
                <input
                  type="text"
                  required
                  value={form.vehicleInput}
                  onChange={(e) =>
                    setForm({ ...form, vehicleInput: e.target.value })
                  }
                  placeholder="Contoh: Honda PCX / Civic"
                  className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-4 py-3.5 text-sm text-neutral-900 outline-none focus:border-blue-500 focus:bg-white transition-all placeholder:text-neutral-400"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-extrabold uppercase tracking-wider text-neutral-600 flex items-center gap-1.5">
                <Clock size={13} className="text-neutral-400" /> Pilih Tanggal
                Pengerjaan
              </label>
              <select
                required
                value={form.selectedDate}
                onChange={(e) =>
                  setForm({ ...form, selectedDate: e.target.value })
                }
                className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-4 py-3.5 text-sm text-neutral-900 outline-none focus:border-blue-500 focus:bg-white transition-all appearance-none cursor-pointer"
              >
                <option value="">
                  -- Klik untuk memilih tanggal yang tersedia --
                </option>
                {availableDates.map((d) => {
                  const dateObj = new Date(d.available_date);
                  const formatted = dateObj.toLocaleDateString("id-ID", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  });
                  return (
                    <option
                      key={d.id}
                      value={d.available_date}
                      className="text-neutral-900"
                    >
                      {formatted}
                    </option>
                  );
                })}
              </select>
              {availableDates.length === 0 && (
                <p className="text-[11px] text-red-500 font-medium mt-1">
                  Belum ada slot tanggal tersedia yang dibuka oleh admin.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-extrabold uppercase tracking-wider text-neutral-600 flex items-center gap-1.5">
                <FileText size={13} className="text-neutral-400" /> Catatan
                Tambahan untuk Admin (Opsional)
              </label>
              <textarea
                rows={3}
                value={form.note}
                onChange={(e) => setForm({ ...form, note: e.target.value })}
                placeholder="Tulis pesan atau permintaan khusus di sini jika ada..."
                className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-4 py-3 text-sm text-neutral-900 outline-none focus:border-blue-500 focus:bg-white resize-none transition-all placeholder:text-neutral-400"
              />
            </div>

            <div className="space-y-3 pt-2">
              <button
                type="submit"
                disabled={isSubmitting || availableDates.length === 0}
                className="w-full bg-neutral-900 hover:bg-black disabled:opacity-40 text-white font-bold py-4 rounded-xl text-xs uppercase tracking-widest transition-all active:scale-[0.99] flex items-center justify-center"
              >
                {isSubmitting ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  "Kirim Data Reservasi"
                )}
              </button>

              {/* TOMBOL DENGAN ATURAN INTERCEPTOR KLIK VALIDASI FORM */}
              <Link
                href="/booking/history"
                onClick={handleHistoryClick}
                className="w-full flex items-center justify-center gap-2 bg-neutral-50 hover:bg-neutral-100 text-neutral-700 text-xs font-bold py-3.5 rounded-xl border border-neutral-300 transition-all active:scale-[0.99] group shadow-sm"
              >
                <History
                  size={14}
                  className="text-neutral-500 transition-transform group-hover:rotate-[-15deg]"
                />
                <span>Lihat Riwayat & Status Booking Saya</span>
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
