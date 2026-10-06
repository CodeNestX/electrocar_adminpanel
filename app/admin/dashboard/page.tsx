"use client";

import { useState } from "react";
import Link from "next/link";
import StatCard from "@/components/admin/StatCard";
import AdminChart from "@/components/admin/AdminChart";
import { mockVisits } from "@/data/adminMock";
import { getArticles, getMessages, getUsers } from "@/lib/adminStore";
import { toFa } from "@/lib/fa";

export default function DashboardPage() {
  const [articles] = useState(() => getArticles());
  const [messages] = useState(() => getMessages());
  const [users] = useState(() => getUsers());

  const unread = messages.filter((m) => !m.read).length;
  const published = articles.filter((a) => a.status === "published").length;
  const totalViews = articles.reduce((s, a) => s + a.views, 0);

  return (
    <div className="space-y-5">
      {/* کارت‌های آماری */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="کل مقالات"
          value={toFa(articles.length)}
          hint={`${toFa(published)} منتشرشده • ${toFa(articles.length - published)} پیش‌نویس`}
          accent="green"
          icon={
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M5 4h14v12H9l-4 4V4Z" strokeLinejoin="round" />
              <path d="M9 8h6M9 11h4" strokeLinecap="round" />
            </svg>
          }
        />
        <StatCard
          title="کاربران"
          value={toFa(users.length)}
          hint={`${toFa(users.filter((u) => u.status === "active").length)} فعال`}
          accent="blue"
          icon={
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="12" cy="8" r="3.4" />
              <path d="M5 20c.8-3.4 3.4-5 7-5s6.2 1.6 7 5" strokeLinecap="round" />
            </svg>
          }
        />
        <StatCard
          title="پیام‌های خوانده‌نشده"
          value={toFa(unread)}
          hint={`از مجموع ${toFa(messages.length)} پیام`}
          accent="amber"
          icon={
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <rect x="3" y="5" width="18" height="14" rx="2" />
              <path d="m4 7 8 6 8-6" strokeLinejoin="round" />
            </svg>
          }
        />
        <StatCard
          title="مجموع بازدید مقالات"
          value={toFa(totalViews)}
          hint="از ابتدای انتشار"
          accent="violet"
          icon={
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M3 12s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9-6-9-6Z" strokeLinejoin="round" />
              <circle cx="12" cy="12" r="2.5" />
            </svg>
          }
        />
      </div>

      <AdminChart points={mockVisits} />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {/* آخرین مقالات */}
        <div className="ev-card rounded-2xl p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-white">آخرین مقالات</h3>
            <Link href="/admin/articles" className="text-[11px] font-bold text-[#39f77b] hover:underline">
              مدیریت مقالات ‹
            </Link>
          </div>
          <ul className="space-y-3">
            {articles.slice(0, 4).map((a) => (
              <li key={a.id} className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-2.5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={a.image} alt="" className="h-12 w-16 shrink-0 rounded-lg object-cover" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-xs font-bold text-white">{a.title}</span>
                  <span className="mt-1 block text-[10px] text-white/35">
                    {a.category} • {toFa(a.views)} بازدید • {a.status === "published" ? "منتشرشده" : "پیش‌نویس"}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* آخرین پیام‌ها */}
        <div className="ev-card rounded-2xl p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-white">آخرین پیام‌ها</h3>
            <Link href="/admin/messages" className="text-[11px] font-bold text-[#39f77b] hover:underline">
              صندوق پیام‌ها ‹
            </Link>
          </div>
          <ul className="space-y-3">
            {messages.slice(0, 4).map((m) => (
              <li key={m.id} className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
                <p className="flex items-center gap-2 text-xs font-bold text-white">
                  {!m.read && <span className="h-1.5 w-1.5 rounded-full bg-[#39f77b]" />}
                  <span className="truncate">{m.subject}</span>
                </p>
                <p className="mt-1 truncate text-[11px] text-white/40">
                  {m.name} • {m.date}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* کاربران اخیر */}
      <div className="ev-card overflow-hidden rounded-2xl">
        <div className="flex items-center justify-between p-5 pb-3">
          <h3 className="text-sm font-extrabold text-white">کاربران اخیر</h3>
          <Link href="/admin/users" className="text-[11px] font-bold text-[#39f77b] hover:underline">
            همه کاربران ‹
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-right text-xs">
            <thead>
              <tr className="border-y border-white/5 text-white/40">
                <th className="px-5 py-3 font-bold">نام</th>
                <th className="px-5 py-3 font-bold">ایمیل</th>
                <th className="px-5 py-3 font-bold">عضویت</th>
                <th className="px-5 py-3 font-bold">وضعیت</th>
              </tr>
            </thead>
            <tbody>
              {users.slice(0, 5).map((u) => (
                <tr key={u.id} className="border-b border-white/5 last:border-0">
                  <td className="px-5 py-3 font-bold text-white">{u.name}</td>
                  <td className="px-5 py-3 text-white/50" dir="ltr">
                    {u.email}
                  </td>
                  <td className="px-5 py-3 text-white/50">{u.joined}</td>
                  <td className="px-5 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
                        u.status === "active" ? "bg-[#39f77b]/10 text-[#39f77b]" : "bg-red-500/10 text-red-300"
                      }`}
                    >
                      {u.status === "active" ? "فعال" : "مسدود"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
