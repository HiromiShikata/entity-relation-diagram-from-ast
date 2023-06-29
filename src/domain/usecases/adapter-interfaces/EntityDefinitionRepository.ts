// ./src/domain/usecases/GenerateEntityRelationDiagramUseCase.ts
import { EntityDefinition } from '../../entities/EntityDefinition';

export interface EntityDefinitionRepository {
  findEntityDefinitions(path: string): Promise<EntityDefinition[]>;
}
