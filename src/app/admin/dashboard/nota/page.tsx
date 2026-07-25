"use client";

import React, { useState, useEffect } from "react";
import {
  Printer,
  Download,
  ChevronLeft,
  FileText,
  Save,
  Search,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  RefreshCw,
  Fuel,
  Wrench,
} from "lucide-react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { saveNota } from "./actions";

// IMPORT LIBRARY BARU YANG SUDAH SUPPORT WARNA MODERN LAB / OKLCH
import { toPng } from "html-to-image";

export default function NotaPage() {
  const supabase = createClient();
  const [mounted, setMounted] = useState(false);
  const [receipts, setReceipts] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const [data, setData] = useState({
    noNota: "",
    nama: "",
    materialId: "",
    jenisPengerjaan: "",
    total: 0,
    keterangan: "",
    owner: "PIXEL STICKER",
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

  // 🛠️ FUNGSI DENGAN FILTER PERBAIKAN: MENGECUALIKAN DATA PENGELUARAN (KAS_KELUAR)
  const fetchReceipts = async () => {
    const { data: list } = await supabase
      .from("receipts")
      .select("*")
      .neq("customer_name", "KAS_KELUAR") // 👈 Kunci penyaringan data agar pengeluaran tidak bocor ke arsip nota
      .order("created_at", { ascending: false });
    if (list) setReceipts(list);
  };

  const fetchMaterials = async () => {
    const { data: list } = await supabase
      .from("materials")
      .select("id_materials, name, stock_meters, price_per_meter")
      .order("name", { ascending: true });
    if (list) setMaterials(list);
  };

  const handleGenerateInvoiceNumber = () => {
    const formatInvoice = `NOT-${new Date().getFullYear().toString().slice(-2)}${String(new Date().getMonth() + 1).padStart(2, "0")}-${Math.floor(1000 + Math.random() * 9000)}`;
    setData((prev) => ({ ...prev, noNota: formatInvoice }));
  };

  const handleNew = () => {
    setData({
      noNota: "",
      nama: "",
      materialId: "",
      jenisPengerjaan: "",
      total: 0,
      keterangan: "",
      owner: "PIXEL STICKER",
    });
  };

  const handleEdit = (item: any) => {
    let deskripsiMentah = item.description || "";
    let pengerjaanDeteksi = "";
    let catatanDeteksi = deskripsiMentah;

    if (deskripsiMentah.includes("Pengerjaan:")) {
      const partKanan = deskripsiMentah.split("Pengerjaan:")[1] || "";
      if (partKanan.includes("|")) {
        pengerjaanDeteksi = partKanan.split("|")[0]?.trim() || "";
        catatanDeteksi = partKanan.split("|")[1]?.trim() || "";
      } else {
        pengerjaanDeteksi = partKanan.trim();
        catatanDeteksi = "";
      }
    }

    setData({
      noNota: item.receipt_no || "",
      nama: item.customer_name || "",
      materialId: item.id_materials || "",
      jenisPengerjaan: pengerjaanDeteksi,
      total: item.total_amount || 0,
      keterangan: catatanDeteksi,
      owner: "PIXEL STICKER",
    });
  };

  // 💾 FUNGSI DOWNLOAD BARU: MENGGUNAKAN HTML-TO-IMAGE (ANTI-CRASH WARNA LAB)
  const handleDownloadImageFlow = async (item: any) => {
    handleEdit(item);
    setDownloadingId(item.id_receipts || item.id || "");

    // Berikan jeda waktu super singkat agar sinkronisasi state ke elemen HTML selesai
    setTimeout(async () => {
      const element = document.getElementById("receipt");
      if (!element) {
        setDownloadingId(null);
        return;
      }

      try {
        // html-to-image langsung memproses screenshot element secara solid & aman dari error CSS modern
        const dataUrl = await toPng(element, {
          quality: 0.95,
          pixelRatio: 3, // Skala 3x agar resolusi teks kecil tetap tajam di printer kasir thermal
          backgroundColor: "#ffffff",
          style: {
            transform: "scale(1)",
            borderRadius: "0px",
          },
        });

        const link = document.createElement("a");
        link.download = `Struk_PixelSticker_${(item.customer_name || "Customer").replace(/\s+/g, "_")}.png`;
        link.href = dataUrl;
        link.click();
      } catch (error: any) {
        console.error("Gagal capture via html-to-image engine:", error);
        alert("Gagal mengunduh gambar struk. Coba klik sekali lagi.");
      } finally {
        setDownloadingId(null);
      }
    }, 250);
  };

  const handleSave = async () => {
    if (
      !data.noNota ||
      !data.nama ||
      !data.materialId ||
      !data.jenisPengerjaan.trim() ||
      data.total <= 0
    ) {
      setNotification({
        type: "error",
        message:
          "Silakan lengkapi data pelanggan, jenis pengerjaan, pilihan bahan, dan nominal harga terlebih dahulu!",
      });
      return;
    }

    setLoading(true);
    try {
      const selectedMaterial = materials.find(
        (m) => m.id_materials === data.materialId,
      );
      if (!selectedMaterial) throw new Error("Bahan pilihan tidak valid!");

      const rincianDeskripsiLunas = `Bahan: ${selectedMaterial.name} | Pengerjaan: ${data.jenisPengerjaan} ${data.keterangan ? `| Catatan: ${data.keterangan}` : ""}`;

      const payloadAction = {
        noKuitansi: data.noNota,
        nama: data.nama,
        id_materials: data.materialId,
        total: data.total,
        keterangan: rincianDeskripsiLunas,
      };

      await saveNota(payloadAction);

      setNotification({
        type: "success",
        message: `Nota ${data.noNota} untuk ${data.nama} sukses disimpan ke sistem kasir!`,
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
    materials.find((m) => m.id_materials === data.materialId)?.name ||
    "Premium Wrap Material";

  return (
    <div className="p-4 md:p-8 min-h-screen bg-[#0A0A0C] text-white relative antialiased selection:bg-blue-600">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* POP-UP MODAL OVERLAY */}
        {notification && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm no-print">
            <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-3xl max-w-sm w-full text-center shadow-2xl relative">
              <div
                className={`absolute top-0 inset-x-0 h-1 rounded-t-3xl ${notification.type === "success" ? "bg-blue-500" : "bg-red-500"}`}
              />
              <div className="mx-auto w-10 h-10 rounded-xl flex items-center justify-center mb-3 bg-neutral-800 border border-neutral-700">
                {notification.type === "success" ? (
                  <CheckCircle2 size={20} className="text-blue-400" />
                ) : (
                  <AlertTriangle size={20} className="text-red-400" />
                )}
              </div>
              <h3 className="text-xs font-black uppercase tracking-widest text-white mb-1">
                {notification.type === "success" ? "SUCCESS" : "FAILED"}
              </h3>
              <p className="text-neutral-400 text-xs font-light leading-relaxed mb-5">
                {notification.message}
              </p>
              <button
                type="button"
                onClick={() => setNotification(null)}
                className="w-full bg-white hover:bg-neutral-200 font-bold py-2.5 rounded-xl text-xs text-black uppercase tracking-wider transition-all"
              >
                Kondisi Aman
              </button>
            </div>
          </div>
        )}

        {/* HEADER CONTROL BAR */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center no-print gap-4 border-b border-neutral-800 pb-6">
          <div className="text-left">
            <Link
              href="/admin/dashboard"
              className="text-neutral-500 hover:text-white flex items-center gap-1.5 mb-1 text-xs font-bold uppercase tracking-widest transition-colors"
            >
              <ChevronLeft size={14} /> Back-Office
            </Link>
            <h1 className="text-xl md:text-3xl font-black uppercase tracking-tight text-white flex items-center gap-2">
              <Fuel className="text-blue-500" size={26} /> Nota Kasir Workshop
            </h1>
          </div>

          <div className="flex gap-2 w-full md:w-auto text-xs font-bold uppercase tracking-wider">
            <button
              onClick={handleNew}
              className="flex-1 md:flex-none bg-neutral-900 text-neutral-300 px-4 py-3 rounded-xl flex items-center justify-center gap-1.5 border border-neutral-800 hover:bg-neutral-800 transition-all"
            >
              <Plus size={15} /> Clear Form
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex-1 md:flex-none bg-blue-600 text-white px-5 py-3 rounded-xl flex items-center justify-center gap-1.5 hover:bg-blue-700 transition-all uppercase tracking-widest shadow-lg shadow-blue-600/10"
            >
              {loading ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <Save size={15} />
              )}
              <span>Simpan Transaksi</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* INPUT FORM VALIDASI NOTA */}
          <div className="lg:col-span-4 no-print text-left">
            <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-3xl space-y-5 shadow-xl">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-0.5">
                  Nomor Nota Berjalan
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    placeholder="Klik Generate ->"
                    value={data.noNota}
                    className="flex-1 bg-black border border-neutral-800 rounded-xl px-4 py-3 text-xs font-mono font-bold text-blue-400 outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleGenerateInvoiceNumber}
                    className="bg-neutral-800 hover:bg-neutral-700 text-white px-3 py-3 rounded-xl text-[10px] font-black flex items-center gap-1 uppercase transition-colors border border-neutral-700"
                  >
                    <RefreshCw size={11} /> Auto
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-0.5">
                  Nama Pelanggan / Owner Mobil
                </label>
                <input
                  placeholder="Nama pembeli..."
                  value={data.nama}
                  onChange={(e) => setData({ ...data, nama: e.target.value })}
                  className="w-full bg-black border border-neutral-800 rounded-xl px-4 py-3 outline-none focus:border-neutral-600 text-xs font-medium text-white transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-0.5">
                  Jenis Pengerjaan Otomotif (Manual)
                </label>
                <div className="relative">
                  <Wrench
                    size={14}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500"
                  />
                  <input
                    placeholder="Contoh: Full Body Wrapping / Dechrome"
                    value={data.jenisPengerjaan}
                    onChange={(e) =>
                      setData({ ...data, jenisPengerjaan: e.target.value })
                    }
                    className="w-full bg-black border border-neutral-800 rounded-xl pl-10 pr-4 py-3 outline-none focus:border-neutral-600 text-xs font-bold text-white transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-0.5">
                  Material Wrap Terpasang
                </label>
                <select
                  value={data.materialId}
                  onChange={(e) =>
                    setData({ ...data, materialId: e.target.value })
                  }
                  className="w-full bg-black border border-neutral-800 rounded-xl px-4 py-3 outline-none focus:border-neutral-600 text-xs font-bold text-white cursor-pointer"
                >
                  <option value="" className="text-neutral-500">
                    -- Pilih Produk Gudang --
                  </option>
                  {materials.map((m) => (
                    <option
                      key={m.id_materials}
                      value={m.id_materials}
                      className="text-black"
                    >
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-0.5">
                  Total Harga Jasa Terbayar (Rp)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 font-black text-xs">
                    Rp
                  </span>
                  <input
                    type="number"
                    placeholder="Masukkan nominal harga..."
                    value={data.total || ""}
                    onChange={(e) =>
                      setData({ ...data, total: parseInt(e.target.value) || 0 })
                    }
                    className="w-full bg-black border border-neutral-800 rounded-xl pl-10 pr-4 py-3.5 outline-none focus:border-neutral-600 text-sm font-black font-mono text-white transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-0.5">
                  Catatan Tambahan Kustomisasi (Opsional)
                </label>
                <input
                  placeholder="Catatan tambahan..."
                  value={data.keterangan}
                  onChange={(e) =>
                    setData({ ...data, keterangan: e.target.value })
                  }
                  className="w-full bg-black border border-neutral-800 rounded-xl px-4 py-3 outline-none focus:border-neutral-600 text-xs font-medium text-white transition-all"
                />
              </div>
            </div>
          </div>

          {/* LIVE PREVIEW NOTA SLIM STRUK THERMAL RACING ULTRA-COMPACT */}
          <div className="lg:col-span-5 flex justify-center">
            <div
              id="receipt"
              className="bg-white text-black py-5 px-4 flex flex-col border-t-[4px] border-black shadow-2xl max-w-[280px] w-full min-h-[380px] text-left font-mono text-[10px]"
              style={{ boxSizing: "border-box" }}
            >
              {/* BRAND HEADER */}
              <div className="text-center space-y-0.5 border-b border-dashed border-neutral-400 pb-2 mb-2">
                <h2 className="text-sm font-black tracking-tighter uppercase italic leading-none">
                  /// {data.owner}
                </h2>
                <p className="text-[8px] font-black text-neutral-500 uppercase tracking-tight leading-none">
                  PREMIUM CAR WRAP STUDIO
                </p>
                <p className="text-[7px] text-neutral-400 leading-none">
                  Kawasan Otomotif Blok M, Jakarta
                </p>
              </div>

              {/* DETAILS METADATA */}
              <div className="text-[8px] space-y-0.5 border-b border-dashed border-neutral-300 pb-2 mb-3 text-neutral-600 leading-tight">
                <div className="flex justify-between">
                  <span>NO. NOTA :</span>
                  <span className="font-bold text-black">
                    {data.noNota || "NOT-XXXXXX"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>TANGGAL :</span>
                  <span>
                    {new Date().toLocaleDateString("id-ID", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })}{" "}
                    {new Date().toLocaleTimeString("id-ID", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>KASIR :</span>
                  <span className="uppercase font-bold text-black">
                    ADMIN_PIXEL
                  </span>
                </div>
              </div>

              {/* CORE DATA CONTENT */}
              <div className="flex-1 space-y-2 text-[10px] leading-snug">
                <div>
                  <p className="text-[7px] font-black uppercase text-neutral-400 tracking-wider leading-none mb-0.5">
                    CUSTOMER OWNER
                  </p>
                  <p className="font-black text-xs uppercase text-neutral-900 tracking-tight leading-tight">
                    {data.nama || "...................."}
                  </p>
                </div>

                <div>
                  <p className="text-[7px] font-black uppercase text-neutral-400 tracking-wider leading-none mb-0.5">
                    JENIS PENGERJAAN
                  </p>
                  <p className="font-black text-neutral-900 uppercase tracking-tight leading-tight">
                    {data.jenisPengerjaan || "...................."}
                  </p>
                </div>

                <div>
                  <p className="text-[7px] font-black uppercase text-neutral-400 tracking-wider leading-none mb-0.5">
                    MATERIAL UTAMA
                  </p>
                  <p className="font-bold text-neutral-800 leading-tight">
                    {liveBahanName}
                  </p>
                  {data.keterangan && (
                    <p className="text-[8px] text-neutral-500 italic mt-0.5 leading-tight">
                      * {data.keterangan}
                    </p>
                  )}
                </div>

                {/* DIVIDER RACING LINE */}
                <div className="border-t border-dashed border-neutral-400 pt-2 mt-4">
                  <div className="flex justify-between items-center bg-neutral-100 p-1.5 rounded">
                    <span className="text-[8px] font-black uppercase tracking-wider text-neutral-500">
                      TOTAL NETT
                    </span>
                    <span className="text-xs font-black font-mono text-neutral-900">
                      Rp {data.total.toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>
              </div>

              {/* FOOTER RACING LOGO */}
              <div className="mt-4 border-t border-dashed border-neutral-300 pt-2 text-center space-y-0.5">
                <p className="text-[8px] font-black uppercase tracking-widest text-neutral-800 leading-none">
                  * LUNAS / PAID *
                </p>
                <p className="text-[7px] text-neutral-400 max-w-[200px] mx-auto leading-tight uppercase font-sans">
                  Terima kasih telah mempercayakan proteksi visual kendaraan
                  anda di Pixel Sticker Gallery.
                </p>
              </div>
            </div>
          </div>

          {/* DOKUMENTASI ARSIP RIWAYAT NOTA */}
          <div className="lg:col-span-3 no-print text-left">
            <div className="bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden shadow-xl">
              <div className="p-4 border-b border-neutral-800 bg-neutral-900/60">
                <h3 className="text-xs font-black uppercase tracking-wider text-neutral-200 flex items-center gap-1.5">
                  <FileText size={14} className="text-blue-400" /> Archive Nota
                  ({filtered.length})
                </h3>
                <div className="relative mt-3">
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500"
                    size={13}
                  />
                  <input
                    placeholder="Cari nama pelanggan..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-black border border-neutral-800 rounded-xl pl-9 pr-4 py-2 text-[11px] text-white outline-none focus:border-neutral-600"
                  />
                </div>
              </div>

              <div className="max-h-[440px] overflow-y-auto p-3 space-y-2.5 scrollbar-none">
                {filtered.length === 0 ? (
                  <p className="text-center py-8 text-neutral-500 italic text-xs font-light">
                    Belum ada dokumentasi.
                  </p>
                ) : (
                  filtered.map((r) => {
                    const currentRecId = r.id_receipts || r.id || "";

                    return (
                      <div
                        key={currentRecId}
                        onClick={() => handleEdit(r)}
                        className={`p-3 rounded-2xl border transition-all cursor-pointer ${data.noNota === r.receipt_no ? "bg-blue-500/10 border-blue-500" : "bg-black border-neutral-800 hover:border-neutral-700 shadow-sm"}`}
                      >
                        <div className="flex justify-between items-start gap-2">
                          <div className="min-w-0 flex-1">
                            <p className="text-white font-extrabold text-xs uppercase truncate mb-0.5">
                              {r.customer_name}
                            </p>
                            <p className="text-[10px] font-mono font-bold text-blue-400 mb-0.5">
                              {r.receipt_no}
                            </p>
                            <p className="text-[10px] text-neutral-400 font-mono font-black">
                              Rp {r.total_amount?.toLocaleString("id-ID")}
                            </p>
                          </div>

                          {/* DUA TOMBOL ICON TERPISAH YANG SANGAT STABIL */}
                          <div className="flex items-center gap-1 mt-1">
                            {/* Tombol 1: Download Gambar PNG (Bebas Error Lab/Oklch Menggunakan html-to-image) */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDownloadImageFlow(r);
                              }}
                              disabled={downloadingId === currentRecId}
                              className="p-1.5 text-neutral-400 hover:text-green-400 rounded-lg transition-all hover:bg-neutral-800 flex items-center justify-center"
                              title="Download Gambar Struk Ramping"
                            >
                              {downloadingId === currentRecId ? (
                                <Loader2
                                  size={13}
                                  className="animate-spin text-green-400"
                                />
                              ) : (
                                <Download size={13} />
                              )}
                            </button>

                            {/* Tombol 2: Print Manual Printer Fisik */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEdit(r);
                                setTimeout(() => window.print(), 200);
                              }}
                              className="p-1.5 text-neutral-400 hover:text-blue-400 rounded-lg transition-all hover:bg-neutral-800 flex items-center justify-center"
                              title="Cetak Kertas Printer"
                            >
                              <Printer size={13} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* BACKUP FORCE COMPACT STYLES FOR MANUAL PRINT BROWSER PREVIEW */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @media print {
          body * { 
            visibility: hidden !important; 
            background: white !important; 
          }
          #receipt, #receipt * { 
            visibility: visible !important; 
            color: black !important; 
          }
          #receipt { 
            position: absolute !important; 
            left: 0 !important; 
            top: 0 !important; 
            width: 74mm !important; 
            max-width: 74mm !important;
            padding: 4mm !important; 
            box-shadow: none !important; 
            border: none !important;
            margin: 0 !important;
          }
          #receipt h2 { font-size: 11px !important; }
          #receipt p { font-size: 7px !important; line-height: 1.1 !important; }
          #receipt span { font-size: 7.5px !important; }
          @page {
            size: auto;
            margin: 0mm !important;
          }
          .no-print, button, input, select, textarea { display: none !important; }
        }
      `,
        }}
      />
    </div>
  );
}
