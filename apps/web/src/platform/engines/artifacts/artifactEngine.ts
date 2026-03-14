import type { ArtifactRecord, ProjectContext } from '../../types/projectContext';

function getSelectedArtifacts(context: ProjectContext) {
  const selected = context.stages.s6.answers['output.assets.selected'];
  return Array.isArray(selected) ? selected.map(String) : [];
}

export function buildTechStackArtifact(context: ProjectContext) {
  const s1 = context.stages.s1.answers;
  const s2 = context.stages.s2.answers;
  const s3 = context.stages.s3.answers;

  return {
    project_id: context.project_id,
    project_name: context.project_name,
    generated_from_version: context.review.review_version,
    review_status: context.review.version_status,
    readiness_score: context.validation.readiness_score,
    stack: {
      project_type: s1['project_basic.profile.type'] ?? '',
      system_category: s1['project_basic.system_category'] ?? '',
      backend_platform: s2['backend.runtime.platform'] ?? '',
      frontend_framework: s2['frontend.framework.choice'] ?? '',
      database_engine: s2['database.primary.engine'] ?? '',
      api_style: s2['api.style.type'] ?? '',
      architecture_style: s2['architecture.pattern.style'] ?? '',
      integration_strategy: s2['integration.strategy'] ?? '',
      repo_structure: s3['repo_structure'] ?? '',
      code_structure: s3['code_structure'] ?? '',
      test_coverage_target: s3['test_coverage_target'] ?? '',
    },
  };
}

export function buildAiContextArtifact(context: ProjectContext) {
  const s1 = context.stages.s1.answers;
  const s2 = context.stages.s2.answers;
  const s3 = context.stages.s3.answers;

  return `# ${context.project_name}

## Project Context
- Project ID: ${context.project_id}
- Current Stage: ${context.current_stage}
- Review Version: ${context.review.review_version}
- Review Status: ${context.review.version_status}

## Discovery Baseline
- Project Type: ${String(s1['project_basic.profile.type'] ?? '')}
- System Category: ${String(s1['project_basic.system_category'] ?? '')}
- Technical Maturity: ${String(s1['project_basic.technical_maturity'] ?? '')}
- Data Sensitivity: ${String(s1['project_basic.compliance.data_sensitivity'] ?? '')}
- AI Boundary: ${String(s1['project_basic.governance.ai_execution_boundary'] ?? s2['ai_collaboration.boundary_summary'] ?? '')}

## Architecture
- Architecture Style: ${String(s2['architecture.pattern.style'] ?? '')}
- Backend: ${String(s2['backend.runtime.platform'] ?? '')}
- Frontend: ${String(s2['frontend.framework.choice'] ?? '')}
- Database: ${String(s2['database.primary.engine'] ?? '')}
- API Style: ${String(s2['api.style.type'] ?? '')}
- Hosting Platform: ${String(s2['architecture.hosting.platform'] ?? '')}

## Design Constraints
- Repo Structure: ${String(s3['repo_structure'] ?? '')}
- Code Structure: ${String(s3['code_structure'] ?? '')}
- Module Boundaries: ${String(s3['module_boundary_definition'] ?? '')}
- Test Coverage Target: ${String(s3['test_coverage_target'] ?? '')}

## Governance Notes
- Readiness Score: ${context.validation.readiness_score}
- Risk Score: ${context.validation.risk_score}
- Confidence Score: ${context.validation.confidence_score}
- Unresolved Warnings: ${context.validation.warnings.length}

## Review Notes
${context.review.notes.length > 0 ? context.review.notes.map((note) => `- ${note}`).join('\n') : '- None'}
`;
}

export function buildReadinessReportArtifact(context: ProjectContext) {
  return `# Readiness Report

## Summary
- Project: ${context.project_name}
- Review Version: ${context.review.review_version}
- Review Status: ${context.review.version_status}
- Readiness Score: ${context.validation.readiness_score}
- Risk Score: ${context.validation.risk_score}
- Confidence Score: ${context.validation.confidence_score}

## Blockers
${context.validation.blockers.length > 0 ? context.validation.blockers.map((item) => `- ${item.title}: ${item.message}`).join('\n') : '- None'}

## Warnings
${context.validation.warnings.length > 0 ? context.validation.warnings.map((item) => `- ${item.title}: ${item.message}`).join('\n') : '- None'}

## Owner / Due Matrix
${context.validation.owner_due_matrix.length > 0 ? context.validation.owner_due_matrix.map((item) => `- ${item.owner} | ${item.stage} | ${item.due} | ${item.item}`).join('\n') : '- None'}

## Review Focus
${context.review.notes.length > 0 ? context.review.notes.map((note) => `- ${note}`).join('\n') : '- None'}
`;
}

