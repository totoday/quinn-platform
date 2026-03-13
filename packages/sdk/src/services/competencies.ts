import { AxiosInstance } from 'axios';
import { CompetenciesListQuery, Competency, Course, PagedResult } from '../types';

export class CompetenciesService {
  constructor(
    private readonly http: AxiosInstance
  ) {}

  async list(query: CompetenciesListQuery): Promise<PagedResult<Competency>> {
    const resp = await this.http.get<PagedResult<Competency>>(
      '/competencies',
      { params: query }
    );
    return resp.data;
  }

  async get(id: string): Promise<Competency | null> {
    const resp = await this.http.get<{ item: Competency | null }>(
      `/competencies/${id}`
    );
    return resp.data.item;
  }

  async batchGet(ids: string[]): Promise<Competency[]> {
    const resp = await this.http.post<{ items: Competency[] }>(
      '/competencies/batch',
      { ids }
    );
    return resp.data.items;
  }

  async listCourses(id: string): Promise<Course[]> {
    const resp = await this.http.get<{ items: Course[] }>(
      `/competencies/${id}/courses`
    );
    return resp.data.items;
  }
}
