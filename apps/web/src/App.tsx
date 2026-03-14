import { useMemo, useRef, useState, type ChangeEvent } from 'react';
import './App.css';
import { QuestionnaireForm } from './components/stage-form/QuestionnaireForm';
import { buildArchitectureRecommendations, buildArchitectureSummary } from './features/architecture/architectureInsights';
import { buildDesignRecommendations, buildDesignSummary } from './features/design/designInsights';
import { buildDiscoveryRecommendations, buildDiscoverySummary } from './features/discovery/discoveryInsights';
import { buildOutputPacketPreview, buildOutputRecommendations, buildOutputSummary } from './features/output/outputInsights';
import { buildPublishPacketPreview, buildPublishRecommendations, buildPublishSummary } from './features/publish/publishInsights';
import { buildReviewPacketPreview, buildReviewRecommendations, buildReviewSummary } from './features/review/reviewInsights';
import { buildValidationRecommendations, buildValidationSummary } from './features/validation/validationInsights';
import { getRequiredCompletion, getVisibleFields } from './platform/engines/questionnaire/questionnaireEngine';
import { governanceRules } from './platform/rules/governanceRules';
import { phaseLabels, stageSchemas } from './platform/schemas/stageSchemas';
import { createInitialProjectContext, getStageProgress, useProjectContextStore } from './platform/store/projectContextStore';
import { artifactTemplates } from './platform/templates/artifactTemplates';
import type { FieldValue, PhaseId, ProjectContext, StageKey, ValidationIssueRecord } from './platform/types/projectContext';

function isValidProjectContext(value: unknown): value is ProjectContext {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<ProjectContext>;
  return (
    typeof candidate.project_id === 'string' &&
    typeof candidate.project_name === 'string' &&
    typeof candidate.current_phase === 'string' &&
    typeof candidate.current_stage === 'string' &&
    !!candidate.meta &&
    !!candidate.stages &&
    !!candidate.validation &&
    !!candidate.review &&
    !!candidate.publish
  );
}

