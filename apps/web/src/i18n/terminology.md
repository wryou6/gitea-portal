# Gitea term provenance

Gitea is the terminology authority for concepts that exist in both products. Portal uses bundled translations and never fetches Gitea's locale catalog at runtime.

## Catalog baseline

- Gitea version: `1.27.3` (the local instance version checked during feature research).
- Catalogs: `options/locale/locale_zh-TW.json`, `options/locale/locale_en-US.json`, and `options/locale/locale_ja-JP.json` in the matching Gitea release tag.
- Portal locale mapping: `zh-TW` → `zh-TW`, `en` → `en-US`, `ja` → `ja-JP`.
- Shared Issue concept: catalog key `issues`; Traditional Chinese `問題`, English `Issues`, Japanese `課題`. Never translate or rewrite the Gitea label or stable ID.

## Shared Gitea vocabulary

These Portal labels use the matching Gitea locale catalog entries from release `v1.27.3`; check the mapped key in each locale file before changing any value.

| Portal resource key | Gitea catalog key | zh-TW | en | ja |
| --- | --- | --- | --- | --- |
| `issues.repository` | `repo.repo_name` | 儲存庫 | Repository | リポジトリ |
| `issues.assignee` | `repo.issues.filter_assignee` | 負責人 | Assignee | 担当者 |
| `issues.label` | `repo.issues.filter_label` | 標籤 | Label | ラベル |
| `issues.milestone` | `repo.issues.filter_milestone` | 里程碑 | Milestone | マイルストーン |
| `boards.open` | `repo.issues.open_title` | 開啟 | Open | オープン |
| `boards.closed` | `repo.issues.closed_title` | 已關閉 | Closed | クローズ |

## Maintenance

For each shared concept added to a resource, record its resource key, Gitea catalog key, all three catalog values, and the Gitea release tag here. Mark a concept Portal-only only after checking that Gitea has no matching concept. When the Gitea version changes, review these exact keys against the new release before changing Portal copy.

## Portal-only concepts

| Resource key | zh-TW | en | ja | Source |
| --- | --- | --- | --- | --- |
| `common.globalNavigation` | 全域導覽 | Global navigation | グローバルナビゲーション | Portal navigation structure |
| `common.crossRepositoryBoards` | 跨庫看板 | Cross-repository boards | リポジトリ横断ボード | Portal workspace concept |
