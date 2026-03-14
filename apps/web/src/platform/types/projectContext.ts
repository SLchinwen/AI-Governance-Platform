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

export interface ProjectContext {
  project_id: string;
  project_name: string;
  current_phase: PhaseId;
  current_stage: StageKey;
  meta: ContextMeta;
  fact_base: FactBaseItem[];
  prefill: Record<string, FieldValue>;
  stages: Record<StageKey, StageAnswerSet>;
  recommendations: Record<StageKey, RecommendationRecord[]>;
  validation: ValidationState;
  review: ReviewState;
  artifacts: Record<string, ArtifactRecord>;
  publish: PublishState;
}
