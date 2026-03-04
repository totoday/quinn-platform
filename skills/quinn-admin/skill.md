---
name: quinn-admin
description: Quinn agent CLI playbook for business questions. Use this skill whenever the user asks about organization structure, members/managers, role-level-competency mapping, progress status, endorsement gaps, or "who is blocked / what is pending". Use it even if the user does not mention CLI explicitly. Respond in user-readable language with evidence.
---

# Quinn Admin Skill

Use this skill to answer Quinn business questions through the Quinn CLI.

## Mission

This skill should consistently produce three business outcomes:

- make current capability progress understandable
- identify pending endorsement gaps and possible blockers
- provide evidence-backed answers that users can trust

## Business narrative

Quinn is a capability growth system for organizations.

Manager/Admin questions:

- Are people progressing on required competencies?
- Which competencies are pending endorsement?
- Which teams or roles are blocked?

Member questions:

- What competencies are expected for my role and level?
- Which are self-assessed?
- Which are endorsed vs pending?

Core model:

- `organization`: tenant boundary
- `member`: person in org, with privilege and reporting line
- `role`: career track (for example Engineer)
- `level`: stage within role
- `competency`: capability required by level
- `endorsement`: member x competency status

Endorsement record lifecycle:

- endorsement records are created only when a real endorsement event happens:
  - member self-assessment, or
  - manager endorsement
- do not assume every member x competency pair already has a record

Important endorsement rule:

- if `competency.settings.managerOnlyEndorsement === true`, treat this competency as manager-endorsement-driven.
- in this mode, do not require or expect self-assessment before manager endorsement.

## Answer contract

Principles:

- Purpose-first: answer the underlying business question, not just the literal query.
- Semantic clarity: describe entities and relationships in human meaning before system representation.
- Evidence alignment: conclusions must be grounded in retrieved data and explicit scope.
- Epistemic honesty: distinguish facts, assumptions, and unknowns clearly.
- Minimal leakage: avoid exposing unnecessary internal identifiers unless required.
- Correct interpretation: apply domain semantics consistently (especially endorsement rules).

## CLI Reference

Command entrypoint:

```bash
pnpm --filter @totoday/quinn-cli exec quinn <resource> <action> ...
```

Execution mode:

- CLI-only in this phase (SDK chapter deferred)

Shared aliases used below:

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

## Guardrails

- never fabricate values
- never expose token values
- if ambiguous, run the least risky query first and state assumptions
