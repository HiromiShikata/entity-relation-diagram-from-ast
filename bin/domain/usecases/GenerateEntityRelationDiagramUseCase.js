"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GenerateEntityRelationDiagramUseCase = void 0;
class GenerateEntityRelationDiagramUseCase {
    constructor(entityDefinitionRepository) {
        this.entityDefinitionRepository = entityDefinitionRepository;
        this.run = async (path) => {
            const entityDefinitions = await this.entityDefinitionRepository.findEntityDefinitions(path);
            let erd = 'erDiagram\n';
            const entityDefinitionsStrings = entityDefinitions
                .map((entityDefinition) => {
                const properties = entityDefinition.properties
                    .map((property) => {
                    if (property.isReference) {
                        const reference = property;
                        return `${reference.targetEntityDefinitionName} ${reference.name}`;
                    }
                    else {
                        return `${property.propertyType} ${property.name}`;
                    }
                })
                    .join('\n    ');
                return `  ${entityDefinition.name} {\n    ${properties}\n  }`;
            })
                .join('\n');
            const relationships = entityDefinitions
                .filter((entityDefinition) => entityDefinition.properties.some((property) => property.isReference))
                .map((entityDefinition) => {
                const referenceProperties = entityDefinition.properties.filter((property) => property.isReference);
                return referenceProperties
                    .map((referenceProperty) => {
                    const targetEntityDefinition = entityDefinitions.find((entityDefinition) => entityDefinition.name ===
                        referenceProperty.targetEntityDefinitionName);
                    if (!targetEntityDefinition) {
                        return '';
                    }
                    return this.entityPropertyDefinitionReferencedObjectToMermaidErDiagramString(entityDefinition.name, referenceProperty);
                })
                    .join('\n');
            })
                .join('\n');
            erd += `${entityDefinitionsStrings}\n\n${relationships}`;
            return erd;
        };
        this.entityPropertyDefinitionReferencedObjectToMermaidErDiagramString = (entityName, property) => {
            const nullableEntity = entityName;
            const nonNullableEntity = property.targetEntityDefinitionName;
            const relationship = property.isUnique ? 'zero or one' : 'zero or many';
            const relationshipLabel = property.isUnique ? '1?' : 'n?';
            return `  ${nullableEntity} ${relationship} --1 ${nonNullableEntity} : "${relationshipLabel}"`;
        };
    }
}
exports.GenerateEntityRelationDiagramUseCase = GenerateEntityRelationDiagramUseCase;
//# sourceMappingURL=GenerateEntityRelationDiagramUseCase.js.map