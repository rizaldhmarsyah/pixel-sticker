"use client";

import { useState, useMemo, useEffect } from "react";
import { HelpCircle } from "lucide-react";

interface Material {
  id_materials: string;
  name: string;
  price_per_meter: number;
}

interface Car {
  id_cars: string;
  brand: string;
  model: string;
  meters_needed: number;
}

export default function PriceCalculator({
  materials,
  cars,
}: {
  materials: Material[];
  cars: Car[];
}) {
  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedCarId, setSelectedCarId] = useState("");
  const [selectedMaterialId, setSelectedMaterialId] = useState("");

  // Safety Hydration
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const availableModels = useMemo(() => {
    return cars.filter((car) => car.brand === selectedBrand);
  }, [selectedBrand, cars]);

  const selectedCar = cars.find((c) => c.id_cars === selectedCarId);
  const selectedMaterial = materials.find(
    (m) => m.id_materials === selectedMaterialId,
  );

  // 🧮 Hitung Total Harga (Perhitungan internal 30% tetap berjalan di belakang layar)
  const totalPrice = useMemo(() => {
    if (selectedCar && selectedMaterial) {
      const materialCost =
        selectedCar.meters_needed * selectedMaterial.price_per_meter;

      const calculatedTotal = materialCost / 0.3;

      return Math.round(calculatedTotal);
    }
    return 0;
  }, [selectedCar, selectedMaterial]);

  const rupiah = (number: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(number);
  };

  // 📝 Generate Pesan WhatsApp untuk Unit/Bahan yang Tidak Ada di List
  const getCustomWaMessage = () => {
    if (selectedBrand) {
      return `Halo%20Pixel%20Sticker,%20saya%20mau%20tanya%20estimasi%20wrap%20untuk%20mobil%20merk%20*${encodeURIComponent(
        selectedBrand,
      )}*%20tipe%20tertentu%20atau%20pilihan%20bahan%20custom%20yang%20belum%20ada%20di%20list%20web.`;
    }
    return `Halo%20Pixel%20Sticker,%20tipe%20mobil%20atau%20bahan%20stiker%20yang%20saya%20cari%20belum%20ada%20di%20pilihan%20kalkulator%20web.%20Bisa%20bantu%20estimasi%20harganya?`;
  };

  if (!isMounted) {
    return (
      <div className="w-full max-w-xl bg-zinc-100 border border-zinc-300 rounded-[2.5rem] p-8 shadow-2xl animate-pulse">
        <div className="h-8 bg-zinc-200 rounded-xl mb-4 w-1/2 mx-auto"></div>
        <div className="space-y-6">
          <div className="h-14 bg-zinc-200 rounded-2xl"></div>
          <div className="h-14 bg-zinc-200 rounded-2xl"></div>
          <div className="h-48 bg-zinc-200 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div
      suppressHydrationWarning
      className="w-full max-w-xl bg-zinc-100 border border-zinc-300 rounded-[2.5rem] p-8 shadow-2xl font-sans"
    >
      {/* Header Kalkulator */}
      <div className="text-center pb-6 mb-2">
        <h2 className="text-zinc-800 font-bold tracking-tight text-2xl">
          Estimasi Biaya Wrap
        </h2>
        <p className="text-zinc-500 text-xs mt-1">
          Pilih unit kendaraan dan jenis bahan stiker favoritmu
        </p>
      </div>

      <div className="space-y-6">
        {/* --- PILIH MERK MOBIL --- */}
        <div className="space-y-2">
          <span className="block text-xs font-bold text-zinc-600 uppercase tracking-widest ml-1">
            Merk Mobil
          </span>
          <div className="relative">
            <select
              className="w-full bg-white border border-zinc-300 rounded-2xl p-4 text-black outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none cursor-pointer font-medium shadow-sm"
              value={selectedBrand}
              onChange={(e) => {
                setSelectedBrand(e.target.value);
                setSelectedCarId("");
              }}
            >
              <option value="" className="text-zinc-500 bg-white">
                Pilih Merk
              </option>
              {Array.from(new Set(cars.map((c) => c.brand))).map((brand) => (
                <option
                  key={brand}
                  value={brand}
                  className="text-black bg-white"
                >
                  {brand}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-zinc-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </div>
          </div>
        </div>

        {/* --- PILIH TIPE MOBIL --- */}
        <div className="space-y-2">
          <span className="block text-xs font-bold text-zinc-600 uppercase tracking-widest ml-1">
            Tipe Mobil
          </span>
          <div className="relative">
            <select
              className="w-full bg-white border border-zinc-300 rounded-2xl p-4 text-black outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer font-medium shadow-sm"
              disabled={!selectedBrand}
              value={selectedCarId}
              onChange={(e) => setSelectedCarId(e.target.value)}
            >
              <option value="" className="text-zinc-500 bg-white">
                Pilih Tipe
              </option>
              {availableModels.map((car) => (
                <option
                  key={car.id_cars}
                  value={car.id_cars}
                  className="text-black bg-white"
                >
                  {car.model}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-zinc-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </div>
          </div>
        </div>

        {/* --- PILIH BAHAN STIKER --- */}
        <div className="space-y-2">
          <span className="block text-xs font-bold text-zinc-600 uppercase tracking-widest ml-1">
            Pilihan Bahan
          </span>
          <div className="grid grid-cols-1 gap-2.5 max-h-[340px] overflow-y-auto pr-2 bg-white/40 border border-zinc-200 p-2 rounded-2xl">
            {materials.map((mat) => {
              const isSelected = selectedMaterialId === mat.id_materials;
              return (
                <button
                  key={mat.id_materials}
                  type="button"
                  onClick={() => setSelectedMaterialId(mat.id_materials)}
                  className={`flex justify-between items-center p-5 rounded-xl border transition-all text-left shadow-sm ${
                    isSelected
                      ? "border-blue-500 bg-blue-50 text-blue-700 ring-1 ring-blue-500 font-semibold"
                      : "border-zinc-200 bg-white hover:border-zinc-300 text-black font-medium"
                  }`}
                >
                  <span className="text-sm tracking-wide">{mat.name}</span>
                  {isSelected && (
                    <span className="text-[10px] font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full border border-blue-200">
                      ✓ Terpilih
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* --- TOTAL HARGA & WHATSAPP --- */}
        <div className="mt-10 pt-8 border-t border-zinc-300 relative">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <p className="text-xs text-zinc-500 mb-1 font-medium uppercase tracking-widest">
                Estimasi Total Biaya Full Wrap
              </p>
              <p className="text-[11px] text-zinc-400 max-w-sm font-light leading-relaxed">
                *Harga estimasi belum termasuk biaya lainnya. Final harga
                didapat setelah konsultasi.
              </p>
            </div>

            <div className="text-right flex-shrink-0">
              <h3 className="text-2xl font-bold text-zinc-700 tracking-tight">
                {totalPrice > 0 ? rupiah(totalPrice) : "Rp 0"}
              </h3>
            </div>
          </div>

          {totalPrice > 0 && (
            <a
              href={`https://wa.me/6287789046743?text=Halo%20Pixel%20Sticker,%20saya%20mau%20konsultasi%20wrap%20mobil%20${selectedCar?.brand}%20${selectedCar?.model}%20pakai%20bahan%20${selectedMaterial?.name}.%20Estimasi%20total%20di%20web%20${rupiah(totalPrice)}.`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-3 w-full mt-8 bg-[#25D366] text-white py-4 rounded-2xl font-black text-sm uppercase tracking-wider hover:bg-[#20ba5a] transition-all active:scale-95 shadow-lg shadow-green-500/20"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 448 512"
                fill="currentColor"
              >
                <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L3.2 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-5.5-2.8-23.2-8.5-44.2-27.1-16.4-14.6-27.4-32.7-30.6-38.1-3.2-5.5-.3-8.5 2.5-11.2 2.5-2.4 5.5-6.5 8.3-9.7 2.8-3.3 3.7-5.5 5.5-9.3 1.9-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 13.2 5.7 23.5 9.2 31.6 11.8 13.3 4.2 25.4 3.6 35 2.2 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z" />
              </svg>
              <span>Konsultasi via WhatsApp</span>
            </a>
          )}
        </div>

        {/* 🟢 BANNER FALLBACK (TIDAK MENEMUKAN MOBIL / BAHAN) */}
        <div className="mt-8 pt-6 border-t border-zinc-200">
          <div className="bg-white border border-zinc-200 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
            <div className="flex items-center gap-3 text-left">
              <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl shrink-0 border border-blue-100">
                <HelpCircle size={18} />
              </div>
              <div>
                <p className="text-xs font-bold text-zinc-800">
                  Tidak Menemukan Mobil atau Bahan?
                </p>
                <p className="text-[10px] text-zinc-500 leading-tight">
                  Konsultasikan unit atau warna langsung dengan tim kami.
                </p>
              </div>
            </div>

            <a
              href={`https://wa.me/6287789046743?text=${getCustomWaMessage()}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20ba5a] text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 active:scale-95 shadow-md shadow-emerald-500/20 group"
            >
              <svg
                className="w-4 h-4 fill-current group-hover:scale-110 transition-transform duration-200"
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
  );
}
