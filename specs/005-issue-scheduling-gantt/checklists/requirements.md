# 規格品質檢查清單：Issue 排程日期與甘特圖

**目的**：在規劃前檢查 Issue 日期與 Board 甘特圖規格的完整度、可測試性及與 Portal 資料邊界的一致性。
**建立日期**：2026-09-26
**Feature**：[spec.md](../spec.md)

## 內容品質

- [x] CHK001 聚焦工程師設定日期、檢視排程與篩選工作所需的使用者結果。
- [x] CHK002 使用繁體中文描述需求，技術欄位名稱只在必要處保留英文。
- [x] CHK003 使用者情境涵蓋 Issue 日期設定、Board 甘特圖與篩選流程。

## 需求完整性

- [x] CHK004 Start date、due date、負責人與 Issue 狀態的語意清楚。
- [x] CHK005 Start date 與 due date 的建立、更新、清除及重新讀取結果均有驗收情境。
- [x] CHK006 使用者 Gitea 權限拒絕、併發變更與外部服務失敗都有明確結果。
- [x] CHK007 甘特圖的 Repository 範圍、預設負責人、狀態篩選與無筆數上限要求可測試。
- [x] CHK008 單日期、無日期、格式錯誤、重複日期及起訖顛倒等邊界情況已列出。
- [x] CHK009 缺少日期的 Issue 顯示方式已記錄並通過使用者確認。

## 資料與架構界線

- [x] CHK010 Issue、Label 與 due date 持續以 Gitea 為唯一來源，不新增 Issue mirror 或日期 persistence。
- [x] CHK011 Start date Label 更新不得移除 Workflow Labels 或其他一般 Labels。
- [x] CHK012 日期推算僅改變圖表呈現，不會在讀取流程修改 Gitea Issue。
- [x] CHK013 Board JSON persistence、Kanban 狀態與現有 Board 範圍沒有被新規格改寫。

## 驗收品質

- [x] CHK014 成功標準可透過 Gitea 重新讀取、篩選結果及圖表內容驗證。
- [x] CHK015 超過 100 筆結果、權限錯誤與部分載入失敗都有可判定的預期結果。
- [x] CHK016 鍵盤操作、窄視窗及圖表替代呈現已納入驗收條件。

## 備註

- CHK009 已確認：無日期 Issue 列於甘特圖下方的「未排程」區，不畫日期區間。
