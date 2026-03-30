export type Privilege = 'owner' | 'admin' | 'content-creator' | 'member';

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
    mediaId: string;
    url: string;
  } | null;
}

export interface OrganizationDetails {
  organization: Organization | null;
}

export interface OrganizationUpdateInput {
  name?: string;
  logoMediaId?: string;
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
  groupIds: string[];
  locationId: string | null;
  createdAt: string;
  phoneNumber: string | null;
}

export interface MembersListQuery extends PaginationQuery {
  search?: string;
  privilege?: Privilege | Privilege[];
  managerUid?: string;
  groupId?: string;
  locationId?: string;
  roleId?: string;
}

export interface MembersBatchGetInput {
  ids?: string[];
  emails?: string[];
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

export interface MembersUpdateGroupsInput {
  memberId: string;
  groupIds: string[];
}

export interface MembersUpdateLocationInput {
  memberId: string;
  locationId: string | null;
}

export interface MembersUpdateProfileInput {
  memberId: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
}

export interface Location {
  id: string;
  orgId: string;
  label: string;
  membersCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface LocationsCreateInput {
  label: string;
}

export interface LocationsUpdateInput {
  locationId: string;
  label: string;
}

export interface Role {
  id: string;
  label: string;
  levelIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface RolesListQuery extends PaginationQuery {}

export interface RolesCreateInput {
  label: string;
}

export interface RolesUpdateInput {
  roleId: string;
  label?: string;
}

export interface RoleLevelInput {
  id?: string;
  name: string;
}

export interface RolesUpdateLevelsInput {
  roleId: string;
  levels: RoleLevelInput[];
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
  description: string;
  creatorUid: string;
  createdAt: string;
  settings?: {
    managerOnlyEndorsement: boolean;
  };
}

export interface CompetenciesCreateInput {
  name: string;
  description?: string;
  roleId: string;
  levelIds: string[];
  settings?: {
    managerOnlyEndorsement?: boolean;
  };
}

export interface CompetenciesUpdateInput {
  competencyId: string;
  name?: string;
  description?: string;
  roleId?: string;
  levelIds?: string[];
  settings?: {
    managerOnlyEndorsement?: boolean;
  };
}

export interface CompetenciesListQuery extends PaginationQuery {
  roleId: string;
  levelId: string;
  search?: string;
}

export type CourseType = 'training' | 'assessment' | 'sign-off';

export interface MediaRef {
  mediaId: string;
  url: string;
}

export interface CoursesListQuery extends PaginationQuery {
  search?: string;
}

export interface Course {
  id: string;
  name: string;
  courseType: CourseType | null;
  creatorUid: string;
  learnerCount: number;
  cover: MediaRef | null;
  tagNames: string[];
  containingProgramIds: string[];
  isDraft: boolean;
  createdAt: string;
}

export interface CourseAssignedGroup {
  groupId: string;
  groupName: string;
  membersCount: number;
  assignedBy: string;
  assignedAt: string;
}

export interface CourseAssignedMember {
  userId: string;
  name: string;
  email: string;
  groupNames: string[];
  assignedAt: string;
  dueDate: string | null;
  addedBy: string;
  progressPct: number | null;
  assignedDirectly: boolean;
  assignedViaProgram: boolean;
}

export type DueDateType = 'fixed' | 'relative';

export interface AssignmentDueConfig {
  type: DueDateType;
  fixedDate?: string;
  timezone?: string;
  relativeDays?: number;
}

export interface AssignedUser {
  email: string;
  userId: string;
  assigned: boolean;
}

export interface CoursesAssignToUsersInput {
  courseId: string;
  userIds: string[];
  dueDateConfig?: AssignmentDueConfig;
}

export interface CoursesAssignToGroupsInput {
  courseId: string;
  groupIds: string[];
  dueDateConfig?: AssignmentDueConfig;
}

export interface CoursesUnassignFromUserInput {
  courseId: string;
  userId: string;
}

export interface CoursesUnassignFromGroupInput {
  courseId: string;
  groupId: string;
}

export type AssignmentStatus = 'not-started' | 'in-progress' | 'completed';

export type AssignmentSourceType = 'individual' | 'group' | 'program';

export interface AssignmentSource {
  type: AssignmentSourceType;
  assignedAt: string;
  dueDate: string | null;
  assignedByUserId: string | null;
  assignedByName: string | null;
  groupId: string | null;
  groupName: string | null;
  programId: string | null;
  programName: string | null;
}

export interface Assignment {
  userId: string;
  courseId: string;
  assignedAt: string;
  dueDate: string | null;
  status: AssignmentStatus;
  progressPct: number;
  completedAt: string | null;
  assessmentScore: number | null;
  sources: AssignmentSource[];
}

export interface AssignmentsBatchGetInputItem {
  userId: string;
  courseId: string;
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
  documentId?: string | null;
  courseId?: string | null;
  blockId?: string | null;
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

export type GroupKind = 'user-managed' | 'auto-mapped';

export type GroupAutoMapType = 'role' | 'location' | 'manager';

export interface GroupAutoMap {
  type: GroupAutoMapType;
  sourceId: string;
}

export interface Group {
  id: string;
  name: string;
  creatorUid: string;
  kind: GroupKind;
  autoMap: GroupAutoMap | null;
  membersCount: number;
  coursesCount: number;
  createdAt: string;
}

export interface GroupsListQuery extends PaginationQuery {
  kind?: GroupKind | GroupKind[];
}

export interface GroupMember {
  groupId: string;
  userId: string;
  addedByUid: string;
  addedAt: string;
}

export interface GroupsCreateInput {
  name: string;
  userIds?: string[];
}

export interface GroupsCreateResult {
  group: Group;
  assignedUsers: AssignedUser[];
}

export interface GroupsUpdateNameInput {
  groupId: string;
  name: string;
}

export interface GroupsAddMembersInput {
  groupId: string;
  userIds: string[];
}

export interface GroupsRemoveMemberInput {
  groupId: string;
  userId: string;
}

export interface ProgramsListQuery extends PaginationQuery {
  search?: string;
}

export interface Program {
  id: string;
  name: string;
  description: string;
  creatorUid: string;
  courseCount: number;
  learnerCount: number;
  createdAt: string;
}

export interface ProgramsCreateInput {
  name: string;
  courseIds?: string[];
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
