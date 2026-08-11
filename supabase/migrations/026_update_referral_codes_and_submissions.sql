-- 招待コード・referral_code 一括更新
-- 各サービスの最新招待コードをservicesテーブルに反映する

UPDATE services SET referral_code = '837553'    WHERE slug = 'npoopo'          OR name = 'ンポポ';
UPDATE services SET referral_code = 'TVETXSCK'  WHERE slug = 'chadepot'        OR name = 'チャデポ';
UPDATE services SET referral_code = 'S3KTWPX'   WHERE slug = 'kaushe-farm'     OR name ILIKE '%カウシェ%';
UPDATE services SET referral_code = '5IRON45G'  WHERE slug = 'ochibo'          OR name = 'おちぼ';
UPDATE services SET referral_code = 'rbf883847996' WHERE slug = 'point-income' OR name ILIKE '%Point Income%';
UPDATE services SET referral_code = 'RKHNNU'    WHERE slug = 'kulti-point'     OR name ILIKE '%カルティ%';
UPDATE services SET referral_code = 'WGZ4A15c'  WHERE slug = 'moppy'           OR name = 'モッピー';
UPDATE services SET referral_code = '2EGWHI'    WHERE slug = 'freecash'        OR name ILIKE '%freecash%' OR name ILIKE '%フリーキャッシュ%';
UPDATE services SET referral_code = '9QDCYQ'    WHERE slug = 'moneywalk'       OR name ILIKE '%moneywalk%' OR name ILIKE '%マネーウォーク%';
UPDATE services SET referral_code = 'GMK32V4K'  WHERE slug = 'rechichare'      OR name ILIKE '%レシチャレ%';
UPDATE services SET referral_code = 'PG7FBL3'   WHERE slug = 'cashwalk'        OR name ILIKE '%Cashwalk%';
UPDATE services SET referral_code = 'KDUzEI2'   WHERE slug = 'poisha'          OR name ILIKE '%poisha%' OR name ILIKE '%ポイシャ%';
UPDATE services SET referral_code = '3-GW5e_PQ' WHERE slug = 'torima'          OR name = 'トリマ';
UPDATE services SET referral_code = 'MK2XBTCZ'  WHERE slug = 'poitama'         OR name ILIKE '%ぽいたま%';
UPDATE services SET referral_code = 'Y5Qoa6uk'  WHERE slug = 'everypoint'      OR name ILIKE '%エブリポイント%';

-- 招待コード掲示板への投稿サンプルを追加（approved状態で表示される）
-- 既存の同一サービス投稿がある場合はスキップ

INSERT INTO code_submissions (service_id, referral_code, nickname, comment, status, created_at)
SELECT s.id, '837553', 'ポイ活ユーザー',
  'ンポポの招待コードです！よかったら使ってください📱 新規登録で2,000pt（約20円）もらえます。スマホ利用でポイントが貯まります。',
  'approved', NOW() - INTERVAL '2 days'
FROM services s
WHERE (s.slug = 'npoopo' OR s.name = 'ンポポ')
  AND NOT EXISTS (SELECT 1 FROM code_submissions cs WHERE cs.service_id = s.id AND cs.status = 'approved')
LIMIT 1;

INSERT INTO code_submissions (service_id, referral_code, nickname, comment, status, created_at)
SELECT s.id, 'TVETXSCK', 'ポイ活ユーザー',
  'チャデポの招待コードです！お気軽にどうぞ⚡ 新規登録で500pt（約50円）もらえます。充電と歩数でポイントが貯まります。',
  'approved', NOW() - INTERVAL '2 days'
FROM services s
WHERE (s.slug = 'chadepot' OR s.name = 'チャデポ')
  AND NOT EXISTS (SELECT 1 FROM code_submissions cs WHERE cs.service_id = s.id AND cs.status = 'approved')
LIMIT 1;

INSERT INTO code_submissions (service_id, referral_code, nickname, comment, status, created_at)
SELECT s.id, 'S3KTWPX', 'ポイ活ユーザー',
  'カウシェファームの招待コードです🌱 報酬条件達成で「水」や「肥料」がもらえます。作物を育てながら毎日お得に！',
  'approved', NOW() - INTERVAL '2 days'
