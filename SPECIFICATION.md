# SPECIFICATION.md

Version: v1.4.1
Status: 🟢 Active
Date: 2026-06-09

Project Name:
Poikatsu AI Affiliate Platform

Owner:
Single Admin Operator

---

## Chapter 1: 需求定义与业务边界

### 1.1 项目目标

建设一个面向日本市场的：

* ポイ活推荐网站
* 招待コード聚合网站
* 招待リンク推广网站
* AI自动运营内容平台

最终目标：

* SEO流量获取
* 招待码转化
* 招待链接转化
* 自动化运营
* 被动收入

---

### 1.2 用户角色

**Visitor**

无需注册

可：

* 浏览网站
* 浏览排行榜
* 浏览Service
* 浏览Article
* 复制邀请码
* 点击邀请链接

---

**Admin**

唯一运营者

可：

* 管理Service
* 管理Article
* 管理AI
* 查看Analytics
* 修改系统设置

---

### 1.3 核心设计原则

**Service First**

所有数据围绕Service构建

Service是系统唯一核心资产。

所有 Article / Analytics / Ranking / Social Distribution 必须关联Service。

---

### 1.4 Service定义

例如：

* トリマ
* Powl
* モッピー
* 楽天カード
* PayPayカード

---

### 1.5 Article 两大类型

**Service介绍**（1 Service : 1篇，固定权威页）

* 新建 Service 时自动生成
* Service 信息变更时自动覆盖更新
* 始终保持最新状态

**Service関連**（1 Service : N篇，持续累积）

* 类型：Guide / FAQ / Comparison / Campaign / Earnings
* 由系统自动调度生成（每日定时，可配置）
* 发布后不再更新，持续积累 SEO 内容
* Comparison 类文章可关联多个 Service

---

## Chapter 2: System Architecture

### 2.1 架构原则（MVP First）

禁止：

* 微服务
* Kubernetes
* Kafka
* RabbitMQ

采用：

* 单体架构
* Next.js
* Supabase
* Vercel

---

### 2.2 技术架构

**Frontend**

* Next.js
* TypeScript
* TailwindCSS

**Backend**

* Next.js API Routes

**Database**

* Supabase PostgreSQL

**AI**

* Claude API

**Deployment**

* Vercel

**定时任务**

* Vercel Cron Jobs

---

### 2.3 安全原则

**Admin认证**

* Supabase Auth（Email + Password）
* 架构预留扩展接口（支持后续接入 Google / Magic Link 等，零影响）
* V1 不实现 TOTP

**敏感信息**

必须存储于环境变量

禁止：

* 硬编码API Key
* 明文日志输出

---

### 2.4 响应式设计原则

所有页面必须同时支持 PC 端和手机端布局，不得只做单端设计。

* 移动优先（Mobile First）：以手机端布局为基础，向上扩展 PC 端
* 断点：手机（< 768px）/ 平板（768px~1024px）/ PC（> 1024px）
* 核心页面（Homepage / Service Page / Article Page / Admin Dashboard）必须各自定义手机端和 PC 端的具体布局
* TailwindCSS 响应式前缀（`sm:` / `md:` / `lg:`）贯穿所有 UI 组件

### 2.5 AI 内容语言规范

* 全日文输出
* 语气：个人博主体验分享风格（口语化、亲切、有温度）
* 禁止：官方宣传语气、过度正式措辞、企业公关式表达
* 目标感：读者看完天然认为是「日本人自己用过后真心推荐」
* 自然穿插：「実際に使ってみた」「正直なところ」「これは本当におすすめ」等表达

---

## Chapter 3: Database Design

### services

| 字段 | 类型 | 说明 |
|------|------|------|
| id | uuid | 主键 |
| name | text | Service名称 |
| slug | text | URL用slug，AI自动生成 |
| description | text | SEO meta description，AI生成，150字以内 |
| referral_code | text | 可空 |
| referral_link | text | 可空 |
| official_url | text | 官网URL |
| logo_url | text | 原始Logo URL，可空 |
| logo_storage_path | text | Supabase Storage本地副本路径 |
| status | enum | active / inactive |
| hide_articles_on_inactive | boolean | inactive 时是否同时隐藏已发布文章，默认 false |
| created_at | timestamptz | |
| updated_at | timestamptz | |

