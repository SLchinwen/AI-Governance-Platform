import { describe, expect, it } from 'vitest';
import { buildArtifacts, buildS7Handoff, buildTechStackArtifact } from './artifactEngine';
import { createTestContext, withStageAnswers } from '../../../test-utils/projectContextFactory';

describe('artifactEngine', () => {
  it('builds selected artifacts with expected preview content', () => {
    let context = createTestContext();
    context = {
      ...context,
      review: {
        ...context.review,
        review_version: 'review-v2.1.0',
        version_status: 'approved',
        ready_for_handoff: true,
      },
      validation: {
        ...context.validation,
        readiness_score: 84,
        risk_score: 26,
        confidence_score: 81,
        blockers: [],
        warnings: [],
      },
    };
    context = withStageAnswers(context, 's1', {
      'project_basic.profile.type': 'web_application',
      'project_basic.system_category': 'business_system',
    });
    context = withStageAnswers(context, 's2', {
      'backend.runtime.platform': 'nodejs',
      'frontend.framework.choice': 'react',
      'database.primary.engine': 'postgresql',
      'api.style.type': 'restful',
      'security.authentication.pattern': 'jwt_bearer',
      'architecture.pattern.style': 'modular_monolith',
      'integration.strategy': 'sync_api',
    });
    context = withStageAnswers(context, 's3', {
      repo_structure: 'monorepo',
      code_structure: 'feature_first',
      'ci_cd.workflow': 'github_actions',
      'logging.strategy': 'structured_json',
      'monitoring.strategy': 'apm_dashboard_alerts',
      test_coverage_target: 80,
      module_boundary_definition: 'frontend consumes application services through typed contracts',
    });
    context = withStageAnswers(context, 's6', {
      'output.assets.selected': ['tech-stack.json', 'ai-context.md', 'readiness-report.md'],
    });

    const techStack = buildTechStackArtifact(context) as {
      generated_from_version: string;
      stack: { frontend_framework: string; authentication_pattern: string };
    };
    const artifacts = buildArtifacts(context);

    expect(techStack.generated_from_version).toBe('review-v2.1.0');
    expect(techStack.stack.frontend_framework).toBe('react');
    expect(techStack.stack.authentication_pattern).toBe('jwt_bearer');
    expect(Object.keys(artifacts)).toEqual(['tech-stack.json', 'ai-context.md', 'readiness-report.md']);
    expect(artifacts['ai-context.md'].preview).toContain('# AI Development Governance Platform');
    expect(artifacts['readiness-report.md'].preview).toContain('## Summary');
  });

  it('builds machine-consumable s7 handoff from generated artifacts', () => {
    let context = createTestContext();
    context = {
      ...context,
      review: {
        ...context.review,
        review_version: 'review-v2.1.0',
        version_status: 'approved',
      },
      validation: {
        ...context.validation,
        readiness_score: 79,
        risk_score: 30,
        confidence_score: 76,
        blockers: [],
        warnings: [
          {
            id: 'WARN-1',
            level: 'warning',
            stage: 's3',
            title: 'Sample warning',
            message: 'Need follow-up.',
          },
        ],
      },
    };
    context = withStageAnswers(context, 's6', {
      'output.assets.selected': ['tech-stack.json', 'adr.md', 'cursor-rules.mdc'],
    });

    const handoff = buildS7Handoff(context);

    expect(handoff.stage).toBe('S6');
    expect(handoff.approved_version).toBe('review-v2.1.0');
    expect(handoff.validation_summary.warning_count).toBe(1);
    expect(handoff.output_targets).toEqual([
      'tech-stack.json',
      'adr.md',
      'cursor-rules.mdc',
    ]);
    expect(handoff.outputs['tech-stack.json']).toContain('"generated_from_version": "review-v2.1.0"');
  });
});
