# 專案技術治理與 AI 協作知識庫 — 文件總索引

> Project Tech Governance & AI Collaboration Hub — Document Index
> 最後更新：2026-03-13 | 版本：v1.1

---

## 📋 快速導覽

| 我想要... | 看這份文件 |
|----------|----------|
| 了解這個專案在做什麼 | [專案章程](#專案章程) |
| 知道 AI 使用的規範 | [AI 使用治理政策](#治理政策) |
| 了解文件的權威等級 | [SSOT 邊界定義](#治理政策) |
| 知道我要填哪些題目 | [角色責任矩陣](#問卷設計) |
| 了解填答流程與門檻 | [階段流程](#問卷設計) |
| 查看題庫內容 | [題庫檔案](#題庫) |
| 查看驗證規則 | [規則檔案](#規則與計分) |
| 看範例產出 | [範例](#範例) |
| 提交 PR | [PR 模板](#github-治理) |

---

## 一、專案章程

| 文件 | 說明 | SSOT 等級 |
|------|------|----------|
| [project-charter.md](../charter/project-charter.md) | 專案背景、願景、目標、範圍、組織 | Level 2 |
| [implementation-plan.md](../charter/implementation-plan.md) | 實施計畫、技術棧、API 設計、時程 | Level 3 |
| [company-development-baseline.md](../charter/company-development-baseline.md) | 公司團隊基線、產品範圍、技術現況、導入限制 | Level 2 |
| [project-intake-checklist.md](../charter/project-intake-checklist.md) | 專案啟動資料收集表（需求/技術/資安/AI 邊界） | Level 2 |

---

## 二、治理政策

| 文件 | 說明 | SSOT 等級 |
|------|------|----------|
| [ai-usage-policy.md](ai-usage-policy.md) | AI 使用定位、允許/禁止範圍、揭露規範、安全邊界 | **Level 1** |
| [ssot-boundary.md](ssot-boundary.md) | SSOT 邊界定義、文件分級制度、衝突處理 | **Level 1** |
| [contribution-policy.md](contribution-policy.md) | 貢獻流程、分支規範、Commit 規範、PR 要求 | Level 2 |
| [review-policy.md](review-policy.md) | 審核流程、審核矩陣、品質門檻（Gate 0-4） | Level 2 |
| [questionnaire-flow.md](questionnaire-flow.md) | 問卷生命週期、狀態流轉、版本控管 | Level 2 |
| [engineering-rollout-plan.md](engineering-rollout-plan.md) | 12 週工程推進、KPI、風險應對、角色分工 | Level 2 |
| [governance-versioning-policy.md](governance-versioning-policy.md) | 治理文件 SemVer、分級審核、Tag/Release、稽核回溯 | **Level 1** |
| [CHANGELOG.md](CHANGELOG.md) | 治理文件版本變更紀錄 | Level 2 |

---

## 三、問卷設計

| 文件 | 說明 | SSOT 等級 |
|------|------|----------|
| [question-design-principles.md](../questionnaires/question-design-principles.md) | 題庫設計哲學、結構規範、品質檢查、分類規則 | Level 2 |
| [role-matrix.md](../questionnaires/role-matrix.md) | RACI 矩陣、各角色填答指引、跨角色協作點 | Level 2 |
| [stage-flow.md](../questionnaires/stage-flow.md) | 7 階段流程、品質門檻、退回機制、持續優化 | Level 2 |
| [s1-discovery-plain-guide.md](../questionnaires/s1-discovery-plain-guide.md) | S1 探索期白話引導（PM 可直接問客戶） | Level 2 |

---

## 四、Schema 定義

| 文件 | 說明 | SSOT 等級 |
|------|------|----------|
| [question-bank-schema.json](../schemas/question-bank-schema.json) | 題庫定義結構 | **Level 1** |
| [project-answer-schema.json](../schemas/project-answer-schema.json) | 專案回答結構 | **Level 1** |
| [output-schema.json](../schemas/output-schema.json) | 輸出成果結構 | **Level 1** |

---

## 五、題庫

| 文件 | 分類 | 題數 | 階段 | 主要角色 | SSOT |
|------|------|------|------|---------|------|
| [question-bank-index.json](../../question-bank/question-bank-index.json) | 總索引 | — | — | — | **L1** |
| [01-project-basic.json](../../question-bank/categories/01-project-basic.json) | 專案基本資訊 | 8 | 探索期 | PM | **L1** |
| [02-architecture.json](../../question-bank/categories/02-architecture.json) | 系統架構 | 8 | 規劃期 | Architect | **L1** |
| [03-backend.json](../../question-bank/categories/03-backend.json) | 後端技術棧 | 9 | 設計期 | Backend | **L1** |
| [04-frontend.json](../../question-bank/categories/04-frontend.json) | 前端技術棧 | 9 | 設計期 | Frontend | **L1** |
| [05-database.json](../../question-bank/categories/05-database.json) | 資料庫設計 | 6 | 設計期 | Backend | **L1** |
| [06-api.json](../../question-bank/categories/06-api.json) | API 設計 | 7 | 設計期 | Backend | **L1** |
| [07-security.json](../../question-bank/categories/07-security.json) | 資安與合規 | 6 | 設計期 | Security | **L1** |
| [08-deployment.json](../../question-bank/categories/08-deployment.json) | 部署與維運 | 8 | 設計期 | DevOps | **L1** |
| [09-ai-collaboration.json](../../question-bank/categories/09-ai-collaboration.json) | AI 協作規範 | 9 | 規劃期 | Architect | **L1** |

**合計：9 大分類、70 題（62 題必填）**

---

## 六、規則與計分

| 文件 | 說明 | SSOT 等級 |
|------|------|----------|
| [validation-rules.json](../../rules/validation/validation-rules.json) | 20 條驗證規則（10 Error + 10 Warning） | **Level 1** |
| [readiness-scoring.json](../../rules/scoring/readiness-scoring.json) | 就緒度計分規則（9 維度加權） | **Level 1** |
| [output-templates.json](../../rules/output-mapping/output-templates.json) | 輸出映射模板（3 種產出） | **Level 1** |

---

## 七、範例

| 文件 | 說明 |
|------|------|
| [sample-web-project-answers.json](../../samples/projects/sample-web-project-answers.json) | 範例專案填答（客戶管理平台 v2.0） |
| [tech-stack.json](../../generated/examples/tech-stack.json) | 範例技術棧輸出 |
| [ai-context.md](../../generated/examples/ai-context.md) | 範例 AI Context 輸出 |
| [readiness-report.md](../../generated/examples/readiness-report.md) | 範例就緒度報告 |

---

## 八、GitHub 治理

| 文件 | 說明 |
|------|------|
| [PULL_REQUEST_TEMPLATE.md](../../.github/PULL_REQUEST_TEMPLATE.md) | PR 模板（含 AI 揭露、SSOT 影響） |
| [validate-question-bank.yml](../../.github/workflows/validate-question-bank.yml) | CI 自動驗證 workflow |
| [governance-pr-check.yml](../../.github/workflows/governance-pr-check.yml) | PR 治理檢查（版本勾選、SSOT 填寫、CHANGELOG 同步） |

---

## 九、Cursor Rules

| 文件 | 適用範圍 | 說明 |
|------|---------|------|
| [general.mdc](../../.cursor/rules/general.mdc) | 全域 | AI 行為準則、文件分級、語言規範 |
| [question-bank.mdc](../../.cursor/rules/question-bank.mdc) | question-bank/ | 題庫操作、ID 命名、選項設計 |
| [validation-rules.mdc](../../.cursor/rules/validation-rules.mdc) | rules/ | 規則類型、嚴重度、命名規範 |
| [documentation.mdc](../../.cursor/rules/documentation.mdc) | docs/ | 文件格式、SSOT 標記、版本管理 |

---

## 十、系統架構文件參考

### 專案開發順序建議

```
Step 1: 確認專案章程（背景/願景/範圍/非目標）     ✅ 已完成
Step 2: 建立題庫 Schema 與題庫 v1.0              ✅ 已完成
Step 3: 建立問卷流程 + 角色責任矩陣               ✅ 已完成
Step 4: 建立 GitHub Repo 結構 + Cursor Rules     ✅ 已完成
Step 5: 建立治理政策（AI/SSOT/Review/PR）         ✅ 已完成
Step 6: MVP 後端 API 開發                        ⬜ 下一步
Step 7: MVP 前端介面開發                          ⬜ 待規劃
Step 8: 試跑 1-2 個專案                           ⬜ 待規劃
```

### 實作清單（Scenario -> Program）

- [scenario-program-checklist-v1.md](../architecture/scenario-program-checklist-v1.md) - 情境需求分析後的程式清單（API、資料表、檔案路徑、兩週任務）

## 十一、專案清單

- [projects/index.md](../projects/index.md) - 專案啟動索引與優先順序
- [01-questionnaire-system-requirements.md](../projects/01-questionnaire-system-requirements.md) - 第一個專案需求總表（P0）
- [01c-ai-prefill-and-architecture-recommender.md](../projects/01c-ai-prefill-and-architecture-recommender.md) - AI 預填、技術棧推論層與跨階段 context 需求

---

> 📋 本索引為受控文件，變更需經 PR 審核。
> 最後更新：2026-03-13 | 維護者：架構師 | 版本：v1.1
