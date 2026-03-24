import { AxiosInstance } from 'axios';
import { QuinnAuth } from './auth';
import {
  QuinnClientConfig,
  QuinnResolvedConfig,
  resolveQuinnConfig,
} from './config';
import { createQuinnHttpClient } from './http';
import { assertMutationAllowed, QuinnMutationGuardError } from './mutation-access';
import { CompetenciesService } from './services/competencies';
import { CoursesService } from './services/courses';
import { EndorsementsService } from './services/endorsements';
import { GroupsService } from './services/groups';
import { KnowledgeService } from './services/knowledge';
import { LevelsService } from './services/levels';
import { MembersService } from './services/members';
import { OrganizationsService } from './services/organizations';
import { ProgressService } from './services/progress';
import { ProgramsService } from './services/programs';
import { RolesService } from './services/roles';

export * from './types';
export { QuinnAuth } from './auth';
export {
  DEFAULT_QUINN_API_URL,
  resolveApiUrl,
  resolveConfigPath,
} from './config';
export type { QuinnClientConfig } from './config';
export { QuinnMutationGuardError } from './mutation-access';
export {
  KnowledgeDocumentsService,
  KnowledgeFoldersService,
  KnowledgeService,
} from './services/knowledge';

export class Quinn {
  private readonly config: QuinnResolvedConfig;
  private readonly http: AxiosInstance;
  readonly organizations: OrganizationsService;
  readonly knowledge: KnowledgeService;
  readonly members: MembersService;
  readonly roles: RolesService;
  readonly levels: LevelsService;
  readonly competencies: CompetenciesService;
  readonly courses: CoursesService;
  readonly groups: GroupsService;
  readonly programs: ProgramsService;
  readonly progress: ProgressService;
  readonly endorsements: EndorsementsService;

  constructor(config: QuinnClientConfig = {}) {
    this.config = resolveQuinnConfig(config);
    this.http =
      this.config.httpClient ??
      createQuinnHttpClient({
        apiUrl: this.config.apiUrl,
        token: this.config.token,
        orgId: this.config.orgId,
      });
    this.organizations = new OrganizationsService(this.http, this.assertMutationAllowed);
    this.knowledge = new KnowledgeService(this.http);
    this.members = new MembersService(this.http, this.assertMutationAllowed);
    this.roles = new RolesService(this.http, this.assertMutationAllowed);
    this.levels = new LevelsService(this.http);
    this.competencies = new CompetenciesService(this.http, this.assertMutationAllowed);
    this.courses = new CoursesService(this.http, this.assertMutationAllowed);
    this.groups = new GroupsService(this.http, this.assertMutationAllowed);
    this.programs = new ProgramsService(this.http);
    this.progress = new ProgressService(this.http);
    this.endorsements = new EndorsementsService(this.http, this.assertMutationAllowed);
  }

  private assertMutationAllowed = (operation: string): void => {
    assertMutationAllowed(this.config.allowQuinnMutation, operation);
  };
}
