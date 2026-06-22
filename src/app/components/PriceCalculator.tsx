"use client";

import { useState, useMemo } from "react";

interface Material {
  id: string;
  name: string;
  price_per_meter: number;
}

interface Car {
  id: string;
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

  const availableModels = useMemo(() => {
    return cars.filter((car) => car.brand === selectedBrand);
  }, [selectedBrand, cars]);

  const selectedCar = cars.find((c) => c.id === selectedCarId);
  const selectedMaterial = materials.find((m) => m.id === selectedMaterialId);

  const totalPrice = useMemo(() => {
    if (selectedCar && selectedMaterial) {
      return selectedCar.meters_needed * selectedMaterial.price_per_meter;
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

  return (
    <div className="w-full max-w-xl bg-neutral-900/50 border border-neutral-800 rounded-[2.5rem] p-8 backdrop-blur-md">
      <div className="space-y-8">
        {/* Pilih Merk */}
        <div>
          <label className="block text-xs font-bold text-neutral-500 uppercase tracking-widest mb-4 ml-1">
            Merk Mobil
          </label>
          <select
            className="w-full bg-neutral-800 border border-neutral-700 rounded-2xl p-4 text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all appearance-none"
            onChange={(e) => {
              setSelectedBrand(e.target.value);
              setSelectedCarId("");
            }}
          >
            <option value="">Pilih Merk</option>
            {Array.from(new Set(cars.map((c) => c.brand))).map((brand) => (
              <option key={brand} value={brand}>
                {brand}
              </option>
            ))}
          </select>
        </div>

        {/* Pilih Tipe */}
        <div>
          <label className="block text-xs font-bold text-neutral-500 uppercase tracking-widest mb-4 ml-1">
            Tipe Mobil
          </label>
          <select
            className="w-full bg-neutral-800 border border-neutral-700 rounded-2xl p-4 text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all appearance-none disabled:opacity-30"
            disabled={!selectedBrand}
            value={selectedCarId}
            onChange={(e) => setSelectedCarId(e.target.value)}
          >
            <option value="">Pilih Tipe</option>
            {availableModels.map((car) => (
              <option key={car.id} value={car.id}>
                {car.model} ({car.meters_needed}m)
              </option>
            ))}
          </select>
        </div>

        {/* Pilih Bahan */}
        <div>
          <label className="block text-xs font-bold text-neutral-500 uppercase tracking-widest mb-4 ml-1">
            Pilihan Bahan
          </label>
          <div className="grid grid-cols-1 gap-3">
            {materials.map((mat) => (
              <button
                key={mat.id}
                onClick={() => setSelectedMaterialId(mat.id)}
                className={`flex justify-between items-center p-5 rounded-2xl border transition-all ${
                  selectedMaterialId === mat.id
                    ? "border-blue-500 bg-blue-500/10"
                    : "border-neutral-800 bg-neutral-800/40 hover:border-neutral-600"
                }`}
              >
                <span className="font-medium text-white">{mat.name}</span>
                <span className="text-sm text-neutral-400">
                  {rupiah(mat.price_per_meter)}/m
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Total Harga */}
        <div className="mt-10 pt-8 border-t border-neutral-800 text-center">
          <p className="text-sm text-neutral-500 mb-2 font-medium uppercase tracking-widest">
            Estimasi Total
          </p>
          <h3 className="text-5xl font-bold text-white tracking-tighter">
            {totalPrice > 0 ? rupiah(totalPrice) : "Rp 0"}
          </h3>
          {totalPrice > 0 && (
            <button className="w-full mt-8 bg-white text-black py-4 rounded-2xl font-bold text-lg hover:bg-neutral-200 transition-all active:scale-95">
              Konsultasi via WhatsApp
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
