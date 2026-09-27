# Data Model: Portal 中英日語系

## Locale Preference

| Field | Rule |
|---|---|
| `locale` | One of `zh-TW`, `en`, `ja`. |
| `login` | Existing Portal/Gitea login used only to separate browser-local preferences. |
| `source` | Resolved from saved preference first, then browser locale, then `zh-TW`. Not persisted. |
| Persistence | Browser localStorage; no server or Gitea account mutation. |

The stored value is the selected locale only. Missing, invalid, or unreadable values fall through to browser resolution; inability to write storage does not prevent changing locale during the current page session.

## Locale Resource Key

| Field | Rule |
|---|---|
| `namespace` | Stable UI area such as `common`, `issues`, `boards`, `settings`, or `feedback`. |
| `key` | Stable semantic identifier; never derived from translated text. |
| `value` | Localized display text for each supported locale. Interpolated values are data, not part of the key. |

Every supported locale has the same resource key shape. Fixed values such as Issue Type, Priority, Workflow state/action names and API error summaries use semantic identifiers. Gitea source content is not represented as locale resources.

## Fixed Workflow Display

| Field | Rule |
|---|---|
| `stateKey` | Stable key `todo`, `in-progress`, `done`, or existing anomaly category; used to resolve the localized state name. |
| `lastActionKey` | Stable workflow action key already returned for the last action; used for localized transition reason. |
| `nextActionKey` | Stable display key returned with each Issue; used to resolve the next-step message, including derived defaults when there is no last action. |
| Gitea values | Existing state and English Label names remain unchanged; localized strings are display-only. |

## Terminology Entry

| Field | Rule |
|---|---|
| `concept` | Stable Portal concept key, e.g. issue, repository, assignee, or workflow state. |
| `localeValues` | The corresponding Gitea UI wording for shared concepts, or the approved Portal wording for Portal-only concepts. |
| `giteaLocaleKeys` | Gitea catalog key and locale code (`zh-TW`, `en-US`, `ja-JP`) when available; absent for Portal-only terms. |
| `giteaVersion` | Provenance version for values copied/reviewed against Gitea; current baseline is `1.27.3`. |

The Gitea catalog remains authoritative for matching vocabulary. A Gitea upgrade triggers a review of referenced key/value pairs; it does not silently change already shipped Portal wording.

## API Error

| Field | Rule |
|---|---|
| `code` | Stable machine-readable semantic error identifier used to look up a localized message. |
| `params` | Optional scalar interpolation values for the localized message. No secrets or Gitea credentials. |
| `error` | Existing plain-text field retained additively for API compatibility; Web does not use it as a localization key. |
| `detail` | Optional original Gitea diagnostic detail, shown unchanged and separate from localized summary. |

The locale preference and translated values never change Gitea Issue or Workflow data.
