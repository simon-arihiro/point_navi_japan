-- サービスごとのarticle_view + service_viewイベント数を集計するRPC関数
-- PostgRESTのmax_rows制限を回避するためDB側でGROUP BY集計する
CREATE OR REPLACE FUNCTION get_service_total_view_counts()
RETURNS TABLE(service_id uuid, pv bigint)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT service_id, COUNT(*) AS pv
  FROM analytics_events
  WHERE event_type IN ('service_view', 'article_view')
    AND service_id IS NOT NULL
  GROUP BY service_id;
$$;
