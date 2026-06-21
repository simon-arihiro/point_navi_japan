import { createAdminClient } from "@/lib/supabase/server";
import { repairBrokenImageMarkdown } from "@/lib/markdown";
import { errorResponse, ErrorCode } from "@/lib/errors";

// AIが ![alt] と (url) を改行で分断してしまい画像が表示されなくなった既存記事を一括修復する
export async function POST() {
  const supabase = createAdminClient();
  const { data: articles, error } = await supabase
    .from("articles")
    .select("id, content")
    .is("deleted_at", null);

  if (error) return errorResponse(ErrorCode.INTERNAL_SERVER_ERROR, error.message, 500);

  let fixed = 0;
  for (const a of articles ?? []) {
    if (!a.content) continue;
    const repaired = repairBrokenImageMarkdown(a.content);
    if (repaired === a.content) continue;
    const { error: updateError } = await supabase.from("articles").update({ content: repaired }).eq("id", a.id);
    if (!updateError) fixed += 1;
  }

  return Response.json({ fixed, total: articles?.length ?? 0 });
}
