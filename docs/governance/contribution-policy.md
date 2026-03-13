# 貢獻規範 v1.0

> 定義本 Repo 的貢獻方式、PR 要求與 AI 協作產出的管理規範。

---

## 一、貢獻流程

### 基本流程

```
建立 Feature Branch → 進行變更 → 提交 PR → Code Review → 合併
```

### 分支命名規範

| 類型 | 格式 | 範例 |
|------|------|------|
| 新功能 | `feature/{描述}` | `feature/add-deployment-questions` |
| Bug 修復 | `fix/{描述}` | `fix/validation-rule-conflict` |
| 題庫更新 | `question/{分類}` | `question/backend-auth-update` |
| 規則更新 | `rule/{描述}` | `rule/add-jwt-validation` |
| 文件更新 | `docs/{描述}` | `docs/update-ai-policy` |
| 輸出模板 | `output/{描述}` | `output/add-adr-template` |

### Commit Message 規範

採用 Conventional Commits：

```
<type>(<scope>): <description> [optional: ai-assisted]

[optional body]

[optional footer(s)]
```

| Type | 說明 |
|------|------|
| `feat` | 新功能 |
| `fix` | Bug 修復 |
| `question` | 題庫變更 |
| `rule` | 驗證/計分規則變更 |
| `docs` | 文件變更 |
| `schema` | Schema 變更 |
| `output` | 輸出模板變更 |
| `chore` | 維護性變更 |

範例：
```
question(backend): add .NET 9 version option [ai-assisted]
rule(validation): add microservices communication check
docs(governance): update AI usage policy for Q2
```

---

## 二、PR 要求

### 必要條件

- [ ] PR 描述清楚說明變更內容與原因
- [ ] 標記 AI 使用揭露（若有）
- [ ] Schema 變更需附上影響分析
- [ ] 題庫變更需標明新增/修改/刪除的題目
- [ ] 規則變更需說明影響的驗證邏輯
- [ ] SSOT 文件變更需指定審核人

### Reviewer 規則

| 變更類型 | 必要 Reviewer | 可選 Reviewer |
|---------|--------------|--------------|
| 題庫(question-bank/) | 架構師 | 對應角色代表 |
| 驗證規則(rules/) | 架構師 | PM |
| Schema(docs/schemas/) | 架構師 + 後端主管 | |
| 治理文件(docs/governance/) | 架構師 + PM | 資安 |
| 輸出模板(rules/output-mapping/) | 架構師 | DevOps |
| 專案答案(projects/) | 對應角色 | 架構師 |
| Cursor Rules(.cursor/) | 架構師 | 使用者代表 |

### 合併條件

- 至少 1 位必要 Reviewer 核准
- 所有討論已解決（Resolved）
- CI 檢查通過（若有）
- AI 使用揭露已填寫（若適用）

---

## 三、SSOT 文件變更的額外要求

### 變更 SSOT 文件時

1. PR 標題必須以 `[SSOT]` 開頭
2. 必須說明變更對下游文件的影響
3. 必須列出需要同步更新的衍生文件
4. 變更後需觸發相關衍生文件的重新產出

### 範例

```markdown
## [SSOT] 更新 tech-stack.json 前端框架

### 變更內容
- 前端框架從 React 變更為 Vue 3

### 下游影響
- [ ] 需更新 `ai-context.md`
- [ ] 需更新 `.cursor/rules/frontend.mdc`
- [ ] 需重新計算 readiness score
- [ ] 需通知前端團隊
```

---

## 四、AI 協作產出的特別規範

### AI 產出標記

所有由 AI 工具協作產出的檔案，在 commit 中使用 `[ai-assisted]` 標記。

### AI 產出的審核要求

| AI 參與程度 | 審核要求 |
|------------|---------|
| AI 建議（人工修改 > 70%） | 標準 Review |
| AI 協作（人工修改 30-70%） | 需 Senior Review |
| AI 主導（人工修改 < 30%） | 需 Senior Review + 額外測試 |

### 禁止行為

- 不得將 AI 產出直接 push 到 main/master
- 不得在 AI prompt 中包含機敏資訊
- 不得讓 AI 修改 SSOT 文件後直接合併
