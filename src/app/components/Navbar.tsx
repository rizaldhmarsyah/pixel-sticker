"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Menu, X, User, LogOut, CalendarCheck } from "lucide-react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

const navLinks = [
  { name: "Beranda", href: "/" },
  { name: "Katalog", href: "/catalog" },
  { name: "Harga", href: "/harga" },
  { name: "Booking", href: "/booking" },
  { name: "Tentang Kami", href: "/tentang-kami" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // --- STATE UNTUK SESSION USER ---
  const [user, setUser] = useState<any>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  // 1. Cek status login user secara real-time
  useEffect(() => {
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
    };

    getSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  // 2. Deteksi scroll untuk animasi navbar menciut
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 3. Menutup dropdown jika user mengklik area luar menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Mencegah scroll pada body saat mobile menu terbuka
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isOpen]);

  // --- HANDLER LOGOUT AMAN VIA SUPABASE ---
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setDropdownOpen(false);
      router.push("/");
      router.refresh();
    } catch (err) {
      console.error("Gagal melakukan sign out:", err);
    }
  };

  // Mencegah Navbar muncul pada halaman admin
  if (pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <>
      {/* Container utama Navbar */}
      <nav
        className={`fixed left-0 right-0 z-50 flex justify-center transition-all duration-500 ease-out ${
          isScrolled ? "top-4 md:top-6 px-4" : "top-0 px-0 pt-2"
        }`}
      >
        {/* Kotak dalam Navbar */}
        <div
          className={`w-full transition-all duration-500 ease-out flex items-center justify-between ${
            isScrolled
              ? "max-w-[850px] md:max-w-[900px] bg-neutral-900/80 backdrop-blur-lg border border-white/10 rounded-full px-6 md:px-8 h-16 md:h-16 shadow-2xl"
              : "max-w-[1200px] bg-transparent border-b border-transparent px-6 sm:px-8 lg:px-12 h-20 md:h-24 rounded-none"
          }`}
        >
          {/* Tombol Mobile Menu */}
          <div className="flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-white/80 hover:text-white transition-colors p-2"
              aria-label="Toggle menu"
            >
              {isOpen ? (
                <X size={24} strokeWidth={1.5} />
              ) : (
                <Menu size={24} strokeWidth={1.5} />
              )}
            </button>
          </div>

          {/* 🎯 Logo Platform Murni - JAUH LEBIH BESAR */}
          <div className="flex-shrink-0 flex items-center justify-center md:justify-start w-full md:w-auto absolute md:static left-0 right-0 pointer-events-none md:pointer-events-auto">
            <Link
              href="/"
              className="pointer-events-auto transition-all duration-300 flex items-center h-full"
            >
              <div className="relative transition-all duration-300 flex items-center justify-center">
                <Image
                  src="/logopixelsticker.png"
                  alt="Logo Pixel Sticker"
                  // Ukuran diperbesar drastis
                  width={isScrolled ? 56 : 80}
                  height={isScrolled ? 56 : 80}
                  className="object-contain transition-all duration-300 drop-shadow-lg"
                  style={{ height: "auto" }}
                  priority
                />
              </div>
            </Link>
          </div>

          {/* Navigasi Desktop */}
          <div className="hidden md:flex items-center justify-center space-x-8 lg:space-x-12 flex-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`font-medium text-white/70 hover:text-white transition-colors tracking-wide ${
                  isScrolled ? "text-xs lg:text-sm" : "text-sm lg:text-base"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Area Ikon Profil & Dropdown */}
          <div
            className="flex items-center space-x-5 md:space-x-6 flex-shrink-0 relative"
            ref={dropdownRef}
          >
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="w-8 h-8 rounded-full border border-white/20 overflow-hidden active:scale-90 transition-transform focus:outline-none flex items-center justify-center"
                >
                  {user.user_metadata?.avatar_url ? (
                    <img
                      src={user.user_metadata.avatar_url}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-full h-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white">
                      {user.user_metadata?.full_name?.charAt(0) || "P"}
                    </div>
                  )}
                </button>

                {/* Popover Dropdown Menu */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-3 w-56 bg-neutral-950 border border-white/10 rounded-2xl shadow-2xl p-2 animate-in fade-in slide-in-from-top-2 duration-200 z-50 text-left">
                    <div className="px-3 py-2 border-b border-white/5 mb-1">
                      <p className="text-xs font-bold text-white truncate">
                        {user.user_metadata?.full_name || "Customer Pixel"}
                      </p>
                      <p className="text-[10px] text-neutral-500 truncate font-mono mt-0.5">
                        {user.email}
                      </p>
                    </div>

                    <Link
                      href="/booking/history"
                      onClick={() => setDropdownOpen(false)}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-neutral-400 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                    >
                      <CalendarCheck size={14} className="text-blue-400" />
                      <span>Riwayat Booking</span>
                    </Link>

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl transition-all font-medium mt-1"
                    >
                      <LogOut size={14} />
                      <span>Keluar Akun</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="text-white/80 hover:text-white transition-colors p-1 md:p-2"
                aria-label="Halaman Profil"
              >
                <User
                  size={isScrolled ? 18 : 22}
                  strokeWidth={1.5}
                  className="transition-all duration-300"
                />
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Overlay Menu Mobile */}
      <div
        className={`fixed inset-0 bg-black z-40 transition-all duration-300 ease-in-out md:hidden ${
          isOpen
            ? "opacity-100 visible"
            : "opacity-0 invisible pointer-events-none"
        }`}
      >
        <div className="flex flex-col px-8 pt-32 pb-8 space-y-8 h-full overflow-y-auto">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className={`text-4xl font-bold text-white/90 hover:text-white transition-transform duration-300 ${
                isOpen ? "translate-y-0" : "translate-y-8"
              }`}
            >
              {link.name}
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
