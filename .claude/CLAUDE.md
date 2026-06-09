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

---

## SPECIFICATION.md 同步规则

每次更新本仓库的 `SPECIFICATION.md` 文件后，必须同步更新 Notion 中对应页面：

- **Notion SPECIFICATION.md 页面**：https://app.notion.com/p/3792dbb3bccd80f1909df23b4bc6c645

操作要求：
1. 将最新的 SPECIFICATION.md 全文内容覆盖写入该 Notion 页面
2. 页面标题保持 `SPECIFICATION.md` 不变
3. 遵循 File_Version_Management 规范：旧版本内容移入 Toggle 归档，新版本正文暴露在最顶层
4. 严禁只更新 GitHub 而不同步 Notion，两者必须始终保持一致

---

## 已知环境问题

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
