#!/usr/bin/env node

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { Command } from 'commander';
import { DEFAULT_QUINN_API_URL, Quinn, QuinnAuth } from '@totoday/quinn-sdk';

type QuinnCliConfig = {
  apiUrl?: string;
  token?: string;
  orgId?: string;
};

type GlobalOptions = {
  configPath?: string;
  apiUrl?: string;
  apiToken?: string;
  token?: string;
  orgId?: string;
};

function print(data: unknown): void {
  process.stdout.write(`${JSON.stringify(data, null, 2)}\n`);
}

function maskToken(token?: string): string | null {
  if (!token) {
    return null;
  }
  if (token.length <= 12) {
    return '***';
  }
  return `${token.slice(0, 6)}...${token.slice(-4)}`;
}

function readPasswordFromStdin(): string {
  const value = fs.readFileSync(0, 'utf8').trim();
  if (!value) {
    throw new Error('empty password from stdin');
  }
  return value;
}

async function promptPasswordHidden(prompt = 'Password: '): Promise<string> {
  if (!process.stdin.isTTY) {
    throw new Error('interactive password prompt requires TTY, use --password-stdin');
  }
  return await new Promise<string>((resolve, reject) => {
    const stdin = process.stdin;
    const stdout = process.stdout;
    let password = '';

    const cleanup = () => {
      stdin.off('data', onData);
      if (stdin.isTTY) {
        stdin.setRawMode(false);
      }
      stdin.pause();
    };

    const onData = (chunk: Buffer) => {
      const text = chunk.toString('utf8');

      if (text === '\u0003') {
        cleanup();
        reject(new Error('login cancelled'));
        return;
      }

      if (text === '\r' || text === '\n') {
        cleanup();
        stdout.write('\n');
        const value = password.trim();
        if (!value) {
          reject(new Error('password is required'));
          return;
        }
        resolve(value);
        return;
      }

      if (text === '\u007f' || text === '\b' || text === '\x08') {
        if (password.length > 0) {
          password = password.slice(0, -1);
        }
        return;
      }

      password += text;
    };

    stdout.write(prompt);
    stdin.resume();
    stdin.setRawMode(true);
    stdin.on('data', onData);
  });
}

function getConfigPath(opts: GlobalOptions): string {
  return (
    opts.configPath ||
    process.env.QUINN_CONFIG_PATH ||
    path.join(os.homedir(), '.config', 'quinn', 'config.json')
  );
}

function readConfig(configPath: string): QuinnCliConfig {
  if (!fs.existsSync(configPath)) {
    return {};
  }
  try {
    const raw = fs.readFileSync(configPath, 'utf8');
    const parsed = JSON.parse(raw) as QuinnCliConfig;
    return parsed ?? {};
  } catch {
    return {};
  }
}

function writeConfig(configPath: string, config: QuinnCliConfig): void {
  fs.mkdirSync(path.dirname(configPath), { recursive: true });
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
}

function resolveRuntimeConfig(opts: GlobalOptions, fileConfig: QuinnCliConfig): QuinnCliConfig {
  return {
    apiUrl: opts.apiUrl || process.env.QUINN_API_URL || fileConfig.apiUrl || DEFAULT_QUINN_API_URL,
    token: opts.apiToken || opts.token || process.env.QUINN_API_TOKEN || fileConfig.token,
    orgId: opts.orgId || process.env.QUINN_ORG_ID || fileConfig.orgId,
  };
}

function createClient(config: QuinnCliConfig): Quinn {
  const { apiUrl, token, orgId } = config;
  if (!token) {
    throw new Error('missing token: set --api-token/--token or QUINN_API_TOKEN or config');
  }
  if (!orgId) {
    throw new Error('missing orgId: set --org-id or QUINN_ORG_ID or config');
  }
  return new Quinn({ apiUrl, token, orgId });
}

function getContext(command: Command): {
  configPath: string;
  fileConfig: QuinnCliConfig;
  runtimeConfig: QuinnCliConfig;
} {
  const global = command.optsWithGlobals<GlobalOptions>();
  const configPath = getConfigPath(global);
  const fileConfig = readConfig(configPath);
  const runtimeConfig = resolveRuntimeConfig(global, fileConfig);
  return { configPath, fileConfig, runtimeConfig };
}

async function withHandler(fn: () => Promise<void>): Promise<void> {
  try {
    await fn();
  } catch (error: unknown) {
    let message = '';
    if (
      typeof error === 'object' &&
      error !== null &&
      'isAxiosError' in error &&
      (error as { isAxiosError?: boolean }).isAxiosError
    ) {
      const axiosError = error as {
        message?: string;
        response?: { status?: number; data?: unknown };
      };
      const status = axiosError.response?.status;
      const responseData = axiosError.response?.data;
      const details =
        typeof responseData === 'string'
          ? responseData
          : responseData
            ? JSON.stringify(responseData)
            : '';
      message = [
        axiosError.message || 'HTTP request failed',
        status ? `(status: ${status})` : '',
        details ? `response: ${details}` : '',
      ]
        .filter(Boolean)
        .join(' ');
    } else if (error instanceof Error) {
      message = error.message;
    } else {
      message = String(error);
    }
    process.stderr.write(`${message || 'Unknown error'}\n`);
    process.exitCode = 1;
  }
}

