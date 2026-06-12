"use client";

import { useEffect, useRef, useState } from "react";
import { Service } from "@/types/database";
import { getCampaignBadge } from "@/lib/campaign";

type Props = {
  service: Service;
};

export default function ConversionArea({ service }: Props) {
  const [copied, setCopied] = useState(false);
  const copyTrackedRef = useRef(false);

  const trackCopyCode = () => {
    // 同一ページ内で何度コピーされても1回のみ計測する
    if (copyTrackedRef.current) return;
    copyTrackedRef.current = true;
    fetch("/api/analytics/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event_type: "copy_code", service_id: service.id }),
      keepalive: true,
    });
  };

  const handleCopy = async () => {
    if (!service.referral_code) return;
    await navigator.clipboard.writeText(service.referral_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    trackCopyCode();
  };

  // 記事本文中に招待コード・招待リンクが含まれる場合も計測対象にする
  useEffect(() => {
    const handleDocCopy = () => {
      if (!service.referral_code) return;
      const selected = window.getSelection?.()?.toString().trim();
      if (selected === service.referral_code) trackCopyCode();
    };

    const handleDocClick = (e: MouseEvent) => {
      if (!service.referral_link) return;
      const anchor = (e.target as HTMLElement | null)?.closest?.("a");
      if (anchor?.getAttribute("href") === service.referral_link) {
        // 外部リンクへの遷移で fetch が中断されないよう keepalive を指定
        fetch("/api/analytics/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ event_type: "referral_click", service_id: service.id }),
          keepalive: true,
        });
      }
    };

    document.addEventListener("copy", handleDocCopy);
    document.addEventListener("click", handleDocClick);
    return () => {
      document.removeEventListener("copy", handleDocCopy);
      document.removeEventListener("click", handleDocClick);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [service.id, service.referral_code, service.referral_link]);

  if (!service.referral_code && !service.referral_link) return null;

  const campaignBadge = getCampaignBadge(service);

  return (
    <div className="bg-gradient-to-br from-brand-50 to-brand-warm-100 border border-brand-200 rounded-2xl p-6">
      {campaignBadge && service.campaign_bonus && (
        <div
          className={`mb-4 rounded-xl px-4 py-3 flex items-center gap-2 ${
            campaignBadge.urgent ? "bg-brand-warm-500 text-white" : "bg-brand-400 text-slate-900"
          }`}
        >
          <span className="font-bold text-sm shrink-0">🔥 {campaignBadge.label}</span>
          <span className="text-sm">{service.campaign_bonus}</span>
        </div>
      )}

      <div className="flex items-center justify-between gap-3 mb-4">
        <h2 className="font-bold text-gray-900 text-base flex items-center gap-2">🎁 お得な招待情報</h2>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/mascot/library/squirrel-recommend-point-bubble.png" alt="ポイナビくん" className="w-12 h-12 shrink-0" />
      </div>

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
                  : "bg-brand-400 text-slate-900 hover:bg-brand-500"
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
          className="block w-full text-center bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-slate-800 transition-colors"
        >
          招待リンクから登録する →
        </a>
      )}
    </div>
  );
}
