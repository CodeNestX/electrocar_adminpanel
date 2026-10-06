"use client";

import { useState } from "react";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { getAdmins, saveAdmins } from "@/lib/adminStore";
import type { AdminRole, MockAdmin } from "@/data/adminMock";

const roleLabel: Record<AdminRole, string> = { super: "مدیر ارشد", editor: "ویراستار" };

export default function AdminsPage() {
  const { user } = useAdminAuth();
  const [list, setList] = useState<MockAdmin[]>(() => getAdmins());
  const [modal, setModal] = useState<null | { editing: MockAdmin | null }>(null);
  const [form, setForm] = useState({ name: "", username: "", password: "", email: "", role: "editor" as AdminRole });

  if (user?.role !== "super") {
    return (
      <div className="ev-card rounded-2xl p-10 text-center">
        <p className="text-sm font-extrabold text-white">دسترسی محدود است</p>
        <p className="mt-2 text-xs leading-6 text-white/45">
          مدیریت ادمین‌ها فقط برای مدیر ارشد فعال است. با حساب <span dir="ltr">admin / 123456</span> وارد شوید.
        </p>
      </div>
    );
  }

  const persist = (next: MockAdmin[]) => {
    setList(next);
    saveAdmins(next);
  };

  const openCreate = () => {
    setForm({ name: "", username: "", password: "", email: "", role: "editor" });
    setModal({ editing: null });
  };

  const openEdit = (a: MockAdmin) => {
    setForm({ name: a.name, username: a.username, password: a.password, email: a.email, role: a.role });
    setModal({ editing: a });
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.username.trim() || !form.password.trim()) return;
    if (modal?.editing) {
      persist(list.map((a) => (a.id === modal.editing!.id ? { ...a, ...form, name: form.name.trim(), username: form.username.trim() } : a)));
    } else {
      if (list.some((a) => a.username === form.username.trim())) return;
      const next: MockAdmin = {
        id: Date.now(),
        name: form.name.trim(),
        username: form.username.trim(),
        password: form.password.trim(),
        email: form.email.trim(),
        role: form.role,
        active: true,
        lastLogin: "—",
      };
      persist([next, ...list]);
    }
    setModal(null);
  };

  return (
    <div className="space-y-4">
      <div className="ev-card flex items-center rounded-2xl p-4">
        <p className="text-xs text-white/45">فقط مدیر ارشد می‌تواند ادمین اضافه یا غیرفعال کند.</p>
        <button
          type="button"
          onClick={openCreate}
          className="ms-auto rounded-xl bg-[#39f77b] px-5 py-2.5 text-xs font-extrabold text-[#031008] transition hover:brightness-110"
        >
          + ادمین جدید
        </button>
      </div>

      <div className="ev-card overflow-hidden rounded-2xl">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-right text-xs">
            <thead>
              <tr className="border-b border-white/5 text-white/40">
                <th className="px-5 py-3 font-bold">ادمین</th>
                <th className="px-5 py-3 font-bold">نام کاربری</th>
                <th className="px-5 py-3 font-bold">نقش</th>
                <th className="px-5 py-3 font-bold">آخرین ورود</th>
                <th className="px-5 py-3 font-bold">وضعیت</th>
                <th className="px-5 py-3 font-bold">اقدام</th>
              </tr>
            </thead>
            <tbody>
              {list.map((a) => (
                <tr key={a.id} className="border-b border-white/5 last:border-0">
                  <td className="px-5 py-3">
                    <span className="flex items-center gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#00c8ff] to-[#39f77b] text-xs font-extrabold text-[#041009]">
                        {a.name.trim().charAt(0)}
                      </span>
                      <span>
                        <span className="block font-bold text-white">{a.name}</span>
                        <span className="block text-[10px] text-white/35" dir="ltr">
                          {a.email}
                        </span>
                      </span>
                    </span>
                  </td>
                  <td className="px-5 py-3 text-white/60" dir="ltr">
                    {a.username}
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
                        a.role === "super" ? "bg-violet-400/10 text-violet-300" : "bg-[#00c8ff]/10 text-[#00c8ff]"
                      }`}
                    >
                      {roleLabel[a.role]}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-white/55">{a.lastLogin}</td>
                  <td className="px-5 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
                        a.active ? "bg-[#39f77b]/10 text-[#39f77b]" : "bg-red-500/10 text-red-300"
                      }`}
                    >
                      {a.active ? "فعال" : "غیرفعال"}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <span className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openEdit(a)}
                        className="rounded-lg border border-white/10 px-3 py-1.5 font-bold text-white/70 transition hover:border-[#00c8ff]/40 hover:text-[#00c8ff]"
                      >
                        ویرایش
                      </button>
                      <button
                        type="button"
                        disabled={a.id === user?.id}
                        onClick={() => persist(list.map((x) => (x.id === a.id ? { ...x, active: !x.active } : x)))}
                        className="rounded-lg border border-white/10 px-3 py-1.5 font-bold text-white/70 transition hover:border-red-400/40 hover:text-red-300 disabled:opacity-30"
                      >
                        {a.active ? "غیرفعال" : "فعال‌سازی"}
                      </button>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <form onSubmit={submit} className="ev-card w-full max-w-md rounded-3xl p-6">
            <h2 className="text-base font-extrabold text-white">{modal.editing ? "ویرایش ادمین" : "ادمین جدید"}</h2>
            <div className="mt-4 space-y-3">
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="نام و نام خانوادگی"
                className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-white outline-none placeholder:text-white/30 focus:border-[#39f77b]/50"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  placeholder="نام کاربری"
                  dir="ltr"
                  className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-left text-sm text-white outline-none placeholder:text-white/30 focus:border-[#39f77b]/50"
                />
                <input
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="رمز عبور"
                  dir="ltr"
                  className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-left text-sm text-white outline-none placeholder:text-white/30 focus:border-[#39f77b]/50"
                />
              </div>
              <input
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="ایمیل"
                dir="ltr"
                className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-left text-sm text-white outline-none placeholder:text-white/30 focus:border-[#39f77b]/50"
              />
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value as AdminRole })}
                className="w-full rounded-xl border border-white/10 bg-[#0b1722] px-4 py-2.5 text-sm text-white outline-none"
              >
                <option value="editor">ویراستار</option>
                <option value="super">مدیر ارشد</option>
              </select>
            </div>
            <div className="mt-5 flex gap-2">
              <button type="submit" className="flex-1 rounded-xl bg-[#39f77b] py-3 text-sm font-extrabold text-[#031008] transition hover:brightness-110">
                ذخیره
              </button>
              <button
                type="button"
                onClick={() => setModal(null)}
                className="rounded-xl border border-white/10 px-6 py-3 text-sm font-bold text-white/60"
              >
                انصراف
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
