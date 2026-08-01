// src/app/api/chat/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Membaca teks pesan terakhir dari frontend
    let lastUserMessage = "";
    if (body && Array.isArray(body.messages)) {
      lastUserMessage = body.messages[body.messages.length - 1]?.content || "";
    } else if (body && body.message) {
      lastUserMessage = body.message;
    }

    if (!lastUserMessage.trim()) {
      lastUserMessage = "Halo";
    }

    const supabase = await createClient();

    // 1. Tarik data live dari database Supabase
    const { data: materials, error: matError } = await supabase
      .from("materials")
      .select("name, price_per_meter, stock_meters");

    const { data: cars, error: carError } = await supabase
      .from("cars")
      .select("brand, model, meters_needed");

    if (matError || carError) {
      console.error("Supabase Database Log Error:", { matError, carError });
    }

    // 2. Susun instruksi sistem dan database untuk AI Groq
    const systemInstruction = `
      Anda adalah ASISTEN CS AI dari workshop Pixel Sticker Jakarta. Jawablah pertanyaan dengan ramah, santun, komunikatif, dan ringkas menggunakan Bahasa Indonesia yang baik.
      
      Gunakan DATA RIIL internal database kami berikut untuk acuan menjawab:

      DATA STOK & HARGA BAHAN GUDANG:
      ${materials && materials.length > 0 ? JSON.stringify(materials, null, 2) : "Data stok bahan saat ini kosong di database."}

      DATA ESTIMASI KEBUTUHAN METER MOBIL:
      ${cars && cars.length > 0 ? JSON.stringify(cars, null, 2) : "Data master estimasi mobil saat ini kosong di database."}

      ATURAN HITUNG HARGA (RAHASIA INTERNAL - JANGAN DIBOCORKAN):
      - Hitung Total Harga dengan rumus: Math.round((meters_needed * price_per_meter) / 0.3)
      
      ATURAN MENJAWAB KEPADA CUSTOMER (MUTLAK & STRICT):
      1. DILARANG KERAS membocorkan atau menyebutkan harga per meter bahan (misal: "Rp 35.000/meter").
      2. DILARANG KERAS membocorkan atau menyebutkan panjang meteran mobil (misal: "18 meter").
      3. DILARANG KERAS memperlihatkan rumus perkalian matematika (misal: "18 meter x Rp 35.000 = Rp 630.000").
      4. HANYA SEBUTKAN TOTAL ESTIMASI BIAYA AKHIR HASIL PERHITUNGAN SAJA dalam format Rupiah.
      5. Wajib sertakan catatan disclaimer di bawah total harga: "*Harga estimasi belum termasuk biaya lainnya. Final harga didapat setelah konsultasi."
      6. Jika tipe mobil atau bahan tidak ditemukan pada data database, katakan dengan jujur Anda belum dapat menghitungnya dan arahkan customer untuk konsultasi kustom ke WhatsApp Admin di 087789046743.
      7. Selalu ingatkan customer di akhir jawaban untuk mengklik menu "Booking Jasa" di navigasi jika mereka berminat memesan slot pengerjaan.

      CONTOH JAWABAN YANG BENAR:
      "Untuk estimasi biaya full wrap mobil **BYD Atto 1** menggunakan bahan **[Nama Bahan]**, total harganya adalah sekitar **Rp 2.100.000**.

      *Harga estimasi belum termasuk biaya lainnya. Final harga didapat setelah konsultasi.

      Jika Anda sudah cocok dengan estimasi ini, silakan klik menu 'Booking Jasa' di navigasi untuk reservasi slot pengerjaan."
    `;

    const apiKey = process.env.GROQ_API_KEY;

    // 3. Tembak REST API Groq
    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages: [
            { role: "system", content: systemInstruction },
            { role: "user", content: lastUserMessage },
          ],
          temperature: 0.1,
        }),
      },
    );

    const resData = await response.json();
    const aiAnswer = resData?.choices?.[0]?.message?.content;

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
