"use client";

import { useState, useEffect } from "react";
import {
  Trash2,
  Edit2,
  Check,
  X,
  Gauge,
  CheckCircle2,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { deleteCar, updateCar } from "./actions";

interface Car {
  id: string;
  brand: string;
  model: string;
  meters_needed: number;
}

interface CarRowProps {
  car: Car;
  onRefresh?: () => void;
}

export default function CarRow({ car, onRefresh }: CarRowProps) {
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
      await updateCar(car.id, formData);
      setNotification({
        type: "success",
        message: `Data ${car.brand} ${car.model} berhasil diperbarui!`,
      });
      setIsEditing(false);
      if (onRefresh) onRefresh();
    } catch (err: any) {
      setNotification({
        type: "error",
        message: err.message || "Gagal memperbarui data mobil.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- HANDLER HAPUS DATA ---
  const handleDelete = async () => {
    if (
      !confirm(`Apakah kamu yakin ingin menghapus ${car.brand} ${car.model}?`)
    )
      return;

    setIsDeleting(true);
    setNotification(null);

    try {
      await deleteCar(car.id);
      setNotification({
        type: "success",
        message: "Data mobil berhasil dihapus dari database!",
      });
      if (onRefresh) onRefresh();
    } catch (err: any) {
      setNotification({
        type: "error",
        message: err.message || "Gagal menghapus data mobil.",
      });
      setIsDeleting(false);
    }
  };

  // --- KOMPONEN POP-UP MODAL (TEMA APPLE GLASS LIGHT) ---
  const ModalNotification = () => {
    if (!notification) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/10 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="bg-white/80 backdrop-blur-xl border border-neutral-200 p-8 rounded-[2rem] max-w-sm w-full text-center shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200">
          <div
            className={`absolute top-0 inset-x-0 h-1.5 ${notification.type === "success" ? "bg-purple-500" : "bg-rose-500"}`}
          />

          <div className="mx-auto w-12 h-12 rounded-2xl flex items-center justify-center mb-4 bg-neutral-50 border border-neutral-200/60">
            {notification.type === "success" ? (
              <CheckCircle2 size={24} className="text-purple-600" />
            ) : (
              <AlertTriangle size={24} className="text-rose-600" />
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
                ? "bg-purple-600 hover:bg-purple-700 shadow-md shadow-purple-600/10"
                : "bg-rose-600 hover:bg-rose-700 shadow-md shadow-rose-600/10"
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
      <tr className="bg-purple-500/5 transition-colors">
        <td colSpan={3} className="px-8 py-4">
          <ModalNotification />

          <form onSubmit={handleUpdate} className="flex items-center gap-4">
            <div className="flex-1 grid grid-cols-3 gap-4">
              <input
                name="brand"
                defaultValue={car.brand}
                className="bg-white border border-neutral-300 rounded-xl px-4 py-2 text-xs text-neutral-900 font-medium outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all"
                required
              />
              <input
                name="model"
                defaultValue={car.model}
                className="bg-white border border-neutral-300 rounded-xl px-4 py-2 text-xs text-neutral-900 font-medium outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all"
                required
              />
              <input
                name="meters"
                type="number"
                step="0.1"
                defaultValue={car.meters_needed}
                className="bg-white border border-neutral-300 rounded-xl px-4 py-2 text-xs text-neutral-900 font-semibold outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 font-mono transition-all"
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
                  <Loader2 size={20} className="animate-spin text-purple-500" />
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
      <td className="px-8 py-5.5">
        <ModalNotification />

        <div className="flex flex-col">
          <span className="font-extrabold text-neutral-900 uppercase text-[10px] tracking-widest mb-0.5">
            {car.brand}
          </span>
          <span className="text-base text-neutral-500 font-normal leading-tight">
            {car.model}
          </span>
        </div>
      </td>
      <td className="px-8 py-5.5 text-center">
        <div className="inline-flex items-center gap-1.5 bg-purple-50 border border-purple-100 px-3.5 py-1.5 rounded-full shadow-sm">
          <Gauge size={13} className="text-purple-600" />
          <span className="text-xs font-mono font-bold text-purple-700">
            {car.meters_needed} M
          </span>
        </div>
      </td>
      <td className="px-8 py-5.5 text-right">
        {/* FIX REVISI: Mencabut "opacity-0 group-hover:opacity-100" agar kedua tombol aksi kelihatan secara permanen */}
        <div className="flex justify-end gap-0.5">
          <button
            disabled={isDeleting}
            onClick={() => setIsEditing(true)}
            className="p-2 text-neutral-400 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all"
            title="Edit Mobil"
          >
            <Edit2 size={15} strokeWidth={2} />
          </button>

          <button
            disabled={isDeleting}
            onClick={handleDelete}
            className="p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all flex items-center justify-center"
            title="Hapus Mobil"
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
