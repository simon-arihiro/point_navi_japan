import { createAdminClient } from "@/lib/supabase/server";
import { errorResponse, ErrorCode } from "@/lib/errors";
import { NextRequest } from "next/server";

export async function PUT(request: NextRequest, props: RouteContext<"/api/admin/publish-schedules/[id]">) {
  const { id } = await props.params;
  const supabase = createAdminClient();
  const body = await request.json();
  const { hour, minute, count, enabled } = body;

  const fields: Record<string, unknown> = {};
  if (hour !== undefined) fields.hour = hour;
  if (minute !== undefined) fields.minute = minute;
  if (count !== undefined) fields.count = count;
  if (enabled !== undefined) fields.enabled = enabled;

  const { data, error } = await supabase
    .from("publish_schedules")
    .update(fields)
    .eq("id", id)
    .select("*")
    .single();

  if (error || !data) return errorResponse(ErrorCode.INTERNAL_SERVER_ERROR, error?.message ?? "タイマーが見つかりません", 404);
  return Response.json({ data });
}

export async function DELETE(_req: NextRequest, props: RouteContext<"/api/admin/publish-schedules/[id]">) {
  const { id } = await props.params;
  const supabase = createAdminClient();

  const { error } = await supabase.from("publish_schedules").delete().eq("id", id);
  if (error) return errorResponse(ErrorCode.INTERNAL_SERVER_ERROR, error.message, 500);
  return new Response(null, { status: 204 });
}
