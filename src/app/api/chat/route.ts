// src/app/api/chat/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // 1. Ambil array riwayat pesan dari frontend
    let messages: Array<{ role: string; content: string }> = [];
    if (body && Array.isArray(body.messages)) {
      messages = body.messages;
    } else if (body && body.message) {
      messages = [{ role: "user", content: body.message }];
    }

    const lastUserMessage = messages[messages.length - 1]?.content || "Halo";

    // Gabungkan seluruh percakapan user untuk deteksi kata kunci
    const conversationHistoryText = messages
      .filter((m) => m.role === "user")
      .map((m) => m.content)
      .join(" ")
      .toLowerCase();

    const supabase = await createClient();

    // 2. Tarik Data Live dari Supabase
    const { data: materials } = await supabase
      .from("materials")
      .select("name, price_per_meter");

    const { data: cars } = await supabase
      .from("cars")
      .select("brand, model, meters_needed");

    const rupiah = (number: number) => {
      return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
      }).format(number);
    };

    // 📝 FORMAT LIST BAHAN BERBARIS KE BAWAH
    const formattedMaterialsList =
      materials?.map((m) => `• ${m.name}`).join("\n") || "";

    // 3. 🧮 FLEXIBLE BI-DIRECTIONAL MATCHING ENGINE
    // Pencarian Mobil Fleksibel (Mendukung "Pajero" untuk "Pajero Sport")
    const matchedCar = cars?.find((c) => {
      const modelName = c.model.toLowerCase();
      const brandName = c.brand.toLowerCase();

      // Cek 1: Apakah teks percakapan mengandung nama model/brand (misal: "pajero sport" di "mau wrap pajero sport")
      if (
        conversationHistoryText.includes(modelName) ||
        conversationHistoryText.includes(brandName)
      ) {
        return true;
      }

      // Cek 2: Cek per kata (misal: user cuma ngetik "pajero", sedangkan DB "pajero sport")
      // Tipe data `(t: string)` eksplisit untuk menghindari Type Error Vercel Build
      const modelTokens = modelName
        .split(" ")
        .filter((t: string) => t.length > 2);
      const userTokens = conversationHistoryText
        .split(/\s+/)
        .filter((t: string) => t.length > 2);

      const hasModelMatch = modelTokens.some((token: string) =>
        userTokens.some(
          (uToken: string) => uToken.includes(token) || token.includes(uToken),
        ),
      );

      return hasModelMatch;
    });

    // Pencarian Bahan Fleksibel (Mendukung "soft pink", "black", "oracal", dll)
    const matchedMaterial = materials?.find((m) => {
      const matName = m.name.toLowerCase();
      if (conversationHistoryText.includes(matName)) return true;

      const keywords = matName
        .split(" ")
        .map((k: string) => k.replace(/[^a-z0-9]/g, ""))
        .filter((k: string) => k.length > 2);

      return keywords.some((kw: string) =>
        conversationHistoryText.includes(kw),
      );
    });

    let systemContext = "";

    if (matchedCar && matchedMaterial) {
      // 🎯 RUMUS EKSAK PRICECALCULATOR
      const materialCost =
        matchedCar.meters_needed * matchedMaterial.price_per_meter;
      const exactTotal = Math.round(materialCost / 0.3);

      systemContext = `
[FAKTA HITUNGAN SISTEM RESMI]:
- Mobil Terdeteksi dari Percakapan: ${matchedCar.brand} ${matchedCar.model}
- Bahan Terdeteksi dari Percakapan: ${matchedMaterial.name}
- HARGA TOTAL RESMI: ${rupiah(exactTotal)}

INSTRUKSI KHUSUS HARGA:
Customer sudah menyebutkan mobil ${matchedCar.brand} ${matchedCar.model} dan bahan ${matchedMaterial.name}.
Langsung beritahu customer bahwa total estimasi biaya full wrap-nya adalah ${rupiah(exactTotal)}.
DILARANG BERTANYA MERK MOBIL LAGI ATAU MENGUBAH ANGKA ${rupiah(exactTotal)}!
      `;
    } else if (matchedCar && !matchedMaterial) {
      systemContext = `
[FAKTA SISTEM]: Customer sudah menyebutkan mobil ${matchedCar.brand} ${matchedCar.model}, tetapi BELUM memilih bahan.
Berikan pilihan bahan berikut dengan FORMAT LIST KE BAWAH (gunakan bullet point • dan gantian baris/enter):
${formattedMaterialsList}

Silakan beri tahu kami bahan mana yang ingin Anda gunakan!
      `;
    } else if (!matchedCar && matchedMaterial) {
      systemContext = `
[FAKTA SISTEM]: Customer memilih bahan ${matchedMaterial.name}, tetapi BELUM sebut mobil.
TANYAKAN apa merk/tipe mobil customer.
      `;
    }

    // 4. System Instruction Dibuat Strict
    const systemInstruction = `
Kamu adalah CS AI resmi dari workshop Pixel Sticker Jakarta. Jawablah pesan customer dengan ramah, komunikatif, dan rapi.

DAFTAR BAHAN RESMI DI DATABASE:
${formattedMaterialsList}

ATURAN FORMATTING & STRICT:
1. Jika menampilkan daftar bahan, WAJIB BERBENTUK LIST KE BAWAH menggunakan tanda bullet (•) dan pindah baris (enter) per bahan.
2. DILARANG MENGARANG NAMA BAHAN/HARGA DI LUAR DATABASE!
3. DILARANG MENYEBUTKAN HARGA PER METER BAHAN ATAU UKURAN METERAN MOBIL!
4. DILARANG MENAMPILKAN RUMUS MATEMATIKA ATAU PERKALIAN DESIMAL!
5. Setiap kali menyebutkan harga total, WAJIB sertakan catatan ini tepat di bawahnya:
"*Harga estimasi belum termasuk biaya lainnya. Final harga didapat setelah konsultasi."
6. Di akhir pesan, ajak customer untuk booking slot via menu "Booking Jasa".
7. Jika unit mobil atau bahan tidak terdaftar, sarankan hubungi WhatsApp Admin di nomor 087789046743.

${systemContext}
    `;

    // 5. Susun format messages lengkap untuk Groq
    const groqMessages = [
      { role: "system", content: systemInstruction },
      ...messages.map((m) => ({
        role: m.role === "model" ? "assistant" : "user",
        content: m.content,
      })),
    ];

    const apiKey = process.env.GROQ_API_KEY;

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
          messages: groqMessages,
          temperature: 0.0,
        }),
      },
    );

    const resData = await response.json();

    if (!response.ok) {
      return NextResponse.json({
        role: "model",
        content:
          "Halo! Ada yang bisa saya bantu terkait wrapping mobil Anda? Atau Anda bisa konsultasi langsung dengan Admin kami di WhatsApp 087789046743.",
      });
    }

    const aiAnswer = resData?.choices?.[0]?.message?.content;

    return NextResponse.json({
      role: "model",
      content: aiAnswer || "Halo! Ada yang bisa saya bantu?",
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        role: "model",
        content: "Terjadi kendala jaringan pada server chatbox.",
      },
      { status: 500 },
    );
  }
}
