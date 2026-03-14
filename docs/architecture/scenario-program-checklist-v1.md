# 情境需求分析後程式清單 v1.0

> 目的：將情境需求轉成可直接分工的程式開發清單。  
> 適用：技術規範問卷與 AI 協作治理平台 MVP。

---

## 1. 實作前提

- 目前 Repo 以治理文件與題庫為主，尚未建立 .NET/React 專案骨架。
- 本清單以 `Azure + .NET 8 Web API + Azure SQL + React/TypeScript` 為目標技術棧。
- 問題來源依 `question-bank/question-bank-index.json`（9 分類、70 題）為 SSOT。

---

## 2. 情境到程式清單

### 情境 S1：PM 建立新專案問卷

- 需求重點
  - 建立專案主檔與第一版問卷實例
  - 設定初始階段為 `discovery`

- 後端程式
  - `src/backend/Api/Controllers/ProjectsController.cs`
  - `src/backend/Application/Projects/CreateProjectCommand.cs`
  - `src/backend/Domain/Entities/Project.cs`
  - `src/backend/Domain/Entities/QuestionnaireInstance.cs`

- 資料庫
  - `Projects`
  - `QuestionnaireInstances`

- API
  - `POST /api/v1/projects`
  - `POST /api/v1/projects/{projectId}/questionnaires`

---

### 情境 S2：依角色與階段載入題目

- 需求重點
  - 使用者只看到自己角色與目前階段應填題目
  - 支援條件題顯示

- 後端程式
  - `src/backend/Api/Controllers/QuestionsController.cs`
  - `src/backend/Application/Questions/GetQuestionsQuery.cs`
  - `src/backend/Application/Questions/QuestionFilterService.cs`
  - `src/backend/Infrastructure/QuestionBank/QuestionBankLoader.cs`

- 前端程式
  - `src/frontend/pages/questionnaire/QuestionnairePage.tsx`
  - `src/frontend/features/questionnaire/QuestionList.tsx`
  - `src/frontend/features/questionnaire/useQuestionFilters.ts`

- 資料庫
  - `Questions`（由題庫同步）
  - `Assignments`（角色指派）

- API
  - `GET /api/v1/questionnaires/{id}/questions?role={roleId}&stage={stageId}`

---

### 情境 S3：角色填答與草稿儲存

- 需求重點
  - 支援儲存草稿、更新答案、追蹤填答者與時間
  - 支援答案信心度

- 後端程式
  - `src/backend/Api/Controllers/AnswersController.cs`
  - `src/backend/Application/Answers/SaveAnswerCommand.cs`
  - `src/backend/Application/Answers/SaveDraftCommand.cs`
  - `src/backend/Domain/Entities/Answer.cs`

- 前端程式
  - `src/frontend/features/questionnaire/AnswerForm.tsx`
  - `src/frontend/features/questionnaire/useSaveAnswer.ts`

- 資料庫
  - `Answers`

- API
  - `POST /api/v1/questionnaires/{id}/answers`
  - `PUT /api/v1/questionnaires/{id}/answers/{questionId}`

---

### 情境 S4：執行驗證規則與就緒度評分

- 需求重點
  - 執行 Error/Warning 規則
  - 產生 readiness score 與缺漏清單

- 後端程式
  - `src/backend/Api/Controllers/ValidationController.cs`
  - `src/backend/Application/Validation/RunValidationCommand.cs`
  - `src/backend/Application/Validation/RulesEngine.cs`
  - `src/backend/Application/Scoring/ReadinessScoringService.cs`

- 前端程式
  - `src/frontend/pages/validation/ValidationReportPage.tsx`
  - `src/frontend/features/validation/ValidationSummary.tsx`

- 資料庫
  - `ValidationResults`

- API
  - `POST /api/v1/questionnaires/{id}/validate`
  - `GET /api/v1/questionnaires/{id}/readiness`

---

### 情境 S5：階段流轉與審核

- 需求重點
  - Gate 未通過不可進下一階段
  - 可退回修正且保留版本

- 後端程式
  - `src/backend/Api/Controllers/WorkflowController.cs`
  - `src/backend/Application/Workflow/TransitionStageCommand.cs`
  - `src/backend/Application/Workflow/StageGatePolicy.cs`
  - `src/backend/Domain/Entities/StageTransition.cs`

- 前端程式
  - `src/frontend/pages/review/ReviewPage.tsx`
  - `src/frontend/features/review/StageTransitionPanel.tsx`

- 資料庫
  - `StageTransitions`
  - `QuestionnaireInstances`（版本狀態欄位）

- API
  - `POST /api/v1/questionnaires/{id}/stages/{nextStage}/transition`
  - `POST /api/v1/questionnaires/{id}/reviews/approve`
  - `POST /api/v1/questionnaires/{id}/reviews/reject`

---

### 情境 S6：產出標準文件並發布

- 需求重點
  - 生成三類核心產出
  - 可追溯至問卷版本與審核結果

- 後端程式
  - `src/backend/Api/Controllers/OutputsController.cs`
  - `src/backend/Application/Outputs/GenerateOutputsCommand.cs`
  - `src/backend/Application/Outputs/TemplateRenderer.cs`
  - `src/backend/Domain/Entities/OutputArtifact.cs`

- 前端程式
  - `src/frontend/pages/output/OutputPreviewPage.tsx`
  - `src/frontend/features/output/ArtifactList.tsx`

- 資料庫
  - `OutputArtifacts`

- API
  - `POST /api/v1/questionnaires/{id}/generate`
  - `GET /api/v1/questionnaires/{id}/artifacts`

---

## 3. MVP 程式目錄建議

```text
src/
  backend/
    Api/
    Application/
    Domain/
    Infrastructure/
    Tests/
  frontend/
    pages/
    features/
    shared/
    tests/
```

---

## 4. 第一波開發任務（建議兩週）

- W1：後端骨架與核心資料模型
  - 建立 `Project/Questionnaire/Question/Answer` 實體
  - 完成 S1、S2、S3 API 初版

- W2：驗證、流轉與產出
  - 完成 S4、S5、S6 API 初版
  - 前端完成填答頁、驗證頁、審核頁最小可用版

---

## 5. 驗收用最小測試清單

- 可以建立新專案並生成第一版問卷
- 角色切換後題目內容不同
- 未達 Gate 時無法進下一階段
- 產生 `tech-stack.json`、`ai-context.md`、`readiness-report.md`
- 有完整審核與流轉紀錄

---

> 本文件為開發清單基準版。後續若新增情境或角色，請同步更新本文件並記錄至治理變更紀錄。
