// src/app/tentang-kami/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Sparkles,
  Award,
  Clock,
  MapPin,
  Phone,
  Mail,
  ChevronRight,
  Car,
  Users,
} from "lucide-react";

export default function TentangKamiPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#F5F5F7] text-neutral-950 font-sans antialiased text-left selection:bg-blue-500 selection:text-white">
      {/* HERO SECTION MINI */}
      <div className="bg-white border-b border-neutral-200/60 py-16 md:py-24 px-6 md:p-12 text-center relative overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-3xl mx-auto space-y-4 relative z-10">
          <span className="text-[10px] md:text-xs font-black uppercase tracking-widest text-blue-600 bg-blue-50 px-3.5 py-1.5 rounded-full border border-blue-100">
            Premium Car Wrap Studio
          </span>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight text-neutral-900 uppercase">
            Pixel Sticker
          </h1>
          <p className="text-sm md:text-base text-neutral-500 max-w-xl mx-auto font-normal leading-relaxed">
            Dedikasi penuh pada presisi, estetika, dan perlindungan cat
            kendaraan mewah Anda dengan material premium berstandar
            internasional.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12 md:py-20 space-y-16 md:space-y-24">
        {/* SECTION 1: CERITA & VISI KAMI */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
          <div className="space-y-4 md:space-y-6">
            <div className="w-11 h-11 bg-blue-50 border border-blue-200/60 rounded-xl flex items-center justify-center">
              <Sparkles size={20} className="text-blue-600" />
            </div>
            <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight text-neutral-900">
              Siapa Kami?
            </h2>
            <p className="text-xs md:text-sm text-neutral-600 leading-relaxed font-medium">
              Berawal dari sebuah gairah mendalam terhadap dunia modifikasi
              visual otomotif, <strong>Pixel Sticker</strong> hadir sebagai
              solusi premium car wrapping terpercaya di Jakarta. Kami bukan
              sekadar menempelkan stiker, kami mendesain ulang karakter
              kendaraan Anda.
            </p>
            <p className="text-xs md:text-sm text-neutral-600 leading-relaxed font-medium">
              Setiap sudut, lekukan, dan detail bodi mobil dikerjakan secara
              manual oleh tim teknisi profesional bersertifikat, menjamin hasil
              akhir yang rapi, mulus, dan tahan lama layaknya cat orisinal
              pabrikan.
            </p>
          </div>

          {/* SISI KANAN: STATISTIK MINI */}
          <div className="grid grid-cols-2 gap-4 bg-white p-6 md:p-8 rounded-[2rem] border border-neutral-200/60 shadow-sm">
            <div className="p-4 bg-[#F5F5F7] rounded-2xl space-y-1">
              <h3 className="text-2xl font-black text-blue-600 font-mono">
                100%
              </h3>
              <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                Kepuasan Pelanggan
              </p>
            </div>
            <div className="p-4 bg-[#F5F5F7] rounded-2xl space-y-1">
              <h3 className="text-2xl font-black text-purple-600 font-mono">
                5+
              </h3>
              <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                Tahun Pengalaman
              </p>
            </div>
            <div className="p-4 bg-[#F5F5F7] rounded-2xl space-y-1">
              <h3 className="text-2xl font-black text-neutral-900 font-mono">
                1,200+
              </h3>
              <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                Mobil Dikerjakan
              </p>
            </div>
            <div className="p-4 bg-[#F5F5F7] rounded-2xl space-y-1">
              <h3 className="text-2xl font-black text-green-600 font-mono">
                Premium
              </h3>
              <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                Material Bergaransi
              </p>
            </div>
          </div>
        </div>

        {/* SECTION 2: KEUNGGULAN WORKSHOP KAMI */}
        <div className="space-y-8 md:space-y-12">
          <div className="text-center md:text-left space-y-1">
            <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight text-neutral-900">
              Mengapa Memilih Pixel Sticker?
            </h2>
            <p className="text-xs text-neutral-500 font-medium">
              Standar kerja eksekutif demi menjaga kualitas estetika jangka
              panjang kendaraan Anda.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* CARD 1 */}
            <div className="bg-white border border-neutral-200/60 p-6 md:p-8 rounded-[2rem] shadow-sm space-y-4">
              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center border border-blue-100">
                <ShieldCheck size={18} />
              </div>
              <h3 className="text-sm font-bold uppercase tracking-tight text-neutral-900">
                Bahan Premium Bergaransi
              </h3>
              <p className="text-xs text-neutral-500 leading-relaxed font-normal">
                Kami hanya menggunakan material impor kualitas tertinggi
                (TeckWrap, Avery Dennison, Oracal) yang tidak merusak cat asli
                mobil saat dilepas di kemudian hari.
              </p>
            </div>
            {/* CARD 2 */}
            <div className="bg-white border border-neutral-200/60 p-6 md:p-8 rounded-[2rem] shadow-sm space-y-4">
              <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center border border-purple-100">
                <Users size={18} />
              </div>
              <h3 className="text-sm font-bold uppercase tracking-tight text-neutral-900">
                Teknisi Spesialis Presisi
              </h3>
              <p className="text-xs text-neutral-500 leading-relaxed font-normal">
                Dikerjakan secara detail oleh aplikator profesional yang
                berpengalaman menangani puluhan tipe mobil, mulai dari City Car,
                SUV, hingga Supercar.
              </p>
            </div>
            {/* CARD 3 */}
            <div className="bg-white border border-neutral-200/60 p-6 md:p-8 rounded-[2rem] shadow-sm space-y-4">
              <div className="w-10 h-10 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center border border-green-100">
                <Award size={18} />
              </div>
              <h3 className="text-sm font-bold uppercase tracking-tight text-neutral-900">
                Fasilitas Workshop Steril
              </h3>
              <p className="text-xs text-neutral-500 leading-relaxed font-normal">
                Proses penempelan dilakukan di dalam ruangan tertutup (indoor
                studio) yang bersih dan bebas debu untuk menghindari gelembung
                kotoran pada permukaan bodi mobil.
              </p>
            </div>
          </div>
        </div>

        {/* SECTION 3: KONTAK & JAM OPERASIONAL */}
        <div className="bg-neutral-900 text-white rounded-[2.5rem] p-8 md:p-12 shadow-xl grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-7 space-y-4">
            <span className="text-[9px] font-black uppercase tracking-widest text-blue-400 bg-blue-500/10 px-3 py-1 rounded-md border border-blue-500/20">
              Kunjungi Workshop Kami
            </span>
            <h2 className="text-xl md:text-3xl font-black uppercase tracking-tight text-white">
              Siap Mengubah Tampilan Mobil Anda?
            </h2>
            <p className="text-xs text-neutral-400 leading-relaxed max-w-md font-normal">
              Gunakan sistem reservasi online kami untuk mengunci slot tanggal
              pengerjaan wrapping bodi mobil Anda tanpa perlu mengantre lama di
              bengkel.
            </p>
            <div className="pt-2">
              <Link
                href="/booking"
                className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold uppercase tracking-wider px-6 py-3.5 rounded-xl shadow-lg shadow-blue-600/20 transition-all active:scale-95"
              >
                <span>Mulai Reservasi Online</span>
                <ChevronRight size={14} />
              </Link>
            </div>
          </div>

          <div className="md:col-span-5 space-y-4 border-t md:border-t-0 md:border-l border-neutral-800 pt-6 md:pt-0 md:pl-8 text-xs font-medium text-neutral-300">
            <div className="flex items-start gap-3">
              <MapPin size={16} className="text-blue-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-white font-bold text-xs uppercase tracking-wider mb-0.5">
                  Lokasi Studio
                </p>
                <p className="text-neutral-400 font-normal">
                  Jl. Raya Outer Ringroad No. 42, Puri Kembangan, Jakarta Barat
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Clock size={16} className="text-purple-500 shrink-0" />
              <div>
                <p className="text-white font-bold text-xs uppercase tracking-wider mb-0.5">
                  Jam Operasional
                </p>
                <p className="text-neutral-400 font-normal">
                  Senin - Sabtu: 09.00 - 18.00 WIB (Minggu Libur)
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone size={16} className="text-green-500 shrink-0" />
              <div>
                <p className="text-white font-bold text-xs uppercase tracking-wider mb-0.5">
                  WhatsApp Kasir
                </p>
                <p className="text-neutral-400 font-normal">
                  +62 812-3456-7890
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
