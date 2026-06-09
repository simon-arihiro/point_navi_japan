import { createAdminClient } from "@/lib/supabase/server";
import { errorResponse, ErrorCode } from "@/lib/errors";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const supabase = await createAdminClient();
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const category = searchParams.get("category");

  let query = supabase
    .from("services")
    .select(`*, categories:service_categories(category:categories(*)), tags:service_tags(tag:tags(*))`)
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
  const supabase = await createAdminClient();
  const body = await request.json();

  const { name, slug, description, referral_code, referral_link, official_url, logo_url, status } = body;
  if (!name || !slug || !official_url) {
    return errorResponse(ErrorCode.VALIDATION_ERROR, "name, slug, official_url は必須です");
  }

  const { data, error } = await supabase
    .from("services")
    .insert({ name, slug, description: description ?? "", referral_code, referral_link, official_url, logo_url, status: status ?? "active" })
    .select()
    .single();

  if (error) return errorResponse(ErrorCode.INTERNAL_SERVER_ERROR, error.message, 500);
  return Response.json({ data }, { status: 201 });
}
