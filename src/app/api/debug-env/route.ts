export async function GET() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
  return Response.json({
    has_key: key.length > 0,
    length: key.length,
    prefix: key.slice(0, 20),
    suffix: key.slice(-10),
  });
}
