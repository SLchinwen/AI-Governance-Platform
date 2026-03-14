import type { ProjectContext, RecommendationRecord } from '../../platform/types/projectContext';

export interface ValidationSummary {
  readinessScore: number;
  riskScore: number;
  confidenceScore: number;
  blockerCount: number;
  warningCount: number;
  ownerDueCount: number;
}

export function buildValidationSummary(context: ProjectContext): ValidationSummary {
  return {
    readinessScore: context.validation.readiness_score,
    riskScore: context.validation.risk_score,
    confidenceScore: context.validation.confidence_score,
    blockerCount: context.validation.blockers.length,
    warningCount: context.validation.warnings.length,
    ownerDueCount: context.validation.owner_due_matrix.length,
  };
}

export function buildValidationRecommendations(context: ProjectContext): RecommendationRecord[] {
  const recommendations: RecommendationRecord[] = [];
  const summary = buildValidationSummary(context);

  if (summary.blockerCount > 0) {
    recommendations.push({
      id: 'REC-S4-001',
      stage: 's4',
      title: '先清空 blocker，再進入正式 review',
      rationale: `目前仍有 ${summary.blockerCount} 個 blocker，建議先收斂後再送 S5。`,
      confidence: 0.95,
      targets: ['review.architect.decision', 'review.pm.decision'],
    });
  }

  if (summary.warningCount > 3) {
    recommendations.push({
      id: 'REC-S4-002',
      stage: 's4',
      title: 'warning 數量偏高，建議先收斂到 3 個以下',
      rationale: `目前 warning 有 ${summary.warningCount} 個，若直接進 S5，review 成本與退回機率都會提高。`,
      confidence: 0.88,
      targets: ['validation.owner_due_matrix'],
    });
  }

  if (summary.readinessScore < 70) {
    recommendations.push({
      id: 'REC-S4-003',
      stage: 's4',
      title: 'readiness score 未達標，建議先補齊關鍵設計題',
      rationale: `目前 readiness score 為 ${summary.readinessScore}，建議先補齊 S1-S3 缺漏再送審。`,
      confidence: 0.9,
      targets: ['module_boundary_definition', 'test_coverage_target'],
    });
  }

  if (summary.riskScore >= 60) {
    recommendations.push({
      id: 'REC-S4-004',
      stage: 's4',
      title: '風險分數偏高，建議安排跨角色治理會議',
      rationale: `目前 risk score 為 ${summary.riskScore}，建議由 Architect / PM / Security 共同確認風險接受範圍。`,
      confidence: 0.84,
      targets: ['validation.owner_due_matrix', 'review.architect.decision'],
    });
  }

  if (!recommendations.length) {
    recommendations.push({
      id: 'REC-S4-000',
      stage: 's4',
      title: 'S4 驗證結果目前可支撐進入 review 前置',
      rationale: '目前沒有明顯 blocker，且分數已達基本基線，可開始準備 review packet。',
      confidence: 0.74,
      targets: ['review.version_lock.version'],
    });
  }

  return recommendations;
}
