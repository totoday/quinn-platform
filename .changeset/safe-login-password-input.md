---
"@totoday/quinn-cli": patch
---

Improve `quinn login` password handling:
- default to interactive hidden password prompt
- add `--password-stdin` for script-friendly secure input
- deprecate plain-text `--password` with warning
