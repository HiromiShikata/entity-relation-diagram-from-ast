#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
//./src/index.ts
const commander_1 = require("commander");
const GenerateEntityRelationDiagramUseCase_1 = require("../../../domain/usecases/GenerateEntityRelationDiagramUseCase");
const AstEntityDefinitionRepository_1 = require("../../repositories/AstEntityDefinitionRepository");
const program = new commander_1.Command();
program
    .name('EntityRelationDiagramFromAst')
    .argument('<inputPath>', 'Path to domain entities dir.')
    .description('Generate Entity Relation Diagram from entity definitions')
    .action(async (inputPath) => {
    const useCase = new GenerateEntityRelationDiagramUseCase_1.GenerateEntityRelationDiagramUseCase(new AstEntityDefinitionRepository_1.AstEntityDefinitionRepository());
    const res = await useCase.run(inputPath);
    console.log(res);
});
program.parse(process.argv);
//# sourceMappingURL=index.js.map