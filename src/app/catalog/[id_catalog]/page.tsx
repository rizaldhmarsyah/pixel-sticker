"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import {
  ChevronLeft,
  MessageSquare,
  ShieldCheck,
  Layers,
  Info,
  Loader2,
  Sparkles,
} from "lucide-react";

export default function CatalogDetailPage() {
  const params = useParams() as any;
  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchDetailItem = async () => {
      if (!params) return;

      const rawUrlId = params.id_catalog;
      if (!rawUrlId || rawUrlId === "none" || rawUrlId === "catalog") {
        setLoading(false);
        return;
      }

      setLoading(true);
      const parsedIntId = parseInt(rawUrlId as string, 10);
      const isNumberId = !isNaN(parsedIntId);

      let fetchedData = null;

      // STRATEGI 1: Tembak id_catalog bertipe data integer
      if (isNumberId) {
        const { data: dataByIdCatalog } = await supabase
          .from("catalog")
          .select("*")
          .eq("id_catalog", parsedIntId)
          .maybeSingle();

        fetchedData = dataByIdCatalog;
      }

      // STRATEGI 2: Fallback pencarian UUID legacy
      if (!fetchedData) {
        const { data: dataByIdLegacy } = await supabase
          .from("catalog")
          .select("*")
          .eq("id", rawUrlId)
          .maybeSingle();

        fetchedData = dataByIdLegacy;
      }

      // STRATEGI 3: Fallback pencarian teks biasa id_catalog
      if (!fetchedData) {
        const { data: dataByIdCatalogText } = await supabase
          .from("catalog")
          .select("*")
          .eq("id_catalog", rawUrlId)
          .maybeSingle();

        fetchedData = dataByIdCatalogText;
      }

      if (fetchedData) {
        setItem(fetchedData);
      }
      setLoading(false);
    };

    fetchDetailItem();
  }, [params, supabase]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center text-white">
        <Loader2 size={32} className="animate-spin text-blue-500" />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center text-white p-6 text-center">
        <Info size={48} className="text-neutral-600 mb-4" />
        <h2 className="text-lg font-bold uppercase">Produk Tidak Ditemukan</h2>
        <Link
          href="/catalog"
          className="text-blue-400 hover:underline text-xs mt-4 flex items-center gap-1"
        >
          <ChevronLeft size={14} /> Kembali ke Galeri Katalog
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans antialiased pt-28 pb-24 px-4 relative overflow-x-hidden select-none">
      {/* Background Ambient Glow Lingkaran ala Apple Premium */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-blue-600/10 blur-[130px] rounded-full pointer-events-none z-0" />

      <div className="max-w-3xl mx-auto space-y-6 relative z-10 text-center flex flex-col items-center">
        {/* Tombol Kembali */}
        <div className="w-full text-left mb-2">
          <Link
            href="/catalog"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-neutral-500 hover:text-white transition-all hover:-translate-x-1 duration-200"
          >
            <ChevronLeft size={14} /> Kembali ke Galeri
          </Link>
        </div>

        {/* ================= APPLE BOX BOX DESIGN (FULLY CENTERED) ================= */}
        <div className="w-full bg-neutral-900/30 border border-white/10 p-6 md:p-12 rounded-[2.5rem] backdrop-blur-2xl shadow-2xl flex flex-col items-center space-y-8">
          {/* Badge Status */}
          <div className="flex items-center gap-3 justify-center">
            <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest bg-blue-500/10 border border-blue-500/20 px-3 py-1.5 rounded-full flex items-center gap-1">
              <Sparkles size={11} /> {item.category || "Satin"} Series
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full border bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-sm">
              🟢 Ready Stock
            </span>
          </div>

          {/* Judul Jumbo */}
          <h1 className="text-3xl md:text-5xl font-black tracking-tight uppercase leading-none text-white max-w-2xl text-center">
            {item.title}
          </h1>

          <div className="w-16 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full" />

          {/* Foto Tengah */}
          <div className="w-full max-w-xl aspect-[4/3] bg-neutral-950 rounded-[2rem] border border-white/10 overflow-hidden relative shadow-2xl group">
            {item.image_url ? (
              <img
                src={item.image_url}
                alt={item.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-102"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-neutral-800">
                <Layers size={48} className="mb-2" />
                <span className="text-xs font-bold uppercase tracking-wider">
                  No Preview Available
                </span>
              </div>
            )}

            {item.tag && (
              <span className="absolute top-5 left-5 text-[9px] uppercase tracking-widest font-black bg-blue-600 text-white px-3.5 py-2 rounded-xl shadow-lg border border-blue-400/20">
                {item.tag}
              </span>
            )}
          </div>

          {/* Deskripsi Tengah */}
          <div className="w-full max-w-xl space-y-3 text-center">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 flex items-center justify-center gap-1.5">
              <Info size={12} className="text-blue-500" /> Deskripsi &
              Spesifikasi Portofolio
            </h4>
            <p className="text-neutral-300 text-sm font-light leading-relaxed whitespace-pre-line bg-white/[0.03] border border-white/5 p-5 md:p-6 rounded-2xl shadow-inner text-center">
              {item.description ||
                "Bahan pembungkus mobil kustom premium berdaya tahan tinggi, menjaga cat asli mobil dari goresan jalan raya dan sinar UV matahari hingga 3 tahun operasional."}
            </p>
          </div>

          {/* Footer Card */}
          <div className="w-full max-w-xl pt-6 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-5 text-center md:text-left">
            <div className="flex items-center gap-3 justify-center md:justify-start">
              <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
                <ShieldCheck size={18} />
              </div>
              <div className="text-left">
                <span className="text-[10px] uppercase font-black tracking-wider block text-white leading-tight">
                  Garansi Resmi Gallery
                </span>
                <span className="text-[9px] font-light text-neutral-500 block mt-0.5">
                  100% Original Premium Vinyl Pack
                </span>
              </div>
            </div>

            <a
              href={`https://wa.me/628xxxxxxxxxx?text=Halo%20Pixel%20Sticker,%20saya%20tertarik%20ingin%20tanya%20harga%20dan%20pasang%20warna%20*${encodeURIComponent(item.title || "")}*`}
              target="_blank"
              rel="noreferrer"
              className="w-full md:w-auto inline-flex items-center justify-center gap-2 bg-white hover:bg-neutral-200 text-black px-8 py-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 active:scale-98 shadow-xl hover:shadow-white/5"
            >
              <MessageSquare size={14} />
              <span>Konsultasi & Tanya Harga</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
