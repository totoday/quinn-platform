import { AxiosInstance } from 'axios';
import { Endorsement, ListEndorsementsInput } from '../types';

export class EndorsementsService {
  constructor(
    private readonly http: AxiosInstance,
    private readonly orgPath: () => string
  ) {}

  async get(id: string): Promise<Endorsement | null> {
    const resp = await this.http.get<{ item: Endorsement | null }>(
      `${this.orgPath()}/endorsements/${id}`
    );
    return resp.data.item;
  }

  async find(uid: string, competencyId: string): Promise<Endorsement | null> {
    const resp = await this.http.get<{ item: Endorsement | null }>(
      `${this.orgPath()}/endorsements/find`,
      { params: { uid, competencyId } }
    );
    return resp.data.item;
  }

  async list(input: ListEndorsementsInput): Promise<Endorsement[]> {
    const resp = await this.http.post<{ items: Endorsement[] }>(
      `${this.orgPath()}/endorsements/list`,
      input
    );
    return resp.data.items;
  }
}
