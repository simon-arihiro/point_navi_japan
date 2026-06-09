@AGENTS.md

# 第三方依赖一览

## Runtime Dependencies

| パッケージ | バージョン | 用途 |
|-----------|-----------|------|
| `next` | 16.2.7 | フレームワーク本体。破壊的変更あり → 必ず `node_modules/next/dist/docs/` 参照 |
| `react` / `react-dom` | 19.2.4 | UI ライブラリ |
| `@supabase/supabase-js` | ^2.108.0 | Supabase クライアント（DB・Auth・Storage） |
| `@supabase/ssr` | ^0.10.3 | Next.js SSR 用 Supabase クライアント（`createServerClient` / `createBrowserClient`） |
| `@anthropic-ai/sdk` | ^0.102.0 | Claude API クライアント。モデル: `claude-opus-4-8` |

## Dev Dependencies

| パッケージ | バージョン | 用途 |
|-----------|-----------|------|
| `tailwindcss` | ^4 | CSS フレームワーク（v4 — 設定方法が v3 と異なる） |
| `@tailwindcss/postcss` | ^4 | Tailwind v4 の PostCSS プラグイン |
| `typescript` | ^5 | 型チェック |
| `eslint` / `eslint-config-next` | ^9 / 16.2.7 | Lint |
| `@types/node` / `@types/react` / `@types/react-dom` | — | 型定義 |

## 重要な注意点

- **Next.js 16**: `params` は非同期（`await params`）、フォント className は `<html>` に付与、`PageProps<"/path">` グローバルヘルパーを使用
- **Tailwind v4**: `tailwind.config.js` 不要、CSS で `@import "tailwindcss"` を使用
- **@supabase/ssr**: `createServerClient` はサーバーコンポーネント・Route Handler 用、`createBrowserClient` はクライアントコンポーネント用
- **ANTHROPIC_API_KEY** 未設定時は AI 生成機能のみ失敗（サイト本体は正常動作）

## 外部サービス

| サービス | 用途 | 無料枠 |
|---------|------|--------|
| Supabase | DB (PostgreSQL) + Auth + Storage | 500MB DB / 50K MAU |
| Vercel | ホスティング + Cron Jobs | Hobby プラン無料 |
| Anthropic API | AI 記事生成（Claude） | 従量課金のみ（$5〜） |
