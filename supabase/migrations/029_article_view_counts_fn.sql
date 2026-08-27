-- 記事ごとのarticle_viewイベント数を集計するRPC関数
-- PostgRESTのmax_rows制限を回避するためDB側でGROUP BY集計する
CREATE OR REPLACE FUNCTION get_article_view_counts(article_ids uuid[])
RETURNS TABLE(article_id uuid, pv bigint)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT article_id, COUNT(*) AS pv
  FROM analytics_events
  WHERE event_type = 'article_view'
    AND article_id = ANY(article_ids)
  GROUP BY article_id;
$$;
