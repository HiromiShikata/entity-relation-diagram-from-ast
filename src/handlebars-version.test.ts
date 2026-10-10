import * as fs from 'fs';
import * as path from 'path';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const getHandlebarsVersionFromPackageLock = (
  parsedPackageLock: unknown,
): string => {
  if (!isRecord(parsedPackageLock)) {
    throw new Error('package-lock.json did not parse to an object');
  }
  const packages = parsedPackageLock.packages;
  if (!isRecord(packages)) {
    throw new Error('package-lock.json is missing a "packages" object');
  }
  const handlebarsEntry = packages['node_modules/handlebars'];
  if (
    !isRecord(handlebarsEntry) ||
    typeof handlebarsEntry.version !== 'string'
  ) {
    throw new Error(
      'package-lock.json is missing a valid node_modules/handlebars entry',
    );
  }
  return handlebarsEntry.version;
};

describe('handlebars dependency version in package-lock.json', () => {
  test('resolved handlebars version is not within the vulnerable range (>= 4.0.0, <= 4.7.9)', () => {
    const packageLockPath = path.join(__dirname, '..', 'package-lock.json');
    const packageLockContent = fs.readFileSync(packageLockPath, 'utf-8');
    const parsed: unknown = JSON.parse(packageLockContent);

    const handlebarsVersion: string =
      getHandlebarsVersionFromPackageLock(parsed);

    const [major, minor, patch] = handlebarsVersion
      .split('.')
      .map((part) => parseInt(part, 10));

    const toComparableNumber = (
      majorPart: number,
      minorPart: number,
      patchPart: number,
    ): number => majorPart * 1000000 + minorPart * 1000 + patchPart;

    const resolvedVersionNumber = toComparableNumber(major, minor, patch);
    const vulnerableRangeLowerBound = toComparableNumber(4, 0, 0);
    const vulnerableRangeUpperBound = toComparableNumber(4, 7, 9);

    const isWithinVulnerableRange =
      resolvedVersionNumber >= vulnerableRangeLowerBound &&
      resolvedVersionNumber <= vulnerableRangeUpperBound;

    expect(isWithinVulnerableRange).toEqual(false);
  });
});
