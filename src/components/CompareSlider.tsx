"use client";

import { useState } from "react";
import type { TimelinePhoto } from "@/lib/photoTimeline";

export default function CompareSlider({ photos }: { photos: TimelinePhoto[] }) {
  const [beforeIdx, setBeforeIdx] = useState(0);
  const [afterIdx, setAfterIdx] = useState(photos.length - 1);
  const [pos, setPos] = useState(50);

  if (photos.length < 2) {
    return (
      <p className="mt-6 text-sm text-stone-500">
        비교하려면 사진이 2장 이상 필요해요. 기록을 남기면서 사진을
        추가해보세요.
      </p>
    );
  }

  const before = photos[beforeIdx];
  const after = photos[afterIdx];

  return (
    <div className="mt-4">
      <div className="flex gap-2">
        <select
          value={beforeIdx}
          onChange={(e) => setBeforeIdx(Number(e.target.value))}
          className="flex-1 rounded-lg border border-stone-300 px-2 py-1.5 text-sm"
        >
          {photos.map((p, i) => (
            <option key={i} value={i}>
              이전: {p.date} {p.label !== p.date ? `(${p.label})` : ""}
            </option>
          ))}
        </select>
        <select
          value={afterIdx}
          onChange={(e) => setAfterIdx(Number(e.target.value))}
          className="flex-1 rounded-lg border border-stone-300 px-2 py-1.5 text-sm"
        >
          {photos.map((p, i) => (
            <option key={i} value={i}>
              이후: {p.date} {p.label !== p.date ? `(${p.label})` : ""}
            </option>
          ))}
        </select>
      </div>

      <div className="relative mt-3 aspect-square w-full overflow-hidden rounded-xl bg-stone-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={before.url}
          alt="이전"
          className="absolute inset-0 h-full w-full object-cover"
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={after.url}
          alt="이후"
          className="absolute inset-0 h-full w-full object-cover"
          style={{ clipPath: `inset(0 0 0 ${pos}%)` }}
        />
        <div
          className="pointer-events-none absolute inset-y-0 w-0.5 bg-white shadow"
          style={{ left: `${pos}%` }}
        />
        <span className="absolute left-2 top-2 rounded bg-black/50 px-1.5 py-0.5 text-xs text-white">
          이전
        </span>
        <span className="absolute right-2 top-2 rounded bg-black/50 px-1.5 py-0.5 text-xs text-white">
          이후
        </span>
      </div>

      <input
        type="range"
        min={0}
        max={100}
        value={pos}
        onChange={(e) => setPos(Number(e.target.value))}
        className="mt-3 w-full"
      />
      <p className="mt-1 text-center text-xs text-stone-400">
        슬라이더를 움직여 비교해보세요
      </p>
    </div>
  );
}
