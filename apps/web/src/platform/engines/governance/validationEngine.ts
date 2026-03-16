import { getRequiredCompletion } from '../questionnaire/questionnaireEngine';
import { governanceRules } from '../../rules/governanceRules';
import { stageSchemas } from '../../schemas/stageSchemas';
import type { ProjectContext, ValidationIssueRecord, ValidationState } from '../../types/projectContext';
import type { TechStackDimensionId } from '../../types/projectContext';

const ALL_DIMENSION_IDS: TechStackDimensionId[] = ['backend', 'frontend', 'user_auth', 'api_security', 'api_design', 'testing', 'cicd'];

function buildGovernanceAdoptionSummary(context: ProjectContext): ValidationState['governance_adoption_summary'] {
  const mode = context.techStackAdoptionMode;
  if (mode !== 'full_standard' && mode !== 'partial_custom') return undefined;

  const customDimensions = [...context.customDimensionIds];
  const dimensionsFromStandard =
    mode === 'full_standard'
      ? [...ALL_DIMENSION_IDS]
      : ALL_DIMENSION_IDS.filter((id) => !context.customDimensionIds.includes(id));

  const hasExceptionNotes =
    Boolean(context.standardExceptionNotes?.s2?.trim()) || Boolean(context.standardExceptionNotes?.s3?.trim());

  let maturityLabel: string;
  if (mode === 'full_standard') {
    maturityLabel = hasExceptionNotes ? '全程依公司標準（有例外聲明，建議審議時確認）' : '全程依公司標準';
  } else {
    maturityLabel = customDimensions.length > 0 ? '部分客製（客製維度已填寫，其餘依公司標準）' : '部分客製';
  }

  return {
    mode,
    dimensions_from_standard: dimensionsFromStandard,
    custom_dimensions: customDimensions,
    has_exception_notes: hasExceptionNotes,
    maturity_label: maturityLabel,
  };
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function createIssue(
  id: string,
  level: 'error' | 'warning' | 'info',
  stage: 's1' | 's2' | 's3' | 's4' | 's5' | 's6' | 's7',
  title: string,
  message: string,
  owner?: string,
): ValidationIssueRecord {
  return { id, level, stage, title, message, owner };
}

function getCompletionByStage(context: ProjectContext, stageKey: 's1' | 's2' | 's3') {
  const schema = stageSchemas.find((item) => item.key === stageKey);
  if (!schema) return 0;
  return getRequiredCompletion(schema, context.stages[stageKey].answers).percent;
}

function buildDerivedIssues(context: ProjectContext) {
  const s1Completion = getCompletionByStage(context, 's1');
  const s2Completion = getCompletionByStage(context, 's2');
  const s3Completion = getCompletionByStage(context, 's3');
  const s1 = context.stages.s1.answers;
  const s2 = context.stages.s2.answers;
  const s3 = context.stages.s3.answers;

  const issues: ValidationIssueRecord[] = [];

  if (s1Completion < 60) {
    issues.push(
      createIssue(
        'VAL-DERIVED-001',
        'error',
        's1',
        'S1 完成度過低',
        `S1 必填完成度目前僅 ${s1Completion}%，尚不足以支撐後續架構與治理判斷。`,
        'PM',
      ),
    );
  }

  if (s2Completion < 60) {
    issues.push(
      createIssue(
        'VAL-DERIVED-002',
        'error',
        's2',
        'S2 完成度過低',
        `S2 必填完成度目前僅 ${s2Completion}%，尚不足以進入穩定設計與驗證流程。`,
        'Architect',
      ),
    );
  }

  if (s3Completion < 60) {
    issues.push(
      createIssue(
        'VAL-DERIVED-003',
        'error',
        's3',
        'S3 完成度過低',
        `S3 必填完成度目前僅 ${s3Completion}%，實作規格仍不足以支撐 artifact 與 review。`,
        'Tech Leads',
      ),
    );
  }

  const observability = Array.isArray(s2['observability.baseline'])
    ? s2['observability.baseline'].map(String)
    : [];
  if (
    (s2['integration.strategy'] === 'event_driven' || s2['integration.strategy'] === 'hybrid') &&
    !observability.includes('traces')
  ) {
    issues.push(
      createIssue(
        'VAL-DERIVED-004',
        'warning',
        's2',
        '事件或混合整合建議加入 traces',
        '若採 event-driven / hybrid integration，建議把 traces 納入 observability baseline，否則跨模組追蹤會較困難。',
        'Architect / DevOps',
      ),
    );
  }

  const teamSize = Number(s1['project_basic.profile.team_size'] ?? 0);
  if (s2['architecture.pattern.style'] === 'microservices' && teamSize > 0 && teamSize <= 4) {
    issues.push(
      createIssue(
        'VAL-DERIVED-005',
        'warning',
        's2',
        '小型團隊採微服務需再確認治理成本',
        '目前團隊規模偏小，若採 microservices，需補強契約、部署與維運治理。',
        'Architect',
      ),
    );
  }

  const coverage = Number(s3['test_coverage_target'] ?? 0);
  if (coverage > 0 && coverage < 70) {
    issues.push(
      createIssue(
        'VAL-DERIVED-006',
        'warning',
        's3',
        '測試覆蓋率目標偏低',
        'test_coverage_target 低於 70%，可能不足以支撐治理驗證與 release 信心。',
        'QA Lead',
      ),
    );
  }

  return issues;
}

export function computeValidationState(context: ProjectContext): ValidationState {
  const s1Completion = getCompletionByStage(context, 's1');
  const s2Completion = getCompletionByStage(context, 's2');
  const s3Completion = getCompletionByStage(context, 's3');

  const ruleIssues = governanceRules
    .map((rule) => rule.evaluate(context))
    .filter((issue): issue is ValidationIssueRecord => issue !== null);
  const derivedIssues = buildDerivedIssues(context);
  const allIssues = [...ruleIssues, ...derivedIssues];

  const blockers = allIssues.filter((issue) => issue.level === 'error');
  const warnings = allIssues.filter((issue) => issue.level === 'warning');

  let riskScore = 18;
  if (context.stages.s1.answers['project_basic.compliance.data_sensitivity'] === 'restricted') riskScore += 22;
  if (context.stages.s1.answers['project_basic.compliance.data_sensitivity'] === 'confidential') riskScore += 14;
  if (context.stages.s2.answers['architecture.pattern.style'] === 'microservices') riskScore += 12;
  if (context.stages.s2.answers['integration.strategy'] === 'event_driven') riskScore += 10;
  if (context.stages.s2.answers['integration.strategy'] === 'hybrid') riskScore += 8;
  if (Number(context.stages.s3.answers['test_coverage_target'] ?? 0) < 70) riskScore += 8;
  riskScore += blockers.length * 12;
  riskScore += warnings.length * 4;
  riskScore = clamp(riskScore, 0, 100);

  const readinessScore = clamp(
    Math.round(s1Completion * 0.25 + s2Completion * 0.35 + s3Completion * 0.4 - blockers.length * 10 - warnings.length * 3),
    0,
    100,
  );

  const confidenceScore = clamp(
    Math.round((s1Completion + s2Completion + s3Completion) / 3 - blockers.length * 12 - warnings.length * 4),
    0,
    100,
  );

  const owner_due_matrix = [...blockers, ...warnings].map((issue, index) => ({
    owner: issue.owner || '待指定',
    item: issue.title,
    due: index < blockers.length ? '立即處理' : '本週內補齊',
    stage: issue.stage,
  }));

  const governance_adoption_summary = buildGovernanceAdoptionSummary(context);

  return {
    readiness_score: readinessScore,
    risk_score: riskScore,
    confidence_score: confidenceScore,
    blockers,
    warnings,
    owner_due_matrix,
    governance_adoption_summary,
  };
}
