// ./src/domain/usecases/GenerateEntityRelationDiagramUseCase.test.ts
import { GenerateEntityRelationDiagramUseCase } from './GenerateEntityRelationDiagramUseCase';
import { EntityDefinitionRepository } from './adapter-interfaces/EntityDefinitionRepository';
import { EntityDefinition } from '../entities/EntityDefinition';
import { EntityPropertyDefinitionReferencedObject } from '../entities/EntityPropertyDefinition';

jest.mock('./adapter-interfaces/EntityDefinitionRepository');

describe('GenerateEntityRelationDiagramUseCase', () => {
  describe('run', () => {
    it('should generate Mermaid ERD string', async () => {
      const mockEntityDefinitions: EntityDefinition[] = [
        {
          name: 'User',
          properties: [
            {
              isReference: false,
              name: 'id',
              propertyType: 'string',
              isNullable: false,
              isUnique: false,
              isArray: false,
              acceptableValues: null,
            },
            {
              isReference: false,
              name: 'name',
              propertyType: 'string',
              isNullable: false,
              isUnique: false,
              isArray: false,
              acceptableValues: null,
            },
          ],
        },
        {
          name: 'Group',
          properties: [
            {
              isReference: false,
              name: 'id',
              propertyType: 'string',
              isNullable: false,
              isUnique: false,
              isArray: false,
              acceptableValues: null,
            },
            {
              isReference: false,
              name: 'name',
              propertyType: 'string',
              isNullable: false,
              isUnique: false,
              isArray: false,
              acceptableValues: null,
            },
          ],
        },
        {
          name: 'UserGroup',
          properties: [
            {
              isReference: false,
              name: 'id',
              propertyType: 'string',
              isNullable: false,
              isUnique: false,
              isArray: false,
              acceptableValues: null,
            },
            {
              isReference: true,
              name: 'userId',
              targetEntityDefinitionName: 'User',
              isUnique: false,
              isNullable: false,
            },
            {
              isReference: true,
              name: 'groupId',
              targetEntityDefinitionName: 'Group',
              isUnique: false,
              isNullable: false,
            },
          ],
        },
        {
          name: 'UserAddress',
          properties: [
            {
              isReference: false,
              name: 'id',
              propertyType: 'string',
              isNullable: false,
              isUnique: false,
              isArray: false,
              acceptableValues: null,
            },
            {
              isReference: true,
              name: 'userId',
              targetEntityDefinitionName: 'User',
              isUnique: true,
              isNullable: false,
            },
          ],
        },
      ];

      const { entityDefinitionRepository, useCase } =
        createUseCaseAndMockRepositories(mockEntityDefinitions);

      const path = 'test/path';
      const result = await useCase.run(path);

      expect(
        entityDefinitionRepository.findEntityDefinitions,
      ).toHaveBeenCalledWith(path);

      const expectedResult = `erDiagram
  User {
    string id
    string name
  }
  Group {
    string id
    string name
  }
  UserGroup {
    string id
    User userId
    Group groupId
  }
  UserAddress {
    string id
    User userId
  }

  UserGroup zero or many --1 User : "n?"
  UserGroup zero or many --1 Group : "n?"
  UserAddress zero or one --1 User : "1?"`;
      expect(result).toEqual(expectedResult);
    });
  });
  describe('entityPropertyDefinitionReferencedObjectToMermaidErDiagramString', () => {
    it.each`
      entityName       | property                                                                                       | expected
      ${'UserGroup'}   | ${{ name: 'userId', targetEntityDefinitionName: 'User', isUnique: false, isNullable: false }}  | ${'  UserGroup zero or many --1 User : "n?"'}
      ${'UserGroup'}   | ${{ name: 'groupId', targetEntityDefinitionName: 'Group', isUnique: false, isNullable: true }} | ${'  UserGroup zero or many --1 Group : "n?"'}
      ${'UserAddress'} | ${{ name: 'userId', targetEntityDefinitionName: 'User', isUnique: true, isNullable: false }}   | ${'  UserAddress zero or one --1 User : "1?"'}
    `(
      'should return the correct string for $entityName.$property',
      ({
        entityName,
        property,
        expected,
      }: {
        entityName: string;
        property: Omit<EntityPropertyDefinitionReferencedObject, 'isReference'>;
        expected: string;
      }) => {
        const { useCase } = createUseCaseAndMockRepositories();
        const result = useCase[
          'entityPropertyDefinitionReferencedObjectToMermaidErDiagramString'
        ](entityName, { ...property, isReference: true });
        expect(result).toEqual(expected);
      },
    );
  });

  const createUseCaseAndMockRepositories = (
    entityDefinitions: EntityDefinition[] = [],
  ) => {
    const entityDefinitionRepository =
      createMockEntityDefinitionRepository(entityDefinitions);
    const useCase = new GenerateEntityRelationDiagramUseCase(
      entityDefinitionRepository,
    );
    return {
      entityDefinitionRepository,
      useCase,
    };
  };

  const createMockEntityDefinitionRepository = (
    entityDefinitions: EntityDefinition[],
  ) => {
    const repository: EntityDefinitionRepository = {
      findEntityDefinitions: async (
        _path: string,
      ): Promise<EntityDefinition[]> => {
        return entityDefinitions;
      },
    };
    return {
      findEntityDefinitions: jest.fn((path: string) =>
        repository.findEntityDefinitions(path),
      ),
    };
  };
});
