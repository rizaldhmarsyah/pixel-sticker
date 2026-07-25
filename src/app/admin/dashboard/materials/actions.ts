"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function addMaterial(formData: FormData) {
  const supabase = await createClient();

  const name = formData.get("name") as string;
  const priceRaw = Number(formData.get("price"));
  const stockRaw = Number(formData.get("stock"));

  // Validasi angka agar tidak NaN
  const price_per_meter = isNaN(priceRaw) ? 0 : priceRaw;
  const stock_meters = isNaN(stockRaw) ? 0 : stockRaw;

  const { error } = await supabase.from("materials").insert([
    {
      name,
      price_per_meter,
      stock_meters,
    },
  ]);

  if (error) throw new Error("Gagal menambah material: " + error.message);
  revalidatePath("/admin/dashboard/materials");
}

export async function deleteMaterial(id_materials: string) {
  const supabase = await createClient();

  // REVISI: Samakan nama kolom primary key di Supabase (id_materials)
  const { error } = await supabase
    .from("materials")
    .delete()
    .eq("id_materials", id_materials);

  if (error) throw new Error("Gagal menghapus material: " + error.message);
  revalidatePath("/admin/dashboard/materials");
}

export async function updateMaterial(id_materials: string, formData: FormData) {
  const supabase = await createClient();

  const name = formData.get("name") as string;
  const priceRaw = Number(formData.get("price"));
  const stockRaw = Number(formData.get("stock"));

  const price_per_meter = isNaN(priceRaw) ? 0 : priceRaw;
  const stock_meters = isNaN(stockRaw) ? 0 : stockRaw;

  // REVISI: Samakan nama kolom primary key di Supabase (id_materials)
  const { error } = await supabase
    .from("materials")
    .update({ name, price_per_meter, stock_meters })
    .eq("id_materials", id_materials);

  if (error) throw new Error("Gagal memperbarui material: " + error.message);
  revalidatePath("/admin/dashboard/materials");
}
