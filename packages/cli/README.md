# @totoday/quinn-cli

CLI for Quinn organization/member/role/competency queries.

## Install

```bash
npm i -g @totoday/quinn-cli
quinn --help
```

One-off without global install:

```bash
npx @totoday/quinn-cli --help
```

## Quick Start

Login (recommended: hidden password prompt):

```bash
quinn login --email <email>
```

Login via stdin (scripts/password managers):

```bash
echo "<password>" | quinn login --email <email> --password-stdin
```

Check organization:

```bash
quinn organizations current
```

## Common Commands

```bash
# members
quinn members find alice
quinn members list --privilege owner,admin
quinn members get <memberId1,memberId2,user@example.com>

# roles / levels / competencies
quinn roles list
quinn levels list --role-id <roleId>
quinn competencies list --role-id <roleId> --level-id <levelId>

# endorsements
quinn endorsements find --uid <uid> --competency-id <competencyId>
quinn endorsements list --uids <u1,u2> --competency-ids <c1,c2>
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
