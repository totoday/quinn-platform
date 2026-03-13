# @totoday/quinn-cli

## 0.1.2

### Patch Changes

- 629fba0: Unify organization query semantics around `organizations current`:
  - remove `organizations details` command from CLI
  - make `organizations current` return organization details with aggregate stats
  - align SDK and skill documentation with the simplified flow
- Updated dependencies [45948dc]
  - @totoday/quinn-sdk@0.1.2

## 0.1.1

### Patch Changes

- 2d4beb4: Improve `quinn login` password handling:
  - default to interactive hidden password prompt
  - add `--password-stdin` for script-friendly secure input
  - deprecate plain-text `--password` with warning
  - @totoday/quinn-sdk@0.1.1
