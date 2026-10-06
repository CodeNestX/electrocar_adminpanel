import type { Article } from "@/types/article";
import { articles as seedArticles } from "@/data/articles";
import type { ArticleBlock } from "@/lib/articleBlocks";
import {
  defaultSettings,
  mockAdmins,
  mockMessages,
  mockUsers,
  type MockAdmin,
  type MockMessage,
  type MockUser,
  type SiteSettings,
} from "@/data/adminMock";

export interface AdminArticle extends Article {
  status: "published" | "draft";
  views: number;
  /** بلوک‌های ویرایشگر مقاله؛ غایب بودن یعنی متن قدیمی تک‌بلوکی */
  blocks?: ArticleBlock[];
}

export interface SearchResultItem {
  id: string;
  kind: "article" | "user" | "message" | "admin";
  title: string;
  sub: string;
  href: string;
}

const K = {
  articles: "electrocar_admin_articles_v1",
  messages: "electrocar_admin_messages_v1",
  users: "electrocar_admin_users_v1",
  admins: "electrocar_admin_admins_v1",
  settings: "electrocar_admin_settings_v1",
  notifRead: "electrocar_admin_notif_read_v1",
  session: "electrocar_admin_session_v1",
  categories: "electrocar_admin_categories_v1",
} as const;

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

function read<T>(key: string, fallback: T): T {
  if (!isBrowser()) return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown): void {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore quota errors in demo */
  }
}

function seedAdminArticles(): AdminArticle[] {
  return seedArticles.map((a, i) => ({
    ...a,
    status: i === seedArticles.length - 1 ? ("draft" as const) : ("published" as const),
    views: 480 + a.id * 237 + ((a.id * 53) % 300),
  }));
}

/* ---------- Articles ---------- */

export function getArticles(): AdminArticle[] {
  const fallback = seedAdminArticles();
  const stored = read<AdminArticle[] | null>(K.articles, null);
  if (!stored) {
    write(K.articles, fallback);
    return fallback;
  }
  return stored;
}

export function saveArticles(list: AdminArticle[]): void {
  write(K.articles, list);
}

export function upsertArticle(article: AdminArticle): AdminArticle[] {
  const list = getArticles();
  const idx = list.findIndex((a) => a.id === article.id);
  const next =
    idx >= 0 ? list.map((a) => (a.id === article.id ? article : a)) : [article, ...list];
  saveArticles(next);
  return next;
}

export function deleteArticle(id: number): AdminArticle[] {
  const next = getArticles().filter((a) => a.id !== id);
  saveArticles(next);
  return next;
}

/* ---------- Categories ---------- */

function seedCategories(): string[] {
  const seen: string[] = [];
  for (const a of seedArticles) {
    const c = a.category.trim();
    if (c && !seen.includes(c)) seen.push(c);
  }
  if (!seen.includes("عمومی")) seen.push("عمومی");
  return seen;
}

export function getCategories(): string[] {
  const stored = read<string[] | null>(K.categories, null);
  if (!stored) {
    const seed = seedCategories();
    write(K.categories, seed);
    return seed;
  }
  return stored;
}

export function saveCategories(list: string[]): void {
  write(K.categories, list.map((c) => c.trim()).filter(Boolean));
}

export function addCategory(name: string): { ok: boolean; error?: string; list?: string[] } {
  const clean = name.trim().replace(/\s+/g, " ");
  if (!clean) return { ok: false, error: "نام دسته خالی است." };
  if (clean.length > 40) return { ok: false, error: "نام دسته خیلی طولانی است." };
  const list = getCategories();
  if (list.includes(clean)) return { ok: false, error: "این دسته قبلا وجود دارد." };
  const next = [...list, clean];
  saveCategories(next);
  return { ok: true, list: next };
}

export function deleteCategory(name: string): { ok: boolean; error?: string; list?: string[] } {
  const used = getArticles().filter((a) => a.category === name).length;
  if (used > 0)
    return { ok: false, error: `این دسته در ${used} مقاله استفاده شده و قابل حذف نیست.` };
  const next = getCategories().filter((c) => c !== name);
  saveCategories(next);
  return { ok: true, list: next };
}

