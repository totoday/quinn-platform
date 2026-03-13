import axios, { AxiosInstance } from 'axios';

export interface QuinnHttpConfig {
  apiUrl: string;
  token: string;
  orgId: string;
}

export function createQuinnHttpClient(config: QuinnHttpConfig): AxiosInstance {
  return axios.create({
    baseURL: `${config.apiUrl}/platform/v1/orgs/${config.orgId}`,
    headers: {
      Authorization: `Bearer ${config.token}`,
      'Content-Type': 'application/json',
    },
  });
}
