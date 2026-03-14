import { describe, expect, it } from 'vitest';
import { stageSchemas } from '../../schemas/stageSchemas';
import { getRequiredCompletion, getVisibleFields } from './questionnaireEngine';

describe('questionnaireEngine', () => {
  it('shows conditional fields when answers match conditions', () => {
    const s1Schema = stageSchemas.find((schema) => schema.key === 's1');
    expect(s1Schema).toBeDefined();

    const fields = getVisibleFields(s1Schema!, {
      'project_basic.compliance.data_sensitivity': 'restricted',
    });

    expect(fields.some((field) => field.id === 'project_basic.governance.ai_execution_boundary')).toBe(true);
  });

  it('counts only visible required fields in completion', () => {
    const s2Schema = stageSchemas.find((schema) => schema.key === 's2');
    expect(s2Schema).toBeDefined();

    const result = getRequiredCompletion(s2Schema!, {
      'architecture.pattern.style': 'layered',
      'backend.runtime.platform': 'nodejs',
      'frontend.framework.choice': 'react',
      'database.primary.engine': 'postgresql',
      'api.style.type': 'restful',
      'security.authentication.pattern': 'jwt_bearer',
      'deployment.model': 'paas',
      'architecture.hosting.platform': 'azure',
      'integration.strategy': 'sync_api',
      'observability.baseline': ['logs', 'metrics'],
      'ai_collaboration.boundary_summary': 'analysis_only',
    });

    expect(result.requiredFields.some((field) => field.id === 'architecture.communication.style')).toBe(false);
    expect(result.completedFields).toHaveLength(result.requiredFields.length);
    expect(result.percent).toBe(100);
  });
});
