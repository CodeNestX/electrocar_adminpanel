"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  getNotifRead,
  markAllNotifRead,
  searchAll,
} from "@/lib/adminStore";
import type { SearchResultItem } from "@/lib/adminStore";
import { mockNotifications } from "@/data/adminMock";

const kindLabel: Record<SearchResultItem["kind"], string> = {
  article: "مقاله",
  user: "کاربر",
  message: "پیام",
  admin: "ادمین",
};

export default function AdminTopbar({
  title,
  subtitle,
  onMenu,
}: {
  title: string;
  subtitle: string;
  onMenu: () => void;
}) {
  const [q, setQ] = useState("");
  const [searchFocus, setSearchFocus] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [readIds, setReadIds] = useState<string[]>(() => getNotifRead());
  const wrapRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const results = useMemo(
    () => (q.trim().length >= 2 ? searchAll(q) : []),
    [q]
  );

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setSearchFocus(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSearchFocus(false);
        setNotifOpen(false);
      }
    };
    window.addEventListener("mousedown", onClick);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onClick);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  const unread = mockNotifications.filter((n) => !readIds.includes(n.id));

  const markAll = () => {
    const ids = mockNotifications.map((n) => n.id);
    setReadIds(ids);
    markAllNotifRead(ids);
  };

  return (
    <header className="sticky top-0 z-30 border-b border-white/5 bg-[#050b11]/90 backdrop-blur-xl">
      <div className="flex h-[68px] items-center gap-3 px-4 sm:px-6">
        {/* دکمه منوی موبایل */}
        <button
          type="button"
          onClick={onMenu}
          aria-label="باز کردن منو"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.02] text-gray-300 transition hover:border-[#39f77b]/40 hover:text-[#39f77b] lg:hidden"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M4 7h16" />
            <path d="M4 12h16" />
            <path d="M4 17h16" />
          </svg>
        </button>

        <div className="min-w-0 flex-1">
          <h1 className="truncate text-base font-extrabold text-white sm:text-lg">{title}</h1>
          <p className="hidden truncate text-[11px] text-white/40 sm:block">{subtitle}</p>
        </div>

        {/* سرچ‌بار */}
        <div ref={wrapRef} className="relative hidden w-full max-w-sm md:block">
          <div
            className={`flex items-center gap-2 rounded-2xl border bg-white/[0.03] px-3 transition ${
              searchFocus ? "border-[#39f77b]/40" : "border-white/10"
            }`}
          >
            <svg className="h-4.5 w-4.5 shrink-0 text-[#39f77b]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-4-4" />
            </svg>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onFocus={() => setSearchFocus(true)}
              placeholder="جستجو در مقالات، کاربران، پیام‌ها..."
              className="w-full bg-transparent py-2.5 text-sm text-white outline-none placeholder:text-white/30"
            />
            {q && (
              <button
                type="button"
                onClick={() => setQ("")}
                aria-label="پاک کردن جستجو"
                className="text-white/30 transition hover:text-white"
              >
                ✕
              </button>
            )}
          </div>

          {searchFocus && q.trim().length >= 2 && (
            <div className="absolute left-0 right-0 top-full mt-2 overflow-hidden rounded-2xl border border-white/10 bg-[#071019] shadow-2xl">
              {results.length === 0 ? (
                <p className="px-4 py-5 text-center text-xs text-white/40">نتیجه‌ای پیدا نشد.</p>
              ) : (
                <ul className="max-h-80 overflow-y-auto p-2">
                  {results.map((r) => (
                    <li key={r.id}>
                      <Link
                        href={r.href}
                        onClick={() => {
                          setSearchFocus(false);
                          setQ("");
                        }}
                        className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition hover:bg-[#39f77b]/5"
                      >
                        <span className="rounded-lg bg-[#39f77b]/10 px-2 py-1 text-[10px] font-bold text-[#39f77b]">
                          {kindLabel[r.kind]}
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate text-xs font-bold text-white">{r.title}</span>
                          <span className="block truncate text-[11px] text-white/40">{r.sub}</span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        {/* آیکن نوتیفیکیشن */}
        <div ref={notifRef} className="relative shrink-0">
          <button
            type="button"
            onClick={() => setNotifOpen((v) => !v)}
            aria-label="اعلان‌ها"
            aria-expanded={notifOpen}
            className={`relative flex h-10 w-10 items-center justify-center rounded-full border transition ${
              notifOpen
                ? "border-[#39f77b]/40 bg-[#39f77b]/10 text-[#39f77b]"
                : "border-white/10 text-gray-300 hover:border-[#39f77b]/40 hover:text-[#39f77b]"
            }`}
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M6 9a6 6 0 1 1 12 0c0 5 2 6 2 6H4s2-1 2-6" strokeLinejoin="round" />
              <path d="M10 19a2 2 0 0 0 4 0" strokeLinecap="round" />
            </svg>
            {unread.length > 0 && (
              <span className="absolute -left-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#39f77b] px-1 text-[10px] font-extrabold text-[#06100a]">
                {unread.length}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute left-0 top-full mt-2 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-white/10 bg-[#071019] shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/5 px-4 py-3">
                <p className="text-sm font-bold text-white">اعلان‌ها</p>
                <button type="button" onClick={markAll} className="text-[11px] font-bold text-[#39f77b] hover:underline">
                  علامت خوانده‌شده به همه
                </button>
              </div>
              <ul className="max-h-80 overflow-y-auto p-2">
                {mockNotifications.map((n) => {
                  const isRead = readIds.includes(n.id);
                  return (
                    <li
                      key={n.id}
                      className={`rounded-xl px-3 py-2.5 transition ${isRead ? "opacity-60" : "bg-[#39f77b]/[0.04]"}`}
                    >
                      <p className="flex items-center gap-2 text-xs font-bold text-white">
                        {!isRead && <span className="h-1.5 w-1.5 rounded-full bg-[#39f77b]" />}
                        {n.title}
                      </p>
                      <p className="mt-1 line-clamp-2 text-[11px] leading-5 text-white/50">{n.text}</p>
                      <p className="mt-1 text-[10px] text-white/30">{n.time}</p>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* سرچ موبایل */}
      <div className="border-t border-white/5 px-4 py-2 md:hidden">
        <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3">
          <svg className="h-4 w-4 shrink-0 text-[#39f77b]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-4-4" />
          </svg>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="جستجو..."
            className="w-full bg-transparent py-2 text-sm text-white outline-none placeholder:text-white/30"
          />
        </div>
        {q.trim().length >= 2 && (
          <ul className="mt-2 space-y-1 pb-1">
            {results.map((r) => (
              <li key={r.id}>
                <Link
                  href={r.href}
                  onClick={() => setQ("")}
                  className="flex items-center gap-2 rounded-lg bg-white/[0.03] px-3 py-2 text-xs text-white"
                >
                  <span className="rounded bg-[#39f77b]/10 px-1.5 py-0.5 text-[10px] font-bold text-[#39f77b]">
                    {kindLabel[r.kind]}
                  </span>
                  <span className="truncate">{r.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </header>
  );
}
