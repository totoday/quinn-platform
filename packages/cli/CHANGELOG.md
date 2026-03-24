# @totoday/quinn-cli

## 0.3.0

### Patch Changes

- Updated dependencies [cf45305]
  - @totoday/quinn-sdk@0.3.0

## 0.2.1

### Patch Changes

- Updated dependencies [70a3a7b]
  - @totoday/quinn-sdk@0.2.1

## 0.2.0

### Minor Changes

- 7fc166f: Add Knowledge API client on `Quinn` (`documents`, `folders`, `search`), related types, and re-exports for Knowledge service classes.

### Patch Changes

- Updated dependencies [7fc166f]
  - @totoday/quinn-sdk@0.2.0

## 0.1.3

### Patch Changes

- 16a1fe9: Move organization path handling into the shared HTTP client to simplify service construction.
- Updated dependencies [16a1fe9]
  - @totoday/quinn-sdk@0.1.3

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
