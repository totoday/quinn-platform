import { AxiosInstance } from 'axios';
import {
  Member,
  MembersBatchGetInput,
  MembersCreateInput,
  MembersUpdateGroupsInput,
  MembersUpdateLocationInput,
  MembersListQuery,
  MembersUpdateManagerInput,
  MembersUpdateProfileInput,
  MembersUpdatePrivilegeInput,
  MembersUpdateRolesInput,
  PagedResult,
} from '../types';

export class MembersService {
  constructor(
    private readonly http: AxiosInstance,
    private readonly assertMutationAllowed: (operation: string) => void
  ) {}

  async list(query: MembersListQuery = {}): Promise<PagedResult<Member>> {
    const params: Record<string, string | number | undefined> = {
      limit: query.limit,
      token: query.token,
      search: query.search,
      managerUid: query.managerUid,
      groupId: query.groupId,
      locationId: query.locationId,
      roleId: query.roleId,
      privilege: Array.isArray(query.privilege)
        ? query.privilege.join(',')
        : query.privilege,
    };
    const resp = await this.http.get<PagedResult<Member>>(
      '/members',
      { params }
    );
    return resp.data;
  }

  async listManagers(query: { limit?: number; token?: string; search?: string } = {}): Promise<PagedResult<Member>> {
    const resp = await this.http.get<PagedResult<Member>>('/members/managers', {
      params: query,
    });
    return resp.data;
  }

  async get(id: string): Promise<Member | null> {
    const resp = await this.http.get<{ item: Member | null }>(
      `/members/${id}`
    );
    return resp.data.item;
  }

  async batchGet(input: string[] | MembersBatchGetInput): Promise<Member[]> {
    const body: MembersBatchGetInput = Array.isArray(input)
      ? { ids: input }
      : input;
    const resp = await this.http.post<{ items: Member[] }>(
      '/members/batch',
      body
    );
    return resp.data.items;
  }

  async delete(memberId: string): Promise<void> {
    this.assertMutationAllowed('members.delete');
    await this.http.delete(`/members/${memberId}`);
  }

  async create(input: MembersCreateInput): Promise<Member | null> {
    this.assertMutationAllowed('members.create');
    const resp = await this.http.post<{ item: Member | null }>(
      '/members',
      input
    );
    return resp.data.item;
  }

  async updatePrivilege(input: MembersUpdatePrivilegeInput): Promise<Member | null> {
    this.assertMutationAllowed('members.updatePrivilege');
    const resp = await this.http.patch<{ item: Member | null }>(
      `/members/${input.memberId}/privilege`,
      { privilege: input.privilege }
    );
    return resp.data.item;
  }

  async updateRoles(input: MembersUpdateRolesInput): Promise<Member | null> {
    this.assertMutationAllowed('members.updateRoles');
    const resp = await this.http.put<{ item: Member | null }>(
      `/members/${input.memberId}/roles`,
      { roleIds: input.roleIds }
    );
    return resp.data.item;
  }

  async updateManager(input: MembersUpdateManagerInput): Promise<Member | null> {
    this.assertMutationAllowed('members.updateManager');
    const resp = await this.http.put<{ item: Member | null }>(
      `/members/${input.memberId}/manager`,
      { managerUid: input.managerUid }
    );
    return resp.data.item;
  }

  async updateGroups(input: MembersUpdateGroupsInput): Promise<Member | null> {
    this.assertMutationAllowed('members.updateGroups');
    const resp = await this.http.put<{ item: Member | null }>(
      `/members/${input.memberId}/groups`,
      { groupIds: input.groupIds }
    );
    return resp.data.item;
  }

  async updateLocation(input: MembersUpdateLocationInput): Promise<Member | null> {
    this.assertMutationAllowed('members.updateLocation');
    const resp = await this.http.put<{ item: Member | null }>(
      `/members/${input.memberId}/location`,
      { locationId: input.locationId }
    );
    return resp.data.item;
  }

  async updateProfile(input: MembersUpdateProfileInput): Promise<Member | null> {
    this.assertMutationAllowed('members.updateProfile');
    const resp = await this.http.patch<{ item: Member | null }>(
      `/members/${input.memberId}/profile`,
      {
        firstName: input.firstName,
        lastName: input.lastName,
        phoneNumber: input.phoneNumber,
      }
    );
    return resp.data.item;
  }
}
