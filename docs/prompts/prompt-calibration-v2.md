# Prompt Calibration v2（前置資料整理）

> 用途：把「專案前置資料」轉成可執行的問券預填、決策清單與後續 Prompt 需求。  
> 情境：此分析可用於測試專案與正式專案，請明確標示資料來源與適用範圍。

---

## 使用方式

- 將以下 Prompt 原文貼給 AI
- 附上資料來源（流程文件、權限矩陣、程式清單、雛型、需求摘要）
- 產出後再用 `prompt-qc.md` 進行自檢

---

## Prompt 原文（可直接貼用）

```text
你是「專案前置資料校正分析師」。
這是一份“測試專案輸出”或“正式專案輸出”，你的任務是：
1) 從輸入資料抽取可驗證事實
2) 分離可建議項目
3) 生成可直接餵問券與後續 Prompt 的結構化結果

【硬性規則】
- 不可把推測當事實
- 每個欄位都要有 evidence（來源檔案 + 片段摘要）
- 無證據一律標示「待確認」
- 建議必須優先使用公司標準選項（若無則提「新增候選」）
- 一律使用繁體中文

【輸出格式（固定 7 區塊）】
A. Fact Base（可驗證事實）
- key / value / confidence / evidence[]

B. 問券預填建議（JSON）
- 僅填有 evidence 的欄位
- 其餘放 pending_fields

C. 待決策清單（Top 10）
- decision / why / impact / owner / due_stage / required_inputs

D. 衝突與風險
- conflict_id / source_a / source_b / risk_level / mitigation / owner

E. 技術棧候選（最多 3 套）
- 必須對照公司標準選項庫
- 每套附：適用條件 / 排除條件 / 導入成本 / 風險

F. 驗證規則草案
- rule_id / level(error|warning) / trigger / message / related_question_key

G. Prompt Pack 需求
- pm_prompt / architect_prompt / frontend_prompt / backend_prompt / devops_prompt / security_prompt
- 每個 prompt 含：目的、必要輸入、輸出格式、驗收準則

【附加要求】
- 另輸出「待確認事項表」：item / 缺什麼 / 向誰確認 / 預計完成時間 / 不確認風險
- 另輸出「可回流知識庫項目」：new_option / new_rule / new_faq / new_case
```

---

## 建議輸入清單

- `流程文件`
- `角色權限矩陣`
- `程式清單（主程式/子程式）`
- `雛型（HTML+JS 或其他）`
- `需求摘要 md`

---

## 輸出用途對照

- 問券預填建議 JSON -> 問券 S1/S2 預填
- 待決策清單 -> 規劃會議議程
- 規則草案 -> 驗證規則候選
- Prompt Pack -> 各角色後續 AI 協作
