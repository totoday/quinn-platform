---
name: quinn-admin
description: Quinn business analysis playbook using Quinn CLI/SDK. Use this skill whenever the user asks about organization structure, manager/member coverage, role-level-competency expectations, endorsement progress, pending gaps, blockers, or who needs action next. Use it even when the user does not explicitly mention CLI or SDK.
---

# Quinn Admin Skill

Version: 0.4.0  
Updated: 2026-03-04  
Compatibility: `@totoday/quinn-cli >= 0.1.1`, `@totoday/quinn-sdk >= 0.1.1`

Use this skill to answer Quinn business questions in user-readable language with verifiable evidence.

## Mission

Produce three outcomes:

- make current capability progress understandable
- identify endorsement gaps and likely blockers
- provide evidence-backed answers users can trust

## When To Use

Use this skill if the user asks about:

- org structure and high-level status
- members/managers and reporting coverage
- role/level/competency requirements
- endorsement progress or pending items
- who is blocked, who needs action next

## When Not To Use

Do not use this skill for:

- direct data mutations or admin write operations
- non-Quinn domains with unrelated data models

## Default Workflow (Required)

1. Clarify the business question and scope (which org, which role/level/member set).
2. Fetch the minimum data needed through CLI (or SDK if query logic is multi-step).
3. Interpret with Quinn domain semantics (especially endorsement rules).
4. Respond in business language first, then attach concise evidence.
5. Explicitly separate facts vs assumptions vs unknowns.

## Optional Workflow (Use When Needed)

- use SDK for multi-step joins or repeated lookups that are too cumbersome via CLI alone
- run small follow-up queries to resolve ambiguity before concluding

## Quinn Domain Semantics

Quinn is a capability growth system for organizations.

Core model:

- `organization`: tenant boundary
- `member`: person in org, with privilege and reporting line
- `role`: career track (for example Engineer)
- `level`: stage within role
- `competency`: capability required by level
- `endorsement`: member x competency status

Endorsement lifecycle:

- endorsement records are created only when a real event happens:
  - member self-assessment, or
  - manager endorsement
- do not assume every member x competency pair already has a record

Important rule:

- if `competency.settings.managerOnlyEndorsement === true`, this competency is manager-endorsement-driven
- in this mode, do not require or expect self-assessment before manager endorsement

Interpretation note:

- a missing endorsement record usually means no self-assessment/manager-endorsement event yet
- do not treat missing records as automatic system/data errors

## Answer Principles (Required)

- Purpose-first: answer the business question, not only the literal query.
- Semantic clarity: explain meaning before IDs.
- Evidence alignment: every conclusion must tie to retrieved data and scope.
- Epistemic honesty: clearly mark assumptions and unknowns.
- Minimal leakage: avoid exposing internal IDs unless needed.
- Correct domain interpretation: apply endorsement semantics consistently.

## Output Shape (Default)

Use this response shape unless user asks otherwise:

1. `Conclusion` (plain language)
2. `Why` (2-5 bullets with business interpretation)
3. `Evidence` (specific queried facts)
4. `Unknowns / Next checks` (only if needed)

## CLI Manual

Setup and installation are in `SETUP.md`.

Command entrypoint:

```bash
npx quinn <resource> <action> ...
# or one-off
npx @totoday/quinn-cli <resource> <action> ...
```

Shared aliases:

```ts
type Privilege = "owner" | "admin" | "member";
type IsoDateTime = string;
type Paged<T> = { items: T[]; nextToken: string };
```

### Organizations (`quinn organizations`)

```ts
type Organization = {
  id: string;
  name: string;
};

type OrganizationDetails = {
  organization: Organization | null;
  stats: {
    members: number;
    managers: number;
    roles: number;
    levels: number;
    competencies: number;
  };
};

// quinn organizations current
async function organizationsCurrent(): Promise<Organization | null>;

// quinn organizations details
async function organizationsDetails(): Promise<OrganizationDetails>;
```

### Members (`quinn members`)

```ts
type Member = {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  privilege: Privilege;
  managerUid: string | null;
  roleIds: string[];
  createdAt: IsoDateTime;
  activatedAt: IsoDateTime | null;
  phoneNumber: string | null;
};

// quinn members list [--privilege ...] [--manager-uid ...] [--limit ...] [--page-token ...]
async function membersList(params?: {
  privilege?: Privilege | Privilege[];
  managerUid?: string;
  limit?: number;
  pageToken?: string;
}): Promise<Paged<Member>>;

// quinn members find <query> [--limit ...] [--page-token ...]
async function membersFind(
  query: string,
  params?: { limit?: number; pageToken?: string },
): Promise<Paged<Member>>;

// quinn members list-managers [--search ...] [--limit ...] [--page-token ...]
async function membersListManagers(params?: {
  search?: string;
  limit?: number;
  pageToken?: string;
}): Promise<Paged<Member>>;

// quinn members get <idOrEmailOrCsv>
async function membersGet(
  idOrEmailOrCsv: string,
): Promise<Member | null | Member[]>;
```

### Roles (`quinn roles`)

```ts
type Role = {
  id: string;
  label: string;
  levelIds: string[];
  createdAt: IsoDateTime;
  updatedAt: IsoDateTime;
};

// quinn roles list
async function rolesList(): Promise<Role[]>;

// quinn roles get <roleIdOrCsv>
async function rolesGet(roleIdOrCsv: string): Promise<Role | null | Role[]>;
```

### Levels (`quinn levels`)

