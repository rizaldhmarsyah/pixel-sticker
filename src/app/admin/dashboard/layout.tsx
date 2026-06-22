// src/app/admin/dashboard/layout.tsx
import Sidebar from "./Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-black">
      {/* Sidebar tetap ada */}
      <Sidebar />

      {/* Area Konten Utama */}
      <main className="flex-1 w-full overflow-x-hidden">
        {/* Tambahkan padding top di mobile agar tidak tertutup tombol Hamburger */}
        <div className="md:pt-0 pt-20">{children}</div>
      </main>
    </div>
  );
}
