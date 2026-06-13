export const ErrorCode = {
  VALIDATION_ERROR: 1000,
  SERVICE_NOT_FOUND: 1001,
  ARTICLE_NOT_FOUND: 1002,
  AUTH_FAILED: 1003,
  PERMISSION_DENIED: 1004,
  AI_GENERATION_FAILED: 1005,
  DISTRIBUTION_FAILED: 1006,
  ANALYTICS_WRITE_FAILED: 1007,
  IMAGE_FETCH_FAILED: 1008,
  INTERNAL_SERVER_ERROR: 5000,
} as const;

export type ErrorCodeValue = (typeof ErrorCode)[keyof typeof ErrorCode];

export function errorResponse(code: ErrorCodeValue, message: string, status = 400) {
  return Response.json({ error: { code, message } }, { status });
}

// slugのユニーク制約違反（PostgreSQL: 23505）かどうかを判定する
export function isSlugConflict(error: { code?: string; message?: string } | null): boolean {
  return error?.code === "23505" && !!error.message?.includes("slug");
}

export const SLUG_CONFLICT_MESSAGE = "このスラッグは既に使用されています。別のスラッグを指定してください。";
