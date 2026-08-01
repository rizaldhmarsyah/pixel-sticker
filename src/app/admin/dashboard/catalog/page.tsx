"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Plus,
  Image as ImageIcon,
  ChevronLeft,
  FolderHeart,
  Trash2,
  Pencil,
  X,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Car,
  Video,
  Layers,
} from "lucide-react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import {
  addCatalogItem,
  deleteCatalogItem,
  updateCatalogItem,
} from "./actions";

export default function CatalogAdminPage() {
  const formRef = useRef<HTMLFormElement>(null);
  const supabase = createClient();

  const [catalogItems, setCatalogItems] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);
  const [cars, setCars] = useState<any[]>([]);
  const [loadingPage, setLoadingPage] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editItem, setEditItem] = useState<any | null>(null);
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // State untuk menampung live preview file yang sedang dipilih di form
  const [selectedMediaPreviews, setSelectedMediaPreviews] = useState<
    { url: string; isVideo: boolean }[]
  >([]);

  // 📝 Helper mendeteksi ekstensi video
  const isVideoUrl = (url: string | null) => {
    if (!url) return false;
    const videoExtensions = [".mp4", ".webm", ".ogg", ".mov", ".m4v"];
    return videoExtensions.some(
      (ext) =>
        url.toLowerCase().endsWith(ext) || url.toLowerCase().includes("video"),
    );
  };

  // 📝 Helper mengambil media utama untuk thumbnail tabel (mendukung string tunggal maupun array)
  const getMainMedia = (mediaData: any) => {
    if (!mediaData) return null;
    if (Array.isArray(mediaData)) return mediaData[0] || null;
    if (typeof mediaData === "string") {
      // Jika di database berupa string JSON array bersarang, kita parse
      if (mediaData.startsWith("[")) {
        try {
          const parsed = JSON.parse(mediaData);
          return parsed[0] || null;
        } catch {
          return mediaData;
        }
      }
      return mediaData;
    }
    return null;
  };

  // 📝 Helper menghitung total media yang diunggah
  const getMediaCount = (mediaData: any) => {
    if (!mediaData) return 0;
    if (Array.isArray(mediaData)) return mediaData.length;
    if (typeof mediaData === "string" && mediaData.startsWith("[")) {
      try {
        return JSON.parse(mediaData).length;
      } catch {
        return 1;
      }
    }
    return 1;
  };

  const refreshData = async () => {
    try {
      const { data: matData } = await supabase
        .from("materials")
        .select("id_material, name")
        .order("name", { ascending: true });
      if (matData) setMaterials(matData);

      const { data: carData } = await supabase
        .from("cars")
        .select("id_cars, brand, model")
        .order("brand", { ascending: true });
      if (carData) setCars(carData);

      const { data: catData, error: catError } = await supabase
        .from("catalog")
        .select(
          `
          *,
          materials (
            name,
            stock_meters
          ),
          cars (
            brand,
            model
          )
        `,
        )
        .order("created_at", { ascending: false });

      if (catError) {
        const { data: fallbackData } = await supabase
          .from("catalog")
          .select("*")
          .order("created_at", { ascending: false });
        setCatalogItems(fallbackData || []);
      } else if (catData) {
        setCatalogItems(catData);
      }
    } catch (err) {
      console.error("Gagal memuat data database:", err);
    } finally {
      setLoadingPage(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Handle perubahan input file untuk memunculkan banyak preview sekaligus
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const previews = Array.from(files).map((file) => ({
      url: URL.createObjectURL(file),
      isVideo: file.type.startsWith("video/"),
    }));
    setSelectedMediaPreviews(previews);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setNotification(null);

    const formData = new FormData(e.currentTarget);

    try {
      if (editItem) {
        await updateCatalogItem(formData);
        setNotification({
          type: "success",
          message: "Perubahan katalog multi-media berhasil disimpan!",
        });
        setEditItem(null);
      } else {
        await addCatalogItem(formData);
        setNotification({
          type: "success",
          message: "Item baru dengan multi-media berhasil ditambahkan!",
        });
        formRef.current?.reset();
        setSelectedMediaPreviews([]);
      }
      await refreshData();
    } catch (err: any) {
      setNotification({
        type: "error",
        message: err.message || "Terjadi kesalahan sistem.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelOrDelete = async (id: string) => {
    if (!confirm("Apakah kamu yakin ingin menghapus item katalog ini?")) return;

    setDeletingId(id);
    setNotification(null);

    const formData = new FormData();
    formData.append("id_catalog", id);

    try {
      await deleteCatalogItem(formData);
      setNotification({
        type: "success",
        message: "Item katalog berhasil dihapus dari etalase!",
      });
      if (editItem?.id_catalog === id) setEditItem(null);
      await refreshData();
    } catch (err: any) {
      setNotification({
        type: "error",
        message: err.message || "Gagal menghapus item.",
      });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="p-8 md:p-12 bg-[#F5F5F7] min-h-screen text-neutral-900 select-none relative antialiased">
      <div className="max-w-6xl mx-auto">
        {/* --- HEADER ATAS --- */}
        <div className="mb-10">
          <Link
            href="/admin/dashboard"
            className="inline-flex items-center gap-1.5 text-neutral-400 hover:text-neutral-900 transition-colors mb-4 group text-xs font-semibold uppercase tracking-wider"
          >
            <ChevronLeft
              size={14}
              className="group-hover:-translate-x-0.5 transition-transform"
            />
            <span>Dashboard</span>
          </Link>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white rounded-2xl text-neutral-900 shadow-sm border border-neutral-200/60">
              <FolderHeart size={24} />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-neutral-900">
                CMS Katalog Depan
              </h1>
              <p className="text-neutral-400 text-xs font-normal mt-1">
                Kelola etalase produk portofolio stiker (Mendukung Unggah Banyak
                Foto & Video Sekaligus).
              </p>
            </div>
          </div>
        </div>

        {/* --- POP-UP MODAL OVERLAY --- */}
        {notification && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/10 backdrop-blur-md">
            <div className="bg-white/80 backdrop-blur-xl border border-neutral-200 p-8 rounded-[2rem] max-w-sm w-full text-center shadow-2xl relative overflow-hidden">
              <div
                className={`absolute top-0 inset-x-0 h-1.5 ${notification.type === "success" ? "bg-emerald-500" : "bg-rose-500"}`}
              />
              <div className="mx-auto w-12 h-12 rounded-2xl flex items-center justify-center mb-4 bg-neutral-50 border border-neutral-200/60">
                {notification.type === "success" ? (
                  <CheckCircle2 size={24} className="text-emerald-500" />
                ) : (
                  <AlertTriangle size={24} className="text-rose-500" />
                )}
              </div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900 mb-1.5">
                {notification.type === "success"
                  ? "Tindakan Berhasil"
                  : "Gagal Sistem"}
              </h3>
              <p className="text-neutral-500 text-xs font-normal leading-relaxed mb-6 px-2 text-center">
                {notification.message}
              </p>
              <button
                type="button"
                onClick={() => setNotification(null)}
                className={`w-full font-bold py-3 rounded-xl text-xs uppercase tracking-widest text-white ${
                  notification.type === "success"
                    ? "bg-emerald-600"
                    : "bg-rose-600"
                }`}
              >
                Oke, Mantap
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* --- PANEL FORM KIRI --- */}
          <div className="lg:sticky lg:top-10 text-neutral-900">
            <div className="bg-white border border-neutral-200/60 p-8 rounded-[2rem] shadow-sm relative overflow-hidden">
              {editItem && (
                <div className="absolute top-0 inset-x-0 h-1 bg-blue-500" />
              )}

              <div className="flex justify-between items-center mb-6">
                <h2 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2 text-neutral-900">
                  {editItem ? (
                    <Pencil size={16} className="text-blue-500" />
                  ) : (
                    <Plus size={16} className="text-blue-500" />
                  )}
                  <span>{editItem ? "Edit Etalase" : "Tambah Etalase"}</span>
                </h2>
                {editItem && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditItem(null);
                      setSelectedMediaPreviews([]);
                    }}
                    className="text-neutral-500 hover:text-neutral-900 transition-colors flex items-center gap-1 text-[11px] font-bold bg-neutral-100 px-2.5 py-1 rounded-lg border border-neutral-200"
                  >
                    <X size={12} />
                    <span>Batal</span>
                  </button>
                )}
              </div>

              <form
                ref={formRef}
                onSubmit={handleSubmit}
                key={editItem?.id_catalog || "tambah"}
                className="space-y-4"
              >
                {editItem && (
                  <input
                    type="hidden"
                    name="id_catalog"
                    value={editItem.id_catalog}
                  />
                )}

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest ml-0.5">
                    Nama di Katalog
                  </label>
                  <input
                    name="title"
                    required
                    defaultValue={editItem?.title || ""}
                    placeholder="Premium Satin Midnight Blue"
                    className="w-full bg-[#F5F5F7] border border-neutral-200/80 rounded-xl px-4 py-3 text-xs font-medium text-neutral-900 outline-none transition-all focus:bg-white focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest ml-0.5">
                    Hubungkan ke Stok Gudang
                  </label>
                  <select
                    name="id_material"
                    defaultValue={editItem?.id_material || "none"}
                    className="w-full bg-[#F5F5F7] border border-neutral-200/80 rounded-xl px-4 py-3 text-xs font-medium text-neutral-900 outline-none cursor-pointer focus:bg-white focus:border-blue-500"
                  >
                    <option value="none" className="bg-white text-neutral-900">
                      -- Jangan Hubungkan (Hanya Portofolio) --
                    </option>
                    {materials.map((m) => (
                      <option
                        key={m.id_material}
                        value={m.id_material}
                        className="bg-white text-neutral-900"
                      >
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest ml-0.5 flex items-center gap-1">
                    <Car size={11} className="text-blue-500" /> Rekomendasi Tipe
                    Mobil
                  </label>
                  <select
                    name="id_cars"
                    defaultValue={editItem?.id_cars || "none"}
                    className="w-full bg-[#F5F5F7] border border-neutral-200/80 rounded-xl px-4 py-3 text-xs font-medium text-neutral-900 outline-none cursor-pointer focus:bg-white focus:border-blue-500"
                  >
                    <option value="none" className="bg-white text-neutral-900">
                      -- Berlaku Universal (Semua Mobil) --
                    </option>
                    {cars.map((c) => (
                      <option
                        key={c.id_cars}
                        value={c.id_cars}
                        className="bg-white text-neutral-900"
                      >
                        {c.brand} - {c.model}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest ml-0.5">
                    Kategori
                  </label>
                  <select
                    name="category"
                    defaultValue={editItem?.category || "Satin"}
                    className="w-full bg-[#F5F5F7] border border-neutral-200/80 rounded-xl px-4 py-3 text-xs font-medium text-neutral-900 outline-none cursor-pointer focus:bg-white focus:border-blue-500"
                  >
                    <option value="Doff" className="bg-white text-neutral-900">
                      Doff
                    </option>
                    <option
                      value="Glossy"
                      className="bg-white text-neutral-900"
                    >
                      Glossy
                    </option>
                    <option
                      value="Carbon"
                      className="bg-white text-neutral-900"
                    >
                      Carbon
                    </option>
                    <option value="Matt" className="bg-white text-neutral-900">
                      Matt
                    </option>
                    <option value="Satin" className="bg-white text-neutral-900">
                      Satin
                    </option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest ml-0.5">
                    Tag Status
                  </label>
                  <input
                    name="tag"
                    defaultValue={editItem?.tag || ""}
                    placeholder="Best Seller / Promo / New"
                    className="w-full bg-[#F5F5F7] border border-neutral-200/80 rounded-xl px-4 py-3 text-xs font-medium text-neutral-900 outline-none transition-all focus:bg-white focus:border-blue-500"
                  />
                </div>

                {/* 🔄 REVISI UPLOAD BERKAS: Mengaktifkan atribut 'multiple' */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest ml-0.5">
                    Upload Berkas Media{" "}
                    {editItem && "(Kosongkan jika tidak diganti)"}
                  </label>
                  <input
                    type="file"
                    name="image"
                    multiple
                    accept="image/*,video/*"
                    onChange={handleFileChange}
                    className="w-full bg-[#F5F5F7] border border-neutral-200/80 rounded-xl px-4 py-2.5 text-xs text-neutral-500 file:mr-3 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[11px] file:font-bold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer"
                  />
                  <p className="text-[9px] text-neutral-400 font-light px-0.5 leading-tight">
                    *Kamu bisa memilih banyak file sekaligus (contoh: 3 foto + 1
                    video).
                  </p>

                  {/* 🔄 LIVE MULTIPLE PREVIEW TRACKER */}
                  {selectedMediaPreviews.length > 0 && (
                    <div className="mt-3 p-3 bg-neutral-50 border border-neutral-200 rounded-2xl">
                      <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider mb-2">
                        Pratinjau Berkas Siap Diunggah (
                        {selectedMediaPreviews.length}):
                      </p>
                      <div className="grid grid-cols-4 gap-2">
                        {selectedMediaPreviews.map((media, index) => (
                          <div
                            key={index}
                            className="aspect-square bg-white border border-neutral-200 rounded-xl overflow-hidden relative shadow-sm"
                          >
                            {media.isVideo ? (
                              <video
                                src={media.url}
                                className="w-full h-full object-cover"
                                muted
                              />
                            ) : (
                              <img
                                src={media.url}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            )}
                            <div className="absolute bottom-1 right-1 bg-black/60 px-1 py-0.5 rounded text-[8px] text-white">
                              {media.isVideo ? "Vid" : "Img"}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest ml-0.5">
                    Deskripsi Promosi
                  </label>
                  <textarea
                    name="description"
                    rows={3}
                    defaultValue={editItem?.description || ""}
                    placeholder="Bahan premium buatan Amerika, ketahanan 3 tahun..."
                    className="w-full bg-[#F5F5F7] border border-neutral-200/80 rounded-xl px-4 py-3 text-xs font-medium text-neutral-900 outline-none resize-none focus:bg-white focus:border-blue-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full font-bold py-3.5 rounded-xl mt-4 transition-all active:scale-95 text-xs uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-50 ${
                    editItem
                      ? "bg-blue-600 text-white"
                      : "bg-neutral-900 text-white"
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={14} className="animate-spin text-white" />
                      <span>Memproses...</span>
                    </>
                  ) : (
                    <span>
                      {editItem ? "Simpan Perubahan" : "Tampilkan di Katalog"}
                    </span>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* --- TABEL DATA KANAN --- */}
          <div className="lg:col-span-2">
            <div className="bg-white border border-neutral-200/60 rounded-[2rem] overflow-hidden shadow-sm">
              <div className="max-h-[620px] overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-200 scrollbar-track-transparent">
                {loadingPage ? (
                  <div className="py-24 text-center">
                    <Loader2
                      size={20}
                      className="animate-spin mx-auto text-neutral-400 mb-2"
                    />
                    <p className="text-xs text-neutral-400 italic">
                      Menyelaraskan data etalase...
                    </p>
                  </div>
                ) : (
                  <table className="w-full text-left border-collapse">
                    <thead className="sticky top-0 z-10 bg-white border-b border-neutral-100 shadow-none">
                      <tr>
                        <th className="px-6 py-4.5 text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                          Produk Katalog
                        </th>
                        <th className="px-6 py-4.5 text-[10px] font-bold text-neutral-400 uppercase tracking-widest text-center">
                          Kategori
                        </th>
                        <th className="px-6 py-4.5 text-[10px] font-bold text-neutral-400 uppercase tracking-widest text-center">
                          Kecocokan Stok / Unit
                        </th>
                        <th className="px-6 py-4.5"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100 bg-white text-neutral-900">
                      {catalogItems.map((item) => {
                        const currentCatId = item.id_catalog || item.id;
                        const isItemDeleting = deletingId === currentCatId;

                        // Ekstrak media utama untuk dijadikan cover tabel preview
                        const mainMediaUrl = getMainMedia(item.image_url);
                        const totalMediaCount = getMediaCount(item.image_url);
                        const hasVideo = isVideoUrl(mainMediaUrl);

                        return (
                          <tr
                            key={currentCatId}
                            className={`transition-colors ${isItemDeleting ? "bg-red-50/60 opacity-50" : "hover:bg-neutral-50/80"}`}
                          >
                            <td className="px-6 py-4.5">
                              <div className="flex items-center gap-3">
                                {/* 🔄 DYNAMIC COVER PREVIEW WITH MULTI-MEDIA COUNTER BADGE */}
                                <div className="w-10 h-10 bg-[#F5F5F7] rounded-xl border border-neutral-200 flex items-center justify-center text-neutral-400 overflow-hidden shadow-inner relative">
                                  {mainMediaUrl ? (
                                    hasVideo ? (
                                      <>
                                        <video
                                          src={mainMediaUrl}
                                          className="w-full h-full object-cover"
                                          muted
                                          playsInline
                                        />
                                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                                          <Video
                                            size={10}
                                            className="text-white"
                                          />
                                        </div>
                                      </>
                                    ) : (
                                      <img
                                        src={mainMediaUrl}
                                        alt=""
                                        className="w-full h-full object-cover"
                                      />
                                    )
                                  ) : (
                                    <ImageIcon size={14} />
                                  )}

                                  {/* Counter item jika media > 1 */}
                                  {totalMediaCount > 1 && (
                                    <div className="absolute top-0 right-0 bg-blue-600 text-[7px] text-white font-black px-1 rounded-bl flex items-center gap-0.5 shadow-sm">
                                      <Layers size={6} />
                                      <span>{totalMediaCount}</span>
                                    </div>
                                  )}
                                </div>
                                <div>
                                  <p className="font-bold text-sm text-neutral-900 flex items-center gap-1.5">
                                    {item.title}
                                    {hasVideo && (
                                      <span className="text-[9px] font-semibold text-neutral-400 bg-neutral-100 border border-neutral-200 px-1 rounded">
                                        +Video
                                      </span>
                                    )}
                                  </p>
                                  {item.tag && (
                                    <span className="text-[9px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-bold mt-1 inline-block border border-blue-100">
                                      {item.tag}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4.5 text-center text-xs text-neutral-500 font-semibold">
                              {item.category}
                            </td>
                            <td className="px-6 py-4.5 text-center">
                              <div className="text-xs space-y-1">
                                {item.materials ? (
                                  <p className="text-neutral-800 font-bold">
                                    📦 {item.materials.name} (
                                    {item.materials.stock_meters}m)
                                  </p>
                                ) : (
                                  <p className="text-[10px] text-neutral-400 font-medium italic">
                                    Bahan Umum
                                  </p>
                                )}
                                {item.cars ? (
                                  <p className="text-[10px] text-blue-600 font-bold bg-blue-50 px-1.5 py-0.5 rounded inline-block">
                                    🚗 {item.cars.brand} {item.cars.model}
                                  </p>
                                ) : (
                                  <p className="text-[10px] text-neutral-400 italic">
                                    Semua Jenis Mobil
                                  </p>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4.5">
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditItem(item);
                                    setSelectedMediaPreviews([]);
                                  }}
                                  className="text-neutral-400 hover:text-blue-600 hover:bg-blue-50 p-2 rounded-xl"
                                  title="Edit Item"
                                >
                                  <Pencil size={14} strokeWidth={2.5} />
                                </button>
                                <button
                                  type="button"
                                  disabled={isItemDeleting}
                                  onClick={() =>
                                    handleCancelOrDelete(currentCatId)
                                  }
                                  className="text-neutral-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-xl"
                                  title="Hapus Item"
                                >
                                  {isItemDeleting ? (
                                    <Loader2
                                      size={14}
                                      className="animate-spin text-red-500"
                                    />
                                  ) : (
                                    <Trash2 size={14} strokeWidth={2.5} />
                                  )}
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>

              {!loadingPage && catalogItems.length === 0 && (
                <div className="py-24 text-center">
                  <FolderHeart
                    size={28}
                    className="mx-auto text-neutral-200 mb-3"
                  />
                  <p className="text-neutral-400 text-xs italic">
                    Belum ada item katalog terdaftar.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
