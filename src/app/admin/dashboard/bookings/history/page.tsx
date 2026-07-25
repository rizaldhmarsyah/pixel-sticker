"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import {
  ChevronLeft,
  Loader2,
  Download,
  RefreshCw,
  ChevronRight,
  Camera,
  Eye,
} from "lucide-react";

export default function AdminBookingHistoryPage() {
  const supabase = createClient();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // --- STATE PAGINATION ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 100;

  // 🛠️ STATE MODAL GALERI CAROUSEL: MENAMPILKAN MULTIPLE FOTO DOKUMENTASI DI RIWAYAT
  const [isModalViewImageOpen, setIsModalViewImageOpen] = useState(false);
  const [selectedImagesArray, setSelectedImagesArray] = useState<string[]>([]);

  const fetchHistoryData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("bookings")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      if (data) {
        setBookings(data);
        setCurrentPage(1);
      }
    } catch (err: any) {
      console.error("Gagal memuat arsip: ", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistoryData();
  }, []);

  // --- LOGIKA SLICING DATA UNTUK PAGINATION ---
  const totalPages = Math.ceil(bookings.length / itemsPerPage) || 1;

  const currentTableData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return bookings.slice(startIndex, endIndex);
  }, [currentPage, bookings]);

  // --- FUNGSIONALITAS DOWNLOAD DATA EXCEL/CSV ON-PAGE (🛠️ SUDAH TERINTEGRASI MULTIPLE FOTO) ---
  const handleDownloadPageData = () => {
    if (currentTableData.length === 0)
      return alert("Tidak ada data untuk diunduh!");

    const headers = [
      "ID Booking",
      "Nama Pelanggan",
      "No. WhatsApp",
      "Unit Kendaraan",
      "Tanggal Jasa",
      "Status",
      "Total Pendapatan",
      "Dokumentasi Foto Awal", // 👈 Kolom Ekspor Baru untuk skripsi
      "Catatan User",
    ];

    const rows = currentTableData.map((b) => {
      const imgs: string[] = Array.isArray(b.inspection_image_url)
        ? b.inspection_image_url
        : [];
      // Menggabungkan seluruh URL foto menggunakan separator pipe (|) agar cell Excel tidak pecah/berantakan
      const serializedImgsUrl =
        imgs.length > 0 ? imgs.join(" | ") : "Mobil Mulus";

      return [
        b.id_bookings || b.id || "",
        b.full_name || "",
        b.whatsapp_number || "",
        b.car_model || "",
        b.booking_date || "",
        b.status || "",
        b.total_price || 0,
        serializedImgsUrl,
        (b.customer_note || "").replace(/,/g, " "),
      ];
    });

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `Arsip_Booking_PixelSticker_Page_${currentPage}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-10 font-sans text-left">
      {/* 🛠️ MODAL POP-UP GALERI MULTIPLE FOTO INSPEKSI PADA TABEL RIWAYAT */}
      {isModalViewImageOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-white rounded-[2rem] overflow-hidden p-6 relative shadow-2xl space-y-4 text-neutral-900">
            <div className="flex justify-between items-center border-b border-neutral-100 pb-2">
              <h3 className="text-xs font-black uppercase tracking-wider text-neutral-800">
                Arsip Bukti Fisik Awal ({selectedImagesArray.length}/8 Foto)
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
                    alt={`Lecet Arsip ${index + 1}`}
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
              Tutup Galeri Riwayat
            </button>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto space-y-6">
        {/* HEADER ATAS */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-6">
          <div className="space-y-1">
            <Link
              href="/admin/dashboard/bookings"
              className="flex items-center gap-1 text-blue-400 text-xs hover:underline mb-1"
            >
              <ChevronLeft size={14} /> Kembali ke Manajemen Utama
            </Link>
            <h1 className="text-2xl font-black uppercase tracking-tight">
              Arsip Riwayat Booking (Model Excel)
            </h1>
            <p className="text-xs text-neutral-500">
              Menampilkan maksimal 100 baris horizontal per halaman untuk
              efisiensi performa rendering data skala besar.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={handleDownloadPageData}
              disabled={bookings.length === 0}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md"
            >
              <Download size={14} />
              <span>Download Tabel (Page {currentPage})</span>
            </button>

            <button
              onClick={fetchHistoryData}
              className="flex items-center gap-2 bg-neutral-900 hover:bg-neutral-800 border border-white/10 px-4 py-2 rounded-xl text-xs font-semibold transition-all"
            >
              <RefreshCw size={14} />
              <span>Refresh Tabel</span>
            </button>
          </div>
        </div>

        {/* TABEL MODEL EXCEL UTAMA */}
        {bookings.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-white/10 rounded-[2rem] bg-neutral-900/10">
            <p className="text-sm text-neutral-500">
              Belum ada data booking terekam.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="w-full overflow-x-auto bg-white text-neutral-900 rounded-2xl shadow-2xl border border-neutral-200">
              <table className="w-full text-left border-collapse min-w-[1050px] text-xs">
                <thead>
                  <tr className="bg-neutral-100 border-b border-neutral-300 text-neutral-700 uppercase tracking-wider font-bold">
                    <th className="p-3 border-r border-neutral-200 w-[90px]">
                      ID Booking
                    </th>
                    <th className="p-3 border-r border-neutral-200 w-[160px]">
                      Nama Pelanggan
                    </th>
                    <th className="p-3 border-r border-neutral-200 w-[120px]">
                      No. WhatsApp
                    </th>
                    <th className="p-3 border-r border-neutral-200 w-[140px]">
                      Unit Kendaraan
                    </th>
                    <th className="p-3 border-r border-neutral-200 w-[110px]">
                      Tanggal Jasa
                    </th>
                    <th className="p-3 border-r border-neutral-200 text-center w-[90px]">
                      Status
                    </th>
                    <th className="p-3 border-r border-neutral-200 w-[130px]">
                      Total Pendapatan
                    </th>

                    {/* 🛠️ HEADERS TAMBAHAN: DOKUMENTASI FOTO INSPEKSI KELANJUTAN */}
                    <th className="p-3 border-r border-neutral-200 w-[130px]">
                      Foto Inspeksi
                    </th>
                    <th className="p-3 border-r border-neutral-200 w-[110px]">
                      Dokumen Kuitansi
                    </th>
                    <th className="p-3">Catatan User</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {currentTableData.map((b, index) => {
                    const currentBookingId = b.id_bookings || b.id || "";
                    const imagesArray: string[] = Array.isArray(
                      b.inspection_image_url,
                    )
                      ? b.inspection_image_url
                      : [];

                    return (
                      <tr
                        key={currentBookingId}
                        className={`hover:bg-blue-50/50 transition-colors ${index % 2 === 0 ? "bg-white" : "bg-neutral-50/60"}`}
                      >
                        <td className="p-3 border-r border-neutral-200 font-mono text-neutral-500 font-semibold">
                          {currentBookingId
                            ? currentBookingId.slice(0, 8).toUpperCase()
                            : "LOADING"}
                        </td>
                        <td className="p-3 border-r border-neutral-200 font-bold uppercase text-neutral-900">
                          {b.full_name}
                        </td>
                        <td className="p-3 border-r border-neutral-200 font-medium text-neutral-700">
                          {b.whatsapp_number}
                        </td>
                        <td className="p-3 border-r border-neutral-200 font-bold uppercase text-neutral-800">
                          {b.car_model}
                        </td>
                        <td className="p-3 border-r border-neutral-200 font-semibold text-neutral-700">
                          {b.booking_date ? (
                            new Date(b.booking_date).toLocaleDateString(
                              "id-ID",
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              },
                            )
                          ) : (
                            <span className="text-neutral-400 italic font-light">
                              Belum diset
                            </span>
                          )}
                        </td>
                        <td className="p-3 border-r border-neutral-200 text-center">
                          <span
                            className={`text-[10px] font-black uppercase px-2 py-0.5 rounded border inline-block ${
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
                        </td>
                        <td className="p-3 border-r border-neutral-200 font-bold text-neutral-800">
                          {b.total_price && b.total_price > 0 ? (
                            `Rp ${b.total_price.toLocaleString("id-ID")}`
                          ) : (
                            <span className="text-neutral-400 font-normal italic">
                              -
                            </span>
                          )}
                        </td>

                        {/* 🛠️ DATA TD TAMBAHAN: LIHAT MULTIPLE ARSIP FOTO KUITANSI LECET */}
                        <td className="p-3 border-r border-neutral-200 font-medium">
                          {imagesArray.length > 0 ? (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedImagesArray(imagesArray);
                                setIsModalViewImageOpen(true);
                              }}
                              className="text-blue-600 hover:underline inline-flex items-center gap-1 font-bold uppercase text-[10px]"
                            >
                              <Camera size={12} /> {imagesArray.length}/8 Foto
                            </button>
                          ) : (
                            <span className="text-neutral-400 italic font-light">
                              Mulus
                            </span>
                          )}
                        </td>

                        <td className="p-3 border-r border-neutral-200 font-medium">
                          {b.receipt_pdf_url ? (
                            <a
                              href={b.receipt_pdf_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline flex items-center gap-1 font-bold"
                            >
                              Lihat PDF
                            </a>
                          ) : (
                            <span className="text-neutral-400 italic font-light">
                              Tidak ada berkas
                            </span>
                          )}
                        </td>
                        <td
                          className="p-3 text-neutral-600 italic font-normal truncate max-w-[180px]"
                          title={b.customer_note}
                        >
                          {b.customer_note || "-"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* --- CONTROLLER UI PAGINATION --- */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-neutral-900 border border-white/5 p-4 rounded-2xl text-xs">
              <p className="text-neutral-400 font-medium">
                Menampilkan{" "}
                <span className="text-white">
                  {(currentPage - 1) * itemsPerPage + 1}
                </span>{" "}
                -{" "}
                <span className="text-white">
                  {Math.min(currentPage * itemsPerPage, bookings.length)}
                </span>{" "}
                dari <span className="text-white">{bookings.length}</span> total
                riwayat antrean
              </p>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-white/5 transition-all text-neutral-300"
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
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-white/5 transition-all text-neutral-300"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
