import { useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react';
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
import { DIMENSION_LABELS, getStandardValuesForStages, loadCompanyTechStackStandard } from './platform/specs/companyStandardLoader';
import { createInitialProjectContext, getStageProgress, useProjectContextStore } from './platform/store/projectContextStore';
import { artifactTemplates } from './platform/templates/artifactTemplates';
import type { FieldValue, PhaseId, ProjectContext, StageKey, TechStackDimensionId, ValidationIssueRecord } from './platform/types/projectContext';
import type { StageSchema } from './platform/schemas/stageSchemas';

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

  const effectiveSchema = useMemo((): StageSchema => {
    const stage = context.current_stage;
    if ((stage !== 's2' && stage !== 's3') || context.techStackAdoptionMode !== 'partial_custom') return activeSchema;
    const map = context.companyStandardFieldDimensionMap;
    const customIds = context.customDimensionIds as TechStackDimensionId[];
    if (!map || customIds.length === 0) return activeSchema;
    const stageMap = map[stage];
    const allowed = new Set(customIds);
    const fields = activeSchema.fields.filter((f) => stageMap[f.id] && allowed.has(stageMap[f.id] as TechStackDimensionId));
    return { ...activeSchema, fields };
  }, [activeSchema, context.current_stage, context.techStackAdoptionMode, context.customDimensionIds, context.companyStandardFieldDimensionMap]);

  useEffect(() => {
    const mode = context.techStackAdoptionMode;
    const applied = context.stageTechSource?.s2 === 'company_standard' && context.stageTechSource?.s3 === 'company_standard';
    if ((mode !== 'full_standard' && mode !== 'partial_custom') || applied) return;
    let cancelled = false;
    loadCompanyTechStackStandard()
      .then((standard) => {
        if (cancelled) return;
        const { s2, s3 } = getStandardValuesForStages(standard);
        dispatch({
          type: 'apply_company_standard',
          payload: {
            s2,
            s3,
            fieldDimensionMap: standard.field_dimension_map,
          },
        });
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [context.techStackAdoptionMode, context.stageTechSource?.s2, context.stageTechSource?.s3, dispatch]);

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
    () => getRequiredCompletion(effectiveSchema, stageAnswers),
    [effectiveSchema, stageAnswers],
  );
  const visibleFields = useMemo(
    () => getVisibleFields(effectiveSchema, stageAnswers),
    [effectiveSchema, stageAnswers],
  );

  const isS2OrS3 = context.current_stage === 's2' || context.current_stage === 's3';
  const showStandardReferenceSummary = isS2OrS3 && context.techStackAdoptionMode === 'full_standard';
  const standardApplied =
    showStandardReferenceSummary &&
    (context.current_stage === 's2'
      ? context.stageTechSource?.s2 === 'company_standard'
      : context.stageTechSource?.s3 === 'company_standard');
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

  const updateStandardExceptionNote = (stage: 's2' | 's3', note: string) => {
    dispatch({ type: 'update_standard_exception_note', stage, note });
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
              {['s1', 's2', 's3', 's4', 's5'].includes(activeSchema.key) && (
                <span>必填 {stageCompletion.completedFields.length}/{stageCompletion.requiredFields.length} 題・完成率 {stageCompletion.percent}%</span>
              )}
              <span>Outputs: {activeSchema.outputs.join(', ')}</span>
            </div>
          </div>

          <section className="workbench">
            <div className="workbench-header">
              <h3>Questionnaire Engine</h3>
              <p>
                {showStandardReferenceSummary
                  ? '本階段已依「全程採用公司共通標準」自動帶入，以下為引用摘要。若有例外請於審核階段註明。'
                  : activeSchema.key === 's1' && context.techStackAdoptionMode == null
                    ? '新專案可於下方「技術棧採用方式」選擇「全程採用公司共通標準」，S2/S3 將自動帶入公司技術棧，無需逐項填寫。支援欄位分段、條件題顯示與完成度追蹤。'
                    : '目前已改成外部化 schema 驅動，支援欄位分段、條件題顯示與完成度追蹤，這是後續搬移 S2-S7 的共用表單引擎。'}
              </p>
            </div>
            {showStandardReferenceSummary ? (
              <div className="standard-reference-summary">
                <h4>共通標準引用摘要（依公司技術棧標準 v1）</h4>
                {standardApplied ? (
                  <>
                    <p className="hint">S2/S3 已由公司標準預填，對應 Spec v2.0 與 Checklist v2。如需修改請改選「部分客製」並於 S1 勾選要客製的維度。</p>
                    <div className="summary-table-wrap">
                      <table className="summary-table">
                        <thead>
                          <tr>
                            <th>項目</th>
                            <th>值</th>
                          </tr>
                        </thead>
                        <tbody>
                          {context.current_stage === 's2' &&
                            Object.entries(context.stages.s2.answers).map(([key, val]) => (
                              <tr key={key}>
                                <td>{key}</td>
                                <td>{Array.isArray(val) ? val.join(', ') : String(val ?? '')}</td>
                              </tr>
                            ))}
                          {context.current_stage === 's3' &&
                            Object.entries(context.stages.s3.answers).map(([key, val]) => (
                              <tr key={key}>
                                <td>{key}</td>
                                <td>{Array.isArray(val) ? val.join(', ') : String(val ?? '')}</td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="standard-confirmation-block">
                      <h4>確認與例外聲明</h4>
                      <p className="hint">上述皆依公司共通標準帶入。若有例外或需審議事項請填寫於下方，將供 S5 審核與產出引用。</p>
                      <textarea
                        className="standard-exception-note"
                        placeholder="選填。例如：本專案部署改採 AWS，其餘依標準。"
                        value={context.current_stage === 's2' ? (context.standardExceptionNotes?.s2 ?? '') : (context.standardExceptionNotes?.s3 ?? '')}
                        onChange={(e) => updateStandardExceptionNote(context.current_stage === 's2' ? 's2' : 's3', e.target.value)}
                      />
                    </div>
                  </>
                ) : (
                  <p className="hint">正在套用公司標準…</p>
                )}
              </div>
            ) : (
              <>
                {context.techStackAdoptionMode === 'partial_custom' && (context.current_stage === 's2' || context.current_stage === 's3') && context.companyStandardFieldDimensionMap && (
                  <div className="partial-custom-banner">
                    <p>
                      <strong>依公司標準的維度：</strong>
                      {['backend', 'frontend', 'user_auth', 'api_security', 'api_design', 'testing', 'cicd']
                        .filter((dim) => !context.customDimensionIds.includes(dim as TechStackDimensionId))
                        .map((dim) => DIMENSION_LABELS[dim] ?? dim)
                        .join('、')}
                      {'。'}
                    </p>
                    <p>
                      <strong>以下僅顯示客製維度：</strong>
                      {context.customDimensionIds.map((dim) => DIMENSION_LABELS[dim] ?? dim).join('、')}
                    </p>
                    <details className="standard-readonly-summary">
                      <summary>依公司標準的維度（目前帶入值，唯讀）</summary>
                      <div className="summary-table-wrap">
                        <table className="summary-table">
                          <thead>
                            <tr>
                              <th>項目</th>
                              <th>值</th>
                            </tr>
                          </thead>
                          <tbody>
                            {Object.entries(context.current_stage === 's2' ? context.stages.s2.answers : context.stages.s3.answers)
                              .filter(([fieldId]) => {
                                const map = context.current_stage === 's2' ? context.companyStandardFieldDimensionMap!.s2 : context.companyStandardFieldDimensionMap!.s3;
                                const dimId = map?.[fieldId];
                                return dimId && !context.customDimensionIds.includes(dimId as TechStackDimensionId);
                              })
                              .map(([key, val]) => (
                                <tr key={key}>
                                  <td>{key}</td>
                                  <td>{Array.isArray(val) ? val.join(', ') : String(val ?? '')}</td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    </details>
                  </div>
                )}
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
                    {context.techStackAdoptionMode === 'partial_custom' && (context.current_stage === 's2' || context.current_stage === 's3') && (
                      <span className="hint">（僅顯示客製維度）</span>
                    )}
                  </div>
                </div>
                <QuestionnaireForm
                  stage={activeSchema.key}
                  stageSchema={effectiveSchema}
                  answers={stageAnswers}
                  onChange={updateField}
                />
              </>
            )}
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
                <li>Authentication：{architectureSummary.authenticationPattern}</li>
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
                <li>CI/CD：{designSummary.ciCdWorkflow}</li>
                <li>Logging：{designSummary.loggingStrategy}</li>
                <li>Monitoring：{designSummary.monitoringStrategy}</li>
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
            {issues.length > 0 && (
              <p className="validation-box-intro">本階段觸發的規則與衍生議題如下，請依 owner 收斂後再進入下一階段。</p>
            )}
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

          {activeSchema.key === 's4' && context.validation.governance_adoption_summary ? (
            <div className="artifact-preview governance-adoption-summary">
              <strong>技術棧採用與成熟度</strong>
              <p className="maturity-label">{context.validation.governance_adoption_summary.maturity_label}</p>
              <ul className="question-list">
                <li>
                  <strong>依公司標準的維度：</strong>
                  {context.validation.governance_adoption_summary.dimensions_from_standard
                    .map((id) => DIMENSION_LABELS[id] ?? id)
                    .join('、') || '—'}
                </li>
                {context.validation.governance_adoption_summary.custom_dimensions.length > 0 && (
                  <li>
                    <strong>客製維度：</strong>
                    {context.validation.governance_adoption_summary.custom_dimensions
                      .map((id) => DIMENSION_LABELS[id] ?? id)
                      .join('、')}
                  </li>
                )}
                {context.validation.governance_adoption_summary.has_exception_notes && (
                  <li className="hint">已填寫 S2/S3 例外聲明，建議審核時確認。</li>
                )}
              </ul>
            </div>
          ) : null}

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

          {activeSchema.key === 's5' && context.validation.governance_adoption_summary ? (
            <div className="artifact-preview review-hint-block">
              <strong>審核備註建議</strong>
              <p className="hint">
                依公司標準通過時可註明 Spec/Checklist 章節（如 Spec VII）；有客製或例外聲明時請於架構師/PM 意見欄註明接受理由。
              </p>
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
