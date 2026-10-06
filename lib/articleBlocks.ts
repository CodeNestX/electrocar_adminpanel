export type BlockType = "heading" | "paragraph" | "image" | "quote" | "list";

export interface ArticleBlock {
  id: string;
  type: BlockType;
  /** متن تیتر / پاراگراف / نقل‌قول — برای لیست هر آیتم در یک خط */
  text: string;
  /** فقط بلوک عکس */
  url?: string;
  alt?: string;
  caption?: string;
}

export const blockMeta: Record<BlockType, { label: string; hint: string }> = {
  heading: { label: "تیتر", hint: "تیتر میانی متن" },
  paragraph: { label: "متن", hint: "پاراگراف معمولی" },
  image: { label: "عکس", hint: "عکس بین متن با توضیح" },
  quote: { label: "نقل‌قول", hint: "جمله برجسته" },
  list: { label: "لیست", hint: "هر آیتم در یک خط" },
};

function uid(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function newBlock(type: BlockType): ArticleBlock {
  return { id: uid(), type, text: "" };
}

/** متن قدیمی تک‌بلوکی را به یک پاراگراف تبدیل می‌کند */
export function textToBlocks(content: string): ArticleBlock[] {
  const parts = content
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
  if (parts.length === 0) return [newBlock("paragraph")];
  return parts.map((p) => ({ ...newBlock("paragraph"), text: p }));
}

/** بلوک‌ها را به متن ساده (سازگار با نمایش عمومی سایت) تبدیل می‌کند */
export function blocksToText(blocks: ArticleBlock[]): string {
  const out: string[] = [];
  for (const b of blocks) {
    if (b.type === "image") {
      if (b.caption?.trim()) out.push(b.caption.trim());
      continue;
    }
    const t = b.text.trim();
    if (t) out.push(t);
  }
  return out.join("\n\n");
}

export function blocksWordCount(blocks: ArticleBlock[]): number {
  let n = 0;
  for (const b of blocks) {
    const t = `${b.text} ${b.caption ?? ""}`.trim();
    if (t) n += t.split(/\s+/).length;
  }
  return n;
}

/** تخمین زمان مطالعه به دقیقه (حدود ۱۸۰ کلمه در دقیقه) */
export function estimateReadingMinutes(blocks: ArticleBlock[]): number {
  return Math.max(1, Math.ceil(blocksWordCount(blocks) / 180));
}

/** اسلاگ لاتین تمیز می‌سازد؛ ورودی فارسی/خالی → شناسه خودکار */
export function slugify(input: string): string {
  const s = input
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return s || `article-${Date.now().toString(36)}`;
}
