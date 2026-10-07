"use client";

import { useRef, useState } from "react";
import { MAX_IMAGE_BYTES, fileToDataUrl, formatBytesFa } from "@/lib/imageUpload";
import { toFa } from "@/lib/fa";

export default function ImagePicker({
  value,
  onChange,
  label = "تصویر",
}: {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}) {
  const [tab, setTab] = useState<"upload" | "link">(value.startsWith("data:") ? "upload" : "link");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const pick = async (file: File | undefined) => {
    if (!file) return;
    setBusy(true);
    setError(null);
    setInfo(null);
    try {
      const img = await fileToDataUrl(file);
      onChange(img.dataUrl);
      const sizeTxt = `${img.name} • ${formatBytesFa(img.size)}`;
      setInfo(
        img.size > MAX_IMAGE_BYTES
          ? `${sizeTxt} — حجم بالاست؛ ممکن است حافظه مرورگر پر شود`
          : sizeTxt
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "خطا در خواندن فایل.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-2">
        <span className="text-[11px] font-bold text-white/50">{label}</span>
        <span className="flex gap-1.5">
          <button
            type="button"
            onClick={() => setTab("upload")}
            className={`rounded-lg px-3 py-1.5 text-[11px] font-bold transition ${
              tab === "upload" ? "bg-[#39f77b]/15 text-[#39f77b]" : "text-white/45 hover:text-white"
            }`}
          >
            آپلود از سیستم
          </button>
          <button
            type="button"
            onClick={() => setTab("link")}
            className={`rounded-lg px-3 py-1.5 text-[11px] font-bold transition ${
              tab === "link" ? "bg-[#39f77b]/15 text-[#39f77b]" : "text-white/45 hover:text-white"
            }`}
          >
            لینک
          </button>
        </span>
      </div>

      {tab === "upload" ? (
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={busy}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-white/15 bg-white/[0.02] px-4 py-3.5 text-xs font-bold text-white/60 transition hover:border-[#39f77b]/40 hover:text-[#39f77b] disabled:opacity-50"
        >
          {busy ? "در حال خواندن فایل..." : value.startsWith("data:") ? "انتخاب فایل جدید" : "انتخاب عکس از سیستم"}
        </button>
      ) : (
        <input
          value={value.startsWith("data:") ? "" : value}
          onChange={(e) => {
            onChange(e.target.value);
            setInfo(null);
            setError(null);
          }}
          placeholder="https://..."
          dir="ltr"
          className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-left text-xs text-white outline-none placeholder:text-white/30 focus:border-[#39f77b]/50"
        />
      )}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          void pick(e.target.files?.[0]);
          e.target.value = "";
        }}
      />

      {error && <p className="text-[11px] font-bold text-red-300">{error}</p>}
      {info && (
        <p className={`text-[11px] ${info.includes("حجم بالاست") ? "font-bold text-amber-300" : "text-white/40"}`}>
          {info} {info.includes("حجم بالاست") ? `(${toFa(Math.round(MAX_IMAGE_BYTES / 1024 / 1024 * 10) / 10)} مگ حد پیشنهادی)` : ""}
        </p>
      )}

      {value.trim() && (
        <div className="overflow-hidden rounded-xl border border-white/10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value.trim()} alt="پیش‌نمایش" className="max-h-48 w-full object-cover" />
        </div>
      )}
    </div>
  );
}
