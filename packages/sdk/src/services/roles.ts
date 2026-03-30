import { AxiosInstance } from 'axios';
import {
  PagedResult,
  Role,
  RolesListQuery,
  RolesCreateInput,
  RolesUpdateInput,
  RolesUpdateLevelsInput,
  Level,
} from '../types';

export class RolesService {
  constructor(
    private readonly http: AxiosInstance,
    private readonly assertMutationAllowed: (operation: string) => void
  ) {}

  async list(query: RolesListQuery = {}): Promise<PagedResult<Role>> {
    const resp = await this.http.get<PagedResult<Role>>('/roles', {
      params: {
        limit: query.limit,
        token: query.token,
      },
    });
    return resp.data;
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

  async create(input: RolesCreateInput): Promise<Role | null> {
    this.assertMutationAllowed('roles.create');
    const resp = await this.http.post<{ item: Role | null }>('/roles', input);
    return resp.data.item;
  }

  async update(input: RolesUpdateInput): Promise<Role | null> {
    this.assertMutationAllowed('roles.update');
    const resp = await this.http.patch<{ item: Role | null }>(
      `/roles/${input.roleId}`,
      { label: input.label }
    );
    return resp.data.item;
  }

  async delete(roleId: string): Promise<void> {
    this.assertMutationAllowed('roles.delete');
    await this.http.delete(`/roles/${roleId}`);
  }

  async updateLevels(input: RolesUpdateLevelsInput): Promise<Level[]> {
    this.assertMutationAllowed('roles.updateLevels');
    const resp = await this.http.put<{ items: Level[] }>(
      `/roles/${input.roleId}/levels`,
      { levels: input.levels }
    );
    return resp.data.items;
  }
}
