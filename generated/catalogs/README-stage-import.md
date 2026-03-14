# 階段題庫匯入表說明

> 用途：提供後續資料庫建表與匯入使用。  
> 目前範圍：已寫入 `S1-S7` 現行原型與題庫資料。

---

## 檔案清單

- `stage-question-catalog.csv`
- `stage-option-catalog.csv`

---

## 建議資料表

### 1. `question_catalog`

每列代表一個題目。

主要欄位：

- `stage_id`
- `category_id`
- `question_id`
- `question_title`
- `question_type`
- `required`
- `owner_roles`
- `quality_impact`
- `conditional_question_id`
- `conditional_operator`
- `conditional_values`
- `description`
- `ai_risk_note`
- `source_file`

### 2. `option_catalog`

每列代表某題的一個選項。

主要欄位：

- `stage_id`
- `category_id`
- `question_id`
- `option_value`
- `option_label`
- `option_description`
- `option_mapping`
- `help_summary`
- `help_use_case`
- `help_example`
- `sort_order`
- `source_file`

---

## 使用方式

1. 先匯入 `question_catalog`
2. 再匯入 `option_catalog`
3. 以 `question_id` 關聯

---

## 後續擴充

- `S1-S3` 主要對應題庫與 prototype 題組
- `S4-S6` 主要對應 workflow prototype 中的處置、審核、輸出結構
- `S7` 主要對應發布準備、AI 使用揭露、PR 與版本發佈設定
- 若之後加入 `confidence`、`evidence`、`derived_from`，建議獨立成回答/推論表，不要混在題庫表
