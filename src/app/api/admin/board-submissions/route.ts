import { createAdminClient } from "@/lib/supabase/server";
import { NextRequest } from "next/server";

export async function GET() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("code_submissions")
    .select("id, service_id, nickname, referral_code, comment, created_at, ip_hash, service:services!code_submissions_service_id_fkey(name)")
    .order("created_at", { ascending: false })
    .limit(500);

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ submissions: data ?? [] });
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return Response.json({ error: "id is required" }, { status: 400 });

  const supabase = createAdminClient();
  const { error } = await supabase.from("code_submissions").delete().eq("id", id);
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ ok: true });
}