---

### categories

| 字段 | 类型 | 说明 |
|------|------|------|
| id | uuid | 主键 |
| name | text | 分类名（日文） |
| slug | text | URL用slug |
| created_at | timestamptz | |
| updated_at | timestamptz | |

---

### service_categories

| 字段 | 类型 | 说明 |
|------|------|------|
| service_id | uuid | FK → services |
| category_id | uuid | FK → categories |

---

### service_images

| 字段 | 类型 | 说明 |
|------|------|------|
| id | uuid | 主键 |
| service_id | uuid | FK → services |
| storage_path | text | Supabase Storage路径 |
| source_url | text | 原始抓取URL |
| created_at | timestamptz | |

---

### articles

| 字段 | 类型 | 说明 |
|------|------|------|
| id | uuid | 主键 |
| primary_service_id | uuid | FK → services，主关联Service |
| title | text | 文章标题 |
| slug | text | URL用slug |
| description | text | SEO meta description，AI生成 |
| content | text | 正文（Markdown） |
| article_type | enum | introduction / guide / faq / comparison / campaign / earnings |
| status | enum | draft / reviewing / published / rejected / archived |
| revision_count | int | AI重写次数，默认0 |
| published_at | timestamptz | |
| created_at | timestamptz | |
| updated_at | timestamptz | |

---

### article_services

| 字段 | 类型 | 说明 |
|------|------|------|
| article_id | uuid | FK → articles |
| service_id | uuid | FK → services |

用于 Comparison 等多Service关联文章。

---

### analytics_events

| 字段 | 类型 | 说明 |
|------|------|------|
| id | uuid | 主键 |
| service_id | uuid | FK → services，可空 |
| article_id | uuid | FK → articles，可空 |
| event_type | enum | page_view / service_view / article_view / copy_code / referral_click / share_link / ranking_click |
| source | text | 流量来源 |
| device | text | 设备类型 |
| session_id | text | |
| metadata | jsonb | |
| created_at | timestamptz | |

---

### analytics_daily

聚合统计表，由 Vercel Cron Job 每日凌晨（JST 00:00）聚合生成。

| 字段 | 类型 | 说明 |
|------|------|------|
| date | date | 统计日期 |
| service_id | uuid | FK → services |
| page_views | int | |
| referral_clicks | int | |
| copy_code_count | int | |
| share_count | int | |

---

### distribution_logs

| 字段 | 类型 | 说明 |
|------|------|------|
| id | uuid | 主键 |
| article_id | uuid | FK → articles |
| platform | enum | x / instagram / threads |
| status | enum | pending / success / failed |
| error_message | text | 可空 |
| distributed_at | timestamptz | |
| created_at | timestamptz | |

---

### admin_notifications

| 字段 | 类型 | 说明 |
|------|------|------|
| id | uuid | 主键 |
| type | enum | article_pending / ai_failed / image_failed / distribution_failed |
| payload | jsonb | 相关数据 |
| is_read | boolean | |
| created_at | timestamptz | |

---

### system_settings

单行配置表（id = 1，固定主键）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | int | 固定值 = 1 |
| operation_mode | enum | manual / auto |
| auto_generate_enabled | boolean | 是否启用自动生成，默认 true |
| auto_distribution | boolean | 文章发布后自动分发 |
| daily_article_count | int | 每日自动生成Service関連文章数，默认 1 |
| max_pending_articles | int | 审核队列积压上限，超过则暂停生成，默认 10 |
| ranking_window_days | int | Ranking统计时间窗口，默认 30 |
| updated_at | timestamptz | |

---

## Chapter 4: Page/UI Flow

### URL 结构

* 分类页：`/services/{category-slug}`
* Service页：`/services/{category-slug}/{service-slug}`
* Article页：`/articles/{category-slug}/{article-slug}`
* 固定静态页：`/privacy` / `/contact` / `/disclosure`

---

### 导航结构

**PC Header（左→右）：**
ロゴ / ホーム / サービス一覧（ホバーで分類ドロップダウン）/ ランキング / 記事 / 🔍

