"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import {
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Layers,
  Info,
  Loader2,
  Sparkles,
  Video,
} from "lucide-react";

// 📝 SUB-KOMPONEN CAROUSEL MULTI-MEDIA DETAIL
function DetailMediaCarousel({
  mediaList,
  title,
  tag,
}: {
  mediaList: string[];
  title: string;
  tag?: string | null;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const isVideoUrl = (url: string | null) => {
    if (!url) return false;
    const videoExtensions = [".mp4", ".webm", ".ogg", ".mov", ".m4v"];
    return videoExtensions.some(
      (ext) =>
        url.toLowerCase().endsWith(ext) || url.toLowerCase().includes("video"),
    );
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.preventDefault();
    setCurrentIndex((prev) => (prev === 0 ? mediaList.length - 1 : prev - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault();
    setCurrentIndex((prev) => (prev === mediaList.length - 1 ? 0 : prev + 1));
  };

  if (!mediaList || mediaList.length === 0) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-neutral-800">
        <Layers size={48} className="mb-2" />
        <span className="text-xs font-bold uppercase tracking-wider">
          No Preview Available
        </span>
      </div>
    );
  }

  const currentMedia = mediaList[currentIndex];
  const isCurrentVideo = isVideoUrl(currentMedia);

  return (
    <div className="w-full h-full relative group/carousel overflow-hidden rounded-[2rem]">
      {/* Container Render Media Slide */}
      {isCurrentVideo ? (
        <video
          key={currentMedia}
          src={currentMedia}
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover transition-all duration-500"
        />
      ) : (
        <img
          src={currentMedia}
          alt={`${title} - slide ${currentIndex + 1}`}
          className="w-full h-full object-cover transition-transform duration-700 group-hover/carousel:scale-102"
        />
      )}

      {/* Tombol Panah Navigasi (Aktif jika media > 1) */}
      {mediaList.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/90 backdrop-blur-md text-white p-2 rounded-full opacity-0 group-hover/carousel:opacity-100 transition-all duration-200 z-20 active:scale-90"
            title="Media Sebelumnya"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/90 backdrop-blur-md text-white p-2 rounded-full opacity-0 group-hover/carousel:opacity-100 transition-all duration-200 z-20 active:scale-90"
            title="Media Berikutnya"
          >
            <ChevronRight size={18} />
          </button>

          {/* Indikator Titik Carousel (Pagination Dots) */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20 bg-black/50 px-3 py-1.5 rounded-full backdrop-blur-md border border-white/10">
            {mediaList.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  currentIndex === idx
                    ? "w-5 bg-blue-500"
                    : "w-1.5 bg-white/40 hover:bg-white/80"
                }`}
              />
            ))}
          </div>
        </>
      )}

      {/* Badge Penanda Video */}
      {isCurrentVideo && (
        <span className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md text-white/90 px-2.5 py-1 rounded-lg border border-white/10 text-[10px] font-bold flex items-center gap-1 z-10">
          <Video size={12} /> Video
        </span>
      )}

      {/* Tag Status */}
      {tag && (
        <span className="absolute top-5 left-5 text-[9px] uppercase tracking-widest font-black bg-blue-600 text-white px-3.5 py-2 rounded-xl shadow-lg border border-blue-400/20 z-10">
          {tag}
        </span>
      )}
    </div>
  );
}

export default function CatalogDetailPage() {
  const params = useParams() as any;
  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  // 📝 Helper menguraikan image_url (string tunggal atau JSON array) menjadi Array of URLs
  const parseMediaList = (mediaData: any): string[] => {
    if (!mediaData) return [];
    if (Array.isArray(mediaData)) return mediaData;
    if (typeof mediaData === "string") {
      if (mediaData.startsWith("[")) {
        try {
          const parsed = JSON.parse(mediaData);
          if (Array.isArray(parsed)) return parsed;
        } catch {
          return [mediaData];
        }
      }
      return [mediaData];
    }
    return [];
  };

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

      if (isNumberId) {
        const { data: dataByIdCatalog } = await supabase
          .from("catalog")
          .select("*")
          .eq("id_catalog", parsedIntId)
          .maybeSingle();

        fetchedData = dataByIdCatalog;
      }

      if (!fetchedData) {
        const { data: dataByIdLegacy } = await supabase
          .from("catalog")
          .select("*")
          .eq("id", rawUrlId)
          .maybeSingle();

        fetchedData = dataByIdLegacy;
      }

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

  const mediaList = parseMediaList(item.image_url);

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

        {/* ================= APPLE BOX DESIGN (FULLY CENTERED) ================= */}
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

          {/* MULTI-MEDIA CAROUSEL CONTAINER */}
          <div className="w-full max-w-xl aspect-[4/3] bg-neutral-950 rounded-[2rem] border border-white/10 overflow-hidden relative shadow-2xl">
            <DetailMediaCarousel
              mediaList={mediaList}
              title={item.title}
              tag={item.tag}
            />
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
              href={`https://wa.me/628xxxxxxxxxx?text=Halo%20Pixel%20Sticker,%20saya%20tertarik%20ingin%20tanya%20harga%20dan%20pasang%20warna%20*${encodeURIComponent(
                item.title || "",
              )}*`}
              target="_blank"
              rel="noreferrer"
              className="w-full md:w-auto inline-flex items-center justify-center gap-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-black px-8 py-4 rounded-xl text-xs uppercase tracking-wider transition-all duration-300 active:scale-95 shadow-lg shadow-emerald-950/40 border border-emerald-400/30 group"
            >
              <svg
                className="w-4 h-4 fill-current group-hover:scale-110 transition-transform duration-300"
                viewBox="0 0 24 24"
              >
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
              </svg>
              <span>Konsultasi & Tanya Harga</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
