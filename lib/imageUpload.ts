export interface PickedImage {
  dataUrl: string;
  name: string;
  size: number;
}

export const MAX_IMAGE_BYTES = 1.5 * 1024 * 1024;

export function formatBytesFa(bytes: number): string {
  if (bytes < 1024) return `${bytes} بایت`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} کیلوبایت`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} مگابایت`;
}

/** فایل تصویری را بدون تغییر (اصل فایل) به dataURL تبدیل می‌کند */
export function fileToDataUrl(file: File): Promise<PickedImage> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error("فقط فایل تصویری انتخاب کنید."));
      return;
    }
    const reader = new FileReader();
    reader.onload = () =>
      resolve({ dataUrl: String(reader.result ?? ""), name: file.name, size: file.size });
    reader.onerror = () => reject(new Error("خواندن فایل ناموفق بود."));
    reader.readAsDataURL(file);
  });
}
