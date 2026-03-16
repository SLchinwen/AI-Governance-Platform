import { createContext, useContext, useMemo, useReducer, type Dispatch, type PropsWithChildren } from 'react';
import { buildArtifacts, buildS7Handoff } from '../engines/artifacts/artifactEngine';
import { computeValidationState } from '../engines/governance/validationEngine';
import { buildAiDisclosureMd, buildPrBody, buildPublishManifest, computePublishState } from '../engines/publish/publishEngine';
import { buildApprovedReviewPacket, computeReviewState } from '../engines/review/reviewEngine';
import { stageOrder, stageSchemas } from '../schemas/stageSchemas';
import type {
  ContextMeta,
  FieldValue,
  PhaseId,
  ProjectContext,
  PublishState,
  ReviewState,
  StageAnswerSet,
  StageKey,
  TechStackAdoptionMode,
  TechStackDimensionId,
  ValidationState,
} from '../types/projectContext';

interface ProjectContextStoreValue {
  context: ProjectContext;
  dispatch: Dispatch<ProjectContextAction>;
}

type ProjectContextAction =
  | { type: 'set_phase'; phase: PhaseId }
  | { type: 'set_stage'; stage: StageKey }
  | { type: 'update_stage_field'; stage: StageKey; fieldId: string; value: FieldValue }
  | {
      type: 'apply_company_standard';
      payload: {
        s2: Record<string, FieldValue>;
        s3: Record<string, FieldValue>;
        fieldDimensionMap?: { s2: Record<string, string>; s3: Record<string, string> };
      };
    }
  | { type: 'update_standard_exception_note'; stage: 's2' | 's3'; note: string }
  | { type: 'hydrate'; context: ProjectContext };

const initialMeta: ContextMeta = {
  version: '2.0.0-alpha',
  last_updated_at: new Date().toISOString(),
  last_updated_by: 'cursor-refactor',
  source: 'prototype_refactor',
};

const initialValidation: ValidationState = {
  readiness_score: 62,
  risk_score: 28,
  confidence_score: 55,
  blockers: [],
  warnings: [],
  owner_due_matrix: [],
};

const initialReview: ReviewState = {
  architect_decision: 'pending',
  pm_decision: 'pending',
  architect_reviewer: '',
  architect_note: '',
  pm_reviewer: '',
  pm_note: '',
  review_version: 'review-v2.0.0-alpha',
  version_status: 'draft',
  version_note: '',
  notes: [],
  checklist: [],
  ready_for_handoff: false,
};

const initialPublish: PublishState = {
  base_branch: 'master',
  publish_branch: 'release/prj-001-v2-alpha',
  tag: 'v2.0.0-alpha',
  pr_title: 'feat: initialize AI development governance platform shell',
  reviewers: ['Architect', 'PM', 'DevOps'],
  ai_tools: 'Cursor, Claude, GPT',
  ai_disclosure_level: 'recommended',
  ai_disclosure: 'AI 協助完成重構規劃與初步模組骨架，正式規則與模板仍需人工覆核。',
  change_summary: '建立新版 App Shell、project-context schema 與模組化引擎骨架。',
  reviewer_suggestions: [],
  checklist: [],
  publish_ready: false,
};

function createStageState(stage: StageKey): StageAnswerSet {
  const schema = stageSchemas.find((item) => item.key === stage);
  return {
    status: stage === 's1' ? 'in_progress' : 'not_started',
    owner_roles: schema?.fields.flatMap((field) => field.ownerRoles) ?? [],
    answers: {},
    derived: {},
    handoff: {},
  };
}

