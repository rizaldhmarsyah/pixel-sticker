// src/app/admin/dashboard/laporan/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import * as XLSX from "xlsx";
import {
  BarChart3,
  Calendar,
  TrendingUp,
  DollarSign,
  FileSpreadsheet,
  RefreshCw,
  Loader2,
  Layers,
  PlusCircle,
  FileDown,
  UserPlus,
  Upload,
  ArrowRight,
} from "lucide-react";

export default function AdminLaporanPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [isSubmittingOffline, setIsSubmittingOffline] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [adminUser, setAdminUser] = useState<any>(null);

  // State Data Master
  const [allTransactions, setAllTransactions] = useState<any[]>([]);

  // State Filter Aktif (yang digunakan untuk merender data)
  const currentYear = new Date().getFullYear().toString();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState("all");

  // State Temporary (Menampung pilihan dropdown sebelum klik tombol Submit)
  const [tempYear, setTempYear] = useState(currentYear);
  const [tempMonth, setTempMonth] = useState("all");

  // State Pop-up Modal Unduh Excel
  const [isModalExcelOpen, setIsModalExcelOpen] = useState(false);
  const [excelStartDate, setExcelStartDate] = useState("");
  const [excelEndDate, setExcelEndDate] = useState("");

  // State Pop-up Modal Input Kasir Manual (Walk-in Toko)
  const [isModalOfflineOpen, setIsModalOfflineOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [offlineForm, setOfflineForm] = useState({
    customerName: "",
    carModel: "",
    totalPrice: "",
    customerNote: "",
  });

  // State Card Informasi Ringkasan Keuangan (Sekarang Dinamis)
  const [summary, setSummary] = useState({
    totalPendapatanBulanIni: 0,
    totalPendapatanTahunIni: 0,
    totalTransaksiSukses: 0,
  });

  // Ambil session admin yang sedang aktif login
  useEffect(() => {
    const getAdminSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) {
        setAdminUser(session.user);
      }
    };
    getAdminSession();
  }, [supabase]);

  const fetchLaporanData = async () => {
    setLoading(true);
    try {
      const { data: bookingsData, error } = await supabase
        .from("bookings")
        .select(
          "id, full_name, car_model, total_price, created_at, user_id, receipt_pdf_url, customer_note",
        )
        .eq("status", "selesai");

      if (error) throw error;

      const formattedData = (bookingsData || []).map((b) => {
        const isOffline = b.customer_note?.includes("[Offline Kasir]");
        return {
          id: b.id,
          tanggal: b.created_at,
          nama: b.full_name,
          keterangan: `Wrapping Jasa (${b.car_model})`,
          sumber: isOffline ? "Walk-in Offline" : "Booking Online",
          nominal: b.total_price || 0,
          receipt: b.receipt_pdf_url || null,
        };
      });

      const combined = formattedData.sort(
        (a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime(),
      );

      setAllTransactions(combined);

      // Hitung ringkasan awal berdasarkan default currentYear dan selectedMonth ("all")
      calculateExecutiveSummary(combined, currentYear, "all");
    } catch (err: any) {
      console.error("Gagal sinkronisasi data laporan:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLaporanData();
  }, []);

  // FUNGSI UTAMA KALKULASI DINAMIS UNTUK 3 KARTU RINGKASAN SESUAI FILTER YANG DISUBMIT
  const calculateExecutiveSummary = (
    dataList: any[],
    yearFilter: string,
    monthFilter: string,
  ) => {
    let totalBulanIni = 0;
    let totalTahunIni = 0;
    let counterSukses = 0;

    dataList.forEach((t) => {
      const tDate = new Date(t.tanggal);
      const tYear = tDate.getFullYear().toString();
      const tMonth = String(tDate.getMonth() + 1).padStart(2, "0");

      // Cek kecocokan tahun
      const matchYear = tYear === yearFilter;
      // Cek kecocokan bulan (jika "all", berarti semua bulan di tahun tersebut lolos)
      const matchMonth = monthFilter === "all" || tMonth === monthFilter;

      if (matchYear) {
        totalTahunIni += t.nominal; // Akumulasi total tahunan dari tahun terpilih

        if (monthFilter === "all") {
          // Jika milih semua bulan, "Bulan Ini" diisi sama dengan total tahun tersebut atau bisa disesuaikan
          if (
            tMonth === String(new Date().getMonth() + 1).padStart(2, "0") &&
            yearFilter === new Date().getFullYear().toString()
          ) {
            totalBulanIni += t.nominal;
          }
        } else if (tMonth === monthFilter) {
          totalBulanIni += t.nominal; // Akumulasi khusus bulan terpilih
        }
      }

      // Hitung volume transaksi yang lolos kriteria filter aktif saat ini
      if (matchYear && matchMonth) {
        counterSukses++;
      }
    });

    setSummary({
      totalPendapatanBulanIni:
        monthFilter === "all" ? totalTahunIni : totalBulanIni, // Jika all, tampilkan total tahunan di kartu pertama agar balance
      totalPendapatanTahunIni: totalTahunIni,
      totalTransaksiSukses: counterSukses,
    });
  };

  // HANDLER TOMBOL SUBMIT UNTUK MENERAPKAN FILTER BERKALA
  const handleApplyFilter = () => {
    setSelectedYear(tempYear);
    setSelectedMonth(tempMonth);
    // Jalankan ulang kalkulasi ringkasan card berdasarkan filter baru
    calculateExecutiveSummary(allTransactions, tempYear, tempMonth);
  };

  // FITUR EKSPOR SPREADSHEET EXCEL BERDASARKAN FILTER MODAL
  const handleConfirmExportExcel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!excelStartDate || !excelEndDate) {
      return alert("Silakan lengkapi rentang tanggal penarikan laporan!");
    }
    if (excelStartDate > excelEndDate) {
      return alert("Tanggal mulai tidak boleh melebihi tanggal selesai!");
    }

    const startRange = new Date(excelStartDate + "T00:00:00");
    const endRange = new Date(excelEndDate + "T23:59:59");

    const excelFilteredData = allTransactions.filter((t) => {
      const tDate = new Date(t.tanggal);
      return tDate >= startRange && tDate <= endRange;
    });

    if (excelFilteredData.length === 0) {
      return alert(
        "Tidak ada data transaksi kas yang terekam pada rentang tanggal tersebut!",
      );
    }

    const excelRows = excelFilteredData.map((t) => ({
      "Tanggal Transaksi": new Date(t.tanggal).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }),
      "Nama Pelanggan": t.nama.toUpperCase(),
      "Deskripsi Pengerjaan": t.keterangan,
      "Jalur Transaksi": t.sumber,
      "Tautan Berkas Kuitansi/Nota": t.receipt || "Belum diunggah",
      "Nominal Pendapatan (Rp)": t.nominal,
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data Rekap Kasir");

    XLSX.writeFile(
      workbook,
      `Laporan_Omzet_PixelSticker_${excelStartDate}_to_${excelEndDate}.xlsx`,
    );

    setIsModalExcelOpen(false);
    setExcelStartDate("");
    setExcelEndDate("");
  };

  // Handler Kirim Kasir Toko Walk-in Offline
  const handleSubmitOfflineOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !offlineForm.customerName.trim() ||
      !offlineForm.carModel.trim() ||
      !offlineForm.totalPrice ||
      !adminUser
    ) {
      return alert("Silakan lengkapi data transaksi kasir!");
    }

    setIsSubmittingOffline(true);
    let uploadedReceiptUrl = null;

    try {
      if (selectedFile) {
        setUploadingFile(true);
        const fileExt = selectedFile.name.split(".").pop();
        const fileName = `manual_receipt_${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("receipts")
          .upload(fileName, selectedFile);

        if (uploadError) throw uploadError;

        const {
          data: { publicUrl },
        } = supabase.storage.from("receipts").getPublicUrl(fileName);
        uploadedReceiptUrl = publicUrl;
      }

      const parsedPrice = parseFloat(offlineForm.totalPrice);
      const todayStr = new Date().toISOString().substring(0, 10);

      const { error: insertError } = await supabase.from("bookings").insert([
        {
          user_id: adminUser.id,
          full_name: offlineForm.customerName,
          whatsapp_number: "Walk-in Kasir",
          car_model: offlineForm.carModel,
          customer_note: offlineForm.customerNote
            ? `${offlineForm.customerNote} [Offline Kasir]`
            : "[Offline Kasir]",
          booking_date: todayStr,
          status: "selesai",
          total_price: parsedPrice,
          receipt_pdf_url: uploadedReceiptUrl,
        },
      ]);

      if (insertError) throw insertError;

      alert("Transaksi Kasir Offline sukses dicatatkan!");
      setIsModalOfflineOpen(false);
      setSelectedFile(null);
      setOfflineForm({
        customerName: "",
        carModel: "",
        totalPrice: "",
        customerNote: "",
      });
      fetchLaporanData();
    } catch (err: any) {
      alert("Gagal memproses kasir offline: " + err.message);
    } finally {
      setIsSubmittingOffline(false);
      setUploadingFile(false);
    }
  };

  // Filter Data yang tampil di Tabel & Grafik (Hanya berubah setelah tombol Submit ditekan)
  const filteredTransactions = allTransactions.filter((t) => {
    const tDate = new Date(t.tanggal);
    const tYear = tDate.getFullYear().toString();
    const tMonth = String(tDate.getMonth() + 1).padStart(2, "0");

    const matchYear = tYear === selectedYear;
    const matchMonth = selectedMonth === "all" || tMonth === selectedMonth;

    return matchYear && matchMonth;
  });

  // Hitung data visualisasi grafik batang (Mengikuti selectedYear yang aktif disubmit)
  const bulananNominalArray = Array(12).fill(0);
  allTransactions.forEach((t) => {
    const tDate = new Date(t.tanggal);
    if (tDate.getFullYear().toString() === selectedYear) {
      const indexBulan = tDate.getMonth();
      bulananNominalArray[indexBulan] += t.nominal;
    }
  });

  const namaBulanList = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "Mei",
    "Jun",
    "Jul",
    "Agu",
    "Sep",
    "Okt",
    "Nov",
    "Des",
  ];
  const maxNominalGrafik = Math.max(...bulananNominalArray, 1000000);

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 p-6 md:p-10 font-sans text-left relative">
      {/* POP-UP DIALOG UNTUK FILTRASI DOWNLOAD EXCEL */}
      {isModalExcelOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] border border-neutral-200 shadow-2xl p-6 md:p-8 max-w-md w-full animate-in zoom-in-95 duration-150 text-left">
            <div className="w-12 h-12 rounded-2xl bg-green-50 border border-green-200 flex items-center justify-center mb-4">
              <FileSpreadsheet className="text-green-600" size={22} />
            </div>
            <h3 className="text-base font-black uppercase tracking-tight text-neutral-900">
              Rentang Tanggal Excel
            </h3>
            <p className="text-xs text-neutral-500 mt-1 mb-5">
              Tentukan batasan tanggal penarikan omzet penjualan kasir untuk
              diunduh menjadi berkas spreadsheet Excel.
            </p>

            <form onSubmit={handleConfirmExportExcel} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-neutral-500 tracking-wider">
                    Dari Tanggal
                  </label>
                  <input
                    type="date"
                    required
                    value={excelStartDate}
                    onChange={(e) => setExcelStartDate(e.target.value)}
                    className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-3 py-2.5 text-xs font-semibold text-neutral-900 outline-none focus:border-green-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-neutral-500 tracking-wider">
                    Sampai Tanggal
                  </label>
                  <input
                    type="date"
                    required
                    value={excelEndDate}
                    onChange={(e) => setExcelEndDate(e.target.value)}
                    className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-3 py-2.5 text-xs font-semibold text-neutral-900 outline-none focus:border-green-500"
                  />
                </div>
              </div>
              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalExcelOpen(false);
                    setExcelStartDate("");
                    setExcelEndDate("");
                  }}
                  className="flex-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold text-xs py-3.5 rounded-xl uppercase tracking-wider"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold text-xs py-3.5 rounded-xl uppercase tracking-wider shadow-lg flex items-center justify-center gap-1"
                >
                  <FileSpreadsheet size={14} /> <span>Unduh Berkas</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* POP-UP MODAL INPUT TRANSAKSI OFFLINE KASIR */}
      {isModalOfflineOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] border border-neutral-200 shadow-2xl p-6 md:p-8 max-w-md w-full max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-150 text-left scrollbar-none">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center mb-4">
              <UserPlus className="text-blue-600" size={22} />
            </div>
            <h3 className="text-base font-black uppercase tracking-tight text-neutral-900">
              Input Transaksi Toko (Offline)
            </h3>
            <form onSubmit={handleSubmitOfflineOrder} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-neutral-500 tracking-wider">
                  Nama Pelanggan Walk-in
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Sapto"
                  value={offlineForm.customerName}
                  onChange={(e) =>
                    setOfflineForm({
                      ...offlineForm,
                      customerName: e.target.value,
                    })
                  }
                  className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-4 py-2.5 text-xs text-neutral-900 outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-neutral-500 tracking-wider">
                  Unit Kendaraan
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Pajero Sport"
                  value={offlineForm.carModel}
                  onChange={(e) =>
                    setOfflineForm({ ...offlineForm, carModel: e.target.value })
                  }
                  className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-4 py-2.5 text-xs text-neutral-900 outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-neutral-500 tracking-wider">
                  Total Nominal Biaya (Rp)
                </label>
                <input
                  type="number"
                  required
                  placeholder="Contoh: 6000000"
                  value={offlineForm.totalPrice}
                  onChange={(e) =>
                    setOfflineForm({
                      ...offlineForm,
                      totalPrice: e.target.value,
                    })
                  }
                  className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-4 py-2.5 text-xs font-bold text-neutral-900 outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-neutral-500 tracking-wider">
                  Unggah Berkas Kuitansi Fisik
                </label>
                <label className="flex items-center justify-center gap-2 bg-neutral-50 hover:bg-neutral-100 border border-neutral-300 border-dashed text-xs py-3 rounded-xl cursor-pointer">
                  <Upload size={14} className="text-neutral-400" />
                  <span className="font-semibold text-neutral-600">
                    {selectedFile
                      ? selectedFile.name.slice(0, 24) + "..."
                      : "Pilih Foto Kuitansi Manual"}
                  </span>
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={(e) =>
                      setSelectedFile(e.target.files?.[0] || null)
                    }
                    className="hidden"
                  />
                </label>
              </div>
              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOfflineOpen(false);
                    setSelectedFile(null);
                  }}
                  className="flex-1 bg-neutral-100 text-neutral-700 font-bold text-xs py-3.5 rounded-xl uppercase"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingOffline}
                  className="flex-1 bg-blue-600 text-white font-bold text-xs py-3.5 rounded-xl uppercase"
                >
                  {isSubmittingOffline ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    "Simpan Transaksi"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto space-y-8">
        {/* HEADER MODUL */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-neutral-200 pb-6">
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tight text-neutral-900 flex items-center gap-2">
              <BarChart3 className="text-blue-600" size={24} /> Laporan
              Pendapatan Owner
            </h1>
            <p className="text-xs text-neutral-500 mt-1">
              Analisis grafik omzet berkala, integrasi data otomatis booking
              sistem digital dan kasir penjualan offline workshop.
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => setIsModalOfflineOpen(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-md"
            >
              <PlusCircle size={14} /> <span>Input Manual Kasir</span>
            </button>
            <button
              onClick={() => setIsModalExcelOpen(true)}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-md"
            >
              <FileSpreadsheet size={14} /> <span>Ekspor Berkas Excel</span>
            </button>
            <button
              onClick={fetchLaporanData}
              className="p-2.5 bg-white border border-neutral-300 rounded-xl text-neutral-700"
            >
              <RefreshCw size={14} />
            </button>
          </div>
        </div>

        {/* 3 KARTU SUMMARY EKSEKUTIF - SEKARANG NILAINYA DINAMIS IKUTI FILTER ACTIVE */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-neutral-200 rounded-3xl p-6 shadow-xl space-y-2 relative overflow-hidden">
            <div className="absolute right-4 top-4 p-2 bg-blue-50 text-blue-600 rounded-xl">
              <DollarSign size={16} />
            </div>
            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
              {selectedMonth === "all"
                ? `Omzet Tahun ${selectedYear}`
                : "Omzet Bulan Terpilih"}
            </p>
            <h3 className="text-xl font-black text-neutral-900">
              Rp {summary.totalPendapatanBulanIni.toLocaleString("id-ID")}
            </h3>
            <p className="text-[11px] text-neutral-500">
              Berdasarkan filter submisian aktif
            </p>
          </div>
          <div className="bg-white border border-neutral-200 rounded-3xl p-6 shadow-xl space-y-2 relative overflow-hidden">
            <div className="absolute right-4 top-4 p-2 bg-green-50 text-green-600 rounded-xl">
              <TrendingUp size={16} />
            </div>
            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
              Total Pendapatan Tahun {selectedYear}
            </p>
            <h3 className="text-xl font-black text-neutral-900">
              Rp {summary.totalPendapatanTahunIni.toLocaleString("id-ID")}
            </h3>
            <p className="text-[11px] text-neutral-500">
              Akumulasi total setahun penuh
            </p>
          </div>
          <div className="bg-white border border-neutral-200 rounded-3xl p-6 shadow-xl space-y-2 relative overflow-hidden">
            <div className="absolute right-4 top-4 p-2 bg-yellow-50 text-yellow-600 rounded-xl">
              <Layers size={16} />
            </div>
            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
              Volume Transaksi Terfilter
            </p>
            <h3 className="text-xl font-black text-neutral-900">
              {summary.totalTransaksiSukses} Transaksi
            </h3>
            <p className="text-[11px] text-neutral-500">
              Kombinasi data kas yang lolos saringan
            </p>
          </div>
        </div>

        {/* REVISI UTAMA: PANEL KONTROL FILTER DENGAN TOMBOL SUBMIT */}
        <div className="bg-white border border-neutral-200 p-5 rounded-2xl flex flex-wrap gap-4 items-center shadow-sm">
          <div className="flex items-center gap-1.5 font-bold text-xs text-neutral-700">
            <Calendar size={16} className="text-neutral-400" />
            <span>Tampilan Ringkasan Berkala:</span>
          </div>

          {/* Ubah value ke tempYear agar tidak langsung trigger filter data sebelum disubmit */}
          <select
            value={tempYear}
            onChange={(e) => setTempYear(e.target.value)}
            className="bg-neutral-50 border border-neutral-300 rounded-xl px-3 py-2 text-xs font-semibold text-neutral-900 outline-none cursor-pointer focus:border-blue-500"
          >
            <option value="2025">Tahun 2025</option>
            <option value="2026">Tahun 2026</option>
            <option value="2027">Tahun 2027</option>
          </select>

          {/* Ubah value ke tempMonth */}
          <select
            value={tempMonth}
            onChange={(e) => setTempMonth(e.target.value)}
            className="bg-neutral-50 border border-neutral-300 rounded-xl px-3 py-2 text-xs font-semibold text-neutral-900 outline-none cursor-pointer focus:border-blue-500"
          >
            <option value="all">Semua Bulan (Laporan Tahunan)</option>
            <option value="01">Januari</option>
            <option value="02">Februari</option>
            <option value="03">Maret</option>
            <option value="04">April</option>
            <option value="05">Mei</option>
            <option value="06">Juni</option>
            <option value="07">Juli</option>
            <option value="08">Agustus</option>
            <option value="09">September</option>
            <option value="10">Oktober</option>
            <option value="11">November</option>
            <option value="12">Desember</option>
          </select>

          {/* REVISI UTAMA: TOMBOL SUBMIT NYENTRIK DI SEBELAH KANAN DROPDOWN */}
          <button
            type="button"
            onClick={handleApplyFilter}
            className="bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs px-5 py-2 rounded-xl uppercase tracking-wider transition-all duration-150 active:scale-95 shadow-md"
          >
            Submit
          </button>
        </div>

        {/* VISUALISASI CHART TREN BULANAN */}
        <div className="bg-white border border-neutral-200 rounded-[2rem] p-6 md:p-8 shadow-sm space-y-6">
          <div>
            <h2 className="text-sm font-black uppercase tracking-wide text-neutral-900">
              Grafik Bar Tren Omzet Tahun {selectedYear}
            </h2>
            <p className="text-[11px] text-neutral-500">
              Visualisasi naik-turun akumulasi kas masuk total per bulan
              berjalan.
            </p>
          </div>
          <div className="h-64 flex items-end gap-2 pt-6 border-b border-l border-neutral-200 px-4 relative">
            {bulananNominalArray.map((nominal, idx) => {
              const persenTinggi = (nominal / maxNominalGrafik) * 100;
              return (
                <div
                  key={idx}
                  className="flex-1 flex flex-col items-center gap-2 h-full justify-end group"
                >
                  <div className="opacity-0 group-hover:opacity-100 bg-neutral-900 text-white text-[9px] py-1 px-1.5 rounded absolute mb-28 transition-all font-mono shadow-md z-10">
                    Rp {nominal.toLocaleString("id-ID")}
                  </div>
                  <div
                    style={{ height: `${Math.max(persenTinggi, 3)}%` }}
                    className={`w-full rounded-t-lg transition-all duration-500 ${nominal > 0 ? "bg-blue-600 group-hover:bg-blue-700 shadow-md" : "bg-neutral-100"}`}
                  />
                  <span className="text-[10px] font-bold text-slate-400 mt-2 font-mono">
                    {namaBulanList[idx]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* TABEL DATA LOG RINCIAN KAS AKHIR */}
        <div className="bg-white border border-neutral-200 rounded-[2rem] p-6 shadow-sm space-y-4 overflow-hidden">
          <div>
            <h2 className="text-sm font-black uppercase tracking-wide text-neutral-900">
              Rincian Buku Kas Transaksi ({filteredTransactions.length} Data)
            </h2>
            <p className="text-[11px] text-neutral-500">
              Detail komparasi riil kuitansi masuk digital online maupun
              konvensional offline toko terfilter.
            </p>
          </div>
          <div className="overflow-x-auto rounded-xl border border-neutral-200">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-neutral-900 text-white font-extrabold uppercase tracking-wider text-[10px]">
                  <th className="p-4">Tanggal</th>
                  <th className="p-4">Nama Pelanggan</th>
                  <th className="p-4">Layanan / Deskripsi</th>
                  <th className="p-4">Pintu Sumber</th>
                  <th className="p-4 text-center">Kuitansi Resmi</th>
                  <th className="p-4 text-right">Nominal Omzet</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 font-medium">
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="p-8 text-center text-neutral-400 font-light italic bg-neutral-50"
                    >
                      Tidak ada rekaman transaksi kas pendapatan pada
                      bulan/tahun yang dipilih. Silakan klik Submit untuk
                      me-refresh data.
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((t, index) => (
                    <tr
                      key={index}
                      className="hover:bg-neutral-50 transition-colors"
                    >
                      <td className="p-4 font-mono text-neutral-500">
                        {new Date(t.tanggal).toLocaleDateString("id-ID", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })}
                      </td>
                      <td className="p-4 font-bold text-neutral-900 uppercase">
                        {t.nama}
                      </td>
                      <td className="p-4 text-neutral-600">{t.keterangan}</td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-0.5 text-[9px] font-extrabold uppercase rounded border ${t.sumber === "Booking Online" ? "bg-blue-50 text-blue-600 border-blue-200" : "bg-purple-50 text-purple-600 border-purple-200"}`}
                        >
                          {t.sumber}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        {t.receipt ? (
                          <a
                            href={t.receipt}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-lg text-[10px] font-bold border border-neutral-300 transition-colors"
                          >
                            <FileDown size={12} className="text-neutral-500" />
                            <span>Unduh / Lihat</span>
                          </a>
                        ) : (
                          <span className="text-neutral-400 font-normal italic text-[11px]">
                            Belum diunggah
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right font-black text-neutral-900 font-mono">
                        Rp {t.nominal.toLocaleString("id-ID")}
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
  );
}
