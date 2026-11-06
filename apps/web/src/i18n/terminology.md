# Gitea 用語來源與對照

## 目的

Portal 與 Gitea 共用概念時，沿用 Gitea 慣用詞彙，不另造不同名稱。此文件記錄 Portal 翻譯 key 對應的 Gitea 詞彙 key 與繁中、英文、日文譯法，讓用語能維持一致並可追溯來源。

Gitea `1.27.3` 是這份對照表核查時使用的 locale catalog 版本，方便確認詞彙來源；它不是 Portal 執行時要求的 Gitea 版本。Portal 使用 repo 內的翻譯資源，執行時不會讀取 Gitea 的 locale catalog。

## 詞彙核對基準

- Gitea 版本：`1.27.3`。
- 對照檔案：該版本 tag 內的 `options/locale/locale_zh-TW.json`、`options/locale/locale_en-US.json`、`options/locale/locale_ja-JP.json`。
- Portal 語系對應：`zh-TW` → `zh-TW`、`en` → `en-US`、`ja` → `ja-JP`。
- 共用的 Issue 概念使用 Gitea 詞彙 key `issues`，zh-TW 為「問題」、en 為 `Issues`、ja 為「課題」。Gitea Label 名稱及穩定 ID 保留原值，不翻譯、不改寫。

## 共用詞彙對照

Portal 使用下列 Gitea 對照詞彙。修改譯文前，先依 Gitea 詞彙 key 核對三個 locale 檔案。

| Portal 翻譯 key       | Gitea 詞彙 key                  | zh-TW  | en         | ja             |
| ------------------- | ------------------------------ | ------ | ---------- | -------------- |
| `issues.repository` | `repo.repo_name`               | 儲存庫 | Repository | リポジトリ     |
| `issues.assignee`   | `repo.issues.filter_assignee`  | 負責人 | Assignee   | 担当者         |
| `issues.label`      | `repo.issues.filter_label`     | 標籤   | Label      | ラベル         |
| `issues.milestone`  | `repo.issues.filter_milestone` | 里程碑 | Milestone  | マイルストーン |
| `work-views.open`   | `repo.issues.open_title`       | 開啟   | Open       | オープン       |
| `work-views.closed` | `repo.issues.closed_title`     | 已關閉 | Closed     | クローズ       |

## 維護方式

新增與 Gitea 共用的概念時，記錄 Portal 翻譯 key、Gitea 詞彙 key、三種語言的譯文及 Gitea release tag。確認 Gitea 沒有對應詞彙後，才將概念列為 Portal 專有。Gitea 版本變更時，先用新版本核對這些詞彙 key，再更新 Portal 譯文及核對基準。

## Portal 專有詞彙

| Portal 翻譯 key           | zh-TW      | en                | ja                       | 來源                                       |
| ------------------------- | ---------- | ----------------- | ------------------------ | ------------------------------------------ |
| `common.globalNavigation` | 全域導覽   | Global navigation | グローバルナビゲーション | Portal 導覽結構                     |
| `common.allRepos`         | 所有儲存庫 | All repos         | すべてのリポジトリ       | 可存取 Repository 彙整工作區        |
