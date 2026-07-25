"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
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
  AlertCircle,
  Camera,
  Eye,
  AlertTriangle,
  Plus,
  Search,
  ChevronDown,
  X,
} from "lucide-react";

const syncAvailableDatesTable = async (
  start: string,
  end: string,
  customMode: boolean,
  supabaseClient: any,
) => {
  try {
    await supabaseClient
      .from("available_dates")
      .delete()
      .lt("available_dates", start);

    const { data: existingRecords } = await supabaseClient
      .from("available_dates")
      .select("available_dates");

    const existingDates =
      existingRecords?.map((r: any) =>
        String(r.available_dates).substring(0, 10),
      ) || [];

    let current = new Date(start);
    const last = new Date(end);
    const inserts = [];

    while (current <= last) {
      const y = current.getFullYear();
      const m = String(current.getMonth() + 1).padStart(2, "0");
      const d = String(current.getDate()).padStart(2, "0");
      const curStr = `${y}-${m}-${d}`;

      if (!existingDates.includes(curStr)) {
        inserts.push({
          available_dates: curStr,
          is_available: true,
          start_date: start,
          end_date: end,
          is_custom: customMode,
        });
      }
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
  const [newSelectedDateId, setNewSelectedDateId] = useState("");

  const [isModalPriceOpen, setIsModalPriceOpen] = useState(false);
  const [targetBookingId, setTargetBookingId] = useState<string | null>(null);
  const [inputPrice, setInputPrice] = useState("");

  // STATE: POP-UP MODAL PENGINGAT (REMINDER) SEBELUM PROSES
  const [isModalReminderOpen, setIsModalReminderOpen] = useState(false);

  // STATE MODAL GALERI PREVIEW MULTIPLE FOTO LECET
  const [isModalViewImageOpen, setIsModalViewImageOpen] = useState(false);
  const [selectedImagesArray, setSelectedImagesArray] = useState<string[]>([]);

  // STATE INPUT MANUAL BOOKING OFFLINE (WALK-IN KASIR)
  const [isModalOfflineOpen, setIsModalOfflineOpen] = useState(false);
  const [isSavingOffline, setIsSavingOffline] = useState(false);
  const [carsList, setCarsList] = useState<any[]>([]);
  const [carSearch, setCarSearch] = useState("");
  const [isCarDropdownOpen, setIsCarDropdownOpen] = useState(false);
  const carDropdownRef = useRef<HTMLDivElement>(null);

  const [offlineForm, setOfflineForm] = useState({
    fullName: "",
    whatsapp: "",
    vehicleInput: "",
    idCars: null as string | null,
    note: "",
    selectedDateId: "",
  });

  // 🛠️ STATE BARU: PENCARIAN & FILTER ANTREAN BERJALAN
  const [searchNameQuery, setSearchNameQuery] = useState("");
  const [searchDateQuery, setSearchDateQuery] = useState("");

  const activeBookingsCount = bookings.filter(
    (b) => b.status === "pending" || b.status === "proses",
  ).length;

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

  const fetchDataAndRollCalendar = async () => {
    setLoading(true);
    try {
      const today = new Date();
      const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

      let { data: sampleArray } = await supabase
        .from("available_dates")
        .select("start_date, end_date, is_custom")
        .order("available_dates", { ascending: true })
        .limit(1);

      let config = sampleArray?.[0];

      let activeStart = todayStr;
      const twoWeeksOut = new Date();
      twoWeeksOut.setDate(today.getDate() + 14);
      let activeEnd = `${twoWeeksOut.getFullYear()}-${String(twoWeeksOut.getMonth() + 1).padStart(2, "0")}-${String(twoWeeksOut.getDate()).padStart(2, "0")}`;
      let isCustomMode = false;

      if (config && config.is_custom) {
        if (config.end_date >= todayStr) {
          activeStart = config.start_date;
          activeEnd = config.end_date;
          isCustomMode = true;
        }
      }

      const format = (d: string) =>
        new Date(d).toLocaleDateString("id-ID", {
          day: "numeric",
          month: "long",
          year: "numeric",
        });

      setCurrentRangeText(
        `Masa Aktif: ${format(activeStart)} s/d ${format(activeEnd)} ${!isCustomMode ? "(Otomatis 2 Minggu)" : "(Dikunci Admin)"}`,
      );

      await syncAvailableDatesTable(
        activeStart,
        activeEnd,
        isCustomMode,
        supabase,
      );

      const { data: d } = await supabase
        .from("available_dates")
        .select("*")
        .eq("is_available", true)
        .gte("available_dates", todayStr)
        .order("available_dates", { ascending: true });
      if (d) setActiveDates(d);

      const { data: carsData } = await supabase
        .from("cars")
        .select("id_cars, brand, model")
        .order("brand", { ascending: true });
      if (carsData) setCarsList(carsData);

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

  const filteredCars = useMemo(() => {
    if (!carSearch.trim()) return carsList;
    return carsList.filter((c) => {
      const fullString = `${c.brand} ${c.model}`.toLowerCase();
      return fullString.includes(carSearch.toLowerCase());
    });
  }, [carsList, carSearch]);

  // 🛠️ LOGIKA BARU: FILTER ANTREAN BERJALAN SECARA MULTI-PARAMETRIK REAL-TIME
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      // Saring kecocokan Nama Pelanggan (Case-Insensitive)
      const matchesName = b.full_name
        ? b.full_name.toLowerCase().includes(searchNameQuery.toLowerCase())
        : true;

      // Saring kecocokan Tanggal Booking (YYYY-MM-DD format string comparison)
      const matchesDate = searchDateQuery
        ? b.booking_date === searchDateQuery
        : true;

      return matchesName && matchesDate;
    });
  }, [bookings, searchNameQuery, searchDateQuery]);

  const handleSetCustomRange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate)
      return alert("Isi kedua tanggal pembuka terlebih dahulu!");
    if (startDate > endDate)
      return alert("Tanggal mulai tidak boleh melebihi tanggal selesai!");

    setIsSettingRange(true);
    try {
      await syncAvailableDatesTable(startDate, endDate, true, supabase);

      const { error } = await supabase
        .from("available_dates")
        .update({
          start_date: startDate,
          end_date: endDate,
          is_custom: true,
        })
        .gte("available_dates", startDate);

      if (error) throw error;

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
        .eq("id_bookings", bookingId);
      if (updateError) throw updateError;

      alert("Nota PDF sukses diunggah!");
      fetchDataAndRollCalendar();
    } catch (error: any) {
      alert("Gagal memproses berkas: " + error.message);
    } finally {
      setUploadingId(null);
    }
  };

  const handleUploadInspectionFile = async (
    e: React.ChangeEvent<HTMLInputElement>,
    bookingId: string,
    existingImages: string[] | null,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/"))
      return alert("Berkas dokumentasi wajib berupa Gambar (JPG/PNG)!");

    const currentImages = existingImages || [];

    if (currentImages.length >= 8) {
      return alert(
        "Akses Ditolak! Maksimal dokumentasi inspeksi lecet adalah 8 foto.",
      );
    }

    setUploadingId(bookingId + "_img");
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `inspection_${bookingId}_${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("inspections")
        .upload(fileName, file);
      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("inspections").getPublicUrl(fileName);

      const updatedImagesArray = [...currentImages, publicUrl];

      const { error: updateError } = await supabase
        .from("bookings")
        .update({ inspection_image_url: updatedImagesArray })
        .eq("id_bookings", bookingId);
      if (updateError) throw updateError;

      alert(
        `Foto dokumentasi ke-${updatedImagesArray.length} sukses disimpan!`,
      );
      fetchDataAndRollCalendar();
    } catch (err: any) {
      alert("Gagal menyimpan foto dokumentasi: " + err.message);
    } finally {
      setUploadingId(null);
    }
  };

  const handleSubmitOfflineBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!offlineForm.fullName.trim())
      return alert("Silakan isi nama pelanggan!");
    if (!offlineForm.whatsapp.trim())
      return alert("Silakan isi nomor WhatsApp!");
    if (!offlineForm.vehicleInput.trim())
      return alert("Silakan isi jenis kendaraan!");
    if (!offlineForm.selectedDateId)
      return alert("Silakan tentukan tanggal pengerjaan!");

    setIsSavingOffline(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user)
        throw new Error("Akses kedaluwarsa, silakan login kembali.");

      const targetDateObj = activeDates.find(
        (d) =>
          String(d.id_available_dates) === String(offlineForm.selectedDateId),
      );
      const stringDateValue = targetDateObj
        ? targetDateObj.available_dates
        : "";

      const { error } = await supabase.from("bookings").insert([
        {
          id_profiles: session.user.id,
          id_available_dates: parseInt(offlineForm.selectedDateId),
          id_cars: offlineForm.idCars,
          full_name: offlineForm.fullName,
          whatsapp_number: offlineForm.whatsapp,
          car_model: offlineForm.vehicleInput,
          customer_note: offlineForm.note
            ? `[OFFLINE WALK-IN] ${offlineForm.note}`
            : "[OFFLINE WALK-IN]",
          booking_date: stringDateValue,
          status: "proses",
        },
      ]);

      if (error) throw error;

      alert(
        "Transaksi pelanggan offline sukses terdaftar & masuk antrean produksi!",
      );
      setIsModalOfflineOpen(false);
      setOfflineForm({
        fullName: "",
        whatsapp: "",
        vehicleInput: "",
        idCars: null,
        note: "",
        selectedDateId: "",
      });
      setCarSearch("");
      fetchDataAndRollCalendar();
    } catch (err: any) {
      alert("Gagal menyimpan data offline: " + err.message);
    } finally {
      setIsSavingOffline(false);
    }
  };

  const handleUpdateStatus = async (
    bookingId: string,
    currentStatus: string,
    receiptUrl: string | null,
  ) => {
    if (currentStatus === "pending") {
      setTargetBookingId(bookingId);
      setIsModalReminderOpen(true);
    } else if (currentStatus === "proses") {
      if (!receiptUrl) {
        return alert(
          "Akses Ditolak! Anda wajib mengunggah file PDF Nota terlebih dahulu sebelum menyelesaikan orderan ini.",
        );
      }
      setTargetBookingId(bookingId);
      setInputPrice("");
      setIsModalPriceOpen(true);
    }
  };

  const handleConfirmReminderProcess = async () => {
    if (!targetBookingId) return;

    setActionLoadingId(targetBookingId);
    setIsModalReminderOpen(false);
    try {
      const { error } = await supabase
        .from("bookings")
        .update({ status: "proses" })
        .eq("id_bookings", targetBookingId);

      if (error) throw error;
      setTargetBookingId(null);
      fetchDataAndRollCalendar();
    } catch (error: any) {
      alert("Gagal memperbarui alur kerja: " + error.message);
    } finally {
      setActionLoadingId(null);
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
        .eq("id_bookings", targetBookingId);

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
        .eq("id_bookings", bookingId);
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
    if (!newSelectedDateId) return alert("Silakan pilih tanggal baru!");

    setActionLoadingId(bookingId);
    try {
      const dateObj = activeDates.find(
        (d) => String(d.id_available_dates) === String(newSelectedDateId),
      );
      const textDateValue = dateObj ? dateObj.available_dates : "";

      const { error } = await supabase
        .from("bookings")
        .update({
          id_available_dates: parseInt(newSelectedDateId),
          booking_date: textDateValue,
        })
        .eq("id_bookings", bookingId);

      if (error) throw error;
      alert("Tanggal pengerjaan berhasil dijadwalkan ulang!");
      setEditingBookingId(null);
      setNewSelectedDateId("");
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
    <div className="min-h-screen bg-neutral-50 text-neutral-900 p-6 md:p-10 font-sans relative text-left">
      {/* POP-UP MODAL REMINDER INSPEKSI */}
      {isModalReminderOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] border border-neutral-200 shadow-2xl p-6 md:p-8 max-w-sm w-full text-center">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mb-4 mx-auto animate-bounce">
              <AlertTriangle className="text-amber-600" size={24} />
            </div>
            <h3 className="text-base font-black uppercase tracking-tight text-neutral-900">
              PENGINGAT INSPEKSI AWAL
            </h3>
            <p className="text-xs text-neutral-500 mt-2 mb-6 leading-relaxed">
              {" "}
              Apakah Anda sudah memeriksa dan mendokumentasikan kondisi fisik
              kendaraan (lecet/baret)? Gunakan tombol **Upload Foto** pada kartu
              jika ada kerusakan awal.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setIsModalReminderOpen(false);
                  setTargetBookingId(null);
                }}
                className="flex-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold text-xs py-3 rounded-xl uppercase tracking-wider"
              >
                Cek Ulang
              </button>
              <button
                onClick={handleConfirmReminderProcess}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-3 rounded-xl uppercase tracking-wider shadow-md"
              >
                Sudah, Proses
              </button>
            </div>
          </div>
        </div>
      )}

      {/* POP-UP MODAL FORM INPUT OFFLINE */}
      {isModalOfflineOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] border border-neutral-200 shadow-2xl p-6 md:p-8 max-w-lg w-full text-left overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center border-b border-neutral-100 pb-3 mb-4">
              <h2 className="text-base font-black uppercase tracking-tight flex items-center gap-2 text-neutral-900">
                <Plus className="text-blue-600" size={20} /> Formulir Booking
                Manual
              </h2>
              <button
                onClick={() => setIsModalOfflineOpen(false)}
                className="text-neutral-400 hover:text-neutral-600"
              >
                <XCircle size={18} />
              </button>
            </div>
            <form
              onSubmit={handleSubmitOfflineBooking}
              className="space-y-4 text-xs font-semibold"
            >
              <div className="space-y-1">
                <label className="text-neutral-500 uppercase tracking-wider text-[10px]">
                  Nama Pelanggan Walk-In
                </label>
                <input
                  type="text"
                  required
                  placeholder="Masukkan nama pembeli..."
                  value={offlineForm.fullName}
                  onChange={(e) =>
                    setOfflineForm({ ...offlineForm, fullName: e.target.value })
                  }
                  className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-4 py-2.5 text-xs text-neutral-900 outline-none focus:border-blue-500 focus:bg-white transition-all"
                />
              </div>
              <div className="space-y-1">
                <label className="text-neutral-500 uppercase tracking-wider text-[10px]">
                  No. WhatsApp Aktif
                </label>
                <input
                  type="tel"
                  required
                  placeholder="Contoh: 081234..."
                  value={offlineForm.whatsapp}
                  onChange={(e) =>
                    setOfflineForm({ ...offlineForm, whatsapp: e.target.value })
                  }
                  className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-4 py-2.5 text-xs text-neutral-900 outline-none focus:border-blue-500 focus:bg-white transition-all"
                />
              </div>
              <div className="space-y-1 relative" ref={carDropdownRef}>
                <label className="text-neutral-500 uppercase tracking-wider text-[10px]">
                  Jenis Mobil
                </label>
                <div
                  onClick={() => setIsCarDropdownOpen(!isCarDropdownOpen)}
                  className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-4 py-2.5 text-xs text-neutral-900 flex justify-between items-center cursor-pointer hover:border-neutral-400 transition-all"
                >
                  <span
                    className={
                      offlineForm.vehicleInput
                        ? "text-neutral-900 font-bold"
                        : "text-neutral-400"
                    }
                  >
                    {offlineForm.vehicleInput ||
                      "Klik untuk mencari atau ketik nama mobil..."}
                  </span>
                  <ChevronDown size={14} className="text-neutral-400" />
                </div>
                {isCarDropdownOpen && (
                  <div className="absolute z-40 left-0 right-0 mt-1 bg-white border border-neutral-200 rounded-xl shadow-2xl flex flex-col max-h-48 overflow-hidden">
                    <div className="p-2 border-b border-neutral-100 bg-neutral-50 flex items-center gap-1.5">
                      <Search size={12} className="text-neutral-400" />
                      <input
                        type="text"
                        placeholder="Ketik merek/tipe mobil..."
                        value={carSearch}
                        onChange={(e) => {
                          const val = e.target.value;
                          setCarSearch(val);
                          setOfflineForm({
                            ...offlineForm,
                            vehicleInput: val,
                            idCars: null,
                          });
                        }}
                        className="w-full bg-transparent text-xs text-neutral-900 outline-none"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                    <div className="overflow-y-auto text-left">
                      {filteredCars.map((c) => {
                        const fullName = `${c.brand} ${c.model}`;
                        return (
                          <div
                            key={c.id_cars}
                            onClick={() => {
                              setOfflineForm({
                                ...offlineForm,
                                vehicleInput: fullName,
                                idCars: c.id_cars,
                              });
                              setIsCarDropdownOpen(false);
                              setCarSearch("");
                            }}
                            className="px-4 py-2 hover:bg-blue-50 text-neutral-800 cursor-pointer border-b border-neutral-50"
                          >
                            {" "}
                            {fullName}{" "}
                          </div>
                        );
                      })}
                      {carSearch.trim().length > 0 &&
                        filteredCars.length === 0 && (
                          <div className="px-4 py-2 text-neutral-400 italic text-[10px] bg-amber-50/40 text-center">
                            {" "}
                            ✨ Nama mobil kustom otomatis tersimpan.{" "}
                          </div>
                        )}
                    </div>
                  </div>
                )}
              </div>
              <div className="space-y-1">
                <label className="text-neutral-500 uppercase tracking-wider text-[10px]">
                  Tentukan Tanggal Jasa
                </label>
                <select
                  required
                  value={offlineForm.selectedDateId}
                  onChange={(e) =>
                    setOfflineForm({
                      ...offlineForm,
                      selectedDateId: e.target.value,
                    })
                  }
                  className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-4 py-2.5 text-xs text-neutral-900 outline-none focus:border-blue-500 cursor-pointer"
                >
                  <option value="">-- Pilih Slot Hari Kerja --</option>
                  {activeDates.map((d) => (
                    <option
                      key={d.id_available_dates}
                      value={d.id_available_dates}
                    >
                      {new Date(d.available_dates).toLocaleDateString("id-ID", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-neutral-500 uppercase tracking-wider text-[10px]">
                  Catatan Kasir / Catatan Lecet (Opsional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Keterangan tambahan order..."
                  value={offlineForm.note}
                  onChange={(e) =>
                    setOfflineForm({ ...offlineForm, note: e.target.value })
                  }
                  className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-4 py-2 text-xs text-neutral-900 outline-none focus:border-blue-500 resize-none"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOfflineOpen(false)}
                  className="flex-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold py-3 rounded-xl uppercase tracking-wider"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSavingOffline}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl uppercase tracking-wider shadow-md flex items-center justify-center"
                >
                  {isSavingOffline ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    "Simpan Transaksi Offline"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL MULTIPLE FOTO DOKUMENTASI INSPEKSI */}
      {isModalViewImageOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-white rounded-[2rem] overflow-hidden p-6 relative shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-neutral-100 pb-2">
              <h3 className="text-xs font-black uppercase tracking-wider text-neutral-800">
                Arsip Dokumentasi Fisik ({selectedImagesArray.length}/8 Foto)
              </h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-h-80 overflow-y-auto p-1">
              {selectedImagesArray.map((url, index) => (
                <a
                  key={index}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="aspect-video w-full bg-neutral-100 border border-neutral-200 rounded-xl overflow-hidden group relative shadow-sm block"
                >
                  <img
                    src={url}
                    alt={`Lecet ${index + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[8px] font-mono px-1 rounded">
                    #{index + 1}
                  </span>
                </a>
              ))}
            </div>
            <button
              type="button"
              onClick={() => {
                setIsModalViewImageOpen(false);
                setSelectedImagesArray([]);
              }}
              className="w-full bg-neutral-900 hover:bg-black text-white font-bold text-xs py-3.5 rounded-xl uppercase tracking-wider transition-all"
            >
              Tutup Galeri Inspeksi
            </button>
          </div>
        </div>
      )}

      {/* MODAL KUNCI NOMINAL HARGA */}
      {isModalPriceOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] border border-neutral-200 shadow-2xl p-6 md:p-8 max-w-md w-full text-left">
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
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold text-xs py-3.5 rounded-xl uppercase tracking-wider transition-all"
                >
                  Sah & Selesaikan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* HEADER UTAMA DASHBOARD */}
      <div className="max-w-4xl mx-auto space-y-10">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-neutral-200 pb-6">
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tight text-neutral-900">
              Kelola Antrean Booking
            </h1>
            <p className="text-xs text-neutral-500 mt-1">
              Validasi antrean order, otomasi rolling kalender workshop, dan
              upload berkas Nota customer.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => setIsModalOfflineOpen(true)}
              className="flex items-center gap-1.5 bg-neutral-900 hover:bg-black text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md transition-all active:scale-95"
            >
              <Plus size={14} /> <span>Pendaftaran Booking Offline</span>
            </button>
            <Link
              href="/admin/dashboard/bookings/history"
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 border border-blue-500 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md"
            >
              <FileText size={14} /> <span>Lihat Arsip Riwayat (Excel)</span>
            </Link>
            <button
              onClick={fetchDataAndRollCalendar}
              className="flex items-center gap-2 bg-white hover:bg-neutral-100 border border-neutral-300 px-4 py-2 rounded-xl text-xs font-semibold text-neutral-700 shadow-sm"
            >
              <RefreshCw size={14} /> <span>Segarkan</span>
            </button>
          </div>
        </div>

        {/* CONTROLLER ROLLING KALENDER */}
        <div className="bg-neutral-100 border border-neutral-200 rounded-[2rem] p-6 md:p-8 space-y-6 shadow-sm">
          <div>
            <h2 className="text-base font-bold uppercase tracking-wide flex items-center gap-2 text-neutral-900">
              <Calendar className="text-blue-600" size={18} /> Otomasi & Batasan
              Rentang Kalender Jasa
            </h2>
            <p className="text-[11px] text-neutral-500 mt-0.5">
              Atur dari tanggal berapa hingga tanggal berapa formulir booking di
              sisi client boleh diakses. Secara default, sistem auto-rolling
              memajukan 2 minggu ke depan.
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
                className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-4 py-3 text-xs text-neutral-900 outline-none focus:border-blue-500"
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
                className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-4 py-3 text-xs text-neutral-900 outline-none focus:border-blue-500"
              />
            </div>
            <button
              type="submit"
              disabled={isSettingRange}
              className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-6 py-3.5 rounded-xl uppercase tracking-wider whitespace-nowrap shadow-lg"
            >
              {isSettingRange ? "Memproses..." : "Kunci Batasan Baru"}
            </button>
          </form>
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-50 border border-blue-100 text-xs text-blue-700 font-mono">
            <Sparkles size={14} className="animate-pulse" />{" "}
            <span>{currentRangeText}</span>
          </div>
        </div>

        {/* LIST ANTREAN KARTU UTAMA */}
        <div className="space-y-4">
          {/* 🛠️ WIDGET BARU: INPUT PENCARIAN & FILTER TANGGAL ANTREAN BERJALAN */}
          <div className="bg-white border border-neutral-200 p-4 rounded-2xl flex flex-col sm:flex-row items-center gap-3 shadow-sm">
            <div className="w-full sm:flex-1 relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
                <Search size={14} />
              </span>
              <input
                type="text"
                placeholder="Cari nama pelanggan aktif..."
                value={searchNameQuery}
                onChange={(e) => setSearchNameQuery(e.target.value)}
                className="w-full bg-neutral-50 border border-neutral-300 rounded-xl pl-9 pr-8 py-2 text-xs font-semibold text-neutral-900 outline-none focus:border-blue-500 focus:bg-white transition-all"
              />
              {searchNameQuery && (
                <button
                  onClick={() => setSearchNameQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            <div className="w-full sm:w-[200px] relative">
              <input
                type="date"
                value={searchDateQuery}
                onChange={(e) => setSearchDateQuery(e.target.value)}
                className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-3 py-2 text-xs font-semibold text-neutral-900 outline-none focus:border-blue-500 focus:bg-white transition-all cursor-pointer"
              />
              {searchDateQuery && (
                <button
                  onClick={() => setSearchDateQuery("")}
                  className="absolute right-7 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                >
                  <X size={13} />
                </button>
              )}
            </div>
          </div>

          <div className="flex justify-between items-center px-1">
            <h2 className="text-base font-bold uppercase tracking-wide flex items-center gap-2 text-neutral-900">
              <Clock className="text-yellow-600" size={18} />
              Daftar Antrean Berjalan (
              {
                filteredBookings.filter(
                  (b) => b.status === "pending" || b.status === "proses",
                ).length
              }
              )
            </h2>
            {(searchNameQuery || searchDateQuery) && (
              <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                Ditemukan: {filteredBookings.length} data saringan
              </span>
            )}
          </div>

          {filteredBookings.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-neutral-200 rounded-[2rem] bg-white shadow-sm">
              <p className="text-sm text-neutral-400 font-light">
                {bookings.length === 0
                  ? "Tidak ada data antrean booking yang terdaftar saat ini."
                  : "Data tidak ditemukan. Coba ubah kata kunci atau tanggal saringan Anda."}
              </p>
            </div>
          ) : (
            <div className="max-h-[660px] overflow-y-auto pr-1 space-y-4 scrollbar-thin scrollbar-thumb-neutral-300">
              {/* 🛠️ MERUBAH ITERASI: BUKAN MEMBACA bookings TAPI MEMBACA HILIR SAKTI filteredBookings */}
              {filteredBookings.map((b) => {
                const currentId = b.id_bookings || b.id || "";
                const isUploadingImg = uploadingId === currentId + "_img";
                const imagesArray: string[] = Array.isArray(
                  b.inspection_image_url,
                )
                  ? b.inspection_image_url
                  : [];

                return (
                  <div
                    key={currentId}
                    className="p-6 bg-white text-neutral-900 rounded-[2rem] space-y-5 shadow-xl border border-neutral-200 relative text-left"
                  >
                    <div className="flex flex-wrap justify-between items-start gap-4 border-b border-neutral-200 pb-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-black text-neutral-900 uppercase text-base flex items-center gap-1.5">
                            <User size={15} className="text-neutral-500" />{" "}
                            {b.full_name}
                          </span>
                          <span className="text-[10px] text-neutral-400 font-mono bg-neutral-100 px-1.5 py-0.5 rounded">
                            ID:{" "}
                            {currentId
                              ? currentId.slice(0, 8).toUpperCase()
                              : "LOADING"}
                          </span>
                          {b.total_price > 0 && (
                            <span className="text-[10px] text-green-700 font-bold bg-green-50 border border-green-200 px-2 py-0.5 rounded-md">
                              Nominal: Rp{" "}
                              {b.total_price.toLocaleString("id-ID")}
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
                                  editingBookingId === currentId
                                    ? null
                                    : currentId,
                                );
                                setNewSelectedDateId(
                                  b.id_available_dates
                                    ? String(b.id_available_dates)
                                    : "",
                                );
                              }}
                              className="text-blue-600 flex items-center gap-0.5 font-bold hover:underline"
                            >
                              <Edit2 size={11} /> Reschedule
                            </button>
                          )}
                        </div>
                      </div>
                      <span
                        className={`text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-md border ${b.status === "selesai" ? "bg-green-50 text-green-600 border-green-200" : b.status === "proses" ? "bg-blue-50 text-blue-600 border-blue-200" : b.status === "batal" ? "bg-red-50 text-red-600 border-red-200" : "bg-yellow-50 text-yellow-600 border-yellow-200"}`}
                      >
                        {b.status}
                      </span>
                    </div>

                    {/* INTERFACE RESCHEDULE */}
                    {editingBookingId === currentId && (
                      <div className="p-4 bg-neutral-50 border border-neutral-300 rounded-xl flex flex-col sm:flex-row items-end gap-3 text-xs">
                        <div className="flex-1 space-y-1.5 w-full">
                          <label className="font-bold text-neutral-500 uppercase text-[10px]">
                            Pilih Tanggal Baru Workshop
                          </label>
                          <select
                            value={newSelectedDateId}
                            onChange={(e) =>
                              setNewSelectedDateId(e.target.value)
                            }
                            className="w-full bg-white border border-neutral-300 rounded-xl px-3 py-2 text-neutral-900 outline-none focus:border-blue-500 cursor-pointer shadow-sm"
                          >
                            <option value="">-- Pilih Slot Baru --</option>
                            {activeDates.map((d) => (
                              <option
                                key={d.id_available_dates}
                                value={d.id_available_dates}
                              >
                                {new Date(d.available_dates).toLocaleDateString(
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
                            onClick={() => handleRescheduleBooking(currentId)}
                            disabled={actionLoadingId !== null}
                            className="flex-1 sm:flex-none bg-blue-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-blue-700 transition-all"
                          >
                            Simpan
                          </button>
                        </div>
                      </div>
                    )}

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

                    {/* SEKTOR BACK-OFFICE HIBRIDA CONTEXT AREA */}
                    <div className="flex flex-col gap-3.5 bg-neutral-50 p-4 rounded-2xl border border-neutral-200 text-xs">
                      {/* UPLOAD FOTO INSPEKSI MAX 8 */}
                      {b.status !== "batal" && (
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-200 pb-3">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] uppercase font-black text-neutral-400 flex items-center gap-1">
                              <Camera size={13} /> Bukti Cacat Fisik (
                              {imagesArray.length}/8):
                            </span>
                            {imagesArray.length > 0 ? (
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedImagesArray(imagesArray);
                                  setIsModalViewImageOpen(true);
                                }}
                                className="inline-flex items-center gap-1 text-blue-600 font-extrabold hover:underline"
                              >
                                <Eye size={12} /> Buka Galeri (
                                {imagesArray.length} Foto)
                              </button>
                            ) : (
                              <span className="text-neutral-400 font-medium italic text-[11px]">
                                Mobil Mulus / Belum ada foto
                              </span>
                            )}
                          </div>

                          {(b.status === "pending" ||
                            b.status === "proses") && (
                            <label
                              className={`flex items-center justify-center gap-1.5 px-3 py-1.5 bg-white border border-neutral-300 rounded-xl text-[11px] font-bold shadow-sm transition-all ${imagesArray.length >= 8 ? "opacity-40 cursor-not-allowed bg-neutral-100" : "cursor-pointer text-neutral-700 hover:bg-neutral-100"}`}
                            >
                              {isUploadingImg ? (
                                <Loader2
                                  size={12}
                                  className="animate-spin text-blue-600"
                                />
                              ) : (
                                <Upload size={12} />
                              )}
                              <span>
                                {imagesArray.length >= 8
                                  ? "Maksimal 8 Foto"
                                  : "Upload Foto Inspeksi"}
                              </span>
                              <input
                                type="file"
                                accept="image/*"
                                disabled={
                                  uploadingId !== null ||
                                  imagesArray.length >= 8
                                }
                                onChange={(e) =>
                                  handleUploadInspectionFile(
                                    e,
                                    currentId,
                                    imagesArray,
                                  )
                                }
                                className="hidden"
                              />
                            </label>
                          )}
                        </div>
                      )}

                      {/* UPLOAD PDF NOTA KASIR */}
                      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
                        <div className="flex items-center gap-2">
                          {b.receipt_pdf_url ? (
                            <div className="flex items-center gap-3">
                              <a
                                href={b.receipt_pdf_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-xs text-blue-600 font-semibold hover:underline"
                              >
                                <ExternalLink size={14} />{" "}
                                <span>Lihat Nota Terunggah</span>
                              </a>
                              {b.status === "proses" && (
                                <label className="text-[10px] bg-neutral-200 hover:bg-neutral-300 text-neutral-700 px-2.5 py-1 rounded-lg cursor-pointer transition-colors font-medium">
                                  Ganti PDF
                                  <input
                                    type="file"
                                    accept="application/pdf"
                                    disabled={uploadingId !== null}
                                    onChange={(e) =>
                                      handleUploadReceipt(e, currentId)
                                    }
                                    className="hidden"
                                  />
                                </label>
                              )}
                            </div>
                          ) : b.status !== "batal" && b.status !== "selesai" ? (
                            <div className="flex items-center gap-2.5">
                              <label className="flex items-center gap-2 bg-white hover:bg-neutral-100 text-neutral-800 border border-neutral-300 text-xs font-bold px-3 py-2 rounded-xl cursor-pointer shadow-sm transition-colors">
                                {uploadingId === currentId ? (
                                  <Loader2
                                    size={14}
                                    className="animate-spin text-blue-600"
                                  />
                                ) : (
                                  <Upload
                                    size={14}
                                    className="text-neutral-500"
                                  />
                                )}
                                <span>
                                  {uploadingId === currentId
                                    ? "Memproses..."
                                    : "Upload PDF Nota"}
                                </span>
                                <input
                                  type="file"
                                  accept="application/pdf"
                                  disabled={uploadingId !== null}
                                  onChange={(e) =>
                                    handleUploadReceipt(e, currentId)
                                  }
                                  className="hidden"
                                />
                              </label>
                              {b.status === "proses" && (
                                <span className="flex items-center gap-1 text-[11px] text-amber-600 font-medium bg-amber-50 px-2.5 py-1.5 rounded-xl border border-amber-200">
                                  <AlertCircle size={13} /> Wajib upload PDF
                                  Nota untuk unlock tutup orderan
                                </span>
                              )}
                            </div>
                          ) : null}
                        </div>

                        <div className="flex items-center gap-2 justify-end">
                          {b.status !== "selesai" && b.status !== "batal" && (
                            <button
                              type="button"
                              disabled={actionLoadingId !== null}
                              onClick={() => handleCancelBooking(currentId)}
                              className="inline-flex items-center justify-center gap-1 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-xl text-xs font-bold transition-all"
                            >
                              <XCircle size={14} /> <span>Batalkan</span>
                            </button>
                          )}

                          {b.status !== "selesai" && b.status !== "batal" ? (
                            <button
                              type="button"
                              disabled={
                                actionLoadingId !== null ||
                                (b.status === "proses" && !b.receipt_pdf_url)
                              }
                              onClick={() =>
                                handleUpdateStatus(
                                  currentId,
                                  b.status,
                                  b.receipt_pdf_url,
                                )
                              }
                              className={`inline-flex items-center justify-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all active:scale-[0.98] ${b.status === "pending" ? "bg-blue-600 hover:bg-blue-700 text-white shadow-md" : b.receipt_pdf_url ? "bg-green-600 hover:bg-green-700 text-white shadow-md" : "bg-neutral-200 text-neutral-400 border border-neutral-300 cursor-not-allowed opacity-60"}`}
                            >
                              {actionLoadingId === currentId ? (
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
                              className={`flex items-center gap-1 text-xs font-bold px-3 py-1.5 border rounded-xl ${b.status === "selesai" ? "text-green-700 bg-green-50 border-green-200" : "text-red-700 bg-red-50 border-red-200"}`}
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
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
