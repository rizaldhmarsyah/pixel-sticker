"use client";

import { useState, useEffect } from "react";
import {
  Trash2,
  Edit2,
  Check,
  X,
  Package,
  CheckCircle2,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { deleteMaterial, updateMaterial } from "./actions";

interface Material {
  id: string;
  name: string;
  price_per_meter: number;
  stock_meters: number;
}

interface MaterialRowProps {
  item: Material;
  onRefresh?: () => void; // Prop agar tabel utama bisa otomatis ter-refresh
}

export default function MaterialRow({ item, onRefresh }: MaterialRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Otomatis menghilangkan pop-up modal dalam 4 detik jika didiamkan
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // --- HANDLER UPDATE / EDIT DATA ---
  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setNotification(null);

    const formData = new FormData(e.currentTarget);

    try {
      // Menjalankan Server Action updateMaterial bawaan kamu
      await updateMaterial(item.id, formData);
      setNotification({
        type: "success",
        message: `Data material "${item.name}" berhasil diperbarui!`,
      });
      setIsEditing(false);
      if (onRefresh) onRefresh(); // Refresh data otomatis di layar belakang
    } catch (err: any) {
      setNotification({
        type: "error",
        message: err.message || "Gagal memperbarui data material.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- HANDLER HAPUS DATA ---
  const handleDelete = async () => {
    if (!confirm(`Apakah kamu yakin ingin menghapus material ${item.name}?`))
      return;

    setIsDeleting(true);
    setNotification(null);

    try {
      // Menjalankan Server Action deleteMaterial bawaan kamu
      await deleteMaterial(item.id);
      setNotification({
        type: "success",
        message: "Material berhasil dihapus dari database!",
      });
      if (onRefresh) onRefresh(); // Refresh data otomatis di layar belakang
    } catch (err: any) {
      setNotification({
        type: "error",
        message: err.message || "Gagal menghapus data material.",
      });
      setIsDeleting(false);
    }
  };

  // --- KOMPONEN POP-UP MODAL (TEMA APPLE GLASS LIGHT) ---
  const ModalNotification = () => {
    if (!notification) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/10 backdrop-blur-md animate-in fade-in duration-200">
        <div className="bg-white/80 backdrop-blur-xl border border-neutral-200 p-8 rounded-[2rem] max-w-sm w-full text-center shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200">
          <div
            className={`absolute top-0 inset-x-0 h-1.5 ${notification.type === "success" ? "bg-blue-500" : "bg-red-500"}`}
          />

          <div className="mx-auto w-12 h-12 rounded-2xl flex items-center justify-center mb-4 bg-neutral-50 border border-neutral-200/60">
            {notification.type === "success" ? (
              <CheckCircle2 size={24} className="text-blue-500" />
            ) : (
              <AlertTriangle size={24} className="text-red-500" />
            )}
          </div>

          <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900 mb-1.5">
            {notification.type === "success" ? "Sukses" : "Gagal Tindakan"}
          </h3>
          <p className="text-neutral-500 text-xs font-normal leading-relaxed mb-6 px-2 text-center">
            {notification.message}
          </p>

          <button
            type="button"
            onClick={() => setNotification(null)}
            className={`w-full font-bold py-3 rounded-xl text-xs uppercase tracking-widest transition-all active:scale-98 text-white ${
              notification.type === "success"
                ? "bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/10"
                : "bg-red-600 hover:bg-red-700 shadow-md shadow-red-600/10"
            }`}
          >
            Oke, Mantap
          </button>
        </div>
      </div>
    );
  };

  // --- MODE EDIT INLINE (APPLE PREMIUM LIGHT ROW) ---
  if (isEditing) {
    return (
      <tr className="bg-blue-500/5 transition-colors">
        <td colSpan={4} className="px-8 py-4">
          <ModalNotification />

          <form onSubmit={handleUpdate} className="flex items-center gap-4">
            <div className="flex-1 grid grid-cols-3 gap-4">
              <input
                name="name"
                defaultValue={item.name}
                className="bg-white border border-neutral-300 rounded-xl px-4 py-2 text-xs text-neutral-900 font-medium outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                required
              />
              <input
                name="price"
                type="number"
                defaultValue={item.price_per_meter}
                className="bg-white border border-neutral-300 rounded-xl px-4 py-2 text-xs text-neutral-900 font-semibold outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 font-mono transition-all"
                required
              />
              <input
                name="stock"
                type="number"
                defaultValue={item.stock_meters}
                className="bg-white border border-neutral-300 rounded-xl px-4 py-2 text-xs text-neutral-900 font-semibold outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 font-mono transition-all"
                required
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-all disabled:opacity-40"
              >
                {isSubmitting ? (
                  <Loader2 size={20} className="animate-spin text-blue-500" />
                ) : (
                  <Check size={20} />
                )}
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => setIsEditing(false)}
                className="p-2 text-neutral-400 hover:bg-neutral-100 rounded-lg transition-all"
              >
                <X size={20} />
              </button>
            </div>
          </form>
        </td>
      </tr>
    );
  }

  // --- MODE DISPLAY VIEW NORMAL (APPLE PREMIUM LIGHT ROW) ---
  return (
    <tr className="hover:bg-neutral-50/80 transition-colors border-b border-neutral-100 last:border-none">
      {/* Teks Nama Material menjadi gelap kontras tinggi */}
      <td className="px-8 py-5.5 font-bold text-neutral-900 text-sm">
        <ModalNotification />
        {item.name}
      </td>
      {/* Teks Harga menjadi biru tegas kontras light mode */}
      <td className="px-8 py-5.5 text-xs font-bold font-mono text-blue-600 text-center">
        Rp {item.price_per_meter.toLocaleString("id-ID")}
      </td>
      {/* Komponen Stok */}
      <td className="px-8 py-5.5">
        <div className="flex items-center justify-center gap-1.5 text-neutral-600">
          <Package size={13} className="text-neutral-400" />
          <span className="text-xs font-semibold">{item.stock_meters} m</span>
        </div>
      </td>
      {/* Tombol Tindakan Aksi */}
      <td className="px-8 py-5.5 text-right">
        {/* FIX REVISI: Membuang "opacity-0 group-hover:opacity-100" agar ikon terlihat statis setiap saat */}
        <div className="flex justify-end gap-0.5">
          <button
            disabled={isDeleting}
            onClick={() => setIsEditing(true)}
            className="p-2 text-neutral-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
            title="Edit Bahan"
          >
            <Edit2 size={15} strokeWidth={2} />
          </button>

          <button
            disabled={isDeleting}
            onClick={handleDelete}
            className="p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all flex items-center justify-center"
            title="Hapus Bahan"
          >
            {isDeleting ? (
              <Loader2 size={15} className="animate-spin text-red-500" />
            ) : (
              <Trash2 size={15} strokeWidth={2} />
            )}
          </button>
        </div>
      </td>
    </tr>
  );
}
