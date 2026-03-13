import { AxiosInstance } from 'axios';
import {
  Progress,
  ProgressesBatchQueryInputItem,
  ProgressesListInput,
  ProgressSummary,
} from '../types';

export class ProgressService {
  constructor(
    private readonly http: AxiosInstance,
    private readonly orgPath: () => string
  ) {}

  async list(input: ProgressesListInput): Promise<Progress[]> {
    const params: Record<string, string | undefined> = {
      userIds: input.userIds?.join(','),
      courseIds: input.courseIds?.join(','),
    };
    const resp = await this.http.get<{ items: Progress[] }>(
      `${this.orgPath()}/progress`,
      { params }
    );
    return resp.data.items;
  }

  async batchQuery(items: ProgressesBatchQueryInputItem[]): Promise<Progress[]> {
    const resp = await this.http.post<{ items: Progress[] }>(
      `${this.orgPath()}/progress/batch`,
      { items }
    );
    return resp.data.items;
  }

  async summary(input: ProgressesListInput): Promise<ProgressSummary> {
    const params: Record<string, string | undefined> = {
      userIds: input.userIds?.join(','),
      courseIds: input.courseIds?.join(','),
    };
    const resp = await this.http.get<{ item: ProgressSummary }>(
      `${this.orgPath()}/progress/summary`,
      { params }
    );
    return resp.data.item;
  }

  async courseSummary(courseId: string): Promise<ProgressSummary> {
    const resp = await this.http.get<{ item: ProgressSummary }>(
      `${this.orgPath()}/progress/summary/courses/${courseId}`
    );
    return resp.data.item;
  }
}
