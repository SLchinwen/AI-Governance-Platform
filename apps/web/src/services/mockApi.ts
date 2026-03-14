import type {
  AnswerDraft,
  ProjectRecord,
  QuestionnaireInstance,
  QuestionItem,
  OutputArtifact,
  ReadinessReport,
  RoleId,
  StageId,
  StageTransitionRecord,
  ValidationIssue,
  ValidationSummary,
} from '../types';

interface CreateProjectInput {
  name: string;
  type: string;
}

interface GetQuestionsInput {
  questionnaireId: string;
  role: RoleId;
  stage: StageId;
}

const projects: ProjectRecord[] = [];
const questionnaires: QuestionnaireInstance[] = [];
const answers: AnswerDraft[] = [];
const transitions: StageTransitionRecord[] = [];
const artifacts: OutputArtifact[] = [];
const stageOrder: StageId[] = [
  'discovery',
  'planning',
  'design',
  'validation',
  'review',
  'output',
  'publish',
];

const questionPool: QuestionItem[] = [
  { id: 'project_basic.profile.name', title: '專案名稱', stage: 'discovery', role: 'pm', required: true },
  { id: 'project_basic.profile.type', title: '專案類型', stage: 'discovery', role: 'pm', required: true },
  { id: 'architecture.pattern', title: '架構風格', stage: 'planning', role: 'architect', required: true },
  { id: 'ai_collaboration.boundary', title: 'AI 禁止邊界', stage: 'planning', role: 'architect', required: true },
  { id: 'backend.runtime', title: '後端執行環境版本', stage: 'design', role: 'backend_lead', required: true },
  { id: 'api.auth.strategy', title: 'API 驗證策略', stage: 'design', role: 'backend_lead', required: true },
  { id: 'frontend.framework', title: '前端框架選型', stage: 'design', role: 'frontend_lead', required: true },
];

function delay<T>(value: T, ms = 120): Promise<T> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(value), ms);
  });
}

