import { createAdminClient } from "@/lib/supabase/server";
import { errorResponse, ErrorCode } from "@/lib/errors";
import { NextRequest } from "next/server";
import { EventType } from "@/types/database";

const VALID_EVENTS: EventType[] = [
  "page_view", "service_view", "article_view",
  "copy_code", "referral_click", "share_link", "ranking_click",
];

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { event_type, service_id, article_id, session_id, metadata } = body;

  if (!event_type || !VALID_EVENTS.includes(event_type)) {
    return errorResponse(ErrorCode.VALIDATION_ERROR, "有効な event_type が必要です");
  }

  const ua = request.headers.get("user-agent") ?? "";
  const device = /Mobile|Android|iPhone/i.test(ua) ? "mobile" : "desktop";
  const source = request.headers.get("referer") ?? "";

  const supabase = createAdminClient();
  const { error } = await supabase.from("analytics_events").insert({
    event_type,
    service_id: service_id ?? null,
    article_id: article_id ?? null,
    session_id: session_id ?? "",
    source,
    device,
    metadata: metadata ?? {},
  });

  if (error) return errorResponse(ErrorCode.ANALYTICS_WRITE_FAILED, error.message, 500);
  return Response.json({ ok: true });
}
