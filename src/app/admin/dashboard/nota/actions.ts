"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function saveNota(data: any) {
  const supabase = await createClient();

  if (!data.noKuitansi || data.noKuitansi.includes("Klik")) {
    throw new Error("Nomor Nota harus dibuat dulu (Klik tombol Generate)");
  }

  // 🛠️ PERBAIKAN: Mengubah kunci objek menjadi 'id_materials' agar sesuai skema database Supabase
  const payload = {
    receipt_no: data.noKuitansi,
    customer_name: data.nama,
    id_materials: data.id_materials === "" ? null : data.id_materials,
    description: data.keterangan,
    total_amount: data.total,
  };

  const { error } = await supabase
    .from("receipts")
    .upsert(payload, { onConflict: "receipt_no" });

  if (error) {
    console.error("Supabase Error:", error.message);
    throw new Error(error.message);
  }

  // 🛠️ PERBAIKAN: Mengalihkan revalidatePath ke /nota agar UI Archive ter-refresh otomatis
  revalidatePath("/admin/dashboard/nota");
}

export async function deleteNota(id_receipts: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("receipts")
    .delete()
    .eq("id_receipts", id_receipts);

  if (error) throw new Error(error.message);

  // 🛠️ PERBAIKAN: Mengalihkan revalidatePath ke /nota agar UI Archive ter-refresh otomatis
  revalidatePath("/admin/dashboard/nota");
}
