import { execSync } from 'child_process';

describe('commander program', () => {
  it('should output contents', async () => {
    const output = execSync(
      'npx ts-node ./src/adapter/entry-points/cli/index.ts ./node_modules/ast-to-entity-definitions/testdata/src/domain/entities',
    ).toString();
    const expectedContent = `erDiagram
  Administrator {
    Id id
    User userId
    string role
    boolean deactivated
    struct cachedDetail
    Date createdAt
  }
  Group {
    Id id
    string name
    string category
  }
  Item {
    Id id
    string name
    typedStruct content
    typedStruct unionedContent
    typedStruct combined
  }
  User {
    Id id
    string name
    boolean deactivated
    Date createdAt
    User parentUserId
  }
  UserAddress {
    Id id
    User userId
    string address
    string stringArray
    number numberArray
    boolean booleanArray
    Date dateArray
    string stringLiteral
    number numberLiteral
    boolean booleanLiteral
    string nullableWithNullUnion
    string nullableWithUndefined
    string nullableWithQuestionMark
    string unionLiteralsWithSameTypeNullable
    string unionLiteralsWithSameTypeQuestionMark
    string unionLiteralsWithSameType
  }
  UserGroup {
    Id id
    User userId
    Group groupId
  }

  Administrator zero or many --1 User : "n?"
  User zero or many --1 User : "n?"
  UserAddress zero or one --1 User : "1?"
  UserGroup zero or many --1 User : "n?"
  UserGroup zero or many --1 Group : "n?"`;
    expect(output.trim()).toBe(expectedContent);
  });

  it('should output help', () => {
    const output = execSync(
      'npx ts-node ./src/adapter/entry-points/cli/index.ts --help',
      {
        encoding: 'utf8',
        maxBuffer: 1024 * 1000,
      },
    );
    expect(output.trim())
      .toBe(`Usage: EntityRelationDiagramFromAst [options] <inputPath>

Generate Entity Relation Diagram from entity definitions

Arguments:
  inputPath   Path to domain entities dir.

Options:
  -h, --help  display help for command`);
  });
});
