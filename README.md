# entity-relation-diagram-from-ast

[![CircleCI](https://dl.circleci.com/status-badge/img/gh/HiromiShikata/entity-relation-diagram-from-ast/tree/main.svg?style=svg)](https://dl.circleci.com/status-badge/redirect/gh/HiromiShikata/entity-relation-diagram-from-ast/tree/main)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
[![semantic-release: angular](https://img.shields.io/badge/semantic--release-angular-e10079?logo=semantic-release)](https://github.com/semantic-release/semantic-release)

A command-line tool to output entity relation diagram with Mermaid format from AST.

```mermaid
erDiagram
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
  UserGroup zero or many --1 Group : "n?"
```

## Installation

```bash
npm install -g entity-relation-diagram-from-ast
```

## Usage

```bash
npx entity-relation-diagram-from-ast /path/to/dir/for/types/of/entity
```

## Contributing

Contributions are welcome! Please create a pull request for any changes or bug fixes.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Authors

- [HiromiShikata](https://github.com/HiromiShikata)

## Acknowledgements

This project was inspired by [ast-to-entity-definitions](https://github.com/pbojinov/ast-to-entity-definitions).

## FAQs

#### What is the format of the output?

The output format is [Mermaid](https://mermaid-js.github.io/mermaid/#/).

#### Can I output the diagram in another format?

Not currently, but this may be added in future updates.

## Troubleshooting

Please refer to the project's [issues page](https://github.com/HiromiShikata/entity-relation-diagram-from-ast/issues) for any known issues.

## Roadmap

Future updates to this project may include:

- More output format options
- Improved error handling and messaging
- Additional customization options
