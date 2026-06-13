import { createAdminClient } from "@/lib/supabase/server";
import { NextRequest } from "next/server";

// 指定タイプの未読通知をすべて既読にする
export async function PATCH(request: NextRequest) {
  const { type } = await request.json();
  const supabase = createAdminClient();
  await supabase.from("admin_notifications").update({ is_read: true }).eq("type", type).eq("is_read", false);
  return Response.json({ ok: true });
}
