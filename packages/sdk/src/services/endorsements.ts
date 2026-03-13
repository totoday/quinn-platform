import { AxiosInstance } from 'axios';
import {
  EndorseCompetencyInput,
  Endorsement,
  ListEndorsementsInput,
  ResetEndorsementInput,
} from '../types';

export class EndorsementsService {
  constructor(
    private readonly http: AxiosInstance,
    private readonly orgPath: () => string,
    private readonly assertMutationAllowed: (operation: string) => void
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

  async endorse(input: EndorseCompetencyInput): Promise<Endorsement | null> {
    this.assertMutationAllowed('endorsements.endorse');
    const resp = await this.http.post<{ item: Endorsement | null }>(
      `${this.orgPath()}/endorsements/endorse`,
      input
    );
    return resp.data.item;
  }

  async reset(input: ResetEndorsementInput): Promise<Endorsement | null> {
    this.assertMutationAllowed('endorsements.reset');
    const resp = await this.http.post<{ item: Endorsement | null }>(
      `${this.orgPath()}/endorsements/reset`,
      input
    );
    return resp.data.item;
  }
}
