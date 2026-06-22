// src/app/admin/dashboard/actions.ts
"use server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export async function signOut() {
  const supabase = await createClient();

  // Perintah hapus session di Supabase
  await supabase.auth.signOut();

  // Balikkan ke halaman login
  redirect("/admin/login");
}
