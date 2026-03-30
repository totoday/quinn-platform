import { AxiosInstance } from 'axios';
import {
  Assignment,
  AssignmentsBatchGetInputItem,
} from '../types';

export class AssignmentsService {
  constructor(
    private readonly http: AxiosInstance
  ) {}

  async get(userId: string, courseId: string): Promise<Assignment | null> {
    const resp = await this.http.get<{ item: Assignment | null }>(
      `/assignments/users/${userId}/courses/${courseId}`
    );
    return resp.data.item;
  }

  async batchGet(items: AssignmentsBatchGetInputItem[]): Promise<Assignment[]> {
    const resp = await this.http.post<{ items: Assignment[] }>(
      '/assignments/batch',
      { items }
    );
    return resp.data.items;
  }

  async listByUserIds(userIds: string[]): Promise<Assignment[]> {
    const resp = await this.http.post<{ items: Assignment[] }>(
      '/assignments/by-users',
      { userIds }
    );
    return resp.data.items;
  }

  async listByCourseIds(courseIds: string[]): Promise<Assignment[]> {
    const resp = await this.http.post<{ items: Assignment[] }>(
      '/assignments/by-courses',
      { courseIds }
    );
    return resp.data.items;
  }
}
