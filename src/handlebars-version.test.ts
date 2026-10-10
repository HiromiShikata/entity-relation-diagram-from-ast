import * as fs from 'fs';
import * as path from 'path';

describe('handlebars dependency version in package-lock.json', () => {
  test('resolved handlebars version is not within the vulnerable range (>= 4.0.0, <= 4.7.9)', () => {
    const packageLockPath = path.join(__dirname, '..', 'package-lock.json');
    const packageLockContent = fs.readFileSync(packageLockPath, 'utf-8');
    const parsed = JSON.parse(packageLockContent);

    const handlebarsVersion: string =
      parsed.packages['node_modules/handlebars'].version;

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
