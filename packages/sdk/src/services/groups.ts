import { AxiosInstance } from 'axios';
import { Group, GroupMember } from '../types';

export class GroupsService {
  constructor(
    private readonly http: AxiosInstance,
    private readonly orgPath: () => string
  ) {}

  async list(): Promise<Group[]> {
    const resp = await this.http.get<{ items: Group[] }>(
      `${this.orgPath()}/groups`
    );
    return resp.data.items;
  }

  async get(id: string): Promise<Group | null> {
    const resp = await this.http.get<{ item: Group | null }>(
      `${this.orgPath()}/groups/${id}`
    );
    return resp.data.item;
  }

  async batchGet(ids: string[]): Promise<Group[]> {
    const resp = await this.http.post<{ items: Group[] }>(
      `${this.orgPath()}/groups/batch`,
      { ids }
    );
    return resp.data.items;
  }

  async listMembers(groupId: string): Promise<GroupMember[]> {
    const resp = await this.http.get<{ items: GroupMember[] }>(
      `${this.orgPath()}/groups/${groupId}/members`
    );
    return resp.data.items;
  }
}
