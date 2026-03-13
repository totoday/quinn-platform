import { AxiosInstance } from 'axios';
import { OrganizationDetails, OrganizationUpdateInput } from '../types';

export class OrganizationsService {
  constructor(
    private readonly http: AxiosInstance,
    private readonly assertMutationAllowed: (operation: string) => void
  ) {}

  async current(): Promise<OrganizationDetails> {
    const resp = await this.http.get<{ item: OrganizationDetails }>('/');
    return resp.data.item;
  }

  async update(input: OrganizationUpdateInput): Promise<OrganizationDetails> {
    this.assertMutationAllowed('organizations.update');
    const resp = await this.http.patch<{ item: OrganizationDetails }>(
      '/',
      input
    );
    return resp.data.item;
  }
}
