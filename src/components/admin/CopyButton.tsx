"use client";

import { useState } from "react";

type Props = {
  text: string;
  className?: string;
};

export default function CopyButton({ text, className = "" }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // クリップボードへのアクセスが拒否された場合は何もしない
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`shrink-0 text-xs font-medium px-2 py-1 rounded-lg border transition-colors ${
        copied ? "bg-green-50 border-green-200 text-green-700" : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-slate-900"
      } ${className}`}
    >
      {copied ? "コピーしました" : "コピー"}
    </button>
  );
}
