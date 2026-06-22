// src/app/admin/login/actions.ts
"use server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export async function login(formData: FormData) {
  const supabase = await createClient();

  // Ambil data yang diketik di form
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  // Proses login ke Supabase
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  // Jika gagal (password salah/email tidak ada)
  if (error) {
    redirect("/admin/login?error=Email atau password salah.");
  }

  // Jika berhasil, arahkan ke halaman Dashboard (yang akan kita buat nanti)
  redirect("/admin/dashboard");
}
