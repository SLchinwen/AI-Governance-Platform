import type { ProjectContext, ReviewChecklistItem, ReviewState } from '../../types/projectContext';

function hasApproval(decision: string | undefined) {
  return decision === 'approved' || decision === 'approved_with_notes' || decision === 'confirmed' || decision === 'confirmed_with_notes';
}

function buildChecklist(context: ProjectContext): ReviewChecklistItem[] {
  const s5 = context.stages.s5.answers;
  return [
    {
      id: 'review-check-1',
      label: `0 個 blocker（目前 ${context.validation.blockers.length} 個）`,
      pass: context.validation.blockers.length === 0,
    },
    {
      id: 'review-check-2',
      label: `warning <= 3（目前 ${context.validation.warnings.length} 個）`,
      pass: context.validation.warnings.length <= 3,
    },
    {
      id: 'review-check-3',
      label: `readiness score >= 70（目前 ${context.validation.readiness_score}）`,
      pass: context.validation.readiness_score >= 70,
    },
    {
      id: 'review-check-4',
      label: '架構師主審已完成且同意通過',
      pass: hasApproval(String(s5['review.architect.decision'] ?? '')),
    },
    {
      id: 'review-check-5',
      label: 'PM 已完成確認且同意通過',
      pass: hasApproval(String(s5['review.pm.decision'] ?? '')),
    },
    {
      id: 'review-check-6',
      label: '審核版本號已指定',
      pass: String(s5['review.version_lock.version'] ?? '').trim() !== '',
    },
  ];
}

function buildNotes(context: ProjectContext) {
  const s5 = context.stages.s5.answers;
  const notes: string[] = [];

  if (context.validation.warnings.length > 3) {
    notes.push('warning 數量超過 Gate 建議值，建議先收斂再簽核。');
  }
  if (s5['review.architect.decision'] === 'meeting_required' || s5['review.pm.decision'] === 'meeting_required') {
    notes.push('至少一位審核角色標記需要討論，建議先安排會議，不要直接核准。');
  }
  if (s5['review.architect.decision'] === 'return_for_fix' || s5['review.pm.decision'] === 'return_for_fix') {
    notes.push('已有角色要求退回修正，應整理退回原因並回送前一階段負責人。');
  }
  if (context.validation.risk_score >= 60) {
    notes.push('目前 risk score 偏高，建議在版本鎖定前再次確認風險接受範圍。');
  }

  return notes;
}

export function computeReviewState(context: ProjectContext): ReviewState {
  const s5 = context.stages.s5.answers;
  const checklist = buildChecklist(context);
  const notes = buildNotes(context);
  const architectDecision = String(s5['review.architect.decision'] ?? 'pending') as ReviewState['architect_decision'];
  const pmDecision = String(s5['review.pm.decision'] ?? 'pending') as ReviewState['pm_decision'];
  const versionStatus = String(s5['review.version_lock.status'] ?? 'draft') as ReviewState['version_status'];

  const readyForHandoff =
    checklist.every((item) => item.pass) &&
    architectDecision !== 'meeting_required' &&
    architectDecision !== 'return_for_fix' &&
    pmDecision !== 'meeting_required' &&
    pmDecision !== 'return_for_fix';

  return {
    architect_decision: architectDecision,
    pm_decision: pmDecision,
    architect_reviewer: String(s5['review.architect.reviewer'] ?? ''),
    architect_note: String(s5['review.architect.note'] ?? ''),
    pm_reviewer: String(s5['review.pm.reviewer'] ?? ''),
    pm_note: String(s5['review.pm.note'] ?? ''),
    review_version: String(s5['review.version_lock.version'] ?? 'review-v2.0.0-alpha'),
    version_status: readyForHandoff ? 'approved' : versionStatus,
    version_note: String(s5['review.version_lock.note'] ?? ''),
    notes,
    checklist,
    ready_for_handoff: readyForHandoff,
  };
}

export function buildApprovedReviewPacket(context: ProjectContext) {
  const review = computeReviewState(context);
  const summary = context.validation.governance_adoption_summary;

  return {
    project_id: context.project_id,
    from_stage: 'S5',
    to_stage: 'S6',
    generated_at: context.meta.last_updated_at,
    review_status: review.version_status,
    architect_review: {
      decision: review.architect_decision,
      reviewer: review.architect_reviewer,
      note: review.architect_note,
    },
    pm_review: {
      decision: review.pm_decision,
      reviewer: review.pm_reviewer,
      note: review.pm_note,
    },
    version_lock: {
      version: review.review_version,
      status: review.version_status,
      note: review.version_note,
    },
    validation_summary: {
      readiness_score: context.validation.readiness_score,
      risk_score: context.validation.risk_score,
      confidence_score: context.validation.confidence_score,
      blocker_count: context.validation.blockers.length,
      warning_count: context.validation.warnings.length,
    },
    tech_stack_summary: summary
      ? {
          adoption_mode: summary.mode,
          dimensions_from_standard: summary.dimensions_from_standard,
          custom_dimensions: summary.custom_dimensions,
          exception_notes_present: summary.has_exception_notes,
          maturity_label: summary.maturity_label,
        }
      : undefined,
    unresolved_blockers: context.validation.blockers,
    unresolved_warnings: context.validation.warnings,
    checklist: review.checklist,
    review_focus: review.notes,
    ready_for_handoff: review.ready_for_handoff,
  };
}
