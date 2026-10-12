# Tasks: 跨 View Badge 編輯

## Phase 1：共用互動

- [X] T001 新增優先級與類型共用選單，支援立即儲存、錯誤提示與重試。
- [X] T002 新增繁中、英文、日文文案。
- [X] T003 新增選單、鍵盤焦點與窄畫面樣式。

## Phase 2：Issue List、Kanban、Gantt metadata 編輯

- [X] T004 Issue List 類型與優先級 badge 接入 metadata PATCH，附帶 `expectedUpdatedAt`。
- [X] T005 Kanban Card 類型與優先級 badge 接入 metadata PATCH，避免 badge 操作觸發拖曳。
- [X] T006 Gantt row 類型與優先級 badge 接入 metadata PATCH，保留排程操作。
- [X] T007 新增 Issue List row badge 編輯 Storybook 案例。
- [X] T008 新增 Kanban Card badge 編輯 Storybook 案例。
- [X] T009 新增 Gantt row badge 編輯 Storybook 案例。

## Phase 3：狀態轉換

- [X] T010 Status badge 支援可存取的點擊按鈕；異常狀態保持停用。
- [X] T011 Issue List 狀態 badge 開啟既有原因與負責人流程，提交時呼叫 `transitionIssue`。
- [X] T012 Gantt 狀態 badge 開啟同一既有流程；Kanban 仍以拖曳轉欄。
- [X] T013、T014、T015 Storybook 涵蓋 List、Gantt badge 操作與 Kanban Card／拖曳呈現。

## Phase 4：建置與驗收

- [X] T016 通過 workspace typecheck、build 與 Web Storybook production build。
- [ ] T017 於具備可寫入權限的 Gitea 驗收環境，依 `quickstart.md` 完成跨 View 實際儲存與狀態轉換驗收；本機只完成程式與 Storybook 建置，未對 Gitea Issue 寫入。
