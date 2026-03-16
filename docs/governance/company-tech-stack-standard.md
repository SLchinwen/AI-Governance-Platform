# 公司技術棧共通標準

> **版本：** 1.0  
> **對應主文件：** 《AI-Driven Full Stack Development Technical Specification v2.0》《AI Agent Development Checklist v2》  
> **用途：** 新專案可「全程引用」本標準，或僅對部分維度客製；問卷與治理流程依此區分共通標準與客製調整。

---

## 一、目的與適用範圍

本文件為公司**已審核通過**的技術棧共通標準，供以下用途：

- **專案治理：** 問卷中「技術棧採用方式」選「全程採用公司共通標準」時，S2/S3 自動帶入本標準，無需逐項填寫。
- **客製對照：** 選「部分客製」時，僅對勾選的維度填寫；其餘維度標示「依公司標準」並引用本文件。
- **AI 產出：** 產出的 tech-stack、ai-context、cursor-rules 可標記維度為「依公司標準」或「客製」，供 AI 與審核使用。
- **新專案引用：** 未來新專案可直接引用本標準，縮短啟動與審核流程。

---

## 二、維度總覽與引用章節

| 維度 ID | 維度名稱 | 共通標準摘要 | Spec 章節 | Checklist 對應 |
| ------- | -------- | ------------ | --------- | -------------- |
| `backend` | 後端技術 | .NET 8、Controller-based、EF Core、BCrypt、ProblemDetails、async/Async | IV | Phase 2 Backend .NET 8 |
| `frontend` | 前端技術 | React 18+、Vite、TanStack Query、Tailwind、Zod、React Router v6+ | V | Phase 2 Frontend React+TS |
| `user_auth` | 使用者驗證 | JWT Bearer、refresh token、HttpOnly cookie、RS256/HS256 | VII.2 | Phase 0/2/4 |
| `api_security` | 服務間驗證 (API Security) | API Key (X-API-Key)、SHA-256 儲存、ServiceAuthorize、/internal/ | VII.3–7.5 | Phase 0/2/4 |
| `api_design` | API 設計 | /api/v{n}/、ProblemDetails、kebab-case、pagination (items+meta) | VI | Phase 2 API Design |
| `testing` | 測試與品質 | TDD、Unit≥80%、Integration、SAST (Semgrep)、零 any | XII, XI | Phase 1–4 |
| `cicd` | CI/CD 與流程 | Phase 0–6、PR + gates、Smoke Test、Trunk-based、Squash Merge | XIII, XIV | Phase 4–6 |

---

## 三、各維度共通標準細項

### 3.1 backend（後端技術）

- **Framework：** .NET 8 Web API（Controller-based）。
- **禁止：** AutoMapper、Minimal APIs、BinaryFormatter；必須手動 DTO 對應。
- **非同步：** 所有 I/O 使用 `async/await`，方法名以 `Async` 結尾。
- **資料流：** Repository（僅 Entity）→ Service（Entity ↔ DTO、擁有權檢查）→ Controller（僅 DTO）。
- **Repository：** 唯讀查詢使用 `.AsNoTracking()`。
- **安全：** 密碼 BCrypt（cost ≥ 12）；端點依情境使用 `[Authorize]`（JWT）或 `[ServiceAuthorize]`（API Key）。
- **錯誤：** 全域 Exception Middleware 回傳 ProblemDetails，不得回傳 stack trace。
- **驗證：** DataAnnotations 或 FluentValidation；禁止 raw SQL 字串拼接、禁止硬編碼密鑰。

**Spec 引用：** Section IV。**Checklist：** Phase 2 Backend .NET 8。

---

### 3.2 frontend（前端技術）

