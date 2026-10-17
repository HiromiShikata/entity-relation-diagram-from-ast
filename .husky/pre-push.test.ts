import { execFileSync } from 'child_process';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

interface ExecFileSyncFailure {
  readonly status: number | null;
  readonly stdout?: Buffer | string;
}

const isExecFileSyncFailure = (value: unknown): value is ExecFileSyncFailure =>
  typeof value === 'object' && value !== null && 'status' in value;

interface StubCheckExitCodes {
  readonly test: number;
  readonly lint: number;
  readonly typecheck: number;
}

interface HookRunResult {
  readonly exitCode: number | null;
  readonly stdout: string;
}

const STUB_NPM_SCRIPT = `#!/usr/bin/env sh
printf '%s\\n' "$*" >> "$STUB_INVOCATION_LOG"
case "$*" in
  test)
    exit "$STUB_NPM_TEST_EXIT_CODE"
    ;;
  "run lint")
    exit "$STUB_NPM_LINT_EXIT_CODE"
    ;;
  "run typecheck")
    exit "$STUB_NPM_TYPECHECK_EXIT_CODE"
    ;;
  *)
    exit 1
    ;;
esac
`;

describe('.husky/pre-push', () => {
  const hookPath = path.join(__dirname, 'pre-push');
  let stubBinDir: string;
  let invocationLogPath: string;

  beforeEach(() => {
    stubBinDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pre-push-stub-bin-'));
    fs.writeFileSync(path.join(stubBinDir, 'npm'), STUB_NPM_SCRIPT, {
      mode: 0o755,
    });
    const logDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pre-push-stub-log-'));
    invocationLogPath = path.join(logDir, 'invocations.log');
    fs.writeFileSync(invocationLogPath, '');
  });

  afterEach(() => {
    fs.rmSync(stubBinDir, { recursive: true, force: true });
    fs.rmSync(path.dirname(invocationLogPath), {
      recursive: true,
      force: true,
    });
  });

  const readRecordedInvocations = (): string[] =>
    fs
      .readFileSync(invocationLogPath, 'utf8')
      .split('\n')
      .filter((line) => line.length > 0);

  const runHookWithStubbedChecks = (
    exitCodes: StubCheckExitCodes,
  ): HookRunResult => {
    const env = {
      ...process.env,
      PATH: `${stubBinDir}${path.delimiter}${process.env.PATH ?? ''}`,
      STUB_INVOCATION_LOG: invocationLogPath,
      STUB_NPM_TEST_EXIT_CODE: String(exitCodes.test),
      STUB_NPM_LINT_EXIT_CODE: String(exitCodes.lint),
      STUB_NPM_TYPECHECK_EXIT_CODE: String(exitCodes.typecheck),
    };
    try {
      const stdout = execFileSync(hookPath, [], { env, encoding: 'utf8' });
      return { exitCode: 0, stdout };
    } catch (error) {
      if (!isExecFileSyncFailure(error)) {
        throw error;
      }
      return {
        exitCode: error.status,
        stdout: error.stdout ? error.stdout.toString() : '',
      };
    }
  };

  it('blocks the push and stops at the first failing check, in test -> lint -> typecheck order', () => {
    const scenarios: {
      readonly name: string;
      readonly exitCodes: StubCheckExitCodes;
      readonly expectedInvocations: string[];
    }[] = [
      {
        name: 'test fails',
        exitCodes: { test: 1, lint: 0, typecheck: 0 },
        expectedInvocations: ['test'],
      },
      {
        name: 'lint fails',
        exitCodes: { test: 0, lint: 1, typecheck: 0 },
        expectedInvocations: ['test', 'run lint'],
      },
      {
        name: 'typecheck fails',
        exitCodes: { test: 0, lint: 0, typecheck: 1 },
        expectedInvocations: ['test', 'run lint', 'run typecheck'],
      },
    ];

    for (const scenario of scenarios) {
      fs.writeFileSync(invocationLogPath, '');

      const result = runHookWithStubbedChecks(scenario.exitCodes);

      expect(result.exitCode).not.toBe(0);
      expect(readRecordedInvocations()).toEqual(scenario.expectedInvocations);
    }
  });

  it('exits 0 and runs test, lint, and typecheck in order when all three succeed', () => {
    const result = runHookWithStubbedChecks({ test: 0, lint: 0, typecheck: 0 });

    expect(result.exitCode).toBe(0);
    expect(readRecordedInvocations()).toEqual([
      'test',
      'run lint',
      'run typecheck',
    ]);
  });
});
