# RFP：技術規範問卷與 AI 協作治理平台（正式版）

> 文件編號：RFP-AIGOV-001  
> 版本：v1.0  
> 日期：2026-03-13  
> 提案單位：SystemLead Technologies Co.,Ltd.（矽聯科技股份有限公司）

---

## 1. RFP 目的與背景

本 RFP 用於徵求可落地的系統建置方案，目標是建立一套「角色化、階段化、可治理、可版本化」的問卷平台，將專案技術需求轉換為可被 AI 協作與工程流程直接使用的標準資產。

本案背景重點：

- 現有專案技術定義方式不一致，知識難以沉澱與重用
- AI 協作時缺乏完整上下文，造成返工與品質波動
- 需符合公司 ISO/IEC 27001 安全政策
- 目標平台環境以 Azure、GitHub、.NET、Azure SQL 為主

---

## 2. 專案目標

### 2.1 業務目標

- 建立跨角色一致的技術定義流程
- 縮短新專案啟動與規格確認時間
- 降低 AI 協作返工率並提升可追溯性

### 2.2 工程目標

- 問卷答案可版本化儲存與比對
- 支援規則驗證與 Readiness 評分
- 自動產出標準文件資產：
  - `tech-stack.json`
  - `ai-context.md`
  - `readiness-report.md`

### 2.3 治理目標

- 落地 SSOT 邊界與 PR 審核制度
- 建立治理文件版本控管（SemVer + Changelog）
- AI 使用揭露與審核納入標準流程

---

## 3. 專案範圍

### 3.1 In Scope（本期範圍）

1. 角色化與階段化問卷流程（Discovery/Planning/Design/Validation/Review/Output/Publish）
2. 題庫與答案資料模型（相容現有題庫 9 類、70 題）
3. 驗證引擎（必填、交叉、衝突規則）
4. Readiness 計分與報告
5. 輸出引擎（JSON/Markdown）
6. GitHub PR 治理整合（模板、檢查、變更留痕）
7. 基礎權限模型（角色與責任對應）

### 3.2 Out of Scope（本期不含）

- 全自動程式碼生成與自動發 PR
- 複雜推薦引擎與跨公司知識圖譜
- 多雲治理架構擴展（本期聚焦 Azure）

---

## 4. 使用角色與責任

核心角色：

- PM / 顧問
- Architect
- Backend Lead
- Frontend Lead
- DevOps
- Security Lead
- QA Lead（可先保留流程接點）

需求原則：

- 各角色僅看到與其責任相關題目
- 需支援跨角色協作題（如安全邊界、API 格式）
- 需保留審核與退回機制

---

## 5. 功能需求（Functional Requirements）

### FR-01 專案與問卷實例管理

- 建立專案、建立問卷版本、設定當前階段
- 可查詢每個階段完成度與卡點

### FR-02 題庫載入與題目分派

- 依專案類型與階段載入題組
- 依角色過濾題目並支援條件題邏輯

### FR-03 填答與草稿

- 支援儲存草稿、更新答案、信心度標記
- 留存填答者與時間戳記

### FR-04 驗證與評分

- 執行 Error/Warning 規則
- 計算 Readiness Score 與各分類分數

### FR-05 階段流轉控制

- Gate 條件未達不得進下一階段
- 允許退回修正並保留歷史版本

### FR-06 審核與簽核

- 支援架構師/PM 等角色審核
- 記錄審核意見、決議與版本鎖定

### FR-07 輸出與發布

- 產出標準檔案（JSON/Markdown）
- 可導出至 Repo 並透過 PR 流程審查

---

## 6. 非功能需求（Non-Functional Requirements）

### NFR-01 安全與合規

- 符合 ISO/IEC 27001 內控要求
- 權限控管與審核軌跡可追溯
- 禁止機敏資訊直接暴露於 AI prompt

### NFR-02 可用性與效能

- 一般問卷查詢與儲存需具可接受回應時間
- 支援至少 5-15 人協作規模（現況 + 成長）

### NFR-03 可維運性

- 題庫、規則、輸出模板可配置化
- 版本升級需可回溯與可稽核

### NFR-04 可擴充性

- 可新增分類、角色、規則而不需重構核心
- 可擴充到更多專案型態

---

## 7. 技術與平台限制

- 雲端：Azure
- 資料庫：Azure SQL Database（可含 SQL Server 相容）
- 後端建議：.NET 8 Web API
- 前端建議：React + TypeScript
- 版本控制與協作：GitHub
- AI 協作：Cursor（需保留工具中立擴充能力）

---

## 8. 交付項目（Deliverables）

1. 系統設計文件（架構、ERD、API Spec）
2. 可運作的 MVP 系統（後端 API + 前端介面）
3. 驗證與評分模組
4. 輸出模組與範例產出
5. 部署與維運文件（Azure + GitHub）
6. 測試報告（功能、流程、關鍵安全檢核）
7. 使用者操作手冊與管理手冊
8. 知識轉移與教育訓練材料

---

## 9. 里程碑與時程（建議）

- M1（第 1-2 週）：需求確認與設計凍結
- M2（第 3-6 週）：MVP 開發（問卷/驗證/輸出）
- M3（第 7-8 週）：審核與版本流程上線
- M4（第 9-10 週）：GitHub 治理整合與試運行
- M5（第 11-12 週）：驗收與知識移轉

---

## 10. 驗收標準（Acceptance Criteria）

- 角色分派與階段化流程可正常運作
- 問卷必填/條件題/交叉規則可正確檢查
- Readiness Score 與驗證報告可產生且可解釋
- 三類標準產出可生成並可追溯至問卷版本
- PR 治理流程可檢查版本升級與變更揭露
- 至少 1 個實際專案完成端到端試跑

---

## 11. 供應商回覆格式（Proposal Response）

請供應商依下列章節回覆：

1. 公司與團隊介紹（相關經驗）
2. 解決方案架構與技術選型
3. 功能對應矩陣（逐條對應本 RFP 需求）
4. 專案計畫與人力配置
5. 風險與應對策略
6. 品質保證與資安作法
7. 維運與後續支援方案
8. 報價與付款里程碑

---

## 12. 評選機制（建議權重）

- 技術適配與可擴充性：30%
- 交付能力與時程可行性：25%
- 資安與治理能力：20%
- 成本與維運效益：15%
- 團隊協作與溝通能力：10%

---

## 13. 已有文件參考

- `docs/charter/project-charter.md`
- `docs/charter/implementation-plan.md`
- `docs/charter/company-development-baseline.md`
- `docs/charter/project-intake-checklist.md`
- `docs/questionnaires/role-matrix.md`
- `docs/questionnaires/stage-flow.md`
- `question-bank/question-bank-index.json`
- `docs/governance/governance-versioning-policy.md`

---

## 14. 定版假設與邊界

- 本期時程以 12 週為目標，採里程碑驗收
- 本期採 MVP 範圍，不含全自動產碼與自動發 PR
- QA Lead 保留流程接點，是否納入必填角色可於實作期評估後決定
- 驗收環境以 Azure 指定資源與測試資料集為準
- 本文件若需調整，依 `docs/governance/governance-versioning-policy.md` 進行升版管理

---

## 15. 聯絡與提案提交資訊（由發案方填寫）

- 提案截止日：
- 提案提交方式（Email/Portal）：
- 聯絡窗口（姓名/職稱/Email）：
- 預定簡報與答詢日期：
- 預定決標日期：
