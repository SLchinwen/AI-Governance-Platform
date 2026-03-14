import { buildS7Handoff } from '../../platform/engines/artifacts/artifactEngine';
import type { ProjectContext, RecommendationRecord } from '../../platform/types/projectContext';

export interface OutputSummary {
  selectedCount: number;
  generatedCount: number;
  reviewStatus: string;
  reviewVersion: string;
  readinessScore: number;
  readyForPublish: boolean;
}

export function buildOutputSummary(context: ProjectContext): OutputSummary {
  const selected = context.stages.s6.answers['output.assets.selected'];
  const selectedCount = Array.isArray(selected) ? selected.length : 0;

  return {
    selectedCount,
    generatedCount: Object.keys(context.artifacts).length,
    reviewStatus: context.review.version_status,
    reviewVersion: context.review.review_version,
    readinessScore: context.validation.readiness_score,
    readyForPublish: context.review.ready_for_handoff && Object.keys(context.artifacts).length > 0,
  };
}

export function buildOutputRecommendations(context: ProjectContext): RecommendationRecord[] {
  const recommendations: RecommendationRecord[] = [];
  const summary = buildOutputSummary(context);

  if (summary.selectedCount === 0) {
    recommendations.push({
      id: 'REC-S6-001',
      stage: 's6',
      title: '先選擇至少一個正式輸出檔案',
      rationale: '目前尚未選取任何 artifact，因此 S6 無法生成正式輸出。',
      confidence: 0.98,
      targets: ['output.assets.selected'],
    });
  }

  if (!context.review.ready_for_handoff) {
    recommendations.push({
      id: 'REC-S6-002',
      stage: 's6',
      title: 'S5 尚未完成核准，輸出應先視為 draft',
      rationale: '目前 review 尚未達 handoff 條件，建議先完成審核再發布正式 artifacts。',
      confidence: 0.94,
      targets: ['review.architect.decision', 'review.pm.decision'],
    });
  }

  if (context.validation.warnings.length > 0) {
    recommendations.push({
      id: 'REC-S6-003',
      stage: 's6',
      title: '在輸出中保留 unresolved warnings 與後續追蹤',
      rationale: `目前仍有 ${context.validation.warnings.length} 個 warning，建議在 readiness report 與 handoff 中明確保留。`,
      confidence: 0.82,
      targets: ['readiness-report.md'],
    });
  }

  if (!recommendations.length) {
    recommendations.push({
      id: 'REC-S6-000',
      stage: 's6',
      title: 'S6 輸出結果已可交接到發布階段',
      rationale: '目前已具備正式輸出與 handoff，可接續整理 PR 與 publish manifest。',
      confidence: 0.76,
      targets: ['publish.repo.base_branch', 'publish.release.tag'],
    });
  }

  return recommendations;
}

export function buildOutputPacketPreview(context: ProjectContext) {
  return {
    artifacts: context.artifacts,
    s7_handoff: buildS7Handoff(context),
  };
}
