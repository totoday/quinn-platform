import { AxiosInstance } from 'axios';
import { createQuinnHttpClient } from './http';
import { CompetenciesService } from './services/competencies';
import { EndorsementsService } from './services/endorsements';
import { LevelsService } from './services/levels';
import { MembersService } from './services/members';
import { OrganizationsService } from './services/organizations';
import { RolesService } from './services/roles';

export * from './types';

export interface QuinnClientConfig {
  apiUrl: string;
  token: string;
  orgId: string;
  httpClient?: AxiosInstance;
}

export class Quinn {
  private readonly http: AxiosInstance;
  readonly organizations: OrganizationsService;
  readonly members: MembersService;
  readonly roles: RolesService;
  readonly levels: LevelsService;
  readonly competencies: CompetenciesService;
  readonly endorsements: EndorsementsService;

  constructor(private readonly config: QuinnClientConfig) {
    this.http =
      config.httpClient ??
      createQuinnHttpClient({ apiUrl: config.apiUrl, token: config.token });
    this.organizations = new OrganizationsService(this.http, this.orgPath);
    this.members = new MembersService(this.http, this.orgPath);
    this.roles = new RolesService(this.http, this.orgPath);
    this.levels = new LevelsService(this.http, this.orgPath);
    this.competencies = new CompetenciesService(this.http, this.orgPath);
    this.endorsements = new EndorsementsService(this.http, this.orgPath);
  }

  private orgPath = () => `/platform/v1/orgs/${this.config.orgId}`;
}
