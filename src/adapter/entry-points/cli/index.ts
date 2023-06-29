#!/usr/bin/env node
//./src/index.ts
import { Command } from 'commander';
import { GenerateEntityRelationDiagramUseCase } from '../../../domain/usecases/GenerateEntityRelationDiagramUseCase';
import { AstEntityDefinitionRepository } from '../../repositories/AstEntityDefinitionRepository';
const program = new Command();
program
  .name('EntityRelationDiagramFromAst')
  .argument('<inputPath>', 'Path to domain entities dir.')
  .description('Generate Entity Relation Diagram from entity definitions')
  .action(async (inputPath: string) => {
    const useCase = new GenerateEntityRelationDiagramUseCase(
      new AstEntityDefinitionRepository(),
    );
    const res = await useCase.run(inputPath);
    console.log(res);
  });
program.parse(process.argv);
