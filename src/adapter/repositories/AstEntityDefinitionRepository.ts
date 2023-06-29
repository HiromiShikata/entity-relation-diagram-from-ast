// ./src/adapter/repositories/AstEntityDefinitionRepository.ts
import { EntityDefinition } from '../../domain/entities/EntityDefinition';
import { getEntityDefinitions } from 'ast-to-entity-definitions/bin/adapter/entry-points/function/index';
import { EntityDefinitionRepository } from '../../domain/usecases/adapter-interfaces/EntityDefinitionRepository';

export class AstEntityDefinitionRepository
  implements EntityDefinitionRepository
{
  findEntityDefinitions = async (path: string): Promise<EntityDefinition[]> => {
    return await getEntityDefinitions(path);
  };
}
