import { describe, expect, it } from 'vitest';
import { computeReviewState } from './reviewEngine';
import { createTestContext, withStageAnswers } from '../../../test-utils/projectContextFactory';

describe('reviewEngine', () => {
  it('marks review as ready for handoff when all review gates pass', () => {
    let context = createTestContext();
    context = {
      ...context,
      validation: {
        ...context.validation,
        readiness_score: 82,
        risk_score: 24,
        confidence_score: 80,
        blockers: [],
        warnings: [],
      },
    };
    context = withStageAnswers(context, 's5', {
      'review.architect.decision': 'approved',
      'review.architect.reviewer': 'Architect',
      'review.architect.note': 'Architecture is acceptable.',
      'review.pm.decision': 'confirmed',
      'review.pm.reviewer': 'PM',
      'review.pm.note': 'Delivery scope is confirmed.',
      'review.version_lock.version': 'review-v2.1.0',
      'review.version_lock.status': 'approved',
    });

    const result = computeReviewState(context);

    expect(result.ready_for_handoff).toBe(true);
    expect(result.version_status).toBe('approved');
    expect(result.checklist.every((item) => item.pass)).toBe(true);
  });

  it('keeps review blocked when a reviewer requests changes', () => {
    let context = createTestContext();
    context = {
      ...context,
      validation: {
        ...context.validation,
        readiness_score: 80,
        risk_score: 65,
        confidence_score: 72,
        blockers: [],
        warnings: [],
      },
    };
    context = withStageAnswers(context, 's5', {
      'review.architect.decision': 'return_for_fix',
      'review.pm.decision': 'confirmed',
      'review.version_lock.version': 'review-v2.1.0',
      'review.version_lock.status': 'return_for_fix',
    });

    const result = computeReviewState(context);

    expect(result.ready_for_handoff).toBe(false);
    expect(result.notes.some((note) => note.includes('退回修正'))).toBe(true);
    expect(result.version_status).toBe('return_for_fix');
  });
});
