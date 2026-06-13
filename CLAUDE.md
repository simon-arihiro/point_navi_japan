@AGENTS.md

# 交流语言规范

**与用户的所有交流必须使用中文。**
代码、注释、UI文字使用日文没问题，但回复用户时永远用中文。

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
- **GEMINI_API_KEY** 未設定・無料枠上限時はサムネイル自動生成のみ失敗（記事生成自体は成功し、本文内の最初の画像にフォールバック）

## 外部サービス

| サービス | 用途 | 無料枠 |
|---------|------|--------|
| Supabase | DB (PostgreSQL) + Auth + Storage | 500MB DB / 50K MAU |
| Vercel | ホスティング + Cron Jobs | Hobby プラン無料 |
| Anthropic API | AI 記事生成（Claude） | 従量課金のみ（$5〜） |

---

# 環境変数・API 情報

## Supabase

| 項目 | 値 |
|------|-----|
| Project URL | `https://ulkvbkrhyndjnrckfptt.supabase.co` |
| Project Ref | `ulkvbkrhyndjnrckfptt` |
| Anon Key (公開可) | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVsa3Via3JoeW5kam5yY2tmcHR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA5ODE4MzEsImV4cCI6MjA5NjU1NzgzMX0.rnGQo8R-MQx-vy1lw41Z4CJXcIhhuq3HmalS8lhWg4I` |
| ダッシュボード | https://supabase.com/dashboard/project/ulkvbkrhyndjnrckfptt |
| SQL Editor | https://supabase.com/dashboard/project/ulkvbkrhyndjnrckfptt/sql |

> **Service Role Key は秘密鍵のため git には記載しない。**
> `.env.local` と Vercel Dashboard の Environment Variables に保管すること。

## Vercel

| 項目 | 値 |
|------|-----|
| リポジトリ | `kaunehyn5/point_navi_japan` |
| デプロイブランチ | `main`（コード変更は必ずここに push） |
| ダッシュボード | https://vercel.com/dashboard |
| 本番ドメイン（予定） | `jp-point-navi.com` |

## 環境変数まとめ（Vercel Dashboard に設定する）

| 変数名 | 値 / 保管場所 |
|--------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://ulkvbkrhyndjnrckfptt.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `sb_publishable_xEp9_5ntGtb09GxAzfSHgg__GBYv_c7` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Dashboard → Settings → API → service_role |
| `CRON_SECRET` | `dd48e776ebcfe52a48251c87483f3c0e02c2cf0ad75dd5af` |
| `ANTHROPIC_API_KEY` | console.anthropic.com → API Keys（未取得） |
| `GEMINI_API_KEY` | Google AI Studio (aistudio.google.com) → Get API key。記事サムネイル自動生成（`src/lib/ai/gemini.ts`）で使用。無料枠は1日あたりのモデル別リクエスト数に上限あり |
| `NEXT_PUBLIC_SITE_URL` | `https://jp-point-navi.com`（独自ドメイン接続後。接続前は Vercel デプロイ後に発行される `*.vercel.app` ドメイン） |

## DB マイグレーション

- ファイル: `supabase/migrations/*.sql`（001〜004、実行済み）
- 実行場所: Supabase SQL Editor（上記リンク）
- **`supabase/migrations/` に新しい .sql ファイルを追加したら、必ず Supabase SQL Editor で手動実行すること（自動適用されない）**
- 未実行のまま該当カラムを使う API を呼ぶと `Could not find the 'xxx' column of 'yyy' in the schema cache` エラーになる（`NOTIFY pgrst, 'reload schema'` では直らない＝カラム自体が存在しない）
- `ALTER TYPE ... ADD VALUE IF NOT EXISTS` を含む migration は、その値を同一トランザクション内で使う文と分けて実行する
