import type { ProjectContext, ValidationIssueRecord } from '../types/projectContext';

export interface GovernanceRule {
  id: string;
  title: string;
  evaluate: (context: ProjectContext) => ValidationIssueRecord | null;
}

export const governanceRules: GovernanceRule[] = [
  {
    id: 'VAL-NEW-001',
    title: 'S1 需定義系統分類',
    evaluate: (context) =>
      context.stages.s1.answers['project_basic.system_category']
        ? null
        : {
            id: 'VAL-NEW-001',
            level: 'warning',
            stage: 's1',
            title: '缺少 system_category',
            message: 'S1 尚未補齊 system_category，會影響後續推薦與治理分類。',
          },
  },
  {
    id: 'VAL-NEW-002',
    title: 'S3 需定義模組邊界',
    evaluate: (context) =>
      context.stages.s3.answers['module_boundary_definition']
        ? null
        : {
            id: 'VAL-NEW-002',
            level: 'warning',
            stage: 's3',
            title: '缺少 module_boundary_definition',
            message: 'S3 尚未明確定義模組邊界，後續 artifact 與 review 將缺乏依據。',
          },
  },
  {
    id: 'VAL-NEW-003',
    title: '微服務需定義服務間通訊方式',
    evaluate: (context) =>
      context.stages.s2.answers['architecture.pattern.style'] === 'microservices' &&
      !context.stages.s2.answers['architecture.communication.style']
        ? {
            id: 'VAL-NEW-003',
            level: 'warning',
            stage: 's2',
            title: '缺少 architecture.communication.style',
            message: 'S2 選擇 microservices 時，應同步定義服務間通訊方式。',
          }
        : null,
  },
  {
    id: 'VAL-NEW-004',
    title: '機密專案需採保守 AI 邊界',
    evaluate: (context) => {
      const sensitivity = context.stages.s1.answers['project_basic.compliance.data_sensitivity'];
      const aiBoundary = context.stages.s2.answers['ai_collaboration.boundary_summary'];
      if ((sensitivity === 'confidential' || sensitivity === 'restricted') && aiBoundary === 'analysis_and_code_with_review') {
        return {
          id: 'VAL-NEW-004',
          level: 'warning',
          stage: 's2',
          title: '高敏感專案的 AI 邊界需再確認',
          message: '若資料敏感度較高，但 S2 仍允許 AI 產碼，應補強 review、模型控管與稽核設計。',
        };
      }
      return null;
    },
  },
  {
    id: 'VAL-NEW-005',
    title: 'S3 測試覆蓋率目標不可過低',
    evaluate: (context) => {
      const target = Number(context.stages.s3.answers['test_coverage_target'] ?? 0);
      if (target > 0 && target < 70) {
        return {
          id: 'VAL-NEW-005',
          level: 'warning',
          stage: 's3',
          title: 'test_coverage_target 偏低',
          message: 'S3 測試覆蓋率目標低於 70%，可能不足以支撐後續治理與驗證要求。',
        };
      }
      return null;
    },
  },
  {
    id: 'VAL-NEW-006',
    title: '事件型整合需明確模組邊界',
    evaluate: (context) => {
      const integration = context.stages.s2.answers['integration.strategy'];
      const boundary = context.stages.s3.answers['module_boundary_definition'];
      if ((integration === 'event_driven' || integration === 'hybrid') && !boundary) {
        return {
          id: 'VAL-NEW-006',
          level: 'warning',
          stage: 's3',
          title: '缺少 module_boundary_definition',
          message: '若 S2 採事件型或混合整合策略，S3 應明確描述模組與整合邊界。',
        };
      }
      return null;
    },
  },
];
