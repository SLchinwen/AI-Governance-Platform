import { describe, expect, it } from 'vitest';
import { buildPublishManifest, buildPrBody, computePublishState } from './publishEngine';
import type { ArtifactRecord } from '../../types/projectContext';
import { createTestContext, withStageAnswers } from '../../../test-utils/projectContextFactory';

function createArtifact(id: string, title: string, type: 'json' | 'markdown'): ArtifactRecord {
  return {
    id,
    title,
    type,
    generated: true,
    preview: `${title} preview`,
    updated_at: new Date().toISOString(),
  };
}

describe('publishEngine', () => {
  it('computes publish readiness and reviewer suggestions', () => {
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
        risk_score: 35,
        blockers: [],
      },
      artifacts: {
        'tech-stack.json': createArtifact('tech-stack', 'tech-stack.json', 'json'),
        'ai-context.md': createArtifact('ai-context', 'ai-context.md', 'markdown'),
        'readiness-report.md': createArtifact('readiness-report', 'readiness-report.md', 'markdown'),
      },
    };
    context = withStageAnswers(context, 's2', {
      'deployment.model': 'containerized',
    });
    context = withStageAnswers(context, 's7', {
      'publish.repo.base_branch': 'master',
      'publish.repo.publish_branch': 'release/prj-001-review-v2.1.0',
      'publish.release.tag': 'review-v2.1.0',
      'publish.pr.title': 'docs: publish approved governance assets for PRJ-001',
      'publish.reviewers.list': 'Architect, PM, DevOps',
      'publish.ai.disclosure_level': 'recommended',
      'publish.ai.tools': 'Cursor, GPT',
      'publish.ai.disclosure': 'AI assisted with draft generation and human review.',
      'publish.change.summary': 'Publish approved governance artifacts.',
    });

    const result = computePublishState(context);

    expect(result.publish_ready).toBe(true);
    expect(result.reviewer_suggestions.some((item) => item.includes('DevOps'))).toBe(true);
    expect(result.checklist.every((item) => item.pass)).toBe(true);
  });

  it('builds manifest and PR body from current publish context', () => {
    let context = createTestContext();
    context = {
      ...context,
      review: {
        ...context.review,
        review_version: 'review-v2.1.0',
        version_status: 'approved',
        ready_for_handoff: true,
        notes: ['Keep IaC in next sprint.'],
      },
      artifacts: {
        'tech-stack.json': createArtifact('tech-stack', 'tech-stack.json', 'json'),
        'ai-context.md': createArtifact('ai-context', 'ai-context.md', 'markdown'),
        'readiness-report.md': createArtifact('readiness-report', 'readiness-report.md', 'markdown'),
      },
    };
    context = withStageAnswers(context, 's7', {
      'publish.repo.base_branch': 'master',
      'publish.repo.publish_branch': 'release/prj-001-review-v2.1.0',
      'publish.release.tag': 'review-v2.1.0',
      'publish.pr.title': 'docs: publish approved governance assets for PRJ-001',
      'publish.reviewers.list': 'Architect, PM',
      'publish.ai.disclosure_level': 'required',
      'publish.ai.tools': 'Cursor, Claude',
      'publish.ai.disclosure': 'AI generated draft documents with human validation.',
      'publish.change.summary': 'Publish governance baseline for repository onboarding.',
    });

    const manifest = buildPublishManifest(context);
    const prBody = buildPrBody(context);

    expect(manifest.release.tag).toBe('review-v2.1.0');
    expect(manifest.reviewers).toEqual(['Architect', 'PM']);
    expect(prBody).toContain('Publish governance baseline for repository onboarding.');
    expect(prBody).toContain('Keep IaC in next sprint.');
  });
});
