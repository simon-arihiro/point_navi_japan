-- AIプロンプトライブラリにデフォルトプロンプト機能を追加
-- デフォルトに設定されたプロンプトは、AI記事生成の際に常に最優先指示として自動的に適用される
alter table ai_prompts add column is_default boolean not null default false;

-- 同時にデフォルトになれるのは1件のみ
create unique index ai_prompts_single_default_idx on ai_prompts (is_default) where is_default;
