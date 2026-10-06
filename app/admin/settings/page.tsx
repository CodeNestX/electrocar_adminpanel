"use client";

import { useState } from "react";
import { getSettings, saveSettings } from "@/lib/adminStore";
import type { SiteSettings } from "@/data/adminMock";

function Toggle({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!on)}
      aria-pressed={on}
      className="flex w-full items-center justify-between rounded-2xl border border-white/5 bg-white/[0.02] px-4 py-3.5 transition hover:border-white/10"
    >
      <span className="text-xs font-bold text-white">{label}</span>
      <span className={`relative h-6 w-11 shrink-0 rounded-full transition ${on ? "bg-[#39f77b]" : "bg-white/10"}`}>
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${on ? "left-0.5" : "left-[22px]"}`}
        />
      </span>
    </button>
  );
}

export default function SettingsPage() {
  const [form, setForm] = useState<SiteSettings | null>(() => getSettings());
  const [saved, setSaved] = useState(false);

  if (!form) return <p className="py-10 text-center text-sm text-white/40">در حال بارگذاری...</p>;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    saveSettings(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <form onSubmit={submit} className="grid grid-cols-1 gap-4 xl:grid-cols-2">
      <div className="ev-card space-y-3 rounded-2xl p-5">
        <h2 className="text-sm font-extrabold text-white">مشخصات عمومی</h2>
        <div>
          <label className="mb-1.5 block text-[11px] font-bold text-white/50">نام سایت</label>
          <input
            value={form.siteName}
            onChange={(e) => setForm({ ...form, siteName: e.target.value })}
            className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-white outline-none focus:border-[#39f77b]/50"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-[11px] font-bold text-white/50">توضیح کوتاه</label>
          <textarea
            value={form.siteDesc}
            onChange={(e) => setForm({ ...form, siteDesc: e.target.value })}
            rows={3}
            className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm leading-7 text-white outline-none focus:border-[#39f77b]/50"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-[11px] font-bold text-white/50">ایمیل پشتیبانی</label>
          <input
            value={form.supportEmail}
            onChange={(e) => setForm({ ...form, supportEmail: e.target.value })}
            dir="ltr"
            className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-left text-sm text-white outline-none focus:border-[#39f77b]/50"
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="ev-card space-y-2.5 rounded-2xl p-5">
          <h2 className="mb-1 text-sm font-extrabold text-white">رفتار سایت</h2>
          <Toggle on={form.allowComments} onChange={(v) => setForm({ ...form, allowComments: v })} label="اجازه ثبت دیدگاه" />
          <Toggle on={form.notifyNewMessage} onChange={(v) => setForm({ ...form, notifyNewMessage: v })} label="اعلان پیام جدید" />
          <Toggle on={form.maintenance} onChange={(v) => setForm({ ...form, maintenance: v })} label="حالت تعمیر و نگهداری" />
        </div>

        <button
          type="submit"
          className="w-full rounded-2xl bg-[#39f77b] py-3.5 text-sm font-extrabold text-[#031008] transition hover:brightness-110"
        >
          ذخیره تنظیمات
        </button>
        {saved && (
          <p className="rounded-2xl border border-[#39f77b]/25 bg-[#39f77b]/[0.06] px-4 py-3 text-center text-xs font-bold text-[#39f77b]">
            تنظیمات با موفقیت ذخیره شد.
          </p>
        )}
      </div>
    </form>
  );
}
