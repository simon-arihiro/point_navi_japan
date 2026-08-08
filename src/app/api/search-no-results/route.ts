import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { NextRequest } from "next/server";

function getClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } }
  );
}

export async function POST(request: NextRequest) {
  const { keyword, page = "codes" } = await request.json();
  if (!keyword?.trim()) return Response.json({ ok: true });

  const db = getClient();
  await db.from("search_no_results_log").insert({
    keyword: keyword.trim().slice(0, 100),
    page,
  });

  return Response.json({ ok: true });
}
