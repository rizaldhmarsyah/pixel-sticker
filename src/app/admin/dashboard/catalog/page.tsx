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

  // --- STATE MANAGEMENT ---
  const [catalogItems, setCatalogItems] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);
  const [loadingPage, setLoadingPage] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editItem, setEditItem] = useState<any | null>(null);
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // --- AMBIL DATA DARI SUPABASE ---
  const refreshData = async () => {
    try {
      const { data: matData } = await supabase
        .from("materials")
        .select("id, name")
        .order("name", { ascending: true });
      if (matData) setMaterials(matData);

      const { data: catData, error: catError } = await supabase
        .from("catalog")
        .select(
          `
          *,
          materials (
            name,
            stock
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

  // Otomatis hilangkan pop-up modal setelah 4 detik jika diabaikan
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // --- PROSES SIMPAN / EDIT DATA ---
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
          message: "Perubahan katalog berhasil disimpan!",
        });
        setEditItem(null);
      } else {
        await addCatalogItem(formData);
        setNotification({
          type: "success",
          message: "Item baru berhasil ditampilkan di katalog!",
        });
        formRef.current?.reset();
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

  // --- PROSES HAPUS DATA ---
  const handleCancelOrDelete = async (id: string) => {
    if (!confirm("Apakah kamu yakin ingin menghapus item katalog ini?")) return;

    setDeletingId(id);
    setNotification(null);

    const formData = new FormData();
    formData.append("id", id);

    try {
      await deleteCatalogItem(formData);
      setNotification({
        type: "success",
        message: "Item katalog berhasil dihapus dari etalase!",
      });
      if (editItem?.id === id) setEditItem(null);
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
                Kelola etalase produk dan portofolio stiker yang tampil di
                website utama.
              </p>
            </div>
          </div>
        </div>

        {/* --- POP-UP MODAL OVERLAY (TEMA APPLE GLASS LIGHT) --- */}
        {notification && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/10 backdrop-blur-md animate-in fade-in duration-200">
            <div className="bg-white/80 backdrop-blur-xl border border-neutral-200 p-8 rounded-[2rem] max-w-sm w-full text-center shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200">
              {/* Garis Aksen Atas */}
              <div
                className={`absolute top-0 inset-x-0 h-1.5 ${notification.type === "success" ? "bg-emerald-500" : "bg-rose-500"}`}
              />

              {/* Icon Status */}
              <div className="mx-auto w-12 h-12 rounded-2xl flex items-center justify-center mb-4 bg-neutral-50 border border-neutral-200/60">
                {notification.type === "success" ? (
                  <CheckCircle2 size={24} className="text-emerald-500" />
                ) : (
                  <AlertTriangle size={24} className="text-rose-500" />
                )}
              </div>

              {/* Teks Konten Pop-up */}
              <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900 mb-1.5">
                {notification.type === "success"
                  ? "Tindakan Berhasil"
                  : "Gagal Sistem"}
              </h3>
              <p className="text-neutral-500 text-xs font-normal leading-relaxed mb-6 px-2 text-center">
                {notification.message}
              </p>

              {/* Tombol Close Pop-up */}
              <button
                type="button"
                onClick={() => setNotification(null)}
                className={`w-full font-bold py-3 rounded-xl text-xs uppercase tracking-widest transition-all active:scale-98 text-white ${
                  notification.type === "success"
                    ? "bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/10"
                    : "bg-rose-600 hover:bg-rose-700 shadow-md shadow-rose-600/10"
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
                    onClick={() => setEditItem(null)}
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
                key={editItem?.id || "tambah"}
                className="space-y-4"
              >
                {editItem && (
                  <input type="hidden" name="id" value={editItem.id} />
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
                    className="w-full bg-[#F5F5F7] border border-neutral-200/80 rounded-xl px-4 py-3 text-xs font-medium text-neutral-900 outline-none transition-all focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 placeholder:text-neutral-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest ml-0.5">
                    Hubungkan ke Stok Gudang
                  </label>
                  <select
                    name="material_id"
                    defaultValue={editItem?.material_id || "none"}
                    className="w-full bg-[#F5F5F7] border border-neutral-200/80 rounded-xl px-4 py-3 text-xs font-medium text-neutral-900 outline-none transition-all focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 cursor-pointer"
                  >
                    <option value="none" className="bg-white text-neutral-900">
                      -- Jangan Hubungkan (Hanya Portofolio) --
                    </option>
                    {materials.map((m) => (
                      <option
                        key={m.id}
                        value={m.id}
                        className="bg-white text-neutral-900"
                      >
                        {m.name}
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
                    className="w-full bg-[#F5F5F7] border border-neutral-200/80 rounded-xl px-4 py-3 text-xs font-medium text-neutral-900 outline-none transition-all focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 cursor-pointer"
                  >
                    <option value="Satin" className="bg-white text-neutral-900">
                      Satin
                    </option>
                    <option
                      value="Glossy"
                      className="bg-white text-neutral-900"
                    >
                      Glossy
                    </option>
                    <option
                      value="Chrome"
                      className="bg-white text-neutral-900"
                    >
                      Chrome
                    </option>
                    <option value="PPF" className="bg-white text-neutral-900">
                      PPF
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
                    className="w-full bg-[#F5F5F7] border border-neutral-200/80 rounded-xl px-4 py-3 text-xs font-medium text-neutral-900 outline-none transition-all focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 placeholder:text-neutral-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest ml-0.5">
                    Upload Foto {editItem && "(Kosongkan jika tidak diganti)"}
                  </label>
                  <input
                    type="file"
                    name="image"
                    accept="image/*"
                    className="w-full bg-[#F5F5F7] border border-neutral-200/80 rounded-xl px-4 py-2.5 text-xs text-neutral-500 file:mr-3 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[11px] file:font-bold file:bg-blue-600 file:text-white hover:file:bg-blue-700 outline-none transition-all cursor-pointer"
                  />
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
                    className="w-full bg-[#F5F5F7] border border-neutral-200/80 rounded-xl px-4 py-3 text-xs font-medium text-neutral-900 outline-none transition-all focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 resize-none placeholder:text-neutral-400"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full font-bold py-3.5 rounded-xl mt-4 transition-all active:scale-95 shadow-sm text-xs uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-50 ${editItem ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-neutral-900 text-white hover:bg-black"}`}
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
                          Hubungan Stok
                        </th>
                        <th className="px-6 py-4.5"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100 bg-white text-neutral-900">
                      {catalogItems.map((item) => {
                        const isItemDeleting = deletingId === item.id;
                        return (
                          <tr
                            key={item.id}
                            className={`transition-colors ${isItemDeleting ? "bg-red-50/60 opacity-50" : "hover:bg-neutral-50/80"}`}
                          >
                            <td className="px-6 py-4.5">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-[#F5F5F7] rounded-xl border border-neutral-200 flex items-center justify-center text-neutral-400 overflow-hidden shadow-inner">
                                  {item.image_url ? (
                                    <img
                                      src={item.image_url}
                                      alt=""
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <ImageIcon size={14} />
                                  )}
                                </div>
                                <div>
                                  <p className="font-bold text-sm text-neutral-900">
                                    {item.title}
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
                              {item.materials ? (
                                <div className="text-xs">
                                  <p className="text-neutral-800 font-bold">
                                    {item.materials.name}
                                  </p>
                                  <p className="text-[10px] text-neutral-400 font-medium mt-0.5">
                                    Sisa: {item.materials.stock}m
                                  </p>
                                </div>
                              ) : (
                                <span className="text-[10px] text-neutral-400 font-medium italic">
                                  Portofolio Saja
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4.5">
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  type="button"
                                  onClick={() => setEditItem(item)}
                                  className="text-neutral-400 hover:text-blue-600 hover:bg-blue-50 p-2 rounded-xl transition-all"
                                  title="Edit Item"
                                >
                                  <Pencil size={14} strokeWidth={2.5} />
                                </button>
                                <button
                                  type="button"
                                  disabled={isItemDeleting}
                                  onClick={() => handleCancelOrDelete(item.id)}
                                  className="text-neutral-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-xl transition-all"
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
