"use client";

import { blockMeta, newBlock, type ArticleBlock, type BlockType } from "@/lib/articleBlocks";
import ImagePicker from "./ImagePicker";

const addOrder: BlockType[] = ["heading", "paragraph", "image", "quote", "list"];

function move(blocks: ArticleBlock[], id: string, dir: -1 | 1): ArticleBlock[] {
  const i = blocks.findIndex((b) => b.id === id);
  const j = i + dir;
  if (i < 0 || j < 0 || j >= blocks.length) return blocks;
  const next = [...blocks];
  [next[i], next[j]] = [next[j], next[i]];
  return next;
}

export default function BlockEditor({
  blocks,
  onChange,
}: {
  blocks: ArticleBlock[];
  onChange: (blocks: ArticleBlock[]) => void;
}) {
  const set = (id: string, patch: Partial<ArticleBlock>) =>
    onChange(blocks.map((b) => (b.id === id ? { ...b, ...patch } : b)));

  const add = (type: BlockType, afterId?: string) => {
    const b = newBlock(type);
    if (!afterId) return onChange([...blocks, b]);
    const i = blocks.findIndex((x) => x.id === afterId);
    if (i < 0) return onChange([...blocks, b]);
    onChange([...blocks.slice(0, i + 1), b, ...blocks.slice(i + 1)]);
  };

  const remove = (id: string) => {
    if (blocks.length <= 1) return;
    onChange(blocks.filter((b) => b.id !== id));
  };

  return (
    <div className="space-y-3">
      {blocks.map((b, i) => (
        <div
          key={b.id}
          className="rounded-2xl border border-white/10 bg-white/[0.02] p-3.5"
        >
          {/* سربرگ بلوک */}
          <div className="mb-2.5 flex items-center gap-2">
            <span className="rounded-lg bg-[#39f77b]/10 px-2 py-1 text-[10px] font-extrabold text-[#39f77b]">
              {i + 1} • {blockMeta[b.type].label}
            </span>
            {b.type !== "image" && (
              <select
                value={b.type}
                onChange={(e) => set(b.id, { type: e.target.value as BlockType })}
                aria-label="نوع بلوک"
                className="rounded-lg border border-white/10 bg-[#0b1722] px-2 py-1 text-[11px] text-white/70 outline-none"
              >
                {(["heading", "paragraph", "quote", "list"] as BlockType[]).map((t) => (
                  <option key={t} value={t}>
                    {blockMeta[t].label}
                  </option>
                ))}
              </select>
            )}
            <span className="ms-auto flex items-center gap-1">
              <button
                type="button"
                onClick={() => onChange(move(blocks, b.id, -1))}
                disabled={i === 0}
                aria-label="انتقال به بالا"
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 text-white/50 transition hover:border-[#39f77b]/40 hover:text-[#39f77b] disabled:opacity-25"
              >
                ↑
              </button>
              <button
                type="button"
                onClick={() => onChange(move(blocks, b.id, 1))}
                disabled={i === blocks.length - 1}
                aria-label="انتقال به پایین"
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 text-white/50 transition hover:border-[#39f77b]/40 hover:text-[#39f77b] disabled:opacity-25"
              >
                ↓
              </button>
              <button
                type="button"
                onClick={() => remove(b.id)}
                disabled={blocks.length <= 1}
                aria-label="حذف بلوک"
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 text-white/50 transition hover:border-red-400/40 hover:text-red-300 disabled:opacity-25"
              >
                ✕
              </button>
            </span>
          </div>

          {/* بدنه بلوک */}
          {b.type === "image" ? (
            <div className="space-y-2.5">
              <ImagePicker
                label="عکس بلوک"
                value={b.url ?? ""}
                onChange={(url) => set(b.id, { url })}
              />
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                <input
                  value={b.alt ?? ""}
                  onChange={(e) => set(b.id, { alt: e.target.value })}
                  placeholder="متن جایگزین (alt) برای سئو"
                  className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-xs text-white outline-none placeholder:text-white/30 focus:border-[#39f77b]/50"
                />
                <input
                  value={b.caption ?? ""}
                  onChange={(e) => set(b.id, { caption: e.target.value })}
                  placeholder="توضیح زیر عکس (اختیاری)"
                  className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-xs text-white outline-none placeholder:text-white/30 focus:border-[#39f77b]/50"
                />
              </div>
              {b.caption?.trim() && b.url?.trim() && (
                <p className="rounded-xl bg-black/30 px-3 py-2 text-center text-[11px] text-white/50">
                  توضیح زیر عکس: {b.caption.trim()}
                </p>
              )}
            </div>
          ) : (
            <textarea
              value={b.text}
              onChange={(e) => set(b.id, { text: e.target.value })}
              rows={b.type === "heading" ? 1 : b.type === "list" ? 3 : 3}
              placeholder={
                b.type === "heading"
                  ? "تیتر میانی..."
                  : b.type === "quote"
                    ? "جمله برجسته..."
                    : b.type === "list"
                      ? "هر آیتم در یک خط..."
                      : "متن پاراگراف..."
              }
              className={`w-full resize-y rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-sm leading-7 text-white outline-none placeholder:text-white/30 focus:border-[#39f77b]/50 ${
                b.type === "heading" ? "font-extrabold" : ""
              } ${b.type === "quote" ? "border-r-2 border-r-[#39f77b]/60" : ""}`}
            />
          )}

          {/* پیش‌نمایش زنده لیست */}
          {b.type === "list" && b.text.trim() && (
            <ul className="mt-2 list-disc space-y-1 ps-5 text-xs leading-6 text-white/60">
              {b.text.split("\n").map((l) => l.trim()).filter(Boolean).map((l, k) => (
                <li key={k}>{l}</li>
              ))}
            </ul>
          )}
        </div>
      ))}

      {/* نوار افزودن بلوک */}
      <div className="rounded-2xl border border-dashed border-[#39f77b]/25 bg-[#39f77b]/[0.03] p-3.5">
        <p className="mb-2.5 text-center text-[11px] font-bold text-white/40">افزودن بلوک جدید</p>
        <div className="flex flex-wrap justify-center gap-2">
          {addOrder.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => add(t)}
              title={blockMeta[t].hint}
              className="rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2 text-[11px] font-bold text-white/70 transition hover:border-[#39f77b]/40 hover:text-[#39f77b]"
            >
              + {blockMeta[t].label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
