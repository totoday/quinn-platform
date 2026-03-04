# quinn-platform

Quinn CLI + SDK monorepo for agent-friendly organization/role/competency queries.

## Packages

- `@totoday/quinn-cli`  
  CLI for login, organization lookup, members, roles, levels, competencies, and endorsements.
  - Package README: [`packages/cli/README.md`](./packages/cli/README.md)
- `@totoday/quinn-sdk`  
  TypeScript SDK for the same Quinn platform endpoints.
  - Package README: [`packages/sdk/README.md`](./packages/sdk/README.md)

## Repo Layout

- `packages/sdk`
- `packages/cli`
- `skills/quinn-admin`

## Local Development

```bash
pnpm install
pnpm -r build
```

Run CLI locally:

```bash
pnpm quinn --help
```

## CI & Release

1. Add a changeset for package changes:

```bash
pnpm changeset
```

2. Merge to `main`.
3. `Release` workflow opens/updates a release PR with version bumps.
4. Merge the release PR to publish to npm.

Workflows:

- `CI`: build validation on PR/push.
- `Release`: changesets-based versioning and publish.

Required GitHub repository secret:

- `NPM_TOKEN` (npm automation token with publish access to `@totoday` scope)
