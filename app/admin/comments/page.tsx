"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { getComments, saveComments } from "@/lib/adminStore";
import type { CommentStatus, MockComment } from "@/data/adminMock";
import { toFa } from "@/lib/fa";

const tabs = [
  { id: "pending", label: "در انتظار تایید" },
  { id: "approved", label: "تاییدشده" },
  { id: "rejected", label: "ردشده" },
] as const;

type Tab = (typeof tabs)[number]["id"];

const tabStyle: Record<Tab, string> = {
  pending: "bg-amber-400/10 text-amber-300",
  approved: "bg-[#39f77b]/10 text-[#39f77b]",
  rejected: "bg-red-500/10 text-red-300",
};

export default function CommentsPage() {
  const [list, setList] = useState<MockComment[]>(() => getComments());
  const [tab, setTab] = useState<Tab>("pending");
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  const persist = (next: MockComment[]) => {
    setList(next);
    saveComments(next);
  };

  const setStatus = (id: number, status: CommentStatus) =>
    persist(list.map((c) => (c.id === id ? { ...c, status } : c)));

  const remove = (id: number) => {
    persist(list.filter((c) => c.id !== id));
    setConfirmDelete(null);
  };

  const counts = useMemo(() => {
    const m: Record<Tab, number> = { pending: 0, approved: 0, rejected: 0 };
    for (const c of list) m[c.status] += 1;
    return m;
  }, [list]);

  const visible = list.filter((c) => c.status === tab);

  return (
    <div className="space-y-4">
      <div className="ev-card flex flex-wrap items-center gap-2 rounded-2xl p-3">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
              tab === t.id ? tabStyle[t.id] : "bg-white/[0.03] text-white/50 hover:text-white"
            }`}
          >
            {t.label} ({toFa(counts[t.id])})
          </button>
        ))}
        <p className="ms-auto text-[11px] text-white/40">
          دیدگاه‌ها اول به تایید شما می‌رسند، بعد منتشر می‌شوند
        </p>
      </div>

      <div className="space-y-3">
        {visible.map((c) => (
          <article key={c.id} className="ev-card rounded-2xl p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#00c8ff]/70 to-[#39f77b]/70 text-sm font-extrabold text-[#041009]">
                  {c.author.trim().charAt(0)}
                </span>
                <span>
                  <span className="block text-sm font-bold text-white">{c.author}</span>
                  <span className="mt-0.5 block text-[11px] text-white/40">
                    {c.date} • مقاله:{" "}
                    <Link
                      href={`/articles/${encodeURIComponent(c.articleSlug)}`}
                      className="text-[#00c8ff] hover:underline"
                    >
                      {c.articleTitle}
                    </Link>
                  </span>
                </span>
              </div>
              <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${tabStyle[c.status]}`}>
                {tabs.find((t) => t.id === c.status)?.label}
              </span>
            </div>

            <p className="mt-3 rounded-2xl border border-white/5 bg-white/[0.02] p-4 text-sm leading-8 text-white/75">
              {c.content}
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              {c.status !== "approved" && (
                <button
                  type="button"
                  onClick={() => setStatus(c.id, "approved")}
                  className="rounded-xl bg-[#39f77b] px-5 py-2 text-[11px] font-extrabold text-[#031008] transition hover:brightness-110"
                >
                  تایید و انتشار
                </button>
              )}
              {c.status !== "rejected" && (
                <button
                  type="button"
                  onClick={() => setStatus(c.id, "rejected")}
                  className="rounded-xl border border-amber-400/30 px-5 py-2 text-[11px] font-bold text-amber-300 transition hover:bg-amber-400/10"
                >
                  رد
                </button>
              )}
              {c.status !== "pending" && (
                <button
                  type="button"
                  onClick={() => setStatus(c.id, "pending")}
                  className="rounded-xl border border-white/10 px-5 py-2 text-[11px] font-bold text-white/60 transition hover:text-white"
                >
                  برگشت به انتظار
                </button>
              )}
              <button
                type="button"
                onClick={() => setConfirmDelete(c.id)}
                className="rounded-xl border border-white/10 px-5 py-2 text-[11px] font-bold text-white/60 transition hover:border-red-400/40 hover:text-red-300"
              >
                حذف
              </button>
            </div>
          </article>
        ))}
        {visible.length === 0 && (
          <p className="ev-card rounded-2xl p-10 text-center text-xs text-white/40">
            دیدگاهی در این بخش نیست.
          </p>
        )}
      </div>

      {confirmDelete !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="ev-card w-full max-w-sm rounded-3xl p-6 text-center">
            <p className="text-sm font-bold text-white">این دیدگاه حذف شود؟</p>
            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={() => remove(confirmDelete)}
                className="flex-1 rounded-xl bg-red-500 py-2.5 text-sm font-extrabold text-white"
              >
                حذف
              </button>
              <button
                type="button"
                onClick={() => setConfirmDelete(null)}
                className="flex-1 rounded-xl border border-white/10 py-2.5 text-sm font-bold text-white/60"
              >
                انصراف
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
