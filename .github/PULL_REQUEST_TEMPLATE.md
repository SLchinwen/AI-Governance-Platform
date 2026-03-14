# 變更摘要

<!-- 簡述此 PR 的變更內容與目的 -->

## 治理版本升級判斷（必填）

- [ ] **Major**（不相容變更，需 migration）
- [ ] **Minor**（向後相容新增）
- [ ] **Patch**（不影響流程之修正）

升級判斷依據：

<!-- 請說明為何屬於 Major / Minor / Patch -->

## 治理 release 資訊（若適用）

- 治理版本：<!-- 例：v1.1.0 -->
- release tag：<!-- 例：governance-v1.1.0 -->
- [ ] 已更新 `docs/governance/CHANGELOG.md`
- [ ] 已確認是否需要 migration 指引（Major 必填）

## 變更類型

- [ ] 題庫變更（question-bank/）
- [ ] 驗證規則變更（rules/）
- [ ] Schema 變更（docs/schemas/）
- [ ] 治理文件變更（docs/governance/）
- [ ] 輸出模板變更（rules/output-mapping/）
- [ ] 專案答案變更（projects/ 或 samples/）
- [ ] Cursor Rules 變更（.cursor/rules/）
- [ ] 程式碼變更（apps/）
- [ ] 其他

## SSOT 影響

- [ ] 本 PR **包含** SSOT 文件（Level 1）變更
  - 受影響的 SSOT 文件：
    - <!-- 例：question-bank/categories/03-backend.json -->
  - 下游需同步更新的文件：
    - <!-- 例：generated/examples/ai-context.md -->
- [ ] 本 PR **不包含** SSOT 文件變更

## 影響範圍（必填）

- 受影響目錄：
  - <!-- 例：docs/governance/, rules/validation/ -->
- 受影響角色：
  - <!-- 例：PM, Backend Lead, Security Lead -->
- 流程影響：
  - [ ] 無流程變更
  - [ ] 有流程變更（請簡述）
- 相依檔案同步：
  - [ ] 已完成相依檔案同步
  - [ ] 無相依檔案

## AI 使用揭露

- [ ] 本 PR **包含** AI 協作產出
  - 使用工具：<!-- 如 Cursor / Copilot / Claude -->
  - AI 參與範圍：<!-- 如 程式碼生成 / 文件撰寫 / 重構 -->
  - 人工審核範圍：<!-- 如 所有檔案 / 僅核心邏輯 -->
  - AI 產出佔比估計：<!-- 如 30% / 50% / 70% -->
- [ ] 本 PR **不包含** AI 協作產出

## 題庫變更明細（若適用）

<!-- 列出新增/修改/刪除的題目 -->
- 動作：<!-- 新增 / 修改 / 刪除 -->
- question_id：<!-- 例：backend.cache.strategy -->
- 說明：<!-- 新增快取策略題目 -->

## 驗證規則變更明細（若適用）

<!-- 列出新增/修改/刪除的規則 -->
- 動作：<!-- 新增 / 修改 / 刪除 -->
- rule_id：<!-- 例：VAL-021 -->
- 說明：<!-- 新增快取與 DB 引擎相容性檢查 -->

## 測試與驗證

- [ ] 已驗證 JSON Schema 合規性
- [ ] 已確認不影響既有專案答案
- [ ] 已更新版本號（若適用）
- [ ] 已更新相關文件索引（若適用）
- [ ] 已完成必要 reviewer 指派（依 `docs/governance/contribution-policy.md`）
- [ ] 已對齊 `docs/governance/governance-versioning-policy.md`

## 審核重點

<!-- 提示 Reviewer 特別注意的地方 -->

## Migration 指引（Major 必填）

<!-- 若為 Major，請描述升級步驟、受影響專案、回滾策略 -->

## 相關 Issue / 討論

<!-- 連結相關 Issue 或討論 -->
