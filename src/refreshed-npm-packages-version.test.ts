import * as fs from 'fs';
import * as path from 'path';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const getPackagesFromPackageLock = (
  parsedPackageLock: unknown,
): Record<string, unknown> => {
  if (!isRecord(parsedPackageLock)) {
    throw new Error('package-lock.json did not parse to an object');
  }
  const packages = parsedPackageLock.packages;
  if (!isRecord(packages)) {
    throw new Error('package-lock.json is missing a "packages" object');
  }
  return packages;
};

type PackageLockEntry = {
  key: string;
  version: string;
};

const isPackageLockKeyOfPackage = (key: string, packageName: string): boolean =>
  key === `node_modules/${packageName}` ||
  key.endsWith(`/node_modules/${packageName}`);

const getPackageLockEntriesOfPackage = (
  packages: Record<string, unknown>,
  packageName: string,
): PackageLockEntry[] =>
  Object.entries(packages)
    .filter(([key]) => isPackageLockKeyOfPackage(key, packageName))
    .map(([key, entry]) => {
      if (!isRecord(entry) || typeof entry.version !== 'string') {
        throw new Error(
          `package-lock.json entry "${key}" is missing a valid "version" string`,
        );
      }
      return { key, version: entry.version };
    });

const toComparableNumber = (
  majorPart: number,
  minorPart: number,
  patchPart: number,
): number => majorPart * 1000000 + minorPart * 1000 + patchPart;

const toComparableVersionNumber = (version: string): number => {
  const [major, minor, patch] = version
    .split('.')
    .map((part) => parseInt(part, 10));
  return toComparableNumber(major, minor, patch);
};

const isBelowMinimumVersion = (
  version: string,
  minimumVersion: string,
): boolean =>
  !(
    toComparableVersionNumber(version) >=
    toComparableVersionNumber(minimumVersion)
  );

describe('npm packages refreshed by the weekly dependency update, as resolved in package-lock.json', () => {
  const packageLockPath = path.join(__dirname, '..', 'package-lock.json');
  const packageLockContent = fs.readFileSync(packageLockPath, 'utf-8');
  const parsed: unknown = JSON.parse(packageLockContent);
  const packages = getPackagesFromPackageLock(parsed);

  const refreshedPackageMinimumVersionTestCases: Array<[string, string]> = [
    ['@typescript-eslint/eslint-plugin', '8.71.1'],
    ['@typescript-eslint/parser', '8.71.1'],
    ['prettier', '3.9.10'],
    ['conventional-changelog-conventionalcommits', '10.4.1'],
  ];

  test.each(refreshedPackageMinimumVersionTestCases)(
    'package-lock.json resolves "%s" to at least version %s in every node_modules entry',
    (packageName, minimumVersion) => {
      const entries = getPackageLockEntriesOfPackage(packages, packageName);
      const entriesBelowMinimumVersion = entries.filter((entry) =>
        isBelowMinimumVersion(entry.version, minimumVersion),
      );

      expect(entriesBelowMinimumVersion).toEqual([]);
      expect(entries.length).toBeGreaterThan(0);
    },
  );
});
