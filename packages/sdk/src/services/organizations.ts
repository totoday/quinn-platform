import { AxiosInstance } from 'axios';
import { OrganizationDetails } from '../types';

export class OrganizationsService {
  constructor(
    private readonly http: AxiosInstance,
    private readonly orgPath: () => string
  ) {}

  async current(): Promise<OrganizationDetails> {
    const resp = await this.http.get<{ item: OrganizationDetails }>(this.orgPath());
    return resp.data.item;
  }
}
