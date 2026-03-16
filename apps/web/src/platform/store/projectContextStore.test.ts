import { describe, expect, it } from 'vitest';
import { stageSchemas } from '../schemas/stageSchemas';
import { createInitialProjectContext, getStageProgress } from './projectContextStore';
import { withStageAnswers } from '../../test-utils/projectContextFactory';

describe('projectContextStore helpers', () => {
  it('creates initial context with derived validation, review, and publish state', () => {
    const context = createInitialProjectContext();

    expect(context.current_stage).toBe('s1');
    expect(context.stages.s4.derived).toHaveProperty('readiness_score');
    expect(context.stages.s5.handoff).toHaveProperty('approved_review_packet');
    expect(context.stages.s6.handoff).toHaveProperty('s7_handoff');
    expect(context.stages.s7.handoff).toHaveProperty('publish_packet');
    expect(Array.isArray(context.publish.checklist)).toBe(true);
  });

  it('calculates stage progress from answered required fields', () => {
    let context = createInitialProjectContext();
    const s1RequiredCount = stageSchemas.find((schema) => schema.key === 's1')?.fields.filter((field) => field.required).length;
    expect(s1RequiredCount).toBeDefined();

    context = withStageAnswers(context, 's1', {
      'project_basic.profile.name': 'AI Development Governance Platform',
      'project_basic.profile.type': 'web_application',
      'project_basic.system_category': 'business_system',
      'project_basic.technical_maturity': 'stable',
      'project_basic.existing_codebase_level': 'partial',
      'project_basic.profile.timeline': '2026-04-01 ~ 2026-08-01',
      'project_basic.profile.team_size': 6,
      'project_basic.compliance.data_sensitivity': 'restricted',
      'project_basic.integration.level': 'mixed',
      'project_basic.artifact.readiness': 'ready_for_codegen',
      'project_basic.governance.ai_execution_boundary': 'approved_models_only',
      'project_basic.tech_stack_adoption_mode': 'full_standard',
    });

    const progress = getStageProgress(context);
    const s1Progress = progress.find((item) => item.stage === 's1');

    expect(s1Progress).toBeDefined();
    expect(s1Progress?.completed).toBe(s1RequiredCount);
    expect(s1Progress?.total).toBe(s1RequiredCount);
  });
});
