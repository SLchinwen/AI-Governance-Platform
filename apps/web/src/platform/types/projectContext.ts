export type PhaseId = 'phase_a' | 'phase_b' | 'phase_c';

export type StageKey = 's1' | 's2' | 's3' | 's4' | 's5' | 's6' | 's7';

export type FieldValue =
  | string
  | number
  | boolean
  | null
  | string[]
  | number[]
  | Record<string, unknown>;

export interface ContextMeta {
  version: string;
  last_updated_at: string;
  last_updated_by: string;
  source: 'prototype_refactor';
}

export interface FactBaseItem {
  id: string;
  title: string;
  summary: string;
  source: string;
  tags: string[];
}

export interface StageAnswerSet {
  status: 'not_started' | 'in_progress' | 'completed';
  owner_roles: string[];
  answers: Record<string, FieldValue>;
  derived: Record<string, FieldValue>;
  handoff: Record<string, unknown>;
}

export interface RecommendationRecord {
  id: string;
  stage: StageKey;
  title: string;
  rationale: string;
  confidence: number;
  targets: string[];
}

export interface ValidationIssueRecord {
  id: string;
  level: 'error' | 'warning' | 'info';
  stage: StageKey;
  title: string;
  message: string;
  owner?: string;
}

/** 技術棧採用與客製/例外之成熟度摘要（供 S4 顯示與 S5 產出引用） */
export interface GovernanceAdoptionSummary {
  mode: TechStackAdoptionMode;
  dimensions_from_standard: string[];
  custom_dimensions: string[];
  has_exception_notes: boolean;
  maturity_label: string;
}

export interface ValidationState {
  readiness_score: number;
  risk_score: number;
  confidence_score: number;
  blockers: ValidationIssueRecord[];
  warnings: ValidationIssueRecord[];
  owner_due_matrix: Array<{
    owner: string;
    item: string;
    due: string;
    stage: StageKey;
  }>;
  /** 技術棧採用方式與成熟度（有採用模式時才存在） */
  governance_adoption_summary?: GovernanceAdoptionSummary;
}

export interface ReviewChecklistItem {
  id: string;
  label: string;
  pass: boolean;
}

export interface ReviewState {
  architect_decision: 'pending' | 'approved' | 'approved_with_notes' | 'return_for_fix' | 'meeting_required';
  pm_decision: 'pending' | 'confirmed' | 'confirmed_with_notes' | 'return_for_fix' | 'meeting_required';
  architect_reviewer: string;
  architect_note: string;
  pm_reviewer: string;
  pm_note: string;
  review_version: string;
  version_status: 'draft' | 'approved' | 'approved_with_notes' | 'return_for_fix' | 'meeting_required';
  version_note: string;
  notes: string[];
  checklist: ReviewChecklistItem[];
  ready_for_handoff: boolean;
}

export interface ArtifactRecord {
  id: string;
  type: string;
  title: string;
  generated: boolean;
  preview?: string;
  updated_at?: string;
}

export interface PublishState {
  base_branch: string;
  publish_branch: string;
  tag: string;
  pr_title: string;
  reviewers: string[];
  ai_tools: string;
  ai_disclosure_level: 'required' | 'recommended' | 'minimal';
  ai_disclosure: string;
  change_summary: string;
  reviewer_suggestions: string[];
  checklist: Array<{
    id: string;
    label: string;
    pass: boolean;
  }>;
  publish_ready: boolean;
}

/** 技術棧採用方式：全程公司標準 vs 部分客製 */
export type TechStackAdoptionMode = 'full_standard' | 'partial_custom' | null;

/** 公司標準維度 ID，與 company-tech-stack-standard.json dimensions 一致 */
export type TechStackDimensionId =
  | 'backend'
  | 'frontend'
  | 'user_auth'
  | 'api_security'
  | 'api_design'
  | 'testing'
  | 'cicd';

/** S2/S3 階段技術棧來源標記 */
export type StageTechSource = 'company_standard' | 'custom';

/** 欄位 ID 對應維度 ID，供部分客製時篩選顯示用 */
export type FieldDimensionMap = { s2: Record<string, string>; s3: Record<string, string> };

export interface ProjectContext {
  project_id: string;
  project_name: string;
  current_phase: PhaseId;
  current_stage: StageKey;
  meta: ContextMeta;
  /** 技術棧採用方式；null 表示尚未選擇 */
  techStackAdoptionMode: TechStackAdoptionMode;
  /** 部分客製時，哪些維度為客製（其餘維度依公司標準） */
  customDimensionIds: TechStackDimensionId[];
  /** S2/S3 是否已套用公司標準預填 */
  stageTechSource: Partial<Record<'s2' | 's3', StageTechSource>>;
  /** 公司標準欄位→維度對照（套用標準時寫入，部分客製時用於篩選欄位） */
  companyStandardFieldDimensionMap?: FieldDimensionMap;
  /** 全程採用公司標準時，S2/S3 的確認與例外聲明（供審核與產出引用） */
  standardExceptionNotes?: Partial<Record<'s2' | 's3', string>>;
  fact_base: FactBaseItem[];
  prefill: Record<string, FieldValue>;
  stages: Record<StageKey, StageAnswerSet>;
  recommendations: Record<StageKey, RecommendationRecord[]>;
  validation: ValidationState;
  review: ReviewState;
  artifacts: Record<string, ArtifactRecord>;
  publish: PublishState;
}
