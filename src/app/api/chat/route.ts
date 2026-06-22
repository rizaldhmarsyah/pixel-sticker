// src/app/api/chat/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // PENGAMAN UTAMA: Membaca teks pesan terakhir dari frontend dengan toleransi struktur objek
    let lastUserMessage = "";
    if (body && Array.isArray(body.messages)) {
      lastUserMessage = body.messages[body.messages.length - 1]?.content || "";
    } else if (body && body.message) {
      lastUserMessage = body.message;
    }

    // Jika pesan terdeteksi kosong, beri fallback teks default agar API tidak crash
    if (!lastUserMessage.trim()) {
      lastUserMessage = "Halo";
    }

    const supabase = await createClient();

    // 1. Tarik data live dari database Supabase lu
    const { data: materials, error: matError } = await supabase
      .from("materials")
      .select("name, price_per_meter, stock_meters");

    const { data: cars, error: carError } = await supabase
      .from("cars")
      .select("brand, model, meters_needed");

    // Tampilkan di console terminal jika ada kendala koneksi tabel Supabase
    if (matError || carError) {
      console.error("Supabase Database Log Error:", { matError, carError });
    }

    // 2. Susun instruksi sistem dan database bensin untuk dibaca AI Groq
    const systemInstruction = `
      Anda adalah Asisten CS AI otomatis dari workshop Pixel Sticker Jakarta. Jawablah pertanyaan dengan ramah, santun, komunikatif, dan sangat singkat menggunakan Bahasa Indonesia yang baik.
      
      Gunakan DATA RIIL internal database kami berikut untuk acuan menjawab (Jangan mengarang data!):

      DATA STOK & HARGA BAHAN GUDANG:
      ${materials && materials.length > 0 ? JSON.stringify(materials, null, 2) : "Data stok bahan saat ini kosong di database."}

      DATA ESTIMASI KEBUTUHAN METER MOBIL:
      ${cars && cars.length > 0 ? JSON.stringify(cars, null, 2) : "Data master estimasi mobil saat ini kosong di database."}

      ATURAN MENJAWAB (MUTLAK):
      1. Jika ditanya biaya wrapping, hitung otomatis dengan rumus matematika: (Kebutuhan Meter Mobil x Harga per Meter Bahan). Sebutkan rincian hitungannya ke customer secara transparan.
      2. Jika data bahan atau kendaraan tidak ditemukan pada data di atas, katakan dengan jujur Anda belum tahu dan arahkan customer untuk konsultasi spesifikasi kustom langsung ke WhatsApp Admin di 08XXXXXXXXXX.
      3. Selalu ingatkan customer di akhir kalimat untuk mengklik menu "Booking Jasa" di navigasi samping jika mereka sudah cocok dengan estimasi hitungan Anda.
    `;

    const apiKey = process.env.GROQ_API_KEY;

    // 3. Tembak REST API Groq menggunakan native fetch (Menggunakan Llama 3.1 Terupdate)
    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant", // UPDATE FINAL: Menggunakan lini model aktif yang didukung Groq
          messages: [
            { role: "system", content: systemInstruction },
            { role: "user", content: lastUserMessage },
          ],
          temperature: 0.2, // Nilai rendah agar AI patuh pada database dan tidak mengarang jawaban
        }),
      },
    );

    const resData = await response.json();
    const aiAnswer = resData?.choices?.[0]?.message?.content;

    // Jika server Groq memberikan balasan kosong, lemparkan ke status log
    if (!aiAnswer) {
      console.error(
        "Groq Cloud API Log Error:",
        JSON.stringify(resData, null, 2),
      );
      return NextResponse.json({
        role: "model",
        content:
          "Halo! Mohon maaf, saya sedang menyinkronkan data gudang internal. Bisa tolong ulangi pertanyaan Anda?",
      });
    }

    // Kembalikan jawaban sukses ke frontend chatbox
    return NextResponse.json({ role: "model", content: aiAnswer });
  } catch (error: any) {
    console.error("Catch Error Groq Server Internal:", error);
    return NextResponse.json(
      {
        role: "model",
        content: "Terjadi kendala jaringan pada server chatbox utama.",
      },
      { status: 500 },
    );
  }
}