**スマホ：**
ロゴ（左）＋ 🔍（右）＋ ハンバーガーメニュー（右）

**フッター：**
全カテゴリ一覧 / 新着記事 / プライバシーポリシー / お問い合わせ

---

### Homepage

モジュール：

**Hot Ranking**

6〜10個のService表示

**Profit Ranking**

6〜10個のService表示

**Latest Articles**

時間倒順

**Search**

Service名・Tagでキーワード検索
検索結果：Service カード（最新情報の Service介绍 を表示）＋ 関連 Service関連 文章リスト

---

### Service Page

**Basic Info**

* Service名称
* 分類・Tags
* Logo

**Conversion Area**

* Referral Code（コピーボタン付き）
* Referral Link

**Service介绍コンテンツ**

AI生成・常時最新

**Related Articles（Service関連）**

関連する卫星文章一覧

---

### Article Page

* 标题
* 内容（AI生成，日文，个人博主风格）
* 正文内嵌 Service 相关图片（从 service_images 自动选取）
* Referral Area（关联 Service 的转化区）
* Related Articles

---

### Admin Dashboard

**概览区：**

* 已发布 Service 数（active）
* 已发布 Article 数（Service介绍 + Service関連 分开计数）
* 待审核文章数（一键跳转）
* AI 生成队列状态
* AI 自动生成开关（`auto_generate_enabled` 一键切换，显示当前积压数 / 上限）

**Service 行为明细表：**

* 每个 Service 的 page_view / referral_click / copy_code
* 支持按时间段筛选（7天 / 30天）

**Service 管理：**

* 每条 Service 详情页提供「立即生成文章」按钮，立即为该 Service 触发一次 Service関連 文章生成，不受 `auto_generate_enabled` / `max_pending_articles` 限制
* 将 Service 设为 inactive 时，提示是否同时隐藏该 Service 的已发布文章（写入 `hide_articles_on_inactive`）

**Categories 管理：**

* 输入字段：仅「名前」一个文本框（slug 由后端 `toSlug()` 自动生成，UI 不展示）
* 新規追加フォーム：名前テキストボックス + 「追加」ボタンを横並び（同一行）
* 追加成功後：新分类立即追加到列表末尾（Optimistic Update — 直接追加 API 返回的对象，不重新 fetch 整张表）
* 追加失败時：フォーム下部に赤字小テキスト（`text-xs text-red-600`）で API 返回的 `error.message` を表示
* 列表行：名前 + 「削除」ボタンのみ（名称错误直接删除重建，无编辑功能）
* 削除確認：`confirm()` ダイアログで確認後、成功したらローカルリストから即時 filter 除去
* Admin 手动初始化基础分类数据（系统初次使用时）
* Tags は V2 対応（現バージョンでは非表示）

**通知中心：**

顶部常驻，显示 article_pending / ai_failed / image_failed / distribution_failed 提醒

---

## Chapter 5: AI Workflow

### Service Creation Flow

新增Service

↓

AI抓取官网信息

↓

生成 name / description / slug

↓

AI自动匹配 categories

↓

爬取官网及相关页面图片 → 下载至 Supabase Storage（service_images）

↓

生成 Service介绍 文章（introduction类型）→ 保存 Draft

↓

MANUAL模式：文章自动转 `reviewing`（进入审核队列，无需人工触发）
AUTO模式：文章直接 `published`

---

### Service関連 自动生成调度（Vercel Cron）

触发频率：每日定时，数量由 `system_settings.daily_article_count` 决定（默认1篇）

选取逻辑：

* 仅从 status = active 的 Service 中选取
* 加权随机（近期发文少的 Service 权重更高）
* 检查该 Service 历史文章类型，优先选未覆盖角度（guide → faq → comparison → campaign → earnings 轮转）

生成内容：

* 日文，个人博主口语风格
* 自动从 service_images 选取相关图片插入正文
* 同步生成 SEO description

执行前检查（两者均满足方可触发生成）：

* `auto_generate_enabled = true`
* 当前 `reviewing` 状态文章数 < `max_pending_articles`
* 任一不满足则跳过本次生成，并发送 `article_pending` 通知

