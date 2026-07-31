"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { Search, Eye, Zap, Sparkles } from "lucide-react";

export default function PublicCatalogPage() {
  const [catalogItems, setCatalogItems] = useState<any[]>([]);
  const [filteredItems, setFilteredItems] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  const supabase = createClient();
  const categories = ["Semua", "Doff", "Glossy", "Carbon", "Matt", "Satin"];

  const fetchCatalog = async () => {
    setLoading(true);
    // UPDATE DATABASE: materials join mengikuti relasi foreign key id_materials baru
    const { data, error } = await supabase.from("catalog").select(`
        *,
        materials (
          name,
          stock_meters
        )
      `);

    if (error) {
      const { data: fallbackData } = await supabase.from("catalog").select("*");
      if (fallbackData) {
        setCatalogItems(fallbackData);
        setFilteredItems(fallbackData);
      }
    } else if (data) {
      setCatalogItems(data);
      setFilteredItems(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCatalog();
  }, []);

  useEffect(() => {
    let result = catalogItems;
    if (selectedCategory !== "Semua") {
      result = result.filter((item) => item.category === selectedCategory);
    }
    if (searchTerm) {
      result = result.filter((item) =>
        item.title?.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }
    setFilteredItems(result);
  }, [selectedCategory, searchTerm, catalogItems]);

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans antialiased selection:bg-blue-600 relative overflow-x-hidden">
      {/* Background Ambient Glow Lingkaran ala Apple Premium */}
      <div className="absolute top-[-150px] left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-600/10 blur-[150px] rounded-full pointer-events-none z-0" />

      {/* --- HERO BANNER --- */}
      <div className="relative overflow-hidden pt-28 pb-16 px-4 z-10">
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <span className="inline-flex items-center gap-1.5 text-[10px] font-black tracking-[0.25em] text-blue-400 uppercase bg-blue-500/10 border border-blue-500/20 px-4 py-2 rounded-full backdrop-blur-md">
            <Sparkles size={12} className="animate-pulse" /> Pixel Sticker
            Premium Gallery
          </span>
          <h1 className="text-4xl md:text-7xl font-black tracking-tight mt-6 uppercase leading-tight">
            Pilih Varian <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-neutral-400">
              Stikermu
            </span>
          </h1>
          <p className="text-neutral-400 text-xs md:text-sm max-w-lg mx-auto mt-4 font-light tracking-wide leading-relaxed">
            Ubah tampilan kendaraanmu jadi lebih eksklusif dengan material
            premium bergaransi resmi studio kami.
          </p>
        </div>
      </div>

      {/* --- UTILITY BAR (Search & Filter Kategori Ala Apple Glassmorphism) --- */}
      <div className="max-w-6xl mx-auto px-4 py-4 z-10 relative">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-neutral-900/30 border border-white/10 p-4 rounded-[2rem] backdrop-blur-2xl shadow-2xl">
          <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 no-scrollbar items-center">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 whitespace-nowrap active:scale-95 ${
                  selectedCategory === cat
                    ? "bg-white text-black shadow-xl"
                    : "bg-white/[0.03] text-neutral-400 hover:text-white hover:bg-white/10 border border-white/5"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-80">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500"
              size={15}
            />
            <input
              placeholder="Cari warna favoritmu..."
              className="w-full bg-black/40 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-xs text-white outline-none focus:border-neutral-500 focus:bg-black/80 transition-all placeholder:text-neutral-500 font-medium"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* --- GRID KARTU KATALOG --- */}
      <div className="max-w-6xl mx-auto px-4 pb-32 pt-8 z-10 relative">
        {loading ? (
          <div className="text-center py-24">
            <div className="w-8 h-8 border-2 border-neutral-700 border-t-white rounded-full animate-spin mx-auto mb-4" />
            <p className="text-xs text-neutral-500 italic font-light tracking-wide">
              Membuka etalase stiker...
            </p>
          </div>
        ) : filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredItems.map((item) => {
              const currentRouteParam =
                item.id_catalog !== undefined && item.id_catalog !== null
                  ? item.id_catalog
                  : item.id || "error";

              const hasStock = item.materials
                ? item.materials.stock_meters > 0
                : true;

              return (
                <div
                  key={currentRouteParam}
                  className="bg-neutral-900/20 border border-white/5 rounded-[2.5rem] overflow-hidden group hover:border-white/15 transition-all duration-500 flex flex-col hover:shadow-2xl shadow-black relative"
                >
                  {/* Foto Varian */}
                  <div className="aspect-[4/3] bg-neutral-950 relative overflow-hidden border-b border-white/5 shadow-inner">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.title}
                        className="w-full h-full object-cover scale-100 group-hover:scale-102 transition-transform duration-700"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-neutral-800 bg-neutral-900/50">
                        <Zap size={28} className="mb-1.5 stroke-[1.25]" />
                        <span className="text-[9px] uppercase font-bold tracking-widest">
                          No Preview
                        </span>
                      </div>
                    )}

                    {/* Badge Varian Tag */}
                    {item.tag && (
                      <span className="absolute top-5 left-5 text-[9px] uppercase tracking-widest font-black bg-blue-600 text-white px-3 py-1.5 rounded-xl shadow-md border border-blue-400/20">
                        {item.tag}
                      </span>
                    )}

                    {/* Badge Status Stok Minimalis */}
                    <span
                      className={`absolute top-5 right-5 text-[9px] uppercase tracking-widest font-bold px-3 py-1.5 rounded-xl border backdrop-blur-md shadow-sm ${
                        hasStock
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                      }`}
                    >
                      {hasStock ? "🟢 Ready" : "🔴 Sold"}
                    </span>
                  </div>

                  {/* Info Konten Kartu - CENTERED ALIGNMENT */}
                  <div className="p-6 flex flex-col justify-between flex-1 gap-6 bg-gradient-to-b from-transparent to-white/[0.01] text-center items-center">
                    <div className="flex flex-col items-center">
                      <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest bg-blue-500/5 border border-blue-500/10 px-2.5 py-1 rounded-md inline-block">
                        {item.category || "Satin"} Series
                      </span>
                      <h3 className="text-lg font-bold mt-4 text-white tracking-tight group-hover:text-blue-400 transition-colors duration-300 uppercase text-center max-w-[90%]">
                        {item.title}
                      </h3>
                    </div>

                    {/* REVISI DESAIN: Lebar Penuh Rata Tengah Simetris */}
                    <div className="w-full pt-2">
                      <Link
                        href={`/catalog/${currentRouteParam}`}
                        className="inline-flex items-center justify-center gap-2 bg-white text-black hover:bg-neutral-200 w-full py-3.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all duration-300 active:scale-[0.98] shadow-lg shadow-black/40"
                      >
                        <Eye size={13} strokeWidth={2.5} />
                        <span>Lihat Detail Varian</span>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-32 border border-white/5 border-dashed rounded-[2.5rem] bg-neutral-900/5">
            <p className="text-xs text-neutral-500 italic font-light tracking-wide">
              Varian stiker tidak ditemukan.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
