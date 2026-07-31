"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function addCar(formData: FormData) {
  const supabase = await createClient();

  const brand = (formData.get("brand") as string) || "";
  const model = (formData.get("model") as string) || "";
  const metersRaw = formData.get("meters") as string;

  // Sanitasi float agar cocok dengan tipe 'float8' di Supabase
  const meters_needed = metersRaw ? parseFloat(metersRaw) : 0;

  const { error } = await supabase.from("cars").insert([
    {
      brand,
      model,
      meters_needed,
    },
  ]);

  if (error) {
    console.error("Error addCar:", error.message);
    throw new Error("Gagal menambah data mobil: " + error.message);
  }

  revalidatePath("/admin/dashboard/cars");
}

export async function deleteCar(id_cars: string) {
  const supabase = await createClient();

  // id_cars adalah String UUID
  const { error } = await supabase.from("cars").delete().eq("id_cars", id_cars);

  if (error) {
    console.error("Error deleteCar:", error.message);
    throw new Error("Gagal menghapus data mobil: " + error.message);
  }

  revalidatePath("/admin/dashboard/cars");
}

export async function updateCar(id_cars: string, formData: FormData) {
  const supabase = await createClient();

  const brand = (formData.get("brand") as string) || "";
  const model = (formData.get("model") as string) || "";
  const metersRaw = formData.get("meters") as string;

  const meters_needed = metersRaw ? parseFloat(metersRaw) : 0;

  // 🔴 HANYA UPDATE KOLOM YANG BENAR-BENAR ADA DI TABEL CARS! (brand, model, meters_needed)
  const { error } = await supabase
    .from("cars")
    .update({
      brand,
      model,
      meters_needed,
    })
    .eq("id_cars", id_cars);

  if (error) {
    console.error("Error updateCar:", error.message);
    throw new Error("Gagal meng-update data mobil: " + error.message);
  }

  revalidatePath("/admin/dashboard/cars");
}
