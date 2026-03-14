# PRJ-001 S1 資料校正與 QC 摘要

> 來源 Prompt：`docs/prompts/prompt-calibration-v2.md`  
> QC 參考：`docs/prompts/prompt-qc.md`

---

## 結論

- 通過（可直接用於 S1 預填與送審）

---

## A. Fact Base（可驗證事實）

- 專案名稱：`技術棧問券與 AI 協作知識庫系統`
- 專案類型：`web_application`
- 專案性質：`greenfield`
- 投入人數：`4`
- 資料敏感度：`confidential`
- 里程碑日期：開工 `2026-03-16`、MVP `2026-05-08`、上線 `2026-06-12`

---

## B. S1 問券預填檔

- `generated/projects/PRJ-001/s1-required-data.json`
- 已覆蓋 S1 全部欄位（含選填 `stakeholders`）

---

## C. QC 檢查結果（對照 prompt-qc）

- Evidence 覆蓋率：100%（每個關鍵欄位皆有來源）
- 事實/建議混淆：0
- 待確認事項 owner/時程：不適用（目前無 pending）
- 規則可映射性：可映射到 `project_basic` 題組

---

## D. 可回流知識庫項目（建議）

- `new_case`：PRJ-001 S1 機密專案範例（4 人小團隊）
- `new_faq`：機密等級（confidential）專案在 S1 應如何定義 AI 邊界
