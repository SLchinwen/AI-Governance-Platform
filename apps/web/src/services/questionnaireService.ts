import type { RoleId, StageId } from '../types';
import { httpApi } from './httpApi';
import * as mockApi from './mockApi';

const useRealApi = import.meta.env.VITE_USE_REAL_API === 'true';

const service = useRealApi
  ? {
      getProjects: httpApi.getProjects,
      createProject: httpApi.createProject,
      ensureQuestionnaire: httpApi.ensureQuestionnaire,
      getQuestions: httpApi.getQuestions,
      getAnswers: httpApi.getAnswers,
      saveAnswer: httpApi.saveAnswer,
      validateQuestionnaire: httpApi.validateQuestionnaire,
      getReadiness: httpApi.getReadiness,
      transitionStage: httpApi.transitionStage,
      approveQuestionnaire: httpApi.approveQuestionnaire,
      rejectQuestionnaire: httpApi.rejectQuestionnaire,
      getTransitions: httpApi.getTransitions,
      generateArtifacts: httpApi.generateArtifacts,
      getArtifacts: httpApi.getArtifacts,
    }
  : {
      getProjects: mockApi.getProjects,
      createProject: mockApi.createProject,
      ensureQuestionnaire: mockApi.ensureQuestionnaire,
      getQuestions: mockApi.getQuestions,
      getAnswers: mockApi.getAnswers,
      saveAnswer: mockApi.saveAnswer,
      validateQuestionnaire: mockApi.validateQuestionnaire,
      getReadiness: mockApi.getReadiness,
      transitionStage: mockApi.transitionStage,
      approveQuestionnaire: mockApi.approveQuestionnaire,
      rejectQuestionnaire: mockApi.rejectQuestionnaire,
      getTransitions: mockApi.getTransitions,
      generateArtifacts: mockApi.generateArtifacts,
      getArtifacts: mockApi.getArtifacts,
    };

export const questionnaireService = {
  getProjects: service.getProjects,
  createProject: service.createProject,
  ensureQuestionnaire: service.ensureQuestionnaire,
  getQuestions: (input: { questionnaireId: string; role: RoleId; stage: StageId }) =>
    service.getQuestions(input),
  getAnswers: service.getAnswers,
  saveAnswer: service.saveAnswer,
  validateQuestionnaire: service.validateQuestionnaire,
  getReadiness: service.getReadiness,
  transitionStage: service.transitionStage,
  approveQuestionnaire: service.approveQuestionnaire,
  rejectQuestionnaire: service.rejectQuestionnaire,
  getTransitions: service.getTransitions,
  generateArtifacts: service.generateArtifacts,
  getArtifacts: service.getArtifacts,
};