function applyValidationState(context: ProjectContext): ProjectContext {
  const validation = computeValidationState(context);
  const contextWithValidation = {
    ...context,
    validation,
  };
  const review = computeReviewState(contextWithValidation);
  const contextWithReview = {
    ...contextWithValidation,
    review,
  };
  const approvedReviewPacket = buildApprovedReviewPacket(contextWithReview);
  const artifacts = buildArtifacts(contextWithReview);
  const s7Handoff = buildS7Handoff(contextWithReview);
  const contextWithArtifacts = {
    ...contextWithReview,
    artifacts,
  };
  const publish = computePublishState(contextWithArtifacts);
  const prBody = buildPrBody({ ...contextWithArtifacts, publish });
  const aiDisclosure = buildAiDisclosureMd({ ...contextWithArtifacts, publish });
  const publishManifest = buildPublishManifest({ ...contextWithArtifacts, publish });
  return {
    ...contextWithArtifacts,
    stages: {
      ...context.stages,
      s4: {
        ...context.stages.s4,
        derived: {
          ...context.stages.s4.derived,
          readiness_score: validation.readiness_score,
          risk_score: validation.risk_score,
          confidence_score: validation.confidence_score,
          owner_due_matrix: validation.owner_due_matrix
            .map((item) => `${item.owner} | ${item.stage} | ${item.due} | ${item.item}`)
            .join('\n'),
        },
      },
      s5: {
        ...context.stages.s5,
        derived: {
          ...context.stages.s5.derived,
          review_status: review.version_status,
          ready_for_handoff: String(review.ready_for_handoff),
          checklist_summary: review.checklist
            .map((item) => `${item.pass ? 'PASS' : 'TODO'} | ${item.label}`)
            .join('\n'),
          review_focus: review.notes.join('\n'),
        },
        handoff: {
          ...context.stages.s5.handoff,
          approved_review_packet: approvedReviewPacket,
          s6_handoff: approvedReviewPacket,
        },
      },
      s6: {
        ...context.stages.s6,
        derived: {
          ...context.stages.s6.derived,
          generated_artifact_count: Object.keys(artifacts).length,
          ready_for_publish: String(contextWithReview.review.ready_for_handoff && Object.keys(artifacts).length > 0),
          selected_outputs: Object.keys(artifacts).join(', '),
        },
        handoff: {
          ...context.stages.s6.handoff,
          outputs: Object.fromEntries(Object.entries(artifacts).map(([key, value]) => [key, value.preview ?? ''])),
          s7_handoff: s7Handoff,
        },
      },
      s7: {
        ...context.stages.s7,
        derived: {
          ...context.stages.s7.derived,
          publish_ready: String(publish.publish_ready),
          reviewer_suggestions: publish.reviewer_suggestions.join('\n'),
          publish_targets: Object.keys(contextWithArtifacts.artifacts).join(', '),
        },
        handoff: {
          ...context.stages.s7.handoff,
          publish_packet: publishManifest,
          pr_body: prBody,
          ai_disclosure: aiDisclosure,
        },
      },
    },
    validation,
    review,
    artifacts,
    publish,
  };
}

export function createInitialProjectContext(): ProjectContext {
  const initialContext: ProjectContext = {
    project_id: 'PRJ-001',
    project_name: 'AI Development Governance Platform',
    current_phase: 'phase_a',
    current_stage: 's1',
    meta: initialMeta,
    techStackAdoptionMode: null,
    customDimensionIds: [],
    stageTechSource: {},
    companyStandardFieldDimensionMap: undefined,
    standardExceptionNotes: undefined,
    fact_base: [],
    prefill: {},
    stages: {
      s1: createStageState('s1'),
      s2: createStageState('s2'),
      s3: createStageState('s3'),
      s4: createStageState('s4'),
      s5: createStageState('s5'),
      s6: createStageState('s6'),
      s7: createStageState('s7'),
    },
    recommendations: {
      s1: [],
      s2: [],
      s3: [],
      s4: [],
      s5: [],
      s6: [],
      s7: [],
    },
    validation: initialValidation,
    review: initialReview,
    artifacts: {},
    publish: initialPublish,
  };
  return applyValidationState(initialContext);
}