const program = new Command();
program
  .name('quinn')
  .description('Quinn CLI (minimal setup utility, SDK-first runtime)')
  .addHelpText(
    'after',
    [
      '',
      'Examples:',
      '  quinn login --email <email>',
      '  echo "<password>" | quinn login --email <email> --password-stdin',
      '  quinn config get',
      '  quinn test',
    ].join('\n')
  )
  .showHelpAfterError()
  .option('--config-path <path>', 'config file path (default ~/.config/quinn/config.json)')
  .option('--api-url <url>', 'Quinn API base url')
  .option('--api-token <token>', 'Quinn API token')
  .option('--token <token>', 'alias of --api-token')
  .option('--org-id <id>', 'Quinn org id');

const configCmd = program.command('config').description('manage local CLI config');
configCmd
  .command('path')
  .description('print config file path')
  .action(function () {
    const { configPath } = getContext(this);
    print({ configPath });
  });

configCmd
  .command('get')
  .description('show config and resolved runtime values')
  .action(function () {
    const { configPath, fileConfig, runtimeConfig } = getContext(this);
    print({
      configPath,
      config: {
        apiUrl: fileConfig.apiUrl ?? null,
        token: maskToken(fileConfig.token),
        orgId: fileConfig.orgId ?? null,
      },
      runtime: {
        apiUrl: runtimeConfig.apiUrl ?? null,
        token: maskToken(runtimeConfig.token),
        orgId: runtimeConfig.orgId ?? null,
      },
    });
  });

configCmd
  .command('set')
  .description('write apiUrl/token/orgId into config file')
  .option('--api-url <url>')
  .option('--api-token <token>')
  .option('--token <token>')
  .option('--org-id <id>')
  .action(function (opts: GlobalOptions) {
    const { configPath, fileConfig } = getContext(this);
    const next: QuinnCliConfig = {
      apiUrl: opts.apiUrl || fileConfig.apiUrl,
      token: opts.apiToken || opts.token || fileConfig.token,
      orgId: opts.orgId || fileConfig.orgId,
    };
    writeConfig(configPath, next);
    print({
      ok: true,
      configPath,
      config: {
        apiUrl: next.apiUrl ?? null,
        token: maskToken(next.token),
        orgId: next.orgId ?? null,
      },
    });
  });

program
  .command('login')
  .description('login and save token (+orgId) into config (password input is hidden by default)')
  .requiredOption('--email <email>')
  .option('--password <password>', 'DEPRECATED: avoid plain-text password in command history/process list')
  .option('--password-stdin', 'read password from stdin')
  .option('--org-id <id>', 'override org id if login response does not include one')
  .action(function (opts: { email: string; password?: string; passwordStdin?: boolean; orgId?: string }) {
    return withHandler(async () => {
      const { configPath, fileConfig, runtimeConfig } = getContext(this);
      if (opts.password && opts.passwordStdin) {
        throw new Error('cannot use --password and --password-stdin together');
      }
      let password = '';
      if (opts.passwordStdin) {
        password = readPasswordFromStdin();
      } else if (opts.password) {
        process.stderr.write(
          'Warning: --password is deprecated and insecure. Use interactive prompt or --password-stdin.\n'
        );
        password = opts.password;
      } else {
        password = await promptPasswordHidden();
      }
      const auth = new QuinnAuth({ apiUrl: runtimeConfig.apiUrl, configPath });
      const login = await auth.login({ email: opts.email, password });
      const resolvedOrgId = opts.orgId || login.orgId || fileConfig.orgId;
      if (!resolvedOrgId) {
        throw new Error('orgId not found in login response, please pass --org-id');
      }
      const next: QuinnCliConfig = {
        apiUrl: runtimeConfig.apiUrl || DEFAULT_QUINN_API_URL,
        token: login.token,
        orgId: resolvedOrgId,
      };
      writeConfig(configPath, next);
      print({
        ok: true,
        configPath,
        config: {
          apiUrl: next.apiUrl,
          token: maskToken(next.token),
          orgId: next.orgId,
        },
      });
    });
  });

program
  .command('test')
  .description('test connectivity and auth by calling organizations.current()')
  .action(function () {
    return withHandler(async () => {
      const { runtimeConfig } = getContext(this);
      const quinn = createClient(runtimeConfig);
      const item = await quinn.organizations.current();
      print({ ok: true, item });
    });
  });

program.parseAsync(process.argv).catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`${message}\n`);
  process.exitCode = 1;
});
