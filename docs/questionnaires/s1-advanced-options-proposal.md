# S1 進階必要選項評估提案 v1.0

> 目標：不是增加題目數量，而是補上「會影響後續 AI 生成治理程式是否正確」的最小必要選項。  
> 適用範圍：`project_basic`（S1 Discovery）

---

## 評估結論（精簡版）

目前 S1 已有 8 題可決定基本方向，但對「AI 生成治理程式」仍缺少 6 個關鍵上下文。  
建議新增 **6 題（3 題必填 + 3 題條件必填）**，即可顯著降低後續 S2/S3 的返工率。

---

## 建議新增選項（最小必要）

| 新欄位（建議 question_id） | 類型 | 建議必填 | 為什麼要加（對 AI 影響） |
| --- | --- | --- | --- |
| `project_basic.delivery.channel` | single_select | 必填 | 決定是否屬對外系統，影響 auth/API/security 基準 |
| `project_basic.integration.level` | single_select | 必填 | 決定整合風險與 API 契約優先度 |
| `project_basic.artifact.readiness` | single_select | 必填 | 決定 AI 可直接生成程度與 prompt 精準度 |
| `project_basic.governance.ai_execution_boundary` | single_select | 條件必填（`confidential/restricted`） | 決定可用模型/環境與資料外送限制 |
| `project_basic.lifecycle.change_risk` | single_select | 條件必填（`extension/migration/refactor`） | 決定回滾、相容、回歸測試治理要求 |
| `project_basic.dependency.critical_external` | single_select | 條件必填（`integration/api_platform`） | 決定是否必須先做 mock 契約與整合門檻 |

---

## 選項設計建議

### 1) `project_basic.delivery.channel`

- 建議選項：
  - `internal_only`（僅內部）
  - `customer_facing`（客戶可直接使用）
  - `partner_facing`（夥伴/供應商串接）
  - `mixed`

- 對應治理影響：
  - `customer_facing/partner_facing/mixed` -> 強制後續包含 auth、API 文件與安全檢核

### 2) `project_basic.integration.level`

- 建議選項：
  - `standalone`
  - `internal_systems`
  - `external_partners`
  - `mixed`

- 對應治理影響：
  - 非 `standalone` -> 後續必須有 API 契約、依賴清單、錯誤碼標準

### 3) `project_basic.artifact.readiness`

- 建議選項：
  - `minimal`（只有需求摘要）
  - `standard`（有 PRD/流程/角色）
  - `ready_for_codegen`（含 API/schema/欄位字典/驗收）

- 對應治理影響：
  - `minimal` -> AI 僅允許產生分析建議，不允許直接產程式草稿
  - `ready_for_codegen` -> 可啟動生成模板與驗證規則自動化

### 4) `project_basic.governance.ai_execution_boundary`

- 建議選項：
  - `cloud_model_masked_data`
  - `private_model_only`
  - `no_code_generation_only_analysis`

- 條件：資料敏感度為 `confidential/restricted` 時必填

### 5) `project_basic.lifecycle.change_risk`

- 建議選項：
  - `low`
  - `medium`
  - `high`

- 條件：`is_new != greenfield` 時必填
- 目的：提早決定是否要求雙軌發布/回滾方案

### 6) `project_basic.dependency.critical_external`

- 建議選項：
  - `none`
  - `has_non_critical`
  - `has_critical`

- 條件：`project_type in [integration, api_platform]` 時必填

---

## 不同專案類型「必須增加」的最小組合

| 專案類型 | 需要增加的必要選項 |
| --- | --- |
| `web_application` | `delivery.channel`, `integration.level`, `artifact.readiness` |
| `api_platform` | 上述三項 + `dependency.critical_external` |
| `integration` | 上述三項 + `dependency.critical_external` |
| `internal_tool` | 上述三項（可不強制 external dependency） |
| `maintenance` | 上述三項 + `lifecycle.change_risk` |
| `data_pipeline` | 上述三項 +（若含機密資料則）`ai_execution_boundary` |

---

## 對 PRJ-001（問券系統專案）的建議填值

- `project_basic.delivery.channel` = `internal_only`
- `project_basic.integration.level` = `internal_systems`
- `project_basic.artifact.readiness` = `standard`
- `project_basic.governance.ai_execution_boundary` = `private_model_only`（因 `confidential`）
- `project_basic.lifecycle.change_risk` = `low`（目前 `greenfield` 可先低）
- `project_basic.dependency.critical_external` = `none`

---

## 導入順序（避免一次改太多）

1. **先加 3 個必填：** `delivery.channel`, `integration.level`, `artifact.readiness`
2. **再加 3 個條件必填：** 依敏感度/專案型態觸發
3. 更新驗證規則與原型頁對應提示（先 warning，下一版再升級成 error）

---

## 成功判定（這次提案是否有效）

- S2 退回率下降（目標：下降 30%）
- `pending_fields` 數量下降（目標：下降 40%）
- AI 產出首次可用率提升（目標：提升 25%）
