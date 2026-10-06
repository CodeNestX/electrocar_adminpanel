"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { getAdmins, sessionKey } from "@/lib/adminStore";
import type { AdminRole } from "@/data/adminMock";

export interface AdminSession {
  id: number;
  name: string;
  username: string;
  role: AdminRole;
}

interface AuthCtx {
  user: AdminSession | null;
  loading: boolean;
  login: (username: string, password: string) => string | null;
  logout: () => void;
}

const Ctx = createContext<AuthCtx | null>(null);

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  // عمدا null شروع می‌شود تا رندر اول سرور و کلاینت یکسان باشد و hydration به‌هم نریزد؛
  // سشن مرورگر فقط بعد از mount خوانده می‌شود.
  const [user, setUser] = useState<AdminSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(sessionKey);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- همگام‌سازی با سشن ذخیره‌شده مرورگر؛ فقط بعد از mount اجرا می‌شود تا hydration خراب نشود
      if (raw) setUser(JSON.parse(raw) as AdminSession);
    } catch {
      /* no session */
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback((username: string, password: string) => {
    const u = username.trim();
    const p = password.trim();
    if (!u || !p) return "نام کاربری و رمز عبور را وارد کنید.";
    const found = getAdmins().find(
      (a) => a.username === u && a.password === p
    );
    if (!found) return "نام کاربری یا رمز عبور اشتباه است.";
    if (!found.active) return "این حساب غیرفعال شده است.";
    const session: AdminSession = {
      id: found.id,
      name: found.name,
      username: found.username,
      role: found.role,
    };
    setUser(session);
    try {
      localStorage.setItem(sessionKey, JSON.stringify(session));
    } catch {
      /* ignore */
    }
    return null;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    try {
      localStorage.removeItem(sessionKey);
    } catch {
      /* ignore */
    }
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, logout }),
    [user, loading, login, logout]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAdminAuth(): AuthCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAdminAuth must be used within AdminAuthProvider");
  return ctx;
}