FROM services s
WHERE (s.name ILIKE '%カウシェ%')
  AND NOT EXISTS (SELECT 1 FROM code_submissions cs WHERE cs.service_id = s.id AND cs.status = 'approved')
LIMIT 1;

INSERT INTO code_submissions (service_id, referral_code, nickname, comment, status, created_at)
SELECT s.id, '5IRON45G', 'ポイ活ユーザー',
  'おちぼの招待コードです！ぜひ使ってください🚶 新規登録で330pt（約36円）もらえます。歩数でポイ活＆おちさん育成も楽しい！',
  'approved', NOW() - INTERVAL '3 days'
FROM services s
WHERE (s.slug = 'ochibo' OR s.name = 'おちぼ')
  AND NOT EXISTS (SELECT 1 FROM code_submissions cs WHERE cs.service_id = s.id AND cs.status = 'approved')
LIMIT 1;

INSERT INTO code_submissions (service_id, referral_code, nickname, comment, status, created_at)
SELECT s.id, 'rbf883847996', 'ポイ活ユーザー',
  'Point Incomeの招待コードです💰 新規登録で2,500pt（約250円）もらえます。実績10年の人気ポイ活サイトです。',
  'approved', NOW() - INTERVAL '3 days'
FROM services s
WHERE (s.name ILIKE '%Point Income%')
  AND NOT EXISTS (SELECT 1 FROM code_submissions cs WHERE cs.service_id = s.id AND cs.status = 'approved')
LIMIT 1;

INSERT INTO code_submissions (service_id, referral_code, nickname, comment, status, created_at)
SELECT s.id, 'RKHNNU', 'ポイ活ユーザー',
  'カルティポイントの招待コードです🚶‍♂️ 新規登録で500pt（約41.5円）もらえます。歩くだけで健康もお得も両立できます。',
  'approved', NOW() - INTERVAL '3 days'
FROM services s
WHERE (s.name ILIKE '%カルティ%')
  AND NOT EXISTS (SELECT 1 FROM code_submissions cs WHERE cs.service_id = s.id AND cs.status = 'approved')
LIMIT 1;

INSERT INTO code_submissions (service_id, referral_code, nickname, comment, status, created_at)
SELECT s.id, 'WGZ4A15c', 'ポイ活ユーザー',
  'モッピーの招待コードです！よかったら使ってください✨ 新規登録で200pt（約200円）もらえます。国内最大級の安心ポイ活サイトです。',
  'approved', NOW() - INTERVAL '4 days'
FROM services s
WHERE (s.slug = 'moppy' OR s.name = 'モッピー')
  AND NOT EXISTS (SELECT 1 FROM code_submissions cs WHERE cs.service_id = s.id AND cs.status = 'approved')
LIMIT 1;

INSERT INTO code_submissions (service_id, referral_code, nickname, comment, status, created_at)
SELECT s.id, '2EGWHI', 'ポイ活ユーザー',
  'freecashの招待コードです🎮 新規登録で最大約250ドル（約37,500円）相当もらえます。遊んで貯める多様な出金方法が魅力です。',
  'approved', NOW() - INTERVAL '4 days'
FROM services s
WHERE (s.name ILIKE '%freecash%' OR s.name ILIKE '%フリーキャッシュ%')
  AND NOT EXISTS (SELECT 1 FROM code_submissions cs WHERE cs.service_id = s.id AND cs.status = 'approved')
LIMIT 1;

INSERT INTO code_submissions (service_id, referral_code, nickname, comment, status, created_at)
SELECT s.id, '9QDCYQ', 'ポイ活ユーザー',
  'moneyWalkの招待コードです🚶 新規登録で500pt（約25〜30円）もらえます。歩くだけで健康もお得も両方ゲット！',
  'approved', NOW() - INTERVAL '4 days'
