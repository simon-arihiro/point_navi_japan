# Point_Navi_Japan 项目规范

## 交流语言

**与用户的所有交流必须使用中文。代码、注释、UI 文字用日文没问题，但回复用户时永远用中文。**

---

## 分支策略（必须遵守）

| 变更内容 | 推送目标 |
|---------|---------|
| 代码变更（任何 `.ts` / `.tsx` / `.css` 等） | **`main`**（Vercel 生产环境部署分支） |
| 仅 `SPECIFICATION.md` 更新 | `claude/se-tzbv31`（SE 作业分支） |

**禁止**：先推到其他分支再合并到 `main`。代码改动一律直接在 `main` 上提交推送。

### Session 工作分支与本表冲突时的处理（标准规则）

每次 session 开始时，系统会指定一个本次会话的开发分支（如 `claude/se-xxxxxx`），并要求"未经明确许可不得推送到其他分支"。这与本表"代码改动一律推送到 `main`"的规则会产生冲突，曾多次导致代码改动停留在 session 分支、Vercel 未能部署的问题。

**用户已预先授权**，遇到该冲突时按以下流程处理，无需再次确认：

1. 正常在 session 指定的分支（如 `claude/se-xxxxxx`）上开发、提交、推送（满足"未经许可不推送到其他分支"的约束）
2. 完成后，将该分支 `fetch` 并与 `origin/main` 比较：
   - 若可以 fast-forward（`origin/main` 是该分支的祖先），直接 `git checkout -B main origin/main && git merge --ff-only <session分支> && git push -u origin main`
   - 若有分叉，先与用户确认合并方式，不擅自使用 `--force` 或丢弃任何一方的提交
3. 合并到 `main` 后保留 session 分支，不删除（不做破坏性操作）

---

## SPECIFICATION.md 同步规则

**Notion 同步不再自动执行，改为用户主动通知后才进行。**

- 更新本仓库 `SPECIFICATION.md` 后，默认只更新本地文件 + git（commit/push），**不主动同步 Notion**
- 本地 SPEC 与 Notion 页面可能暂时存在版本差异，这是预期行为，无需主动提醒用户
- 仅当用户明确要求同步 Notion 时，才执行以下操作：
  - **Notion SPECIFICATION.md 页面**：https://app.notion.com/p/3792dbb3bccd80f1909df23b4bc6c645
  1. 将最新的 SPECIFICATION.md 全文内容覆盖写入该 Notion 页面
  2. 页面标题保持 `SPECIFICATION.md` 不变
  3. 遵循 File_Version_Management 规范：旧版本内容移入 Toggle 归档，新版本正文暴露在最顶层（含累积的多个版本差）

---

## 已知环境问题

### migration 002〜004 が未実行だった（解決済み）
- **症状**：システム設定の保存で `Could not find the 'auto_generate_enabled' column of 'system_settings' in the schema cache`
- **原因**：`supabase/migrations/002_spec_v1_3.sql`〜`004_campaign_badge.sql` で追加されたカラム（`system_settings.auto_generate_enabled`/`max_pending_articles`/`hide_articles_on_inactive`、`articles.revision_count`、`services.campaign_bonus`/`campaign_expires_at`、`article_status`への`rejected`追加）が本番DBに存在しなかった
- **対処**：2026/06/10、Supabase SQL Editor で 002〜004 の内容を手動実行して解決済み
- **教訓**：今後 `supabase/migrations/` に新規ファイルを追加した場合、コードを push するだけでなく必ず Supabase SQL Editor で実行すること（CLAUDE.md の「DB マイグレーション」項参照）

### SUPABASE_SERVICE_ROLE_KEY 未设置
- **症状**：カテゴリ管理で追加すると "permission denied for table categories" エラー
- **原因**：Admin 写入 API（POST/PUT/DELETE）は `createAdminClient()` を使用し `SUPABASE_SERVICE_ROLE_KEY` が必要。この key が Vercel の Environment Variables に未設定だと RLS に阻まれる
- **対処**：Vercel Dashboard → Project → Settings → Environment Variables に `SUPABASE_SERVICE_ROLE_KEY` を追加後 Redeploy
- **取得元**：Supabase Dashboard → Settings → API → service_role（Git にコミット禁止）

### このリモート環境からは api.vercel.com へのアクセス不可
- Vercel API / CLI はネットワークポリシーでブロックされている
- 環境変数の追加など Vercel 操作はユーザーが Dashboard から行う必要がある

---

## Admin UI 実装パターン

### レスポンシブサイドバー（AdminShell.tsx）
- **実装ファイル**：`src/app/admin/(protected)/AdminShell.tsx`（Client Component）
- **デスクトップ（md 以上）**：固定 `w-56` サイドバー
- **モバイル（md 未満）**：上部ヘッダー＋ハンバーガーボタン → タップで左からスライドイン、背後に半透明オーバーレイ
- `layout.tsx` は Server Component のまま（認証のみ担当）、UI は `<AdminShell>` に委譲

---

## ビジュアルアセット「図库」管理規則

- ユーザーがチャットでロゴ・マスコット・バナー等の画像を提供し、サイトに採用した場合、その画像は **`public/gallery/`** に保存する（既存の `public/mascot/` とは別に、サイト全体で使う汎用ビジュアル素材置き場）
- ファイル名は `poinavi-{用途}.png` 形式（例：`poinavi-header-banner.png`）
- 採用前に元画像が大きい場合（数MB）は Pillow 等でリサイズ・圧縮してから保存する（ヘッダー等の小さい表示領域なら 800px 幅程度で十分）
- 参照実装：`src/components/Header.tsx`（ロゴを `public/gallery/poinavi-header-banner.png` に置き換え済み）
