import { describe, expect, it } from 'vitest';
import { computeValidationState } from './validationEngine';
import { createTestContext, withStageAnswers } from '../../../test-utils/projectContextFactory';

describe('validationEngine', () => {
  it('raises blockers when early stages are too incomplete', () => {
    const context = createTestContext();

    const result = computeValidationState(context);

    expect(result.blockers.length).toBeGreaterThan(0);
    expect(result.blockers.some((issue) => issue.id === 'VAL-DERIVED-001')).toBe(true);
    expect(result.readiness_score).toBeLessThan(70);
  });

  it('computes warnings and scores from architecture and design risks', () => {
    let context = createTestContext();
    context = withStageAnswers(context, 's1', {
      'project_basic.profile.name': 'Test Project',
      'project_basic.profile.type': 'web_application',
      'project_basic.system_category': 'business_system',
      'project_basic.technical_maturity': 'stable',
      'project_basic.existing_codebase_level': 'partial',
      'project_basic.profile.timeline': '2026-04-01 ~ 2026-08-01',
      'project_basic.profile.team_size': 4,
      'project_basic.compliance.data_sensitivity': 'confidential',
      'project_basic.integration.level': 'mixed',
      'project_basic.artifact.readiness': 'ready_for_codegen',
      'project_basic.governance.ai_execution_boundary': 'approved_models_only',
    });
    context = withStageAnswers(context, 's2', {
      'architecture.pattern.style': 'microservices',
      'backend.runtime.platform': 'nodejs',
      'frontend.framework.choice': 'react',
      'database.primary.engine': 'postgresql',
      'api.style.type': 'restful',
      'security.authentication.pattern': 'oauth_oidc',
      'architecture.communication.style': 'rest',
      'deployment.model': 'containerized',
      'architecture.hosting.platform': 'azure',
      'integration.strategy': 'event_driven',
      'observability.baseline': ['logs', 'metrics'],
      'ai_collaboration.boundary_summary': 'analysis_and_code_with_review',
    });
    context = withStageAnswers(context, 's3', {
      repo_structure: 'polyrepo',
      code_structure: 'feature_first',
      module_boundary_definition: 'service-a handles ingestion, service-b handles orchestration',
      'ci_cd.workflow': 'manual_with_checks',
      'logging.strategy': 'text_logs',
      'monitoring.strategy': 'health_checks_only',
      test_coverage_target: 65,
    });

    const result = computeValidationState(context);

    expect(result.blockers).toHaveLength(0);
    expect(result.warnings.length).toBeGreaterThan(0);
    expect(result.warnings.some((issue) => issue.id === 'VAL-DERIVED-004')).toBe(true);
    expect(result.warnings.some((issue) => issue.id === 'VAL-DERIVED-005')).toBe(true);
    expect(result.owner_due_matrix.length).toBe(result.warnings.length);
    expect(result.risk_score).toBeGreaterThan(40);
  });
});
