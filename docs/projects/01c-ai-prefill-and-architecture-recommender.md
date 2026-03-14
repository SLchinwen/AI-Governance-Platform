# PRJ-001：AI 預填與技術棧推論層需求 v1.0

> 用途：將「AI 預填、技術棧推論、跨階段 context、技術確認」補成正式需求與設計依據。  
> 適用範圍：S1 Discovery、S2 Architecture、S3 技術決策。

---

## 1. 核心定位

本模組不是單純做問券自動填寫，而是作為：

- 專案前置文件進入技術規劃的轉換層
- AI 從需求語言轉為技術語言的推論層
- PM 與技術角色共同確認決策的協作層

---

## 2. 正式需求

### FR-01 AI 預填

- 系統需可讀取專案背景文件、前階段 JSON、或需求摘要
- 系統需產生 `fact_base` 與 `questionnaire_prefill`
- 每筆預填需包含：
  - `value`
  - `confidence`
  - `source`
  - `evidence`

### FR-02 技術棧推論

- 系統需在 S1 完成後，自動產生 S2 技術棧建議
- 建議結果至少包含：
  - `recommended_architecture`
  - `recommended_backend`
  - `recommended_frontend`
  - `recommended_database`
  - `recommended_api_style`
  - `alternatives`
  - `risk_summary`
  - `why`

### FR-03 人工覆核優先

- AI 建議不可直接視為定案
- PM 與技術角色需可：
  - 採納
  - 修改
  - 拒絕
  - 留下備註

### FR-04 單一 Context 演進

- 系統需以 `project-context.json` 作為跨階段累積檔
- 每階段需可：
  - 匯入
  - 預填
  - 驗證
  - 回存

### FR-05 Codegen Readiness

- 系統需根據文件證據判定 AI 可生成程度
- 第一版至少分為：
  - `analysis_only`
  - `design_draft`
  - `code_skeleton_ready`

---

## 3. 應用情境

### UC-01 PM 不熟技術，但需啟動技術規劃

- PM 匯入需求文件
- AI 先抽取 `fact_base`
- AI 預填 S1
- PM 只做修正與確認

### UC-02 S1 完成後自動帶出 S2

- 系統讀取 `project-context.json`
- 產生 S2 核心架構建議
- 顯示建議理由、風險、替代方案

### UC-03 技術角色逐項確認

- 架構師、後端、前端、DevOps 可逐項確認
- 被確認的項目需寫入 context
- 未確認項需列入決策清單

### UC-04 文件不足時限制 AI 行為

- 若證據不足或 `artifact_readiness` 偏低
- 系統應限制 AI 僅分析，不直接進入 code generation

---

## 4. UI 設計原則

### 4.1 分層顯示

- 第一層：核心題（必填）
- 第二層：條件題（依答案展開）
- 第三層：建議與技術確認

### 4.2 對非技術角色友善

- 每題需顯示：
  - 這題為什麼要問
  - 選了會影響哪裡
  - 由誰確認

### 4.3 AI 建議呈現格式

- 建議值
- 建議理由
- 影響範圍
- 替代方案
- 風險提示

---

## 5. 第一版建議輸出

- `s1-prefill.json`
- `s2-recommendation.json`
- `project-context.json`
- `s2-decision-list.json`
- `s3-decision-list.json`

---

## 6. 第一版不納入範圍

- 完整工程盤點表全部欄位
- 每個 library 的細節版本管理
- 完整 observability/tooling 精確設定
- 最終部署腳本自動生成

---

## 7. 成功指標

- PM 從 0 開始填寫的比例下降
- S2 退回率下降
- 首次可用的技術棧建議比例提升
- 跨階段 JSON 可成功沿用到 S3
