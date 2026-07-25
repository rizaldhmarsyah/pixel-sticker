"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function addCatalogItem(formData: FormData) {
  const supabase = await createClient();

  // 1. Ambil data dari form input termasuk id_cars baru
  const id_material = formData.get("id_material") as string;
  const id_cars = formData.get("id_cars") as string; // SUNTIKAN BARU
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const category = formData.get("category") as string;
  const tag = (formData.get("tag") as string) || null;

  const imageFile = formData.get("image") as File;
  let image_url = null;

  // 2. Proses upload gambar jika ada file yang dipilih
  if (imageFile && imageFile.size > 0) {
    const fileExt = imageFile.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    try {
      const arrayBuffer = await imageFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("catalog")
        .upload(fileName, buffer, {
          contentType: imageFile.type,
          upsert: true,
        });

      if (uploadError)
        throw new Error("Gagal upload ke Storage: " + uploadError.message);

      const { data: urlData } = supabase.storage
        .from("catalog")
        .getPublicUrl(fileName);
      image_url = urlData.publicUrl;
    } catch (err: any) {
      throw new Error("Gagal memproses gambar: " + err.message);
    }
  }

  // 3. Masukkan data bersih ke tabel database 'catalog' sesuai kolom baru
  const { error } = await supabase.from("catalog").insert([
    {
      id_material: id_material === "none" ? null : id_material,
      id_cars: id_cars === "none" ? null : id_cars, // SUNTIKAN BARU
      title,
      description,
      category,
      tag,
      image_url,
      is_published: true,
    },
  ]);

  if (error) throw new Error("Gagal simpan ke database: " + error.message);

  revalidatePath("/admin/dashboard/catalog");
  revalidatePath("/catalog");
}

export async function deleteCatalogItem(formData: FormData) {
  const supabase = await createClient();
  const id_catalog = formData.get("id_catalog") as string; // REVISI FIELD

  // REVISI TARGET: id diubah menjadi id_catalog
  await supabase.from("catalog").delete().eq("id_catalog", id_catalog);

  revalidatePath("/admin/dashboard/catalog");
  revalidatePath("/catalog");
}

export async function updateCatalogItem(formData: FormData) {
  const supabase = await createClient();

  const id_catalog = formData.get("id_catalog") as string; // REVISI FIELD
  const id_material = formData.get("id_material") as string;
  const id_cars = formData.get("id_cars") as string; // SUNTIKAN BARU
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const category = formData.get("category") as string;
  const tag = (formData.get("tag") as string) || null;

  const imageFile = formData.get("image") as File;
  let image_url = null;

  if (imageFile && imageFile.size > 0) {
    const fileExt = imageFile.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    try {
      const arrayBuffer = await imageFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const { error: uploadError } = await supabase.storage
        .from("catalog")
        .upload(fileName, buffer, {
          contentType: imageFile.type,
          upsert: true,
        });

      if (!uploadError) {
        const { data: urlData } = supabase.storage
          .from("catalog")
          .getPublicUrl(fileName);
        image_url = urlData.publicUrl;
      }
    } catch (err: any) {
      console.error("Gagal ganti gambar:", err.message);
    }
  }

  const updateData: any = {
    id_material: id_material === "none" ? null : id_material,
    id_cars: id_cars === "none" ? null : id_cars, // SUNTIKAN BARU
    title,
    description,
    category,
    tag,
  };

  if (image_url) {
    updateData.image_url = image_url;
  }

  // REVISI TARGET: eq() diarahkan ke id_catalog
  const { error } = await supabase
    .from("catalog")
    .update(updateData)
    .eq("id_catalog", id_catalog);

  if (error) throw new Error(error.message);

  revalidatePath("/admin/dashboard/catalog");
  revalidatePath("/catalog");
}
