// src/components/GoogleMapEmbed.tsx
"use client";

import React from "react";

export default function GoogleMapEmbed() {
  return (
    <iframe
      src="https://maps.app.goo.gl/bAy51uewyQVuJcM86"
      width="100%"
      height="100%"
      style={{ border: 0 }}
      allowFullScreen={true}
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
      title="Lokasi Pixel Sticker Workshop"
      className="w-full h-full grayscale-[15%] contrast-[105%] group-hover:grayscale-0 transition-all duration-500"
    />
  );
}
