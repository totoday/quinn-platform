import { AxiosInstance } from 'axios';
import {
  Course,
  PagedResult,
  Program,
  ProgramsCreateInput,
  ProgramsListQuery,
} from '../types';

export class ProgramsService {
  constructor(
    private readonly http: AxiosInstance,
    private readonly assertMutationAllowed: (operation: string) => void
  ) {}

  async list(query: ProgramsListQuery = {}): Promise<PagedResult<Program>> {
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

  async create(input: ProgramsCreateInput): Promise<Program | null> {
    this.assertMutationAllowed('programs.create');
    const resp = await this.http.post<{ item: Program | null }>(
      '/programs',
      input
    );
    return resp.data.item;
  }

  async delete(programId: string): Promise<void> {
    this.assertMutationAllowed('programs.delete');
    await this.http.delete(`/programs/${programId}`);
  }

  async listCourses(id: string): Promise<Course[]> {
    const resp = await this.http.get<{ items: Course[] }>(
      `/programs/${id}/courses`
    );
    return resp.data.items;
  }
}
