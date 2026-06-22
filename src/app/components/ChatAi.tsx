// src/components/ChatAI.tsx
"use client";

import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Sparkles, Loader2 } from "lucide-react";
import { usePathname } from "next/navigation";

export default function ChatAI() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<
    Array<{ role: "user" | "model"; content: string }>
  >([
    {
      role: "model",
      content:
        "Halo! Saya Asisten Otomatis Pixel Sticker. Ada yang bisa saya bantu mengenai cek stok bahan, estimasi ukuran meter, atau harga wrapping mobil Anda hari ini?",
    },
  ]);

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Keamanan Jelas: Jangan render chatbox jika sedang membuka halaman dashboard admin
  if (pathname.startsWith("/admin")) {
    return null;
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput("");
    setIsLoading(true);

    const updatedMessages = [
      ...messages,
      { role: "user" as const, content: userMsg },
    ];
    setMessages(updatedMessages);

    try {
      // Menembak Route API Backend Groq baru kita
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updatedMessages }),
      });

      const data = await response.json();

      if (data.content) {
        setMessages([
          ...updatedMessages,
          { role: "model", content: data.content },
        ]);
      } else {
        setMessages([
          ...updatedMessages,
          {
            role: "model",
            content:
              "Maaf, saya kesulitan memproses data tersebut. Bisa diulangi?",
          },
        ]);
      }
    } catch (error) {
      console.error("Koneksi Frontend ke API Gagal:", error);
      setMessages([
        ...updatedMessages,
        {
          role: "model",
          content:
            "Koneksi ke server chatbox terputus. Mohon cek jaringan Anda.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans antialiased no-print">
      {/* --- FLOATING BUBBLE BUTTON --- */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="p-4 bg-neutral-900 text-white rounded-full shadow-xl hover:bg-black hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 border border-white/10"
        >
          <Sparkles size={18} className="text-blue-400 animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-widest pr-1">
            Tanya AI
          </span>
        </button>
      )}

      {/* --- JENDELA UTAMA BOX CHATBOX (APPLE SOLID LIGHT) --- */}
      {isOpen && (
        <div className="w-85 md:w-96 h-[500px] bg-white border border-neutral-200 shadow-2xl rounded-[2rem] flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="p-5 bg-neutral-900 text-white flex justify-between items-center">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-white/10 rounded-xl">
                <MessageSquare size={16} className="text-blue-400" />
              </div>
              <div className="text-left">
                <h3 className="text-xs font-bold uppercase tracking-wider leading-none">
                  Asisten AI Pixel
                </h3>
                <p className="text-[10px] text-neutral-400 font-medium mt-1">
                  Sistem Aktif (Groq Engine)
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 hover:bg-white/10 rounded-lg text-neutral-400 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-[#F5F5F7] scrollbar-thin scrollbar-thumb-neutral-200">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex flex-col max-w-[85%] ${msg.role === "user" ? "ml-auto items-end" : "mr-auto items-start"}`}
              >
                <div
                  className={`p-3.5 rounded-2xl text-xs leading-relaxed shadow-sm text-left whitespace-pre-line ${
                    msg.role === "user"
                      ? "bg-neutral-900 text-white rounded-br-none"
                      : "bg-white text-neutral-900 border border-neutral-200/60 rounded-bl-none"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="mr-auto items-start max-w-[85%] flex gap-2 p-3.5 bg-white border border-neutral-200 rounded-2xl rounded-bl-none shadow-sm text-xs text-neutral-400 font-medium italic">
                <Loader2 size={14} className="animate-spin text-blue-500" />
                <span>AI sedang menganalisis data...</span>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Form Input */}
          <form
            onSubmit={handleSendMessage}
            className="p-3 bg-white border-t border-neutral-100 flex gap-2"
          >
            <input
              type="text"
              value={input}
              disabled={isLoading}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Tanyakan ukuran mobil atau tipe stiker..."
              className="flex-1 bg-[#F5F5F7] border border-neutral-200 rounded-xl px-4 py-3 text-xs font-semibold text-neutral-900 outline-none focus:bg-white focus:border-blue-500 transition-all placeholder:text-neutral-400"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="p-3 bg-neutral-900 text-white rounded-xl hover:bg-black disabled:opacity-20 transition-all flex items-center justify-center shadow-sm"
            >
              <Send size={14} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
