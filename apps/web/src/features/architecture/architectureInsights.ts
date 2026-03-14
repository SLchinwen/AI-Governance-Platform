import type { ProjectContext, RecommendationRecord } from '../../platform/types/projectContext';

export interface ArchitectureSummary {
  architectureStyle: string;
  backendPlatform: string;
  frontendFramework: string;
  databaseEngine: string;
  apiStyle: string;
  hostingPlatform: string;
  deploymentModel: string;
  integrationStrategy: string;
  observabilityBaseline: string;
  aiBoundary: string;
}

export function buildArchitectureSummary(context: ProjectContext): ArchitectureSummary {
  const answers = context.stages.s2.answers;
  return {
    architectureStyle: String(answers['architecture.pattern.style'] ?? '-'),
    backendPlatform: String(answers['backend.runtime.platform'] ?? '-'),
    frontendFramework: String(answers['frontend.framework.choice'] ?? '-'),
    databaseEngine: String(answers['database.primary.engine'] ?? '-'),
    apiStyle: String(answers['api.style.type'] ?? '-'),
    hostingPlatform: String(answers['architecture.hosting.platform'] ?? '-'),
    deploymentModel: String(answers['deployment.model'] ?? '-'),
    integrationStrategy: String(answers['integration.strategy'] ?? '-'),
    observabilityBaseline: Array.isArray(answers['observability.baseline'])
      ? answers['observability.baseline'].join(', ')
      : String(answers['observability.baseline'] ?? '-'),
    aiBoundary: String(answers['ai_collaboration.boundary_summary'] ?? '-'),
  };
}

export function buildArchitectureRecommendations(context: ProjectContext): RecommendationRecord[] {
  const s1 = context.stages.s1.answers;
  const s2 = context.stages.s2.answers;
  const recommendations: RecommendationRecord[] = [];

  const teamSize = Number(s1['project_basic.profile.team_size'] ?? 0);
  const integrationLevel = String(s1['project_basic.integration.level'] ?? '');
  const dataSensitivity = String(s1['project_basic.compliance.data_sensitivity'] ?? '');
  const architectureStyle = String(s2['architecture.pattern.style'] ?? '');
  const hostingPlatform = String(s2['architecture.hosting.platform'] ?? '');
  const dbEngine = String(s2['database.primary.engine'] ?? '');
  const apiStyle = String(s2['api.style.type'] ?? '');
  const aiBoundary = String(s2['ai_collaboration.boundary_summary'] ?? '');

  if (architectureStyle === 'microservices' && teamSize > 0 && teamSize <= 4) {
    recommendations.push({
      id: 'REC-S2-001',
      stage: 's2',
      title: '小型團隊先評估模組化單體',
      rationale: '若團隊規模偏小，微服務的治理與維運成本通常高於收益，可先用 modular monolith。',
      confidence: 0.86,
      targets: ['architecture.pattern.style', 'architecture.communication.style'],
    });
  }

  if (integrationLevel === 'mixed' || integrationLevel === 'external_partners') {
    recommendations.push({
      id: 'REC-S2-002',
      stage: 's2',
      title: '整合型專案應優先補齊 integration strategy 與 API contract',
      rationale: '若含外部夥伴或混合整合，建議在 S2 即明確同步/事件邊界與契約治理。',
      confidence: 0.89,
      targets: ['integration.strategy', 'api.style.type'],
    });
  }

  if (dbEngine === 'azure_sql' && hostingPlatform && hostingPlatform !== 'azure') {
    recommendations.push({
      id: 'REC-S2-003',
      stage: 's2',
      title: '檢查資料庫與部署平台的一致性',
      rationale: 'Azure SQL 與非 Azure 平台組合可行，但需提早評估跨雲連線、權限與維運成本。',
      confidence: 0.78,
      targets: ['database.primary.engine', 'architecture.hosting.platform'],
    });
  }

  if (apiStyle === 'restful') {
    recommendations.push({
      id: 'REC-S2-004',
      stage: 's2',
      title: 'REST 架構建議同步定義 response envelope 與 error policy',
      rationale: 'REST 最利於治理與文件化，但最好在 S3 前就明確回應格式與錯誤處理規範。',
      confidence: 0.82,
      targets: ['api.style.type', 'code_structure'],
    });
  }

  if ((dataSensitivity === 'confidential' || dataSensitivity === 'restricted') && aiBoundary === 'analysis_and_code_with_review') {
    recommendations.push({
      id: 'REC-S2-005',
      stage: 's2',
      title: '機密專案需再次確認 AI 邊界是否可接受',
      rationale: '若資料敏感度高，但 AI 仍允許產碼，需確保 review、稽核與模型管制已同步建立。',
      confidence: 0.91,
      targets: ['ai_collaboration.boundary_summary', 'validation.risk_score'],
    });
  }

  if (!recommendations.length) {
    recommendations.push({
      id: 'REC-S2-000',
      stage: 's2',
      title: '目前架構方向整體一致',
      rationale: '目前未觀察到明顯架構衝突，可進一步進入 S3 補齊 repo、code 與 module boundary 設計。',
      confidence: 0.72,
      targets: ['repo_structure', 'module_boundary_definition'],
    });
  }

  return recommendations;
}
