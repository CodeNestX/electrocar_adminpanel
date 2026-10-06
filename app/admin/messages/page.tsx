"use client";

import { useState } from "react";
import { getMessages, saveMessages } from "@/lib/adminStore";
import type { MockMessage } from "@/data/adminMock";
import { toFa } from "@/lib/fa";

export default function MessagesPage() {
  const [list, setList] = useState<MockMessage[]>(() => getMessages());
  const [selectedId, setSelectedId] = useState<number | null>(() => getMessages()[0]?.id ?? null);
  const [reply, setReply] = useState("");
  const [tab, setTab] = useState<"all" | "unread">("all");

  const persist = (next: MockMessage[]) => {
    setList(next);
    saveMessages(next);
  };

  const selected = list.find((m) => m.id === selectedId) ?? null;

  const openMessage = (id: number) => {
    setSelectedId(id);
    setReply("");
    persist(list.map((m) => (m.id === id ? { ...m, read: true } : m)));
  };

  const toggleRead = (id: number) => {
    persist(list.map((m) => (m.id === id ? { ...m, read: !m.read } : m)));
  };

  const remove = (id: number) => {
    const next = list.filter((m) => m.id !== id);
    persist(next);
    if (selectedId === id) setSelectedId(next[0]?.id ?? null);
  };

  const sendReply = () => {
    if (!selected || !reply.trim()) return;
    persist(list.map((m) => (m.id === selected.id ? { ...m, replied: true, read: true } : m)));
    setReply("");
  };

  const visible = list.filter((m) => (tab === "unread" ? !m.read : true));

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-[340px_1fr]">
      <div className="ev-card rounded-2xl p-3">
        <div className="mb-2 flex gap-2 p-1">
          <button
            type="button"
            onClick={() => setTab("all")}
            className={`flex-1 rounded-xl py-2 text-xs font-bold transition ${tab === "all" ? "bg-[#39f77b]/15 text-[#39f77b]" : "text-white/50 hover:text-white"}`}
          >
            همه ({toFa(list.length)})
          </button>
          <button
            type="button"
            onClick={() => setTab("unread")}
            className={`flex-1 rounded-xl py-2 text-xs font-bold transition ${tab === "unread" ? "bg-[#39f77b]/15 text-[#39f77b]" : "text-white/50 hover:text-white"}`}
          >
            خوانده‌نشده ({toFa(list.filter((m) => !m.read).length)})
          </button>
        </div>
        <ul className="max-h-[60vh] space-y-2 overflow-y-auto">
          {visible.map((m) => (
            <li key={m.id}>
              <button
                type="button"
                onClick={() => openMessage(m.id)}
                className={`w-full rounded-2xl border p-3.5 text-right transition ${
                  selectedId === m.id
                    ? "border-[#39f77b]/30 bg-[#39f77b]/[0.07]"
                    : "border-transparent bg-white/[0.02] hover:border-white/10"
                }`}
              >
                <span className="flex items-center gap-2 text-xs font-bold text-white">
                  {!m.read && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#39f77b]" />}
                  <span className="truncate">{m.subject}</span>
                </span>
                <span className="mt-1.5 line-clamp-1 block text-[11px] text-white/40">{m.body}</span>
                <span className="mt-2 flex items-center justify-between text-[10px] text-white/30">
                  <span>{m.name}</span>
                  <span>{m.date}</span>
                </span>
              </button>
            </li>
          ))}
          {visible.length === 0 && <li className="py-8 text-center text-xs text-white/40">پیامی نیست.</li>}
        </ul>
      </div>

      <div className="ev-card rounded-2xl p-5 sm:p-6">
        {!selected ? (
          <p className="py-16 text-center text-sm text-white/40">پیامی انتخاب نشده است.</p>
        ) : (
          <>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-base font-extrabold text-white">{selected.subject}</h2>
                <p className="mt-1.5 text-[11px] text-white/40">
                  از {selected.name} • <span dir="ltr">{selected.email}</span> • {selected.date}
                </p>
              </div>
              <span className="flex gap-2">
                <button
                  type="button"
                  onClick={() => toggleRead(selected.id)}
                  className="rounded-lg border border-white/10 px-3 py-1.5 text-[11px] font-bold text-white/70 transition hover:border-[#00c8ff]/40 hover:text-[#00c8ff]"
                >
                  {selected.read ? "نخوانده شود" : "خوانده شد"}
                </button>
                <button
                  type="button"
                  onClick={() => remove(selected.id)}
                  className="rounded-lg border border-white/10 px-3 py-1.5 text-[11px] font-bold text-white/70 transition hover:border-red-400/40 hover:text-red-300"
                >
                  حذف
                </button>
              </span>
            </div>

            <p className="mt-4 rounded-2xl border border-white/5 bg-white/[0.02] p-4 text-sm leading-8 text-white/75">
              {selected.body}
            </p>

            {selected.replied && (
              <p className="mt-3 rounded-xl border border-[#39f77b]/20 bg-[#39f77b]/[0.05] px-4 py-2.5 text-[11px] font-bold text-[#39f77b]">
                پاسخ این پیام ارسال شده است.
              </p>
            )}

            <div className="mt-4">
              <label className="mb-1.5 block text-xs font-bold text-white/60">پاسخ به کاربر</label>
              <textarea
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                rows={3}
                placeholder="متن پاسخ را بنویسید..."
                className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm leading-7 text-white outline-none placeholder:text-white/30 focus:border-[#39f77b]/50"
              />
              <button
                type="button"
                onClick={sendReply}
                disabled={!reply.trim()}
                className="mt-2 rounded-xl bg-[#39f77b] px-6 py-2.5 text-xs font-extrabold text-[#031008] transition hover:brightness-110 disabled:opacity-40"
              >
                ارسال پاسخ
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
