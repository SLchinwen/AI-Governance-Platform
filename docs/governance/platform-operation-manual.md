# AI Development Governance Platform 操作手冊

> 用途：提供對外使用者一份可以直接照著操作的流程型手冊。  
> 適用對象：PM、Architect、Backend / Frontend Lead、QA、Security、DevOps，以及需要使用 AI 協作開發流程的團隊。

---

## 一、這份手冊適合怎麼看

如果你是第一次使用這個平台，建議不要先從欄位細節開始看，而是先用「情境流程」理解整個服務怎麼運作。

你只要記住 3 件事：

1. 平台有固定的 `S1-S7` 階段
2. 所有內容都會累積到 `project-context.json`
3. 每一階段不是只填表，而是會產生下一階段需要的治理資訊

---

## 二、平台整體流程

```text
S1 Discovery
  -> S2 Architecture
  -> S3 Engineering Design
  -> S4 Validation
  -> S5 Review
  -> S6 Artifact Generation
  -> S7 Publish
```

每個階段的目標如下：

| 階段 | 主要目標 | 主要輸出 |
| ------ | ---------- | ---------- |
| `S1` | 釐清專案背景與風險基線 | discovery context |
| `S2` | 定義架構方向與 AI 邊界 | architecture decisions |
| `S3` | 定義工程實作規格 | design standards |
| `S4` | 檢查風險、缺漏與就緒度 | blockers / warnings / scores |
| `S5` | 正式審核與鎖版 | approved review packet |
| `S6` | 生成正式工程 artifacts | tech-stack / ai-context / ADR 等 |
| `S7` | 整理發布資料包 | PR body / AI disclosure / manifest |

**引用公司標準（新專案）：** 若新專案要直接採用公司已審核的技術棧，請在 S1 選擇「技術棧採用方式」→「全程採用公司共通標準」，S2/S3 將自動帶入，產出之 artifact 會標記依公司標準維度。詳見 [公司技術棧共通標準](company-tech-stack-standard.md) 第六節「如何在新專案引用公司標準」。

---

## 三、情境一：建立一個新的內部 Web 專案

### 情境一描述

公司要啟動一個新的內部系統，希望後續可以讓 AI 協助產生部分程式碼與文件，但又不能失去治理與審核。

### 情境一操作方式

#### Step 1：先做 `S1 Discovery`

由 PM 或專案負責人填寫：

- 專案名稱
- 專案類型
- 系統分類
- 技術成熟度
- 團隊規模
- 資料敏感度
- 整合依賴程度
- AI 執行邊界
- **技術棧採用方式**（可選「全程採用公司共通標準」以引用公司技術棧，S2/S3 將自動帶入；見 [公司技術棧共通標準](company-tech-stack-standard.md)）

### 情境一完成後的結果

- 專案基本輪廓
- 後續架構建議的判斷基線
- `project-context.stages.s1`

### 情境一實務建議

- 若資料敏感度是 `confidential` 或 `restricted`，請在 `S1` 就先把 AI 邊界定清楚
- 如果團隊規模很小，不要太早假設要做微服務

---

## 四、情境二：Architect 要把架構與實作規格定清楚

### 情境二描述

PM 已經確認專案方向，現在需要 Architect 帶領團隊，定義一套真的能落地給工程與 AI 使用的架構與實作基線。

### 情境二操作方式

#### Step 2：進入 `S2 Architecture`

重點欄位：

- 架構風格
- Backend / Frontend / Database
- API style
- Authentication pattern
- Deployment model
- Integration strategy
- Observability baseline
- AI collaboration boundary

#### Step 3：進入 `S3 Engineering Design`

重點欄位：

- Repo structure
- Code structure
- Module boundaries
- CI/CD workflow
- Logging strategy
- Monitoring strategy
- Test coverage target

### 情境二完成後的結果

- 明確的 architecture decision
- 可被工程與 AI code generation 直接引用的實作規格
- 後續 `ADR`、`Cursor Rules`、`project-architecture.md` 的基礎來源

### 情境二實務建議

- `S2` 的 authentication pattern 不要留到實作時才決定
- `S3` 的 CI/CD、logging、monitoring 建議視為必備工程基線，不要只填功能面欄位
- 若採 microservices，請一定補齊 module boundaries 與 workflow，不然後面 review 成本會很高

---

## 五、情境三：團隊要開始讓 AI 協助寫程式

### 情境描述

你希望把平台產出的內容拿去給 Cursor、Copilot、GPT 或 Claude 使用，讓 AI 幫忙產生程式碼、文件草稿或重構建議。

### 情境三正確做法

不要直接把零散需求丟給 AI。  
建議先完成到 `S6`，讓平台生成正式 artifacts，再把這些 artifacts 當成 AI 的工作基線。

### 情境三前置階段

1. `S1-S3`：把需求、架構、實作規格填完整
2. `S4`：確認沒有 blocker，warning 在可接受範圍
3. `S5`：完成 review 與版本鎖定
4. `S6`：生成正式輸出

### 情境三建議輸出

