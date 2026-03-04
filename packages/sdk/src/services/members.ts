import { AxiosInstance } from 'axios';
import {
  Member,
  MembersBatchGetInput,
  MembersListQuery,
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
}
