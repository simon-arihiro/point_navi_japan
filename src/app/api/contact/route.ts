import { createAdminClient } from "@/lib/supabase/server";
import { errorResponse, ErrorCode } from "@/lib/errors";
import { NextRequest } from "next/server";

// お問い合わせフォームの送信（公開）
export async function POST(request: NextRequest) {
  const body = await request.json();
  const name = (body.name ?? "").trim();
  const email = (body.email ?? "").trim();
  const message = (body.message ?? "").trim();

  if (!name || !email || !message) {
    return errorResponse(ErrorCode.VALIDATION_ERROR, "お名前・メールアドレス・お問い合わせ内容は必須です");
  }

  const supabase = createAdminClient();
  const { error } = await supabase.from("contact_messages").insert({ name, email, message });
  if (error) {
    return errorResponse(ErrorCode.INTERNAL_SERVER_ERROR, error.message, 500);
  }

  return Response.json({ ok: true });
}

// お問い合わせ一覧の取得（Admin）
export async function GET() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("contact_messages")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return errorResponse(ErrorCode.INTERNAL_SERVER_ERROR, error.message, 500);
  }

  return Response.json({ data });
}
