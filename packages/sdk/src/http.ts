import axios, { AxiosInstance } from 'axios';

export interface QuinnHttpConfig {
  apiUrl: string;
  token: string;
}

export function createQuinnHttpClient(config: QuinnHttpConfig): AxiosInstance {
  return axios.create({
    baseURL: config.apiUrl,
    headers: {
      Authorization: `Bearer ${config.token}`,
      'Content-Type': 'application/json',
    },
  });
}
