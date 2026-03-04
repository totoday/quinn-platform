import { AxiosInstance } from 'axios';
import { Level, LevelsListQuery, PagedResult } from '../types';

export class LevelsService {
  constructor(
    private readonly http: AxiosInstance,
    private readonly orgPath: () => string
  ) {}

  async list(query: LevelsListQuery): Promise<PagedResult<Level>> {
    const resp = await this.http.get<PagedResult<Level>>(`${this.orgPath()}/levels`, {
      params: query,
    });
    return resp.data;
  }

  async get(id: string): Promise<Level | null> {
    const resp = await this.http.get<{ item: Level | null }>(
      `${this.orgPath()}/levels/${id}`
    );
    return resp.data.item;
  }

  async batchGet(ids: string[]): Promise<Level[]> {
    const resp = await this.http.post<{ items: Level[] }>(
      `${this.orgPath()}/levels/batch`,
      { ids }
    );
    return resp.data.items;
  }
}
