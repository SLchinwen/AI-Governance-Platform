# AI Development Governance Platform 文件站

> 對外發布用入口頁。  
> 這個文件站提供平台介紹、流程操作手冊與治理索引，適合 PM、Architect、Tech Lead、DevOps 與 AI 協作使用者閱讀。

---

## 快速開始

- 想快速了解平台如何操作：看 [AI Development Governance Platform 操作手冊](governance/platform-operation-manual.md)
- 想先掌握整體治理文件地圖：看 [治理文件總索引](governance/index.md)
- 想理解 7 階段流程與 Gate：看 [問卷階段流程與品質門檻](questionnaires/stage-flow.md)
- 想在本地預覽或建置文件站：看 [MkDocs 本地預覽與建置說明](mkdocs-local-setup.md)

---

## 這個平台在做什麼

AI Development Governance Platform 用來把一個專案從需求確認，一路轉成：

- 可追蹤的架構決策
- 可治理的工程規格
- 可審核的 validation / review 結果
- 可直接給工程與 AI 工具使用的正式 artifacts
- 可發布的 PR / AI disclosure / publish manifest

核心原則：

- 保留 `S1-S7` 階段式流程
- 以 `project-context.json` 作為 single source of truth
- 所有推薦、驗證、輸出與發布都回寫到同一份 context

---

## 建議閱讀順序

1. [操作手冊](governance/platform-operation-manual.md)
2. [治理文件總索引](governance/index.md)
3. [問卷階段流程與品質門檻](questionnaires/stage-flow.md)
