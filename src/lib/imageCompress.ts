// クライアント側で画像をcanvasでリサイズ・JPEG圧縮し、base64データを取得する
"use client";

export type CompressedImage = { dataUrl: string; data: string; mediaType: "image/jpeg" | "image/png" };

const MAX_DIMENSION = 1568; // Claude Vision推奨の長辺サイズ

export async function compressImage(file: File): Promise<CompressedImage> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const el = new window.Image();
    el.onload = () => resolve(el);
    el.onerror = () => reject(new Error("画像の読み込みに失敗しました"));
    el.src = dataUrl;
  });

  let { width, height } = img;
  if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
    const scale = MAX_DIMENSION / Math.max(width, height);
    width = Math.round(width * scale);
    height = Math.round(height * scale);
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("画像の処理に失敗しました");
  ctx.drawImage(img, 0, 0, width, height);

  const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.85);
  return { dataUrl: compressedDataUrl, data: compressedDataUrl.split(",")[1], mediaType: "image/jpeg" };
}
