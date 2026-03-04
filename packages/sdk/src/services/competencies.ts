import { AxiosInstance } from 'axios';
import { CompetenciesListQuery, Competency, Course, PagedResult } from '../types';

export class CompetenciesService {
  constructor(
    private readonly http: AxiosInstance,
    private readonly orgPath: () => string
  ) {}

  async list(query: CompetenciesListQuery): Promise<PagedResult<Competency>> {
    const resp = await this.http.get<PagedResult<Competency>>(
      `${this.orgPath()}/competencies`,
      { params: query }
    );
    return resp.data;
  }

  async get(id: string): Promise<Competency | null> {
    const resp = await this.http.get<{ item: Competency | null }>(
      `${this.orgPath()}/competencies/${id}`
    );
    return resp.data.item;
  }

  async batchGet(ids: string[]): Promise<Competency[]> {
    const resp = await this.http.post<{ items: Competency[] }>(
      `${this.orgPath()}/competencies/batch`,
      { ids }
    );
    return resp.data.items;
  }

  async listCourses(id: string): Promise<Course[]> {
    const resp = await this.http.get<{ items: Course[] }>(
      `${this.orgPath()}/competencies/${id}/courses`
    );
    return resp.data.items;
  }
}
