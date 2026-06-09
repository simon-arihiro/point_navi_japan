import { createAdminClient } from "@/lib/supabase/server";
import { errorResponse, ErrorCode } from "@/lib/errors";
import { NextRequest } from "next/server";

export async function GET() {
  const supabase = createAdminClient();
  const { data, error } = await supabase.from("categories").select("*").order("name");
  if (error) return errorResponse(ErrorCode.INTERNAL_SERVER_ERROR, error.message, 500);
  return Response.json({ data });
}

function toSlug(name: string): string {
  const base = name.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  return base || `cat-${Date.now()}`;
}

export async function POST(request: NextRequest) {
  const supabase = createAdminClient();
  const body = await request.json();
  const { name } = body;
  if (!name) return errorResponse(ErrorCode.VALIDATION_ERROR, "name is required", 400);

  const slug = toSlug(name);
  const { data, error } = await supabase.from("categories").insert({ name, slug }).select().single();
  if (error) return errorResponse(ErrorCode.INTERNAL_SERVER_ERROR, error.message, 500);
  return Response.json({ data }, { status: 201 });
}
