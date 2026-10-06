"use client";

import { useState } from "react";
import {
  addCategory,
  categoryUsage,
  deleteCategory,
  getCategories,
  renameCategory,
} from "@/lib/adminStore";
import { toFa } from "@/lib/fa";

export default function CategoryManager({ onClose }: { onClose: () => void }) {
  const [cats, setCats] = useState<string[]>(() => getCategories());
  const [usage, setUsage] = useState<Record<string, number>>(() => categoryUsage());
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const refreshUsage = () => setUsage(categoryUsage());

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const res = addCategory(name);
    if (!res.ok) {
      setError(res.error ?? "خطا در افزودن دسته.");
      return;
    }
    setError(null);
    setName("");
    setCats(res.list ?? []);
    refreshUsage();
  };

  const remove = (c: string) => {
    const res = deleteCategory(c);
    if (!res.ok) {
      setError(res.error ?? "خطا در حذف دسته.");
      setConfirm(null);
      return;
    }
    setError(null);
    setConfirm(null);
    setCats(res.list ?? []);
    refreshUsage();
  };

  const startEdit = (c: string) => {
    setError(null);
    setConfirm(null);
    setEditing(c);
    setEditName(c);
  };

  const saveEdit = (oldName: string) => {
    const res = renameCategory(oldName, editName);
    if (!res.ok) {
      setError(res.error ?? "خطا در ویرایش دسته.");
      return;
    }
    setError(null);
    setEditing(null);
    setEditName("");
    setCats(res.list ?? []);
    refreshUsage();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="ev-card w-full max-w-md rounded-3xl p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-extrabold text-white">مدیریت دسته‌بندی‌ها</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="بستن"
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 text-white/50 transition hover:text-white"
          >
            ✕
          </button>
        </div>

        <form onSubmit={submit} className="mt-4 flex gap-2">
          <input
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError(null);
            }}
            placeholder="نام دسته جدید..."
            className="min-w-0 flex-1 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-white outline-none placeholder:text-white/30 focus:border-[#39f77b]/50"
          />
          <button
            type="submit"
            className="shrink-0 rounded-xl bg-[#39f77b] px-5 py-2.5 text-xs font-extrabold text-[#031008] transition hover:brightness-110"
          >
            + افزودن
          </button>
        </form>

        {error && (
          <p className="mt-3 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-2.5 text-[11px] font-bold text-red-300">
            {error}
          </p>
        )}

        <ul className="mt-4 max-h-72 space-y-2 overflow-y-auto">
          {cats.map((c) => {
            const used = usage[c] ?? 0;
            const isEditing = editing === c;
            return (
              <li
                key={c}
                className="flex items-center gap-2 rounded-2xl border border-white/5 bg-white/[0.02] px-3 py-2.5"
              >
                {isEditing ? (
                  <>
                    <input
                      value={editName}
                      onChange={(e) => {
                        setEditName(e.target.value);
                        setError(null);
                      }}
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          saveEdit(c);
                        }
                        if (e.key === "Escape") setEditing(null);
                      }}
                      placeholder="نام جدید دسته"
                      className="min-w-0 flex-1 rounded-lg border border-[#39f77b]/40 bg-white/[0.03] px-3 py-1.5 text-xs text-white outline-none placeholder:text-white/30"
                    />
                    <button
                      type="button"
                      onClick={() => saveEdit(c)}
                      className="shrink-0 rounded-lg bg-[#39f77b] px-3 py-1.5 text-[10px] font-extrabold text-[#031008]"
                    >
                      ذخیره
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditing(null)}
                      className="shrink-0 rounded-lg border border-white/10 px-3 py-1.5 text-[10px] font-bold text-white/60"
                    >
                      انصراف
                    </button>
                  </>
                ) : (
                  <>
                    <span className="min-w-0 flex-1 truncate text-xs font-bold text-white">{c}</span>
                    <span className="shrink-0 rounded-full bg-white/5 px-2 py-0.5 text-[10px] text-white/45">
                      {toFa(used)} مقاله
                    </span>
                    {confirm === c ? (
                      <span className="flex shrink-0 gap-1.5">
                        <button
                          type="button"
                          onClick={() => remove(c)}
                          className="rounded-lg bg-red-500 px-2.5 py-1 text-[10px] font-extrabold text-white"
                        >
                          حذف قطعی
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirm(null)}
                          className="rounded-lg border border-white/10 px-2.5 py-1 text-[10px] font-bold text-white/60"
                        >
                          نه
                        </button>
                      </span>
                    ) : (
                      <span className="flex shrink-0 gap-1.5">
                        <button
                          type="button"
                          onClick={() => startEdit(c)}
                          className="rounded-lg border border-white/10 px-2.5 py-1 text-[10px] font-bold text-white/60 transition hover:border-[#00c8ff]/40 hover:text-[#00c8ff]"
                        >
                          ویرایش
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setError(null);
                            setEditing(null);
                            setConfirm(c);
                          }}
                          className="rounded-lg border border-white/10 px-2.5 py-1 text-[10px] font-bold text-white/60 transition hover:border-red-400/40 hover:text-red-300"
                        >
                          حذف
                        </button>
                      </span>
                    )}
                  </>
                )}
              </li>
            );
          })}
          {cats.length === 0 && (
            <li className="py-6 text-center text-xs text-white/40">دسته‌ای وجود ندارد.</li>
          )}
        </ul>
      </div>
    </div>
  );
}
