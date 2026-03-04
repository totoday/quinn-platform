import axios, { AxiosInstance } from 'axios';
import { resolveApiUrl } from './config';

export interface QuinnAuthConfig {
  apiUrl?: string;
  configPath?: string;
  httpClient?: AxiosInstance;
}

export interface QuinnLoginRequest {
  email: string;
  password: string;
}

export interface QuinnLoginResult {
  token: string;
  orgId?: string;
}

type LoginApiResponse = {
  token?: string;
  user?: {
    organizer?: {
      orgId?: string;
    } | null;
  } | null;
};

export class QuinnAuth {
  private readonly http: AxiosInstance;

  constructor(config: QuinnAuthConfig = {}) {
    this.http =
      config.httpClient ??
      axios.create({
        baseURL: resolveApiUrl({ apiUrl: config.apiUrl, configPath: config.configPath }),
        headers: {
          'Content-Type': 'application/json',
        },
      });
  }

  async login(request: QuinnLoginRequest): Promise<QuinnLoginResult> {
    const resp = await this.http.post<LoginApiResponse>('/api/v1/login', request);
    const token = resp.data?.token;
    if (!token) {
      throw new Error('login succeeded but token is missing in response');
    }
    return {
      token,
      orgId: resp.data?.user?.organizer?.orgId,
    };
  }
}
