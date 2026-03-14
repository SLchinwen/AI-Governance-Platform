# 治理文件版本控管政策 v1.0

> 目的：建立治理文件可演進、可追溯、可審核的版本管理方式。
> 適用範圍：`docs/governance/`、`docs/charter/`、`rules/`、`question-bank/`、`.cursor/rules/`
> 最後更新：2026-03-13

---

## 1. 核心原則

- 所有治理資產皆視為 code，必須透過 Git PR 變更
- 變更需具備版本號、變更理由、影響說明
- 重大變更需提供 migration 指引
- 文件版本必須與規則版本保持可對照關係

---

## 2. 版本號規範（SemVer）

採用 `MAJOR.MINOR.PATCH`：

- **MAJOR**：不相容變更（流程重構、欄位刪除、責任邊界改變）
- **MINOR**：向後相容新增（新增規則、新增欄位、新增模板）
- **PATCH**：修正錯字、描述澄清、小幅調整（不影響流程）

範例：

- `v1.0.0`：初版治理框架
- `v1.1.0`：新增 AI 審核清單與品質 gate
- `v1.1.1`：修正文件誤植與範例
- `v2.0.0`：改版分支策略與審核流程

---

## 3. 變更分級與審核要求

| 變更等級 | 範例 | 最低審核要求 |
| -------- | ---- | ------------ |
| Patch | 文字修正、範例補充 | 1 位治理 owner |
| Minor | 新增問卷題目、規則、模板 | 1 位治理 owner + 1 位角色代表 |
| Major | 移除欄位、重定義流程、SSOT 邊界改動 | 架構師 + PM + 資安（必要時） |

---

## 4. 分支與標籤策略

- 分支命名：
  - `docs/{topic}`
  - `rule/{topic}`
  - `question/{topic}`
- Tag 命名：
  - `governance-vX.Y.Z`
  - `rules-vX.Y.Z`
  - `question-bank-vX.Y.Z`

建議做法：

- 每次治理 release 使用 annotated tag
- release note 明確列出 Breaking Changes（若有）

---

## 5. Changelog 規範

所有治理版本更新需同步維護 `docs/governance/CHANGELOG.md`，格式建議：

1. 版本號與日期
2. Added / Changed / Deprecated / Removed / Fixed / Security
3. 影響範圍
4. 升版建議（是否需要 migration）

---

## 6. 相依一致性規則

當下列檔案有變動時，必須同步檢查相依資產：

- `question-bank/` 變更 -> 檢查 `docs/schemas/` 與 `rules/validation/`
- `rules/` 變更 -> 檢查 `generated/examples/` 是否需重產
- `docs/governance/ssot-boundary.md` 變更 -> 檢查所有 Level 1/2 文件標記
- `.cursor/rules/` 變更 -> 檢查 `docs/governance/ai-usage-policy.md`

---

## 7. Release 節奏建議

- 每兩週一次 patch/minor release
- 每季一次治理 review，決定是否進行 major 升版
- 發生合規或安全事件時可啟動緊急 patch release

---

## 8. 回溯與稽核

- 每次 release 保留：
  - PR 連結
  - Reviewer 紀錄
  - 變更摘要
  - 影響分析
- 稽核時需能回答：
  - 何時改、誰核准、改了什麼、為何要改

---

## 9. 最小執行清單（v1.0）

- [ ] 所有治理文件加入版本標頭（版本 + 日期）
- [ ] 建立 `CHANGELOG.md`
- [ ] PR 模板加入版本升級判斷（major/minor/patch）
- [ ] 每次合併都能追溯到對應版本紀錄

---

> 本文件為 Level 1 治理政策。若與其他文件衝突，以本文件為準。
