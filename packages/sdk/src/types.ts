export type Privilege = 'owner' | 'admin' | 'member';

export interface PaginationQuery {
  limit?: number;
  token?: string;
}

export interface PagedResult<T> {
  items: T[];
  nextToken: string;
}

export interface Organization {
  id: string;
  name: string;
  brandColor: string;
  logo: {
    id: string;
    url: string;
  } | null;
}

export interface OrganizationDetails {
  organization: Organization | null;
  stats: {
    members: number;
    managers: number;
    roles: number;
    levels: number;
    competencies: number;
  };
}

export interface OrganizationUpdateInput {
  name?: string;
  logoId?: string;
  brandColor?: string;
}

export interface Member {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  privilege: Privilege;
  managerUid: string | null;
  roleIds: string[];
  createdAt: string;
  activatedAt: string | null;
  phoneNumber: string | null;
}

export interface MembersListQuery extends PaginationQuery {
  search?: string;
  privilege?: Privilege | Privilege[];
  managerUid?: string;
}

export interface MembersBatchGetInput {
  ids?: string[];
  emails?: string[];
}

export interface MembersBatchDeleteInput {
  uids: string[];
}

export interface MembersCreateInput {
  email: string;
  firstName: string;
  lastName: string;
  sendInvite?: boolean;
}

export interface MembersUpdatePrivilegeInput {
  memberId: string;
  privilege: Privilege;
}

export interface MembersUpdateRolesInput {
  memberId: string;
  roleIds: string[];
}

export interface MembersUpdateManagerInput {
  memberId: string;
  managerUid: string;
}

export interface MembersUpdateProfileInput {
  memberId: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
}

export interface Role {
  id: string;
  label: string;
  levelIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Level {
  id: string;
  roleId: string;
  name: string;
  color: string;
  value: number;
  completeThreshold: number;
  revenueCapacity: number | null;
  compensation: string | null;
  competencyIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface LevelsListQuery extends PaginationQuery {
  roleId: string;
}

export interface Competency {
  id: string;
  name: string;
  creatorUid: string;
  createdAt: string;
  settings?: {
    managerOnlyEndorsement: boolean;
  };
}

export interface CompetenciesListQuery extends PaginationQuery {
  roleId: string;
  levelId: string;
  search?: string;
}

export interface Course {
  id: string;
  name: string;
  creatorUid: string;
  createdAt: string;
}

export interface KnowledgeSearchInput {
  query: string;
  folderId?: string;
  size?: number;
}

export interface KnowledgeSearchHit {
  id: string;
  type: string;
  text: string;
  metadata?: Record<string, unknown>;
}

export interface KnowledgeDocument {
  id: string;
  name: string;
  uid: string;
  orgId: string;
  parentId: string;
  parentType: string;
  status: string;
  extFileId: string | null;
  contentType: string | null;
  originalContentLength: number;
  contentLength: number;
  downloadable: boolean;
  folderId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface KnowledgeDocumentsListQuery extends PaginationQuery {
  folderId?: string;
  name?: string;
  includePackFiles?: boolean;
}

export interface GetDocumentTranscriptResponse {
  content: string;
}

export interface KnowledgeFolder {
  id: string;
  orgId: string;
  name: string;
  parentId: string | null;
  createdBy: string;
  children?: KnowledgeFolder[];
  createdAt: string;
  updatedAt: string;
}

export interface KnowledgeFoldersListQuery {
  parentId?: string;
}

export interface Group {
  id: string;
  name: string;
  creatorUid: string;
  createdAt: string;
}

export interface GroupMember {
  groupId: string;
  userId: string;
  addedByUid: string;
  addedAt: string;
}

export interface Program {
  id: string;
  name: string;
  creatorUid: string;
  createdAt: string;
  settings?: {
    managerOnlyEndorsement: boolean;
  };
}

export interface Progress {
  id: string;
  userId: string;
  courseId: string;
  progressPct: number;
  completedAt: string | null;
  score: number | null;
}

export interface ProgressSummary {
  total: number;
  numCompleted: number;
  numInProgress: number;
  numNotStarted: number;
}

export interface ProgressesListInput {
  userIds?: string[];
  courseIds?: string[];
}

export interface ProgressesBatchQueryInputItem {
  userId: string;
  courseId: string;
}

export interface Endorsement {
  id: string;
  uid: string;
  competencyId: string;
  roleId: string | null;
  selfAssessment: string | null;
  selfAssessedAt: string | null;
  endorsedAt: string | null;
  endorsedByUid: string | null;
  endorsementSource: string | null;
  resetAt: string | null;
  resetByUid: string | null;
  resetReason: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ListEndorsementsInput {
  uids: string[];
  competencyIds: string[];
}

export interface EndorseCompetencyInput {
  uid: string;
  competencyId: string;
  note?: string;
}

export interface ResetEndorsementInput {
  uid: string;
  competencyId: string;
  reason: string;
}