function uid(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

export async function getProjects(): Promise<ProjectRecord[]> {
  return delay([...projects]);
}

export async function createProject(input: CreateProjectInput): Promise<ProjectRecord> {
  const project: ProjectRecord = {
    id: uid('prj'),
    name: input.name,
    type: input.type,
    createdAt: new Date().toISOString(),
  };
  projects.unshift(project);
  return delay(project);
}

export async function ensureQuestionnaire(projectId: string): Promise<QuestionnaireInstance> {
  const existed = questionnaires.find((item) => item.projectId === projectId);
  if (existed) return delay(existed);

  const questionnaire: QuestionnaireInstance = {
    id: uid('qnr'),
    projectId,
    version: 1,
    currentStage: 'discovery',
  };
  questionnaires.push(questionnaire);
  return delay(questionnaire);
}

export async function getQuestions(input: GetQuestionsInput): Promise<QuestionItem[]> {
  const rows = questionPool.filter(
    (item) => item.role === input.role && item.stage === input.stage,
  );
  return delay(rows);
}

export async function getAnswers(questionnaireId: string): Promise<AnswerDraft[]> {
  return delay(answers.filter((item) => item.questionnaireId === questionnaireId));
}

export async function saveAnswer(
  questionnaireId: string,
  questionId: string,
  value: string,
): Promise<AnswerDraft> {
  const existed = answers.find(
    (item) => item.questionnaireId === questionnaireId && item.questionId === questionId,
  );
  if (existed) {
    existed.value = value;
    existed.updatedAt = new Date().toISOString();
    return delay({ ...existed });
  }

  const draft: AnswerDraft = {
    questionnaireId,
    questionId,
    value,
    updatedAt: new Date().toISOString(),
  };
  answers.push(draft);
  return delay(draft);
}

function buildValidation(questionnaireId: string): ValidationSummary {
  const rows = answers.filter((item) => item.questionnaireId === questionnaireId);
  const errors: ValidationIssue[] = [];
  const warnings: ValidationIssue[] = [];

  for (const question of questionPool) {
    const answer = rows.find((item) => item.questionId === question.id);
    const value = answer?.value?.trim() ?? '';
    if (question.required && value.length === 0) {
      errors.push({
        level: 'error',
        questionId: question.id,
        message: `必填題未完成：${question.title}`,
      });
    }
    if (!question.required && value.length === 0) {
      warnings.push({
        level: 'warning',
        questionId: question.id,
        message: `建議補充：${question.title}`,
      });
    }
  }

  return { questionnaireId, errors, warnings };
}

export async function validateQuestionnaire(questionnaireId: string): Promise<ValidationSummary> {
  return delay(buildValidation(questionnaireId));
}

export async function getReadiness(questionnaireId: string): Promise<ReadinessReport> {
  const validation = buildValidation(questionnaireId);
  const requiredTotal = questionPool.filter((item) => item.required).length;
  const requiredAnswered = requiredTotal - validation.errors.length;
  const score = Math.max(0, Math.round((requiredAnswered / Math.max(requiredTotal, 1)) * 100));

  return delay({
    questionnaireId,
    score,
    requiredTotal,
    requiredAnswered,
  });
}

function canMoveForward(current: StageId, next: StageId): boolean {
  const currentIdx = stageOrder.indexOf(current);
  const nextIdx = stageOrder.indexOf(next);
  return nextIdx === currentIdx + 1;
}

function gatePass(questionnaireId: string): boolean {
  const validation = buildValidation(questionnaireId);
  const requiredTotal = questionPool.filter((item) => item.required).length;
  const requiredAnswered = requiredTotal - validation.errors.length;
  const score = Math.max(0, Math.round((requiredAnswered / Math.max(requiredTotal, 1)) * 100));
  return validation.errors.length === 0 && score >= 70;
}

export async function transitionStage(
  questionnaireId: string,
  nextStage: StageId,
  note: string,
): Promise<QuestionnaireInstance> {
  const item = questionnaires.find((row) => row.id === questionnaireId);
  if (!item) {
    throw new Error('questionnaire not found');
  }
  if (!canMoveForward(item.currentStage, nextStage)) {
    throw new Error('invalid stage transition');
  }

  if (['review', 'output', 'publish'].includes(nextStage) && !gatePass(questionnaireId)) {
    throw new Error('gate check failed');
  }

  const fromStage = item.currentStage;
  item.currentStage = nextStage;
  transitions.unshift({
    questionnaireId,
    fromStage,
    toStage: nextStage,
    action: 'transition',
    note,
    at: new Date().toISOString(),
  });
  return delay({ ...item });
}

export async function approveQuestionnaire(questionnaireId: string, note: string): Promise<QuestionnaireInstance> {
  const item = questionnaires.find((row) => row.id === questionnaireId);
  if (!item) throw new Error('questionnaire not found');
  const currentIdx = stageOrder.indexOf(item.currentStage);
  const nextStage = stageOrder[Math.min(currentIdx + 1, stageOrder.length - 1)];
  const updated = await transitionStage(questionnaireId, nextStage, note || 'approved');
  transitions[0].action = 'approve';
  return updated;
}

export async function rejectQuestionnaire(questionnaireId: string, note: string): Promise<QuestionnaireInstance> {
  const item = questionnaires.find((row) => row.id === questionnaireId);
  if (!item) throw new Error('questionnaire not found');
  const currentIdx = stageOrder.indexOf(item.currentStage);
  const prevStage = stageOrder[Math.max(currentIdx - 1, 0)];
  const fromStage = item.currentStage;
  item.currentStage = prevStage;
  transitions.unshift({
    questionnaireId,
    fromStage,
    toStage: prevStage,
    action: 'reject',
    note: note || 'rejected',
    at: new Date().toISOString(),
  });
  return delay({ ...item });
}

export async function getTransitions(questionnaireId: string): Promise<StageTransitionRecord[]> {
  return delay(transitions.filter((item) => item.questionnaireId === questionnaireId));
}

export async function generateArtifacts(questionnaireId: string): Promise<OutputArtifact[]> {
  const questionnaire = questionnaires.find((item) => item.id === questionnaireId);
  if (!questionnaire) {
    throw new Error('questionnaire not found');
  }

  const readiness = await getReadiness(questionnaireId);
  if (readiness.score < 70) {
    throw new Error('gate check failed');
  }

  const rows = answers.filter((item) => item.questionnaireId === questionnaireId);
  const project = projects.find((item) => item.id === questionnaire.projectId);
  const projectName = project?.name || '未命名專案';

  const techStack = {
    project: projectName,
    stage: questionnaire.currentStage,
    answered: rows.length,
    generatedAt: new Date().toISOString(),
  };
  const techStackContent = JSON.stringify(techStack, null, 2);
  const aiContextContent = `# AI Context\n\n- Project: ${projectName}\n- Stage: ${questionnaire.currentStage}\n- Answers: ${rows.length}\n`;
  const readinessContent = `# Readiness Report\n\n- Score: ${readiness.score}\n- Required: ${readiness.requiredAnswered}/${readiness.requiredTotal}\n`;

  const generated: OutputArtifact[] = [
    {
      id: uid('art'),
      questionnaireId,
      type: 'tech-stack.json',
      content: techStackContent,
      generatedAt: new Date().toISOString(),
    },
    {
      id: uid('art'),
      questionnaireId,
      type: 'ai-context.md',
      content: aiContextContent,
      generatedAt: new Date().toISOString(),
    },
    {
      id: uid('art'),
      questionnaireId,
      type: 'readiness-report.md',
      content: readinessContent,
      generatedAt: new Date().toISOString(),
    },
  ];

  const remains = artifacts.filter((row) => row.questionnaireId !== questionnaireId);
  artifacts.length = 0;
  artifacts.push(...remains, ...generated);

  return delay(generated);
}

export async function getArtifacts(questionnaireId: string): Promise<OutputArtifact[]> {
  return delay(artifacts.filter((item) => item.questionnaireId === questionnaireId));
}
