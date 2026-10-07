"use client";

import { useState } from "react";
import {
  addCategory,
  categoryUsage,
  deleteCategory,
  getCategories,
  getParents,
  getSubs,
  renameCategory,
  type ArticleLang,
  type Category,
} from "@/lib/adminStore";
import { toFa } from "@/lib/fa";

function SubRow({
  cat,
  usage,
  editingId,
  editName,
  setEditName,
  editSlug,
  setEditSlug,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  confirmId,
  setConfirmId,
  onRemove,
  onError,
}: {
  cat: Category;
  usage: Record<string, number>;
  editingId: string | null;
  editName: string;
  setEditName: (v: string) => void;
  editSlug: string;
  setEditSlug: (v: string) => void;
  onStartEdit: (c: Category) => void;
  onSaveEdit: (c: Category) => void;
  onCancelEdit: () => void;
  confirmId: string | null;
  setConfirmId: (v: string | null) => void;
  onRemove: (c: Category) => void;
  onError: (v: string | null) => void;
}) {
  const used = usage[cat.name] ?? 0;
  const isEditing = editingId === cat.id;
  const isParent = cat.parentId === null;

  return (
    <li
      className={`flex items-center gap-2 rounded-2xl border border-white/5 bg-white/[0.02] px-3 py-2.5 ${
        !isParent ? "ms-6 border-r-2 border-r-[#00c8ff]/30" : ""
      }`}
    >
      {isEditing ? (
        <>
          <span className="min-w-0 flex-1 space-y-1.5">
          <input
            value={editName}
            onChange={(e) => {
              setEditName(e.target.value);
              onError(null);
            }}
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                onSaveEdit(cat);
              }
              if (e.key === "Escape") onCancelEdit();
            }}
            placeholder="نام جدید"
            className="w-full rounded-lg border border-[#39f77b]/40 bg-white/[0.03] px-3 py-1.5 text-xs text-white outline-none placeholder:text-white/30"
          />
          {!isParent && (
            <input
              value={editSlug}
              onChange={(e) => {
                setEditSlug(e.target.value);
                onError(null);
              }}
              placeholder="نامک لاتین (slug)"
              dir="ltr"
              className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-left text-[11px] text-white outline-none placeholder:text-white/30"
            />
          )}
        </span>
      ) : (
          <button
            type="button"
            onClick={() => onSaveEdit(cat)}
            className="shrink-0 rounded-lg bg-[#39f77b] px-3 py-1.5 text-[10px] font-extrabold text-[#031008]"
          >
            ذخیره
          </button>
          <button
            type="button"
            onClick={onCancelEdit}
            className="shrink-0 rounded-lg border border-white/10 px-3 py-1.5 text-[10px] font-bold text-white/60"
          >
            انصراف
          </button>
        </>
      ) : (
        <>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-xs font-bold text-white">
              {!isParent && <span className="text-[#00c8ff]">↳ </span>}
              {cat.name}
            </span>
            <span className="mt-1 flex items-center gap-1.5 text-[10px] text-white/35">
              {isParent ? (
                <span className="rounded bg-white/10 px-1.5 py-0.5 font-bold text-white/55">
                  والد • غیرقابل انتخاب
                </span>
              ) : (
                <>
                  <span
                    className={`rounded px-1.5 py-0.5 font-bold ${
                      cat.lang === "fa" ? "bg-[#39f77b]/10 text-[#39f77b]" : "bg-[#00c8ff]/10 text-[#00c8ff]"
                    }`}
                  >
                    {cat.lang === "fa" ? "فارسی" : "انگلیسی"}
                  </span>
                  <span dir="ltr" className="rounded bg-white/5 px-1.5 py-0.5 font-mono">
                    /{cat.slug}
                  </span>
                  <span>{toFa(used)} مقاله</span>
                </>
              )}
            </span>
          </span>
          {confirmId === cat.id ? (
            <span className="flex shrink-0 gap-1.5">
              <button
                type="button"
                onClick={() => onRemove(cat)}
                className="rounded-lg bg-red-500 px-2.5 py-1 text-[10px] font-extrabold text-white"
              >
                حذف قطعی
              </button>
              <button
                type="button"
                onClick={() => setConfirmId(null)}
                className="rounded-lg border border-white/10 px-2.5 py-1 text-[10px] font-bold text-white/60"
              >
                نه
              </button>
            </span>
          ) : (
            <span className="flex shrink-0 gap-1.5">
              <button
                type="button"
                onClick={() => onStartEdit(cat)}
                className="rounded-lg border border-white/10 px-2.5 py-1 text-[10px] font-bold text-white/60 transition hover:border-[#00c8ff]/40 hover:text-[#00c8ff]"
              >
                ویرایش
              </button>
              <button
                type="button"
                onClick={() => {
                  onError(null);
                  onCancelEdit();
                  setConfirmId(cat.id);
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
}

export default function CategoryManager({ onClose }: { onClose: () => void }) {
  const [cats, setCats] = useState<Category[]>(() => getCategories());
  const [usage, setUsage] = useState<Record<string, number>>(() => categoryUsage());
  const [name, setName] = useState("");
  const [kind, setKind] = useState<"parent" | "sub">("sub");
  const [newLang, setNewLang] = useState<ArticleLang>("fa");
  const [newParent, setNewParent] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editSlug, setEditSlug] = useState("");

  const refreshUsage = () => setUsage(categoryUsage());
  const parents = getParents(cats);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const res =
      kind === "parent"
        ? addCategory({ name, lang: null, parentId: null })
        : addCategory({ name, lang: newLang, parentId: newParent || null });
    if (!res.ok) {
      setError(res.error ?? "خطا در افزودن دسته.");
      return;
    }
    setError(null);
    setName("");
    setCats(res.list ?? []);
    refreshUsage();
  };

  const remove = (c: Category) => {
    const res = deleteCategory(c.id);
    if (!res.ok) {
      setError(res.error ?? "خطا در حذف دسته.");
      setConfirmId(null);
      return;
    }
    setError(null);
    setConfirmId(null);
    setCats(res.list ?? []);
    refreshUsage();
  };

  const saveEdit = (c: Category) => {
    const res = renameCategory(c.id, editName, c.parentId !== null ? editSlug : undefined);
    if (!res.ok) {
      setError(res.error ?? "خطا در ویرایش دسته.");
      return;
    }
    setError(null);
    setEditingId(null);
    setEditName("");
    setEditSlug("");
    setCats(res.list ?? []);
    refreshUsage();
  };

  const rowProps = {
    usage,
    editingId,
    editName,
    setEditName,
    editSlug,
    setEditSlug,
    onStartEdit: (c: Category) => {
      setError(null);
      setConfirmId(null);
      setEditingId(c.id);
      setEditName(c.name);
      setEditSlug(c.slug);
    },
    onSaveEdit: saveEdit,
    onCancelEdit: () => setEditingId(null),
    confirmId,
    setConfirmId,
    onRemove: remove,
    onError: setError,
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

        <form onSubmit={submit} className="mt-4 space-y-2.5">
          <div className="flex gap-2">
            <input
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError(null);
              }}
              placeholder={kind === "parent" ? "نام والد جدید (مثلا باطری)..." : "نام زیردسته جدید..."}
              className="min-w-0 flex-1 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-white outline-none placeholder:text-white/30 focus:border-[#39f77b]/50"
            />
            <button
              type="submit"
              className="shrink-0 rounded-xl bg-[#39f77b] px-5 py-2.5 text-xs font-extrabold text-[#031008] transition hover:brightness-110"
            >
              + افزودن
            </button>
          </div>
          <div className="flex gap-2">
            <select
              value={kind}
              onChange={(e) => {
                setKind(e.target.value as "parent" | "sub");
                setNewParent("");
              }}
              aria-label="نوع دسته"
              className="flex-1 rounded-xl border border-white/10 bg-[#0b1722] px-3 py-2 text-[11px] text-white outline-none"
            >
              <option value="sub">زیردسته (با زبان)</option>
              <option value="parent">والد خنثی (بدون زبان)</option>
            </select>
            {kind === "sub" && (
              <>
                <select
                  value={newLang}
                  onChange={(e) => setNewLang(e.target.value as ArticleLang)}
                  aria-label="زبان زیردسته"
                  className="flex-1 rounded-xl border border-white/10 bg-[#0b1722] px-3 py-2 text-[11px] text-white outline-none"
                >
                  <option value="fa">فارسی</option>
                  <option value="en">انگلیسی</option>
                </select>
                <select
                  value={newParent}
                  onChange={(e) => setNewParent(e.target.value)}
                  aria-label="والد"
                  className="flex-[2] rounded-xl border border-white/10 bg-[#0b1722] px-3 py-2 text-[11px] text-white outline-none"
                >
                  <option value="">— انتخاب والد —</option>
                  {parents.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </>
            )}
          </div>
          {kind === "parent" && (
            <p className="text-[11px] leading-5 text-white/35">
              والد فقط ظرف گروه‌بندی است و در مقاله قابل انتخاب نیست؛ زبان را موقع ساخت زیردسته تعیین می‌کنید.
            </p>
          )}
        </form>

        {error && (
          <p className="mt-3 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-2.5 text-[11px] font-bold text-red-300">
            {error}
          </p>
        )}

        <div className="mt-4 max-h-72 space-y-2 overflow-y-auto">
          {parents.length === 0 && (
            <p className="rounded-xl bg-white/[0.02] px-3 py-4 text-center text-[11px] text-white/30">
              هنوز والدی ساخته نشده است.
            </p>
          )}
          <ul className="space-y-2">
            {parents.flatMap((p) => [p, ...getSubs(p.id, undefined, cats)]).map((c) => (
              <SubRow key={c.id} cat={c} {...rowProps} />
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
