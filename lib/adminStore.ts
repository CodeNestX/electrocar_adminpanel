import type { Article } from "@/types/article";
import { articles as seedArticles } from "@/data/articles";
import { faToSlug, type ArticleBlock } from "@/lib/articleBlocks";
import {
  defaultSettings,
  mockAdmins,
  mockComments,
  mockMessages,
  mockUsers,
  type MockAdmin,
  type MockComment,
  type MockMessage,
  type MockUser,
  type SiteSettings,
} from "@/data/adminMock";

export type ArticleStatus = "published" | "draft" | "archived";
export type ArticleLang = "fa" | "en";

export interface AdminArticle extends Article {
  status: ArticleStatus;
  views: number;
  /** بلوک‌های ویرایشگر مقاله؛ غایب بودن یعنی متن قدیمی تک‌بلوکی */
  blocks?: ArticleBlock[];
  lang?: ArticleLang;
}

export const statusMeta: Record<ArticleStatus, { label: string; chip: string }> = {
  published: { label: "منتشرشده", chip: "bg-[#39f77b]/10 text-[#39f77b]" },
  draft: { label: "پیش‌نویس", chip: "bg-amber-400/10 text-amber-300" },
  archived: { label: "آرشیوشده", chip: "bg-[#00c8ff]/10 text-[#00c8ff]" },
};

export const langMeta: Record<ArticleLang, { label: string; dir: "rtl" | "ltr" }> = {
  fa: { label: "فارسی", dir: "rtl" },
  en: { label: "انگلیسی", dir: "ltr" },
};

/** آدرس نمایشی مقاله با الگوی /articles/نامک-دسته/نامک */
export function categorySlugOf(name: string, lang?: ArticleLang): string {
  const cats = getCategories();
  const found =
    cats.find((c) => c.parentId !== null && c.name === name && (lang === undefined || c.lang === lang)) ??
    cats.find((c) => c.name === name);
  return found?.slug || encodeURIComponent(name);
}

export function articleUrl(a: { category: string; slug: string; lang?: ArticleLang }): string {
  return `/articles/${categorySlugOf(a.category, a.lang)}/${a.slug}`;
}

/** نامک یکتا برای دسته می‌سازد */
function uniqueCatSlug(base: string, exceptId?: string): string {
  const clean =
    base
      .trim()
      .toLowerCase()
      .replace(/[\s_]+/g, "-")
      .replace(/[^a-z0-9-]/g, "")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "") || `cat-${Date.now().toString(36)}`;
  const taken = new Set(
    getCategories()
      .filter((c) => c.id !== exceptId)
      .map((c) => c.slug)
  );
  if (!taken.has(clean)) return clean;
  let i = 2;
  while (taken.has(`${clean}-${i}`)) i += 1;
  return `${clean}-${i}`;
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
  comments: "electrocar_admin_comments_v1",
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
    lang: "fa" as const,
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
  // نرمال‌سازی رکوردهای قدیمی (بدون زبان)
  return stored.map((a) => ({ ...a, lang: a.lang ?? ("fa" as const) }));
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

/* ---------- Categories: neutral parents + language subcategories ---------- */

export interface Category {
  id: string;
  name: string;
  /** نامک لاتین برای آدرس (مثلا batri) */
  slug: string;
  /** null برای والد خنثی (فقط ظرف گروه‌بندی، غیرقابل انتخاب در مقاله)؛ زیردسته‌ها fa یا en */
  lang: ArticleLang | null;
  /** null یعنی والد؛ در غیر این صورت زیردسته همین والد است */
  parentId: string | null;
}

function catId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function seedCategories(): Category[] {
  const seen: string[] = [];
  // دسته‌های قدیمی بدون زبان → والد خنثی + یک زیردسته فارسی هم‌نام (تا مقالات موجود بی‌خانمان نشوند)
  for (const a of seedArticles) {
    const c = a.category.trim();
    if (c && !seen.includes(c)) seen.push(c);
  }
  if (!seen.includes("عمومی")) seen.push("عمومی");
  const cats: Category[] = [];
  seen.forEach((name, i) => {
    const pid = `cat-parent-${i}`;
    // نامک تمیز مال زیردسته است (در URL استفاده می‌شود)؛ والد فقط ظرف است
    cats.push({ id: pid, name, slug: `${faToSlug(name)}-group`, lang: null, parentId: null });
    cats.push({ id: `cat-sub-${i}`, name, slug: faToSlug(name), lang: "fa", parentId: pid });
  });
  return cats;
}