- **Framework：** React 18+（Functional Components）+ Vite。
- **狀態：** Server State 用 TanStack Query；Client State 用 Zustand 或 Context。禁止 Redux。
- **型別：** Strict Mode、禁止 `any`。
- **驗證：** Zod schema，與元件分檔。
- **API：** 集中 Axios 實例（`apiClient.ts`）、Query Keys 常數（`queryKeys.ts`）。
- **樣式：** 主要 Tailwind CSS（`tailwind.config.ts`）；例外用 CSS Modules。禁止 inline style、全域 CSS（除 Reset/Base）、`!important`（除無替代時）。
- **路由：** React Router v6+，路由定義集中於 `src/routes/`，受保護頁面以 Guard 包覆。
- **環境變數：** 僅透過 typed `src/lib/env.ts` 存取，變數前綴 `VITE_`。
- **禁止：** `dangerouslySetInnerHTML`；後端 PascalCase 須轉為前端 camelCase。

**Spec 引用：** Section V。**Checklist：** Phase 2 Frontend React+TypeScript。

---

### 3.3 user_auth（使用者驗證）

- **機制：** JWT Bearer Token（對外／使用者登入情境）。
- **簽章：** 建議 RS256，可接受 HS256。
- **驗證：** 每請求驗證 issuer、audience、expiration、signature。
- **Refresh：** 實作 refresh token 輪替，舊 refresh token 須失效。
- **時效：** Access token ≤ 30 分鐘；Refresh token ≤ 7 天。
- **前端儲存：** Access token 僅存記憶體；Refresh token 存 HttpOnly Secure cookie。
- **暴力破解防護：** 連續 5 次登入失敗後帳號鎖定。

**Spec 引用：** Section VII.2。**Checklist：** Phase 0（Determine: JWT）、Phase 2/4 Security。

---

### 3.4 api_security（服務間驗證 / API Security）

- **機制：** API Key（系統對系統），用於內部服務、批次、微服務間呼叫。
- **傳遞：** 自訂 header `X-API-Key: {key}`，禁止放在 query string 或 URL。
- **格式：** 至少 256-bit 隨機值，Base64 編碼。
- **儲存：** 資料庫僅存 SHA-256 hash，禁止明文。
- **驗證：** Middleware 比對 hash；依 service identity 做 scope 檢查；缺/錯 key → 401，scope 不足 → 403。
- **輪替：** 支援輪替期間兩把 key 並存。
- **端點路徑：** 內部 API 置於 `/api/v{n}/internal/`，不對外網暴露。
- **禁止：** API Key 出現於前端程式、日誌、錯誤訊息、API 回應。

**Spec 引用：** Section VII.3–7.5。**Checklist：** Phase 0（API Key internal）、Phase 2 API Keys、Phase 4。

---

### 3.5 api_design（API 設計）

- **版控：** URL path versioning `/api/v{n}/`（如 `/api/v1/users`）。
- **錯誤格式：** RFC 7807 ProblemDetails；422 含 `errors` 物件（欄位名 camelCase）。
- **命名：** URL kebab-case 複數名詞；query/body camelCase。
- **分頁：** 請求 `pageNumber`、`pageSize`；回應含 `items` 與 `meta`（pageNumber, pageSize, totalCount, totalPages）。
- **Production：** 不得回傳 stack trace 或內部例外訊息。

**Spec 引用：** Section VI。**Checklist：** Phase 2 API Design。

---

### 3.6 testing（測試與品質）

- **流程：** TDD（Red → Green → Refactor）；先寫失敗測試再實作。
- **後端單元：** Service 層，命名 `MethodName_Scenario_ExpectedResult`；覆蓋率目標 ≥ 80%。
- **後端整合：** Controller 端點，涵蓋 200、401、403、404、422、429、500。
- **前端：** Custom Hooks 與複雜元件，Vitest + React Testing Library；MSW 模擬 API；Hooks 覆蓋率目標 ≥ 70%。
- **安全測試：** 未驗證 401、非擁有者 403、無效輸入 422、過期/竄改 JWT 401、無效/錯誤 scope API Key 401/403、Rate limit 429。
- **SAST：** Semgrep（C# + OWASP、TypeScript + React）；依賴掃描 `dotnet list package --vulnerable`、`npm audit --audit-level=high`；HIGH/CRITICAL 阻擋部署。

