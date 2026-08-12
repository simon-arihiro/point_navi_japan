"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

const INTERVAL_SEC = 30;

export default function AdminAutoRefresh() {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [countdown, setCountdown] = useState(INTERVAL_SEC);

  useEffect(() => {
    const interval = setInterval(() => {
      startTransition(() => {
        router.refresh();
        setLastUpdated(new Date());
        setCountdown(INTERVAL_SEC);
      });
    }, INTERVAL_SEC * 1000);

    const tick = setInterval(() => {
      setCountdown((c) => Math.max(0, c - 1));
    }, 1000);

    return () => {
      clearInterval(interval);
      clearInterval(tick);
    };
  }, [router]);

  const fmt = (d: Date) =>
    d.toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

  return (
    <div className="flex items-center gap-2 text-xs text-gray-400">
      <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
      <span>最終更新: {fmt(lastUpdated)}</span>
      <span className="text-gray-300">（{countdown}秒後に自動更新）</span>
    </div>
  );
}
