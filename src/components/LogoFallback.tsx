"use client";

type Props = {
  name: string;
  logoUrl?: string | null;
  logoStoragePath?: string | null;
  officialUrl?: string;
  size?: number;
  className?: string;
};

function getAutoColor(name: string): string {
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

// 3-tier logo mechanism:
// 1. logo_storage_path (Supabase Storage)
// 2. Favicon from official_url
// 3. Text avatar with auto color
export default function LogoFallback({ name, logoUrl, logoStoragePath, officialUrl, size = 48, className = "" }: Props) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const storageUrl = logoStoragePath ? `${supabaseUrl}/storage/v1/object/public/${logoStoragePath}` : null;
  const faviconUrl = getFaviconUrl(officialUrl);

  const imgSrc = storageUrl ?? logoUrl ?? faviconUrl;
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
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = "none";
          }}
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
