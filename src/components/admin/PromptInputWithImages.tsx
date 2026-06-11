"use client";

import { compressImage, CompressedImage } from "@/lib/imageCompress";

export type PendingImage = CompressedImage;

const MAX_IMAGES = 5;

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
