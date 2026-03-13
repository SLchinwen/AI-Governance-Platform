# SSOT 邊界定義 v1.0

> Single Source of Truth（SSOT）邊界定義
> 明確區分哪些是正式規格、哪些是輔助文件

---

## 一、SSOT 的核心原則

### 定義

SSOT（Single Source of Truth）是指在特定議題上，具有**最終權威性**的唯一文件或資料來源。
當其他文件與 SSOT 衝突時，以 SSOT 為準。

### 核心規則

1. **一個議題只有一個 SSOT**：不得有兩份文件同時宣稱自己是某資訊的真實來源
2. **SSOT 必須可版本化**：必須在 GitHub 中受版本控管
3. **SSOT 變更需審核**：變更必須透過 PR + Reviewer 審核
4. **AI 不得直接修改 SSOT**：AI 只能產出草稿，人工審核後才能合併至 SSOT
5. **SSOT 必須可被 AI 讀取**：格式需為 AI 可解析的結構化格式（JSON / Markdown）

---

## 二、文件分級制度

### Level 1：SSOT — 正式規格（Specification）

> 具有最終權威性，是系統行為的依據

| 文件類型 | 格式 | 範例 | 變更審核 |
|---------|------|------|---------|
| 技術棧定義 | JSON | `tech-stack.json` | 架構師 + PM |
| API 規格 | OpenAPI | `openapi.yaml` | 後端主管 + 架構師 |
| 錯誤碼定義 | JSON | `error-codes.json` | 後端主管 |
| 資料模型 | JSON Schema | `*.schema.json` | 架構師 |
| 驗證規則 | JSON | `validation-rules.json` | 架構師 |
| 計分規則 | JSON | `scoring-rules.json` | 架構師 |
| AI 使用政策 | Markdown | `ai-usage-policy.md` | 架構師 + 資安 |
| 題庫定義 | JSON | `question-bank/*.json` | 架構師 |

#### SSOT 標記

SSOT 文件必須在檔案開頭包含標記：

```json
{
  "$ssot": true,
  "$ssot_domain": "tech-stack",
  "$ssot_owner": "architect",
  "$ssot_review_required": true
}
```

或在 Markdown 文件中：

```markdown
> 📋 SSOT | Domain: AI Usage Policy | Owner: Architect + Security | Review: Required
```

---

### Level 2：受控文件（Controlled Document）

> 經過審核的正式文件，但非最終技術規格

| 文件類型 | 格式 | 範例 | 變更審核 |
|---------|------|------|---------|
| AI Context | Markdown | `ai-context.md` | 架構師 |
| Readiness Report | Markdown | `readiness-report.md` | PM + 架構師 |
| ADR 決策紀錄 | Markdown | `adr-*.md` | 架構師 |
| 問卷填答結果 | JSON | `project-answers.json` | 各角色 + 架構師 |
| Cursor Rules | MDC | `.cursor/rules/*.mdc` | 架構師 |
| PR Template | Markdown | `PULL_REQUEST_TEMPLATE.md` | DevOps |

---

### Level 3：參考文件（Reference Document）

> 輔助說明，不具權威性，與 SSOT 衝突時以 SSOT 為準

| 文件類型 | 格式 | 範例 |
|---------|------|------|
| 實施計畫 | Markdown | `implementation-plan.md` |
| 設計原則 | Markdown | `design-principles.md` |
| 會議紀錄 | Markdown | `meeting-notes-*.md` |
| 教學文件 | Markdown | `tutorial-*.md` |
| 範例程式碼 | 各語言 | `samples/` |
| 問卷流程說明 | Markdown | `questionnaire-flow.md` |

---

### Level 4：草稿與 AI 產出（Draft / AI Generated）

> 未經審核，不得作為依據

| 文件類型 | 說明 | 處理方式 |
|---------|------|---------|
| AI 產出程式碼 | 尚未 Code Review | 需經 PR 審核才能合併 |
| 文件草稿 | 尚未審核 | 標記為 `[DRAFT]` |
| 建議方案 | AI 提出的方案 | 需人工驗證 |
| 自動產出文件 | 系統自動生成 | 需審核後升級至 Level 2 |

---

## 三、SSOT 衝突處理

### 發現衝突時的處理流程

```
發現衝突 → 確認哪份是 SSOT → 以 SSOT 為準 → 更新非 SSOT 文件 → 記錄衝突紀錄
```

### 衝突紀錄格式

```markdown
## SSOT 衝突紀錄

- 日期：2026-03-13
- 衝突文件：`ai-context.md` vs `tech-stack.json`
- SSOT 文件：`tech-stack.json`
- 衝突內容：前端框架不一致（ai-context 寫 Vue，tech-stack 寫 React）
- 處理結果：以 tech-stack.json 為準，更新 ai-context.md
- 處理人：陳架構師
```

---

## 四、各產出文件的 SSOT 歸屬

| 問卷產出 | SSOT 等級 | 歸屬 SSOT | 說明 |
|---------|----------|----------|------|
| `tech-stack.json` | Level 1 | 自身即 SSOT | 技術棧的唯一真實來源 |
| `ai-context.md` | Level 2 | 衍生自 tech-stack | 與 tech-stack 衝突時以後者為準 |
| `readiness-report.md` | Level 2 | 衍生自題庫答案 | 反映特定時間點的評估 |
| `validation-rules.json` | Level 1 | 自身即 SSOT | 驗證規則的唯一來源 |
| `question-bank/*.json` | Level 1 | 自身即 SSOT | 題庫的唯一來源 |
| `cursor-rules/*.mdc` | Level 2 | 衍生自 tech-stack + ai-policy | 須與上游 SSOT 一致 |
