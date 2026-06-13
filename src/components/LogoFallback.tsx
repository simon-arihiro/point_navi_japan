"use client";

import { useState } from "react";

type Props = {
  name: string;
  logoUrl?: string | null;
  logoStoragePath?: string | null;
  officialUrl?: string;
  size?: number;
  className?: string;
};

export function getAutoColor(name: string): string {
  const colors = [
    "#E53E3E", "#DD6B20", "#D69E2E", "#38A169",
    "#3182CE", "#805AD5", "#D53F8C", "#319795",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

function getFaviconUrl(officialUrl?: string): string | null {
  if (!officialUrl) return null;
  try {
    const { hostname } = new URL(officialUrl);
    return `https://www.google.com/s2/favicons?domain=${hostname}&sz=64`;
  } catch {
    return null;
  }
}

// ロゴ画像のフォールバックチェーン:
// 1. logo_storage_path (Supabase Storage)
// 2. logo_url（AI補完等で設定された直接URL）
// 3. 公式URLのfavicon
// 4. 文字アバター（自動配色）
// 画像の読み込みに失敗した場合は次の候補へ自動フォールバックする
export default function LogoFallback({ name, logoUrl, logoStoragePath, officialUrl, size = 48, className = "" }: Props) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const storageUrl = logoStoragePath ? `${supabaseUrl}/storage/v1/object/public/${logoStoragePath}` : null;
  const faviconUrl = getFaviconUrl(officialUrl);

  const candidates = [storageUrl, logoUrl, faviconUrl].filter((url): url is string => !!url);
  const [failedCount, setFailedCount] = useState(0);

  const imgSrc = candidates[failedCount];
  const initial = name.charAt(0).toUpperCase();
  const bgColor = getAutoColor(name);

  if (imgSrc) {
    return (
      <div
        className={`relative overflow-hidden rounded-xl ${className}`}
        style={{ width: size, height: size, minWidth: size }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imgSrc}
          alt={`${name} logo`}
          className="absolute inset-0 w-full h-full object-contain"
          onError={() => setFailedCount((c) => c + 1)}
        />
      </div>
    );
  }

  return (
    <div
      className={`rounded-xl flex items-center justify-center font-bold text-white ${className}`}
      style={{ width: size, height: size, minWidth: size, backgroundColor: bgColor, fontSize: size * 0.4 }}
    >
      {initial}
    </div>
  );
}
