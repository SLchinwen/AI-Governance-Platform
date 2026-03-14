import cors from 'cors';
import express from 'express';

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

const projects = [];
const questionnaires = [];
const answers = [];
const transitions = [];
const artifacts = [];
const stageOrder = ['discovery', 'planning', 'design', 'validation', 'review', 'output', 'publish'];

const questionPool = [
  { id: 'project_basic.profile.name', title: '專案名稱', stage: 'discovery', role: 'pm', required: true },
  { id: 'project_basic.profile.type', title: '專案類型', stage: 'discovery', role: 'pm', required: true },
  { id: 'architecture.pattern', title: '架構風格', stage: 'planning', role: 'architect', required: true },
  { id: 'ai_collaboration.boundary', title: 'AI 禁止邊界', stage: 'planning', role: 'architect', required: true },
  { id: 'backend.runtime', title: '後端執行環境版本', stage: 'design', role: 'backend_lead', required: true },
  { id: 'api.auth.strategy', title: 'API 驗證策略', stage: 'design', role: 'backend_lead', required: true },
  { id: 'frontend.framework', title: '前端框架選型', stage: 'design', role: 'frontend_lead', required: true }
];

function uid(prefix) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

function buildValidation(questionnaireId) {
  const rows = answers.filter((item) => item.questionnaireId === questionnaireId);
  const errors = [];
  const warnings = [];

  for (const question of questionPool) {
    const answer = rows.find((item) => item.questionId === question.id);
    const value = (answer?.value || '').trim();
    if (question.required && value.length === 0) {
      errors.push({
        level: 'error',
        questionId: question.id,
        message: `必填題未完成：${question.title}`
      });
    }
    if (!question.required && value.length === 0) {
      warnings.push({
        level: 'warning',
        questionId: question.id,
        message: `建議補充：${question.title}`
      });
    }
  }

  return { questionnaireId, errors, warnings };
}

function getReadinessScore(questionnaireId) {
  const validation = buildValidation(questionnaireId);
  const requiredTotal = questionPool.filter((item) => item.required).length;
  const requiredAnswered = requiredTotal - validation.errors.length;
  const score = Math.max(0, Math.round((requiredAnswered / Math.max(requiredTotal, 1)) * 100));
  return { validation, score, requiredTotal, requiredAnswered };
}

function canMoveForward(currentStage, nextStage) {
  const currentIdx = stageOrder.indexOf(currentStage);
  const nextIdx = stageOrder.indexOf(nextStage);
  return nextIdx === currentIdx + 1;
}

function buildArtifacts(questionnaireId) {
  const questionnaire = questionnaires.find((item) => item.id === questionnaireId);
  const rows = answers.filter((item) => item.questionnaireId === questionnaireId);
  const project = projects.find((item) => item.id === questionnaire?.projectId);
  const projectName = project?.name || '未命名專案';
  const now = new Date().toISOString();
  const { score, requiredAnswered, requiredTotal } = getReadinessScore(questionnaireId);

  const techStack = {
    project: projectName,
    stage: questionnaire?.currentStage || 'discovery',
    answered: rows.length,
    generatedAt: now
  };

  return [
    {
      id: uid('art'),
      questionnaireId,
      type: 'tech-stack.json',
      content: JSON.stringify(techStack, null, 2),
      generatedAt: now
    },
    {
      id: uid('art'),
      questionnaireId,
      type: 'ai-context.md',
      content: `# AI Context\n\n- Project: ${projectName}\n- Stage: ${questionnaire?.currentStage || 'discovery'}\n- Answers: ${rows.length}\n`,
      generatedAt: now
    },
    {
      id: uid('art'),
      questionnaireId,
      type: 'readiness-report.md',
      content: `# Readiness Report\n\n- Score: ${score}\n- Required: ${requiredAnswered}/${requiredTotal}\n`,
      generatedAt: now
    }
  ];
}

app.get('/health', (_, res) => {
  res.json({ ok: true });
});

app.get('/api/v1/projects', (_, res) => {
  res.json(projects);
});

app.post('/api/v1/projects', (req, res) => {
  const { name, type } = req.body ?? {};
  if (!name || !type) {
    res.status(400).json({ message: 'name and type are required' });
    return;
  }

  const project = {
    id: uid('prj'),
    name,
    type,
    createdAt: new Date().toISOString()
  };
  projects.unshift(project);
  res.status(201).json(project);
});

app.post('/api/v1/projects/:projectId/questionnaires', (req, res) => {
  const { projectId } = req.params;
  const existed = questionnaires.find((row) => row.projectId === projectId);
  if (existed) {
    res.json(existed);
    return;
  }

  const questionnaire = {
    id: uid('qnr'),
    projectId,
    version: 1,
    currentStage: 'discovery'
  };
  questionnaires.push(questionnaire);
  res.status(201).json(questionnaire);
});

app.get('/api/v1/questionnaires/:questionnaireId/questions', (req, res) => {
  const { role, stage } = req.query;
  const rows = questionPool.filter((item) => item.role === role && item.stage === stage);
  res.json(rows);
});

app.get('/api/v1/questionnaires/:questionnaireId/answers', (req, res) => {
  const { questionnaireId } = req.params;
  res.json(answers.filter((item) => item.questionnaireId === questionnaireId));
});

app.post('/api/v1/questionnaires/:questionnaireId/answers', (req, res) => {
  const { questionnaireId } = req.params;
  const { questionId, value } = req.body ?? {};
  if (!questionId) {
    res.status(400).json({ message: 'questionId is required' });
    return;
  }

  const existed = answers.find(
    (item) => item.questionnaireId === questionnaireId && item.questionId === questionId
  );

  if (existed) {
    existed.value = value ?? '';
    existed.updatedAt = new Date().toISOString();
    res.json(existed);
    return;
  }

  const record = {
    questionnaireId,
    questionId,
    value: value ?? '',
    updatedAt: new Date().toISOString()
  };
  answers.push(record);
  res.status(201).json(record);
});

