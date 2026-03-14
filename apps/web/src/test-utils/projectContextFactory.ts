import { createInitialProjectContext } from '../platform/store/projectContextStore';
import type { FieldValue, ProjectContext, StageKey } from '../platform/types/projectContext';

export function createTestContext(): ProjectContext {
  return createInitialProjectContext();
}

export function withStageAnswers(
  context: ProjectContext,
  stage: StageKey,
  answers: Record<string, FieldValue>,
): ProjectContext {
  return {
    ...context,
    stages: {
      ...context.stages,
      [stage]: {
        ...context.stages[stage],
        answers: {
          ...context.stages[stage].answers,
          ...answers,
        },
      },
    },
  };
}
