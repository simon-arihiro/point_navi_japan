import { createAdminClient } from "@/lib/supabase/server";

export const ARTICLE_IMAGES_BUCKET = "article-images";

const EXT_BY_MEDIA_TYPE: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/gif": "gif",
  "image/webp": "webp",
};

// AI記事生成で添付された画像をSupabase Storageに保存し、公開URLを返す
export async function uploadArticleImage(serviceId: string, base64Data: string, mediaType: string): Promise<string | null> {
  const ext = EXT_BY_MEDIA_TYPE[mediaType] ?? "png";
  const path = `${serviceId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const buffer = Buffer.from(base64Data, "base64");

  const supabase = createAdminClient();
  const { error } = await supabase.storage.from(ARTICLE_IMAGES_BUCKET).upload(path, buffer, {
    contentType: mediaType,
    upsert: false,
  });
  if (error) return null;

  const { data } = supabase.storage.from(ARTICLE_IMAGES_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
