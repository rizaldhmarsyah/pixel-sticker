// src/middleware.ts
import { type NextRequest } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";

export async function middleware(request: NextRequest) {
  // Jalankan fungsi updateSession untuk setiap request
  return await updateSession(request);
}
