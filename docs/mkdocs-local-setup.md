# MkDocs 本地預覽與建置說明

> 用途：提供文件維護者在本機預覽、建置與檢查文件站的最小流程。

---

## 一、先安裝文件站依賴

本專案已提供：

- `requirements-docs.txt`

在專案根目錄執行：

```bash
python -m pip install -r requirements-docs.txt
```

如果你習慣使用 Windows `py` launcher，也可以：

```bash
py -m pip install -r requirements-docs.txt
```

---

## 二、本地預覽文件站

安裝完成後，在專案根目錄執行：

```bash
python -m mkdocs serve
```

或：

```bash
py -m mkdocs serve
```

預設會開在：

- `http://127.0.0.1:8000`

適合用來確認：

- 導覽是否正確
- 連結是否正常
- 表格與段落格式是否可讀
- 新增文件是否有被納入站台

---

## 三、正式建置站台

如果只想確認可否成功產生靜態站台，執行：

```bash
python -m mkdocs build
```

或：

```bash
py -m mkdocs build
```

建置完成後，靜態檔案會輸出到：

- `site/`

---

## 四、目前站台入口

主要配置檔：

- `mkdocs.yml`

主要對外文件入口：

- `docs/index.md`
- `docs/governance/platform-operation-manual.md`

---

## 五、文件維護建議

- 新增對外文件時，優先放在 `docs/` 下面既有分類目錄
- 新文件建立後，要同步更新 `mkdocs.yml` 的 `nav`
- 若是治理或操作類文件，建議同步補進 `docs/governance/index.md`
- 若要上 GitHub Pages，建議先在本地至少跑一次 `mkdocs build`

---

## 六、最小日常工作流

1. 修改 `docs/` 下的文件
2. 執行 `python -m mkdocs serve`
3. 檢查畫面與連結
4. 執行 `python -m mkdocs build`
5. commit / push

這樣就可以在不影響主程式的情況下，獨立維護對外文件站。
