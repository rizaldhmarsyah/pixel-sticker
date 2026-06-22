// src/app/admin/dashboard/cars/actions.ts
"use server";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function addCar(formData: FormData) {
  const supabase = await createClient();
  const brand = formData.get("brand");
  const model = formData.get("model");
  const meters_needed = formData.get("meters");

  await supabase.from("cars").insert([{ brand, model, meters_needed }]);
  revalidatePath("/admin/dashboard/cars");
}

export async function deleteCar(id: string) {
  const supabase = await createClient();
  await supabase.from("cars").delete().eq("id", id);
  revalidatePath("/admin/dashboard/cars");
}

export async function updateCar(id: string, formData: FormData) {
  const supabase = await createClient();
  const brand = formData.get("brand");
  const model = formData.get("model");
  const meters_needed = formData.get("meters");

  await supabase
    .from("cars")
    .update({ brand, model, meters_needed })
    .eq("id", id);
  revalidatePath("/admin/dashboard/cars");
}
