import { AxiosInstance } from 'axios';
import { Role } from '../types';

export class RolesService {
  constructor(
    private readonly http: AxiosInstance
  ) {}

  async list(): Promise<Role[]> {
    const resp = await this.http.get<{ items: Role[] }>('/roles');
    return resp.data.items;
  }

  async get(id: string): Promise<Role | null> {
    const resp = await this.http.get<{ item: Role | null }>(
      `/roles/${id}`
    );
    return resp.data.item;
  }

  async batchGet(ids: string[]): Promise<Role[]> {
    const resp = await this.http.post<{ items: Role[] }>(
      '/roles/batch',
      { ids }
    );
    return resp.data.items;
  }
}
