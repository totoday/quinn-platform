#!/usr/bin/env node

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { Command } from 'commander';
import { DEFAULT_QUINN_API_URL, Quinn, QuinnAuth, Privilege } from '@totoday/quinn-sdk';

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

function asCsv(raw?: string): string[] {
  if (!raw) {
    return [];
  }
  return raw
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

function asPrivilege(raw?: string): Privilege | Privilege[] | undefined {
  const values = asCsv(raw);
  if (values.length === 0) {
    return undefined;
  }
  if (values.length === 1) {
    return values[0] as Privilege;
  }
  return values as Privilege[];
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

function getContext(command: Command): {
  global: GlobalOptions;
  configPath: string;
  fileConfig: QuinnCliConfig;
  runtimeConfig: QuinnCliConfig;
} {
  const global = command.optsWithGlobals<GlobalOptions>();
  const configPath = getConfigPath(global);
  const fileConfig = readConfig(configPath);
  const runtimeConfig = resolveRuntimeConfig(global, fileConfig);
  return { global, configPath, fileConfig, runtimeConfig };
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
  .description('Quinn CLI')
  .addHelpText(
    'after',
    [
      '',
      'Examples:',
      '  quinn login --email <email>',
      '  echo "<password>" | quinn login --email <email> --password-stdin',
      '  quinn config set --api-url http://localhost:8090 --api-token <token> --org-id <orgId>',
      '  quinn organizations current',
      '  quinn members find alice',
      '  quinn members get user-1,user-2,user@example.com',
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
configCmd.addHelpText(
  'after',
  [
    '',
    'Examples:',
    '  quinn config path',
    '  quinn config get',
    '  quinn config set --api-url http://localhost:8090 --api-token <token> --org-id <orgId>',
  ].join('\n')
);

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
      const auth = new QuinnAuth({
        apiUrl: runtimeConfig.apiUrl,
        configPath,
      });
      const login = await auth.login({
        email: opts.email,
        password,
      });
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

const orgCmd = program
  .command('organizations')
  .description('organization metadata and high-level stats');
orgCmd
  .command('current')
  .description('get current organization details with aggregate stats')
  .action(function () {
    return withHandler(async () => {
      const { runtimeConfig } = getContext(this);
      const quinn = createClient(runtimeConfig);
      print(await quinn.organizations.current());
    });
  });
orgCmd.addHelpText(
  'after',
  [
    '',
    'Examples:',
    '  quinn organizations current',
  ].join('\n')
);

const membersCmd = program.command('members').description('member operations');
membersCmd
  .command('list')
  .description('list members with structured filters (no keyword search)')
  .option('--privilege <value>', 'filter by privilege: owner|admin|member, supports comma-separated')
  .option('--manager-uid <uid>', 'filter by manager UID')
  .option('--limit <n>', 'page size')
  .option('--page-token <token>', 'pagination token from previous page')
  .action(function (opts: { privilege?: string; managerUid?: string; limit?: string; pageToken?: string }) {
    return withHandler(async () => {
      const { runtimeConfig } = getContext(this);
      const quinn = createClient(runtimeConfig);
      print(
        await quinn.members.list({
          privilege: asPrivilege(opts.privilege),
          managerUid: opts.managerUid,
          limit: opts.limit ? Number(opts.limit) : undefined,
          token: opts.pageToken,
        })
      );
    });
  });

membersCmd
  .command('find')
  .description('find members by keyword (name/email fuzzy search)')
  .argument('<query>')
  .option('--limit <n>', 'page size')
  .option('--page-token <token>', 'pagination token from previous page')
  .action(function (query: string, opts: { limit?: string; pageToken?: string }) {
    return withHandler(async () => {
      const { runtimeConfig } = getContext(this);
      const quinn = createClient(runtimeConfig);
      print(
        await quinn.members.list({
          search: query,
          limit: opts.limit ? Number(opts.limit) : undefined,
          token: opts.pageToken,
        })
      );
    });
  });

membersCmd
  .command('list-managers')
  .description('list unique manager members in the organization')
  .option('--search <text>', 'optional keyword filter on manager name/email')
  .option('--limit <n>', 'page size')
  .option('--page-token <token>', 'pagination token from previous page')
  .action(function (opts: { search?: string; limit?: string; pageToken?: string }) {
    return withHandler(async () => {
      const { runtimeConfig } = getContext(this);
      const quinn = createClient(runtimeConfig);
      print(
        await quinn.members.listManagers({
          search: opts.search,
          limit: opts.limit ? Number(opts.limit) : undefined,
          token: opts.pageToken,
        })
      );
    });
  });

membersCmd
  .command('get')
  .description('get one member by ID/email, or many members by comma-separated values')
  .argument('<memberIdOrEmail>')
  .action(function (memberIdOrEmail: string) {
    return withHandler(async () => {
      const { runtimeConfig } = getContext(this);
      const quinn = createClient(runtimeConfig);
      const values = asCsv(memberIdOrEmail);
      if (values.length <= 1) {
        print(await quinn.members.get(memberIdOrEmail));
        return;
      }

      const ids: string[] = [];
      const emails: string[] = [];
      for (const value of values) {
        if (value.includes('@')) {
          emails.push(value);
        } else {
          ids.push(value);
        }
      }
      print(
        await quinn.members.batchGet({
          ids: ids.length > 0 ? ids : undefined,
          emails: emails.length > 0 ? emails : undefined,
        })
      );
    });
  });
membersCmd.addHelpText(
  'after',
  [
    '',
    'Examples:',
    '  quinn members list --privilege owner,admin',
    '  quinn members list --manager-uid <uid>',
    '  quinn members find alice',
    '  quinn members list-managers --search bob',
    '  quinn members get <memberId>',
    '  quinn members get <memberId1,memberId2,user@example.com>',
  ].join('\n')
);

const rolesCmd = program.command('roles').description('role operations');
rolesCmd.command('list').description('list all roles in the organization').action(function () {
  return withHandler(async () => {
    const { runtimeConfig } = getContext(this);
    const quinn = createClient(runtimeConfig);
    print(await quinn.roles.list());
  });
});

rolesCmd
  .command('get')
  .description('get one role by ID, or many roles by comma-separated values')
  .argument('<roleId>')
  .action(function (roleId: string) {
  return withHandler(async () => {
    const { runtimeConfig } = getContext(this);
    const quinn = createClient(runtimeConfig);
    const values = asCsv(roleId);
    if (values.length <= 1) {
      print(await quinn.roles.get(roleId));
      return;
    }
    print(await quinn.roles.batchGet(values));
  });
});
rolesCmd.addHelpText(
  'after',
  [
    '',
    'Examples:',
    '  quinn roles list',
    '  quinn roles get <roleId>',
    '  quinn roles get <roleId1,roleId2>',
  ].join('\n')
);

const levelsCmd = program.command('levels').description('level operations');
levelsCmd
  .command('list')
  .description('list levels under a role')
  .requiredOption('--role-id <id>', 'role ID to scope the query')
  .option('--limit <n>', 'page size')
  .option('--page-token <token>', 'pagination token from previous page')
  .action(function (opts: { roleId: string; limit?: string; pageToken?: string }) {
    return withHandler(async () => {
      const { runtimeConfig } = getContext(this);
      const quinn = createClient(runtimeConfig);
      print(
        await quinn.levels.list({
          roleId: opts.roleId,
          limit: opts.limit ? Number(opts.limit) : undefined,
          token: opts.pageToken,
        })
      );
    });
  });

levelsCmd
  .command('get')
  .description('get one level by ID, or many levels by comma-separated values')
  .argument('<levelId>')
  .action(function (levelId: string) {
  return withHandler(async () => {
    const { runtimeConfig } = getContext(this);
    const quinn = createClient(runtimeConfig);
    const values = asCsv(levelId);
    if (values.length <= 1) {
      print(await quinn.levels.get(levelId));
      return;
    }
    print(await quinn.levels.batchGet(values));
  });
});
levelsCmd.addHelpText(
  'after',
  [
    '',
    'Examples:',
    '  quinn levels list --role-id <roleId>',
    '  quinn levels get <levelId>',
    '  quinn levels get <levelId1,levelId2>',
  ].join('\n')
);

const compsCmd = program.command('competencies').description('competency operations');
compsCmd
  .command('list')
  .description('list competencies scoped by role + level')
  .requiredOption('--role-id <id>', 'role ID')
  .requiredOption('--level-id <id>', 'level ID')
  .option('--search <text>', 'optional keyword filter')
  .option('--limit <n>', 'page size')
  .option('--page-token <token>', 'pagination token from previous page')
  .action(function (opts: { roleId: string; levelId: string; search?: string; limit?: string; pageToken?: string }) {
    return withHandler(async () => {
      const { runtimeConfig } = getContext(this);
      const quinn = createClient(runtimeConfig);
      print(
        await quinn.competencies.list({
          roleId: opts.roleId,
          levelId: opts.levelId,
          search: opts.search,
          limit: opts.limit ? Number(opts.limit) : undefined,
          token: opts.pageToken,
        })
      );
    });
  });

compsCmd
  .command('get')
  .description('get one competency by ID, or many competencies by comma-separated values')
  .argument('<competencyId>')
  .action(function (competencyId: string) {
  return withHandler(async () => {
    const { runtimeConfig } = getContext(this);
    const quinn = createClient(runtimeConfig);
    const values = asCsv(competencyId);
    if (values.length <= 1) {
      print(await quinn.competencies.get(competencyId));
      return;
    }
    print(await quinn.competencies.batchGet(values));
  });
});

compsCmd
  .command('courses')
  .description('list courses under a competency')
  .argument('<competencyId>')
  .action(function (competencyId: string) {
    return withHandler(async () => {
      const { runtimeConfig } = getContext(this);
      const quinn = createClient(runtimeConfig);
      print(await quinn.competencies.listCourses(competencyId));
    });
  });
compsCmd.addHelpText(
  'after',
  [
    '',
    'Examples:',
    '  quinn competencies list --role-id <roleId> --level-id <levelId>',
    '  quinn competencies get <competencyId>',
    '  quinn competencies get <id1,id2>',
    '  quinn competencies courses <competencyId>',
  ].join('\n')
);

const endorseCmd = program.command('endorsements').description('endorsement operations');
endorseCmd
  .command('get')
  .description('get one endorsement by ID')
  .argument('<endorsementId>')
  .action(function (endorsementId: string) {
  return withHandler(async () => {
    const { runtimeConfig } = getContext(this);
    const quinn = createClient(runtimeConfig);
    print(await quinn.endorsements.get(endorsementId));
  });
  });

endorseCmd
  .command('find')
  .description('find one endorsement by user + competency')
  .requiredOption('--uid <uid>', 'user ID')
  .requiredOption('--competency-id <id>', 'competency ID')
  .action(function (opts: { uid: string; competencyId: string }) {
    return withHandler(async () => {
      const { runtimeConfig } = getContext(this);
      const quinn = createClient(runtimeConfig);
      print(await quinn.endorsements.find(opts.uid, opts.competencyId));
    });
  });

endorseCmd
  .command('list')
  .description('list endorsements by user IDs and competency IDs')
  .requiredOption('--uids <uids>', 'comma-separated user IDs')
  .requiredOption('--competency-ids <ids>', 'comma-separated competency IDs')
  .action(function (opts: { uids: string; competencyIds: string }) {
    return withHandler(async () => {
      const { runtimeConfig } = getContext(this);
      const quinn = createClient(runtimeConfig);
      print(
        await quinn.endorsements.list({
          uids: asCsv(opts.uids),
          competencyIds: asCsv(opts.competencyIds),
        })
      );
    });
  });
endorseCmd.addHelpText(
  'after',
  [
    '',
    'Examples:',
    '  quinn endorsements get <endorsementId>',
    '  quinn endorsements find --uid <uid> --competency-id <competencyId>',
    '  quinn endorsements list --uids <u1,u2> --competency-ids <c1,c2>',
  ].join('\n')
);

program.parseAsync(process.argv).catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`${message}\n`);
  process.exitCode = 1;
});
