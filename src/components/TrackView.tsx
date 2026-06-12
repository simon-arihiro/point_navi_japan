"use client";

import { useEffect } from "react";
import { EventType } from "@/types/database";

type Props = {
  eventType: EventType;
  serviceId?: string | null;
  articleId?: string | null;
};

/**
 * Next.js のクライアントサイドナビゲーション（<Link>）では <script> タグの
 * dangerouslySetInnerHTML は実行されないため、useEffect でビュートラッキングを行う。
 */
export default function TrackView({ eventType, serviceId, articleId }: Props) {
  useEffect(() => {
    fetch("/api/analytics/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event_type: eventType, service_id: serviceId ?? null, article_id: articleId ?? null }),
    });
  }, [eventType, serviceId, articleId]);

  return null;
}
