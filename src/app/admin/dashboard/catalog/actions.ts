"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function addCatalogItem(formData: FormData) {
  const supabase = await createClient();

  // 1. Ambil data teks dari form input
  const id_material = formData.get("id_material") as string;
  const id_cars = formData.get("id_cars") as string;
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const category = formData.get("category") as string;
  const tag = (formData.get("tag") as string) || null;

  // 2. 🔄 AMBIL BANYAK BERKAS MEDIA (Gambar & Video)
  const imageFiles = formData.getAll("image") as File[];
  const uploadedUrls: string[] = [];

  // Filter berkas yang valid (ukuran > 0)
  const validFiles = imageFiles.filter((file) => file && file.size > 0);

  if (validFiles.length > 0) {
    for (const file of validFiles) {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      try {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const { error: uploadError } = await supabase.storage
          .from("catalog")
          .upload(fileName, buffer, {
            contentType: file.type,
            upsert: true,
          });

        if (uploadError) {
          console.error("Gagal upload file:", uploadError.message);
          continue;
        }

        const { data: urlData } = supabase.storage
          .from("catalog")
          .getPublicUrl(fileName);

        if (urlData?.publicUrl) {
          uploadedUrls.push(urlData.publicUrl);
        }
      } catch (err: any) {
        console.error("Gagal memproses file media:", err.message);
      }
    }
  }

  // Simpan array URL sebagai stringified JSON agar kompatibel dengan kolom text/json
  const finalMediaUrl =
    uploadedUrls.length > 0 ? JSON.stringify(uploadedUrls) : null;

  // 3. Simpan data baru ke Supabase database
  const { error } = await supabase.from("catalog").insert([
    {
      id_materials: id_material === "none" || !id_material ? null : id_material,
      id_cars: id_cars === "none" || !id_cars ? null : id_cars,
      title,
      description,
      category,
      tag,
      image_url: finalMediaUrl,
      is_published: true,
    },
  ]);

  if (error) throw new Error("Gagal simpan ke database: " + error.message);

  revalidatePath("/admin/dashboard/catalog");
  revalidatePath("/catalog");
}

export async function deleteCatalogItem(formData: FormData) {
  const supabase = await createClient();
  const id_catalog = formData.get("id_catalog") as string;

  const { error } = await supabase
    .from("catalog")
    .delete()
    .eq("id_catalog", id_catalog);

  if (error) throw new Error("Gagal menghapus item: " + error.message);

  revalidatePath("/admin/dashboard/catalog");
  revalidatePath("/catalog");
}

export async function updateCatalogItem(formData: FormData) {
  const supabase = await createClient();

  const id_catalog = formData.get("id_catalog") as string;
  const id_material = formData.get("id_material") as string;
  const id_cars = formData.get("id_cars") as string;
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const category = formData.get("category") as string;
  const tag = (formData.get("tag") as string) || null;

  // 🔄 AMBIL BANYAK BERKAS MEDIA UNTUK UPDATE
  const imageFiles = formData.getAll("image") as File[];
  const uploadedUrls: string[] = [];

  const validFiles = imageFiles.filter((file) => file && file.size > 0);

  if (validFiles.length > 0) {
    for (const file of validFiles) {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      try {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const { error: uploadError } = await supabase.storage
          .from("catalog")
          .upload(fileName, buffer, {
            contentType: file.type,
            upsert: true,
          });

        if (!uploadError) {
          const { data: urlData } = supabase.storage
            .from("catalog")
            .getPublicUrl(fileName);

          if (urlData?.publicUrl) {
            uploadedUrls.push(urlData.publicUrl);
          }
        }
      } catch (err: any) {
        console.error("Gagal ganti media:", err.message);
      }
    }
  }

  const updateData: any = {
    id_materials: id_material === "none" || !id_material ? null : id_material,
    id_cars: id_cars === "none" || !id_cars ? null : id_cars,
    title,
    description,
    category,
    tag,
  };

  // Jika ada file media baru yang diunggah, perbarui kolom image_url
  if (uploadedUrls.length > 0) {
    updateData.image_url = JSON.stringify(uploadedUrls);
  }

  const { error } = await supabase
    .from("catalog")
    .update(updateData)
    .eq("id_catalog", id_catalog);

  if (error) throw new Error("Gagal update database: " + error.message);

  revalidatePath("/admin/dashboard/catalog");
  revalidatePath("/catalog");
}
