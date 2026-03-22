import { AxiosInstance } from 'axios';
import {
  AssignedUser,
  Group,
  GroupMember,
  GroupsAddMembersInput,
  GroupsCreateInput,
  GroupsCreateResult,
  GroupsRemoveMemberInput,
  GroupsUpdateNameInput,
} from '../types';

export class GroupsService {
  constructor(
    private readonly http: AxiosInstance,
    private readonly assertMutationAllowed: (operation: string) => void,
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

  async create(input: GroupsCreateInput): Promise<GroupsCreateResult> {
    this.assertMutationAllowed('groups.create');
    const resp = await this.http.post<GroupsCreateResult>('/groups', input);
    return resp.data;
  }

  async updateName(input: GroupsUpdateNameInput): Promise<Group | null> {
    this.assertMutationAllowed('groups.updateName');
    const resp = await this.http.put<{ item: Group | null }>(
      `/groups/${input.groupId}/name`,
      { name: input.name }
    );
    return resp.data.item;
  }

  async delete(groupId: string): Promise<void> {
    this.assertMutationAllowed('groups.delete');
    await this.http.delete(`/groups/${groupId}`);
  }

  async addMembers(input: GroupsAddMembersInput): Promise<AssignedUser[]> {
    this.assertMutationAllowed('groups.addMembers');
    const resp = await this.http.post<{ assignedUsers: AssignedUser[] }>(`/groups/${input.groupId}/members`, {
      userIds: input.userIds,
    });
    return resp.data.assignedUsers;
  }

  async removeMember(input: GroupsRemoveMemberInput): Promise<void> {
    this.assertMutationAllowed('groups.removeMember');
    await this.http.delete(`/groups/${input.groupId}/members/${input.userId}`);
  }
}
