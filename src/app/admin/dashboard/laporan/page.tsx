"use client";

import React, { useState, useEffect, useMemo } from "react";
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
  ChevronLeft,
  ChevronRight,
  TrendingDown,
  MinusCircle,
} from "lucide-react";

export default function AdminLaporanPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [isSubmittingOffline, setIsSubmittingOffline] = useState(false);
  const [isSubmittingExpense, setIsSubmittingExpense] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [adminUser, setAdminUser] = useState<any>(null);

  // State Data Master Keuangan
  const [allIncomeTransactions, setAllIncomeTransactions] = useState<any[]>([]);
  const [allExpenseTransactions, setAllExpenseTransactions] = useState<any[]>(
    [],
  );

  // State Filter Aktif
  const currentYear = new Date().getFullYear().toString();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState("all");

  // State Temporary Form Dropdown
  const [tempYear, setTempYear] = useState(currentYear);
  const [tempMonth, setTempMonth] = useState("all");

  // Pagination Config
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 100;

  // State Modals
  const [isModalOfflineOpen, setIsModalOfflineOpen] = useState(false);
  const [isModalExpenseOpen, setIsModalExpenseOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // State Forms Input
  const [offlineForm, setOfflineForm] = useState({
    customerName: "",
    carModel: "",
    totalPrice: "",
    customerNote: "",
  });

  const [expenseForm, setExpenseForm] = useState({
    description: "",
    totalAmount: "",
  });

  // State Ringkasan Eksekutif Finansial
  const [summary, setSummary] = useState({
    totalPemasukan: 0,
    totalPengeluaran: 0,
    keuntunganBersih: 0,
    totalTransaksiSukses: 0,
  });

  // Memeriksa sesi login admin
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

  // FUNGSI UTAMA AMBIL DATA - FIXING DOUBLE ENTRY PEMASUKAN NOTA OFFLINE
  const fetchLaporanData = async () => {
    setLoading(true);
    try {
      // 1. Ambil SEMUA Data Pemasukan (Online & Manual Kasir) dari Tabel Bookings
      const { data: bookingsData, error: bookingsError } = await supabase
        .from("bookings")
        .select(
          "id_bookings, full_name, car_model, total_price, created_at, receipt_pdf_url, customer_note",
        )
        .eq("status", "selesai")
        .order("created_at", { ascending: false });

      if (bookingsError) throw bookingsError;

      const formattedIncome = (bookingsData || []).map((b) => {
        const isOffline = b.customer_note?.includes("[Offline Kasir]");
        return {
          id: b.id_bookings || "",
          tanggal: b.created_at,
          nama: b.full_name || "Pelanggan Workshop",
          keterangan: b.customer_note?.includes("[Offline Kasir]")
            ? `${b.customer_note.replace(" [Offline Kasir]", "")}`
            : `Wrapping Jasa (${b.car_model})`,
          jenis: "Pemasukan",
          sumber: isOffline ? "Walk-in Offline" : "Booking Online",
          nominal: b.total_price || 0,
          receipt: b.receipt_pdf_url || null,
        };
      });

      // 2. Ambil HANYA Data Pengeluaran dari Tabel Receipts (Menendang Data Nota Pembelian ADAS dkk)
      const { data: receiptsData, error: receiptsError } = await supabase
        .from("receipts")
        .select(
          "id_receipts, receipt_no, customer_name, description, total_amount, created_at",
        )
        .eq("customer_name", "KAS_KELUAR") // 👈 PERBAIKAN TOTAL: Hanya tarik data pengeluaran operasional bengkel!
        .order("created_at", { ascending: false });

      if (receiptsError) throw receiptsError;

      const formattedExpense = (receiptsData || []).map((r) => ({
        id: r.id_receipts || r.receipt_no || "",
        tanggal: r.created_at,
        nama: "ADMIN",
        keterangan: r.description || "Pengeluaran Operasional",
        jenis: "Pengeluaran",
        sumber: "Kas Toko Keluar",
        nominal: r.total_amount || 0,
        receipt: null,
      }));

      setAllIncomeTransactions(formattedIncome);
      setAllExpenseTransactions(formattedExpense);

      // Jalankan kalkulasi summary berkala
      calculateExecutiveSummary(
        formattedIncome,
        formattedExpense,
        currentYear,
        "all",
      );
      setCurrentPage(1);
    } catch (err: any) {
      console.error("Gagal melakukan sinkronisasi arus kas:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLaporanData();
  }, []);

  // FUNGSI KALKULASI ARUS LOG KAS PENDAPATAN DAN PENGELUARAN BERKALA
  const calculateExecutiveSummary = (
    incomeList: any[],
    expenseList: any[],
    yearFilter: string,
    monthFilter: string,
  ) => {
    let totalMasuk = 0;
    let totalKeluar = 0;
    let counterSukses = 0;

    incomeList.forEach((t) => {
      const tDate = new Date(t.tanggal);
      if (tDate.getFullYear().toString() === yearFilter) {
        const tMonth = String(tDate.getMonth() + 1).padStart(2, "0");
        if (monthFilter === "all" || tMonth === monthFilter) {
          totalMasuk += t.nominal;
          counterSukses++;
        }
      }
    });

    expenseList.forEach((e) => {
      const eDate = new Date(e.tanggal);
      if (eDate.getFullYear().toString() === yearFilter) {
        const eMonth = String(eDate.getMonth() + 1).padStart(2, "0");
        if (monthFilter === "all" || eMonth === monthFilter) {
          totalKeluar += e.nominal;
          counterSukses++;
        }
      }
    });

    setSummary({
      totalPemasukan: totalMasuk,
      totalPengeluaran: totalKeluar,
      keuntunganBersih: totalMasuk - totalKeluar,
      totalTransaksiSukses: counterSukses,
    });
  };

  const handleApplyFilter = () => {
    setSelectedYear(tempYear);
    setSelectedMonth(tempMonth);
    calculateExecutiveSummary(
      allIncomeTransactions,
      allExpenseTransactions,
      tempYear,
      tempMonth,
    );
    setCurrentPage(1);
  };

  // PENGGABUNGAN DATA UNTUK DITAMPILKAN KE TABEL LOG MUTASI RINCI
  const filteredCombinedTransactionsMaster = useMemo(() => {
    const combined = [...allIncomeTransactions, ...allExpenseTransactions];
    return combined
      .filter((t) => {
        const tDate = new Date(t.tanggal);
        const matchYear = tDate.getFullYear().toString() === selectedYear;
        const tMonth = String(tDate.getMonth() + 1).padStart(2, "0");
        const matchMonth = selectedMonth === "all" || tMonth === selectedMonth;
        return matchYear && matchMonth;
      })
      .sort(
        (a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime(),
      );
  }, [
    allIncomeTransactions,
    allExpenseTransactions,
    selectedYear,
    selectedMonth,
  ]);

  const totalPages =
    Math.ceil(filteredCombinedTransactionsMaster.length / itemsPerPage) || 1;

  const currentTableData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredCombinedTransactionsMaster.slice(
      startIndex,
      startIndex + itemsPerPage,
    );
  }, [currentPage, filteredCombinedTransactionsMaster]);

  // LOGIKA ARRAY UNTUK GRAFIK BAR KEUNTUNGAN BERSIH BULANAN
  const bulananNetProfitArray = useMemo(() => {
    const profitArray = Array(12).fill(0);

    allIncomeTransactions.forEach((t) => {
      const tDate = new Date(t.tanggal);
      if (tDate.getFullYear().toString() === selectedYear) {
        profitArray[tDate.getMonth()] += t.nominal;
      }
    });

    allExpenseTransactions.forEach((e) => {
      const eDate = new Date(e.tanggal);
      if (eDate.getFullYear().toString() === selectedYear) {
        profitArray[eDate.getMonth()] -= e.nominal;
      }
    });

    return profitArray;
  }, [allIncomeTransactions, allExpenseTransactions, selectedYear]);

  const maxNominalGrafik = useMemo(() => {
    const absolutValues = bulananNetProfitArray.map((v) => Math.abs(v));
    return Math.max(...absolutValues, 1000000);
  }, [bulananNetProfitArray]);

  // HANDLER SUBMIT PENGELUARAN (MENYIMPAN DENGAN FLAG CUSTOMER_NAME = "KAS_KELUAR")
  const handleSubmitExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseForm.description.trim() || !expenseForm.totalAmount) {
      return alert("Silakan lengkapi data pengeluaran!");
    }

    setIsSubmittingExpense(true);
    try {
      const parsedAmount = parseFloat(expenseForm.totalAmount);
      const uniqueReceiptNo = `OUT-${Date.now()}`;

      const { error } = await supabase.from("receipts").insert([
        {
          receipt_no: uniqueReceiptNo,
          customer_name: "KAS_KELUAR",
          description: expenseForm.description,
          total_amount: parsedAmount,
        },
      ]);

      if (error) throw error;

      alert("Transaksi pengeluaran sukses dicatatkan!");
      setIsModalExpenseOpen(false);
      setExpenseForm({ description: "", totalAmount: "" });
      fetchLaporanData();
    } catch (err: any) {
      alert("Gagal memproses pengeluaran: " + err.message);
    } finally {
      setIsSubmittingExpense(false);
    }
  };

  // HANDLER SUBMIT TRANSAKSI PEMASUKAN KASIR OFFLINE WALK-IN (KINI MENUJU TABEL BOOKINGS SUPAYA SINKRON DENGAN DATA PEMASUKAN UTAMA)
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
    try {
      const parsedPrice = parseFloat(offlineForm.totalPrice);
      const todayStr = new Date().toISOString().substring(0, 10);

      const { error } = await supabase.from("bookings").insert([
        {
          id_profiles: adminUser.id,
          full_name: offlineForm.customerName,
          whatsapp_number: "Walk-in Kasir",
          car_model: offlineForm.carModel,
          customer_note: offlineForm.customerNote
            ? `${offlineForm.customerNote} [Offline Kasir]`
            : "[Offline Kasir]",
          booking_date: todayStr,
          status: "selesai",
          total_price: parsedPrice,
          receipt_pdf_url: null,
        },
      ]);

      if (error) throw error;

      alert("Transaksi Pemasukan Kasir Offline sukses dicatatkan!");
      setIsModalOfflineOpen(false);
      setOfflineForm({
        customerName: "",
        carModel: "",
        totalPrice: "",
        customerNote: "",
      });
      fetchLaporanData();
    } catch (err: any) {
      alert("Gagal memproses nota kasir offline: " + err.message);
    } finally {
      setIsSubmittingOffline(false);
    }
  };

  // FITUR EXPORT EXCEL GABUNGAN TERFILTER
  const handleExportExcelCombined = () => {
    if (filteredCombinedTransactionsMaster.length === 0) {
      return alert("Tidak ada data transaksi terfilter untuk diunduh!");
    }

    const excelRows = filteredCombinedTransactionsMaster.map((t) => ({
      "ID Referensi": t.id ? String(t.id).slice(0, 8).toUpperCase() : "-",
      Tanggal: new Date(t.tanggal).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }),
      "Entitas Klien/Toko": t.nama.toUpperCase(),
      "Deskripsi Rincian": t.keterangan,
      "Tipe Arus Kas": t.jenis,
      "Pintu Masuk/Keluar": t.sumber,
      "Nominal Anggaran (Rp)": t.nominal,
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Log Buku Kas");

    const namaBulanTeks =
      selectedMonth === "all" ? "Tahunan" : `Bulan_${selectedMonth}`;
    XLSX.writeFile(
      workbook,
      `Laporan_Laba_Bersih_PixelSticker_${selectedYear}_${namaBulanTeks}.xlsx`,
    );
  };

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

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 p-6 md:p-10 font-sans text-left relative">
      {/* POP-UP MODAL INPUT TRANSAKSI OFFLINE KASIR */}
      {isModalOfflineOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] border border-neutral-200 shadow-2xl p-6 md:p-8 max-w-md w-full text-left">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center mb-4">
              <UserPlus className="text-blue-600" size={22} />
            </div>
            <h3 className="text-base font-black uppercase tracking-tight text-neutral-900 mb-4">
              Input Pemasukan Kasir (Walk-in)
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
                  Catatan Tambahan / Keterangan Bahan
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Bahan: Glossy Black | Pengerjaan: Full Wrap"
                  value={offlineForm.customerNote}
                  onChange={(e) =>
                    setOfflineForm({
                      ...offlineForm,
                      customerNote: e.target.value,
                    })
                  }
                  className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-4 py-2.5 text-xs text-neutral-900 outline-none"
                />
              </div>
              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOfflineOpen(false);
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
                    "Simpan Pemasukan"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* POP-UP MODAL INPUT MANUAL PENGELUARAN */}
      {isModalExpenseOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] border border-neutral-200 shadow-2xl p-6 md:p-8 max-w-md w-full text-left">
            <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center mb-4">
              <TrendingDown className="text-red-600" size={22} />
            </div>
            <h3 className="text-base font-black uppercase tracking-tight text-neutral-900 mb-4">
              Catat Pengeluaran Workshop
            </h3>
            <form onSubmit={handleSubmitExpense} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-neutral-500 tracking-wider">
                  Deskripsi / Keperluan Pengeluaran
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Pembelian Roll Stiker Chrome / Bayar Listrik"
                  value={expenseForm.description}
                  onChange={(e) =>
                    setExpenseForm({
                      ...expenseForm,
                      description: e.target.value,
                    })
                  }
                  className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-4 py-2.5 text-xs text-neutral-900 outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-neutral-500 tracking-wider">
                  Nominal Pengeluaran (Rp)
                </label>
                <input
                  type="number"
                  required
                  placeholder="Contoh: 1500000"
                  value={expenseForm.totalAmount}
                  onChange={(e) =>
                    setExpenseForm({
                      ...expenseForm,
                      totalAmount: e.target.value,
                    })
                  }
                  className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-4 py-2.5 text-xs font-bold text-neutral-900 outline-none"
                />
              </div>
              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalExpenseOpen(false)}
                  className="flex-1 bg-neutral-100 text-neutral-700 font-bold text-xs py-3.5 rounded-xl uppercase"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingExpense}
                  className="flex-1 bg-red-600 text-white font-bold text-xs py-3.5 rounded-xl uppercase"
                >
                  {isSubmittingExpense ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    "Simpan Pengeluaran"
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
              Keuntungan & Arus Kas Toko
            </h1>
            <p className="text-xs text-neutral-500 mt-1">
              Analisis grafik perbandingan laba bersih tahunan, otomatis
              memisahkan data kuitansi online/offline dengan beban biaya
              operasional.
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => setIsModalOfflineOpen(true)}
              className="flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2.5 rounded-xl text-xs font-bold shadow-md flex-1 sm:flex-none"
            >
              <PlusCircle size={14} /> <span>Pemasukan</span>
            </button>
            <button
              onClick={() => setIsModalExpenseOpen(true)}
              className="flex items-center justify-center gap-1.5 bg-red-600 hover:bg-red-700 text-white px-3.5 py-2.5 rounded-xl text-xs font-bold shadow-md flex-1 sm:flex-none"
            >
              <MinusCircle size={14} /> <span>Pengeluaran</span>
            </button>
            <button
              onClick={fetchLaporanData}
              className="p-2.5 bg-white border border-neutral-300 rounded-xl text-neutral-700"
            >
              <RefreshCw size={14} />
            </button>
          </div>
        </div>

        {/* 4 KARTU ARUS KAS DUA JALUR */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-sm relative overflow-hidden">
            <div className="absolute right-4 top-4 p-1.5 bg-blue-50 text-blue-600 rounded-lg">
              <DollarSign size={14} />
            </div>
            <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider">
              Total Pemasukan
            </p>
            <h3 className="text-base font-black text-neutral-900 mt-1">
              Rp {summary.totalPemasukan.toLocaleString("id-ID")}
            </h3>
          </div>
          <div className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-sm relative overflow-hidden">
            <div className="absolute right-4 top-4 p-1.5 bg-red-50 text-red-600 rounded-lg">
              <TrendingDown size={14} />
            </div>
            <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider">
              Total Pengeluaran
            </p>
            <h3 className="text-base font-black text-red-600 mt-1">
              Rp {summary.totalPengeluaran.toLocaleString("id-ID")}
            </h3>
          </div>
          <div className="bg-white border border-blue-200 rounded-2xl p-5 shadow-md relative overflow-hidden bg-gradient-to-br from-white to-blue-50/20">
            <div className="absolute right-4 top-4 p-1.5 bg-green-50 text-green-600 rounded-lg">
              <TrendingUp size={14} />
            </div>
            <p className="text-[9px] font-bold text-blue-600 uppercase tracking-wider">
              Keuntungan Bersih
            </p>
            <h3
              className={`text-base font-black mt-1 ${summary.keuntunganBersih >= 0 ? "text-green-600" : "text-red-500"}`}
            >
              Rp {summary.keuntunganBersih.toLocaleString("id-ID")}
            </h3>
          </div>
          <div className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-sm relative overflow-hidden">
            <div className="absolute right-4 top-4 p-1.5 bg-yellow-50 text-yellow-600 rounded-lg">
              <Layers size={14} />
            </div>
            <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider">
              Log Buku Kas Terfilter
            </p>
            <h3 className="text-base font-black text-neutral-900 mt-1">
              {summary.totalTransaksiSukses} Transaksi
            </h3>
          </div>
        </div>

        {/* CONTROLLER FILTER */}
        <div className="bg-white border border-neutral-200 p-4 rounded-xl flex flex-wrap gap-3 items-center shadow-sm">
          <div className="flex items-center gap-1.5 font-bold text-xs text-neutral-700">
            <Calendar size={14} className="text-neutral-400" />
            <span>Saringan Filter:</span>
          </div>
          <select
            value={tempYear}
            onChange={(e) => setTempYear(e.target.value)}
            className="bg-neutral-50 border border-neutral-300 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-neutral-900 outline-none"
          >
            <option value="2025">2025</option>
            <option value="2026">2026</option>
            <option value="2027">2027</option>
          </select>
          <select
            value={tempMonth}
            onChange={(e) => setTempMonth(e.target.value)}
            className="bg-neutral-50 border border-neutral-300 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-neutral-900 outline-none"
          >
            <option value="all">Semua Bulan (Laporan Tahunan)</option>
            {namaBulanList.map((m, idx) => (
              <option key={idx} value={String(idx + 1).padStart(2, "0")}>
                {m}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={handleApplyFilter}
            className="bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs px-4 py-1.5 rounded-lg uppercase tracking-wider transition-all shadow-sm"
          >
            Submit
          </button>
        </div>

        {/* GRAFIK BAR DUA ARAH (NET PROFIT BERSIH) */}
        <div className="bg-white border border-neutral-200 rounded-[2rem] p-6 md:p-8 shadow-sm space-y-4">
          <div>
            <h2 className="text-sm font-black uppercase tracking-wide text-neutral-900">
              Grafik Laba Bersih Tahun {selectedYear}
            </h2>
            <p className="text-[11px] text-neutral-500">
              Nilai bar dihitung berdasarkan hasil formula total pemasukan
              (Online + Offline Nota) dikurangi pengeluaran toko.
            </p>
          </div>
          <div className="h-64 flex items-end gap-2 pt-6 border-b border-l border-neutral-200 px-4 relative bg-neutral-50/40 rounded-xl">
            <div className="absolute left-0 right-0 border-t border-dashed border-neutral-300 top-1/2 z-0"></div>

            {bulananNetProfitArray.map((netValue, idx) => {
              const persenTinggi = (Math.abs(netValue) / maxNominalGrafik) * 50;
              const isProfit = netValue >= 0;

              return (
                <div
                  key={idx}
                  className="flex-1 flex flex-col items-center h-full relative group z-10 justify-center"
                >
                  <div className="opacity-0 group-hover:opacity-100 bg-neutral-900 text-white text-[9px] py-1 px-1.5 rounded absolute -top-4 transition-all font-mono shadow-md whitespace-nowrap">
                    Rp {netValue.toLocaleString("id-ID")}
                  </div>

                  <div
                    style={{
                      height: `${Math.max(persenTinggi, 2)}%`,
                      transform: isProfit
                        ? "translateY(-50%)"
                        : "translateY(50%)",
                    }}
                    className={`w-full rounded-t-sm transition-all duration-500 ${isProfit ? "bg-green-500 group-hover:bg-green-600" : "bg-red-500 group-hover:bg-red-600"}`}
                  />

                  <span className="text-[9px] font-bold text-slate-400 absolute bottom-1 font-mono">
                    {namaBulanList[idx]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* TABEL BUKU KAS GABUNGAN */}
        <div className="bg-white border border-neutral-200 rounded-[2rem] p-6 shadow-sm space-y-4 overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-100 pb-3">
            <div>
              <h2 className="text-sm font-black uppercase tracking-wide text-neutral-900">
                Buku Kas Mutasi Alur Pendapatan dan Beban
              </h2>
              <p className="text-[11px] text-neutral-500">
                Rangkuman komparasi cerdas pemisahan nota masuk offline dan
                pengeluaran pada tabel receipts.
              </p>
            </div>
            <button
              onClick={handleExportExcelCombined}
              disabled={filteredCombinedTransactionsMaster.length === 0}
              className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-40 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md transition-colors"
            >
              <FileSpreadsheet size={14} /> <span>Ekspor Gabungan</span>
            </button>
          </div>

          <div className="space-y-4">
            <div className="overflow-x-auto rounded-xl border border-neutral-200">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-neutral-900 text-white font-extrabold uppercase tracking-wider text-[10px]">
                    <th className="p-4">ID Ref</th>
                    <th className="p-4">Tanggal</th>
                    <th className="p-4">Pihak Entitas</th>
                    <th className="p-4">Keperluan / Deskripsi</th>
                    <th className="p-4">Tipe Kas</th>
                    <th className="p-4 text-right">Nominal Anggaran</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 font-medium">
                  {currentTableData.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="p-8 text-center text-neutral-400 font-light italic bg-neutral-50"
                      >
                        Tidak ada rekaman data mutasi buku kas terfilter.
                      </td>
                    </tr>
                  ) : (
                    currentTableData.map((t, index) => (
                      <tr
                        key={index}
                        className="hover:bg-neutral-50 transition-colors"
                      >
                        <td className="p-4 font-mono text-neutral-500 font-semibold">
                          {t.id ? String(t.id).slice(0, 8).toUpperCase() : "-"}
                        </td>
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
                            className={`px-2 py-0.5 text-[9px] font-extrabold uppercase rounded border ${t.jenis === "Pemasukan" ? "bg-green-50 text-green-600 border-green-200" : "bg-red-50 text-red-600 border-red-200"}`}
                          >
                            {t.jenis}
                          </span>
                        </td>
                        <td
                          className={`p-4 text-right font-black font-mono ${t.jenis === "Pemasukan" ? "text-green-600" : "text-red-500"}`}
                        >
                          {t.jenis === "Pemasukan" ? "+" : "-"} Rp{" "}
                          {t.nominal.toLocaleString("id-ID")}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* PAGINATION CONTROLLER */}
            {filteredCombinedTransactionsMaster.length > 0 && (
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-neutral-900 text-white p-4 rounded-2xl text-xs">
                <p className="text-neutral-400 font-medium">
                  Menampilkan{" "}
                  <span className="text-white">
                    {(currentPage - 1) * itemsPerPage + 1}
                  </span>{" "}
                  -{" "}
                  <span className="text-white">
                    {Math.min(
                      currentPage * itemsPerPage,
                      filteredCombinedTransactionsMaster.length,
                    )}
                  </span>{" "}
                  dari{" "}
                  <span className="text-white">
                    {filteredCombinedTransactionsMaster.length}
                  </span>{" "}
                  baris log mutasi
                </p>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                    className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-30 text-neutral-300"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <div className="flex items-center gap-1 font-mono text-neutral-400">
                    <span className="bg-blue-600 text-white font-bold px-3 py-1.5 rounded-lg text-center min-w-[28px]">
                      {currentPage}
                    </span>
                    <span className="px-1">/</span>
                    <span className="bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg text-center min-w-[28px]">
                      {totalPages}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                    className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-30 text-neutral-300"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
