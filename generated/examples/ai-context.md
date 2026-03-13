# AI Context - 客戶管理平台 v2.0

> 此文件由 AI 協作治理平台自動產生，供 Cursor / AI 工具使用
> 產生時間：2026-03-13 | 版本：1.0.0

## 專案概述
- **專案名稱**：客戶管理平台 v2.0
- **類型**：Web 應用系統（既有系統擴充）
- **範圍**：中型（3-12 人月）
- **資料敏感度**：機密（含客戶個資）

## 技術棧

### 後端
- **平台**：.NET 8 LTS
- **框架**：ASP.NET Core Web API
- **ORM**：Entity Framework Core（Code First + Migration）
- **認證**：JWT Token（Access 30 min / Refresh 7 days / HttpOnly Cookie）
- **日誌**：Serilog → Azure Application Insights

### 前端
- **框架**：React
- **語言**：TypeScript（strict 模式）
- **UI 庫**：Ant Design
- **CSS**：CSS Modules
- **狀態管理**：Zustand
- **路由**：React Router v6+
- **建構**：Vite

### 資料庫
- **引擎**：Azure SQL Database
- **設計方式**：Code First + EF Migration
- **快取**：Azure Cache for Redis
- **命名規範**：PascalCase（如 UserProfile）

### API
- **風格**：RESTful API
- **版本策略**：URL 路徑版本（/api/v1/）
- **回應格式**：統一信封格式 `{ success, data, error, message }`
- **錯誤處理**：全域例外處理 Middleware
- **文件**：Swashbuckle 自動產生 Swagger

## 架構規範
- **架構風格**：模組化單體（Modular Monolith）
- **分層**：Presentation → Application → Domain → Infrastructure → Data Access
- **設計模式**：Repository, Unit of Work, Mediator, DI/IoC
- **部署平台**：Azure App Service（PaaS）

## AI 協作規則

### ✅ 允許範圍
- 程式碼生成
- 程式碼審查
- 單元測試撰寫
- 文件撰寫
- 程式碼重構
- API 設計

### 🚫 禁止範圍（紅線）
- 直接部署到正式環境
- 正式環境資料庫異動
- 處理密碼/金鑰/憑證
- 處理個人識別資訊（PII）
- 資料刪除操作

### 🔒 安全邊界
- AI 不得接觸正式環境資料
- AI 不得處理機敏資訊
- AI 產出必須經人工審查
- AI prompt 不得包含個資
- 僅使用公司核准的 AI 模型
- AI 操作需留稽核軌跡

### 審查流程
- 所有 AI 產出必須經人工 Code Review
- PR 必須至少 1 位資深工程師 Approve

## 合規要求
- 台灣個資法
- OWASP Top 10
- 公司內部資安政策

## 程式碼風格
- 使用 .editorconfig
- 使用 Roslyn Analyzers
- 有 PR Template
- Git 分支策略：GitHub Flow（feature branch + PR）

## 注意事項
- 此專案為既有系統擴充，需注意與 v1.0 的相容性
- 所有資料表使用 PascalCase 命名
- API 路徑使用 kebab-case
- 所有敏感資料需加密處理
- 使用 Azure Key Vault 管理機敏資訊
