import { NextRequest } from "next/server";

// Vercel Cron: 毎日 JST 09:00（UTC 00:00）に呼び出し
// vercel.json: "crons": [{"path": "/api/cron/generate-article", "schedule": "0 0 * * *"}]
// 現バージョンは運用モード MANUAL のみ対応のため、AI記事の自動生成は行わない（後続バージョンで対応予定）
export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  return Response.json({ ok: true, generated: 0, reason: "auto_generation_not_supported_in_this_version" });
}
