"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import {
  ChevronLeft,
  Loader2,
  FileText,
  ExternalLink,
  Download,
  Calendar,
  CheckCircle,
  XCircle,
  RefreshCw,
} from "lucide-react";

export default function AdminBookingHistoryPage() {
  const supabase = createClient();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHistoryData = async () => {
    setLoading(true);
    try {
      // Tarik semua data booking (termasuk selesai dan batal) untuk arsip besar admin
      const { data, error } = await supabase
        .from("bookings")
        .select("*")
        .order("created_at", { ascending: false });

      if (data) setBookings(data);
    } catch (err: any) {
      console.error("Gagal memuat arsip: ", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistoryData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-10 font-sans">
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
              Semua data transaksi pelanggan tersusun rapat horizontal untuk
              efisiensi pemantauan skala besar.
            </p>
          </div>
          <button
            onClick={fetchHistoryData}
            className="flex items-center gap-2 bg-neutral-900 hover:bg-neutral-800 border border-white/10 px-4 py-2 rounded-xl text-xs font-semibold transition-all"
          >
            <RefreshCw size={14} />
            <span>Refresh Tabel</span>
          </button>
        </div>

        {/* TABEL MODEL EXCEL (LURUS KE SAMPING, BARIS KE BAWAH) */}
        {bookings.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-white/10 rounded-[2rem] bg-neutral-900/10">
            <p className="text-sm text-neutral-500">
              Belum ada data booking terekam.
            </p>
          </div>
        ) : (
          <div className="w-full overflow-x-auto bg-white text-neutral-900 rounded-2xl shadow-2xl border border-neutral-200">
            <table className="w-full text-left border-collapse min-w-[900px] text-xs">
              {/* JUDUL KOLOM (EXCEL HEADER) */}
              <thead>
                <tr className="bg-neutral-100 border-b border-neutral-300 text-neutral-700 uppercase tracking-wider font-bold">
                  <th className="p-3 border-r border-neutral-200 w-[100px]">
                    ID Booking
                  </th>
                  <th className="p-3 border-r border-neutral-200 w-[180px]">
                    Nama Pelanggan
                  </th>
                  <th className="p-3 border-r border-neutral-200 w-[130px]">
                    No. WhatsApp
                  </th>
                  <th className="p-3 border-r border-neutral-200 w-[150px]">
                    Unit Kendaraan
                  </th>
                  <th className="p-3 border-r border-neutral-200 w-[120px]">
                    Tanggal Jasa
                  </th>
                  <th className="p-3 border-r border-neutral-200 text-center w-[100px]">
                    Status
                  </th>
                  <th className="p-3 border-r border-neutral-200 w-[150px]">
                    Dokumen Kuitansi
                  </th>
                  <th className="p-3">Catatan User</th>
                </tr>
              </thead>

              {/* BARIS DATA (EXCEL ROWS) */}
              <tbody className="divide-y divide-neutral-200">
                {bookings.map((b, index) => (
                  <tr
                    key={b.id}
                    className={`hover:bg-blue-50/50 transition-colors ${
                      index % 2 === 0 ? "bg-white" : "bg-neutral-50/60"
                    }`}
                  >
                    {/* ID */}
                    <td className="p-3 border-r border-neutral-200 font-mono text-neutral-500 font-semibold">
                      {b.id.slice(0, 8).toUpperCase()}
                    </td>

                    {/* NAMA */}
                    <td className="p-3 border-r border-neutral-200 font-bold uppercase text-neutral-900">
                      {b.full_name}
                    </td>

                    {/* WA */}
                    <td className="p-3 border-r border-neutral-200 font-medium text-neutral-700">
                      {b.whatsapp_number}
                    </td>

                    {/* UNIT */}
                    <td className="p-3 border-r border-neutral-200 font-bold uppercase text-neutral-800">
                      {b.car_model}
                    </td>

                    {/* TANGGAL */}
                    <td className="p-3 border-r border-neutral-200 font-semibold text-neutral-700">
                      {new Date(b.booking_date).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>

                    {/* STATUS BADGE COCOK */}
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

                    {/* LINK PDF */}
                    <td className="p-3 border-r border-neutral-200 font-medium">
                      {b.receipt_pdf_url ? (
                        <a
                          href={b.receipt_pdf_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline flex items-center gap-1 font-bold"
                        >
                          <Download size={12} /> Lihat PDF
                        </a>
                      ) : (
                        <span className="text-neutral-400 italic font-light">
                          Tidak ada berkas
                        </span>
                      )}
                    </td>

                    {/* CATATAN */}
                    <td
                      className="p-3 text-neutral-600 italic font-normal truncate max-w-[200px]"
                      title={b.customer_note}
                    >
                      {b.customer_note || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
