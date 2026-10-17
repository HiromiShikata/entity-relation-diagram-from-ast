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

type PicomatchLockEntry = {
  key: string;
  version: string;
};

const isPicomatchPackageKey = (key: string): boolean =>
  key === 'node_modules/picomatch' || key.endsWith('/node_modules/picomatch');

const getPicomatchEntriesFromPackages = (
  packages: Record<string, unknown>,
): PicomatchLockEntry[] =>
  Object.entries(packages)
    .filter(([key]) => isPicomatchPackageKey(key))
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

const isWithinPicomatchVulnerableRange = (version: string): boolean => {
  const versionNumber = toComparableVersionNumber(version);
  const vulnerableRangeLowerBoundInclusive = toComparableVersionNumber(
    '4.0.0',
  );
  const vulnerableRangeUpperBoundExclusive = toComparableVersionNumber(
    '4.0.4',
  );
  return (
    versionNumber >= vulnerableRangeLowerBoundInclusive &&
    versionNumber < vulnerableRangeUpperBoundExclusive
  );
};

describe('picomatch dependency version in package-lock.json', () => {
  const packageLockPath = path.join(__dirname, '..', 'package-lock.json');
  const packageLockContent = fs.readFileSync(packageLockPath, 'utf-8');
  const parsed: unknown = JSON.parse(packageLockContent);
  const packages = getPackagesFromPackageLock(parsed);
  const picomatchEntries = getPicomatchEntriesFromPackages(packages);

  test('at least one node_modules/picomatch entry was found in package-lock.json', () => {
    expect(picomatchEntries.length).toBeGreaterThan(0);
  });

  const picomatchTestCases: Array<[string, string]> = picomatchEntries.map(
    (entry): [string, string] => [entry.key, entry.version],
  );

  test.each(picomatchTestCases)(
    'resolved picomatch version for package-lock.json entry "%s" (%s) is not within the vulnerable range (>= 4.0.0, < 4.0.4) (GHSA-c2c7-rcm5-vvqj)',
    (_key, version) => {
      expect(isWithinPicomatchVulnerableRange(version)).toEqual(false);
    },
  );
});
