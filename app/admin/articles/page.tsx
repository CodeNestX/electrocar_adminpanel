"use client";

import { useMemo, useState } from "react";
import {
  deleteArticle,
  getArticles,
  getCategories,
  upsertArticle,
  type AdminArticle,
} from "@/lib/adminStore";
import {
  blocksToText,
  estimateReadingMinutes,
  newBlock,
  slugify,
  textToBlocks,
  type ArticleBlock,
} from "@/lib/articleBlocks";
import BlockEditor from "@/components/admin/BlockEditor";
import CategoryManager from "@/components/admin/CategoryManager";
import { toFa } from "@/lib/fa";

interface ArticleForm {
  title: string;
  slug: string;
  category: string;
  image: string;
  excerpt: string;
  author: string;
  status: AdminArticle["status"];
  readingTime: string;
  blocks: ArticleBlock[];
}

const FALLBACK_COVER =
  "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=1200&q=85";

export default function ArticlesPage() {
  const [list, setList] = useState<AdminArticle[]>(() => getArticles());
  const [cats, setCats] = useState<string[]>(() => getCategories());
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | "published" | "draft">("all");
  const [catFilter, setCatFilter] = useState<string>("all");
  const [modal, setModal] = useState<null | { editing: AdminArticle | null }>(null);
  const [form, setForm] = useState<ArticleForm | null>(null);
  const [catOpen, setCatOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  const filtered = useMemo(
    () =>
      list.filter((a) => {
        if (filter !== "all" && a.status !== filter) return false;
        if (catFilter !== "all" && a.category !== catFilter) return false;
        if (q.trim() && !a.title.includes(q.trim()) && !a.category.includes(q.trim())) return false;
        return true;
      }),
    [list, q, filter, catFilter]
  );

  const catCounts = useMemo(() => {
    const m = new Map<string, number>();
    for (const a of list) m.set(a.category, (m.get(a.category) ?? 0) + 1);
    return m;
  }, [list]);

  const allCats = useMemo(() => {
    const s = new Set<string>([...cats, ...catCounts.keys()]);
    return [...s];
  }, [cats, catCounts]);

  const freshCats = () => {
    const c = getCategories();
    setCats(c);
    return c;
  };

  const openCreate = () => {
    const c = freshCats();
    const ts = Date.now().toString(36);
    setForm({
      title: "",
      slug: `article-${ts}`,
      category: c[0] ?? "عمومی",
      image: "",
      excerpt: "",
      author: "تیم تحریریه ElectroCar",
      status: "published",
      readingTime: "",
      blocks: [newBlock("paragraph")],
    });
    setModal({ editing: null });
  };

  const openEdit = (a: AdminArticle) => {
    const c = freshCats();
    if (!c.includes(a.category)) setCats([...c, a.category]);
    setForm({
      title: a.title,
      slug: a.slug,
      category: a.category,
      image: a.image === FALLBACK_COVER ? "" : a.image,
      excerpt: a.excerpt,
      author: a.author,
      status: a.status,
      readingTime: a.readingTime,
      blocks: a.blocks && a.blocks.length > 0 ? a.blocks : textToBlocks(a.content),
    });
    setModal({ editing: a });
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form || !form.title.trim()) return;
    const slug = slugify(form.slug) || slugify(`article-${Date.now().toString(36)}`);
    const text = blocksToText(form.blocks);
    const estimate = estimateReadingMinutes(form.blocks);
    const base: AdminArticle = modal?.editing
      ? { ...modal.editing }
      : {
          id: Date.now(),
          date: "۱۱ مهر ۱۴۰۵",
          views: 0,
          title: "",
          slug: "",
          excerpt: "",
          content: "",
          category: "",
          image: "",
          readingTime: "",
          author: "",
          status: "published",
        };
    const next: AdminArticle = {
      ...base,
      title: form.title.trim(),
      slug,
      category: form.category || "عمومی",
      image: form.image.trim() || FALLBACK_COVER,
      excerpt: form.excerpt.trim() || form.title.trim(),
      content: text || form.title.trim(),
      blocks: form.blocks,
      author: form.author.trim() || "تیم تحریریه ElectroCar",
      readingTime: form.readingTime.trim() || `${estimate} دقیقه`,
      status: form.status,
    };
    setList(upsertArticle(next));
    setModal(null);
    setForm(null);
  };

  const remove = (id: number) => {
    setList(deleteArticle(id));
    setConfirmDelete(null);
  };

  const estimate = form ? estimateReadingMinutes(form.blocks) : 0;
  const excerptLen = form?.excerpt.trim().length ?? 0;

  return (
    <div className="space-y-4">
      <div className="ev-card flex flex-col gap-3 rounded-2xl p-4 sm:flex-row sm:items-center">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="جستجو در عنوان یا دسته..."
          className="w-full flex-1 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-white outline-none placeholder:text-white/30 focus:border-[#39f77b]/50 sm:max-w-xs"
        />
        <div className="flex items-center gap-2">
          {(
            [
              ["all", "همه"],
              ["published", "منتشرشده"],
              ["draft", "پیش‌نویس"],
            ] as const
          ).map(([v, label]) => (
            <button
              key={v}
              type="button"
              onClick={() => setFilter(v)}
              className={`rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                filter === v ? "bg-[#39f77b]/15 text-[#39f77b]" : "bg-white/[0.03] text-white/50 hover:text-white"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <span className="flex gap-2 sm:ms-auto">
          <button
            type="button"
            onClick={() => setCatOpen(true)}
            className="rounded-xl border border-white/10 px-4 py-2.5 text-xs font-bold text-white/70 transition hover:border-[#00c8ff]/40 hover:text-[#00c8ff]"
          >
            دسته‌بندی‌ها
          </button>
          <button
            type="button"
            onClick={openCreate}
            className="rounded-xl bg-[#39f77b] px-5 py-2.5 text-xs font-extrabold text-[#031008] transition hover:brightness-110"
          >
            + مقاله جدید
          </button>
        </span>
      </div>

      {/* فیلتر دسته‌بندی */}
      <div className="ev-card flex flex-wrap items-center gap-2 rounded-2xl p-3">
        <button
          type="button"
          onClick={() => setCatFilter("all")}
          className={`rounded-xl px-3.5 py-2 text-[11px] font-bold transition ${
            catFilter === "all" ? "bg-[#39f77b]/15 text-[#39f77b]" : "bg-white/[0.03] text-white/50 hover:text-white"
          }`}
        >
          همه دسته‌ها ({toFa(list.length)})
        </button>
        {allCats.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCatFilter(catFilter === c ? "all" : c)}
            className={`rounded-xl px-3.5 py-2 text-[11px] font-bold transition ${
              catFilter === c ? "bg-[#00c8ff]/15 text-[#00c8ff]" : "bg-white/[0.03] text-white/50 hover:text-white"
            }`}
          >
            {c} ({toFa(catCounts.get(c) ?? 0)})
          </button>
        ))}
        {catFilter !== "all" && (
          <span className="ms-auto text-[11px] text-white/40">
            نمایش مقالات دسته «{catFilter}» — برای بازگشت دوباره کلیک کنید
          </span>
        )}
      </div>

      <div className="ev-card overflow-hidden rounded-2xl">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-right text-xs">
            <thead>
              <tr className="border-b border-white/5 text-white/40">
                <th className="px-5 py-3 font-bold">مقاله</th>
                <th className="px-5 py-3 font-bold">دسته</th>
                <th className="px-5 py-3 font-bold">بازدید</th>
                <th className="px-5 py-3 font-bold">وضعیت</th>
                <th className="px-5 py-3 font-bold">اقدام</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => (
                <tr key={a.id} className="border-b border-white/5 last:border-0">
                  <td className="px-5 py-3">
                    <span className="flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={a.image} alt="" className="h-11 w-16 shrink-0 rounded-lg object-cover" />
                      <span className="min-w-0">
                        <span className="block max-w-65 truncate font-bold text-white">{a.title}</span>
                        <span className="mt-1 block text-[10px] text-white/35">{a.date}</span>
                      </span>
                    </span>
                  </td>
                  <td className="px-5 py-3 text-white/60">
                    <button
                      type="button"
                      onClick={() => setCatFilter(a.category)}
                      title="نمایش مقالات این دسته"
                      className="rounded-lg px-2 py-1 transition hover:bg-[#00c8ff]/10 hover:text-[#00c8ff]"
                    >
                      {a.category}
                    </button>
                  </td>
                  <td className="px-5 py-3 text-white/60">{toFa(a.views)}</td>
                  <td className="px-5 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
                        a.status === "published" ? "bg-[#39f77b]/10 text-[#39f77b]" : "bg-amber-400/10 text-amber-300"
                      }`}
                    >
                      {a.status === "published" ? "منتشرشده" : "پیش‌نویس"}
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
                        onClick={() => setConfirmDelete(a.id)}
                        className="rounded-lg border border-white/10 px-3 py-1.5 font-bold text-white/70 transition hover:border-red-400/40 hover:text-red-300"
                      >
                        حذف
                      </button>
                    </span>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-white/40">
                    مقاله‌ای پیدا نشد.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {catOpen && (
        <CategoryManager
          onClose={() => {
            setCatOpen(false);
            freshCats();
            // اگر دسته فیلترشده تغییرنام گرفته یا حذف شده، فیلتر را آزاد کن
            const fresh = getArticles();
            setList(fresh);
            if (catFilter !== "all" && !fresh.some((a) => a.category === catFilter)) {
              setCatFilter("all");
            }
          }}
        />
      )}

      {modal && form && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <form
            onSubmit={submit}
            className="ev-card flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl"
          >
            <div className="flex items-center justify-between border-b border-white/5 px-6 py-4">
              <h2 className="text-base font-extrabold text-white">
                {modal.editing ? "ویرایش مقاله" : "مقاله جدید"}
              </h2>
              <button
                type="button"
                onClick={() => {
                  setModal(null);
                  setForm(null);
                }}
                aria-label="بستن"
                className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 text-white/50 transition hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 space-y-6 overflow-y-auto px-6 py-5">
              {/* مشخصات اصلی */}
              <section className="space-y-3">
                <p className="text-xs font-extrabold text-[#39f77b]">مشخصات اصلی</p>
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="تیتر مقاله *"
                  className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-bold text-white outline-none placeholder:font-normal placeholder:text-white/30 focus:border-[#39f77b]/50"
                />
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="flex gap-2">
                    <input
                      value={form.slug}
                      onChange={(e) => setForm({ ...form, slug: e.target.value })}
                      placeholder="نامک (slug)"
                      dir="ltr"
                      className="min-w-0 flex-1 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-left text-xs text-white outline-none placeholder:text-white/30 focus:border-[#39f77b]/50"
                    />
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, slug: slugify(form.title || `article-${Date.now().toString(36)}`) })}
                      title="تولید خودکار از تیتر"
                      className="shrink-0 rounded-xl border border-white/10 px-3 py-2.5 text-[11px] font-bold text-white/60 transition hover:border-[#39f77b]/40 hover:text-[#39f77b]"
                    >
                      خودکار
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <select
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      aria-label="دسته‌بندی"
                      className="min-w-0 flex-1 rounded-xl border border-white/10 bg-[#0b1722] px-4 py-2.5 text-xs text-white outline-none"
                    >
                      {cats.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                      {!cats.includes(form.category) && (
                        <option value={form.category}>{form.category}</option>
                      )}
                    </select>
                    <button
                      type="button"
                      onClick={() => setCatOpen(true)}
                      title="مدیریت دسته‌ها"
                      className="shrink-0 rounded-xl border border-white/10 px-3 py-2.5 text-[11px] font-bold text-white/60 transition hover:border-[#00c8ff]/40 hover:text-[#00c8ff]"
                    >
                      دسته‌ها
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <input
                    value={form.author}
                    onChange={(e) => setForm({ ...form, author: e.target.value })}
                    placeholder="نویسنده"
                    className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-xs text-white outline-none placeholder:text-white/30 focus:border-[#39f77b]/50"
                  />
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value as AdminArticle["status"] })}
                    aria-label="وضعیت انتشار"
                    className="w-full rounded-xl border border-white/10 bg-[#0b1722] px-4 py-2.5 text-xs text-white outline-none"
                  >
                    <option value="published">منتشرشده</option>
                    <option value="draft">پیش‌نویس</option>
                  </select>
                  <input
                    value={form.readingTime}
                    onChange={(e) => setForm({ ...form, readingTime: e.target.value })}
                    placeholder={`زمان مطالعه (تخمین: ${toFa(estimate)} دقیقه)`}
                    className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-xs text-white outline-none placeholder:text-white/30 focus:border-[#39f77b]/50"
                  />
                </div>
              </section>

              {/* تصویر شاخص */}
              <section className="space-y-3">
                <p className="text-xs font-extrabold text-[#39f77b]">تصویر شاخص</p>
                <input
                  value={form.image}
                  onChange={(e) => setForm({ ...form, image: e.target.value })}
                  placeholder="آدرس تصویر (خالی = تصویر پیش‌فرض)"
                  dir="ltr"
                  className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-left text-xs text-white outline-none placeholder:text-white/30 focus:border-[#39f77b]/50"
                />
                <div className="overflow-hidden rounded-2xl border border-white/10">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={form.image.trim() || FALLBACK_COVER}
                    alt="پیش‌نمایش تصویر شاخص"
                    className="h-44 w-full object-cover"
                  />
                </div>
              </section>

              {/* محتوای بلوکی */}
              <section className="space-y-3">
                <p className="flex items-center justify-between text-xs font-extrabold text-[#39f77b]">
                  محتوای مقاله
                  <span className="font-normal text-white/35">
                    {toFa(form.blocks.length)} بلوک • حدود {toFa(estimate)} دقیقه مطالعه
                  </span>
                </p>
                <BlockEditor blocks={form.blocks} onChange={(blocks) => setForm({ ...form, blocks })} />
              </section>

              {/* سئو */}
              <section className="space-y-3">
                <p className="text-xs font-extrabold text-[#39f77b]">سئو و خلاصه</p>
                <textarea
                  value={form.excerpt}
                  onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                  placeholder="خلاصه و توضیح متا (پیشنهاد: ۱۲۰ تا ۱۶۰ کاراکتر)"
                  rows={3}
                  className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-xs leading-6 text-white outline-none placeholder:text-white/30 focus:border-[#39f77b]/50"
                />
                <p
                  className={`text-left text-[11px] ${
                    excerptLen >= 120 && excerptLen <= 170 ? "text-[#39f77b]" : "text-white/35"
                  }`}
                >
                  {toFa(excerptLen)} / ۱۶۰ کاراکتر
                </p>
                <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                  <p className="mb-2 text-[10px] font-bold text-white/35">پیش‌نمایش در گوگل</p>
                  <p className="text-sm font-bold text-[#8ab4f8]">
                    {form.title.trim() || "عنوان مقاله"} | ElectroCar
                  </p>
                  <p className="mt-0.5 text-[11px] text-white/40" dir="ltr">
                    electrocar.ir/articles/{form.slug || "___"}
                  </p>
                  <p className="mt-1 line-clamp-2 text-[11px] leading-5 text-white/55">
                    {form.excerpt.trim() || "خلاصه مقاله اینجا نمایش داده می‌شود..."}
                  </p>
                </div>
              </section>
            </div>

            <div className="flex gap-2 border-t border-white/5 px-6 py-4">
              <button
                type="submit"
                className="flex-1 rounded-xl bg-[#39f77b] py-3 text-sm font-extrabold text-[#031008] transition hover:brightness-110"
              >
                ذخیره مقاله
              </button>
              <button
                type="button"
                onClick={() => {
                  setModal(null);
                  setForm(null);
                }}
                className="rounded-xl border border-white/10 px-6 py-3 text-sm font-bold text-white/60 transition hover:text-white"
              >
                انصراف
              </button>
            </div>
          </form>
        </div>
      )}

      {confirmDelete !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="ev-card w-full max-w-sm rounded-3xl p-6 text-center">
            <p className="text-sm font-bold text-white">این مقاله حذف شود؟</p>
            <p className="mt-2 text-[11px] text-white/40">این عمل قابل بازگشت نیست.</p>
            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={() => remove(confirmDelete)}
                className="flex-1 rounded-xl bg-red-500 py-2.5 text-sm font-extrabold text-white transition hover:brightness-110"
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
