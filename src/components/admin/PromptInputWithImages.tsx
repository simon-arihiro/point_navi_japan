"use client";

export type PendingImage = { dataUrl: string; data: string; mediaType: "image/jpeg" | "image/png" };

const MAX_DIMENSION = 1568; // Claude Vision推奨の長辺サイズ
const MAX_IMAGES = 5;

// 画像をcanvasでリサイズ・JPEG圧縮し、base64データを取得する
async function compressImage(file: File): Promise<PendingImage> {
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

type Props = {
  value: string;
  onChange: (value: string) => void;
  images: PendingImage[];
  onImagesChange: (images: PendingImage[]) => void;
  placeholder?: string;
  disabled?: boolean;
};

// ChatGPT風に、テキスト入力欄に画像をペーストして添付できる入力コンポーネント
export default function PromptInputWithImages({ value, onChange, images, onImagesChange, placeholder, disabled }: Props) {
  const handlePaste = async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = Array.from(e.clipboardData?.items ?? []);
    const imageFiles = items.filter((item) => item.type.startsWith("image/")).map((item) => item.getAsFile()).filter((f): f is File => !!f);
    if (imageFiles.length === 0) return;

    e.preventDefault();
    const remaining = MAX_IMAGES - images.length;
    const targets = imageFiles.slice(0, Math.max(0, remaining));
    const compressed = await Promise.all(targets.map(compressImage));
    onImagesChange([...images, ...compressed]);
  };

  const removeImage = (index: number) => {
    onImagesChange(images.filter((_, i) => i !== index));
  };

  return (
    <div>
      {images.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {images.map((img, i) => (
            <div key={i} className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.dataUrl} alt="" className="w-16 h-16 object-cover rounded-lg border border-gray-200" />
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-gray-900 text-white rounded-full text-xs leading-none flex items-center justify-center hover:bg-gray-700"
                aria-label="画像を削除"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onPaste={handlePaste}
        placeholder={placeholder}
        disabled={disabled}
        rows={6}
        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 resize-none disabled:opacity-50"
      />
      <p className="text-xs text-gray-400 mt-1">画像はコピー&ペーストで添付できます（最大{MAX_IMAGES}枚）</p>
    </div>
  );
}
