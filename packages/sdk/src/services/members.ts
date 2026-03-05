import { AxiosInstance } from 'axios';
import {
  Member,
  MembersBatchGetInput,
  MembersCreateInput,
  MembersListQuery,
  MembersUpdateManagerInput,
  MembersUpdatePrivilegeInput,
  MembersUpdateRolesInput,
  PagedResult,
} from '../types';

export class MembersService {
  constructor(
    private readonly http: AxiosInstance,
    private readonly orgPath: () => string
  ) {}

  async list(query: MembersListQuery = {}): Promise<PagedResult<Member>> {
    const params: Record<string, string | number | undefined> = {
      limit: query.limit,
      token: query.token,
      search: query.search,
      managerUid: query.managerUid,
      privilege: Array.isArray(query.privilege)
        ? query.privilege.join(',')
        : query.privilege,
    };
    const resp = await this.http.get<PagedResult<Member>>(
      `${this.orgPath()}/members`,
      { params }
    );
    return resp.data;
  }

  async listManagers(query: { limit?: number; token?: string; search?: string } = {}): Promise<PagedResult<Member>> {
    const resp = await this.http.get<PagedResult<Member>>(
      `${this.orgPath()}/members/managers`,
      { params: query }
    );
    return resp.data;
  }

  async get(id: string): Promise<Member | null> {
    const resp = await this.http.get<{ item: Member | null }>(
      `${this.orgPath()}/members/${id}`
    );
    return resp.data.item;
  }

  async batchGet(input: string[] | MembersBatchGetInput): Promise<Member[]> {
    const body: MembersBatchGetInput = Array.isArray(input)
      ? { ids: input }
      : input;
    const resp = await this.http.post<{ items: Member[] }>(
      `${this.orgPath()}/members/batch`,
      body
    );
    return resp.data.items;
  }

  async create(input: MembersCreateInput): Promise<Member | null> {
    const resp = await this.http.post<{ item: Member | null }>(
      `${this.orgPath()}/members`,
      input
    );
    return resp.data.item;
  }

  async updatePrivilege(input: MembersUpdatePrivilegeInput): Promise<Member | null> {
    const resp = await this.http.patch<{ item: Member | null }>(
      `${this.orgPath()}/members/${input.memberId}/privilege`,
      { privilege: input.privilege }
    );
    return resp.data.item;
  }

  async updateRoles(input: MembersUpdateRolesInput): Promise<Member | null> {
    const resp = await this.http.put<{ item: Member | null }>(
      `${this.orgPath()}/members/${input.memberId}/roles`,
      { roleIds: input.roleIds }
    );
    return resp.data.item;
  }

  async updateManager(input: MembersUpdateManagerInput): Promise<Member | null> {
    const resp = await this.http.put<{ item: Member | null }>(
      `${this.orgPath()}/members/${input.memberId}/manager`,
      { managerUid: input.managerUid }
    );
    return resp.data.item;
  }
}
