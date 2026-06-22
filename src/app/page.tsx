// src/app/page.tsx
import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import Image from "next/image";

export default async function Home() {
  const supabase = await createClient();

  // Mengambil data count untuk statistik dari Supabase
  const { count: materialCount } = await supabase
    .from("materials")
    .select("*", { count: "exact", head: true });

  const { count: carCount } = await supabase
    .from("cars")
    .select("*", { count: "exact", head: true });

  return (
    <div className="flex flex-col bg-black text-white selection:bg-blue-500/30 overflow-x-hidden">
      {/* --- HERO SECTION --- */}
      <section className="relative w-full min-h-screen flex flex-col items-center justify-center overflow-hidden px-6 py-20">
        {/* Background Image with Overlay - Fixed: object-center & adjusted opacity */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/bg-main-1.png"
            alt="Premium Car Wrap"
            fill
            sizes="100vw"
            className="object-cover object-center opacity-40 grayscale"
            priority
          />
          {/* Gradient Overlay Adjusted: Tengah lebih transparan agar pohon kelihatan */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/20 to-black"></div>
        </div>

        {/* Efek Cahaya */}
        <div className="absolute top-[-10%] left-[-20%] md:top-[-20%] md:left-[-10%] w-[80%] md:w-[50%] h-[50%] bg-blue-600/20 blur-[100px] md:blur-[150px] rounded-full z-1"></div>

        <div className="relative z-10 text-center w-full max-w-5xl mx-auto mt-10">
          <h1 className="text-5xl sm:text-6xl md:text-8xl lg:text-9xl font-bold tracking-tighter mb-6 bg-gradient-to-b from-white to-neutral-500 bg-clip-text text-transparent">
            Precision. <br /> Protection.
          </h1>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-neutral-400 max-w-3xl mx-auto mb-10 font-light tracking-wide leading-relaxed px-4 md:px-0">
            Dengan{" "}
            <span className="text-white font-medium">
              10 tahun pengalaman di bidang ini
            </span>
            , kami memastikan bodi mobil Anda mendapatkan proteksi yang optimal
            melalui penggunaan material premium dan hasil cutting yang presisi.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full max-w-md sm:max-w-none mx-auto">
            <Link
              href="/harga"
              className="w-full sm:w-auto px-8 py-4 md:py-5 bg-white text-black rounded-full font-bold text-base md:text-lg hover:bg-neutral-200 transition-all hover:scale-105 active:scale-95 text-center"
            >
              Cek Harga Instan
            </Link>
            <button className="w-full sm:w-auto px-8 py-4 md:py-5 bg-neutral-900 border border-neutral-800 text-white rounded-full font-bold text-base md:text-lg hover:bg-neutral-800 transition-all text-center">
              Lihat Katalog
            </button>
          </div>
        </div>
      </section>

      {/* --- STATS SECTION --- */}
      <section className="w-full py-16 md:py-20 bg-black border-y border-neutral-900 relative z-10">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-3 gap-10 md:gap-12 text-center">
          <div>
            <h3 className="text-4xl md:text-5xl font-bold mb-2 tracking-tighter">
              {materialCount || 0}+
            </h3>
            <p className="text-neutral-500 uppercase tracking-widest text-[10px] md:text-xs font-semibold">
              Pilihan Material
            </p>
          </div>
          <div>
            <h3 className="text-4xl md:text-5xl font-bold mb-2 tracking-tighter">
              {carCount || 0}+
            </h3>
            <p className="text-neutral-500 uppercase tracking-widest text-[10px] md:text-xs font-semibold">
              Tipe Mobil
            </p>
          </div>
          <div>
            <h3 className="text-4xl md:text-5xl font-bold mb-2 tracking-tighter">
              99,9%
            </h3>
            <p className="text-neutral-500 uppercase tracking-widest text-[10px] md:text-xs font-semibold">
              Hasil Presisi
            </p>
          </div>
        </div>
      </section>

      {/* --- SERVICES SECTION --- */}
      <section className="w-full py-24 md:py-32 px-6 bg-black relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12 md:mb-20 text-center md:text-left">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4 text-white">
              Layanan Unggulan.
            </h2>
            <p className="text-neutral-500 text-lg md:text-xl font-light">
              Didesain untuk detail, dibangun untuk performa.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
            {/* Card 1: Full Wrap - Fixed with sizes */}
            <div className="group relative flex flex-col bg-neutral-900/30 border border-neutral-800 rounded-[2rem] md:rounded-[2.5rem] overflow-hidden transition-all hover:border-neutral-600">
              <div className="relative h-48 sm:h-56 md:h-64 w-full overflow-hidden">
                <Image
                  src="/card-1.jpg"
                  alt="Full Body Wrap"
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover group-hover:scale-110 transition-transform duration-700 opacity-80"
                />
              </div>
              <div className="p-6 md:p-10">
                <h3 className="text-2xl md:text-3xl font-bold mb-3 md:mb-4 text-white">
                  Full Body Wrap
                </h3>
                <p className="text-sm md:text-base text-neutral-400 leading-relaxed mb-6 font-light">
                  Ubah total karakter mobil Anda dengan warna pilihan tanpa
                  merusak cat original.
                </p>
                <div className="text-white font-semibold flex items-center gap-2 text-sm md:text-base">
                  Lihat Hasil{" "}
                  <span className="group-hover:translate-x-2 transition-transform">
                    →
                  </span>
                </div>
              </div>
            </div>

            {/* Card 2: Cutting Sticker - Fixed with sizes */}
            <div className="group relative flex flex-col bg-neutral-900/30 border border-neutral-800 rounded-[2rem] md:rounded-[2.5rem] overflow-hidden transition-all hover:border-neutral-600">
              <div className="relative h-48 sm:h-56 md:h-64 w-full overflow-hidden">
                <Image
                  src="/card-2.jpg"
                  alt="Cutting Sticker Detail"
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover group-hover:scale-110 transition-transform duration-700 opacity-80"
                />
              </div>
              <div className="p-6 md:p-10">
                <h3 className="text-2xl md:text-3xl font-bold mb-3 md:mb-4 text-white">
                  Cutting Sticker
                </h3>
                <p className="text-sm md:text-base text-neutral-400 leading-relaxed mb-6 font-light">
                  Desain custom dengan presisi milimeter untuk branding atau
                  identitas personal.
                </p>
                <div className="text-white font-semibold flex items-center gap-2 text-sm md:text-base">
                  Eksplorasi Desain{" "}
                  <span className="group-hover:translate-x-2 transition-transform">
                    →
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- CTA SECTION --- */}
      <section className="w-full py-20 md:py-40 px-4 sm:px-6 bg-black flex flex-col items-center justify-center relative z-10">
        <div className="w-full max-w-5xl relative min-h-[400px] md:min-h-0 md:aspect-[3/1] rounded-[2rem] md:rounded-[3rem] overflow-hidden border border-neutral-800 group flex flex-col justify-center">
          <Image
            src="/bg-kalkulasi-harga.jpg"
            alt="Luxury Car Background"
            fill
            sizes="100vw"
            className="object-cover opacity-50 grayscale group-hover:grayscale-0 transition-all duration-1000"
          />
          <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center p-6 md:p-8">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 md:mb-8 tracking-tighter text-white text-center leading-tight">
              Tingkatkan Estetika <br className="hidden sm:block" /> &{" "}
              <br className="hidden sm:block" /> Keamanan Body Mobil Anda
            </h2>
            <Link
              href="/harga"
              className="w-full sm:w-auto px-8 md:px-10 py-4 md:py-5 bg-white text-black rounded-full font-bold text-base md:text-xl hover:scale-105 transition-all shadow-2xl text-center"
            >
              Mulai Kalkulasi Harga
            </Link>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="w-full py-8 md:py-10 px-6 border-t border-neutral-900 text-center text-neutral-600 text-[10px] md:text-sm uppercase tracking-widest">
        &copy; 2026 Pixel Sticker Studio. All Rights Reserved.
      </footer>
    </div>
  );
}
