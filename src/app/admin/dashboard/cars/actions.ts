"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function addCar(formData: FormData) {
  const supabase = await createClient();

  const brand = formData.get("brand") as string;
  const model = formData.get("model") as string;
  const metersRaw = formData.get("meters") as string;

  // Konversi angka agar aman untuk kolom integer/numeric di Supabase
  const meters_needed = metersRaw ? parseFloat(metersRaw) : null;

  const { error } = await supabase
    .from("cars")
    .insert([{ brand, model, meters_needed }]);

  if (error) {
    throw new Error("Gagal menambah data mobil: " + error.message);
  }

  revalidatePath("/admin/dashboard/cars");
}

export async function deleteCar(id_cars: string) {
  const supabase = await createClient();

  const { error } = await supabase.from("cars").delete().eq("id_cars", id_cars);

  if (error) {
    throw new Error("Gagal menghapus data mobil: " + error.message);
  }

  revalidatePath("/admin/dashboard/cars");
}

export async function updateCar(id_cars: string, formData: FormData) {
  const supabase = await createClient();

  const brand = formData.get("brand") as string;
  const model = formData.get("model") as string;
  const metersRaw = formData.get("meters") as string;

  const meters_needed = metersRaw ? parseFloat(metersRaw) : null;

  const { error } = await supabase
    .from("cars")
    .update({ brand, model, meters_needed })
    .eq("id_cars", id_cars);

  if (error) {
    throw new Error("Gagal memperbarui data mobil: " + error.message);
  }

  revalidatePath("/admin/dashboard/cars");
}
