"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function addCatalogItem(formData: FormData) {
  const supabase = await createClient();

  // 1. Ambil data dari form input
  const material_id = formData.get("material_id") as string;
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

      // Proses upload ke storage bucket 'catalog'
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("catalog")
        .upload(fileName, buffer, {
          contentType: imageFile.type,
          upsert: true,
        });

      if (uploadError) {
        console.error("Gagal upload ke Storage:", uploadError.message);
        throw new Error("Gagal upload ke Storage: " + uploadError.message);
      }

      // Ambil URL Publik gambar
      const { data: urlData } = supabase.storage
        .from("catalog")
        .getPublicUrl(fileName);

      image_url = urlData.publicUrl;
    } catch (err: any) {
      console.error("Proses file error:", err.message);
      throw new Error("Gagal memproses gambar: " + err.message);
    }
  }

  // 3. Masukkan data bersih ke tabel database 'catalog'
  const { error } = await supabase.from("catalog").insert([
    {
      material_id: material_id === "none" ? null : material_id,
      title,
      description,
      category,
      tag,
      image_url,
      is_published: true,
    },
  ]);

  if (error) {
    console.error("Error CMS Katalog:", error.message);
    throw new Error("Gagal simpan ke database: " + error.message);
  }

  // 4. Paksa Next.js refresh data di admin dan front-end publik
  revalidatePath("/admin/dashboard/catalog");
  revalidatePath("/catalog");
}

export async function deleteCatalogItem(formData: FormData) {
  const supabase = await createClient();
  const id = formData.get("id") as string;

  await supabase.from("catalog").delete().eq("id", id);

  revalidatePath("/admin/dashboard/catalog");
  revalidatePath("/catalog");
}

//update catalog
export async function updateCatalogItem(formData: FormData) {
  const supabase = await createClient();

  const id = formData.get("id") as string;
  const material_id = formData.get("material_id") as string;
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const category = formData.get("category") as string;
  const tag = (formData.get("tag") as string) || null;

  const imageFile = formData.get("image") as File;
  let image_url = null;

  // Jika admin mengupload foto baru saat edit, proses uploadnya
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

  // Susun data yang mau diupdate
  const updateData: any = {
    material_id: material_id === "none" ? null : material_id,
    title,
    description,
    category,
    tag,
  };

  // Hanya update URL gambar kalau ada file baru yang diupload
  if (image_url) {
    updateData.image_url = image_url;
  }

  const { error } = await supabase
    .from("catalog")
    .update(updateData)
    .eq("id", id);

  if (error) {
    console.error("Gagal update katalog:", error.message);
    throw new Error(error.message);
  }

  revalidatePath("/admin/dashboard/catalog");
  revalidatePath("/catalog");
}
