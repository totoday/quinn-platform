import { AxiosInstance } from 'axios';
import {
  Location,
  LocationsCreateInput,
  LocationsUpdateInput,
  PagedResult,
} from '../types';

export class LocationsService {
  constructor(
    private readonly http: AxiosInstance,
    private readonly assertMutationAllowed: (operation: string) => void
  ) {}

  async list(query: { limit?: number; token?: string } = {}): Promise<PagedResult<Location>> {
    const resp = await this.http.get<PagedResult<Location>>(
      '/locations',
      { params: query }
    );
    return resp.data;
  }

  async get(id: string): Promise<Location | null> {
    const resp = await this.http.get<{ item: Location | null }>(
      `/locations/${id}`
    );
    return resp.data.item;
  }

  async batchGet(ids: string[]): Promise<Location[]> {
    const resp = await this.http.post<{ items: Location[] }>(
      '/locations/batch',
      { ids }
    );
    return resp.data.items;
  }

  async create(input: LocationsCreateInput): Promise<Location | null> {
    this.assertMutationAllowed('locations.create');
    const resp = await this.http.post<{ item: Location | null }>(
      '/locations',
      input
    );
    return resp.data.item;
  }

  async update(input: LocationsUpdateInput): Promise<Location | null> {
    this.assertMutationAllowed('locations.update');
    const resp = await this.http.patch<{ item: Location | null }>(
      `/locations/${input.locationId}`,
      { label: input.label }
    );
    return resp.data.item;
  }

  async delete(locationId: string): Promise<void> {
    this.assertMutationAllowed('locations.delete');
    await this.http.delete(`/locations/${locationId}`);
  }
}
