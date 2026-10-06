"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminLogo from "@/components/admin/AdminLogo";
import { useAdminAuth } from "@/context/AdminAuthContext";

export default function AdminLoginPage() {
  const router = useRouter();
  const { user, login } = useAdminAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (user) router.replace("/admin/dashboard");
  }, [user, router]);

  if (user) return null;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const err = login(username, password);
    setBusy(false);
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    router.replace("/admin/dashboard");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#050b11] px-4">
      <div className="w-full max-w-md">
        <div className="ev-card green-glow rounded-3xl p-8">
          <div className="flex flex-col items-center text-center">
            <AdminLogo size={56} />
            <h1 className="mt-4 text-2xl font-extrabold">
              <span className="text-white">Electro</span>
              <span className="text-[#39f77b]">Car</span>
            </h1>
            <p className="mt-1 text-xs text-white/40">ورود به پنل مدیریت</p>
          </div>

          <form onSubmit={submit} className="mt-7 space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-bold text-white/60">نام کاربری</label>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="مثلا admin"
                autoComplete="username"
                className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-[#39f77b]/50"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold text-white/60">رمز عبور</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••"
                autoComplete="current-password"
                className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-[#39f77b]/50"
              />
            </div>

            {error && (
              <p className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-2.5 text-xs font-bold text-red-300">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-xl bg-[#39f77b] py-3.5 text-sm font-extrabold text-[#031008] transition hover:brightness-110 disabled:opacity-60"
            >
              {busy ? "در حال ورود..." : "ورود به پنل"}
            </button>
          </form>

          <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.02] p-4 text-[11px] leading-6 text-white/45">
            <p className="font-bold text-white/60">حساب‌های دمو:</p>
            <p>
              مدیر ارشد: <span className="text-[#39f77b]" dir="ltr">admin / 123456</span>
            </p>
            <p>
              ویراستار: <span className="text-[#39f77b]" dir="ltr">editor / 123456</span>
            </p>
          </div>
        </div>
        <p className="mt-4 text-center text-[11px] text-white/30">دنیای خودروهای برقی • ElectroCar</p>
      </div>
    </div>
  );
}
