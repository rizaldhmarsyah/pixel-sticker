// src/app/admin/booking/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import {
  Calendar,
  Clock,
  User,
  Phone,
  Car,
  FileText,
  CheckCircle2,
  Loader2,
  Upload,
  ExternalLink,
  RefreshCw,
  ArrowRight,
  Sparkles,
  XCircle,
  Edit2,
  DollarSign,
} from "lucide-react";

const syncAvailableDatesTable = async (
  start: string,
  end: string,
  supabaseClient: any,
) => {
  try {
    await supabaseClient
      .from("available_dates")
      .delete()
      .lt("available_date", start);
    const { data: existingRecords } = await supabaseClient
      .from("available_dates")
      .select("available_date");
    const existingDates =
      existingRecords?.map((r: any) =>
        String(r.available_date).substring(0, 10),
      ) || [];

    let current = new Date(start);
    const last = new Date(end);
    const inserts = [];

    while (current <= last) {
      const y = current.getFullYear();
      const m = String(current.getMonth() + 1).padStart(2, "0");
      const d = String(current.getDate()).padStart(2, "0");
      const curStr = `${y}-${m}-${d}`;
      if (!existingDates.includes(curStr))
        inserts.push({ available_date: curStr, is_available: true });
      current.setDate(current.getDate() + 1);
    }

    if (inserts.length > 0) {
      for (const item of inserts) {
        const { error } = await supabaseClient
          .from("available_dates")
          .insert([item]);
        if (error && error.code !== "23505") console.error(error.message);
      }
    }
  } catch (err: any) {
    console.error(err.message);
  }
};

