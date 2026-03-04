# Quinn Admin Setup

This guide explains how to use Quinn CLI and SDK.

## CLI

Recommended (global install):

```bash
npm i -g @totoday/quinn-cli
npx quinn --help
```

No install (one-off):

```bash
npx @totoday/quinn-cli --help
```

## SDK

Install in your project:

```bash
npm i @totoday/quinn-sdk
```

Minimal usage:

```ts
import { Quinn } from "@totoday/quinn-sdk";

const quinn = new Quinn();
const org = await quinn.organizations.current();
console.log(org);
```

## Config assumptions

`new Quinn()` resolves config in this order:

1. constructor params
2. environment variables (`QUINN_API_URL`, `QUINN_API_TOKEN`, `QUINN_ORG_ID`)
3. config file (`~/.config/quinn/config.json` or `QUINN_CONFIG_PATH`)

Example config file:

```json
{
  "apiUrl": "http://localhost:8090",
  "token": "<token>",
  "orgId": "<orgId>"
}
```
