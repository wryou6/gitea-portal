# Research: 使用者外觀資料

## 資料正規化

**Decision**: 擴充既有 user normalizer，將 full_name、avatar_url 保留到 GiteaUser；Issue 以選填 userProfiles 傳遞，Comment 直接保留 user。
**Rationale**: 姓名目前在 mapIssue 降成 login 時遺失；既有回應已包含外觀，不需逐人查詢。
**Alternatives considered**: 改成物件身份欄位會破壞排序與 mutation；新增全使用者查詢會擴大權限與請求量，均不採用。

## 登入者刷新

**Decision**: OAuth 原有身份查詢保留外觀；session route 用 cookie 自己的 token 呼叫 currentUser。成功替換完整外觀；失敗僅 401 判定 auth.required，其餘回快取或 login。
**Rationale**: giteaFor 優先 Authorization header，不能用於 cookie 登入者刷新；既有 error handler 已對 401 清 session。
**Alternatives considered**: 重新登入才更新不符合已確認刷新時機；把非401故障視為登出不符合規格。

## 呈現與可及性

**Decision**: 共用 UserIdentity，固定頭貼大小，姓名旁可取得帳號；保留 native select 文字。共用 profile helper 支援舊資料及同名。
**Rationale**: 同一 login 在不同視圖需保持身份一致；現有 Gantt intrinsic width 量測使用 DOM clone，可納入頭貼。
**Alternatives considered**: 只用圖示或純 hover title 不能滿足鍵盤辨識；為圖片改造所有下拉選單不在範圍內。

## 來源與證據

- 程式：apps/api/src/gitea/client.ts、issues/issue-service.ts、auth/session.ts、http/routes.ts、http/error-handler.ts。
- 畫面：apps/web/src/features/work-views/GanttBoard.tsx、WorkViewLayout.tsx、WorkViewFilterBar.tsx。
- [Gitea 使用者 API](https://docs.gitea.com/api/operations/user-get-current/) 定義姓名及頭貼欄位。
- 本文件記錄 source tracing 與設計判斷，不表示已完成真實 Gitea 或畫面驗收。
