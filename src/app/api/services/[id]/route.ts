import { createAdminClient } from "@/lib/supabase/server";
import { errorResponse, ErrorCode } from "@/lib/errors";
import { NextRequest } from "next/server";

export async function GET(_req: NextRequest, props: RouteContext<"/api/services/[id]">) {
  const { id } = await props.params;
  const supabase = await createAdminClient();

  const { data, error } = await supabase
    .from("services")
    .select(`*, categories:service_categories(category:categories(*)), tags:service_tags(tag:tags(*)), images:service_images(*)`)
    .eq("id", id)
    .single();

  if (error || !data) return errorResponse(ErrorCode.SERVICE_NOT_FOUND, "サービスが見つかりません", 404);
  return Response.json({ data });
}

export async function PUT(request: NextRequest, props: RouteContext<"/api/services/[id]">) {
  const { id } = await props.params;
  const supabase = await createAdminClient();
  const body = await request.json();

  const { data, error } = await supabase
    .from("services")
    .update(body)
    .eq("id", id)
    .select()
    .single();

  if (error || !data) return errorResponse(ErrorCode.SERVICE_NOT_FOUND, "サービスが見つかりません", 404);
  return Response.json({ data });
}

export async function DELETE(_req: NextRequest, props: RouteContext<"/api/services/[id]">) {
  const { id } = await props.params;
  const supabase = await createAdminClient();

  const { error } = await supabase.from("services").delete().eq("id", id);
  if (error) return errorResponse(ErrorCode.INTERNAL_SERVER_ERROR, error.message, 500);
  return new Response(null, { status: 204 });
}