```ts
type Level = {
  id: string;
  roleId: string;
  name: string;
  color: string;
  value: number;
  completeThreshold: number;
  revenueCapacity: number | null;
  compensation: string | null;
  competencyIds: string[];
  createdAt: IsoDateTime;
  updatedAt: IsoDateTime;
};

// quinn levels list --role-id <roleId> [--limit ...] [--page-token ...]
async function levelsList(params: {
  roleId: string;
  limit?: number;
  pageToken?: string;
}): Promise<Paged<Level>>;

// quinn levels get <levelIdOrCsv>
async function levelsGet(levelIdOrCsv: string): Promise<Level | null | Level[]>;
```

### Competencies (`quinn competencies`)

```ts
type Competency = {
  id: string;
  name: string;
  creatorUid: string;
  createdAt: IsoDateTime;
  settings?: {
    // true => manager endorsement flow; self-assessment is not required
    managerOnlyEndorsement: boolean;
  };
};

type Course = {
  id: string;
  name: string;
  creatorUid: string;
  createdAt: IsoDateTime;
};

// quinn competencies list --role-id <roleId> --level-id <levelId> [--search ...] [--limit ...] [--page-token ...]
async function competenciesList(params: {
  roleId: string;
  levelId: string;
  search?: string;
  limit?: number;
  pageToken?: string;
}): Promise<Paged<Competency>>;

// quinn competencies get <competencyIdOrCsv>
async function competenciesGet(
  competencyIdOrCsv: string,
): Promise<Competency | null | Competency[]>;

// quinn competencies courses <competencyId>
async function competenciesCourses(competencyId: string): Promise<Course[]>;
```

### Endorsements (`quinn endorsements`)

```ts
type Endorsement = {
  id: string;
  uid: string;
  competencyId: string;
  roleId: string | null;
  selfAssessment: "yes" | "no" | null;
  selfAssessedAt: IsoDateTime | null;
  endorsedAt: IsoDateTime | null;
  endorsedByUid: string | null;
  endorsementSource: string | null;
  resetAt: IsoDateTime | null;
  resetByUid: string | null;
  resetReason: string | null;
  createdAt: IsoDateTime;
  updatedAt: IsoDateTime;
};

// quinn endorsements get <endorsementId>
async function endorsementsGet(
  endorsementId: string,
): Promise<Endorsement | null>;

// quinn endorsements find --uid <uid> --competency-id <id>
async function endorsementsFind(
  uid: string,
  competencyId: string,
): Promise<Endorsement | null>;

// quinn endorsements list --uids <u1,u2> --competency-ids <c1,c2>
async function endorsementsList(
  uidsCsv: string,
  competencyIdsCsv: string,
): Promise<Endorsement[]>;
```

Interpretation note:

- a missing endorsement record usually means no self-assessment/manager-endorsement event yet
- do not treat missing records as automatic system/data errors

## SDK Manual (Optional)

Use SDK when query logic requires multiple dependent calls or data composition.

Initialization:

```ts
import { Quinn } from "@totoday/quinn-sdk";

const quinn = new Quinn();
```

Quick command-line check (`node -e`):

```bash
pnpm --filter @totoday/quinn-cli exec node -e "const { Quinn } = require('@totoday/quinn-sdk'); const q = new Quinn(); q.organizations.current().then(console.log)"
```

### organizations (`quinn.organizations`)

```ts
quinn.organizations.current(): Promise<Organization | null>;
quinn.organizations.getDetails(): Promise<OrganizationDetails>;
```

### members (`quinn.members`)

```ts
quinn.members.list(params?: {
  search?: string;
  privilege?: Privilege | Privilege[];
  managerUid?: string;
  limit?: number;
  token?: string;
}): Promise<Paged<Member>>;

quinn.members.listManagers(params?: {
  search?: string;
  limit?: number;
  token?: string;
}): Promise<Paged<Member>>;

quinn.members.get(id: string): Promise<Member | null>;
quinn.members.batchGet(input: string[] | { ids?: string[]; emails?: string[] }): Promise<Member[]>;
```

### roles (`quinn.roles`)

```ts
quinn.roles.list(): Promise<Role[]>;
quinn.roles.get(id: string): Promise<Role | null>;
quinn.roles.batchGet(ids: string[]): Promise<Role[]>;
```

### levels (`quinn.levels`)

```ts
quinn.levels.list(params: { roleId: string; limit?: number; token?: string }): Promise<Paged<Level>>;
quinn.levels.get(id: string): Promise<Level | null>;
quinn.levels.batchGet(ids: string[]): Promise<Level[]>;
```

### competencies (`quinn.competencies`)

```ts
quinn.competencies.list(params: {
  roleId: string;
  levelId: string;
  search?: string;
  limit?: number;
  token?: string;
}): Promise<Paged<Competency>>;

quinn.competencies.get(id: string): Promise<Competency | null>;
quinn.competencies.batchGet(ids: string[]): Promise<Competency[]>;
quinn.competencies.listCourses(id: string): Promise<Course[]>;
```

### endorsements (`quinn.endorsements`)

```ts
quinn.endorsements.get(id: string): Promise<Endorsement | null>;
quinn.endorsements.find(uid: string, competencyId: string): Promise<Endorsement | null>;
quinn.endorsements.list(input: { uids: string[]; competencyIds: string[] }): Promise<Endorsement[]>;
```

## Guardrails (Required)

- never fabricate values
- never expose token values
- if ambiguous, run the least risky query first and state assumptions
