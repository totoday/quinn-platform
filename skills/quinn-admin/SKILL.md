---
name: quinn-admin
description: Quinn business analysis playbook using Quinn CLI/SDK. Use this skill whenever the user asks about organization structure, manager/member coverage, role-level-competency expectations, endorsement progress, pending gaps, blockers, or who needs action next. Use it even when the user does not explicitly mention CLI or SDK.
---

# Quinn Admin Skill

Version: 0.5.0  
Updated: 2026-03-06  
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

## Tool Selection

- Use CLI for single-resource queries (list members, get role, etc.)
- Use SDK when you need multi-step joins, repeated lookups, or complex data composition

## Quinn Domain Semantics

Quinn is a capability growth system for organizations.

Core model:

- `organization`: tenant boundary
- `member`: person in org, with privilege and reporting line
- `role`: career track (for example Engineer)
- `level`: stage within role
- `competency`: capability required by level
- `endorsement`: member x competency status

Endorsement rules:

- endorsement records are created only when a real event happens (self-assessment or manager endorsement)
- missing endorsement record = no action taken yet (not a data error)
- two endorsement modes:
  - default: member self-assesses first, then manager endorses
  - `managerOnlyEndorsement: true`: member does not self-assess; manager endorses directly

## Interpretation Guidelines

- Explain business meaning, not just raw data (e.g., "Sarah manages 5 engineers" not "managerUid: user_123 has 5 reports")
- Apply endorsement semantics correctly (see rules above)
- Back conclusions with retrieved data
- Clearly separate facts from assumptions

## CLI Setup (Minimal)

CLI is only for setup and connectivity checks.
Do not use CLI for business read/write workflows.

Use:

```bash
npx quinn login --email <email>
npx quinn config get
npx quinn test
```

## SDK Manual (Primary)

Use SDK for all business queries and operations.

Shared types:

```ts
type Privilege = "owner" | "admin" | "member";
type IsoDateTime = string;
type Paged<T> = { items: T[]; nextToken: string };

type Organization = {
  id: string;
  name: string;
  brandColor: string;
  logo: { id: string; url: string } | null;
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

type Role = {
  id: string;
  label: string;
  levelIds: string[];
  createdAt: IsoDateTime;
  updatedAt: IsoDateTime;
};

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

type Competency = {
  id: string;
  name: string;
  creatorUid: string;
  createdAt: IsoDateTime;
  settings?: { managerOnlyEndorsement: boolean };
};

type Course = {
  id: string;
  name: string;
  creatorUid: string;
  createdAt: IsoDateTime;
};

type Group = {
  id: string;
  name: string;
  creatorUid: string;
  createdAt: IsoDateTime;
};

type GroupMember = {
  groupId: string;
  userId: string;
  addedByUid: string;
  addedAt: IsoDateTime;
};

type Program = {
  id: string;
  name: string;
  creatorUid: string;
  createdAt: IsoDateTime;
  settings?: { managerOnlyEndorsement: boolean };
};

type Progress = {
  id: string;
  userId: string;
  courseId: string;
  progressPct: number;
  completedAt: IsoDateTime | null;
  score: number | null;
};

type ProgressSummary = {
  total: number;
  numCompleted: number;
  numInProgress: number;
  numNotStarted: number;
};

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
```

Initialization:

```ts
import { Quinn } from "@totoday/quinn-sdk";

const quinn = new Quinn();
```

Quick command-line check (`node -e`):

```bash
node -e "const { Quinn } = require('@totoday/quinn-sdk'); const q = new Quinn(); q.organizations.current().then(console.log)"
```

### organizations (`quinn.organizations`)

```ts
quinn.organizations.current(): Promise<OrganizationDetails>;
quinn.organizations.update(input: {
  name?: string;
  logoId?: string;      // pass "" to clear logo
  brandColor?: string;
}): Promise<OrganizationDetails>;
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
quinn.members.create(input: {
  email: string;
  firstName: string;
  lastName: string;
  sendInvite?: boolean;
}): Promise<Member | null>;
quinn.members.updatePrivilege(input: {
  memberId: string;
  privilege: Privilege;
}): Promise<Member | null>;
quinn.members.updateRoles(input: {
  memberId: string;
  roleIds: string[];
}): Promise<Member | null>;
quinn.members.updateManager(input: {
  memberId: string;
  managerUid: string; // pass empty string to clear manager
}): Promise<Member | null>;
quinn.members.updateProfile(input: {
  memberId: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
}): Promise<Member | null>;
quinn.members.delete(memberId: string): Promise<void>;
quinn.members.batchDelete(input: string[] | { uids: string[] }): Promise<void>;
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

### courses (`quinn.courses`)

```ts
quinn.courses.list(params?: { limit?: number; token?: string }): Promise<Paged<Course>>;
quinn.courses.get(id: string): Promise<Course | null>;
quinn.courses.batchGet(ids: string[]): Promise<Course[]>;
```

### groups (`quinn.groups`)

```ts
quinn.groups.list(): Promise<Group[]>;
quinn.groups.get(id: string): Promise<Group | null>;
quinn.groups.batchGet(ids: string[]): Promise<Group[]>;
quinn.groups.listMembers(groupId: string): Promise<GroupMember[]>;
```

### programs (`quinn.programs`)

```ts
quinn.programs.list(params?: { limit?: number; token?: string }): Promise<Paged<Program>>;
quinn.programs.get(id: string): Promise<Program | null>;
quinn.programs.batchGet(ids: string[]): Promise<Program[]>;
```

### progress (`quinn.progress`)

```ts
quinn.progress.list(input: { userIds?: string[]; courseIds?: string[] }): Promise<Progress[]>;
quinn.progress.batchQuery(items: { userId: string; courseId: string }[]): Promise<Progress[]>;
quinn.progress.summary(input: { userIds?: string[]; courseIds?: string[] }): Promise<ProgressSummary>;
quinn.progress.courseSummary(courseId: string): Promise<ProgressSummary>;
```

### endorsements (`quinn.endorsements`)

```ts
quinn.endorsements.get(id: string): Promise<Endorsement | null>;
quinn.endorsements.find(uid: string, competencyId: string): Promise<Endorsement | null>;
quinn.endorsements.list(input: { uids: string[]; competencyIds: string[] }): Promise<Endorsement[]>;
quinn.endorsements.endorse(input: { uid: string; competencyId: string; note?: string }): Promise<Endorsement | null>;
quinn.endorsements.reset(input: { uid: string; competencyId: string; reason: string }): Promise<Endorsement | null>;
```

Minimal write example:

```ts
await quinn.endorsements.endorse({
  uid: "member_uid",
  competencyId: "competency_id",
  note: "Reviewed in 1:1",
});

await quinn.endorsements.reset({
  uid: "member_uid",
  competencyId: "competency_id",
  reason: "Evidence outdated after role change",
});
```

## Data Integrity

- Never fabricate values
- Never expose pagination tokens
- When ambiguous, query conservatively and state assumptions