/** مهاجرت مدل‌های قدیمی به مدل والد خنثی + زیردسته */
function migrateCategories(stored: unknown): Category[] | null {
  if (!Array.isArray(stored) || stored.length === 0) return null;
  // مدل خیلی قدیمی: آرایه‌ای از نام‌ها
  if (typeof stored[0] === "string") {
    const cats: Category[] = [];
    (stored as string[]).forEach((name, i) => {
      const pid = `cat-parent-${i}`;
      cats.push({ id: pid, name, slug: `${faToSlug(name)}-group`, lang: null, parentId: null });
      cats.push({ id: `cat-sub-${i}`, name, slug: faToSlug(name), lang: "fa", parentId: pid });
    });
    return cats;
  }
  const arr = stored as Category[];
  // مدل میانی (ریشه زبان‌دار): ریشه‌ها → والد خنثی + زیردسته هم‌نام، زیردسته‌ها به والد جدید وصل می‌شوند
  if (!arr.some((c) => c.parentId === null && c.lang !== null)) {
    // مدل جدید ولی بدون نامک: نامک بساز
    if (arr.some((c) => !c.slug)) {
      const withSlugs = arr.map((c) => ({ ...c, slug: c.slug || faToSlug(c.name) }));
      // یکتاسازی نامک زیردسته‌ها
      const seen = new Set<string>();
      for (const c of withSlugs) {
        if (c.parentId === null) continue;
        let s = c.slug;
        let i = 2;
        while (seen.has(s)) s = `${c.slug}-${i++}`;
        c.slug = s;
        seen.add(s);
      }
      return withSlugs;
    }
    return null;
  }
  const idMap = new Map<string, string>();
  const next: Category[] = [];
  for (const c of arr) {
    if (c.parentId === null && c.lang !== null) {
      const pid = catId("cat-p");
      idMap.set(c.id, pid);
      next.push({ id: pid, name: c.name, slug: `${c.slug || faToSlug(c.name)}-group`, lang: null, parentId: null });
      next.push({ id: catId("cat-s"), name: c.name, slug: c.slug || faToSlug(c.name), lang: c.lang, parentId: pid });
    }
  }
  for (const c of arr) {
    if (c.parentId !== null) {
      next.push({ ...c, slug: c.slug || faToSlug(c.name), parentId: idMap.get(c.parentId) ?? c.parentId });
    }
  }
  return next;
}

export function getCategories(): Category[] {
  const stored = read<unknown>(K.categories, null);
  const migrated = migrateCategories(stored);
  if (migrated) {
    write(K.categories, migrated);
    return migrated;
  }
  if (Array.isArray(stored) && stored.length > 0) {
    const arr = stored as Category[];
    if (arr.every((c) => c.slug)) return arr;
    return arr.map((c) => ({ ...c, slug: c.slug || faToSlug(c.name) }));
  }
  const seed = seedCategories();
  write(K.categories, seed);
  return seed;
}

export function saveCategories(list: Category[]): void {
  write(K.categories, list);
}

/** والدها (خنثی و غیرقابل انتخاب در مقاله) */
export function getParents(list?: Category[]): Category[] {
  const cats = list ?? getCategories();
  return cats.filter((c) => c.parentId === null);
}

/** زیردسته‌های یک والد، اختیاری فقط هم‌زبان مقاله */
export function getSubs(parentId: string, lang?: ArticleLang, list?: Category[]): Category[] {
  const cats = list ?? getCategories();
  return cats.filter(
    (c) => c.parentId === parentId && (lang === undefined || c.lang === lang)
  );
}

