"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function saveNota(data: any) {
  const supabase = await createClient();

  if (!data.noKuitansi || data.noKuitansi.includes("Klik")) {
    throw new Error("Nomor Nota harus dibuat dulu (Klik tombol Generate)");
  }

  // 1. Sanitasi Angka Total agar tidak error saat dikirim ke PostgreSQL
  let cleanTotal = 0;
  if (typeof data.total === "number") {
    cleanTotal = data.total;
  } else if (typeof data.total === "string") {
    // Menghapus karakter non-angka (seperti "Rp", titik, koma, spasi)
    const numericString = data.total.replace(/[^0-9]/g, "");
    cleanTotal = numericString ? parseFloat(numericString) : 0;
  }

  // 2. Format Payload yang Sesuai Skema Supabase
  const payload = {
    receipt_no: data.noKuitansi,
    customer_name: data.nama,
    id_materials:
      !data.id_materials ||
      data.id_materials === "" ||
      data.id_materials === "none"
        ? null
        : data.id_materials,
    description: data.keterangan || "",
    total_amount: cleanTotal,
  };

  const { error } = await supabase
    .from("receipts")
    .upsert(payload, { onConflict: "receipt_no" });

  if (error) {
    console.error("Supabase Error (saveNota):", error.message);
    throw new Error("Gagal menyimpan nota: " + error.message);
  }

  revalidatePath("/admin/dashboard/nota");
}

export async function deleteNota(id_receipts: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("receipts")
    .delete()
    .eq("id_receipts", id_receipts);

  if (error) {
    console.error("Supabase Error (deleteNota):", error.message);
    throw new Error("Gagal menghapus nota: " + error.message);
  }

  revalidatePath("/admin/dashboard/nota");
}
