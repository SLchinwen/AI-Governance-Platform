# 問卷填寫流程與治理規範

## 問卷生命週期

```
建立專案 → 套用題庫 → 分派填答 → 規則驗證 → 審核通過 → 產出文件 → GitHub 發布
  (PM)      (系統)    (各角色)    (系統)    (Architect)  (系統)     (DevOps)
```

## 狀態流轉

```
draft → in_progress → submitted → under_review → approved → published
  │                      │              │            │
  │                      │              ▼            │
  │                      │          rejected ───────┘
  │                      │         (退回修正)
  │                      ▼
  │                  needs_revision ─── (重新提交) ──→ submitted
  ▼
cancelled
```

## 各階段填答規範

### 探索期（Discovery）
- 由 PM 主導
- 填寫：專案基本資訊（project_basic）
- 目的：確認專案範圍、類型與基礎條件
- 完成條件：所有必填題回答完畢

### 規劃期（Planning）
- 由 Architect 主導
- 填寫：系統架構（architecture）、AI 協作規範（ai_collaboration）
- 目的：確認架構方向與 AI 協作策略
- 完成條件：架構風格、部署平台、AI 工具與範圍確認

### 設計期（Design）
- 由各技術角色分別填寫
- 填寫：backend、frontend、database、api、security、deployment
- 目的：細化技術選型與規格
- 完成條件：所有必填題完成 + 驗證規則通過

### 開發期（Development）
- 參考已產出的 tech-stack.json 與 ai-context.md 進行開發
- 如有技術選型變更，需更新問卷並重新走審核流程

### 審查期（Review）
- 定期（每月/每季）檢視問卷答案是否仍然正確
- 專案結案時進行最終審查

## 驗證等級定義

### Error（錯誤）
- 必須修正才能進入下一步
- 會阻擋文件產出
- 例：機密資料專案無加密措施

### Warning（警告）
- 建議修正但不阻擋
- 會標記在 readiness report 中
- 例：無 CI/CD 但有補齊計畫

### Info（資訊）
- 參考用提示
- 不影響流程
- 例：建議加入 Storybook 進行元件文件化

## 審核規則

### 誰審核誰
- Backend 答案 → Architect 審核
- Frontend 答案 → Architect 審核
- 架構答案 → PM + Security Lead 共同審核
- AI 協作答案 → Architect + PM 共同審核
- 安全答案 → Architect + PM 審核
- 部署答案 → Architect 審核

### 審核標準
1. 答案是否完整
2. 答案與其他分類是否一致
3. 信心度為 unknown 的項目是否有備註
4. 是否有已知風險未標記

## 版本控管

- 每次提交變更自動建立新版本
- 版本號格式：v{major}.{minor}（如 v1.0, v1.1, v2.0）
- Major 版本：架構或技術棧重大變更
- Minor 版本：細節調整或補充
- 正式版凍結後如需修改，須建立新版本並重新審核
