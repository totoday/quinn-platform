import { AxiosInstance } from 'axios';
import { PagedResult, Program } from '../types';

export class ProgramsService {
  constructor(
    private readonly http: AxiosInstance,
    private readonly orgPath: () => string
  ) {}

  async list(query: { limit?: number; token?: string } = {}): Promise<PagedResult<Program>> {
    const resp = await this.http.get<PagedResult<Program>>(
      `${this.orgPath()}/programs`,
      { params: query }
    );
    return resp.data;
  }

  async get(id: string): Promise<Program | null> {
    const resp = await this.http.get<{ item: Program | null }>(
      `${this.orgPath()}/programs/${id}`
    );
    return resp.data.item;
  }

  async batchGet(ids: string[]): Promise<Program[]> {
    const resp = await this.http.post<{ items: Program[] }>(
      `${this.orgPath()}/programs/batch`,
      { ids }
    );
    return resp.data.items;
  }
}
