import { AxiosInstance } from 'axios';
import { Level, LevelsListQuery, PagedResult } from '../types';

export class LevelsService {
  constructor(
    private readonly http: AxiosInstance
  ) {}

  async list(query: LevelsListQuery): Promise<PagedResult<Level>> {
    const resp = await this.http.get<PagedResult<Level>>('/levels', {
      params: query,
    });
    return resp.data;
  }

  async get(id: string): Promise<Level | null> {
    const resp = await this.http.get<{ item: Level | null }>(
      `/levels/${id}`
    );
    return resp.data.item;
  }

  async batchGet(ids: string[]): Promise<Level[]> {
    const resp = await this.http.post<{ items: Level[] }>(
      '/levels/batch',
      { ids }
    );
    return resp.data.items;
  }
}