| 輸出 | 給誰用 | 用途 |
| ------ | -------- | ------ |
| `tech-stack.json` | 系統 / 工具 | 機器可讀的技術棧定義 |
| `ai-context.md` | AI 工具 | 專案背景、限制與上下文 |
| `project-architecture.md` | 工程 / AI | 架構與模組設計說明 |
| `implementation-checklist.md` | 工程 / PM | 實作前檢查 |
| `adr.md` | Architect / Tech Lead | 架構決策紀錄 |
| `cursor-rules.mdc` | Cursor / AI | AI 協作規則草稿 |

### 情境三實務建議

- 把 `ai-context.md + tech-stack.json + cursor-rules.mdc` 視為 AI code generation 的最小組合
- 若專案涉及高敏感資料，請在 `S2` 和 `S5` 再次確認 AI 邊界與 review 要求

---

## 六、情境四：專案要進入審核與鎖版

### 情境四描述

工程規格大致完成，現在要確認這份設計是否真的可以作為正式基線，不只是「看起來差不多」。

### 情境四操作方式

#### Step 4：執行 `S4 Validation`

系統會自動產生：

- blockers
- warnings
- readiness score
- risk score
- confidence score
- owner / due matrix

#### Step 5：進入 `S5 Review`

由 Architect 與 PM 共同完成：

- review decision
- reviewer note
- version lock
- handoff 判定

### 情境四進階判斷方式

最常見的判斷方式：

- blocker 必須清空
- warning 要有處理計畫
- readiness score 至少達到內部門檻
- review checklist 全部通過

### 情境四完成後的結果

- `approved-review-packet`
- `s6-handoff`
- 可追蹤的 review 結果與版本資訊

---

## 七、情境五：要把成果發布到 Repo 或 PR

### 情境五描述

你不是只想把文件下載下來，而是要把這次治理成果整理成一個可發布、可審查、可回溯的資料包。

### 情境五操作方式

#### Step 6：在 `S6` 選擇要生成的 artifacts

常見正式輸出：

- `tech-stack.json`
- `ai-context.md`
- `readiness-report.md`
- `adr.md`
- `cursor-rules.mdc`
- `project-architecture.md`
- `implementation-checklist.md`

#### Step 7：在 `S7 Publish` 補齊發布資訊

你需要整理：

- base branch
- publish branch
- tag / version
- PR title
- reviewers
- AI disclosure
- change summary

平台會生成：

- `pr-body.md`
- `ai-disclosure.md`
- `publish-manifest.json`

### 情境五實務建議

- `change summary` 要寫「為什麼發布」而不是只列檔名
- `AI disclosure` 要說明 AI 參與範圍與人工覆核方式
- reviewer 至少應包含 Architect 與 PM；若涉及部署，建議加入 DevOps

---

## 八、角色別操作建議

### PM

最常用：

- `S1`
- `S5`
- `S7`

重點：

- 先把專案背景與風險講清楚
- 在 review 階段確認交付風險與時程影響
- 發布前確認 PR / disclosure 對外說法是否正確

### Architect

最常用：

- `S2`
- `S3`
- `S4`
- `S5`

重點：

- 把 authentication、integration、module boundary 定清楚
- 不要只定技術棧，還要定工程治理基線
- 確保 artifacts 可被工程與 AI 真正使用

### DevOps

最常用：

- `S2`
- `S3`
- `S6`
- `S7`

重點：

- deployment / CI/CD / monitoring 要盡量前置定義
- 在 `S7` 檢查 branch / tag / reviewers / manifest

---

## 九、常見錯誤與避免方式

| 常見問題 | 會造成什麼結果 | 建議做法 |
| --------- | ---------------- | --------- |
| 只填功能，不填工程治理欄位 | AI 生成結果缺少交付基線 | `S3` 一起補齊 CI/CD、logging、monitoring |
| 沒有定義 authentication | API 與前端整合容易反覆修改 | 在 `S2` 先定義 authentication pattern |
| 跳過 `S4-S5` 直接出文件 | 輸出內容可能不可審核 | 至少先完成 validation 與 review |
| 只生成 `ai-context.md` | 工程與 AI 缺少完整依據 | 至少搭配 `tech-stack.json` 與 `project-architecture.md` |
| 發布時沒做 AI disclosure | 對外治理不可追蹤 | `S7` 必填 AI disclosure 與 change summary |

---

## 十、建議的最小落地流程

如果你今天要把這個平台真的用起來，建議先採這個最小流程：

1. PM 完成 `S1`
2. Architect 完成 `S2`
3. Tech Leads 完成 `S3`
4. 系統與 Architect 完成 `S4`
5. Architect + PM 完成 `S5`
6. 系統生成 `S6` 核心 artifacts
7. DevOps / Architect 完成 `S7`

### 最小輸出組合

若只想先做 MVP 導入，建議最少生成：

- `tech-stack.json`
- `ai-context.md`
- `project-architecture.md`
- `implementation-checklist.md`
- `adr.md`
- `cursor-rules.mdc`

---

## 十一、對外發布建議

如果你要把這份手冊用 `MkDocs` 發布到 Pages，建議：

- 把這份文件作為主要操作頁
- 把治理總索引作為第二層導航
- 把 `stage-flow.md` 當作補充流程說明
- 後續若要增加產品頁，可再補「角色導向手冊」與「FAQ」

---

> 建議搭配閱讀：

- [治理文件總索引](index.md)
- [問卷階段流程與品質門檻](../questionnaires/stage-flow.md)
- [審核政策](review-policy.md)
