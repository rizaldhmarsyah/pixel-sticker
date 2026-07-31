"use client";

import { useState, useMemo, useEffect } from "react";

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

  // 🧮 RUMUS REVISI: Biaya Bahan adalah 30% dari Total Harga (Jasa 70%)
  const totalPrice = useMemo(() => {
    if (selectedCar && selectedMaterial) {
      const materialCost =
        selectedCar.meters_needed * selectedMaterial.price_per_meter;

      // Total = Biaya Bahan / 0.3 (atau dikali 100/30)
      const calculatedTotal = materialCost / 0.3;

      return Math.round(calculatedTotal); // Pembulatan angka agar rapi
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
              href={`https://wa.me/628123456789?text=Halo%20Pixel%20Sticker,%20saya%20mau%20konsultasi%20wrap%20mobil%20${selectedCar?.brand}%20${selectedCar?.model}%20pakai%20bahan%20${selectedMaterial?.name}.%20Estimasi%20total%20di%20web%20${rupiah(totalPrice)}.`}
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
      </div>
    </div>
  );
}
