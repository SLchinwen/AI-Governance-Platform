import type { RecommendationRecord } from '../../platform/types/projectContext';

export interface DiscoverySummary {
  projectName: string;
  projectType: string;
  systemCategory: string;
  dataSensitivity: string;
  technicalMaturity: string;
  existingCodebaseLevel: string;
  teamSize: string;
}

export function buildDiscoverySummary(answers: Record<string, unknown>): DiscoverySummary {
  return {
    projectName: String(answers['project_basic.profile.name'] ?? '未命名專案'),
    projectType: String(answers['project_basic.profile.type'] ?? '-'),
    systemCategory: String(answers['project_basic.system_category'] ?? '-'),
    dataSensitivity: String(answers['project_basic.compliance.data_sensitivity'] ?? '-'),
    technicalMaturity: String(answers['project_basic.technical_maturity'] ?? '-'),
    existingCodebaseLevel: String(answers['project_basic.existing_codebase_level'] ?? '-'),
    teamSize: String(answers['project_basic.profile.team_size'] ?? '-'),
  };
}

export function buildDiscoveryRecommendations(answers: Record<string, unknown>): RecommendationRecord[] {
  const recommendations: RecommendationRecord[] = [];

  const sensitivity = String(answers['project_basic.compliance.data_sensitivity'] ?? '');
  const artifactReadiness = String(answers['project_basic.artifact.readiness'] ?? '');
  const integrationLevel = String(answers['project_basic.integration.level'] ?? '');
  const maturity = String(answers['project_basic.technical_maturity'] ?? '');
  const existingCodebaseLevel = String(answers['project_basic.existing_codebase_level'] ?? '');

  if (sensitivity === 'confidential' || sensitivity === 'restricted') {
    recommendations.push({
      id: 'REC-S1-001',
      stage: 's1',
      title: '優先建立 AI 邊界與受控模型策略',
      rationale: '高敏感資料專案應在 S1 就明確限制模型、資料與 prompt 可見範圍。',
      confidence: 0.93,
      targets: ['project_basic.governance.ai_execution_boundary', 'security.ai.boundaries'],
    });
  }

  if (artifactReadiness === 'minimal') {
    recommendations.push({
      id: 'REC-S1-002',
      stage: 's1',
      title: '先補齊前置文件，再進行大規模 AI 產碼',
      rationale: '當前置文件過少時，先補足 PRD、API 契約與欄位字典，會比直接產碼更穩定。',
      confidence: 0.88,
      targets: ['deployment.model', 'module_boundary_definition'],
    });
  }

  if (integrationLevel === 'internal_systems' || integrationLevel === 'external_partners' || integrationLevel === 'mixed') {
    recommendations.push({
      id: 'REC-S1-003',
      stage: 's1',
      title: '在 S2 優先定義 integration strategy 與 observability baseline',
      rationale: '只要有整合依賴，就應提早確認同步/非同步策略與追蹤能力。',
      confidence: 0.84,
      targets: ['integration.strategy', 'observability.baseline'],
    });
  }

  if (maturity === 'exploratory' || existingCodebaseLevel === 'mature') {
    recommendations.push({
      id: 'REC-S1-004',
      stage: 's1',
      title: '在 S3 補強 module boundary 與 test coverage target',
      rationale: '探索中或既有系統較成熟時，模組邊界與測試目標特別重要，能降低 refactor 風險。',
      confidence: 0.79,
      targets: ['module_boundary_definition', 'test_coverage_target'],
    });
  }

  return recommendations;
}
