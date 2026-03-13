# 題庫設計原則 v1.0

> 定義如何設計、評估與維護問卷題目，確保題庫品質與一致性。

---

## 一、設計哲學

### 核心理念

> 每一題都要能回答：**「這個答案讓 AI 知道什麼？不知道會怎樣？」**

題庫不是為了收集資料而收集，而是為了：
1. 讓 AI 有足夠的上下文產出正確程式碼
2. 讓團隊有一致的技術語言
3. 讓決策可追溯、可審核
4. 讓品質風險可被量化

### 設計三問

設計每一題時，必須回答：

| 問題 | 說明 | 範例 |
|------|------|------|
| **Why** — 為什麼要問？ | 這個答案解決什麼問題 | 不知道 .NET 版本，AI 會產出不相容程式碼 |
| **Who** — 誰該回答？ | 哪個角色最有權回答 | .NET 版本由 Backend Lead 決定 |
| **What** — 答案影響什麼？ | 這個答案影響哪些輸出 | 影響 tech-stack.json 的 backend.version |

---

## 二、題目結構規範

### 必備欄位

| 欄位 | 類型 | 必填 | 說明 |
|------|------|------|------|
| `question_id` | string | ✅ | 唯一 ID，格式：`category.subcategory.field` |
| `category` | enum | ✅ | 所屬分類 |
| `stage` | enum | ✅ | 填寫階段（discovery/planning/design） |
| `title` | string | ✅ | 題目標題（簡潔明確） |
| `description` | string | ✅ | 填寫指引（含何時選什麼） |
| `question_type` | enum | ✅ | 題目類型 |
| `required` | boolean | ✅ | 是否必填 |
| `owner_role` | array | ✅ | 負責角色（可多個） |
| `quality_impact` | enum | ✅ | 品質影響等級 |

### 建議欄位

| 欄位 | 類型 | 說明 |
|------|------|------|
| `options` | array | 選項清單（含 value/label/description/triggers） |
| `depends_on` | object | 前置條件（顯示條件） |
| `validation_rules` | array | 驗證規則 |
| `output_mapping` | array | 輸出對應路徑 |
| `ai_risk_note` | string | AI 風險說明（未填的後果） |
| `version` | string | 題目版本號 |

---

## 三、題目品質檢查清單

設計或修改題目時，逐項檢查：

### 內容品質

- [ ] 標題是否清楚（10 字以內可理解）
- [ ] 描述是否提供足夠指引
- [ ] 選項是否涵蓋常見情況
- [ ] 選項是否有 "其他" 或 "不適用" 選項
- [ ] 選項標籤是否清楚區分
- [ ] 是否避免技術術語歧義

### 結構品質

- [ ] question_id 是否遵循命名規範
- [ ] 是否正確設定 required
- [ ] owner_role 是否合理（不要一題指派太多角色）
- [ ] quality_impact 是否合理評估
- [ ] output_mapping 是否指向正確的產出路徑

### AI 品質

- [ ] ai_risk_note 是否清楚說明未填的風險
- [ ] 答案格式是否 AI 可解析
- [ ] 選項值是否用英文小寫加底線（如 `ef_core`）
- [ ] 選項是否提供足夠的上下文讓 AI 做出正確判斷

---

## 四、題目分類規則

### 分類原則

| 原則 | 說明 |
|------|------|
| 職責歸屬 | 同一分類的題目應由同一個主要角色回答 |
| 知識域一致 | 同一分類的題目應屬於相同的技術知識領域 |
| 粒度一致 | 同一分類的題目應有相近的抽象粒度 |
| 階段一致 | 同一分類的題目應在相同階段填寫 |

### 目前分類

| 分類 | 階段 | 主要角色 | 題目粒度 |
|------|------|---------|---------|
| project_basic | 探索期 | PM | 專案層級 |
| architecture | 規劃期 | Architect | 系統層級 |
| backend | 設計期 | Backend Lead | 元件層級 |
| frontend | 設計期 | Frontend Lead | 元件層級 |
| database | 設計期 | Backend Lead | 元件層級 |
| api | 設計期 | Backend Lead | 介面層級 |
| security | 設計期 | Security Lead | 橫切面 |
| deployment | 設計期 | DevOps | 基礎設施層級 |
| ai_collaboration | 規劃期 | Architect | 治理層級 |

### 未來可擴充分類

| 候選分類 | 說明 | 階段 |
|---------|------|------|
| testing | 測試策略與工具 | 設計期 |
| performance | 效能需求與最佳化 | 設計期 |
| accessibility | 無障礙設計 | 設計期 |
| i18n | 國際化與在地化 | 設計期 |
| mobile | 行動裝置支援 | 設計期 |
| data_pipeline | 資料處理管線 | 設計期 |

---

## 五、quality_impact 評估標準

| 等級 | 定義 | 範例 |
|------|------|------|
| **critical** | 未填會直接導致 AI 產出錯誤且難以發現 | 後端平台選型、認證方式、資料敏感度 |
| **high** | 未填會導致 AI 產出品質下降或風格不一致 | ORM 選擇、設計模式、API 回應格式 |
| **medium** | 未填會導致 AI 產出不完整但不致嚴重錯誤 | 日誌框架、建構工具、快取策略 |
| **low** | 未填對 AI 產出影響有限 | 利害關係人、專案時程 |

---

## 六、題庫版本管理

### 版本規則

| 變更類型 | 版本影響 | 說明 |
|---------|---------|------|
| 新增題目 | Minor（+0.1） | 不影響既有答案 |
| 修改選項 | Minor（+0.1） | 需通知已填答專案 |
| 刪除題目 | Major（+1.0） | 需遷移既有答案 |
| 修改 question_id | Major（+1.0） | 需全面更新 mapping |
| 修改 output_mapping | Minor（+0.1） | 需重新產出文件 |

### 向後相容性

- 新增題目不得影響既有專案的答案完整性
- 修改選項值時，需提供遷移映射
- 刪除題目時，需將既有答案標記為 `deprecated`
