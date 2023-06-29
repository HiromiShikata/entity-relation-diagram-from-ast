import { execSync } from 'child_process';

describe('commander program', () => {
  it('should output contents', async () => {
    const output = execSync(
      'npx ts-node ./src/adapter/entry-points/cli/index.ts ./node_modules/ast-to-entity-definitions/testdata/src/domain/entities',
    ).toString();
    const expectedContent = `erDiagram
  Group {
    string id
    string name
    string category
  }
  Item {
    string id
    string name
  }
  User {
    string id
    string name
    boolean deactivated
    Date createdAt
  }
  UserAddress {
    string id
    User userId
    string address
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
    string id
    User userId
    Group groupId
  }

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
