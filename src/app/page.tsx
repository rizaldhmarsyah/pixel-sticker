// src/app/page.tsx
import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import Image from "next/image";
import { MapPin, Clock, Phone, ChevronRight, ExternalLink } from "lucide-react";

export default async function Home() {
  const supabase = await createClient();

  // Mengambil data count untuk statistik dari Supabase
  const { count: materialCount } = await supabase
    .from("materials")
    .select("*", { count: "exact", head: true });

  const { count: carCount } = await supabase
    .from("cars")
    .select("*", { count: "exact", head: true });

  // URL Iframe & Link Rute Google Maps dari halaman Tentang Kami
  const gmapsEmbedUrl =
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3966.83926422356!2d106.84244607428016!3d-6.1522761938347745!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69f5b99555553f%3A0x7d2c267435b34d04!2sPixel%20sticker!5e0!3m2!1sid!2sid!4v1784987675579!5m2!1sid!2sid8";
  const gmapsDirectUrl =
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3966.83926422356!2d106.84244607428016!3d-6.1522761938347745!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69f5b99555553f%3A0x7d2c267435b34d04!2sPixel%20sticker!5e0!3m2!1sid!2sid!4v1784987675579!5m2!1sid!2sid9";

  return (
    <div className="flex flex-col bg-black text-white selection:bg-blue-500/30 overflow-x-hidden">
      {/* --- HERO SECTION --- */}
      <section className="relative w-full min-h-screen flex flex-col items-center justify-center overflow-hidden px-6 py-20">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/bg-main-1.png"
            alt="Premium Car Wrap"
            fill
            sizes="100vw"
            className="object-cover object-center opacity-40 grayscale"
            priority
          />
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

            <Link
              href="/catalog"
              className="w-full sm:w-auto px-8 py-4 md:py-5 bg-neutral-900 border border-neutral-800 text-white rounded-full font-bold text-base md:text-lg hover:bg-neutral-800 transition-all text-center inline-block"
            >
              Lihat Katalog
            </Link>
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-stretch">
            {/* Card 1: Full Wrap */}
            <div className="group relative flex flex-col bg-neutral-900/30 border border-neutral-800 rounded-[2rem] md:rounded-[2.5rem] overflow-hidden transition-all hover:border-neutral-600">
              <div className="relative h-48 sm:h-56 md:h-64 w-full overflow-hidden">
                <Image
                  src="/fullwrap.png"
                  alt="Full Body Wrap"
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover group-hover:scale-110 transition-transform duration-700 opacity-80"
                />
              </div>
              <div className="p-6 md:p-10 flex flex-col justify-between flex-1">
                <div>
                  <h3 className="text-2xl md:text-3xl font-bold mb-3 md:mb-4 text-white">
                    Full Body Wrap
                  </h3>
                  <p className="text-sm md:text-base text-neutral-400 leading-relaxed mb-6 font-light">
                    Ubah total karakter mobil Anda dengan warna pilihan tanpa
                    merusak cat original.
                  </p>
                </div>
                <Link
                  href="/catalog"
                  className="text-white font-semibold inline-flex items-center gap-2 text-sm md:text-base hover:text-blue-400 transition-colors"
                >
                  Lihat Hasil{" "}
                  <span className="group-hover:translate-x-2 transition-transform">
                    →
                  </span>
                </Link>
              </div>
            </div>

            {/* Card 2: Custom Printing */}
            <div className="group relative flex flex-col bg-neutral-900/30 border border-neutral-800 rounded-[2rem] md:rounded-[2.5rem] overflow-hidden transition-all hover:border-neutral-600">
              <div className="relative h-48 sm:h-56 md:h-64 w-full overflow-hidden">
                <Image
                  src="/card-3.png"
                  alt="Custom Printing Detail"
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover group-hover:scale-110 transition-transform duration-700 opacity-80"
                />
              </div>
              <div className="p-6 md:p-10 flex flex-col justify-between flex-1">
                <div>
                  <h3 className="text-2xl md:text-3xl font-bold mb-3 md:mb-4 text-white">
                    Custom Branding & Wrapping
                  </h3>
                  <p className="text-sm md:text-base text-neutral-400 leading-relaxed mb-6 font-light">
                    Solusi wrapping dan branding kendaraan beresolusi tinggi
                    untuk mempertegas identitas personal hingga promosi bisnis
                    Anda.
                  </p>
                </div>
                <Link
                  href="/catalog"
                  className="text-white font-semibold inline-flex items-center gap-2 text-sm md:text-base hover:text-blue-400 transition-colors"
                >
                  Eksplorasi Desain{" "}
                  <span className="group-hover:translate-x-2 transition-transform">
                    →
                  </span>
                </Link>
              </div>
            </div>

            {/* Card 3: Panggilan ke Lokasi */}
            <div className="md:col-span-2 max-w-xl mx-auto w-full group relative flex flex-col bg-gradient-to-b from-neutral-900/50 to-neutral-900/20 border border-neutral-800 rounded-[2rem] md:rounded-[2.5rem] overflow-hidden transition-all hover:border-emerald-500/50 hover:shadow-2xl hover:shadow-emerald-950/20">
              <div className="relative h-52 sm:h-60 w-full overflow-hidden">
                <Image
                  src="/card-4.png"
                  alt="Home Service Delivery"
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover group-hover:scale-110 transition-transform duration-700 opacity-80 grayscale group-hover:grayscale-0"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/40 to-transparent"></div>

                <span className="absolute top-5 left-5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] uppercase font-bold tracking-widest px-3 py-1.5 rounded-full backdrop-blur-md flex items-center gap-1.5 z-10">
                  <MapPin size={12} /> Home Service Available
                </span>
              </div>

              <div className="p-6 md:p-8 text-center flex flex-col items-center justify-between flex-1 gap-5 -mt-6 relative z-10">
                <div>
                  <h3 className="text-2xl md:text-3xl font-black text-white tracking-tight uppercase">
                    Menerima Panggilan ke Lokasi
                  </h3>
                  <p className="text-xs md:text-sm text-neutral-400 font-light mt-2 max-w-md mx-auto leading-relaxed">
                    Waktu terbatas? Tim teknisi profesional kami siap datang
                    langsung ke garasi atau lokasi Anda untuk pengerjaan wrap &
                    cutting sticker.
                  </p>
                </div>

                {/* Tombol WhatsApp Hijau */}
                <a
                  href="https://wa.me/628xxxxxxxxxx?text=Halo%20Pixel%20Sticker,%20saya%20tertarik%20dengan%20layanan%20panggilan%20pengerjaan%20ke%20lokasi%20(Home%20Service)."
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-black px-8 py-4 rounded-full text-xs uppercase tracking-wider transition-all duration-300 active:scale-95 shadow-lg shadow-emerald-950/50 border border-emerald-400/30 w-full sm:w-auto"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                  </svg>
                  <span>Reservasi Layanan via WhatsApp</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- CTA SECTION (ATAS ALAMAT) --- */}
      <section className="w-full py-20 md:py-28 px-4 sm:px-6 bg-black flex flex-col items-center justify-center relative z-10">
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

      {/* --- SECTION LOKASI WORKSHOP (PALING BAWAH SEBELUM FOOTER) --- */}
      <section className="w-full py-20 px-6 bg-black relative z-10 border-t border-neutral-900">
        <div className="max-w-6xl mx-auto">
          <div className="bg-neutral-900/40 border border-neutral-800 text-white rounded-[2.5rem] p-8 md:p-12 shadow-2xl space-y-8 backdrop-blur-md">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
              {/* SISI KIRI: DESKRIPSI & INFORMASI KONTAK */}
              <div className="md:col-span-6 space-y-6">
                <div className="space-y-3">
                  <span className="text-[9px] font-black uppercase tracking-widest text-blue-400 bg-blue-500/10 px-3 py-1 rounded-md border border-blue-500/20 inline-block">
                    Kunjungi Workshop Kami
                  </span>
                  <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tight text-white">
                    Siap Mengubah Tampilan Mobil Anda?
                  </h2>
                  <p className="text-xs md:text-sm text-neutral-400 leading-relaxed font-light">
                    Gunakan sistem reservasi online kami untuk mengunci slot
                    tanggal pengerjaan wrapping bodi mobil Anda tanpa perlu
                    mengantre lama di bengkel.
                  </p>
                </div>

                <div>
                  <Link
                    href="/booking"
                    className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold uppercase tracking-wider px-6 py-3.5 rounded-xl shadow-lg shadow-blue-600/20 transition-all active:scale-95"
                  >
                    <span>Mulai Reservasi Online</span>
                    <ChevronRight size={14} />
                  </Link>
                </div>

                <div className="pt-4 border-t border-neutral-800 space-y-4 text-xs font-medium text-neutral-300">
                  <div className="flex items-start gap-3">
                    <MapPin
                      size={16}
                      className="text-blue-500 shrink-0 mt-0.5"
                    />
                    <div>
                      <p className="text-white font-bold text-xs uppercase tracking-wider mb-0.5">
                        Lokasi Toko
                      </p>
                      <p className="text-neutral-400 font-normal leading-relaxed text-xs">
                        Pasar mobil kemayoran blok j 8 Jakarta pusat, Kemayoran,
                        Pasar mobil kemayoran blok j 8, RW.10, Pademangan Tim.,
                        Kec. Pademangan, Jkt Utara, Daerah Khusus Ibukota
                        Jakarta 14410
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Clock size={16} className="text-purple-500 shrink-0" />
                    <div>
                      <p className="text-white font-bold text-xs uppercase tracking-wider mb-0.5">
                        Jam Operasional
                      </p>
                      <p className="text-neutral-400 font-normal text-xs">
                        Senin - Minggu: 09.00 - 18.00 WIB
                      </p>
                    </div>
                  </div>

                  {/* 🟢 WHATSAPP KASIR DENGAN LOGO WA & KOTAK HIJAU TANYA CS */}
                  <div className="flex items-start gap-3 pt-1">
                    {/* SVG Logo WhatsApp Resmi */}
                    <div className="shrink-0 mt-1">
                      <svg
                        className="w-4 h-4 fill-[#25D366]"
                        viewBox="0 0 24 24"
                      >
                        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                      </svg>
                    </div>

                    <div className="w-full">
                      <p className="text-white font-bold text-xs uppercase tracking-wider mb-1.5">
                        WhatsApp Kasir
                      </p>

                      <div className="flex flex-wrap items-center gap-3">
                        <span className="text-emerald-400 font-bold text-sm tracking-wide">
                          +62 877-8904-6743
                        </span>

                        {/* Kotak Kecil Tanya CS ala PriceCalculator */}
                        <a
                          href="https://wa.me/6287789046743?text=Halo%20Pixel%20Sticker,%20saya%20ingin%20bertanya%20mengenai%20layanan%20wrapping."
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 bg-[#25D366] hover:bg-[#20ba5a] text-white px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all active:scale-95 shadow-md shadow-emerald-500/20 group"
                        >
                          <svg
                            className="w-3.5 h-3.5 fill-current group-hover:scale-110 transition-transform duration-200"
                            viewBox="0 0 24 24"
                          >
                            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                          </svg>
                          <span>Tanya Admin</span>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* SISI KANAN: EMBED GOOGLE MAPS */}
              <div className="md:col-span-6 space-y-3">
                <div className="relative w-full h-[320px] md:h-[380px] rounded-2xl overflow-hidden border border-neutral-800 shadow-2xl group bg-neutral-950">
                  <iframe
                    src={gmapsEmbedUrl}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen={true}
                    loading="lazy"
                    referrerPolicy="strict-origin-when-cross-origin"
                    title="Lokasi Pixel Sticker Workshop"
                    className="w-full h-full grayscale-[20%] contrast-[105%] group-hover:grayscale-0 transition-all duration-500"
                  />
                </div>

                {/* TOMBOL PINTASAN BUKA DI GMAPS */}
                <a
                  href={gmapsDirectUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 bg-neutral-800/80 hover:bg-neutral-800 text-neutral-300 hover:text-white text-xs font-semibold px-4 py-3 rounded-xl border border-neutral-700/60 transition-all active:scale-[0.99]"
                >
                  <span>Buka Rute di Google Maps</span>
                  <ExternalLink size={14} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="w-full py-8 md:py-10 px-6 border-t border-neutral-900 text-center text-neutral-600 text-[10px] md:text-sm uppercase tracking-widest">
        © 2026 Pixel Sticker. All Rights Reserved.
      </footer>
    </div>
  );
}