**Spec 引用：** Section XII、XI。**Checklist：** Phase 1–4。

---

### 3.7 cicd（CI/CD 與流程）

- **分支：** Trunk-based；`main` 常保可部署；`feature/{ticket-id}-{desc}`、`hotfix/...`；feature 分支存續 ≤ 3 工作天。
- **Commit：** Conventional Commits（type(scope): subject）。
- **PR：** 至少 1 人審核；僅 Squash Merge。
- **Pipeline：** Restore → Build → Lint → Unit Test → Integration Test → SAST → Coverage Check → Deploy Staging → Smoke Test →（手動）→ Deploy Production → Smoke Test。
- **Lint：** `dotnet format --verify-no-changes` / `eslint` + `prettier --check`，零警告。
- **Smoke Test：** GET /api/v1/health、GET /、JWT 登入、API Key 內部端點（若有）、核心業務端點、安全 headers；單項 10s、總 60s；Staging 失敗阻擋 Production；Production 失敗自動 rollback 並通知。

**Spec 引用：** Section XIII、XIV。**Checklist：** Phase 4–6。

---

## 四、與問卷／治理的對應

- **全程採用公司標準：** 問卷 S2/S3 不顯示技術細項，改顯示「共通標準引用摘要」與「確認與例外聲明」；若有例外則進入審議與成熟度評估。
- **部分客製：** 僅對勾選之維度填寫；其餘維度由本標準帶入並標示「依公司標準」。
- **產出標記：** tech-stack、ai-context、審核摘要可標註「依公司標準（維度列表）」與「客製維度（列表）」，供新專案與 AI 引用。

---

## 五、機器可讀標準（JSON）

供問卷引擎與 artifact 產生器引用的結構化標準，見同目錄 **`company-tech-stack-standard.json`**。欄位與維度 ID 與本文件一致，新專案與自動化流程可讀取該檔取得標準值。

---

## 六、如何在新專案引用公司標準

1. **啟動新專案時**  
   在平台 S1 階段填寫專案概況後，於「技術棧採用方式」選擇：
   - **全程採用公司共通標準**：S2/S3 將自動帶入本標準，僅需確認引用摘要與選填例外聲明。
   - **部分採用、部分客製**：勾選要客製的維度，其餘維度依公司標準帶入，僅填寫勾選維度題目。

2. **匯出 project-context 作為範本**  
   完成 S1～S5 且審核通過後，使用「匯出 project-context」取得 `project-context.json`。新專案可「匯入 project-context」後修改專案名稱與必要欄位，再重新匯出，作為該專案的治理基準。

3. **產出 artifact 的引用標記**  
   - **tech-stack.json**：內含 `company_standard`（adoption_mode、dimensions_from_standard、custom_dimensions、maturity_label），供自動化或新專案判斷哪些維度依公司標準。
   - **ai-context.md / readiness-report.md**：內有「Tech Stack Adoption」小節，標示依公司標準維度與客製維度。
   - **cursor-rules.mdc**：開頭會標註 Company standard adoption 與維度列表，供 AI 產碼時遵循。
   - **S5 審核通過後的 handoff**：`tech_stack_summary` 含 dimensions_from_standard、custom_dimensions，可被下游流程引用。

4. **文件對照**  
   引用時請對照本文件（公司技術棧共通標準）與《AI-Driven Full Stack Development Specification v2.0》《AI Agent Development Checklist v2》；若有例外聲明，請於 S5 審核備註中註明接受理由。

---

## 七、修訂紀錄

| 版本 | 日期 | 說明 |
| ---- | ---- | ---- |
| 1.0 | 2026-03 | 初版，對應 Spec v2.0 與 Checklist v2；新增「如何在新專案引用公司標準」章節。 |
