import { AxiosInstance } from 'axios';
import { Course, PagedResult, Program } from '../types';

export class ProgramsService {
  constructor(
    private readonly http: AxiosInstance
  ) {}

  async list(query: { limit?: number; token?: string } = {}): Promise<PagedResult<Program>> {
    const resp = await this.http.get<PagedResult<Program>>(
      '/programs',
      { params: query }
    );
    return resp.data;
  }

  async get(id: string): Promise<Program | null> {
    const resp = await this.http.get<{ item: Program | null }>(
      `/programs/${id}`
    );
    return resp.data.item;
  }

  async batchGet(ids: string[]): Promise<Program[]> {
    const resp = await this.http.post<{ items: Program[] }>(
      '/programs/batch',
      { ids }
    );
    return resp.data.items;
  }

  async listCourses(id: string): Promise<Course[]> {
    const resp = await this.http.get<{ items: Course[] }>(
      `/programs/${id}/courses`
    );
    return resp.data.items;
  }
}
