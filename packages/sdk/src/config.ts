import { AxiosInstance } from 'axios';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

export const DEFAULT_QUINN_API_URL = 'https://api.lunapark.com';

export interface QuinnClientConfig {
  apiUrl?: string;
  token?: string;
  orgId?: string;
  configPath?: string;
  httpClient?: AxiosInstance;
  allowQuinnMutation?: boolean;
}

export interface QuinnResolvedConfig {
  apiUrl: string;
  token: string;
  orgId: string;
  httpClient?: AxiosInstance;
  allowQuinnMutation: boolean;
}

interface QuinnFileConfig {
  apiUrl?: string;
  token?: string;
  orgId?: string;
  allowQuinnMutation?: boolean;
}

export function resolveQuinnConfig(input: QuinnClientConfig): QuinnResolvedConfig {
  const configPath = resolveConfigPath(input.configPath);
  const fileConfig = readConfigFile(configPath);

  const apiUrl = firstNonEmpty(
    input.apiUrl,
    process.env.QUINN_API_URL,
    fileConfig.apiUrl,
    DEFAULT_QUINN_API_URL
  );
  const token = firstNonEmpty(input.token, process.env.QUINN_API_TOKEN, fileConfig.token);
  const orgId = firstNonEmpty(input.orgId, process.env.QUINN_ORG_ID, fileConfig.orgId);
  const allowQuinnMutation = resolveAllowQuinnMutation(
    input.allowQuinnMutation,
    process.env.QUINN_ALLOW_QUINN_MUTATION,
    fileConfig.allowQuinnMutation
  );

  if (!apiUrl) {
    throw new Error('missing apiUrl');
  }
  if (!token) {
    throw new Error('missing token: provide QuinnClientConfig.token, QUINN_API_TOKEN, or config file token');
  }
  if (!orgId) {
    throw new Error('missing orgId: provide QuinnClientConfig.orgId, QUINN_ORG_ID, or config file orgId');
  }

  return {
    apiUrl,
    token,
    orgId,
    httpClient: input.httpClient,
    allowQuinnMutation,
  };
}

export function resolveApiUrl(input?: { apiUrl?: string; configPath?: string }): string {
  const configPath = resolveConfigPath(input?.configPath);
  const fileConfig = readConfigFile(configPath);
  return firstNonEmpty(
    input?.apiUrl,
    process.env.QUINN_API_URL,
    fileConfig.apiUrl,
    DEFAULT_QUINN_API_URL
  ) as string;
}

export function resolveConfigPath(configPath?: string): string {
  return (
    firstNonEmpty(configPath, process.env.QUINN_CONFIG_PATH) ??
    path.join(os.homedir(), '.config', 'quinn', 'config.json')
  );
}

function readConfigFile(configPath: string): QuinnFileConfig {
  if (!configPath || !fs.existsSync(configPath)) {
    return {};
  }
  try {
    const parsed = JSON.parse(fs.readFileSync(configPath, 'utf8')) as QuinnFileConfig;
    if (!parsed || typeof parsed !== 'object') {
      return {};
    }
    return {
      apiUrl: asNonEmptyString(parsed.apiUrl),
      token: asNonEmptyString(parsed.token),
      orgId: asNonEmptyString(parsed.orgId),
      allowQuinnMutation: asBoolean(parsed.allowQuinnMutation),
    };
  } catch {
    return {};
  }
}

function resolveAllowQuinnMutation(
  ...values: Array<boolean | string | undefined>
): boolean {
  for (const value of values) {
    const parsed = asBoolean(value);
    if (parsed !== undefined) {
      return parsed;
    }
  }
  return true;
}

function firstNonEmpty(...values: Array<string | undefined>): string | undefined {
  for (const value of values) {
    const normalized = asNonEmptyString(value);
    if (normalized) {
      return normalized;
    }
  }
  return undefined;
}

function asNonEmptyString(value: string | undefined): string | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed === '' ? undefined : trimmed;
}

function asBoolean(value: boolean | string | undefined): boolean | undefined {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value !== 'string') {
    return undefined;
  }

  const normalized = value.trim().toLowerCase();
  if (normalized === 'true' || normalized === '1' || normalized === 'yes') {
    return true;
  }
  if (normalized === 'false' || normalized === '0' || normalized === 'no') {
    return false;
  }

  return undefined;
}
