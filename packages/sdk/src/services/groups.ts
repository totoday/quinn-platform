import { AxiosInstance } from 'axios';
import { Group, GroupMember } from '../types';

export class GroupsService {
  constructor(
    private readonly http: AxiosInstance,
  ) {}

  async list(): Promise<Group[]> {
    const resp = await this.http.get<{ items: Group[] }>(
      '/groups'
    );
    return resp.data.items;
  }

  async get(id: string): Promise<Group | null> {
    const resp = await this.http.get<{ item: Group | null }>(
      `/groups/${id}`
    );
    return resp.data.item;
  }

  async batchGet(ids: string[]): Promise<Group[]> {
    const resp = await this.http.post<{ items: Group[] }>(
      '/groups/batch',
      { ids }
    );
    return resp.data.items;
  }

  async listMembers(groupId: string): Promise<GroupMember[]> {
    const resp = await this.http.get<{ items: GroupMember[] }>(
      `/groups/${groupId}/members`
    );
    return resp.data.items;
  }
}
