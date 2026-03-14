import type { ProjectContext, RecommendationRecord } from '../../platform/types/projectContext';

export interface DesignSummary {
  repoStructure: string;
  codeStructure: string;
  moduleBoundaryDefinition: string;
  testCoverageTarget: string;
  architectureStyle: string;
  integrationStrategy: string;
}

export function buildDesignSummary(context: ProjectContext): DesignSummary {
  const s2 = context.stages.s2.answers;
  const s3 = context.stages.s3.answers;

  return {
    repoStructure: String(s3['repo_structure'] ?? '-'),
    codeStructure: String(s3['code_structure'] ?? '-'),
    moduleBoundaryDefinition: String(s3['module_boundary_definition'] ?? '-'),
    testCoverageTarget: String(s3['test_coverage_target'] ?? '-'),
    architectureStyle: String(s2['architecture.pattern.style'] ?? '-'),
    integrationStrategy: String(s2['integration.strategy'] ?? '-'),
  };
}

export function buildDesignRecommendations(context: ProjectContext): RecommendationRecord[] {
  const s2 = context.stages.s2.answers;
  const s3 = context.stages.s3.answers;
  const recommendations: RecommendationRecord[] = [];

  const architectureStyle = String(s2['architecture.pattern.style'] ?? '');
  const integrationStrategy = String(s2['integration.strategy'] ?? '');
  const repoStructure = String(s3['repo_structure'] ?? '');
  const codeStructure = String(s3['code_structure'] ?? '');
  const testCoverageTarget = Number(s3['test_coverage_target'] ?? 0);
  const moduleBoundaryDefinition = String(s3['module_boundary_definition'] ?? '');

  if (architectureStyle === 'microservices' && repoStructure === 'polyrepo') {
    recommendations.push({
      id: 'REC-S3-001',
      stage: 's3',
      title: '微服務 + Polyrepo 需額外治理 release 與契約同步',
      rationale: '若每個服務獨立 repo，需同步建立版本管理、共用契約與 CI/CD 治理，否則協作成本會快速上升。',
      confidence: 0.87,
      targets: ['repo_structure', 'module_boundary_definition'],
    });
  }

  if (architectureStyle === 'modular_monolith' && codeStructure === 'feature_first') {
    recommendations.push({
      id: 'REC-S3-002',
      stage: 's3',
      title: '模組化單體適合搭配 feature-first 結構',
      rationale: 'feature-first 能讓模組邊界更貼近業務能力，也較容易轉成後續 ADR 與 artifact。',
      confidence: 0.82,
      targets: ['code_structure', 'module_boundary_definition'],
    });
  }

  if ((integrationStrategy === 'event_driven' || integrationStrategy === 'hybrid') && !moduleBoundaryDefinition) {
    recommendations.push({
      id: 'REC-S3-003',
      stage: 's3',
      title: '事件或混合整合策略需先定義明確模組邊界',
      rationale: '若未先定義 producer / consumer / integration boundary，後續實作與治理都容易失焦。',
      confidence: 0.9,
      targets: ['module_boundary_definition'],
    });
  }

  if (testCoverageTarget > 0 && testCoverageTarget < 70) {
    recommendations.push({
      id: 'REC-S3-004',
      stage: 's3',
      title: '測試覆蓋率目標偏低，建議重新確認品質基線',
      rationale: '若目標低於 70%，後續 validation 與 review 階段通常會增加風險與補件機率。',
      confidence: 0.88,
      targets: ['test_coverage_target'],
    });
  }

  if (!recommendations.length) {
    recommendations.push({
      id: 'REC-S3-000',
      stage: 's3',
      title: 'S3 設計方向已具備穩定基線',
      rationale: '目前 repo、code、module 與 test 方向沒有明顯衝突，可繼續往 S4 驗證與治理評估推進。',
      confidence: 0.75,
      targets: ['validation.risk_score', 'validation.confidence_score'],
    });
  }

  return recommendations;
}