FROM services s
WHERE (s.name ILIKE '%moneywalk%' OR s.name ILIKE '%マネーウォーク%')
  AND NOT EXISTS (SELECT 1 FROM code_submissions cs WHERE cs.service_id = s.id AND cs.status = 'approved')
LIMIT 1;

INSERT INTO code_submissions (service_id, referral_code, nickname, comment, status, created_at)
SELECT s.id, 'GMK32V4K', 'ポイ活ユーザー',
  'レシチャレの招待コードです🧾 新規登録で5,000pt（約50円）もらえます。レシート撮影でコインが貯まり、歩いてもチラシ見てもお得！',
  'approved', NOW() - INTERVAL '5 days'
FROM services s
WHERE (s.name ILIKE '%レシチャレ%')
  AND NOT EXISTS (SELECT 1 FROM code_submissions cs WHERE cs.service_id = s.id AND cs.status = 'approved')
LIMIT 1;

INSERT INTO code_submissions (service_id, referral_code, nickname, comment, status, created_at)
SELECT s.id, 'PG7FBL3', 'ポイ活ユーザー',
  'Cashwalkの招待コードです🚶‍♀️ 新規登録で500pt（約84円）もらえます。歩いてポイントを貯めて健康もお小遣いも一緒に！',
  'approved', NOW() - INTERVAL '5 days'
FROM services s
WHERE (s.name ILIKE '%Cashwalk%')
  AND NOT EXISTS (SELECT 1 FROM code_submissions cs WHERE cs.service_id = s.id AND cs.status = 'approved')
LIMIT 1;

INSERT INTO code_submissions (service_id, referral_code, nickname, comment, status, created_at)
SELECT s.id, 'KDUzEI2', 'ポイ活ユーザー',
  'poishaの招待コードです📸 新規登録で500pt（約50円）もらえます。写真もいいねもポイントに、SNS感覚でお小遣い稼ぎ！',
  'approved', NOW() - INTERVAL '5 days'
FROM services s
WHERE (s.name ILIKE '%poisha%' OR s.name ILIKE '%ポイシャ%')
  AND NOT EXISTS (SELECT 1 FROM code_submissions cs WHERE cs.service_id = s.id AND cs.status = 'approved')
LIMIT 1;

INSERT INTO code_submissions (service_id, referral_code, nickname, comment, status, created_at)
SELECT s.id, '3-GW5e_PQ', 'ポイ活ユーザー',
  'トリマの招待コードです🚗 新規登録で5,000pt（約50円）もらえます。歩くだけでマイルが貯まり移動が楽しくなるアプリです。',
  'approved', NOW() - INTERVAL '6 days'
FROM services s
WHERE (s.slug = 'torima' OR s.name = 'トリマ')
  AND NOT EXISTS (SELECT 1 FROM code_submissions cs WHERE cs.service_id = s.id AND cs.status = 'approved')
LIMIT 1;

INSERT INTO code_submissions (service_id, referral_code, nickname, comment, status, created_at)
SELECT s.id, 'MK2XBTCZ', 'ポイ活ユーザー',
  'ぽいたまの招待コードです🎯 新規登録で4,000pt（約40円）もらえます。アンケートで毎日コツコツ貯めて現金やギフト券に交換できます。',
  'approved', NOW() - INTERVAL '6 days'
FROM services s
WHERE (s.name ILIKE '%ぽいたま%')
  AND NOT EXISTS (SELECT 1 FROM code_submissions cs WHERE cs.service_id = s.id AND cs.status = 'approved')
LIMIT 1;

INSERT INTO code_submissions (service_id, referral_code, nickname, comment, status, created_at)
SELECT s.id, 'Y5Qoa6uk', 'ポイ活ユーザー',
  'エブリポイントの招待コードです💎 新規登録で5,000pt（約45〜50円）もらえます。歩くだけで毎日コツコツ、健康と副収入を両立！',
  'approved', NOW() - INTERVAL '6 days'
FROM services s
WHERE (s.name ILIKE '%エブリポイント%')
  AND NOT EXISTS (SELECT 1 FROM code_submissions cs WHERE cs.service_id = s.id AND cs.status = 'approved')
LIMIT 1;
