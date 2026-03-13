# @totoday/quinn-sdk

## 0.1.3

### Patch Changes

- 16a1fe9: Move organization path handling into the shared HTTP client to simplify service construction.

## 0.1.2

### Patch Changes

- 45948dc: Add `mutationAccess` to the Quinn SDK runtime config so agent runtimes can gate Quinn business mutations without changing the default SDK behavior.

  This adds:

  - `mutationAccess` support in `new Quinn({ ... })`, environment config, and config-file resolution
  - a shared mutation access error type and guard
  - mutation checks for SDK write operations such as organization updates, member mutations, and endorsement mutations

  The default SDK behavior remains `full_access`, so existing scripts and CLI usage continue to work unless they explicitly opt into a more restrictive mutation mode.

## 0.1.1
