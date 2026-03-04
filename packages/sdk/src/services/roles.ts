import { AxiosInstance } from 'axios';
import { Role } from '../types';

export class RolesService {
  constructor(
    private readonly http: AxiosInstance,
    private readonly orgPath: () => string
  ) {}

  async list(): Promise<Role[]> {
    const resp = await this.http.get<{ items: Role[] }>(`${this.orgPath()}/roles`);
    return resp.data.items;
  }

  async get(id: string): Promise<Role | null> {
    const resp = await this.http.get<{ item: Role | null }>(
      `${this.orgPath()}/roles/${id}`
    );
    return resp.data.item;
  }

  async batchGet(ids: string[]): Promise<Role[]> {
    const resp = await this.http.post<{ items: Role[] }>(
      `${this.orgPath()}/roles/batch`,
      { ids }
    );
    return resp.data.items;
  }
}
