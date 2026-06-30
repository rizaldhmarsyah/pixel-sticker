// src/app/admin/dashboard/kuitansi/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import {
  Printer,
  ChevronLeft,
  FileText,
  Save,
  Search,
  Plus,
  Calendar,
  XCircle,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  RefreshCw,
  Layers,
  Scissors,
} from "lucide-react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { saveNota } from "./actions"; // REVISI: Import Server Action baru hasil ubahan

export default function NotaPage() {
  const supabase = createClient();
  const [mounted, setMounted] = useState(false);
  const [receipts, setReceipts] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [loading, setLoading] = useState(false);

  // State Notifikasi Modal Popup
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Form State Bersih
  const [data, setData] = useState({
    noNota: "", // REVISI: Mengubah properti noKuitansi -> noNota
    nama: "",
    materialId: "",
    metersUsed: 0,
    total: 0,
    keterangan: "",
    owner: "Pixel Sticker",
  });

  useEffect(() => {
    setMounted(true);
    fetchReceipts();
    fetchMaterials();
  }, []);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Tarik riwayat data nota (tetap dari tabel receipts di Supabase)
  const fetchReceipts = async () => {
    const { data: list } = await supabase
      .from("receipts")
      .select("*")
      .order("created_at", { ascending: false });
    if (list) setReceipts(list);
  };

  // Tarik master data bahan aktif dari database materials
  const fetchMaterials = async () => {
    const { data: list } = await supabase
      .from("materials")
      .select("id, name, stock_meters, price_per_meter")
      .order("name", { ascending: true });
    if (list) setMaterials(list);
  };

  // FUNGSI TOMBOL GENERATOR NOMOR NOTA OTOMATIS
  const handleGenerateInvoiceNumber = () => {
    const formatInvoice = `NOT-${new Date().getFullYear().toString().slice(-2)}${String(new Date().getMonth() + 1).padStart(2, "0")}-${Math.floor(1000 + Math.random() * 9000)}`;
    setData((prev) => ({ ...prev, noNota: formatInvoice }));
  };

  const handleNew = () => {
    setData({
      noNota: "",
      nama: "",
      materialId: "",
      metersUsed: 0,
      total: 0,
      keterangan: "",
      owner: "Pixel Sticker",
    });
  };

  const handleEdit = (item: any) => {
    setData({
      noNota: item.receipt_no || "",
      nama: item.customer_name || "",
      materialId: "",
      metersUsed: 0,
      total: item.total_amount || 0,
      keterangan: item.description || "",
      owner: "Pixel Sticker",
    });
  };

  // LOGIKA SIMPAN & POTONG STOK BAHAN DI SUPABASE
  const handleSave = async () => {
    if (
      !data.noNota ||
      !data.nama ||
      !data.materialId ||
      data.metersUsed <= 0 ||
      data.total <= 0
    ) {
      setNotification({
        type: "error",
        message:
          "Silakan lengkapi data pelanggan, pilihan bahan, jumlah meter, dan harga terlebih dahulu!",
      });
      return;
    }

    setLoading(true);
    try {
      // 1. Ambil data bahan terfilter
      const selectedMaterial = materials.find((m) => m.id === data.materialId);
      if (!selectedMaterial) throw new Error("Bahan pilihan tidak valid!");

      if (selectedMaterial.stock_meters < data.metersUsed) {
        throw new Error(
          `Stok bahan "${selectedMaterial.name}" tidak cukup! Sisa: ${selectedMaterial.stock_meters} meter.`,
        );
      }

      // 2. MUTASI POTONG STOK: Update sisa stok meter ke database
      const stokBaruTerhitung = selectedMaterial.stock_meters - data.metersUsed;
      const { error: updateMaterialError } = await supabase
        .from("materials")
        .update({ stock_meters: stokBaruTerhitung })
        .eq("id", data.materialId);

      if (updateMaterialError) throw updateMaterialError;

      // 3. BINDING DESKRIPSI: Masukkan info pemakaian bahan & catatan manual ke kolom description asli database
      const rincianDeskripsiLunas = `Bahan: ${selectedMaterial.name} (${data.metersUsed}m) ${data.keterangan ? `| Catatan: ${data.keterangan}` : ""}`;

      // 4. CALL SERVER ACTION UNTUK UPSERT TRANSAKSI
      // Mengonversi format data state lokal agar sesuai dengan kebutuhan fungsi saveNota di actions.ts
      const payloadAction = {
        noKuitansi: data.noNota,
        nama: data.nama,
        total: data.total,
        keterangan: rincianDeskripsiLunas,
      };

      await saveNota(payloadAction);

      setNotification({
        type: "success",
        message: `Nota ${data.noNota} sukses disimpan! Stok bahan berkurang ${data.metersUsed} meter.`,
      });

      handleNew();
      fetchReceipts();
      fetchMaterials();
    } catch (e: any) {
      setNotification({
        type: "error",
        message: e.message || "Terjadi kendala sistem.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  const filtered = receipts.filter((r) => {
    const matchesName = r.customer_name
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());
    const receiptDate = r.created_at
      ? new Date(r.created_at).toISOString().split("T")[0]
      : "";
    const matchesDate = dateFilter ? receiptDate === dateFilter : true;
    return matchesName && matchesDate;
  });

  const liveBahanName =
    materials.find((m) => m.id === data.materialId)?.name ||
    "............................";

  return (
    <div className="p-4 md:p-10 min-h-screen bg-[#F5F5F7] text-neutral-900 relative antialiased">
      <div className="max-w-7xl mx-auto">
        {/* POP-UP MODAL OVERLAY */}
        {notification && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/10 backdrop-blur-md animate-in fade-in duration-200 no-print">
            <div className="bg-white/80 backdrop-blur-xl border border-neutral-200 p-8 rounded-[2rem] max-w-sm w-full text-center shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200">
              <div
                className={`absolute top-0 inset-x-0 h-1.5 ${notification.type === "success" ? "bg-blue-600" : "bg-red-500"}`}
              />
              <div className="mx-auto w-12 h-12 rounded-2xl flex items-center justify-center mb-4 bg-neutral-50 border border-neutral-200/60">
                {notification.type === "success" ? (
                  <CheckCircle2 size={24} className="text-blue-600" />
                ) : (
                  <AlertTriangle size={24} className="text-red-500" />
                )}
              </div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900 mb-1.5">
                {notification.type === "success" ? "Sukses" : "Gagal"}
              </h3>
              <p className="text-neutral-500 text-xs font-normal leading-relaxed mb-6 px-2 text-center">
                {notification.message}
              </p>
              <button
                type="button"
                onClick={() => setNotification(null)}
                className="w-full bg-neutral-900 hover:bg-black font-bold py-3 rounded-xl text-xs text-white uppercase tracking-widest transition-all"
              >
                Oke, Mantap
              </button>
            </div>
          </div>
        )}

        {/* HEADER MODUL BAR */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-10 no-print gap-4">
          <div className="text-left">
            <Link
              href="/admin/dashboard"
              className="text-neutral-400 hover:text-neutral-900 flex items-center gap-1.5 mb-1 text-xs font-semibold uppercase tracking-wider transition-colors"
            >
              <ChevronLeft size={14} /> Dashboard
            </Link>
            <h1 className="text-xl md:text-2xl font-black uppercase tracking-tight text-neutral-900">
              Pembuatan Nota Kasir
            </h1>
          </div>

          <div className="flex gap-2 w-full md:w-auto text-xs font-bold uppercase tracking-wider">
            <button
              onClick={handleNew}
              className="flex-1 md:flex-none bg-white text-neutral-800 px-4 py-3 rounded-xl flex items-center justify-center gap-1.5 border border-neutral-200 shadow-sm hover:bg-neutral-50 transition-all"
            >
              <Plus size={15} /> Reset Form
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex-1 md:flex-none bg-blue-600 text-white px-5 py-3 rounded-xl flex items-center justify-center gap-1.5 hover:bg-blue-700 transition-all shadow-md shadow-blue-600/10 uppercase tracking-wide"
            >
              {loading ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <Save size={15} />
              )}{" "}
              <span>Simpan & Potong Stok</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* BARIS KIRI: INPUT FORM VALIDASI NOTA */}
          <div className="lg:col-span-4 no-print text-neutral-900 text-left">
            <div className="bg-white border border-neutral-200/60 p-6 md:p-8 rounded-[2rem] shadow-sm space-y-4">
              {/* NOMOR NOTA */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest ml-0.5">
                  Nomor Nota Toko
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    placeholder="Klik Generate ->"
                    value={data.noNota}
                    className="flex-1 bg-[#F5F5F7] border border-neutral-200/80 rounded-xl px-4 py-3 text-xs font-mono font-bold text-blue-600 outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleGenerateInvoiceNumber}
                    className="bg-neutral-900 hover:bg-black text-white px-3 rounded-xl text-xs font-bold flex items-center gap-1 uppercase transition-colors"
                  >
                    <RefreshCw size={12} /> Generate
                  </button>
                </div>
              </div>

              {/* NAMA PELANGGAN */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest ml-0.5">
                  Nama Lengkap Pelanggan
                </label>
                <input
                  placeholder="Masukkan nama pembeli..."
                  value={data.nama}
                  onChange={(e) => setData({ ...data, nama: e.target.value })}
                  className="w-full bg-[#F5F5F7] border border-neutral-200/80 rounded-xl px-4 py-3 outline-none focus:bg-white focus:border-blue-500 text-xs font-medium text-neutral-900 transition-all"
                />
              </div>

              {/* DROPDOWN PILIHAN BAHAN */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest ml-0.5">
                  Pilih Bahan Wrapping (Database)
                </label>
                <div className="relative">
                  <Layers
                    size={14}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
                  />
                  <select
                    value={data.materialId}
                    onChange={(e) =>
                      setData({ ...data, materialId: e.target.value })
                    }
                    className="w-full bg-[#F5F5F7] border border-neutral-200/80 rounded-xl pl-10 pr-4 py-3 outline-none focus:bg-white focus:border-blue-500 text-xs font-semibold text-neutral-900 cursor-pointer"
                  >
                    <option value="">-- Pilih Roll Bahan Workshop --</option>
                    {materials.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} (Tersisa: {m.stock_meters} meter)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* INPUT METER */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest ml-0.5">
                  Jumlah Meter Yang Digunakan (M)
                </label>
                <div className="relative">
                  <Scissors
                    size={14}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
                  />
                  <input
                    type="number"
                    step="0.1"
                    placeholder="Contoh: 15"
                    value={data.metersUsed || ""}
                    onChange={(e) =>
                      setData({
                        ...data,
                        metersUsed: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full bg-[#F5F5F7] border border-neutral-200/80 rounded-xl pl-10 pr-4 py-3 outline-none focus:bg-white focus:border-blue-500 text-xs font-mono font-bold text-neutral-900 transition-all"
                  />
                </div>
              </div>

              {/* INPUT HARGA */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest ml-0.5">
                  Harga Jasa Terbayar (Rp)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 font-black text-xs">
                    Rp
                  </span>
                  <input
                    type="number"
                    value={data.total || ""}
                    onChange={(e) =>
                      setData({ ...data, total: parseInt(e.target.value) || 0 })
                    }
                    className="w-full bg-[#F5F5F7] border border-neutral-200/80 rounded-xl pl-10 pr-4 py-3.5 outline-none focus:bg-white focus:border-blue-500 text-sm font-black font-mono text-neutral-900 transition-all"
                  />
                </div>
              </div>

              {/* CATATAN MANUAL */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest ml-0.5">
                  Catatan Tambahan Pekerjaan
                </label>
                <input
                  placeholder="Catatan pengerjaan..."
                  value={data.keterangan}
                  onChange={(e) =>
                    setData({ ...data, keterangan: e.target.value })
                  }
                  className="w-full bg-[#F5F5F7] border border-neutral-200/80 rounded-xl px-4 py-3 outline-none focus:bg-white focus:border-blue-500 text-xs font-medium text-neutral-900 transition-all"
                />
              </div>
            </div>
          </div>

          {/* BARIS TENGAH: LIVE PREVIEW NOTA */}
          <div className="lg:col-span-5">
            <div
              id="receipt"
              className="bg-white text-black p-8 md:p-10 flex flex-col border-t-[14px] border-blue-600 shadow-xl rounded-[2rem] min-h-[520px] text-left print:shadow-none print:rounded-none"
            >
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h2 className="text-xl font-black uppercase text-blue-600">
                    Pixel Sticker
                  </h2>
                  <p className="text-[9px] text-neutral-400 font-bold uppercase tracking-wider">
                    Premium Car Wrap Studio - Jakarta
                  </p>
                </div>
                <div className="text-right">
                  <h3 className="text-base font-black uppercase tracking-widest">
                    Nota Resmi
                  </h3>
                  <p className="text-[11px] text-blue-600 font-mono font-bold tracking-tight">
                    {data.noNota || "NOT-XXXXXX"}
                  </p>
                </div>
              </div>

              <div className="space-y-5 flex-1">
                <div className="border-b border-neutral-100 pb-2.5">
                  <p className="text-[9px] uppercase text-neutral-400 font-bold mb-0.5">
                    Sudah Diterima Dari
                  </p>
                  <p className="font-extrabold text-base md:text-lg italic uppercase text-neutral-900">
                    {data.nama ||
                      "........................................................"}
                  </p>
                </div>

                <div className="border-b border-neutral-100 pb-2.5 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[9px] uppercase text-neutral-400 font-bold mb-0.5">
                      Bahan Terpakai
                    </p>
                    <p className="font-bold text-xs text-neutral-800">
                      {liveBahanName}
                    </p>
                  </div>
                  <div>
                    <p className="text-[9px] uppercase text-neutral-400 font-bold mb-0.5">
                      Volume Meter
                    </p>
                    <p className="font-mono font-bold text-xs text-neutral-800">
                      {data.metersUsed > 0
                        ? `${data.metersUsed} Meter`
                        : "........ Meter"}
                    </p>
                  </div>
                </div>

                <div className="border-b border-neutral-100 pb-2.5">
                  <p className="text-[9px] uppercase text-neutral-400 font-bold mb-0.5">
                    Rincian Pembayaran
                  </p>
                  <p className="text-xs text-neutral-600 font-medium leading-relaxed min-h-[60px] whitespace-pre-wrap">
                    {data.keterangan ||
                      `Wrapping menggunakan material premium ${liveBahanName} terhitung lunas di kasir.`}
                  </p>
                </div>

                <div className="bg-neutral-900 text-white p-4 rounded-xl flex justify-between items-center">
                  <p className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">
                    Total Terbayar
                  </p>
                  <p className="text-xl font-mono font-black text-white">
                    Rp {data.total.toLocaleString("id-ID")}
                  </p>
                </div>
              </div>

              <div className="mt-8 flex justify-between items-end">
                <div className="text-center min-w-[140px]">
                  <p className="text-[10px] mb-14 text-neutral-500">
                    Jakarta,{" "}
                    {new Date().toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                  <div className="border-b border-neutral-900 w-full mb-1"></div>
                  <p className="font-bold uppercase text-[10px] tracking-widest text-neutral-900">
                    {data.owner}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* BARIS KANAN: DOKUMENTASI ARSIP RIWAYAT NOTA */}
          <div className="lg:col-span-3 no-print text-left">
            <div className="bg-white border border-neutral-200/60 rounded-[2rem] overflow-hidden shadow-sm">
              <div className="p-4 border-b border-neutral-100 bg-neutral-50">
                <h3 className="text-xs font-black uppercase tracking-wider text-neutral-800 flex items-center gap-1.5">
                  <FileText size={14} className="text-blue-600" /> Dokumentasi
                  Nota ({filtered.length})
                </h3>

                <div className="relative mt-3">
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
                    size={13}
                  />
                  <input
                    placeholder="Cari arsip nama..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-white border border-neutral-200 rounded-xl pl-9 pr-4 py-2 text-[11px] text-neutral-900 outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="max-h-[480px] overflow-y-auto p-3 space-y-2.5 scrollbar-none">
                {filtered.length === 0 ? (
                  <p className="text-center py-8 text-neutral-400 italic text-xs font-light">
                    Belum ada dokumentasi.
                  </p>
                ) : (
                  filtered.map((r) => (
                    <div
                      key={r.id}
                      onClick={() => handleEdit(r)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer ${data.noNota === r.receipt_no ? "bg-blue-500/5 border-blue-500" : "bg-white border-neutral-100 hover:border-neutral-200 shadow-sm"}`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="text-neutral-900 font-extrabold text-xs uppercase truncate leading-none mb-1">
                            {r.customer_name}
                          </p>
                          <p className="text-[10px] font-mono font-bold text-blue-600 leading-none mb-1">
                            {r.receipt_no}
                          </p>
                          <p className="text-[11px] text-neutral-500 font-normal truncate leading-none mb-1.5">
                            {r.description || "Tanpa rincian catatan"}
                          </p>
                          <p className="text-[10px] text-neutral-400 font-mono font-black">
                            Rp {r.total_amount?.toLocaleString("id-ID")}
                          </p>
                        </div>

                        <div className="flex items-center justify-end pt-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(r);
                              setTimeout(() => window.print(), 200);
                            }}
                            className="p-2 text-neutral-400 hover:text-green-600 hover:bg-green-50 rounded-xl transition-all"
                            title="Unduh / Cetak Ulang"
                          >
                            <Printer size={15} strokeWidth={2.5} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* STYLE CSS PRINT TARGET */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @media print {
          body * { visibility: hidden; background: white !important; }
          #receipt, #receipt * { visibility: visible; color: black !important; }
          #receipt { position: absolute !important; left: 0; top: 0; width: 100%; border-top: 16px solid #2563eb !important; padding: 20px !important; box-shadow: none !important; }
          .no-print, aside, nav, button, input, select, textarea { display: none !important; }
          #receipt .bg-neutral-900 { background-color: #171717 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          #receipt .text-white { color: white !important; }
        }
      `,
        }}
      />
    </div>
  );
}
