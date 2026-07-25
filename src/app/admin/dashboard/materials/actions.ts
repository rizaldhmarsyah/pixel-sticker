"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function addMaterial(formData: FormData) {
  const supabase = await createClient();

  const name = formData.get("name") as string;
  const price_per_meter = Number(formData.get("price"));
  const stock_meters = Number(formData.get("stock"));

  const { error } = await supabase.from("materials").insert([
    {
      name,
      price_per_meter,
      stock_meters,
    },
  ]);

  if (error) throw new Error(error.message);
  revalidatePath("/admin/dashboard/materials");
}

// REVISI: Parameter diganti menjadi id_material
export async function deleteMaterial(id_material: string) {
  const supabase = await createClient();

  // REVISI: Target pencarian eq diubah dari id menjadi id_material
  const { error } = await supabase
    .from("materials")
    .delete()
    .eq("id_materials", id_materials);

  if (error) throw new Error(error.message);
  revalidatePath("/admin/dashboard/materials");
}

// REVISI: Parameter diganti menjadi id_material
export async function updateMaterial(id_materials: string, formData: FormData) {
  const supabase = await createClient();
  const name = formData.get("name") as string;
  const price_per_meter = Number(formData.get("price"));
  const stock_meters = Number(formData.get("stock"));

  const { error } = await supabase
    .from("materials")
    .update({ name, price_per_meter, stock_meters })
    // REVISI: Target pencarian eq diubah dari id menjadi id_material
    .eq("id_materials", id_materials);

  if (error) throw new Error(error.message);
  revalidatePath("/admin/dashboard/materials");
}
