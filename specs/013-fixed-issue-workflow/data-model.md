# Data Model: 固定 Issue 工作流

## FixedWorkflowState

由 Domain 固定定義，不按 Repository 或 Board 設定。

| 欄位          | 型別                          | 約束                                                                  |
| ------------- | ----------------------------- | --------------------------------------------------------------------- |
| `key`         | `todo \| in-progress \| done` | 必須是三個固定 key 之一                                               |
| `labelName`   | `string \| null`              | Todo=`workflow:todo`、In Progress=`workflow:in-progress`、Done=`null` |
| `displayName` | Traditional Chinese string    | 使用者可見名稱固定為「待辦」、「處理中」、「已完成」                  |
| `order`       | integer                       | Todo=0、In Progress=1、Done=2                                         |
| `giteaState`  | `open \| closed`              | Todo/In Progress=`open`；Done=`closed`                                |

## WorkflowAction

每項 action 對應 spec 中一列轉換原因；24 列完整列表以 [spec.md](./spec.md#transition-reasons-and-next-actions) 為唯一來源。

| 欄位             | 型別                       | 約束                                                                             |
| ---------------- | -------------------------- | -------------------------------------------------------------------------------- |
| `key`            | stable kebab-case string   | 全域唯一；Label name 為 `workflow-action:<key>`                                  |
| `fromState`      | `FixedWorkflowState.key`   | 轉換來源                                                                         |
| `toState`        | `FixedWorkflowState.key`   | 轉換目標                                                                         |
| `reasonLabel`    | Traditional Chinese string | Portal 使用者選擇的原因                                                          |
| `nextAction`     | Traditional Chinese string | 由 action 固定映射，不作額外狀態欄位                                             |
| `assigneePolicy` | enum                       | `required-handoff`、`optional-reviewer`、`keep-current`、`require-if-unassigned` |

驗證規則：每個 source/target/action key tuple 唯一；只允許表中定義的 action；成功轉換後最多一個 `workflow-action:*` Label；新原因取代舊原因。

## GiteaIssueWorkflowView

以既有 Gitea Issue + Labels 推導，不保存於 Portal persistence。

| 欄位                   | 來源／約束                                                                                               |
| ---------------------- | -------------------------------------------------------------------------------------------------------- |
| `repository`、`number` | 既有 Gitea Issue identity，跨庫以兩者共同識別                                                            |
| `state`                | Gitea Open/Closed                                                                                        |
| `workflowState`        | fixed state resolver 根據 Gitea State 與唯一 status Label 計算；不一致、缺少、多個狀態 Labels 為 anomaly |
| `labels`               | Gitea 完整 Labels；Issue list/detail 保持完整                                                            |
| `lastActionKey`        | 最後一個 `workflow-action:*` Label，缺少時為 null                                                        |
| `nextAction`           | 從 fixed state + last action 推導；初始 Todo 無 Assignee 顯示「指派負責人」，有名單顯示「開始處理」      |
| `assignees`            | Gitea 有序使用者 login 清單；Portal 改變次序時清空後完整寫入，並讀回驗證                                 |
| `currentOwner`         | Open Issue 的 `assignees[0]`；無 Assignee 時為 null；Closed Issue 永遠為 null                            |
| `expectedUpdatedAt`    | transition request optimistic precondition；須符合轉換前 Gitea Issue snapshot                            |

約束：不把 Developer/Reviewer 分類存成欄位；「送交審查」可選審查者，但不要求。Done 保留全部 Assignees 作經手 roster，不顯示 current owner。

## Board

Board JSON Store 只保存 Board 本身設定，不保存 Issue/workflow state。

| 欄位                     | 型別              | 約束                |
| ------------------------ | ----------------- | ------------------- |
| `id`                     | string            | 唯一                |
| `name`                   | string            | 非空                |
| `repositoryRefs`         | `RepositoryRef[]` | 一或多個 repository |
| `createdAt`, `updatedAt` | timestamp         | 既有語意保留        |

移除 `workflowConventionId` 與 `workflowConventionVersion`。Schema/data format version 升級；舊 Board 名稱與 Repository refs 保留，透過既有 locked atomic write/flush 寫入新格式。

## RepositoryWorkspace

Repository identity 和 Gitea metadata 維持；移除 `conventionId`、`conventionVersion` 及因未設定 convention 而顯示的 workflow unavailable state。Kanban 預設固定三欄。

## Fixture normalization

實作階段的 dummy Issue reclassification 不建立永久 entity 或 mapping log。每筆 Issue 依固定狀態分布指定 Todo/In Progress/Done，並同步寫入相應 status Label 或 Gitea closed state；保留非 workflow Labels、Assignees、Milestone、Comments 及 Issue body。

## Issue creation

Portal 建立的每筆新 Issue 初始為 Gitea Open，並具有 `workflow:todo`。不寫入 `workflow-action:*`；初始下一步依 Assignee roster 是否為空顯示「指派負責人」或「開始處理」。