发布流程：

* 根据 operation_mode：manual → Draft等待审核 / auto → 直接发布
* 发布后根据 system_settings.auto_distribution 决定是否自动分发

---

### Service介绍 更新机制

Service 关键信息变更后（name / referral_code / referral_link / official_url 等），系统自动触发：

1. 基于旧文章内容生成新版 Service介绍（微调更新，保留文章结构，替换变更信息）
2. 旧文章状态 → `archived`（前台不再展示）
3. 新文章按当前 operation_mode 处理：MANUAL → `reviewing` / AUTO → `published`

---

### Article 审核状态机（MANUAL模式）

```
AI生成 → draft ──[MANUAL: 自动]──→ reviewing（进入审核队列）
               └──[AUTO: 直接]────→ published（跳过审核）

reviewing 阶段 Admin 有三个选项：
         ┌─ ✅ 发布   → published（直接上线）
         ├─ ✏️ 修改意见 → AI重写 → reviewing（revision_count +1，循环审核）
         └─ ❌ 拒绝   → rejected（永久丢弃，不展示，不发布）
```

**状态说明：**
- `draft`：AI生成完毕，尚未进入审核队列
- `reviewing`：在 Admin 审核队列中等待处理
- `published`：Admin 审核通过并发布
- `rejected`：Admin 拒绝，文章永久丢弃，前台不展示，不可恢复
- `archived`：已发布后由 Admin 手动归档下架

**revision_count**：记录该文章被 AI 重写的累计次数，供 Admin 参考判断是否直接拒绝。

---

### Logo 三层保障机制

1. 优先使用 `logo_storage_path`（Supabase Storage本地副本）
2. 本地副本不存在时：从 `official_url` 自动抓取 Favicon
3. 最终兜底：文字头像（Service名首字/首字母 + 自动配色）

---

## Chapter 6: API Contracts

### Service

```
GET    /api/services
POST   /api/services
GET    /api/services/:id
PUT    /api/services/:id
DELETE /api/services/:id
```

### Article

```
GET    /api/articles
POST   /api/articles
GET    /api/articles/:id
PUT    /api/articles/:id
DELETE /api/articles/:id
```

### Categories

```
GET    /api/categories
POST   /api/categories
PUT    /api/categories/:id
DELETE /api/categories/:id
```

### Analytics

```
POST /api/analytics/track
```

事件：page_view / copy_code / referral_click / service_view / article_view / share_link / ranking_click

### AI

```
POST /api/ai/generate-service
POST /api/ai/generate-article
POST /api/ai/rewrite
```

### Cron

```
POST /api/cron/aggregate        # analytics_daily 聚合
POST /api/cron/generate-article # Service関連 自动生成
```

### Distribution

```
POST /api/distribution/trigger  # 手动触发分发
```

---

## Chapter 7: Global Error Matrix

| Code | Description |
|------|-------------|
| 1000 | Validation Error |
| 1001 | Service Not Found |
| 1002 | Article Not Found |
| 1003 | Authentication Failed |
| 1004 | Permission Denied |
| 1005 | AI Generation Failed |
| 1006 | Distribution Failed |
| 1007 | Analytics Write Failed |
| 1008 | Image Fetch Failed |
| 5000 | Internal Server Error |

---

## Chapter 8: Core Algorithms

### Hot Ranking

統計ウィンドウ：`system_settings.ranking_window_days` 日（默认 30）

```
score = page_views + referral_clicks × 2 + copy_code_count × 1
```

---

### Profit Ranking

統計ウィンドウ：`system_settings.ranking_window_days` 日（默认 30）

```
score = referral_clicks × 5 + copy_code_count × 2
```

---

### Service関連 加重ランダム選択

```
weight(service) = 1 / (recent_article_count + 1)
```

recent_article_count = 直近 `system_settings.ranking_window_days` 日内该 Service 已生成的 Service関連 文章数

---

## Chapter 9: Roadmap

### V1（初期リリース）

