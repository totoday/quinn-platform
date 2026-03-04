---
"@totoday/quinn-cli": patch
---

Unify organization query semantics around `organizations current`:
- remove `organizations details` command from CLI
- make `organizations current` return organization details with aggregate stats
- align SDK and skill documentation with the simplified flow
