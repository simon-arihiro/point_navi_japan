import { createAdminClient } from "@/lib/supabase/server";
import { errorResponse, ErrorCode } from "@/lib/errors";
import { NextRequest } from "next/server";

export async function GET() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("publish_schedules")
    .select("*")
    .order("hour", { ascending: true })
    .order("minute", { ascending: true });

  if (error) return errorResponse(ErrorCode.INTERNAL_SERVER_ERROR, error.message, 500);
  return Response.json({ data });
}

export async function POST(request: NextRequest) {
  const supabase = createAdminClient();
  const body = await request.json();
  const { hour, minute = 0, count, enabled = true } = body;

  if (typeof hour !== "number" || hour < 0 || hour > 23) {
    return errorResponse(ErrorCode.VALIDATION_ERROR, "hour は 0〜23 の数値で指定してください");
  }
  if (typeof count !== "number" || count < 1) {
    return errorResponse(ErrorCode.VALIDATION_ERROR, "count は 1 以上の数値で指定してください");
  }

  const { data, error } = await supabase
    .from("publish_schedules")
    .insert({ hour, minute, count, enabled })
    .select("*")
    .single();

  if (error) return errorResponse(ErrorCode.INTERNAL_SERVER_ERROR, error.message, 500);
  return Response.json({ data }, { status: 201 });
}
