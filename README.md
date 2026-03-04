# quinn-platform

Agent-friendly Quinn Harness monorepo.

## Packages

- `@totoday/quinn-sdk` - TypeScript SDK for Quinn Platform API
- `@totoday/quinn-cli` - CLI wrapper for common agent workflows

## Layout

- `packages/sdk`
- `packages/cli`
- `skills/quinn-admin`

## Development

```bash
pnpm install
pnpm -r build
```

## CI & Release

- `CI` workflow runs on PRs and pushes to `main` and validates build.
- `Release` workflow runs on pushes to `main`:
  - If there are pending changesets, it opens/updates a Release PR with version bumps.
  - After the Release PR is merged, it publishes changed packages to npm.

Required GitHub repository secret:

- `NPM_TOKEN` (npm automation token with publish access to `@totoday` scope)

Useful commands:

```bash
pnpm changeset          # create a changeset file for package changes
pnpm version-packages   # apply versions from changesets
pnpm release            # publish packages (used by CI)
```
