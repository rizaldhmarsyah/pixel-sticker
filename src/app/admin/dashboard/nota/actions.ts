"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

// REVISI: Mengubah nama fungsi saveReceipt menjadi saveNota
export async function saveNota(data: any) {
  const supabase = await createClient();

  // REVISI: Validasi teks pesan menyebut kata "Nota"
  if (!data.noKuitansi || data.noKuitansi.includes("Klik")) {
    throw new Error("Nomor Nota harus dibuat dulu (Klik tombol Baru)");
  }

  const payload = {
    receipt_no: data.noKuitansi,
    customer_name: data.nama,
    description: data.keterangan,
    total_amount: data.total,
  };

  const { error } = await supabase
    .from("receipts") // Tetap menembak tabel "receipts" di Supabase agar database tidak error
    .upsert(payload, { onConflict: "receipt_no" });

  if (error) {
    console.error("Supabase Error:", error.message);
    throw new Error(error.message);
  }

  revalidatePath("/admin/dashboard/kuitansi");
}

// REVISI: Mengubah nama fungsi deleteReceipt menjadi deleteNota
export async function deleteNota(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("receipts").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/dashboard/kuitansi");
}
