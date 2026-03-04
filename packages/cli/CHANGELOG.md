# @totoday/quinn-cli

## 0.1.1

### Patch Changes

- 2d4beb4: Improve `quinn login` password handling:
  - default to interactive hidden password prompt
  - add `--password-stdin` for script-friendly secure input
  - deprecate plain-text `--password` with warning
