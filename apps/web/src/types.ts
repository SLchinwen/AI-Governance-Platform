export type StageId =
  | 'discovery'
  | 'planning'
  | 'design'
  | 'validation'
  | 'review'
  | 'output'
  | 'publish';

export type RoleId =
  | 'pm'
  | 'architect'
  | 'backend_lead'
  | 'frontend_lead'
  | 'devops'
  | 'security_lead'
  | 'qa_lead';

export type ProgramStatus = 'ready' | 'in_progress' | 'pending_prd';

export interface Scenario {
  id: string;
  title: string;
  summary: string;
  stage: StageId;
  ownerRole: RoleId;
  objective: string;
  acceptance: string[];
}

export interface ProgramUnit {
  code: string;
  name: string;
  category: string;
  stage: StageId;
  ownerRole: RoleId;
  status: ProgramStatus;
  description: string;
  apis: string[];
  uiScreens: string[];
  dataTables: string[];
  subPrograms: string[];
}

export interface ProjectRecord {
  id: string;
  name: string;
  type: string;
  createdAt: string;
}

export interface QuestionnaireInstance {
  id: string;
  projectId: string;
  version: number;
  currentStage: StageId;
}

export interface QuestionItem {
  id: string;
  title: string;
  stage: StageId;
  role: RoleId;
  required: boolean;
}

export interface AnswerDraft {
  questionnaireId: string;
  questionId: string;
  value: string;
  updatedAt: string;
}

export interface ValidationIssue {
  level: 'error' | 'warning';
  message: string;
  questionId?: string;
}

export interface ValidationSummary {
  questionnaireId: string;
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
}

export interface ReadinessReport {
  questionnaireId: string;
  score: number;
  requiredTotal: number;
  requiredAnswered: number;
}

export interface StageTransitionRecord {
  questionnaireId: string;
  fromStage: StageId;
  toStage: StageId;
  action: 'transition' | 'approve' | 'reject';
  note: string;
  at: string;
}

export interface OutputArtifact {
  id: string;
  questionnaireId: string;
  type: 'tech-stack.json' | 'ai-context.md' | 'readiness-report.md';
  content: string;
  generatedAt: string;
}
