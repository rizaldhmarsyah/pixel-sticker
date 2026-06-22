"use client";

import { useState } from "react";
import {
  LayoutDashboard,
  Database,
  Car,
  Printer,
  LogOut,
  Menu,
  X,
  FolderHeart,
  CalendarCheck,
  BarChart3, // TAMBAHKAN INI: Ikon untuk menu laporan pendapatan owner
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Kelola Bahan", href: "/admin/dashboard/materials", icon: Database },
  { name: "Database Mobil", href: "/admin/dashboard/cars", icon: Car },
  {
    name: "Kelola Katalog",
    href: "/admin/dashboard/catalog",
    icon: FolderHeart,
  },
  {
    name: "Kelola Booking",
    href: "/admin/dashboard/bookings",
    icon: CalendarCheck,
  },
  { name: "Buat Kuitansi", href: "/admin/dashboard/kuitansi", icon: Printer },
  {
    name: "Laporan Pendapatan",
    href: "/admin/dashboard/laporan",
    icon: BarChart3, // TAMBAHKAN INI: Menghubungkan ke halaman laporan terfilter
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <>
      {/* --- TOMBOL HAMBURGER (Mobile Light Mode) --- */}
      <div className="md:hidden fixed top-6 left-6 z-[60]">
        <button
          onClick={toggleSidebar}
          className="p-3 bg-slate-900 text-white rounded-2xl shadow-md active:scale-95 transition-all"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* --- BACKDROP / OVERLAY (Mobile) --- */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[40] md:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* --- SIDEBAR CONTAINER (PREMIUM SOLID SLATE DARK-MODE) --- */}
      <aside
        className={`
        fixed inset-y-0 left-0 z-[50] w-72 bg-[#1E293B] border-r border-slate-800 
        transform transition-transform duration-300 ease-in-out antialiased shadow-xl
        ${isOpen ? "translate-x-0" : "-translate-x-full"} 
        md:translate-x-0 md:static
      `}
      >
        <div className="flex flex-col h-full p-8">
          {/* Logo Section */}
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center font-black text-white shadow-lg shadow-blue-600/20">
              P
            </div>
            <span className="font-bold text-xl text-white tracking-tight">
              Pixel Admin
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 space-y-2">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`
                    flex items-center gap-4 px-5 py-4 rounded-2xl transition-all group
                    ${
                      isActive
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20 font-bold"
                        : "text-slate-400 hover:bg-slate-800 hover:text-white"
                    }
                  `}
                >
                  <link.icon
                    size={20}
                    className={
                      isActive
                        ? "text-white"
                        : "text-slate-400 group-hover:text-white transition-colors"
                    }
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                  <span className={`text-xs font-bold uppercase tracking-wide`}>
                    {link.name}
                  </span>
                </Link>
              );
            })}
          </nav>

          {/* Footer / Logout */}
          <div className="pt-8 border-t border-slate-800">
            <button className="flex items-center gap-4 px-5 py-4 w-full text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-2xl transition-all group text-xs font-bold uppercase tracking-wide">
              <LogOut
                size={20}
                className="text-slate-400 group-hover:text-red-400 transition-colors"
              />
              <span>Keluar</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
