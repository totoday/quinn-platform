import { AxiosInstance } from 'axios';
import { Course, PagedResult } from '../types';

export class CoursesService {
  constructor(
    private readonly http: AxiosInstance
  ) {}

  async list(query: { limit?: number; token?: string } = {}): Promise<PagedResult<Course>> {
    const resp = await this.http.get<PagedResult<Course>>(
      '/courses',
      { params: query }
    );
    return resp.data;
  }

  async get(id: string): Promise<Course | null> {
    const resp = await this.http.get<{ item: Course | null }>(
      `/courses/${id}`
    );
    return resp.data.item;
  }

  async batchGet(ids: string[]): Promise<Course[]> {
    const resp = await this.http.post<{ items: Course[] }>(
      '/courses/batch',
      { ids }
    );
    return resp.data.items;
  }
}