export function renameCategory(
  oldName: string,
  newName: string
): { ok: boolean; error?: string; list?: string[] } {
  const clean = newName.trim().replace(/\s+/g, " ");
  if (!clean) return { ok: false, error: "نام جدید خالی است." };
  if (clean.length > 40) return { ok: false, error: "نام دسته خیلی طولانی است." };
  const list = getCategories();
  if (!list.includes(oldName)) return { ok: false, error: "دسته پیدا نشد." };
  if (clean !== oldName && list.includes(clean))
    return { ok: false, error: "این نام قبلا برای دسته دیگری استفاده شده." };
  if (clean === oldName) return { ok: true, list };
  // تغییرنام در فهرست دسته‌ها
  const next = list.map((c) => (c === oldName ? clean : c));
  saveCategories(next);
  // همگام‌سازی مقالاتی که از این دسته استفاده می‌کنند
  saveArticles(getArticles().map((a) => (a.category === oldName ? { ...a, category: clean } : a)));
  return { ok: true, list: next };
}

export function categoryUsage(): Record<string, number> {
  const usage: Record<string, number> = {};
  for (const a of getArticles()) usage[a.category] = (usage[a.category] ?? 0) + 1;
  return usage;
}

/* ---------- Messages ---------- */

export function getMessages(): MockMessage[] {
  const stored = read<MockMessage[] | null>(K.messages, null);
  if (!stored) {
    write(K.messages, mockMessages);
    return mockMessages;
  }
  return stored;
}

export function saveMessages(list: MockMessage[]): void {
  write(K.messages, list);
}

export function unreadMessageCount(): number {
  if (!isBrowser()) return mockMessages.filter((m) => !m.read).length;
  return getMessages().filter((m) => !m.read).length;
}

/* ---------- Users ---------- */

export function getUsers(): MockUser[] {
  const stored = read<MockUser[] | null>(K.users, null);
  if (!stored) {
    write(K.users, mockUsers);
    return mockUsers;
  }
  return stored;
}

export function saveUsers(list: MockUser[]): void {
  write(K.users, list);
}

/* ---------- Admins ---------- */

export function getAdmins(): MockAdmin[] {
  const stored = read<MockAdmin[] | null>(K.admins, null);
  if (!stored) {
    write(K.admins, mockAdmins);
    return mockAdmins;
  }
  return stored;
}

export function saveAdmins(list: MockAdmin[]): void {
  write(K.admins, list);
}

/* ---------- Settings ---------- */

export function getSettings(): SiteSettings {
  const stored = read<SiteSettings | null>(K.settings, null);
  if (!stored) {
    write(K.settings, defaultSettings);
    return defaultSettings;
  }
  return { ...defaultSettings, ...stored };
}

export function saveSettings(s: SiteSettings): void {
  write(K.settings, s);
}

/* ---------- Notifications read ---------- */

export function getNotifRead(): string[] {
  return read<string[]>(K.notifRead, []);
}

export function markAllNotifRead(ids: string[]): void {
  write(K.notifRead, ids);
}

/* ---------- Global search ---------- */

export function searchAll(query: string): SearchResultItem[] {
  const q = query.trim();
  if (q.length < 2) return [];
  const out: SearchResultItem[] = [];

  for (const a of getArticles()) {
    if (a.title.includes(q) || a.category.includes(q)) {
      out.push({
        id: `article-${a.id}`,
        kind: "article",
        title: a.title,
        sub: `مقاله • ${a.category}`,
        href: "/admin/articles",
      });
    }
    if (out.length >= 8) break;
  }
  for (const u of getUsers()) {
    if (u.name.includes(q) || u.email.includes(q)) {
      out.push({
        id: `user-${u.id}`,
        kind: "user",
        title: u.name,
        sub: `کاربر • ${u.email}`,
        href: "/admin/users",
      });
    }
    if (out.length >= 12) break;
  }
  for (const m of getMessages()) {
    if (m.subject.includes(q) || m.name.includes(q) || m.body.includes(q)) {
      out.push({
        id: `message-${m.id}`,
        kind: "message",
        title: m.subject,
        sub: `پیام • ${m.name}`,
        href: "/admin/messages",
      });
    }
    if (out.length >= 16) break;
  }
  for (const ad of getAdmins()) {
    if (ad.name.includes(q) || ad.username.includes(q)) {
      out.push({
        id: `admin-${ad.id}`,
        kind: "admin",
        title: ad.name,
        sub: `ادمین • ${ad.username}`,
        href: "/admin/admins",
      });
    }
    if (out.length >= 18) break;
  }
  return out.slice(0, 8);
}

export const sessionKey = K.session;
