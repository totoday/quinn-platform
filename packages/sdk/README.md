# @totoday/quinn-sdk

TypeScript SDK for Quinn Platform API.

## Install

```bash
npm i @totoday/quinn-sdk
```

## Quick Start

```ts
import { Quinn } from "@totoday/quinn-sdk";

const quinn = new Quinn();

const org = await quinn.organizations.current();
const roles = await quinn.roles.list();

console.log(org, roles.length);
```

## Common Usage

```ts
import { Quinn } from "@totoday/quinn-sdk";

const quinn = new Quinn();

// members
const managers = await quinn.members.listManagers({ limit: 50 });
const people = await quinn.members.batchGet({
  ids: ["user-id-1"],
  emails: ["user@example.com"],
});
const created = await quinn.members.create({
  email: "new.user@example.com",
  firstName: "New",
  lastName: "User",
  sendInvite: false,
});
if (created) {
  await quinn.members.updateRoles({ memberId: created.userId, roleIds: ["role-id"] });
  await quinn.members.updateManager({ memberId: created.userId, managerUid: "manager-uid" });
}

// role -> level -> competencies
const roles = await quinn.roles.list();
const levels = await quinn.levels.list({ roleId: roles[0].id, limit: 100 });
const competencies = await quinn.competencies.list({
  roleId: roles[0].id,
  levelId: levels.items[0].id,
  limit: 100,
});

// endorsements
const endorsement = await quinn.endorsements.find("<uid>", "<competencyId>");
```

## Auth and Config

`new Quinn()` resolves config in this order:

1. constructor params (`new Quinn({ apiUrl, token, orgId })`)
2. env vars (`QUINN_API_URL`, `QUINN_API_TOKEN`, `QUINN_ORG_ID`)
3. config file (`~/.config/quinn/config.json` or `QUINN_CONFIG_PATH`)

Default `apiUrl` is `https://api.lunapark.com`.

`token` and `orgId` are required.

For password login from scripts, use `QuinnAuth`:

```ts
import { QuinnAuth } from "@totoday/quinn-sdk";

const auth = new QuinnAuth();
const result = await auth.login({ email: "<email>", password: "<password>" });
console.log(result.token, result.orgId);
```
