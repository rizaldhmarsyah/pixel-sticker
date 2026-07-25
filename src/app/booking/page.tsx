"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  Search,
  ChevronDown,
} from "lucide-react";

export default function BookingPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [availableDates, setAvailableDates] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasBookingHistory, setHasBookingHistory] = useState(false);

  // STATE UNTUK KELOLA DATABASE MOBIL & HYBRID INPUT AUTOMATIC
  const [carsList, setCarsList] = useState<any[]>([]);
  const [carSearch, setCarSearch] = useState("");
  const [isCarDropdownOpen, setIsCarDropdownOpen] = useState(false);
  const carDropdownRef = useRef<HTMLDivElement>(null);

  const [form, setForm] = useState({
    fullName: "",
    whatsapp: "",
    vehicleInput: "", // Menyimpan string teks nama mobil (car_model)
    idCars: null as string | null, // Menyimpan UUID FK dari tabel cars
    note: "",
    selectedDateId: "",
  });

  const supabase = createClient();

  // Menutup dropdown mobil jika pengguna mengeklik di luar komponen
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        carDropdownRef.current &&
        !carDropdownRef.current.contains(event.target as Node)
      ) {
        setIsCarDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchDatabaseInfo = async (currentUser: any) => {
      // 1. Ambil Riwayat Booking
      const { data: bookings } = await supabase
        .from("bookings")
        .select("id_bookings")
        .eq("id_profiles", currentUser.id)
        .limit(1);

      setHasBookingHistory(bookings && bookings.length > 0);

      // 2. AMBIL DATA DARI TABEL CARS UNTUK DROPDOWN FRONTEND
      const { data: carsData } = await supabase
        .from("cars")
        .select("id_cars, brand, model")
        .order("brand", { ascending: true });
      if (carsData) setCarsList(carsData);

      const today = new Date();
      const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

      const { data: sampleConfig } = await supabase
        .from("available_dates")
        .select("end_date")
        .gte("available_dates", todayStr)
        .order("available_dates", { ascending: true })
        .limit(1);

      const maxAllowedDate = sampleConfig?.[0]?.end_date || todayStr;

      const { data: dates } = await supabase
        .from("available_dates")
        .select("*")
        .eq("is_available", true)
        .gte("available_dates", todayStr)
        .lte("available_dates", maxAllowedDate)
        .order("available_dates", { ascending: true });

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

  // LOGIKA FILTER PENCARIAN DROPDOWN MOBIL HIBRIDA
  const filteredCars = useMemo(() => {
    if (!carSearch.trim()) return carsList;
    return carsList.filter((c) => {
      const fullString = `${c.brand} ${c.model}`.toLowerCase();
      return fullString.includes(carSearch.toLowerCase());
    });
  }, [carsList, carSearch]);

  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName.trim()) return alert("Silakan isi Nama Lengkap Anda!");
    if (!form.selectedDateId) return alert("Silakan pilih tanggal pengerjaan!");
    if (!form.whatsapp) return alert("Nomor WhatsApp wajib diisi!");
    if (!form.vehicleInput) return alert("Jenis kendaraan wajib diisi!");

    setIsSubmitting(true);
    try {
      const targetDateObj = availableDates.find(
        (d) => String(d.id_available_dates) === String(form.selectedDateId),
      );
      const backupStringDate = targetDateObj
        ? targetDateObj.available_dates
        : "";

      // MENYUNTIKKAN DATA ID_CARS (FK) DAN CAR_MODEL PADA TRANSAKSI BOOKINGS
      const { error } = await supabase.from("bookings").insert([
        {
          id_profiles: user.id,
          id_available_dates: parseInt(form.selectedDateId),
          id_cars: form.idCars, // UUID dari data master atau NULL jika ketik manual
          full_name: form.fullName,
          whatsapp_number: form.whatsapp,
          car_model: form.vehicleInput,
          customer_note: form.note,
          booking_date: backupStringDate,
          status: "pending",
        },
      ]);

      if (error) throw error;

      alert(
        "Booking berhasil diajukan! Sistem database otomatis mengunci slot tanggal ini untuk Anda.",
      );

      setHasBookingHistory(true);
      setForm({
        fullName: "",
        whatsapp: "",
        vehicleInput: "",
        idCars: null,
        note: "",
        selectedDateId: "",
      });
      setCarSearch("");

      const todayStr = new Date().toISOString().split("T")[0];
      const { data: sampleConfig } = await supabase
        .from("available_dates")
        .select("end_date")
        .gte("available_dates", todayStr)
        .order("available_dates", { ascending: true })
        .limit(1);

      const maxAllowedDate = sampleConfig?.[0]?.end_date || todayStr;

      const { data: updatedDates } = await supabase
        .from("available_dates")
        .select("*")
        .eq("is_available", true)
        .gte("available_dates", todayStr)
        .lte("available_dates", maxAllowedDate)
        .order("available_dates", { ascending: true });

      if (updatedDates) setAvailableDates(updatedDates);
    } catch (err: any) {
      alert("Gagal melakukan booking: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleHistoryClick = (e: React.MouseEvent) => {
    e.preventDefault();
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
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-6 rounded-xl text-sm transition-all shadow-lg active:scale-[0.98] group"
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
              Formulir Pendaftaran Booking
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

              {/* REVISI PREMIUM: SEARCHABLE HYBRID DROPDOWN AUTOMATIC INPUT (RAMAH BAPAK-BAPAK) */}
              <div className="space-y-2 relative" ref={carDropdownRef}>
                <label className="text-[11px] font-extrabold uppercase tracking-wider text-neutral-600 flex items-center gap-1.5">
                  <Car size={13} className="text-neutral-400" /> Jenis Kendaraan
                </label>
                <div
                  onClick={() => setIsCarDropdownOpen(!isCarDropdownOpen)}
                  className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-4 py-3.5 text-sm text-neutral-900 flex justify-between items-center cursor-pointer hover:border-neutral-400 transition-all"
                >
                  <span
                    className={
                      form.vehicleInput
                        ? "text-neutral-900 font-medium"
                        : "text-neutral-400"
                    }
                  >
                    {form.vehicleInput ||
                      "Klik untuk memilih atau ketik manual..."}
                  </span>
                  <ChevronDown
                    size={16}
                    className={`text-neutral-400 transition-transform duration-200 ${isCarDropdownOpen ? "rotate-180" : ""}`}
                  />
                </div>

                {isCarDropdownOpen && (
                  <div className="absolute z-30 left-0 right-0 mt-1 bg-white border border-neutral-200 rounded-xl shadow-xl overflow-hidden flex flex-col max-h-60">
                    {/* INPUT PENCARIAN SEKALIGUS AUTO-INPUT MANUAL */}
                    <div className="p-2 border-b border-neutral-100 bg-neutral-50 flex items-center gap-2">
                      <Search size={14} className="text-neutral-400 shrink-0" />
                      <input
                        type="text"
                        placeholder="Ngga ada? Ketik manual aja disini..."
                        value={carSearch}
                        onChange={(e) => {
                          const val = e.target.value;
                          setCarSearch(val);
                          // Otomatis daftarkan ketikan bapak-bapak sebagai input manual (idCars: null)
                          setForm({ ...form, vehicleInput: val, idCars: null });
                        }}
                        className="w-full bg-transparent text-xs text-neutral-900 outline-none font-bold"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                    <div className="overflow-y-auto text-xs text-left max-h-48">
                      {filteredCars.map((c) => {
                        const fullName = `${c.brand} ${c.model}`;
                        return (
                          <div
                            key={c.id_cars}
                            onClick={() => {
                              // Jika mereka mengeklik opsi resmi, timpa dengan data UUID dari database
                              setForm({
                                ...form,
                                vehicleInput: fullName,
                                idCars: c.id_cars,
                              });
                              setIsCarDropdownOpen(false);
                              setCarSearch("");
                            }}
                            className="px-4 py-2.5 hover:bg-blue-50 text-neutral-800 font-medium cursor-pointer transition-colors border-b border-neutral-50"
                          >
                            {fullName}
                          </div>
                        );
                      })}

                      {/* Notifikasi info otomatis untuk membantu bapak-bapak tahu ketikannya sudah tersimpan */}
                      {carSearch.trim().length > 0 &&
                        filteredCars.length === 0 && (
                          <div className="px-4 py-3 text-neutral-400 italic bg-amber-50/40 text-[11px] text-center">
                            ✨ Nama mobil kustom otomatis tersimpan. Silakan
                            lanjut pilih tanggal.
                          </div>
                        )}
                      {filteredCars.length === 0 && !carSearch.trim() && (
                        <div className="px-4 py-4 text-center text-neutral-400 italic">
                          Database mobil kosong. Silakan ketik nama mobil di
                          atas.
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-extrabold uppercase tracking-wider text-neutral-600 flex items-center gap-1.5">
                <Clock size={13} className="text-neutral-400" /> Pilih Tanggal
                Pengerjaan
              </label>
              <select
                required
                value={form.selectedDateId}
                onChange={(e) =>
                  setForm({ ...form, selectedDateId: e.target.value })
                }
                className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-4 py-3.5 text-sm text-neutral-900 outline-none focus:border-blue-500 focus:bg-white transition-all appearance-none cursor-pointer"
              >
                <option value="">
                  -- Klik untuk memilih tanggal yang tersedia --
                </option>
                {availableDates.map((d) => {
                  const dateObj = new Date(d.available_dates);
                  const formatted = dateObj.toLocaleDateString("id-ID", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  });
                  return (
                    <option
                      key={d.id_available_dates}
                      value={d.id_available_dates}
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
