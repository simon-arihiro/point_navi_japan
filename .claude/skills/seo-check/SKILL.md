---
name: seo-check
description: point_navi_japan プロジェクトでSEOに関わるページ（新規ルート、記事/サービス詳細ページ、sitemap対象になりうるページ）を追加・変更した際のチェックリスト。新しい src/app 配下のpage.tsxを追加した時、generateMetadataを書く時、既存ページのメタデータを変更する時に必ず使う。
---

# SEOチェックスキル（point_navi_japan）

新しい公開ページを追加・変更した際、以下を必ず確認する。

## チェックリスト

1. **generateMetadata の有無**
   - `title` / `description` を設定しているか
   - `alternates: { canonical: ... }` を設定しているか（重複URLの正規化）
   - `openGraph` / `twitter`（summary_large_image）を設定しているか
     - 参考実装: `src/app/articles/[category-slug]/[article-slug]/page.tsx`, `src/app/services/[category-slug]/[service-slug]/page.tsx`

2. **sitemap.ts への反映**
   - `src/app/sitemap.ts` に新しいルートが含まれているか確認する
   - 紹介記事（`article_type === "introduction"`）はサービス詳細ページへ301リダイレクトされるため sitemap からは除外する設計（既存の意図的な仕様）

3. **robots.ts との整合**
   - 管理画面・APIルート以外で意図せず disallow されていないか
   - 逆に管理画面配下（`/admin`）の新規ページが disallow に含まれているか

4. **構造化データ（JSON-LD）**
   - 記事ページ: Article + BreadcrumbList（既存実装参照）
   - サービスページ: 必要であれば Product/Organization の追加を検討
   - FAQ的な見出し構成を持つ記事は FAQPage schema の追加余地がある

5. **GoogleAnalytics の計測除外範囲**
   - `/admin` 配下を計測対象に含めていないか確認（`src/components/GoogleAnalytics.tsx` の `pathname?.startsWith("/admin")` 判定）
   - 新しい管理用ルートを `/admin` 以外の場所に作った場合、同様の除外が必要か検討する

6. **内部リンク**
   - 新規記事/サービスページから既存の関連コンテンツへのリンク（関連記事サイドバー等）が機能しているか

## 既知の注意点

- `featured_image_url` が未設定の記事は OG画像が `poinavi-header-banner-lg.png` にフォールバックする（`src/app/articles/[category-slug]/[article-slug]/page.tsx`）
- サービスのロゴは `logo_storage_path` → `logo_url` → デフォルト画像の優先順でOG画像を解決する
