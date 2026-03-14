import { useEffect, useMemo, useState } from 'react';
import { roleLabels, stageLabels } from '../data/programCatalog';
import { questionnaireService } from '../services/questionnaireService';
import type {
  AnswerDraft,
  ProjectRecord,
  OutputArtifact,
  ReadinessReport,
  RoleId,
  StageId,
  StageTransitionRecord,
  ValidationSummary,
} from '../types';

const stageOptions: StageId[] = ['discovery', 'planning', 'design', 'validation', 'review', 'output', 'publish'];
const roleOptions: RoleId[] = ['pm', 'architect', 'backend_lead', 'frontend_lead'];
const stageOrder: StageId[] = ['discovery', 'planning', 'design', 'validation', 'review', 'output', 'publish'];

export function DevelopmentWorkbench() {
  const [projects, setProjects] = useState<ProjectRecord[]>([]);
  const [projectName, setProjectName] = useState('');
  const [projectType, setProjectType] = useState('web_application');
  const [activeProjectId, setActiveProjectId] = useState('');
  const [questionnaireId, setQuestionnaireId] = useState('');
  const [activeRole, setActiveRole] = useState<RoleId>('pm');
  const [activeStage, setActiveStage] = useState<StageId>('discovery');
  const [questions, setQuestions] = useState<{ id: string; title: string; required: boolean }[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [validating, setValidating] = useState(false);
  const [validation, setValidation] = useState<ValidationSummary | null>(null);
  const [readiness, setReadiness] = useState<ReadinessReport | null>(null);
  const [currentStage, setCurrentStage] = useState<StageId>('discovery');
  const [reviewNote, setReviewNote] = useState('');
  const [transitions, setTransitions] = useState<StageTransitionRecord[]>([]);
  const [transitioning, setTransitioning] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [artifacts, setArtifacts] = useState<OutputArtifact[]>([]);
  const [selectedArtifactId, setSelectedArtifactId] = useState('');
  const [uiMessage, setUiMessage] = useState('');
  const [wizardMode, setWizardMode] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    void questionnaireService.getProjects().then((rows) => setProjects(rows));
  }, []);

  useEffect(() => {
    if (!activeProjectId) return;
    void questionnaireService
      .ensureQuestionnaire(activeProjectId)
      .then((instance) => {
        setQuestionnaireId(instance.id);
        setCurrentStage(instance.currentStage);
      });
  }, [activeProjectId]);

  useEffect(() => {
    if (!questionnaireId) return;
    void questionnaireService
      .getQuestions({ questionnaireId, role: activeRole, stage: activeStage })
      .then((rows) => {
      setQuestions(rows.map((item) => ({ id: item.id, title: item.title, required: item.required })));
    });
  }, [activeRole, activeStage, questionnaireId]);

  useEffect(() => {
    if (!questionnaireId) return;
    void questionnaireService.getAnswers(questionnaireId).then((rows: AnswerDraft[]) => {
      const mapped = rows.reduce<Record<string, string>>((acc, row) => {
        acc[row.questionId] = row.value;
        return acc;
      }, {});
      setAnswers(mapped);
    });
  }, [questionnaireId]);

  useEffect(() => {
    if (!questionnaireId) return;
    void questionnaireService.getTransitions(questionnaireId).then((rows) => setTransitions(rows));
  }, [questionnaireId]);

  useEffect(() => {
    if (!questionnaireId) return;
    void questionnaireService.getArtifacts(questionnaireId).then((rows) => {
      setArtifacts(rows);
      if (rows.length > 0) setSelectedArtifactId(rows[0].id);
    });
  }, [questionnaireId]);

  const canCreate = projectName.trim().length > 0;

  const progressText = useMemo(() => {
    if (!questions.length) return '本角色/階段目前無題目。';
    const answered = questions.filter((item) => (answers[item.id] || '').trim() !== '').length;
    return `已填 ${answered} / ${questions.length}`;
  }, [answers, questions]);

  const quickHint = useMemo(() => {
    if (!activeProjectId) return '下一步：先建立一個專案。';
    if (questions.length === 0) return '下一步：先選擇角色與階段，載入題目。';
    if (!readiness) return '下一步：先完成幾題後按「執行驗證」。';
    if (readiness.score < 70) return '下一步：先把必填題補齊，讓分數達到 70 以上。';
    if (artifacts.length === 0) return '下一步：可直接按「生成標準產出」。';
    return '已完成基本流程，可檢視產出內容。';
  }, [activeProjectId, artifacts.length, questions.length, readiness]);

  async function handleCreateProject() {
    if (!canCreate) return;
    try {
      const created = await questionnaireService.createProject({
        name: projectName.trim(),
        type: projectType,
      });
      setProjects((prev) => [created, ...prev]);
      setProjectName('');
      setActiveProjectId(created.id);
      setUiMessage('已建立專案，請進入步驟 2 載入題目。');
      setCurrentStep(2);
    } catch (error) {
      setUiMessage(`建立失敗：${error instanceof Error ? error.message : '未知錯誤'}`);
    }
  }

  async function handleSave(questionId: string) {
    if (!questionnaireId) return;
    setSaving(true);
    try {
      await questionnaireService.saveAnswer(questionnaireId, questionId, answers[questionId] || '');
      setUiMessage('草稿已儲存。');
    } catch (error) {
      setUiMessage(`儲存失敗：${error instanceof Error ? error.message : '未知錯誤'}`);
    } finally {
      setSaving(false);
    }
  }

  async function handleValidate() {
    if (!questionnaireId) return;
    setValidating(true);
    try {
      const result = await questionnaireService.validateQuestionnaire(questionnaireId);
      const readinessResult = await questionnaireService.getReadiness(questionnaireId);
      setValidation(result);
      setReadiness(readinessResult);
      setUiMessage('驗證完成。');
      setCurrentStep(5);
    } catch (error) {
      setUiMessage(`驗證失敗：${error instanceof Error ? error.message : '未知錯誤'}`);
    } finally {
      setValidating(false);
    }
  }

  const nextStage = useMemo(() => {
    const idx = stageOrder.indexOf(currentStage);
    return stageOrder[Math.min(idx + 1, stageOrder.length - 1)];
  }, [currentStage]);

  async function refreshTransitions() {
    if (!questionnaireId) return;
    const rows = await questionnaireService.getTransitions(questionnaireId);
    setTransitions(rows);
  }

  async function refreshArtifacts() {
    if (!questionnaireId) return;
    const rows = await questionnaireService.getArtifacts(questionnaireId);
    setArtifacts(rows);
    if (rows.length > 0) setSelectedArtifactId(rows[0].id);
  }

  async function handleApprove() {
    if (!questionnaireId) return;
    setTransitioning(true);
    try {
      const updated = await questionnaireService.approveQuestionnaire(questionnaireId, reviewNote);
      setCurrentStage(updated.currentStage);
      setActiveStage(updated.currentStage);
      await refreshTransitions();
      setUiMessage('已核准並推進到下一階段。');
      setCurrentStep(6);
    } catch (error) {
      setUiMessage(`核准失敗：${error instanceof Error ? error.message : '未知錯誤'}`);
    } finally {
      setTransitioning(false);
    }
  }

  async function handleReject() {
    if (!questionnaireId) return;
    setTransitioning(true);
    try {
      const updated = await questionnaireService.rejectQuestionnaire(questionnaireId, reviewNote);
      setCurrentStage(updated.currentStage);
      setActiveStage(updated.currentStage);
      await refreshTransitions();
      setUiMessage('已退回上一階段。');
    } catch (error) {
      setUiMessage(`退回失敗：${error instanceof Error ? error.message : '未知錯誤'}`);
    } finally {
      setTransitioning(false);
    }
  }

  async function handleTransition() {
    if (!questionnaireId) return;
    setTransitioning(true);
    try {
      const updated = await questionnaireService.transitionStage(questionnaireId, nextStage, reviewNote);
      setCurrentStage(updated.currentStage);
      setActiveStage(updated.currentStage);
      await refreshTransitions();
      setUiMessage('已完成階段流轉。');
      setCurrentStep(6);
    } catch (error) {
      setUiMessage(`流轉失敗：${error instanceof Error ? error.message : '未知錯誤'}`);
    } finally {
      setTransitioning(false);
    }
  }

  async function handleGenerate() {
    if (!questionnaireId) return;
    setGenerating(true);
    try {
      await questionnaireService.generateArtifacts(questionnaireId);
      await refreshArtifacts();
      setUiMessage('產出已生成。');
    } catch (error) {
      setUiMessage(`生成失敗：${error instanceof Error ? error.message : '未知錯誤'}`);
    } finally {
      setGenerating(false);
    }
  }

  const selectedArtifact = useMemo(
    () => artifacts.find((item) => item.id === selectedArtifactId) ?? artifacts[0] ?? null,
    [artifacts, selectedArtifactId],
  );

  function stepClass(step: number): string {
    return wizardMode && currentStep !== step ? 'work-card hidden-step' : 'work-card';
  }

  return (
    <section className="workbench">
      <header className="workbench-header">
        <h2>UI 開發工作台（S1-S6）</h2>
        <p>這是一個 6 步驟填單流程：建立專案，載入題目，填寫，驗證，審核，產出。</p>
        <div className="wizard-toggle">
          <label>
            <input
              type="checkbox"
              checked={wizardMode}
              onChange={(event) => setWizardMode(event.target.checked)}
            />
            精靈模式（一次只顯示一個步驟）
          </label>
        </div>
        <div className="step-nav">
          {[1, 2, 3, 4, 5, 6].map((step) => (
            <button
              key={step}
              type="button"
              className={step === currentStep ? 'step-chip active' : 'step-chip'}
              onClick={() => setCurrentStep(step)}
            >
              步驟 {step}
            </button>
          ))}
        </div>
        <p className="quick-hint">{quickHint}</p>
        {uiMessage ? <p className="ui-message">{uiMessage}</p> : null}
      </header>

      <div className="workbench-grid">
        <article className={stepClass(1)}>
          <h3>步驟 1：建立專案</h3>
          <label>
            專案名稱
            <input
              value={projectName}
              onChange={(event) => setProjectName(event.target.value)}
              placeholder="例如：電子發票治理平台"
            />
          </label>
          <label>
            專案類型
            <select value={projectType} onChange={(event) => setProjectType(event.target.value)}>
              <option value="web_application">Web 應用系統</option>
              <option value="api_platform">API 平台</option>
              <option value="integration">系統整合</option>
            </select>
          </label>
          <button type="button" onClick={handleCreateProject} disabled={!canCreate}>
            建立專案
          </button>

          <div className="list-block">
            <strong>專案清單</strong>
            {projects.length === 0 ? (
              <p>尚無專案</p>
            ) : (
              <ul>
                {projects.map((project) => (
                  <li key={project.id}>
                    <button
                      type="button"
                      className={project.id === activeProjectId ? 'plain-btn active' : 'plain-btn'}
                      onClick={() => setActiveProjectId(project.id)}
                    >
                      {project.name}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </article>

        <article className={stepClass(2)}>
          <h3>步驟 2：選擇誰填、填哪個階段</h3>
          <label>
            填單角色
            <select
              value={activeRole}
              onChange={(event) => setActiveRole(event.target.value as RoleId)}
              disabled={!questionnaireId}
            >
              {roleOptions.map((roleId) => (
                <option key={roleId} value={roleId}>
                  {roleLabels[roleId]}
                </option>
              ))}
            </select>
          </label>
          <label>
            題目階段
            <select
              value={activeStage}
              onChange={(event) => setActiveStage(event.target.value as StageId)}
              disabled={!questionnaireId}
            >
              {stageOptions.map((stageId) => (
                <option key={stageId} value={stageId}>
                  {stageLabels[stageId]}
                </option>
              ))}
            </select>
          </label>
          <p className="hint">問卷目前階段：{stageLabels[currentStage]}</p>
          <p className="hint">{progressText}</p>
          <ul className="question-list">
            {questions.map((question) => (
              <li key={question.id}>
                <strong>{question.title}</strong>
                <small>{question.id}</small>
              </li>
            ))}
          </ul>
        </article>

        <article className={stepClass(3)}>
          <h3>步驟 3：填答案並儲存</h3>
          {questions.length === 0 ? (
            <p className="hint">請先選擇專案、角色與階段。</p>
          ) : (
            <div className="answer-list">
              {questions.map((question) => (
                <div className="answer-item" key={question.id}>
                  <label>
                    {question.title} {question.required ? '(必填)' : ''}
                    <textarea
                      value={answers[question.id] || ''}
                      onChange={(event) =>
                        setAnswers((prev) => ({ ...prev, [question.id]: event.target.value }))
                      }
                      placeholder="輸入答案或草稿"
                    />
                  </label>
                  <button type="button" onClick={() => void handleSave(question.id)} disabled={saving}>
                    儲存草稿
                  </button>
                </div>
              ))}
            </div>
          )}
        </article>

        <article className={stepClass(4)}>
          <h3>步驟 4：檢查是否可進下一步</h3>
          <button type="button" onClick={() => void handleValidate()} disabled={!questionnaireId || validating}>
            {validating ? '驗證中...' : '執行驗證'}
          </button>

          {readiness && (
            <div className="readiness-box">
              <strong>Readiness 分數：{readiness.score}</strong>
              <p>
                必填完成：{readiness.requiredAnswered}/{readiness.requiredTotal}
              </p>
            </div>
          )}

          {validation && (
            <div className="validation-box">
              <p>Errors：{validation.errors.length}</p>
              <p>Warnings：{validation.warnings.length}</p>
              <ul>
                {validation.errors.map((item) => (
                  <li key={`${item.questionId}-${item.message}`} className="error-item">
                    {item.message}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </article>

        <article className={stepClass(5)}>
          <h3>步驟 5：審核與流轉</h3>
          <p className="hint">
            目前：{stageLabels[currentStage]}，下一階段：{stageLabels[nextStage]}
          </p>
          <label>
            審核備註
            <input
              value={reviewNote}
              onChange={(event) => setReviewNote(event.target.value)}
              placeholder="例如：驗證通過，進入下一階段"
            />
          </label>
          <div className="review-actions">
            <button type="button" onClick={() => void handleTransition()} disabled={transitioning || !questionnaireId}>
              流轉到下一階段
            </button>
            <button type="button" onClick={() => void handleApprove()} disabled={transitioning || !questionnaireId}>
              Approve
            </button>
            <button type="button" onClick={() => void handleReject()} disabled={transitioning || !questionnaireId}>
              Reject
            </button>
          </div>
          <div className="list-block">
            <strong>流轉紀錄</strong>
            {transitions.length === 0 ? (
              <p>尚無流轉紀錄</p>
            ) : (
              <ul>
                {transitions.slice(0, 5).map((item) => (
                  <li key={`${item.at}-${item.action}`}>
                    [{item.action}] {stageLabels[item.fromStage]} → {stageLabels[item.toStage]}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </article>

        <article className={stepClass(6)}>
          <h3>步驟 6：生成文件產出</h3>
          <button type="button" onClick={() => void handleGenerate()} disabled={generating || !questionnaireId}>
            {generating ? '產生中...' : '生成標準產出'}
          </button>

          <div className="list-block">
            <strong>產出清單</strong>
            {artifacts.length === 0 ? (
              <p>尚未生成產出</p>
            ) : (
              <ul>
                {artifacts.map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      className={item.id === selectedArtifact?.id ? 'plain-btn active' : 'plain-btn'}
                      onClick={() => setSelectedArtifactId(item.id)}
                    >
                      {item.type}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {selectedArtifact && (
            <div className="artifact-preview">
              <strong>內容預覽：{selectedArtifact.type}</strong>
              <pre>{selectedArtifact.content}</pre>
            </div>
          )}
        </article>
      </div>
      {wizardMode ? (
        <div className="wizard-footer">
          <button type="button" onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}>
            上一步
          </button>
          <button type="button" onClick={() => setCurrentStep((prev) => Math.min(6, prev + 1))}>
            下一步
          </button>
        </div>
      ) : null}
    </section>
  );
}
