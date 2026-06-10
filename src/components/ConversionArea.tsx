"use client";

import { useState } from "react";
import { Service } from "@/types/database";

type Props = {
  service: Service;
};

export default function ConversionArea({ service }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!service.referral_code) return;
    await navigator.clipboard.writeText(service.referral_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);

    await fetch("/api/analytics/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event_type: "copy_code", service_id: service.id }),
    });
  };

  const handleReferralClick = async () => {
    await fetch("/api/analytics/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event_type: "referral_click", service_id: service.id }),
    });
  };

  if (!service.referral_code && !service.referral_link) return null;

  return (
    <div className="bg-gradient-to-br from-amber-50 to-orange-100 border border-amber-200 rounded-2xl p-6">
      <h2 className="font-bold text-gray-900 text-base mb-4 flex items-center gap-2">🎁 お得な招待情報</h2>

      {service.referral_code && (
        <div className="mb-4">
          <p className="text-xs text-gray-500 mb-2">招待コード</p>
          <div className="flex items-center gap-3">
            <code className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-3 font-mono text-lg font-bold text-gray-900 tracking-widest">
              {service.referral_code}
            </code>
            <button
              onClick={handleCopy}
              className={`px-5 py-3 rounded-xl font-bold text-sm transition-colors ${
                copied
                  ? "bg-green-600 text-white"
                  : "bg-amber-400 text-slate-900 hover:bg-amber-500"
              }`}
            >
              {copied ? "コピー済み ✓" : "コピー"}
            </button>
          </div>
        </div>
      )}

      {service.referral_link && (
        <a
          href={service.referral_link}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleReferralClick}
          className="block w-full text-center bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-slate-800 transition-colors"
        >
          招待リンクから登録する →
        </a>
      )}
    </div>
  );
}
