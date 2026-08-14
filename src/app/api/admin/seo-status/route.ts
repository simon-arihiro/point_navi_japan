import { createAdminClient } from "@/lib/supabase/server";
import { NextRequest } from "next/server";

// GET /api/admin/seo-status → 全ステータス取得
export async function GET() {
  const supabase = createAdminClient();
  const { data, error } = await supabase.from("seo_keyword_status").select("*");
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ data: data ?? [] });
}

// PUT /api/admin/seo-status { query, status, notes? } → upsert
export async function PUT(request: NextRequest) {
  const { query, status, notes } = await request.json();
  if (!query || !status) return Response.json({ error: "query and status are required" }, { status: 400 });
  const supabase = createAdminClient();
  const { error } = await supabase.from("seo_keyword_status").upsert(
    { query, status, notes: notes ?? null, updated_at: new Date().toISOString() },
    { onConflict: "query" }
  );
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ ok: true });
}
