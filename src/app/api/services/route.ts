import { createAdminClient } from "@/lib/supabase/server";
import { errorResponse, ErrorCode, isSlugConflict, SLUG_CONFLICT_MESSAGE, NAME_CONFLICT_MESSAGE } from "@/lib/errors";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const supabase = createAdminClient();
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const category = searchParams.get("category");

  let query = supabase
    .from("services")
    .select(`*, categories:service_categories(category:categories(*)), tags:service_tags(tag:tags(*))`)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (status) query = query.eq("status", status);

  const { data, error } = await query;
  if (error) return errorResponse(ErrorCode.INTERNAL_SERVER_ERROR, error.message, 500);

  let services = data ?? [];
  if (category) {
    services = services.filter((s: any) =>
      s.categories?.some((c: any) => c.category?.slug === category)
    );
  }

  return Response.json({ data: services });
}

export async function POST(request: NextRequest) {
  const supabase = createAdminClient();
  const body = await request.json();

  const { name, slug, description, referral_code, referral_link, bonus_points, bonus_amount, campaign_bonus, campaign_expires_at, official_url, logo_url, status, category_ids } = body;
  if (!name || !slug || !official_url) {
    return errorResponse(ErrorCode.VALIDATION_ERROR, "name, slug, official_url は必須です");
  }

  // 同名サービスの重複チェック（ゴミ箱内のレコードは対象外）
  const { data: duplicate } = await supabase
    .from("services")
    .select("id")
    .is("deleted_at", null)
    .eq("name", name.trim())
    .maybeSingle();
  if (duplicate) {
    return errorResponse(ErrorCode.VALIDATION_ERROR, NAME_CONFLICT_MESSAGE);
  }

  const { data, error } = await supabase
    .from("services")
    .insert({ name, slug, description: description ?? "", referral_code, referral_link, bonus_points: bonus_points ?? null, bonus_amount: bonus_amount ?? null, campaign_bonus: campaign_bonus ?? null, campaign_expires_at: campaign_expires_at ?? null, official_url, logo_url, status: status ?? "active" })
    .select()
    .single();

  if (error) {
    if (isSlugConflict(error)) return errorResponse(ErrorCode.VALIDATION_ERROR, SLUG_CONFLICT_MESSAGE);
    return errorResponse(ErrorCode.INTERNAL_SERVER_ERROR, error.message, 500);
  }

  if (Array.isArray(category_ids) && category_ids.length > 0) {
    const { error: catError } = await supabase
      .from("service_categories")
      .insert(category_ids.map((category_id: string) => ({ service_id: data.id, category_id })));
    if (catError) return errorResponse(ErrorCode.INTERNAL_SERVER_ERROR, catError.message, 500);
  }

  return Response.json({ data }, { status: 201 });
}
