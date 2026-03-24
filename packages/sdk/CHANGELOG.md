# @totoday/quinn-sdk

## 0.3.0

### Minor Changes

- cf45305: Replace the old `mutationAccess` SDK config with `allowQuinnMutation`, rename the public mutation error to `QuinnMutationGuardError`, and switch the runtime environment flag to `QUINN_ALLOW_QUINN_MUTATION`.

## 0.2.1

### Patch Changes

- 70a3a7b: Expand the Quinn SDK domain surface for Quinn Agent work.

  - add role, competency, course, and group mutation helpers
  - refine knowledge search hits with explicit source references
  - clarify legacy program support for LMS-style course collections
  - remove the old quinn-admin skill copy from this repo

## 0.2.0

### Minor Changes

- 7fc166f: Add Knowledge API client on `Quinn` (`documents`, `folders`, `search`), related types, and re-exports for Knowledge service classes.

## 0.1.3

### Patch Changes

- 16a1fe9: Move organization path handling into the shared HTTP client to simplify service construction.

## 0.1.2

### Patch Changes

- 45948dc: Add `mutationAccess` to the Quinn SDK runtime config so agent runtimes can gate Quinn business mutations without changing the default SDK behavior.

  This adds:

  - `mutationAccess` support in `new Quinn({ ... })`, environment config, and config-file resolution
  - a shared mutation guard error type and guard
  - mutation checks for SDK write operations such as organization updates, member mutations, and endorsement mutations

  The default SDK behavior remains `full_access`, so existing scripts and CLI usage continue to work unless they explicitly opt into a more restrictive mutation mode.

## 0.1.1
