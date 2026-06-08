# SPECIFICATION.md

Version: v1.0
Status: 🟢 Active
Date: 2026-06-08

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

---

### 1.4 Service定义

例如：

* トリマ
* Powl
* モッピー
* 楽天カード
* PayPayカード

---

所有：

* Article
* Analytics
* Ranking
* Social Distribution

必须关联Service。

---

## Chapter 2: System Architecture

### 2.1 架构原则

**MVP First**

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

---

### 2.3 安全原则

**Admin认证**

Email + Password

TOTP

支持：

* Google Authenticator
* Microsoft Authenticator
* Authy

---

**敏感信息**

必须存储于环境变量

禁止：

* 硬编码API Key
* 明文日志输出

---

## Chapter 3: Database Design

### services

字段：

* id
* name
* referral_code
* referral_link
* official_url
* category
* tags
* ai_score
* status
* created_at
* updated_at

status：

* active
* inactive

---

### articles

字段：

* id
* service_id
* title
* slug
* content
* article_type
* status
* published_at
* created_at
* updated_at

status：

* draft
* reviewing
* approved
* published
* archived

---

### analytics_events

字段：

* id
* service_id
* article_id
* event_type
* source
* device
* session_id
* metadata
* created_at

event_type：

* page_view
* service_view
* article_view
* copy_code
* referral_click
* share_link
* ranking_click

---

### analytics_daily

聚合统计表

字段：

* date
* service_id
* page_views
* referral_clicks
* copy_code_count
* share_count

---

### system_settings

字段：

* operation_mode
* auto_distribution

operation_mode：

* manual
* smart
* auto

---

## Chapter 4: Page/UI Flow

### Homepage

模块：

**Hot Ranking**

显示：

6~10个Service

---

**Profit Ranking**

显示：

6~10个Service

---

**Latest Articles**

时间倒序

---

**Search**

关键字搜索

---

### Service Page

显示：

**Basic Info**

* Service名称
* 分类
* AI评分

---

**Conversion Area**

* Referral Code
* Copy Button
* Referral Link

---

**AI Review**

AI生成简介

---

**Related Articles**

关联文章

---

### Article Page

显示：

* 标题
* 内容
* Service信息
* Referral Area
* Related Articles

---

### Admin Dashboard

模块：

* Site Overview
* Hot Ranking
* Profit Ranking
* Pending Review
* AI Queue
* System Status

---

## Chapter 5: AI Workflow

### Service Creation

流程：

新增Service

↓

AI抓取官网信息

↓

生成Description

↓

生成Tags

↓

生成AI Score

↓

保存Draft

---

### Article Generation

类型：

* Guide
* FAQ
* Comparison
* Campaign
* Earnings

---

AI生成后：

Draft

等待审核

---

### Rewrite Workflow

Admin输入修改意见

↓

AI重写

↓

Reviewing

↓

再次审核

---

## Chapter 6: API Contracts

### Service

GET /api/services

POST /api/services

PUT /api/services/:id

DELETE /api/services/:id

---

### Article

GET /api/articles

POST /api/articles

PUT /api/articles/:id

DELETE /api/articles/:id

---

### Analytics

POST /api/analytics/track

事件：

* page_view
* copy_code
* referral_click

---

### AI

POST /api/ai/generate-service

POST /api/ai/generate-article

POST /api/ai/rewrite

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
| 5000 | Internal Server Error |

---

## Chapter 8: Core Algorithms

### Hot Ranking

```
score = page_views + referral_clicks × 2 + copy_code_count × 1
```

---

### Profit Ranking

```
score = referral_clicks × 5 + copy_code_count × 2
```

---

### AI Score

**Phase 1**

AI评分 0~100

**Phase 2**

AI评分 + 用户行为数据动态修正

---

## Appendix A: Operation Mode

**MANUAL**（默认）

人工审核 / 人工发布

**SMART**

新Service审核 / 活动自动发布

**AUTO**

全自动运营

---

## Appendix B: Distribution Rule

仅允许 `published` 状态内容分发

禁止：`draft` / `reviewing` / `approved` 直接分发

---

## Appendix C: Social Distribution

支持：

* X
* Instagram
* Threads

未来扩展：

* Facebook
* LINE

---

## Appendix D: Admin Access

后台地址：`/admin`

认证：Email + Password + TOTP

---

## Appendix E: Roadmap

**V1**

* Service管理
* Article管理
* AI生成
* Analytics
* Ranking

**V2**

* 自动活动监控
* 自动内容更新
* 社交媒体自动发布

**V3**

* AI运营Agent
* 自动发现新Service
* 自动运营闭环

---

END OF SPECIFICATION
