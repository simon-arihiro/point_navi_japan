---
name: db-migration-check
description: point_navi_japan で supabase/migrations/ に新しい .sql ファイルを追加・変更した時、またはそのマイグレーションが追加するカラム/型を使うコードをpushする前に必ず使う。Supabase SQL Editorでの手動実行を忘れて「Could not find the column in the schema cache」エラーが起きる既知の事故を防ぐためのチェック。
---

# DBマイグレーション確認スキル（point_navi_japan）

このプロジェクトでは migration が **自動適用されない**（過去に002〜004を手動実行し忘れて本番障害になった実績あり、`.claude/CLAUDE.md` 参照）。

## 必須フロー

1. **`supabase/migrations/` に新規 `.sql` ファイルを追加・変更したら、コードのpushとは別に必ずユーザーに次を伝える**
   - 「Supabase SQL Editor（https://supabase.com/dashboard/project/ulkvbkrhyndjnrckfptt/sql）で `XXX.sql` の内容を手動実行してください」
   - これを伝えずにコードだけpushして完了報告しない

2. **`ALTER TYPE ... ADD VALUE IF NOT EXISTS` を含むmigrationの場合**
   - 同一トランザクション内でその値を使うSQL文を実行できない制約があるため、ENUM追加とその値を使うUPDATE/INSERT文は**別々のSQL実行**に分割するよう案内する

3. **新しいカラムを使うAPIコードを書く前に**
   - そのカラムが既存のマイグレーションで既に追加済みか（`supabase/migrations/` を検索）、まだ追加していないなら新規migrationファイルを先に作る
   - 新規カラムを使うコードだけ先にpushして、migration未実行のまま本番で動かすと `Could not find the 'xxx' column ... in the schema cache` エラーになる（`NOTIFY pgrst, 'reload schema'` では直らない＝カラム自体が存在しないため）

4. **作業完了報告時のチェック**
   - 「migration済」を報告する前に、実際にユーザーがSQL Editorで実行したかを確認する（このサンドボックスからは直接実行できないため、必ずユーザー作業が必要）

## 環境制約

- このリモート環境からSupabase（`*.supabase.co`）への直接アクセスは不可（DNS解決不可）。マイグレーション実行は必ずユーザーがSupabase Dashboard上で行う
