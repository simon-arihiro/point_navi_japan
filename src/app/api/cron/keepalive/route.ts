import { createAdminClient } from "@/lib/supabase/server";
import { NextRequest } from "next/server";

// Vercel Cron: 3日ごとにSupabaseへ軽量クエリを送りプロジェクトの自動停止を防ぐ
// vercel.json: "crons": [{"path": "/api/cron/keepalive", "schedule": "0 12 */3 * *"}]
async function handler(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = await createAdminClient();
  const { count, error } = await supabase
    .from("categories")
    .select("*", { count: "exact", head: true });

  if (error) {
    console.error("[keepalive] Supabase error:", error.message);
    return Response.json({ ok: false, error: error.message }, { status: 500 });
  }

  console.log("[keepalive] ok, categories count:", count);
  return Response.json({ ok: true, count });
}

// VercelのCronは実際にはGETでリクエストする。Run（手動実行）ボタンや外部スケジューラからのPOSTにも対応
export const GET = handler;
export const POST = handler;