export function buildProjectArchitectureArtifact(context: ProjectContext) {
  const s2 = context.stages.s2.answers;
  const s3 = context.stages.s3.answers;

  return `# Project Architecture

## Architecture Decisions
- Style: ${String(s2['architecture.pattern.style'] ?? '')}
- Communication: ${String(s2['architecture.communication.style'] ?? '')}
- Deployment Model: ${String(s2['deployment.model'] ?? '')}
- Hosting Platform: ${String(s2['architecture.hosting.platform'] ?? '')}
- Integration Strategy: ${String(s2['integration.strategy'] ?? '')}
- Observability: ${Array.isArray(s2['observability.baseline']) ? s2['observability.baseline'].join(', ') : ''}

## Implementation Design
- Repo Structure: ${String(s3['repo_structure'] ?? '')}
- Code Structure: ${String(s3['code_structure'] ?? '')}

## Module Boundary Definition
${String(s3['module_boundary_definition'] ?? '')}
`;
}

export function buildImplementationChecklistArtifact(context: ProjectContext) {
  const checklist = [
    `Review approved: ${context.review.ready_for_handoff ? 'Yes' : 'No'}`,
    `Readiness >= 70: ${context.validation.readiness_score >= 70 ? 'Yes' : 'No'}`,
    `Blockers cleared: ${context.validation.blockers.length === 0 ? 'Yes' : 'No'}`,
    `Warnings <= 3: ${context.validation.warnings.length <= 3 ? 'Yes' : 'No'}`,
    `Version locked: ${context.review.review_version !== '' ? 'Yes' : 'No'}`,
  ];

  return `# Implementation Checklist

${checklist.map((item) => `- [ ] ${item}`).join('\n')}

## Follow-up Notes
${context.review.notes.length > 0 ? context.review.notes.map((note) => `- ${note}`).join('\n') : '- None'}
`;
}

function toArtifactRecord(id: string, title: string, type: 'json' | 'markdown', preview: string, updatedAt: string): ArtifactRecord {
  return {
    id,
    title,
    type,
    generated: true,
    preview,
    updated_at: updatedAt,
  };
}

export function buildArtifacts(context: ProjectContext): Record<string, ArtifactRecord> {
  const selected = getSelectedArtifacts(context);
  const updatedAt = context.meta.last_updated_at;
  const artifacts: Record<string, ArtifactRecord> = {};

  if (selected.includes('tech-stack.json')) {
    artifacts['tech-stack.json'] = toArtifactRecord(
      'tech-stack',
      'tech-stack.json',
      'json',
      JSON.stringify(buildTechStackArtifact(context), null, 2),
      updatedAt,
    );
  }
  if (selected.includes('ai-context.md')) {
    artifacts['ai-context.md'] = toArtifactRecord('ai-context', 'ai-context.md', 'markdown', buildAiContextArtifact(context), updatedAt);
  }
  if (selected.includes('readiness-report.md')) {
    artifacts['readiness-report.md'] = toArtifactRecord(
      'readiness-report',
      'readiness-report.md',
      'markdown',
      buildReadinessReportArtifact(context),
      updatedAt,
    );
  }
  if (selected.includes('project-architecture.md')) {
    artifacts['project-architecture.md'] = toArtifactRecord(
      'project-architecture',
      'project-architecture.md',
      'markdown',
      buildProjectArchitectureArtifact(context),
      updatedAt,
    );
  }
  if (selected.includes('implementation-checklist.md')) {
    artifacts['implementation-checklist.md'] = toArtifactRecord(
      'implementation-checklist',
      'implementation-checklist.md',
      'markdown',
      buildImplementationChecklistArtifact(context),
      updatedAt,
    );
  }

  return artifacts;
}

export function buildS7Handoff(context: ProjectContext) {
  const artifacts = buildArtifacts(context);
  const outputs = Object.fromEntries(Object.entries(artifacts).map(([key, value]) => [key, value.preview ?? '']));

  return {
    project_id: context.project_id,
    project_name: context.project_name,
    stage: 'S6',
    approved_version: context.review.review_version,
    review_status: context.review.version_status,
    validation_summary: {
      readiness_score: context.validation.readiness_score,
      risk_score: context.validation.risk_score,
      confidence_score: context.validation.confidence_score,
      blocker_count: context.validation.blockers.length,
      warning_count: context.validation.warnings.length,
    },
    unresolved_warnings: context.validation.warnings,
    output_targets: Object.keys(artifacts),
    outputs,
    handoff: {
      next_stage: 'S7',
      generated_at: context.meta.last_updated_at,
    },
  };
}
