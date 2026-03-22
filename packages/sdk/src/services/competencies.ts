import { AxiosInstance } from 'axios';
import {
  CompetenciesCreateInput,
  CompetenciesListQuery,
  CompetenciesUpdateInput,
  Competency,
  Course,
  PagedResult,
} from '../types';

export class CompetenciesService {
  constructor(
    private readonly http: AxiosInstance,
    private readonly assertMutationAllowed: (operation: string) => void
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

  async create(input: CompetenciesCreateInput): Promise<Competency | null> {
    this.assertMutationAllowed('competencies.create');
    const resp = await this.http.post<{ item: Competency | null }>(
      '/competencies',
      input
    );
    return resp.data.item;
  }

  async update(input: CompetenciesUpdateInput): Promise<Competency | null> {
    this.assertMutationAllowed('competencies.update');
    const resp = await this.http.patch<{ item: Competency | null }>(
      `/competencies/${input.competencyId}`,
      {
        name: input.name,
        description: input.description,
        roleId: input.roleId,
        levelIds: input.levelIds,
        settings: input.settings,
      }
    );
    return resp.data.item;
  }

  async delete(competencyId: string): Promise<void> {
    this.assertMutationAllowed('competencies.delete');
    await this.http.delete(`/competencies/${competencyId}`);
  }
}
