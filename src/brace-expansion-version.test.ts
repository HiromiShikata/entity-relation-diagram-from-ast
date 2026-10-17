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

type BraceExpansionLockEntry = {
  key: string;
  version: string;
};

const isBraceExpansionPackageKey = (key: string): boolean =>
  key === 'node_modules/brace-expansion' ||
  key.endsWith('/node_modules/brace-expansion');

const getBraceExpansionEntriesFromPackages = (
  packages: Record<string, unknown>,
): BraceExpansionLockEntry[] =>
  Object.entries(packages)
    .filter(([key]) => isBraceExpansionPackageKey(key))
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

const isWithinBraceExpansionVulnerableRange = (version: string): boolean => {
  const versionNumber = toComparableVersionNumber(version);
  const vulnerableRangeLowerBoundInclusive = toComparableVersionNumber('4.0.0');
  const vulnerableRangeUpperBoundExclusive =
    toComparableVersionNumber('5.0.11');
  return (
    versionNumber >= vulnerableRangeLowerBoundInclusive &&
    versionNumber < vulnerableRangeUpperBoundExclusive
  );
};

describe('brace-expansion dependency version in package-lock.json', () => {
  const packageLockPath = path.join(__dirname, '..', 'package-lock.json');
  const packageLockContent = fs.readFileSync(packageLockPath, 'utf-8');
  const parsed: unknown = JSON.parse(packageLockContent);
  const packages = getPackagesFromPackageLock(parsed);
  const braceExpansionEntries = getBraceExpansionEntriesFromPackages(packages);

  test('at least one node_modules/brace-expansion entry was found in package-lock.json', () => {
    expect(braceExpansionEntries.length).toBeGreaterThan(0);
  });

  const braceExpansionTestCases: Array<[string, string]> =
    braceExpansionEntries.map((entry): [string, string] => [
      entry.key,
      entry.version,
    ]);

  test.each(braceExpansionTestCases)(
    'resolved brace-expansion version for package-lock.json entry "%s" (%s) is not within the vulnerable range (>= 4.0.0, < 5.0.11) (GHSA-6j4f-fj2g-mc7p, GHSA-qhr7-859c-m2p7)',
    (_key, version) => {
      expect(isWithinBraceExpansionVulnerableRange(version)).toEqual(false);
    },
  );
});