export default function AdminBookingPage() {
  const supabase = createClient();
  const [bookings, setBookings] = useState<any[]>([]);
  const [activeDates, setActiveDates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentRangeText, setCurrentRangeText] = useState("Memuat data...");
  const [isSettingRange, setIsSettingRange] = useState(false);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [editingBookingId, setEditingBookingId] = useState<string | null>(null);
  const [newSelectedDate, setNewSelectedDate] = useState("");

  // --- STATE MODAL INPUT HARGA FINAL ---
  const [isModalPriceOpen, setIsModalPriceOpen] = useState(false);
  const [targetBookingId, setTargetBookingId] = useState<string | null>(null);
  const [inputPrice, setInputPrice] = useState("");

  // --- LOGIKA HITUNG HANYA YANG AKTIF (PENDING & PROSES) ---
  const activeBookingsCount = bookings.filter(
    (b) => b.status === "pending" || b.status === "proses",
  ).length;

  const fetchDataAndRollCalendar = async () => {
    setLoading(true);
    try {
      const today = new Date();
      const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
      let { data: settingsArray } = await supabase
        .from("calendar_settings")
        .select("*")
        .limit(1);
      let settings = settingsArray?.[0];

      if (settings) {
        let activeStart = settings.start_date;
        let activeEnd = settings.end_date;

        if (!settings.is_custom && activeStart < todayStr) {
          const dateStartObj = new Date(activeStart);
          const dateEndObj = new Date(activeEnd);
          const diffDays = Math.ceil(
            Math.abs(today.getTime() - dateStartObj.getTime()) /
              (1000 * 60 * 60 * 24),
          );
          dateStartObj.setDate(dateStartObj.getDate() + diffDays);
          dateEndObj.setDate(dateEndObj.getDate() + diffDays);
          activeStart = `${dateStartObj.getFullYear()}-${String(dateStartObj.getMonth() + 1).padStart(2, "0")}-${String(dateStartObj.getDate()).padStart(2, "0")}`;
          activeEnd = `${dateEndObj.getFullYear()}-${String(dateEndObj.getMonth() + 1).padStart(2, "0")}-${String(dateEndObj.getDate()).padStart(2, "0")}`;
          await supabase
            .from("calendar_settings")
            .update({ start_date: activeStart, end_date: activeEnd })
            .eq("id", settings.id);
        }

        const format = (d: string) =>
          new Date(d).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
          });
        setCurrentRangeText(
          `Masa Aktif: ${format(activeStart)} s/d ${format(activeEnd)} ${!settings.is_custom ? "(Otomatis)" : "(Dikunci)"}`,
        );
        await syncAvailableDatesTable(activeStart, activeEnd, supabase);
      }

      const { data: d } = await supabase
        .from("available_dates")
        .select("*")
        .eq("is_available", true)
        .gte("available_date", todayStr)
        .order("available_date", { ascending: true });
      if (d) setActiveDates(d);

      const { data: b } = await supabase
        .from("bookings")
        .select("*")
        .order("created_at", { ascending: false });
      if (b) setBookings(b);
    } catch (err: any) {
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDataAndRollCalendar();
  }, []);

  const handleSetCustomRange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate)
      return alert("Isi kedua tanggal pembuka terlebih dahulu!");
    if (startDate > endDate)
      return alert("Tanggal mulai tidak boleh melebihi tanggal selesai!");

    setIsSettingRange(true);
    try {
      const { data: settingsArray } = await supabase
        .from("calendar_settings")
        .select("id")
        .order("id", { ascending: true })
        .limit(1);
      const targetId =
        settingsArray && settingsArray.length > 0 ? settingsArray[0].id : null;

      if (targetId) {
        const { error } = await supabase
          .from("calendar_settings")
          .update({
            start_date: startDate,
            end_date: endDate,
            is_custom: true,
          })
          .eq("id", targetId);

        if (error) throw error;
      }

      alert("Rentang tanggal khusus berhasil dikunci oleh admin!");
      setStartDate("");
      setEndDate("");
      fetchDataAndRollCalendar();
    } catch (error: any) {
      alert("Gagal memperbarui rentang kalender: " + error.message);
    } finally {
      setIsSettingRange(false);
    }
  };

  const handleUploadReceipt = async (
    e: React.ChangeEvent<HTMLInputElement>,
    bookingId: string,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf")
      return alert("Format berkas wajib berupa PDF!");

    setUploadingId(bookingId);
    try {
      const fileName = `receipt_${bookingId}_${Date.now()}.pdf`;
      const { error: uploadError } = await supabase.storage
        .from("receipts")
        .upload(fileName, file);
      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("receipts").getPublicUrl(fileName);

      const { error: updateError } = await supabase
        .from("bookings")
        .update({ receipt_pdf_url: publicUrl })
        .eq("id", bookingId);
      if (updateError) throw updateError;

      alert("Kuitansi PDF sukses diunggah!");
      fetchDataAndRollCalendar();
    } catch (error: any) {
      alert("Gagal memproses berkas: " + error.message);
    } finally {
      setUploadingId(null);
    }
  };

  const handleUpdateStatus = async (
    bookingId: string,
    currentStatus: string,
    receiptUrl: string | null,
  ) => {
    if (currentStatus === "pending") {
      setActionLoadingId(bookingId);
      try {
        const { error } = await supabase
          .from("bookings")
          .update({ status: "proses" })
          .eq("id", bookingId);
        if (error) throw error;
        fetchDataAndRollCalendar();
      } catch (error: any) {
        alert("Gagal memperbarui alur kerja: " + error.message);
      } finally {
        setActionLoadingId(null);
      }
    } else if (currentStatus === "proses") {
      setTargetBookingId(bookingId);
      setInputPrice("");
      setIsModalPriceOpen(true);
    }
  };

  const handleConfirmSubmitPrice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetBookingId) return;

    const parsedPrice = parseFloat(inputPrice);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      return alert("Silakan masukkan nominal pendapatan yang valid!");
    }

    setActionLoadingId(targetBookingId);
    setIsModalPriceOpen(false);

    try {
      const { error } = await supabase
        .from("bookings")
        .update({
          status: "selesai",
          total_price: parsedPrice,
        })
        .eq("id", targetBookingId);

      if (error) throw error;

      alert(
        "Orderan sukses diselesaikan & nominal harga resmi tercatat di laporan!",
      );
      setTargetBookingId(null);
      setInputPrice("");
      fetchDataAndRollCalendar();
    } catch (error: any) {
      alert("Gagal memproses penyelesaian harga order: " + error.message);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm("Apakah Anda yakin ingin membatalkan booking ini?")) return;

    setActionLoadingId(bookingId);
    try {
      const { error } = await supabase
        .from("bookings")
        .update({ status: "batal" })
        .eq("id", bookingId);
      if (error) throw error;
      alert("Booking sukses dibatalkan.");
      fetchDataAndRollCalendar();
    } catch (error: any) {
      alert("Gagal membatalkan booking: " + error.message);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRescheduleBooking = async (bookingId: string) => {
    if (!newSelectedDate) return alert("Silakan pilih tanggal baru!");

    setActionLoadingId(bookingId);
    try {
      const { error } = await supabase
        .from("bookings")
        .update({ booking_date: newSelectedDate })
        .eq("id", bookingId);
      if (error) throw error;
      alert("Tanggal pengerjaan berhasil dijadwalkan ulang!");
      setEditingBookingId(null);
      setNewSelectedDate("");
      fetchDataAndRollCalendar();
    } catch (error: any) {
      alert("Gagal menjadwalkan ulang: " + error.message);
    } finally {
      setActionLoadingId(null);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-blue-600" />
      </div>
    );

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 p-6 md:p-10 font-sans relative">
      {/* ==================== POP-UP MODAL FIX INPUT HARGA MELAYANG ==================== */}
      {isModalPriceOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] border border-neutral-200 shadow-2xl p-6 md:p-8 max-w-md w-full animate-in zoom-in-95 duration-150 text-left">
            <div className="w-12 h-12 rounded-2xl bg-green-50 border border-green-200 flex items-center justify-center mb-4">
              <DollarSign className="text-green-600" size={22} />
            </div>
            <h3 className="text-base font-black uppercase tracking-tight text-neutral-900">
              Kunci Nominal Transaksi
            </h3>
            <p className="text-xs text-neutral-500 mt-1 mb-5">
              Masukkan total biaya pengerjaan kustom riil lapangan untuk
              mengonfirmasi selesainya antrean ini masuk ke buku laporan.
            </p>

            <form onSubmit={handleConfirmSubmitPrice} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-neutral-500 tracking-wider">
                  Total Biaya Akhir (Rupiah)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-neutral-400">
                    Rp
                  </span>
                  <input
                    type="number"
                    required
                    autoFocus
                    placeholder="Contoh: 3500000"
                    value={inputPrice}
                    onChange={(e) => setInputPrice(e.target.value)}
                    className="w-full bg-neutral-50 border border-neutral-300 rounded-xl pl-10 pr-4 py-3 text-sm font-bold text-neutral-900 outline-none focus:border-green-500 focus:bg-white shadow-sm transition-all"
                  />
                </div>
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalPriceOpen(false);
                    setTargetBookingId(null);
                  }}
                  className="flex-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold text-xs py-3.5 rounded-xl uppercase tracking-wider transition-all"
                >
                  Kembali
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold text-xs py-3.5 rounded-xl uppercase tracking-wider transition-all shadow-lg shadow-green-600/20"
                >
                  Sah & Selesaikan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto space-y-10">
        {/* TOP BAR MANAGEMENT */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-neutral-200 pb-6">
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tight text-neutral-900">
              Kelola Antrean Booking
            </h1>
            <p className="text-xs text-neutral-500 mt-1">
              Validasi antrean order, otomasi rolling kalender workshop, dan
              upload berkas kuitansi customer.
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Link
              href="/admin/dashboard/bookings/history"
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 border border-blue-500 text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors shadow-lg shadow-blue-600/10"
            >
              <FileText size={14} />
              <span>Lihat Arsip Riwayat (Excel)</span>
            </Link>

            <button
              onClick={fetchDataAndRollCalendar}
              className="flex items-center gap-2 bg-white hover:bg-neutral-100 border border-neutral-300 px-4 py-2 rounded-xl text-xs font-semibold text-neutral-700 transition-colors"
            >
              <RefreshCw size={14} />
              <span>Segarkan</span>
            </button>
          </div>
        </div>

        {/* BLOK KALENDER SETTING - GREY MODE */}
        <div className="bg-neutral-100 border border-neutral-200 rounded-[2rem] p-6 md:p-8 space-y-6 shadow-sm">
          <div>
            <h2 className="text-base font-bold uppercase tracking-wide flex items-center gap-2 text-neutral-900">
              <Calendar className="text-blue-600" size={18} />
              Otomasi & Batasan Rentang Kalender Jasa
            </h2>
            <p className="text-[11px] text-neutral-500 mt-0.5">
              Atur dari tanggal berapa hingga tanggal berapa formulir booking di
              sisi client boleh diakses.
            </p>
          </div>

          <form
            onSubmit={handleSetCustomRange}
            className="flex flex-col md:flex-row items-end gap-4 bg-white p-5 rounded-2xl border border-neutral-200"
          >
            <div className="w-full md:w-auto flex-1 space-y-2">
              <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">
                Dari Tanggal
              </label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-4 py-3 text-xs text-neutral-900 outline-none focus:border-blue-500 shadow-sm transition-all"
              />
            </div>

            <div className="hidden md:block pb-3 text-neutral-400">
              <ArrowRight size={16} />
            </div>

            <div className="w-full md:w-auto flex-1 space-y-2">
              <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                Sampai Tanggal
              </label>
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-4 py-3 text-xs text-neutral-900 outline-none focus:border-blue-500 shadow-sm transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={isSettingRange}
              className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-6 py-3.5 rounded-xl transition-all uppercase tracking-wider whitespace-nowrap active:scale-[0.98] shadow-lg shadow-blue-600/20"
            >
              {isSettingRange ? "Memproses..." : "Kunci Batasan Baru"}
            </button>
          </form>

          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-50 border border-blue-100 text-xs text-blue-700 font-mono">
            <Sparkles size={14} className="animate-pulse" />
            <span>{currentRangeText}</span>
          </div>
        </div>

        {/* LIST ANTREAN - WHITE CLEAN CARD */}
        <div className="space-y-4">
          <h2 className="text-base font-bold uppercase tracking-wide flex items-center gap-2 text-neutral-900">
            <Clock className="text-yellow-600" size={18} />
            Daftar Antrean Berjalan ({activeBookingsCount})
          </h2>

          {bookings.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-neutral-200 rounded-[2rem] bg-white shadow-sm">
              <p className="text-sm text-neutral-400 font-light">
                Tidak ada data antrean booking yang terdaftar saat ini.
              </p>
            </div>
          ) : (
            <div className="max-h-[660px] overflow-y-auto pr-1 space-y-4 scrollbar-thin scrollbar-thumb-neutral-300">
              {bookings.map((b) => (
                <div
                  key={b.id}
                  className="p-6 bg-white text-neutral-900 rounded-[2rem] space-y-5 shadow-xl border border-neutral-200 relative transition-all text-left"
                >
                  <div className="flex flex-wrap justify-between items-start gap-4 border-b border-neutral-200 pb-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-neutral-900 uppercase text-base flex items-center gap-1.5">
                          <User size={15} className="text-neutral-500" />{" "}
                          {b.full_name}
                        </span>
                        <span className="text-[10px] text-neutral-400 font-mono bg-neutral-100 px-1.5 py-0.5 rounded">
                          ID: {b.id.slice(0, 8).toUpperCase()}
                        </span>
                        {b.total_price > 0 && (
                          <span className="text-[10px] text-green-700 font-bold bg-green-50 border border-green-200 px-2 py-0.5 rounded-md">
                            Nominal: Rp {b.total_price.toLocaleString("id-ID")}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-4 text-xs text-neutral-600 font-normal">
                        <span className="flex items-center gap-1">
                          <Phone size={13} className="text-neutral-400" />{" "}
                          {b.whatsapp_number}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar size={13} className="text-neutral-400" />{" "}
                          Jadwal:{" "}
                          <strong className="text-neutral-900">
                            {new Date(b.booking_date).toLocaleDateString(
                              "id-ID",
                              {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              },
                            )}
                          </strong>
                        </span>

                        {b.status !== "selesai" && b.status !== "batal" && (
                          <button
                            onClick={() => {
                              setEditingBookingId(
                                editingBookingId === b.id ? null : b.id,
                              );
                              setNewSelectedDate(b.booking_date);
                            }}
                            className="text-blue-600 flex items-center gap-0.5 font-bold hover:underline"
                          >
                            <Edit2 size={11} /> Reschedule
                          </button>
                        )}
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-md border ${
                        b.status === "selesai"
                          ? "bg-green-50 text-green-600 border-green-200"
                          : b.status === "proses"
                            ? "bg-blue-50 text-blue-600 border-blue-200"
                            : b.status === "batal"
                              ? "bg-red-50 text-red-600 border-red-200"
                              : "bg-yellow-50 text-yellow-600 border-yellow-200"
                      }`}
                    >
                      {b.status}
                    </span>
                  </div>

                  {/* FORM INLINE RESCHEDULE */}
                  {editingBookingId === b.id && (
                    <div className="p-4 bg-neutral-50 border border-neutral-300 rounded-xl flex flex-col sm:flex-row items-end gap-3 text-xs">
                      <div className="flex-1 space-y-1.5 w-full">
                        <label className="font-bold text-neutral-500 uppercase text-[10px]">
                          Pilih Tanggal Baru Workshop
                        </label>
                        <select
                          value={newSelectedDate}
                          onChange={(e) => setNewSelectedDate(e.target.value)}
                          className="w-full bg-white border border-neutral-300 rounded-xl px-3 py-2 text-neutral-900 outline-none focus:border-blue-500 cursor-pointer shadow-sm"
                        >
                          {activeDates.map((d) => (
                            <option key={d.id} value={d.available_date}>
                              {new Date(d.available_date).toLocaleDateString(
                                "id-ID",
                                {
                                  weekday: "long",
                                  day: "numeric",
                                  month: "long",
                                  year: "numeric",
                                },
                              )}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="flex gap-2 w-full sm:w-auto">
                        <button
                          onClick={() => setEditingBookingId(null)}
                          className="flex-1 sm:flex-none bg-neutral-200 hover:bg-neutral-300 text-neutral-800 px-4 py-2 rounded-xl font-bold transition-all"
                        >
                          Batal
                        </button>
                        <button
                          onClick={() => handleRescheduleBooking(b.id)}
                          disabled={actionLoadingId !== null}
                          className="flex-1 sm:flex-none bg-blue-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-blue-700 transition-all"
                        >
                          Simpan
                        </button>
                      </div>
                    </div>
                  )}

                  {/* ITEM DETAIL */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 space-y-1">
                      <span className="text-[10px] uppercase font-bold text-neutral-500 flex items-center gap-1">
                        <Car size={12} /> Unit Kendaraan
                      </span>
                      <p className="text-neutral-900 font-bold uppercase text-sm">
                        {b.car_model}
                      </p>
                    </div>
                    <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 space-y-1">
                      <span className="text-[10px] uppercase font-bold text-neutral-500 flex items-center gap-1">
                        <FileText size={12} /> Catatan Pengguna
                      </span>
                      <p className="text-neutral-700 italic font-normal">
                        {b.customer_note || "Tidak ada catatan tambahan."}
                      </p>
                    </div>
                  </div>

                  {/* BOTTOM ACTION BAR */}
                  <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 bg-neutral-50 p-3 rounded-2xl border border-neutral-200">
                    <div className="flex items-center gap-2">
                      {b.receipt_pdf_url ? (
                        <a
                          href={b.receipt_pdf_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs text-blue-600 font-semibold hover:underline"
                        >
                          <ExternalLink size={14} />{" "}
                          <span>Lihat Kuitansi Terunggah</span>
                        </a>
                      ) : b.status !== "batal" && b.status !== "selesai" ? (
                        <label className="flex items-center gap-2 bg-white hover:bg-neutral-100 text-neutral-800 border border-neutral-300 text-xs font-bold px-3 py-2 rounded-xl cursor-pointer shadow-sm transition-colors">
                          {uploadingId === b.id ? (
                            <Loader2
                              size={14}
                              className="animate-spin text-blue-600"
                            />
                          ) : (
                            <Upload size={14} className="text-neutral-500" />
                          )}
                          <span>
                            {uploadingId === b.id
                              ? "Memproses..."
                              : "Upload PDF Kuitansi"}
                          </span>
                          <input
                            type="file"
                            accept="application/pdf"
                            disabled={uploadingId !== null}
                            onChange={(e) => handleUploadReceipt(e, b.id)}
                            className="hidden"
                          />
                        </label>
                      ) : null}
                    </div>

                    <div className="flex items-center gap-2 justify-end">
                      {b.status !== "selesai" && b.status !== "batal" && (
                        <button
                          type="button"
                          disabled={actionLoadingId !== null}
                          onClick={() => handleCancelBooking(b.id)}
                          className="inline-flex items-center justify-center gap-1 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-xl text-xs font-bold transition-all"
                        >
                          <XCircle size={14} /> <span>Batalkan</span>
                        </button>
                      )}

                      {b.status !== "selesai" && b.status !== "batal" ? (
                        <button
                          type="button"
                          disabled={actionLoadingId !== null}
                          onClick={() =>
                            handleUpdateStatus(
                              b.id,
                              b.status,
                              b.receipt_pdf_url,
                            )
                          }
                          className={`inline-flex items-center justify-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all active:scale-[0.98] ${b.status === "pending" ? "bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/10" : "bg-green-600 hover:bg-green-700 text-white shadow-md shadow-green-600/10"}`}
                        >
                          {actionLoadingId === b.id ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : b.status === "pending" ? (
                            <>
                              <Clock size={14} /> <span>Proses Order</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle2 size={14} />{" "}
                              <span>Selesaikan Order</span>
                            </>
                          )}
                        </button>
                      ) : (
                        <div
                          className={`flex items-center gap-1 text-xs font-bold px-3 py-1.5 border rounded-xl ${
                            b.status === "selesai"
                              ? "text-green-700 bg-green-50 border-green-200"
                              : "text-red-700 bg-red-50 border-red-200"
                          }`}
                        >
                          {b.status === "selesai" ? (
                            <CheckCircle2 size={14} />
                          ) : (
                            <XCircle size={14} />
                          )}
                          <span>
                            {b.status === "selesai"
                              ? "Order Sukses Selesai"
                              : "Order Telah Dibatalkan"}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
