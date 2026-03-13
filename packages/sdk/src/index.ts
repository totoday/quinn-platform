import { AxiosInstance } from 'axios';
import { QuinnAuth } from './auth';
import {
  QuinnClientConfig,
  QuinnResolvedConfig,
  resolveQuinnConfig,
} from './config';
import { createQuinnHttpClient } from './http';
import {
  assertMutationAllowed,
  QuinnMutationAccess,
  QuinnMutationAccessError,
} from './mutation-access';
import { CompetenciesService } from './services/competencies';
import { CoursesService } from './services/courses';
import { EndorsementsService } from './services/endorsements';
import { GroupsService } from './services/groups';
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
export type { QuinnMutationAccess } from './mutation-access';
export { QuinnMutationAccessError } from './mutation-access';

export class Quinn {
  private readonly config: QuinnResolvedConfig;
  private readonly http: AxiosInstance;
  readonly organizations: OrganizationsService;
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
      createQuinnHttpClient({ apiUrl: this.config.apiUrl, token: this.config.token });
    this.organizations = new OrganizationsService(
      this.http,
      this.orgPath,
      this.assertMutationAllowed
    );
    this.members = new MembersService(
      this.http,
      this.orgPath,
      this.assertMutationAllowed
    );
    this.roles = new RolesService(this.http, this.orgPath);
    this.levels = new LevelsService(this.http, this.orgPath);
    this.competencies = new CompetenciesService(this.http, this.orgPath);
    this.courses = new CoursesService(this.http, this.orgPath);
    this.groups = new GroupsService(this.http, this.orgPath);
    this.programs = new ProgramsService(this.http, this.orgPath);
    this.progress = new ProgressService(this.http, this.orgPath);
    this.endorsements = new EndorsementsService(
      this.http,
      this.orgPath,
      this.assertMutationAllowed
    );
  }

  private orgPath = () => `/platform/v1/orgs/${this.config.orgId}`;

  private assertMutationAllowed = (operation: string): void => {
    assertMutationAllowed(this.config.mutationAccess, operation);
  };
}
