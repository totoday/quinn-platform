import { AxiosInstance } from 'axios';
import { Organization, OrganizationDetails } from '../types';

export class OrganizationsService {
  constructor(
    private readonly http: AxiosInstance,
    private readonly orgPath: () => string
  ) {}

  async current(): Promise<Organization | null> {
    const resp = await this.http.get<{ item: Organization | null }>(this.orgPath());
    return resp.data.item;
  }

  async getDetails(): Promise<OrganizationDetails> {
    const resp = await this.http.get<{ item: OrganizationDetails }>(
      `${this.orgPath()}/details`
    );
    return resp.data.item;
  }
}