export function addCategory(input: {
  name: string;
  /** null + بدون والد = والد خنثی؛ fa/en + والد = زیردسته */
  lang: ArticleLang | null;
  parentId: string | null;
}): { ok: boolean; error?: string; list?: Category[] } {
  const clean = input.name.trim().replace(/\s+/g, " ");
  if (!clean) return { ok: false, error: "نام دسته خالی است." };
  if (clean.length > 40) return { ok: false, error: "نام دسته خیلی طولانی است." };
  const list = getCategories();

  // ساخت والد خنثی (بدون زبان، غیرقابل انتخاب در مقاله)
  if (input.parentId === null) {
    if (input.lang !== null) return { ok: false, error: "والد زبان ندارد." };
    if (list.some((c) => c.parentId === null && c.name === clean))
      return { ok: false, error: "والدی با این نام وجود دارد." };
    const next = [...list, { id: catId("cat-p"), name: clean, slug: `${uniqueCatSlug(faToSlug(clean))}-group`, lang: null, parentId: null }];
    saveCategories(next);
    return { ok: true, list: next };
  }

  // ساخت زیردسته (زبان جداگانه برای هر زیردسته)
  const parent = list.find((c) => c.id === input.parentId);
  if (!parent || parent.parentId !== null) return { ok: false, error: "والد معتبر انتخاب کنید." };
  if (input.lang !== "fa" && input.lang !== "en")
    return { ok: false, error: "برای زیردسته زبان (فارسی/انگلیسی) انتخاب کنید." };
  // نام زیردسته در هر زبان یکتا باشد تا ارجاع مقاله‌ها قاطی نشود
  if (list.some((c) => c.parentId !== null && c.lang === input.lang && c.name === clean))
    return { ok: false, error: "زیردسته‌ای با این نام در همین زبان وجود دارد." };
  const next = [
    ...list,
    { id: catId("cat-s"), name: clean, slug: uniqueCatSlug(faToSlug(clean)), lang: input.lang, parentId: input.parentId },
  ];
  saveCategories(next);
  return { ok: true, list: next };
}

export function deleteCategory(id: string): { ok: boolean; error?: string; list?: Category[] } {
  const list = getCategories();
  const cat = list.find((c) => c.id === id);
  if (!cat) return { ok: false, error: "دسته پیدا نشد." };
  if (cat.parentId === null) {
    const kids = list.filter((c) => c.parentId === id).length;
    if (kids > 0) return { ok: false, error: "این والد زیردسته دارد؛ اول زیردسته‌ها را حذف کنید." };
  } else {
    const used = getArticles().filter((a) => a.category === cat.name).length;
    if (used > 0)
      return { ok: false, error: `این زیردسته در ${used} مقاله استفاده شده و قابل حذف نیست.` };
  }
  const next = list.filter((c) => c.id !== id);
  saveCategories(next);
  return { ok: true, list: next };
}

export function renameCategory(
  id: string,
  newName: string,
  newSlug?: string
): { ok: boolean; error?: string; list?: Category[] } {
  const clean = newName.trim().replace(/\s+/g, " ");
  if (!clean) return { ok: false, error: "نام جدید خالی است." };
  if (clean.length > 40) return { ok: false, error: "نام دسته خیلی طولانی است." };
  const list = getCategories();
  const cat = list.find((c) => c.id === id);
  if (!cat) return { ok: false, error: "دسته پیدا نشد." };
  // اعتبارسنجی نامک جدید (فقط برای زیردسته کاربرد دارد)
  let slug = cat.slug;
  if (newSlug !== undefined && cat.parentId !== null) {
    const s = newSlug.trim().toLowerCase().replace(/[\s_]+/g, "-").replace(/[^a-z0-9-]/g, "").replace(/-+/g, "-").replace(/^-|-$/g, "");
    if (!s) return { ok: false, error: "نامک لاتین معتبر نیست." };
    if (list.some((c) => c.id !== id && c.slug === s))
      return { ok: false, error: "این نامک قبلا استفاده شده." };
    slug = s;
  }
  if (clean === cat.name && slug === cat.slug) return { ok: true, list };
  if (cat.parentId === null) {
    if (list.some((c) => c.parentId === null && c.id !== id && c.name === clean))
      return { ok: false, error: "والدی با این نام وجود دارد." };
  } else {
    if (list.some((c) => c.parentId !== null && c.lang === cat.lang && c.id !== id && c.name === clean))
      return { ok: false, error: "زیردسته‌ای با این نام در همین زبان وجود دارد." };
    // همگام‌سازی مقالاتی که به این زیردسته وصل‌اند (مقاله فقط به زیردسته وصل می‌شود)
    if (clean !== cat.name) {
      saveArticles(getArticles().map((a) => (a.category === cat.name ? { ...a, category: clean } : a)));
    }
  }
  // تغییرنام در فهرست دسته‌ها
  const next = list.map((c) => (c.id === id ? { ...c, name: clean, slug } : c));
  saveCategories(next);
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

/* ---------- Comments (moderation) ---------- */

export function getComments(): MockComment[] {
  const stored = read<MockComment[] | null>(K.comments, null);
  if (!stored) {
    write(K.comments, mockComments);
    return mockComments;
  }
  return stored;
}

export function saveComments(list: MockComment[]): void {
  write(K.comments, list);
}

export function pendingCommentCount(): number {
  if (!isBrowser()) return mockComments.filter((c) => c.status === "pending").length;
  return getComments().filter((c) => c.status === "pending").length;
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
