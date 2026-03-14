# AI Development Governance Platform Web

這個資料夾是新版前端 App，使用 `React + TypeScript + Vite`，把原本分散的 `S1-S7 HTML prototype` 重構成單一 App Shell，並以 `project-context` 作為 Single Source of Truth。

## 目前能力

- 以單一 `project-context` 串接 `S1-S7`。
- 使用外部化 `stage schema` 驅動問卷 UI。
- 以治理規則與 validation engine 自動計算 `readiness / risk / confidence`。
- 以 review engine 產生 `approved-review-packet` 與 `S6 handoff`。
- 以 artifact engine 產出 `tech-stack.json`、`ai-context.md`、`readiness-report.md`、`project-architecture.md`、`implementation-checklist.md`。
- 以 publish engine 產出 `pr-body.md`、`ai-disclosure.md`、`publish-manifest.json`。

## 開發指令

```bash
npm install
npm run dev
npm run build
npm run lint
```

## 重要目錄

- `src/platform/types`
  定義 `ProjectContext`、validation / review / publish state 等核心型別。
- `src/platform/schemas`
  定義 `S1-S7` 欄位 schema、phase / stage metadata。
- `src/platform/engines`
  放問卷、validation、review、artifact、publish 等共用邏輯。
- `src/platform/rules`
  放治理規則，供 `S4` 與後續流程共用。
- `src/platform/store`
  `project-context` 的全域 store 與 state 派生流程。
- `src/features`
  各 stage 的 summary / recommendation / preview 組裝邏輯。
- `src/components`
  共用 UI 元件，目前主要是 schema-driven 的 `QuestionnaireForm`。

## 目前流程

1. `S1-S3`
   填寫 discovery / architecture / design 基礎資料。
2. `S4`
   自動計算治理分數、blockers、warnings、owner/due matrix。
3. `S5`
   進行 review decision、版本鎖定與 handoff 判定。
4. `S6`
   依 `project-context` 生成正式輸出 artifacts 與 `S7 handoff`。
5. `S7`
   整理 PR body、AI disclosure、publish manifest 與發布 readiness。

## 擴充方式

若要新增或調整某一 stage，通常依這個順序：

1. 修改 `src/platform/schemas/stageSchemas.ts`
2. 更新 `src/platform/types/projectContext.ts` 必要型別
3. 在對應 `engine` 中補派生邏輯
4. 在 `src/features/<stage>/` 中補 summary / recommendations / preview
5. 視需要更新 `src/App.tsx` 的側欄顯示

## 補充文件

完整架構與資料流請看 `ARCHITECTURE.md`。  
若後續要接 API、匯入/匯出、持久化或測試，建議以目前 `platform/engines + platform/store` 為核心繼續擴充。
