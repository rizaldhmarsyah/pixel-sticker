"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Search, MessageSquare, ShieldCheck, Zap } from "lucide-react";

export default function PublicCatalogPage() {
  const [catalogItems, setCatalogItems] = useState<any[]>([]);
  const [filteredItems, setFilteredItems] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [debugError, setDebugError] = useState<string | null>(null);

  const supabase = createClient();
  const categories = ["Semua", "Satin", "Glossy", "Chrome", "PPF"];

  const fetchCatalog = async () => {
    setLoading(true);
    setDebugError(null);

    // STRATEGI 1: Coba ambil data katalog + join stok bahan
    const { data, error } = await supabase.from("catalog").select(`
        *,
        materials (
          name,
          stock
        )
      `);

    if (error) {
      // STRATEGI 2 (FALLBACK): Jika join ditolak karena RLS gudang dikunci,
      // paksa ambil data katalognya saja agar halaman depan tidak crash!
      const { data: fallbackData, error: fallbackError } = await supabase
        .from("catalog")
        .select("*");

      if (fallbackError) {
        setDebugError(fallbackError.message);
        setLoading(false);
        // Jika ini pun gagal, munculkan teks error aslinya ke layar
        throw new Error("Supabase Error: " + fallbackError.message);
      } else if (fallbackData) {
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

  // Filter Kategori & Search Bar
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
    <div className="min-h-screen bg-[#050505] text-white font-sans antialiased selection:bg-blue-600">
      {/* --- HERO BANNER --- */}
      <div className="relative overflow-hidden py-20 px-4 border-b border-white/5 bg-gradient-to-b from-blue-950/20 to-transparent">
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <span className="text-xs font-bold tracking-[0.3em] text-blue-500 uppercase bg-blue-500/5 px-4 py-2 rounded-full border border-blue-500/10">
            Pixel Sticker Premium Gallery
          </span>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight mt-6 uppercase">
            Pilih Varian{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">
              Stikermu
            </span>
          </h1>
          <p className="text-neutral-400 text-sm md:text-base max-w-xl mx-auto mt-4 font-light">
            Ubah tampilan kendaraanmu jadi lebih eksklusif dengan material
            premium bergaransi resmi.
          </p>
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />
      </div>

      {/* --- UTILITY BAR (Search & Filter Kategori) --- */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-neutral-900/40 border border-white/5 p-4 rounded-3xl backdrop-blur-md">
          <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  selectedCategory === cat
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                    : "bg-white/5 text-neutral-400 hover:text-white hover:bg-white/10"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-80">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500"
              size={16}
            />
            <input
              placeholder="Cari warna favoritmu..."
              className="w-full bg-black/60 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-xs text-white outline-none focus:border-blue-500 transition-all"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* --- GRID KARTU KATALOG --- */}
      <div className="max-w-6xl mx-auto px-4 pb-24">
        {loading ? (
          <div className="text-center py-24">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-xs text-neutral-500 italic">
              Membuka etalase stiker...
            </p>
          </div>
        ) : filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredItems.map((item) => {
              // Jika data materials ada, cek stock-nya. Jika kosong/null, default anggap ready stock.
              const hasStock = item.materials ? item.materials.stock > 0 : true;

              return (
                <div
                  key={item.id}
                  className="bg-neutral-900/20 border border-white/5 rounded-[2rem] overflow-hidden group hover:border-white/10 transition-all duration-300 flex flex-col hover:shadow-2xl hover:shadow-blue-900/5"
                >
                  <div className="aspect-[4/3] bg-neutral-950 relative overflow-hidden border-b border-white/5">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-neutral-700">
                        <Zap size={32} className="mb-2 stroke-[1.5]" />
                        <span className="text-[10px] uppercase font-bold tracking-widest">
                          No Preview Available
                        </span>
                      </div>
                    )}

                    {item.tag && (
                      <span className="absolute top-4 left-4 text-[9px] uppercase tracking-widest font-black bg-blue-600 text-white px-3 py-1.5 rounded-lg shadow-md">
                        {item.tag}
                      </span>
                    )}

                    <span
                      className={`absolute top-4 right-4 text-[9px] uppercase tracking-widest font-bold px-3 py-1.5 rounded-lg border backdrop-blur-md ${
                        hasStock
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/10"
                          : "bg-rose-500/10 text-rose-400 border-rose-500/10"
                      }`}
                    >
                      {hasStock ? "🟢 Ready Stock" : "🔴 Sold Out"}
                    </span>
                  </div>

                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">
                        {item.category || "Satin"} Series
                      </span>
                      <h3 className="text-xl font-bold mt-1 text-white group-hover:text-blue-400 transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-neutral-400 text-xs mt-3 leading-relaxed font-light line-clamp-3">
                        {item.description ||
                          "Hubungi admin untuk info detail spesifikasi ketahanan stiker mobil ini."}
                      </p>
                    </div>

                    <div className="mt-6 pt-5 border-t border-white/5 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-neutral-500">
                        <ShieldCheck size={14} className="text-emerald-500" />
                        <span className="text-[10px] uppercase font-medium tracking-wider">
                          Premium Quality
                        </span>
                      </div>

                      <a
                        href={`https://wa.me/628xxxxxxxxxx?text=Halo%20Pixel%20Sticker,%20saya%20tertarik%20dengan%20warna%20*${encodeURIComponent(item.title || "")}*`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 bg-white hover:bg-neutral-200 text-black px-4 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95"
                      >
                        <MessageSquare size={14} />
                        <span>Tanya Harga</span>
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-32 border border-white/5 border-dashed rounded-[2rem]">
            <p className="text-sm text-neutral-500 italic">
              Varian stiker tidak ditemukan.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
