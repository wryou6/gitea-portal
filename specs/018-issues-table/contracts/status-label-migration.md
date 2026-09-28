# Status Label Migration Contract

## Scope and execution

The migration is initiated, resumed, and verified from the Portal management entry by the Gitea `admin` account only. It enumerates all target repositories and Issues visible to that account and uses the current session's Gitea authorization. The account must have write permission for the entire target scope; any missing access or failed enumeration blocks global completion. Credentials are never stored or embedded in Portal.

## Per-Issue behavior

1. Read the current Issue and its complete Labels.
2. Map only exact known state Labels to `status:todo` / `status:in-progress`, and known action reason Labels to `status-action:<key>`.
3. Preserve all unrelated Labels. If a target Label definition is missing, resolve/create it only through current user's Gitea permissions.
4. Re-read and compare Issue `updatedAt` and Label set, replace the complete Label ID set in one Gitea operation, then read back and verify.
5. Report each Issue as unchanged, migrated, failed, or conflict. Failure/conflict remains retryable where safe; never claim partial completion as complete.

Unknown or malformed legacy keys, read errors, lost permission, or optimistic conflict block completion. If the Issue already has one or more target-prefix labels, target-prefix labels are authoritative: retain them and remove legacy-prefix labels even when the mapped values differ. Report both the removed old value and retained new value as a resolved conflict. If no target-prefix label exists, map recognized legacy labels to target names. No old compatibility read is removed until the full-scope verification reads every target Repository and Issue successfully, finds no old prefixes, and validates new Status semantics.

Migration is idempotent against current Gitea Labels and has no Portal checkpoint or cross-Issue transaction. The operator can resume by repeating enumeration and verification.