function projectContextReducer(state: ProjectContext, action: ProjectContextAction): ProjectContext {
  switch (action.type) {
    case 'set_phase':
      return {
        ...state,
        current_phase: action.phase,
        meta: { ...state.meta, last_updated_at: new Date().toISOString() },
      };
    case 'set_stage':
      return {
        ...state,
        current_stage: action.stage,
        current_phase: stageSchemas.find((schema) => schema.key === action.stage)?.phase ?? state.current_phase,
        meta: { ...state.meta, last_updated_at: new Date().toISOString() },
      };
    case 'update_stage_field': {
      const nextStages = {
        ...state.stages,
        [action.stage]: {
          ...state.stages[action.stage],
          status: 'in_progress',
          answers: {
            ...state.stages[action.stage].answers,
            [action.fieldId]: action.value,
          },
        },
      };
      let adoptionMode: TechStackAdoptionMode = state.techStackAdoptionMode;
      let customIds: TechStackDimensionId[] = state.customDimensionIds;
      if (action.stage === 's1') {
        if (action.fieldId === 'project_basic.tech_stack_adoption_mode') {
          adoptionMode = (action.value === 'full_standard' || action.value === 'partial_custom'
            ? action.value
            : null) as TechStackAdoptionMode;
        }
        if (action.fieldId === 'project_basic.tech_stack_custom_dimensions') {
          customIds = Array.isArray(action.value) ? (action.value as TechStackDimensionId[]) : [];
        }
      }
      const nextContext: ProjectContext = {
        ...state,
        project_name:
          action.fieldId === 'project_basic.profile.name' && typeof action.value === 'string' && action.value.trim() !== ''
            ? action.value
            : state.project_name,
        techStackAdoptionMode: adoptionMode,
        customDimensionIds: customIds,
        stages: nextStages,
        prefill: {
          ...state.prefill,
          [action.fieldId]: action.value,
        },
        meta: { ...state.meta, last_updated_at: new Date().toISOString() },
      };
      return applyValidationState(nextContext);
    }
    case 'apply_company_standard': {
      const { s2, s3 } = action.payload;
      const nextContext: ProjectContext = {
        ...state,
        stages: {
          ...state.stages,
          s2: {
            ...state.stages.s2,
            status: state.stages.s2.status === 'not_started' ? 'in_progress' : state.stages.s2.status,
            answers: { ...state.stages.s2.answers, ...s2 },
          },
          s3: {
            ...state.stages.s3,
            status: state.stages.s3.status === 'not_started' ? 'in_progress' : state.stages.s3.status,
            answers: { ...state.stages.s3.answers, ...s3 },
          },
        },
        stageTechSource: {
          ...state.stageTechSource,
          s2: 'company_standard',
          s3: 'company_standard',
        },
        companyStandardFieldDimensionMap: action.payload.fieldDimensionMap ?? state.companyStandardFieldDimensionMap,
        meta: { ...state.meta, last_updated_at: new Date().toISOString() },
      };
      return applyValidationState(nextContext);
    }
    case 'update_standard_exception_note': {
      return {
        ...state,
        standardExceptionNotes: {
          ...state.standardExceptionNotes,
          [action.stage]: action.note,
        },
        meta: { ...state.meta, last_updated_at: new Date().toISOString() },
      };
    }
    case 'hydrate': {
      const ctx = action.context;
      const normalized: ProjectContext = {
        ...ctx,
        techStackAdoptionMode: ctx.techStackAdoptionMode ?? null,
        customDimensionIds: Array.isArray(ctx.customDimensionIds) ? ctx.customDimensionIds : [],
        stageTechSource: ctx.stageTechSource && typeof ctx.stageTechSource === 'object' ? ctx.stageTechSource : {},
        companyStandardFieldDimensionMap: ctx.companyStandardFieldDimensionMap,
        standardExceptionNotes: ctx.standardExceptionNotes && typeof ctx.standardExceptionNotes === 'object' ? ctx.standardExceptionNotes : undefined,
      };
      return applyValidationState(normalized);
    }
    default:
      return state;
  }
}

const ProjectContextStore = createContext<ProjectContextStoreValue | null>(null);

export function ProjectContextProvider({ children }: PropsWithChildren) {
  const [context, dispatch] = useReducer(projectContextReducer, undefined, createInitialProjectContext);
  const value = useMemo(() => ({ context, dispatch }), [context]);
  return <ProjectContextStore.Provider value={value}>{children}</ProjectContextStore.Provider>;
}

export function useProjectContextStore() {
  const store = useContext(ProjectContextStore);
  if (!store) {
    throw new Error('ProjectContextStore 尚未初始化');
  }
  return store;
}

export function getStageProgress(context: ProjectContext) {
  return stageOrder.map((stage) => {
    const schema = stageSchemas.find((item) => item.key === stage);
    const requiredFields = schema?.fields.filter((field) => field.required) ?? [];
    const answered = requiredFields.filter((field) => {
      const value = context.stages[stage].answers[field.id];
      return Array.isArray(value) ? value.length > 0 : value !== undefined && value !== null && value !== '';
    }).length;
    return {
      stage,
      completed: answered,
      total: requiredFields.length,
    };
  });
}