function downloadJson(filename: string, payload: unknown) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function App() {
  const { context, dispatch } = useProjectContextStore();
  const importInputRef = useRef<HTMLInputElement | null>(null);
  const [ioStatus, setIoStatus] = useState<string>('尚未匯入或匯出 project-context。');
  const activeSchema = useMemo(
    () => stageSchemas.find((schema) => schema.key === context.current_stage) ?? stageSchemas[0],
    [context.current_stage],
  );

  const progress = useMemo(() => getStageProgress(context), [context]);
  const issues = useMemo(
    () =>
      governanceRules
        .map((rule) => rule.evaluate(context))
        .filter((issue): issue is ValidationIssueRecord => issue !== null),
    [context],
  );
  const currentPhaseStages = useMemo(
    () => stageSchemas.filter((schema) => schema.phase === context.current_phase),
    [context.current_phase],
  );
  const stageAnswers = useMemo(
    () =>
      activeSchema.key === 's4'
        ? { ...context.stages.s4.derived, ...context.stages.s4.answers }
        : activeSchema.key === 's5'
          ? { ...context.stages.s5.derived, ...context.stages.s5.answers }
          : activeSchema.key === 's6'
            ? { ...context.stages.s6.derived, ...context.stages.s6.answers }
            : activeSchema.key === 's7'
              ? { ...context.stages.s7.derived, ...context.stages.s7.answers }
        : context.stages[activeSchema.key].answers,
    [activeSchema.key, context.stages],
  );
  const stageCompletion = useMemo(
    () => getRequiredCompletion(activeSchema, stageAnswers),
    [activeSchema, stageAnswers],
  );
  const visibleFields = useMemo(
    () => getVisibleFields(activeSchema, stageAnswers),
    [activeSchema, stageAnswers],
  );
  const discoverySummary = useMemo(
    () => (activeSchema.key === 's1' ? buildDiscoverySummary(stageAnswers) : null),
    [activeSchema.key, stageAnswers],
  );
  const discoveryRecommendations = useMemo(
    () => (activeSchema.key === 's1' ? buildDiscoveryRecommendations(stageAnswers) : []),
    [activeSchema.key, stageAnswers],
  );
  const architectureSummary = useMemo(
    () => (activeSchema.key === 's2' ? buildArchitectureSummary(context) : null),
    [activeSchema.key, context],
  );
  const architectureRecommendations = useMemo(
    () => (activeSchema.key === 's2' ? buildArchitectureRecommendations(context) : []),
    [activeSchema.key, context],
  );
  const designSummary = useMemo(
    () => (activeSchema.key === 's3' ? buildDesignSummary(context) : null),
    [activeSchema.key, context],
  );
  const designRecommendations = useMemo(
    () => (activeSchema.key === 's3' ? buildDesignRecommendations(context) : []),
    [activeSchema.key, context],
  );
  const validationSummary = useMemo(
    () => (activeSchema.key === 's4' ? buildValidationSummary(context) : null),
    [activeSchema.key, context],
  );
  const validationRecommendations = useMemo(
    () => (activeSchema.key === 's4' ? buildValidationRecommendations(context) : []),
    [activeSchema.key, context],
  );
  const reviewSummary = useMemo(
    () => (activeSchema.key === 's5' ? buildReviewSummary(context) : null),
    [activeSchema.key, context],
  );
  const reviewRecommendations = useMemo(
    () => (activeSchema.key === 's5' ? buildReviewRecommendations(context) : []),
    [activeSchema.key, context],
  );
  const reviewPacketPreview = useMemo(
    () => (activeSchema.key === 's5' ? buildReviewPacketPreview(context) : null),
    [activeSchema.key, context],
  );
  const outputSummary = useMemo(
    () => (activeSchema.key === 's6' ? buildOutputSummary(context) : null),
    [activeSchema.key, context],
  );
  const outputRecommendations = useMemo(
    () => (activeSchema.key === 's6' ? buildOutputRecommendations(context) : []),
    [activeSchema.key, context],
  );
  const outputPacketPreview = useMemo(
    () => (activeSchema.key === 's6' ? buildOutputPacketPreview(context) : null),
    [activeSchema.key, context],
  );
  const publishSummary = useMemo(
    () => (activeSchema.key === 's7' ? buildPublishSummary(context) : null),
    [activeSchema.key, context],
  );
  const publishRecommendations = useMemo(
    () => (activeSchema.key === 's7' ? buildPublishRecommendations(context) : []),
    [activeSchema.key, context],
  );
  const publishPacketPreview = useMemo(
    () => (activeSchema.key === 's7' ? buildPublishPacketPreview(context) : null),
    [activeSchema.key, context],
  );

  const previewArtifacts = useMemo(
    () =>
      artifactTemplates.filter((template) =>
        activeSchema.outputs.some((output) => output.includes(template.title)),
      ),
    [activeSchema.outputs],
  );

  const updateField = (stage: StageKey, fieldId: string, value: FieldValue) => {
    dispatch({ type: 'update_stage_field', stage, fieldId, value });
  };

  const handleExportContext = () => {
    downloadJson(`${context.project_id.toLowerCase()}-project-context.json`, context);
    setIoStatus(`已匯出 ${context.project_id} 的 project-context.json`);
  };

  const handleImportClick = () => {
    importInputRef.current?.click();
  };

  const handleImportContext = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const content = await file.text();
      const parsed = JSON.parse(content) as unknown;

      if (!isValidProjectContext(parsed)) {
        setIoStatus('匯入失敗：檔案不是完整的 project-context.json 格式。');
        event.target.value = '';
        return;
      }

      const base = createInitialProjectContext();
      const normalized: ProjectContext = {
        ...base,
        ...parsed,
        meta: { ...base.meta, ...parsed.meta },
        stages: { ...base.stages, ...parsed.stages },
        recommendations: { ...base.recommendations, ...parsed.recommendations },
        validation: { ...base.validation, ...parsed.validation },
        review: { ...base.review, ...parsed.review },
        artifacts: { ...base.artifacts, ...parsed.artifacts },
        publish: { ...base.publish, ...parsed.publish },
      };

      dispatch({ type: 'hydrate', context: normalized });
      setIoStatus(`已匯入 ${file.name}`);
    } catch {
      setIoStatus('匯入失敗：JSON 解析錯誤，請確認檔案內容。');
    } finally {
      event.target.value = '';
    }
  };

  const phases = Object.entries(phaseLabels) as Array<[PhaseId, string]>;

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <h1>AI 開發治理平台</h1>
          <p>單一 App Shell + 單一 project-context SSOT，承接 S1-S7 問卷、治理、輸出與發布流程。</p>
          <div className="toolbar">
            <input
              ref={importInputRef}
              className="hidden-file-input"
              type="file"
              accept=".json,application/json"
              title="匯入 project-context JSON"
              aria-label="匯入 project-context JSON"
              onChange={handleImportContext}
            />
            <button type="button" className="toolbar-button secondary" onClick={handleImportClick}>
              匯入 project-context
            </button>
            <button type="button" className="toolbar-button primary" onClick={handleExportContext}>
              匯出 project-context
            </button>
            <span className="toolbar-status">{ioStatus}</span>
          </div>
        </div>
        <div className="metrics">
          <span>{context.project_id}</span>
          <span>{phaseLabels[context.current_phase]}</span>
          <span>{activeSchema.title}</span>
        </div>
      </header>

      <main className="workspace">
        <aside className="sidebar">
          <h2>Phase / Stage 導覽</h2>
          <p className="sidebar-hint">對外顯示 3 個 Phase，內部維持 S1-S7 stage workflow。</p>
          <div className="phase-list">
            {phases.map(([phase, label]) => (
              <button
                key={phase}
                type="button"
                className={`phase-button ${context.current_phase === phase ? 'active' : ''}`}
                onClick={() => dispatch({ type: 'set_phase', phase })}
              >
                {label}
              </button>
            ))}
          </div>
          <ul className="scenario-list">
            {currentPhaseStages.map((stage) => {
              const metric = progress.find((item) => item.stage === stage.key);
              return (
                <li key={stage.key}>
                  <button
                    type="button"
                    className={`scenario-item ${context.current_stage === stage.key ? 'active' : ''}`}
                    onClick={() => dispatch({ type: 'set_stage', stage: stage.key })}
                  >
                    <div className="scenario-title-row">
                      <span>{stage.title}</span>
                      <small>
                        {metric?.completed}/{metric?.total}
                      </small>
                    </div>
                    <p>{stage.summary}</p>
                  </button>
                </li>
              );
            })}
          </ul>
        </aside>

        <section className="content-panel">
          <div className="panel-header">
            <div>
              <h2>{activeSchema.title}</h2>
              <p>{activeSchema.summary}</p>
            </div>
            <div className="panel-meta">
              <span>Current Phase: {phaseLabels[activeSchema.phase]}</span>
              <span>Schema Fields: {activeSchema.fields.length}</span>
              <span>Outputs: {activeSchema.outputs.join(', ')}</span>
            </div>
          </div>

          <section className="workbench">
            <div className="workbench-header">
              <h3>Questionnaire Engine</h3>
              <p>目前已改成外部化 schema 驅動，支援欄位分段、條件題顯示與完成度追蹤，這是後續搬移 S2-S7 的共用表單引擎。</p>
            </div>
            <div className="completion-banner">
              <div>
                <strong>目前完成度</strong>
                <p>
                  必填 {stageCompletion.completedFields.length}/{stageCompletion.requiredFields.length}
                  ，完成率 {stageCompletion.percent}%
                </p>
              </div>
              <div className="completion-stats">
                <span>可見欄位：{visibleFields.length}</span>
                <span>必填欄位：{stageCompletion.requiredFields.length}</span>
              </div>
            </div>

            <QuestionnaireForm
              stage={activeSchema.key}
              stageSchema={activeSchema}
              answers={stageAnswers}
              onChange={updateField}
            />
          </section>

          <section className="stage-strip">
            <strong>新版 project-context 預覽</strong>
            <pre>{JSON.stringify(context, null, 2)}</pre>
          </section>
        </section>

        <aside className="flow-panel">
          <h3>治理與輸出側欄</h3>
          <p>這裡是未來 Recommendation Engine / Rule Engine / Artifact Generator 的共用視圖位置。</p>

          <div className="list-block">
            <strong>即時摘要</strong>
            {discoverySummary ? (
              <ul>
                <li>專案名稱：{discoverySummary.projectName}</li>
                <li>專案類型：{discoverySummary.projectType}</li>
                <li>系統分類：{discoverySummary.systemCategory}</li>
                <li>資料敏感度：{discoverySummary.dataSensitivity}</li>
                <li>技術成熟度：{discoverySummary.technicalMaturity}</li>
                <li>既有程式基底：{discoverySummary.existingCodebaseLevel}</li>
                <li>團隊規模：{discoverySummary.teamSize}</li>
              </ul>
            ) : architectureSummary ? (
              <ul>
                <li>架構風格：{architectureSummary.architectureStyle}</li>
                <li>後端平台：{architectureSummary.backendPlatform}</li>
                <li>前端框架：{architectureSummary.frontendFramework}</li>
                <li>資料庫：{architectureSummary.databaseEngine}</li>
                <li>API 風格：{architectureSummary.apiStyle}</li>
                <li>部署平台：{architectureSummary.hostingPlatform}</li>
                <li>部署模型：{architectureSummary.deploymentModel}</li>
                <li>整合策略：{architectureSummary.integrationStrategy}</li>
                <li>觀測性基線：{architectureSummary.observabilityBaseline}</li>
                <li>AI 邊界：{architectureSummary.aiBoundary}</li>
              </ul>
            ) : designSummary ? (
              <ul>
                <li>Repo 結構：{designSummary.repoStructure}</li>
                <li>程式碼結構：{designSummary.codeStructure}</li>
                <li>模組邊界：{designSummary.moduleBoundaryDefinition}</li>
                <li>測試覆蓋率目標：{designSummary.testCoverageTarget}</li>
                <li>架構風格：{designSummary.architectureStyle}</li>
                <li>整合策略：{designSummary.integrationStrategy}</li>
              </ul>
            ) : validationSummary ? (
              <ul>
                <li>Readiness Score：{validationSummary.readinessScore}</li>
                <li>Risk Score：{validationSummary.riskScore}</li>
                <li>Confidence Score：{validationSummary.confidenceScore}</li>
                <li>Blockers：{validationSummary.blockerCount}</li>
                <li>Warnings：{validationSummary.warningCount}</li>
                <li>Owner Due 項目：{validationSummary.ownerDueCount}</li>
              </ul>
            ) : reviewSummary ? (
              <ul>
                <li>Architect Decision：{reviewSummary.architectDecision}</li>
                <li>PM Decision：{reviewSummary.pmDecision}</li>
                <li>Review Version：{reviewSummary.reviewVersion}</li>
                <li>Version Status：{reviewSummary.versionStatus}</li>
                <li>Checklist：{reviewSummary.checklistPassCount}/{reviewSummary.checklistTotal}</li>
                <li>Ready For Handoff：{reviewSummary.readyForHandoff ? 'Yes' : 'No'}</li>
              </ul>
            ) : outputSummary ? (
              <ul>
                <li>Selected Outputs：{outputSummary.selectedCount}</li>
                <li>Generated Artifacts：{outputSummary.generatedCount}</li>
                <li>Review Status：{outputSummary.reviewStatus}</li>
                <li>Review Version：{outputSummary.reviewVersion}</li>
                <li>Readiness Score：{outputSummary.readinessScore}</li>
                <li>Ready For Publish：{outputSummary.readyForPublish ? 'Yes' : 'No'}</li>
              </ul>
            ) : publishSummary ? (
              <ul>
                <li>Base Branch：{publishSummary.baseBranch}</li>
                <li>Publish Branch：{publishSummary.publishBranch}</li>
                <li>Tag：{publishSummary.tag}</li>
                <li>Reviewers：{publishSummary.reviewersCount}</li>
                <li>Output Targets：{publishSummary.outputCount}</li>
                <li>Publish Ready：{publishSummary.publishReady ? 'Yes' : 'No'}</li>
              </ul>
            ) : (
              <ul>
                <li>專案名稱：{context.project_name}</li>
                <li>目前階段：{activeSchema.title}</li>
                <li>已定義 fact base：{context.fact_base.length}</li>
              </ul>
            )}
          </div>

          <div className="list-block">
            <strong>推薦建議</strong>
            {discoveryRecommendations.length > 0 ? (
              <ul>
                {discoveryRecommendations.map((item) => (
                  <li key={item.id}>
                    <strong>{item.title}</strong>
                    <div className="hint">{item.rationale}</div>
                  </li>
                ))}
              </ul>
            ) : architectureRecommendations.length > 0 ? (
              <ul>
                {architectureRecommendations.map((item) => (
                  <li key={item.id}>
                    <strong>{item.title}</strong>
                    <div className="hint">{item.rationale}</div>
                  </li>
                ))}
              </ul>
            ) : designRecommendations.length > 0 ? (
              <ul>
                {designRecommendations.map((item) => (
                  <li key={item.id}>
                    <strong>{item.title}</strong>
                    <div className="hint">{item.rationale}</div>
                  </li>
                ))}
              </ul>
            ) : validationRecommendations.length > 0 ? (
              <ul>
                {validationRecommendations.map((item) => (
                  <li key={item.id}>
                    <strong>{item.title}</strong>
                    <div className="hint">{item.rationale}</div>
                  </li>
                ))}
              </ul>
            ) : reviewRecommendations.length > 0 ? (
              <ul>
                {reviewRecommendations.map((item) => (
                  <li key={item.id}>
                    <strong>{item.title}</strong>
                    <div className="hint">{item.rationale}</div>
                  </li>
                ))}
              </ul>
            ) : outputRecommendations.length > 0 ? (
              <ul>
                {outputRecommendations.map((item) => (
                  <li key={item.id}>
                    <strong>{item.title}</strong>
                    <div className="hint">{item.rationale}</div>
                  </li>
                ))}
              </ul>
            ) : publishRecommendations.length > 0 ? (
              <ul>
                {publishRecommendations.map((item) => (
                  <li key={item.id}>
                    <strong>{item.title}</strong>
                    <div className="hint">{item.rationale}</div>
                  </li>
                ))}
              </ul>
            ) : (
              <ul>
                <li>保留既有 S1-S7 stage 邏輯，對外包成 3 個 phase。</li>
                <li>所有答案與導出結果都回寫到單一 `project-context`。</li>
                <li>將 stage schema、治理規則與 artifact template 完全外部化。</li>
              </ul>
            )}
          </div>

          <div className="validation-box">
            <strong>治理規則檢查</strong>
            <ul>
              {activeSchema.key === 's4' && context.validation.blockers.length + context.validation.warnings.length > 0 ? (
                <>
                  {context.validation.blockers.map((issue) => (
                    <li key={issue.id} className="error-item">
                      Blocker | {issue.title}：{issue.message}
                    </li>
                  ))}
                  {context.validation.warnings.map((issue) => (
                    <li key={issue.id}>
                      Warning | {issue.title}：{issue.message}
                    </li>
                  ))}
                </>
              ) : activeSchema.key === 's5' && context.review.checklist.length > 0 ? (
                context.review.checklist.map((item) => (
                  <li key={item.id} className={item.pass ? '' : 'error-item'}>
                    {item.label}
                  </li>
                ))
              ) : activeSchema.key === 's6' ? (
                <>
                  <li className={context.review.ready_for_handoff ? '' : 'error-item'}>
                    S5 已完成核准：{context.review.ready_for_handoff ? '是' : '否'}
                  </li>
                  <li className={Object.keys(context.artifacts).length > 0 ? '' : 'error-item'}>
                    已生成 artifact：{Object.keys(context.artifacts).length}
                  </li>
                  <li className={context.validation.blockers.length === 0 ? '' : 'error-item'}>
                    Blockers 已清空：{context.validation.blockers.length === 0 ? '是' : '否'}
                  </li>
                </>
              ) : activeSchema.key === 's7' ? (
                context.publish.checklist.map((item) => (
                  <li key={item.id} className={item.pass ? '' : 'error-item'}>
                    {item.label}
                  </li>
                ))
              ) : issues.length === 0 ? (
                <li>目前無規則告警。</li>
              ) : (
                issues.map((issue) => (
                  <li key={issue.id} className={issue.level === 'error' ? 'error-item' : ''}>
                    {issue.title}：{issue.message}
                  </li>
                ))
              )}
            </ul>
          </div>

          {activeSchema.key === 's4' && context.validation.owner_due_matrix.length > 0 ? (
            <div className="artifact-preview">
              <strong>Owner / Due Matrix</strong>
              <ul className="question-list">
                {context.validation.owner_due_matrix.map((item, index) => (
                  <li key={`${item.owner}-${item.item}-${index}`}>
                    <strong>{item.owner}</strong>｜{item.stage}｜{item.due}
                    <div className="hint">{item.item}</div>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {activeSchema.key === 's5' && context.review.notes.length > 0 ? (
            <div className="artifact-preview">
              <strong>Review Focus</strong>
              <ul className="question-list">
                {context.review.notes.map((item, index) => (
                  <li key={`${item}-${index}`}>{item}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {activeSchema.key === 's6' && Object.keys(context.artifacts).length > 0 ? (
            <div className="artifact-preview">
              <strong>Generated Artifacts</strong>
              <ul className="question-list">
                {Object.values(context.artifacts).map((artifact) => (
                  <li key={artifact.id}>
                    <strong>{artifact.title}</strong>
                    <div className="hint">{artifact.type}</div>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {activeSchema.key === 's7' && context.publish.reviewer_suggestions.length > 0 ? (
            <div className="artifact-preview">
              <strong>Reviewer Suggestions</strong>
              <ul className="question-list">
                {context.publish.reviewer_suggestions.map((item, index) => (
                  <li key={`${item}-${index}`}>{item}</li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="artifact-preview">
            <strong>輸出預覽</strong>
            <ul className="question-list">
              {previewArtifacts.map((artifact) => (
                <li key={artifact.id}>
                  <strong>{artifact.title}</strong>
                  <div className="hint">{artifact.summary}</div>
                </li>
              ))}
            </ul>
            {reviewPacketPreview ? <pre>{JSON.stringify(reviewPacketPreview, null, 2)}</pre> : null}
            {outputPacketPreview ? <pre>{JSON.stringify(outputPacketPreview, null, 2)}</pre> : null}
            {publishPacketPreview ? <pre>{JSON.stringify(publishPacketPreview, null, 2)}</pre> : null}
          </div>
        </aside>
      </main>
    </div>
  );
}

export default App;
