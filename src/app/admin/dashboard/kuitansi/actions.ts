"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function saveReceipt(data: any) {
  const supabase = await createClient();

  // Validasi sederhana agar tidak simpan data kosong
  if (!data.noKuitansi || data.noKuitansi.includes("Klik")) {
    throw new Error("Nomor Kuitansi harus dibuat dulu (Klik tombol Baru)");
  }

  const payload = {
    receipt_no: data.noKuitansi,
    customer_name: data.nama,
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

  revalidatePath("/admin/dashboard/kuitansi");
}

export async function deleteReceipt(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("receipts").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/dashboard/kuitansi");
}
