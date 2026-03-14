# Web App Architecture

## 目標

新版 `apps/web` 的核心目標是把原本分散的 `S1-S7` prototype，重構成一個可維護、可擴充、可治理的單一前端應用。

關鍵原則：

- 單一 `project-context` 作為 SSOT
- `schema-driven` 問卷 UI
- `engine-driven` 派生邏輯
- `stage feature` 負責摘要、建議與預覽組裝
- 所有階段都可回寫到同一個 context

## 架構分層

### 1. `platform/types`

定義整個平台的核心資料模型：

- `ProjectContext`
- `ValidationState`
- `ReviewState`
- `PublishState`
- `ArtifactRecord`

這一層是所有 engine、store、feature 的共用契約。

### 2. `platform/schemas`

`stageSchemas.ts` 是問卷驅動核心，定義：

- phase / stage
- 欄位型別
- owner role
- required / optional
- section
- 題目條件顯示規則
- stage outputs

UI 不應硬編欄位，應優先從這裡擴充。

### 3. `platform/engines`

這一層負責把「原始填答」轉成「可執行的治理與輸出結果」。

- `questionnaireEngine`
  控制欄位可見性、分段、完成度。
- `governance/validationEngine`
  根據 `S1-S3 + governanceRules` 產生 `S4` 分數與 issue。
- `review/reviewEngine`
  根據 `S4 + S5 answers` 產生 checklist、review state、review packet。
- `artifacts/artifactEngine`
  根據 `project-context` 產出 `S6` artifacts 與 `S7 handoff`。
- `publish/publishEngine`
  根據 `S6 outputs + S7 answers` 產生 publish readiness、PR body、AI disclosure、manifest。

### 4. `platform/rules`

`governanceRules.ts` 放跨階段治理規則。  
原則上：

- 規則只做判定
- 不處理 UI
- 不處理 store state mutation

這樣未來才容易搬到 API 或規則引擎服務。

### 5. `platform/store`

`projectContextStore.tsx` 是目前的 orchestration 中心。

責任：

- 管理單一 `ProjectContext`
- 接收 `update_stage_field`
- 重新計算 validation / review / artifacts / publish
- 將衍生資料寫回 `stages.s4-s7.derived / handoff`

這一層目前承接派生流程，是整體工作流的同步器。

### 6. `features/*`

各 stage 的 feature 檔案負責：

- 即時摘要
- 推薦建議
- 預覽資料組裝

例如：

- `features/discovery`
- `features/architecture`
- `features/design`
- `features/validation`
- `features/review`
- `features/output`
- `features/publish`

原則上：

- engine 做運算
- feature 做展示資料轉換

## 資料流

整體流程如下：

1. 使用者在 `QuestionnaireForm` 修改欄位
2. `ProjectContextStore` 更新 `stages.<stage>.answers`
3. store 重新執行：
   `validation -> review -> artifacts -> publish`
4. 衍生結果回寫到：
   `context.validation`
   `context.review`
   `context.artifacts`
   `context.publish`
   `stages.s4-s7.derived`
   `stages.s5-s7.handoff`
5. `App.tsx` 根據 active stage 顯示對應 summary / recommendations / previews

## 當前完成範圍

已完成：

- `S1 Discovery`
- `S2 Architecture`
- `S3 Design`
- `S4 Validation`
- `S5 Review`
- `S6 Output`
- `S7 Publish`

已具備：

- 單一 App Shell
- 3 個 phase 導覽
- 7 個 stage schema
- validation / review / output / publish flow
- preview 與 handoff 物件生成

## 後續建議

下一步可優先做這些：

- 加入 `project-context` import / export
- 將 engines 拆成更細的 pure helper
- 為 rules / engines 補單元測試
- 加入 local persistence 或 API persistence
- 將 `App.tsx` 再拆成 sidebar / summary / preview 子元件

## 設計原則

若後續要擴充，請優先遵守：

- 新欄位先加在 schema，再接 engine
- 不在 component 內直接寫治理規則
- 不讓 artifact 生成邏輯散落在 UI
- handoff 結構應保持 machine-consumable
- 能放在 pure function 的邏輯，不要塞進 React component
