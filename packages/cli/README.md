# @totoday/quinn-cli

Minimal CLI for Quinn auth/config/connectivity setup.

Business data operations should use `@totoday/quinn-sdk`.

## Install

```bash
npm i -g @totoday/quinn-cli
quinn --help
```

One-off without global install:

```bash
npx @totoday/quinn-cli --help
```

## Commands

```bash
# login (recommended: hidden password prompt)
quinn login --email <email>

# login via stdin (scripts/password managers)
echo "<password>" | quinn login --email <email> --password-stdin

# inspect local config
quinn config path
quinn config get

# update local config
quinn config set --org-id <orgId>
quinn config set --api-url <apiUrl> --api-token <token> --org-id <orgId>

# connectivity test (calls organizations.current via SDK)
quinn test
```

## Config

CLI reads config from:

- `~/.config/quinn/config.json` (default)
- `QUINN_CONFIG_PATH` (override)

Runtime override order:

1. command flags
2. env vars (`QUINN_API_URL`, `QUINN_API_TOKEN`, `QUINN_ORG_ID`)
3. config file

If `apiUrl` is missing, default is `https://api.lunapark.com`.
