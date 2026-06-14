import { createAdminClient } from "@/lib/supabase/server";
import { errorResponse, ErrorCode } from "@/lib/errors";
import { NextRequest } from "next/server";

export async function GET() {
  const supabase = createAdminClient();
  const { data, error } = await supabase.from("system_settings").select("*").eq("id", 1).single();
  if (error) return errorResponse(ErrorCode.INTERNAL_SERVER_ERROR, error.message, 500);
  return Response.json({ data });
}

export async function PUT(request: NextRequest) {
  const supabase = createAdminClient();
  const body = await request.json();
  const {
    operation_mode,
    auto_generate_enabled,
    auto_distribution,
    daily_article_count,
    max_pending_articles,
    ranking_window_days,
    hide_articles_on_inactive,
    ai_multi_provider_enabled,
    ai_provider_settings,
    thumbnail_auto_generate,
  } = body;

  const { data, error } = await supabase
    .from("system_settings")
    .update({
      operation_mode,
      auto_generate_enabled,
      auto_distribution,
      daily_article_count,
      max_pending_articles,
      ranking_window_days,
      hide_articles_on_inactive,
      ai_multi_provider_enabled,
      ai_provider_settings,
      thumbnail_auto_generate,
    })
    .eq("id", 1)
    .select()
    .single();

  if (error) return errorResponse(ErrorCode.INTERNAL_SERVER_ERROR, error.message, 500);
  return Response.json({ data });
}
