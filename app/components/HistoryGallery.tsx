"use client";

import { useState } from "react";
import { sitePath } from "../utils/sitePath";

type Photo = { src: string; alt: string; width: number; height: number };

export function HistoryGallery({ images }: { images: Photo[] }) {
  const [selected, setSelected] = useState(0);
  const current = images[selected];
  if (!current) return null;
  return (
    <div className="history-gallery">
      <div className="history-gallery-main" aria-live="polite">
        <img src={sitePath(current.src)} width={current.width} height={current.height}
          alt={current.alt} loading="lazy" decoding="async" />
      </div>
      <div className="history-gallery-thumbnails" role="group" aria-label="選擇歷史照片">
        {images.map((photo, index) => (
          <button key={photo.src} type="button" aria-label={photo.alt}
            aria-pressed={selected === index} onClick={() => setSelected(index)}>
            <img src={sitePath(photo.src.replace(".webp", "-768.webp"))}
              width={photo.width} height={photo.height} alt="" loading="lazy" decoding="async" />
          </button>
        ))}
      </div>
    </div>
  );
}
