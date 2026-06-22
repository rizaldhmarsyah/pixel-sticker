"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import {
  Clock,
  Calendar,
  Download,
  ChevronLeft,
  Loader2,
  FileText,
  AlertCircle,
  User,
} from "lucide-react";

export default function BookingHistoryPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [myBookings, setMyBookings] = useState<any[]>([]);

  const supabase = createClient();

  useEffect(() => {
    const initData = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        setUser(session.user);
        const { data: bookings } = await supabase
          .from("bookings")
          .select("*")
          .eq("user_id", session.user.id)
          .order("created_at", { ascending: false });

        if (bookings) setMyBookings(bookings);
      }
      setLoading(false);
    };

    initData();
  }, [supabase]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-blue-600" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center">
        <AlertCircle size={48} className="text-yellow-500 mb-4" />
        <h1 className="text-xl font-bold uppercase">Akses Dibatasi</h1>
        <p className="text-neutral-500 text-sm mt-2 max-w-xs">
          Silakan masuk terlebih dahulu untuk melihat riwayat reservasi Anda.
        </p>
        <Link
          href="/login"
          className="mt-6 bg-blue-600 text-white px-8 py-3 rounded-xl font-bold text-xs uppercase tracking-widest"
        >
          Login Sekarang
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pt-28 pb-16 px-4 md:px-8 font-sans">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* HEADER NAVIGASI */}
        <div className="flex items-center justify-between border-b border-white/5 pb-6">
          <div className="space-y-1">
            <Link
              href="/booking"
              className="flex items-center gap-2 text-blue-400 text-xs hover:underline mb-2 transition-all"
            >
              <ChevronLeft size={14} /> Kembali ke Form Booking
            </Link>
            <h1 className="text-2xl font-black uppercase tracking-tight flex items-center gap-3">
              <Clock className="text-yellow-500" size={24} />
              Riwayat Booking
            </h1>
          </div>
        </div>

        {/* LIST ANTRIAN DENGAN DESAIN BARU (KOLOM PUTIH BERSIH) */}
        <div className="space-y-5">
          {myBookings.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-white/10 rounded-[2rem] bg-neutral-900/10">
              <FileText size={40} className="text-neutral-700 mx-auto mb-4" />
              <p className="text-sm text-neutral-500 font-light italic">
                Belum ada catatan pengerjaan kendaraan di sistem kami.
              </p>
            </div>
          ) : (
            myBookings.map((b) => (
              /* REVISI UTAMA: BG JADI bg-white, TEXT JADI text-neutral-900, KOTAK EMAS/BIRU DISESUAIKAN */
              <div
                key={b.id}
                className="p-6 bg-white text-neutral-900 rounded-[2rem] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 shadow-xl border border-neutral-200 transition-all group animate-fadeIn"
              >
                <div className="space-y-3 flex-1">
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-lg border ${
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
                    <span className="text-[10px] text-neutral-400 font-mono tracking-tighter bg-neutral-100 px-1.5 py-0.5 rounded">
                      ID: {b.id.slice(0, 8).toUpperCase()}
                    </span>
                  </div>

                  <div>
                    <p className="text-xs text-neutral-500 flex items-center gap-1 mb-1 font-medium">
                      <User size={12} className="text-neutral-400" /> Pendaftar:{" "}
                      <span className="text-neutral-800 font-bold">
                        {b.full_name}
                      </span>
                    </p>
                    <h4 className="font-black text-neutral-900 uppercase text-lg leading-tight group-hover:text-blue-600 transition-colors">
                      {b.car_model}
                    </h4>
                    <p className="text-xs text-neutral-600 font-normal flex items-center gap-1.5 mt-1.5">
                      <Calendar size={13} className="text-neutral-400" />
                      Jadwal Pengerjaan:{" "}
                      <strong className="text-neutral-900">
                        {new Date(b.booking_date).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </strong>
                    </p>
                  </div>
                </div>

                {/* AREA SEBELAH KANAN (TOMBOL DOWNLOAD / STATUS PROSES / BATAL) */}
                <div className="w-full sm:w-auto flex-shrink-0">
                  {b.status === "selesai" && b.receipt_pdf_url ? (
                    <a
                      href={b.receipt_pdf_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-neutral-900 hover:bg-black text-white px-6 py-3.5 rounded-xl text-xs font-bold transition-all shadow-md active:scale-[0.98]"
                    >
                      <Download size={14} />
                      <span>Unduh Kuitansi</span>
                    </a>
                  ) : (
                    <div
                      className={`px-5 py-3 rounded-xl border text-center font-bold ${
                        b.status === "proses"
                          ? "bg-blue-50 border-blue-200"
                          : b.status === "batal"
                            ? "bg-red-50 border-red-200"
                            : "bg-yellow-50 border-yellow-200"
                      }`}
                    >
                      <p
                        className={`text-[11px] uppercase tracking-widest ${
                          b.status === "proses"
                            ? "text-blue-600"
                            : b.status === "batal"
                              ? "text-red-600"
                              : "text-yellow-600"
                        }`}
                      >
                        {b.status === "proses"
                          ? "Unit Sedang Dikerjakan"
                          : b.status === "batal"
                            ? "Booking Dibatalkan"
                            : "Menunggu Konfirmasi"}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* INFO FOOTER */}
        <div className="p-6 bg-blue-500/5 border border-blue-500/10 rounded-2xl">
          <p className="text-[11px] text-blue-400/80 leading-relaxed text-center italic">
            "Kuitansi resmi hanya dapat diunduh setelah status pengerjaan
            dinyatakan 'Selesai' oleh admin workshop Pixel Sticker."
          </p>
        </div>
      </div>
    </div>
  );
}