app.put('/api/v1/questionnaires/:questionnaireId/answers/:questionId', (req, res) => {
  const { questionnaireId, questionId } = req.params;
  const { value } = req.body ?? {};

  const existed = answers.find(
    (item) => item.questionnaireId === questionnaireId && item.questionId === questionId
  );
  if (!existed) {
    res.status(404).json({ message: 'answer not found' });
    return;
  }

  existed.value = value ?? '';
  existed.updatedAt = new Date().toISOString();
  res.json(existed);
});

app.post('/api/v1/questionnaires/:questionnaireId/validate', (req, res) => {
  const { questionnaireId } = req.params;
  res.json(buildValidation(questionnaireId));
});

app.get('/api/v1/questionnaires/:questionnaireId/readiness', (req, res) => {
  const { questionnaireId } = req.params;
  const { score, requiredTotal, requiredAnswered } = getReadinessScore(questionnaireId);

  res.json({
    questionnaireId,
    score,
    requiredTotal,
    requiredAnswered
  });
});

app.post('/api/v1/questionnaires/:questionnaireId/stages/:nextStage/transition', (req, res) => {
  const { questionnaireId, nextStage } = req.params;
  const note = req.body?.note || '';
  const questionnaire = questionnaires.find((item) => item.id === questionnaireId);
  if (!questionnaire) {
    res.status(404).json({ message: 'questionnaire not found' });
    return;
  }
  if (!canMoveForward(questionnaire.currentStage, nextStage)) {
    res.status(400).json({ message: 'invalid stage transition' });
    return;
  }

  if (['review', 'output', 'publish'].includes(nextStage)) {
    const { validation, score } = getReadinessScore(questionnaireId);
    if (validation.errors.length > 0 || score < 70) {
      res.status(400).json({ message: 'gate check failed (require 0 errors and readiness >= 70)' });
      return;
    }
  }

  const fromStage = questionnaire.currentStage;
  questionnaire.currentStage = nextStage;
  transitions.unshift({
    questionnaireId,
    fromStage,
    toStage: nextStage,
    action: 'transition',
    note,
    at: new Date().toISOString()
  });
  res.json(questionnaire);
});

app.post('/api/v1/questionnaires/:questionnaireId/reviews/approve', (req, res) => {
  const { questionnaireId } = req.params;
  const note = req.body?.note || 'approved';
  const questionnaire = questionnaires.find((item) => item.id === questionnaireId);
  if (!questionnaire) {
    res.status(404).json({ message: 'questionnaire not found' });
    return;
  }
  const currentIdx = stageOrder.indexOf(questionnaire.currentStage);
  const nextStage = stageOrder[Math.min(currentIdx + 1, stageOrder.length - 1)];
  if (!canMoveForward(questionnaire.currentStage, nextStage)) {
    res.status(400).json({ message: 'already last stage' });
    return;
  }
  const { validation, score } = getReadinessScore(questionnaireId);
  if (validation.errors.length > 0 || score < 70) {
    res.status(400).json({ message: 'gate check failed (require 0 errors and readiness >= 70)' });
    return;
  }
  const fromStage = questionnaire.currentStage;
  questionnaire.currentStage = nextStage;
  transitions.unshift({
    questionnaireId,
    fromStage,
    toStage: nextStage,
    action: 'approve',
    note,
    at: new Date().toISOString()
  });
  res.json(questionnaire);
});

app.post('/api/v1/questionnaires/:questionnaireId/reviews/reject', (req, res) => {
  const { questionnaireId } = req.params;
  const note = req.body?.note || 'rejected';
  const questionnaire = questionnaires.find((item) => item.id === questionnaireId);
  if (!questionnaire) {
    res.status(404).json({ message: 'questionnaire not found' });
    return;
  }
  const currentIdx = stageOrder.indexOf(questionnaire.currentStage);
  const prevStage = stageOrder[Math.max(currentIdx - 1, 0)];
  const fromStage = questionnaire.currentStage;
  questionnaire.currentStage = prevStage;
  transitions.unshift({
    questionnaireId,
    fromStage,
    toStage: prevStage,
    action: 'reject',
    note,
    at: new Date().toISOString()
  });
  res.json(questionnaire);
});

app.get('/api/v1/questionnaires/:questionnaireId/transitions', (req, res) => {
  const { questionnaireId } = req.params;
  res.json(transitions.filter((item) => item.questionnaireId === questionnaireId));
});

app.post('/api/v1/questionnaires/:questionnaireId/generate', (req, res) => {
  const { questionnaireId } = req.params;
  const questionnaire = questionnaires.find((item) => item.id === questionnaireId);
  if (!questionnaire) {
    res.status(404).json({ message: 'questionnaire not found' });
    return;
  }

  const { validation, score } = getReadinessScore(questionnaireId);
  if (validation.errors.length > 0 || score < 70) {
    res.status(400).json({ message: 'gate check failed (require 0 errors and readiness >= 70)' });
    return;
  }

  const generated = buildArtifacts(questionnaireId);
  const remains = artifacts.filter((item) => item.questionnaireId !== questionnaireId);
  artifacts.length = 0;
  artifacts.push(...remains, ...generated);
  res.json(generated);
});

app.get('/api/v1/questionnaires/:questionnaireId/artifacts', (req, res) => {
  const { questionnaireId } = req.params;
  res.json(artifacts.filter((item) => item.questionnaireId === questionnaireId));
});

app.listen(port, () => {
  console.log(`questionnaire-api listening on http://localhost:${port}`);
});
