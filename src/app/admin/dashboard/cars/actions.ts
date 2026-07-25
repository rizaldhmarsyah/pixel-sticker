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

export async function deleteCar(id_cars: string) {
  const supabase = await createClient();
  // REVISI: Target diubah dari id menjadi id_cars
  await supabase.from("cars").delete().eq("id_cars", id_cars);
  revalidatePath("/admin/dashboard/cars");
}

export async function updateCar(id_cars: string, formData: FormData) {
  const supabase = await createClient();
  const brand = formData.get("brand");
  const model = formData.get("model");
  const meters_needed = formData.get("meters");

  await supabase
    .from("cars")
    .update({ brand, model, meters_needed })
    // REVISI: Target diubah dari id menjadi id_cars
    .eq("id_cars", id_cars);
  revalidatePath("/admin/dashboard/cars");
}
