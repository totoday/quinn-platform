import { AxiosInstance } from 'axios';
import {
  AssignedUser,
  Course,
  CoursesAssignToGroupsInput,
  CoursesAssignToUsersInput,
  CoursesUnassignFromGroupInput,
  CoursesUnassignFromUserInput,
  PagedResult,
} from '../types';

export class CoursesService {
  constructor(
    private readonly http: AxiosInstance,
    private readonly assertMutationAllowed: (operation: string) => void
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

  async assignToUsers(input: CoursesAssignToUsersInput): Promise<AssignedUser[]> {
    this.assertMutationAllowed('courses.assignToUsers');
    const resp = await this.http.post<{ assignedUsers: AssignedUser[] }>(
      `/courses/${input.courseId}/assign/users`,
      {
        userIds: input.userIds,
        dueDateConfig: input.dueDateConfig,
      }
    );
    return resp.data.assignedUsers;
  }

  async assignToGroups(input: CoursesAssignToGroupsInput): Promise<void> {
    this.assertMutationAllowed('courses.assignToGroups');
    await this.http.post(
      `/courses/${input.courseId}/assign/groups`,
      {
        groupIds: input.groupIds,
        dueDateConfig: input.dueDateConfig,
      }
    );
  }

  async unassignFromUser(input: CoursesUnassignFromUserInput): Promise<void> {
    this.assertMutationAllowed('courses.unassignFromUser');
    await this.http.delete(`/courses/${input.courseId}/users/${input.userId}`);
  }

  async unassignFromGroup(input: CoursesUnassignFromGroupInput): Promise<void> {
    this.assertMutationAllowed('courses.unassignFromGroup');
    await this.http.delete(`/courses/${input.courseId}/groups/${input.groupId}`);
  }
}
