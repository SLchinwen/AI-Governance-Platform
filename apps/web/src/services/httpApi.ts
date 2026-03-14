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
  ValidationSummary,
} from '../types';

const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${baseUrl}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  return (await response.json()) as T;
}

export const httpApi = {
  getProjects(): Promise<ProjectRecord[]> {
    return request('/api/v1/projects');
  },
  createProject(input: { name: string; type: string }): Promise<ProjectRecord> {
    return request('/api/v1/projects', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },
  ensureQuestionnaire(projectId: string): Promise<QuestionnaireInstance> {
    return request(`/api/v1/projects/${projectId}/questionnaires`, {
      method: 'POST',
    });
  },
  getQuestions(input: {
    questionnaireId: string;
    role: RoleId;
    stage: StageId;
  }): Promise<QuestionItem[]> {
    const query = new URLSearchParams({ role: input.role, stage: input.stage }).toString();
    return request(`/api/v1/questionnaires/${input.questionnaireId}/questions?${query}`);
  },
  getAnswers(questionnaireId: string): Promise<AnswerDraft[]> {
    return request(`/api/v1/questionnaires/${questionnaireId}/answers`);
  },
  saveAnswer(questionnaireId: string, questionId: string, value: string): Promise<AnswerDraft> {
    return request(`/api/v1/questionnaires/${questionnaireId}/answers`, {
      method: 'POST',
      body: JSON.stringify({ questionId, value }),
    });
  },
  validateQuestionnaire(questionnaireId: string): Promise<ValidationSummary> {
    return request(`/api/v1/questionnaires/${questionnaireId}/validate`, {
      method: 'POST',
    });
  },
  getReadiness(questionnaireId: string): Promise<ReadinessReport> {
    return request(`/api/v1/questionnaires/${questionnaireId}/readiness`);
  },
  transitionStage(
    questionnaireId: string,
    nextStage: StageId,
    note: string,
  ): Promise<QuestionnaireInstance> {
    return request(`/api/v1/questionnaires/${questionnaireId}/stages/${nextStage}/transition`, {
      method: 'POST',
      body: JSON.stringify({ note }),
    });
  },
  approveQuestionnaire(questionnaireId: string, note: string): Promise<QuestionnaireInstance> {
    return request(`/api/v1/questionnaires/${questionnaireId}/reviews/approve`, {
      method: 'POST',
      body: JSON.stringify({ note }),
    });
  },
  rejectQuestionnaire(questionnaireId: string, note: string): Promise<QuestionnaireInstance> {
    return request(`/api/v1/questionnaires/${questionnaireId}/reviews/reject`, {
      method: 'POST',
      body: JSON.stringify({ note }),
    });
  },
  getTransitions(questionnaireId: string): Promise<StageTransitionRecord[]> {
    return request(`/api/v1/questionnaires/${questionnaireId}/transitions`);
  },
  generateArtifacts(questionnaireId: string): Promise<OutputArtifact[]> {
    return request(`/api/v1/questionnaires/${questionnaireId}/generate`, {
      method: 'POST',
    });
  },
  getArtifacts(questionnaireId: string): Promise<OutputArtifact[]> {
    return request(`/api/v1/questionnaires/${questionnaireId}/artifacts`);
  },
};
