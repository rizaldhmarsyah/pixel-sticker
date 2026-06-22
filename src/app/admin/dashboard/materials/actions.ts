// src/app/admin/dashboard/materials/actions.ts
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

export async function deleteMaterial(id: string) {
  // Ubah jadi string karena UUID
  const supabase = await createClient();

  const { error } = await supabase.from("materials").delete().eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/admin/dashboard/materials");
}

export async function updateMaterial(id: string, formData: FormData) {
  const supabase = await createClient();
  const name = formData.get("name") as string;
  const price_per_meter = Number(formData.get("price"));
  const stock_meters = Number(formData.get("stock"));

  const { error } = await supabase
    .from("materials")
    .update({ name, price_per_meter, stock_meters })
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/admin/dashboard/materials");
}
