import { createAdminClient } from "@/lib/supabase/server";
import { errorResponse, ErrorCode } from "@/lib/errors";
import { NextRequest } from "next/server";

export async function GET() {
  const supabase = await createAdminClient();
  const { data, error } = await supabase.from("tags").select("*").order("name");
  if (error) return errorResponse(ErrorCode.INTERNAL_SERVER_ERROR, error.message, 500);
  return Response.json({ data });
}

export async function POST(request: NextRequest) {
  const supabase = await createAdminClient();
  const body = await request.json();
  const { name, slug } = body;
  if (!name || !slug) return errorResponse(ErrorCode.VALIDATION_ERROR, "name and slug are required", 400);

  const { data, error } = await supabase.from("tags").insert({ name, slug }).select().single();
  if (error) return errorResponse(ErrorCode.INTERNAL_SERVER_ERROR, error.message, 500);
  return Response.json({ data }, { status: 201 });
}
