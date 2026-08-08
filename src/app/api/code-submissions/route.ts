import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { NextRequest } from "next/server";
import { createHash } from "crypto";

// レート制限: 同一IPから1分間に1回まで
const RATE_LIMIT_SECONDS = 60;
// サービスごとの最大投稿数
const MAX_POSTS_PER_SERVICE = 10;

function hashIp(ip: string): string {
  return createHash("sha256").update(ip + (process.env.CRON_SECRET ?? "")).digest("hex").slice(0, 32);
}

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  );
}

// RLS無効のため anon key で全操作可能
function getClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } }
  );
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const serviceId = searchParams.get("service_id");
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "10"), 100);
  const keyword = searchParams.get("keyword");

  const db = getClient();
  let query = db
    .from("code_submissions")
    .select("id, service_id, nickname, referral_code, comment, created_at, service:services!code_submissions_service_id_fkey(name, logo_url, logo_storage_path, slug)")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (serviceId) query = query.eq("service_id", serviceId);
  if (keyword) query = query.or(`referral_code.ilike.%${keyword}%,comment.ilike.%${keyword}%`);

  const { data, error } = await query;
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ submissions: data ?? [] });
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const ipHash = hashIp(ip);

  const { service_id, nickname, comment } = await request.json();

  // バリデーション
  if (!service_id) return Response.json({ error: "サービスを選択してください" }, { status: 400 });
  if (!comment?.trim()) return Response.json({ error: "コメントを入力してください" }, { status: 400 });
  if (comment.trim().length > 500) return Response.json({ error: "コメントは500文字以内にしてください" }, { status: 400 });

  const db = getClient();

  // レート制限チェック（RLS無効なのでanon keyで読める）
  const since = new Date(Date.now() - RATE_LIMIT_SECONDS * 1000).toISOString();
  const { data: recentPost } = await db
    .from("code_submissions")
    .select("created_at")
    .eq("ip_hash", ipHash)
    .gte("created_at", since)
    .limit(1)
    .maybeSingle();

  if (recentPost) {
    const wait = Math.ceil((new Date(recentPost.created_at).getTime() + RATE_LIMIT_SECONDS * 1000 - Date.now()) / 1000);
    return Response.json(
      { error: "連続投稿はできません。しばらく待ってから投稿してください。" },
      { status: 429 }
    );
  }

  // サービスが存在するか確認
  const { data: service } = await db
    .from("services")
    .select("id")
    .eq("id", service_id)
    .eq("status", "active")
    .maybeSingle();
  if (!service) return Response.json({ error: "サービスが見つかりません" }, { status: 404 });

  // 投稿
  const { data, error } = await db.from("code_submissions").insert({
    service_id,
    nickname: nickname?.trim() || "ななしの投稿者",
    referral_code: "",
    comment: comment.trim(),
    ip_hash: ipHash,
  }).select("id").single();

  if (error) return Response.json({ error: error.message }, { status: 500 });

  // 最大10件を超えたら最古の投稿を削除
  const { data: allPosts } = await db
    .from("code_submissions")
    .select("id, created_at")
    .eq("service_id", service_id)
    .order("created_at", { ascending: false });

  if (allPosts && allPosts.length > MAX_POSTS_PER_SERVICE) {
    const toDelete = allPosts.slice(MAX_POSTS_PER_SERVICE).map((p) => p.id);
    await db.from("code_submissions").delete().in("id", toDelete);
  }

  return Response.json({ ok: true, id: data.id });
}
