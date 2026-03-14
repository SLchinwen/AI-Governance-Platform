import { buildApprovedReviewPacket } from '../../platform/engines/review/reviewEngine';
import type { ProjectContext, RecommendationRecord } from '../../platform/types/projectContext';

export interface ReviewSummary {
  architectDecision: string;
  pmDecision: string;
  reviewVersion: string;
  versionStatus: string;
  readyForHandoff: boolean;
  checklistPassCount: number;
  checklistTotal: number;
}

export function buildReviewSummary(context: ProjectContext): ReviewSummary {
  const { review } = context;
  return {
    architectDecision: review.architect_decision,
    pmDecision: review.pm_decision,
    reviewVersion: review.review_version,
    versionStatus: review.version_status,
    readyForHandoff: review.ready_for_handoff,
    checklistPassCount: review.checklist.filter((item) => item.pass).length,
    checklistTotal: review.checklist.length,
  };
}

export function buildReviewRecommendations(context: ProjectContext): RecommendationRecord[] {
  const recommendations: RecommendationRecord[] = [];
  const summary = buildReviewSummary(context);

  if (!summary.readyForHandoff) {
    recommendations.push({
      id: 'REC-S5-001',
      stage: 's5',
      title: '先補齊 review checklist，再送往 S6',
      rationale: `目前 checklist 通過 ${summary.checklistPassCount}/${summary.checklistTotal}，尚未達到 handoff 條件。`,
      confidence: 0.93,
      targets: ['review.version_lock.version', 'review.architect.decision', 'review.pm.decision'],
    });
  }

  if (context.review.architect_decision === 'meeting_required' || context.review.pm_decision === 'meeting_required') {
    recommendations.push({
      id: 'REC-S5-002',
      stage: 's5',
      title: '安排 review meeting 再決定是否鎖版',
      rationale: '目前至少一位關鍵角色標示需要會議，建議先對齊風險與治理邊界。',
      confidence: 0.9,
      targets: ['review.architect.note', 'review.pm.note'],
    });
  }

  if (context.review.architect_decision === 'return_for_fix' || context.review.pm_decision === 'return_for_fix') {
    recommendations.push({
      id: 'REC-S5-003',
      stage: 's5',
      title: '整理退回修正原因並回送前階段',
      rationale: '已有角色要求 return_for_fix，應優先整理 note 與待修項，而不是直接進入輸出階段。',
      confidence: 0.96,
      targets: ['review.architect.note', 'review.pm.note'],
    });
  }

  if (!recommendations.length) {
    recommendations.push({
      id: 'REC-S5-000',
      stage: 's5',
      title: '目前 review 狀態已可支撐進入 S6',
      rationale: '重要決策與版本資訊已具備，可開始準備正式輸出 artifacts。',
      confidence: 0.78,
      targets: ['output.assets.selected'],
    });
  }

  return recommendations;
}

export function buildReviewPacketPreview(context: ProjectContext) {
  return buildApprovedReviewPacket(context);
}