* Service 管理（CRUD + カテゴリ）
* Service介绍 自动生成
* Service関連 自动调度生成
* Article 审核流程
* Analytics 事件追踪 + 每日聚合
* Hot / Profit Ranking
* Admin 后台（Dashboard + 通知中心）
* SEO 基础（slug / description / sitemap）

### V2（自动化拡張）

* Tags 管理（カテゴリと同様の UI / API、サービスへのタグ付け）
* 社交媒体自动分发（X / Instagram / Threads）
* 自动活动监控
* 自动内容更新
* Admin 邮件通知（article_pending 积压提醒）

### V3（AI運営Agent）

* AI 自动发现新 Service
* 各平台収益自动爬取（需共享登录凭据，加密存储）
* 全自动运营闭环

---

## Appendix A: Operation Mode

**MANUAL**（默认）

AI生成 → Draft → Admin 审核 → 发布

**AUTO**

AI生成 → 直接发布，Admin 无需介入

---

## Appendix B: Distribution Rule

仅允许 `published` 状态内容分发

禁止：`draft` / `reviewing` / `approved` 直接分发

---

## Appendix C: Social Distribution

支持（V2）：

* X
* Instagram
* Threads

未来扩展（V3）：

* Facebook
* LINE

---

## Appendix D: Admin Access

后台地址：`/admin`

认证：Supabase Auth（Email + Password），预留多 Provider 扩展接口

---

## Appendix E: Static Pages

以下固定页面由 Admin 手动维护内容，不由 AI 生成：

* `/privacy`（プライバシーポリシー）
* `/contact`（お問い合わせ）
* `/disclosure`（アフィリエイト収益開示）

---

## Appendix F: Implementation Conventions

本章记录已确立的实现模式，Coder 在开发同类功能时必须遵循，保持全站一致性。

---

### F.1 Slug 自动生成规则

**适用范围：** categories、services（slug字段）、articles（slug字段）

**规则：**
- slug 字段由**系统后端自动生成**，前台 Admin UI 不提供 slug 输入框
- 生成逻辑：将 name 转小写、空格替换为 `-`、去除非 ASCII 字符
- 若 name 全为日文/非ASCII字符，降级为 `{prefix}-{timestamp}`（例：`cat-1749481200000`）
- 生成后不对外暴露，Admin 不需要感知

```typescript
function toSlug(name: string, prefix = "item"): string {
  const base = name.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  return base || `${prefix}-${Date.now()}`;
}
```

---

### F.2 列表管理页 UI 标准模式

**适用范围：** categories 等简单列表管理页

**模式：**
- 表单：仅显示必要的用户输入字段（系统自动生成的字段不展示）
- 追加後：**Optimistic Update** —— API 响应成功后直接将返回的新对象追加到本地列表，不重新 fetch 整张表
- 追加失败時：フォーム下部に赤字小テキスト（`text-xs text-red-600`）で API 返回的 `error.message` を表示；`error` state を持ち `setSaving(false)` と同タイミングでクリア・セット
- 删除後：直接从本地列表 filter 掉对应 id，不重新 fetch
- 列表行操作：保持最简，默认只提供「削除」，无需编辑功能（名称错误直接删除重建）

**示例参考：** `src/app/admin/(protected)/categories/page.tsx`

---

### F.3 Tags 管理页（V2 対応）

Tags 管理は V2 で実装予定。実装時は F.1 + F.2 パターンに従い、`/api/tags` エンドポイントを使用、slug prefix は `tag`。

---

### F.4 Admin API 認証・権限要件

Admin の全書き込み API（POST / PUT / DELETE）は Supabase の `createAdminClient()` を使用し、`SUPABASE_SERVICE_ROLE_KEY` で RLS を完全バイパスする。

**必須環境変数：**

| 環境変数 | 取得元 | 未設定時の症状 |
|---|---|---|
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Dashboard → Settings → API → service_role | `permission denied for table {テーブル名}` |

**注意：**
- service_role key は Git に絶対コミットしない
- `.env.local` および Vercel Dashboard の Environment Variables にのみ保管
- READ 系 API（GET）も `createAdminClient()` を使用すること（RLS `public_read` policy があっても統一する）

---

END OF SPECIFICATION
