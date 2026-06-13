-- analytics_events に SELECT の公開ポリシーがなく、anon キーで集計（getServiceStatsMap など）を
-- 行うと「本日分」イベントが読めず PV が 0 扱いになる不具合を修正。
-- analytics_daily の public_read_analytics_daily と同様に、集計済みデータは公開閲覧可とする。

create policy "public_read_analytics_events" on analytics_events for select using (true);
