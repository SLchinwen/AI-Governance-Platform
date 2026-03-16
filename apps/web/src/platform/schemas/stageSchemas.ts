import type { PhaseId, StageKey } from '../types/projectContext';

export interface StageFieldOption {
  value: string;
  label: string;
}

export interface StageFieldCondition {
  fieldId: string;
  operator: 'equals' | 'in';
  values: string[];
}

export interface StageFieldSchema {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'single_select' | 'multi_select' | 'number';
  required: boolean;
  section: string;
  ownerRoles: string[];
  description: string;
  placeholder?: string;
  conditions?: StageFieldCondition[];
  options?: StageFieldOption[];
}

export interface StageSchema {
  key: StageKey;
  title: string;
  phase: PhaseId;
  summary: string;
  outputs: string[];
  fields: StageFieldSchema[];
}

export const phaseLabels: Record<PhaseId, string> = {
  phase_a: 'Phase A 專案啟動',
  phase_b: 'Phase B 架構與設計',
  phase_c: 'Phase C 治理、輸出與發布',
};

export const stageOrder: StageKey[] = ['s1', 's2', 's3', 's4', 's5', 's6', 's7'];

export const stageSchemas: StageSchema[] = [
  {
    key: 's1',
    title: 'S1 Discovery',
    phase: 'phase_a',
    summary: '定義專案背景、系統類型、成熟度與 AI 治理啟動基線。',
    outputs: ['project-context.json', 's2 handoff'],
    fields: [
      { id: 'project_basic.profile.name', label: '專案名稱', type: 'text', required: true, section: '專案概況', ownerRoles: ['pm'], description: '正式專案名稱，會進入所有 artifact 與 Repo 命名。', placeholder: '例如 AI Development Governance Platform' },
      { id: 'project_basic.profile.type', label: '專案類型', type: 'single_select', required: true, section: '專案概況', ownerRoles: ['pm'], description: '決定後續題組與推薦方向。', options: [{ value: 'web_application', label: 'Web 應用' }, { value: 'api_platform', label: 'API 平台' }, { value: 'integration', label: '整合型系統' }] },
      { id: 'project_basic.system_category', label: '系統分類', type: 'single_select', required: true, section: '專案概況', ownerRoles: ['pm', 'architect'], description: '區分平台型、業務型、共用服務型等系統分類。', options: [{ value: 'business_system', label: '業務系統' }, { value: 'platform_system', label: '平台系統' }, { value: 'shared_service', label: '共用服務' }] },
      { id: 'project_basic.technical_maturity', label: '技術成熟度', type: 'single_select', required: true, section: '專案概況', ownerRoles: ['pm', 'architect'], description: '評估需求與技術決策是否已足夠穩定。', options: [{ value: 'exploratory', label: '探索中' }, { value: 'defined', label: '已定義' }, { value: 'stable', label: '穩定可實作' }] },
      { id: 'project_basic.existing_codebase_level', label: '既有程式基底程度', type: 'single_select', required: true, section: '專案概況', ownerRoles: ['architect'], description: '判斷後續是 greenfield、延伸或重構。', options: [{ value: 'none', label: '無既有程式' }, { value: 'partial', label: '部分既有系統' }, { value: 'mature', label: '成熟既有系統' }] },
      { id: 'project_basic.profile.timeline', label: '預計時程', type: 'text', required: true, section: '專案概況', ownerRoles: ['pm'], description: '用固定格式描述啟動、MVP 與上線時程。', placeholder: '例如 啟動: 2026-04-01 / MVP: 2026-06-15 / GA: 2026-08-01' },
      { id: 'project_basic.profile.team_size', label: '團隊規模', type: 'number', required: true, section: '專案概況', ownerRoles: ['pm'], description: '估計參與開發與治理的人數。', placeholder: '例如 6' },
      { id: 'project_basic.compliance.data_sensitivity', label: '資料敏感度', type: 'single_select', required: true, section: '治理與風險', ownerRoles: ['pm'], description: '決定 AI 可用邊界與治理強度。', options: [{ value: 'internal', label: 'Internal' }, { value: 'confidential', label: 'Confidential' }, { value: 'restricted', label: 'Restricted' }] },
      { id: 'project_basic.integration.level', label: '整合依賴程度', type: 'single_select', required: true, section: '治理與風險', ownerRoles: ['pm', 'architect'], description: '判斷是否會串接內外部系統，影響 S2/S3 契約與風險設計。', options: [{ value: 'standalone', label: 'Standalone' }, { value: 'internal_systems', label: '內部系統整合' }, { value: 'external_partners', label: '外部夥伴整合' }, { value: 'mixed', label: '混合整合' }] },
      { id: 'project_basic.artifact.readiness', label: '前置文件完整度', type: 'single_select', required: true, section: '治理與風險', ownerRoles: ['pm', 'architect'], description: '評估目前能提供給 AI 的輸入品質。', options: [{ value: 'minimal', label: 'Minimal' }, { value: 'standard', label: 'Standard' }, { value: 'ready_for_codegen', label: 'Ready for Codegen' }] },
      { id: 'project_basic.governance.ai_execution_boundary', label: 'AI 執行邊界', type: 'single_select', required: true, section: '治理與風險', ownerRoles: ['pm', 'architect', 'security_lead'], description: '高敏感資料專案需明確定義 AI 可用邊界。', conditions: [{ fieldId: 'project_basic.compliance.data_sensitivity', operator: 'in', values: ['confidential', 'restricted'] }], options: [{ value: 'private_model_only', label: 'Private Model Only' }, { value: 'no_code_generation_only_analysis', label: 'Only Analysis, No Codegen' }, { value: 'approved_models_only', label: 'Approved Models Only' }] },
      { id: 'project_basic.tech_stack_adoption_mode', label: '技術棧採用方式', type: 'single_select', required: true, section: '技術棧標準', ownerRoles: ['pm', 'architect'], description: '全程採用公司共通標準時，S2/S3 將自動帶入標準值並僅顯示確認摘要；部分客製時僅填寫勾選之維度。', options: [{ value: 'full_standard', label: '全程採用公司共通標準' }, { value: 'partial_custom', label: '部分採用、部分客製' }] },
      { id: 'project_basic.tech_stack_custom_dimensions', label: '客製維度（僅部分客製時填寫）', type: 'multi_select', required: false, section: '技術棧標準', ownerRoles: ['architect'], description: '勾選需要客製的技術維度，其餘維度將依公司標準帶入。', conditions: [{ fieldId: 'project_basic.tech_stack_adoption_mode', operator: 'equals', values: ['partial_custom'] }], options: [{ value: 'backend', label: '後端技術' }, { value: 'frontend', label: '前端技術' }, { value: 'user_auth', label: '使用者驗證' }, { value: 'api_security', label: '服務間驗證 (API Security)' }, { value: 'api_design', label: 'API 設計' }, { value: 'testing', label: '測試與品質' }, { value: 'cicd', label: 'CI/CD 與流程' }] },
    ],
  },
  {
    key: 's2',
    title: 'S2 Architecture',
    phase: 'phase_b',
    summary: '定義架構方向、整合方式、部署模型與觀測性基線。',
    outputs: ['s2 context', 's3 handoff'],
    fields: [
      { id: 'architecture.pattern.style', label: '架構風格', type: 'single_select', required: true, section: '架構方向', ownerRoles: ['architect'], description: '系統的主體架構模式。', options: [{ value: 'modular_monolith', label: 'Modular Monolith' }, { value: 'microservices', label: 'Microservices' }, { value: 'layered', label: 'Layered' }] },
      { id: 'backend.runtime.platform', label: 'Backend Framework', type: 'single_select', required: true, section: '架構方向', ownerRoles: ['architect', 'backend_lead'], description: '後端主平台選型。', options: [{ value: 'dotnet', label: '.NET' }, { value: 'nodejs', label: 'Node.js' }, { value: 'java_spring', label: 'Java Spring Boot' }] },
      { id: 'frontend.framework.choice', label: 'Frontend Framework', type: 'single_select', required: true, section: '架構方向', ownerRoles: ['architect', 'frontend_lead'], description: '前端框架選型。', options: [{ value: 'react', label: 'React' }, { value: 'vue', label: 'Vue' }, { value: 'angular', label: 'Angular' }] },
      { id: 'database.primary.engine', label: '主要資料庫', type: 'single_select', required: true, section: '架構方向', ownerRoles: ['architect', 'backend_lead'], description: '主要資料庫引擎。', options: [{ value: 'azure_sql', label: 'Azure SQL' }, { value: 'postgresql', label: 'PostgreSQL' }, { value: 'mongodb', label: 'MongoDB' }] },
      { id: 'api.style.type', label: 'API Style', type: 'single_select', required: true, section: '架構方向', ownerRoles: ['architect', 'backend_lead'], description: '前後端與系統整合的 API 風格。', options: [{ value: 'restful', label: 'REST' }, { value: 'graphql', label: 'GraphQL' }, { value: 'rpc', label: 'RPC' }] },
      { id: 'security.authentication.pattern', label: 'Authentication Pattern', type: 'single_select', required: true, section: '架構方向', ownerRoles: ['architect', 'backend_lead', 'security_lead'], description: '定義主要身份驗證模式，讓後續 API、前端與 AI 生成保持一致。', options: [{ value: 'session_cookie', label: 'Session + Cookie' }, { value: 'jwt_bearer', label: 'JWT Bearer' }, { value: 'oauth_oidc', label: 'OAuth / OIDC' }, { value: 'api_key_internal', label: 'Internal API Key' }] },
      { id: 'architecture.communication.style', label: '服務間通訊方式', type: 'single_select', required: true, section: '架構方向', ownerRoles: ['architect'], description: '只有在多服務/微服務情境下需要定義。', conditions: [{ fieldId: 'architecture.pattern.style', operator: 'equals', values: ['microservices'] }], options: [{ value: 'rest', label: 'REST API' }, { value: 'event_bus', label: 'Event Bus' }, { value: 'grpc', label: 'gRPC' }] },
      { id: 'deployment.model', label: '部署模型', type: 'single_select', required: true, section: '部署與整合', ownerRoles: ['architect', 'devops'], description: '定義單體、容器、PaaS 或混合部署模型。', options: [{ value: 'paas', label: 'PaaS' }, { value: 'containerized', label: 'Containerized' }, { value: 'hybrid', label: 'Hybrid' }] },
      { id: 'architecture.hosting.platform', label: '部署平台', type: 'single_select', required: true, section: '部署與整合', ownerRoles: ['architect', 'devops'], description: '主要雲端或執行平台。', options: [{ value: 'azure', label: 'Azure' }, { value: 'aws', label: 'AWS' }, { value: 'gcp', label: 'GCP' }, { value: 'on_premise', label: 'On-Premise' }] },
      { id: 'integration.strategy', label: '整合策略', type: 'single_select', required: true, section: '部署與整合', ownerRoles: ['architect'], description: '定義同步 API、事件驅動或混合整合方式。', options: [{ value: 'sync_api', label: '同步 API' }, { value: 'event_driven', label: '事件驅動' }, { value: 'hybrid', label: '混合策略' }] },
      { id: 'observability.baseline', label: '觀測性基線', type: 'multi_select', required: true, section: '部署與整合', ownerRoles: ['architect', 'devops'], description: '定義 log、metric、trace、health check 基線。', options: [{ value: 'logs', label: 'Logs' }, { value: 'metrics', label: 'Metrics' }, { value: 'traces', label: 'Traces' }, { value: 'health_checks', label: 'Health Checks' }] },
      { id: 'ai_collaboration.boundary_summary', label: 'AI 邊界摘要', type: 'single_select', required: true, section: 'AI 協作規範', ownerRoles: ['architect', 'pm', 'security_lead'], description: '定義 AI 在 S2 之後可分析或產碼的邊界。', options: [{ value: 'private_model_only', label: 'Private Model Only' }, { value: 'analysis_only', label: 'Analysis Only' }, { value: 'analysis_and_code_with_review', label: 'Analysis + Code with Review' }] },
    ],
  },
  {
    key: 's3',
    title: 'S3 Design',
    phase: 'phase_b',
    summary: '把架構轉成實作規格，定義 repo 與模組邊界。',
    outputs: ['s3 context', 's4 handoff'],
    fields: [
      { id: 'repo_structure', label: 'Repo 結構', type: 'single_select', required: true, section: '實作結構', ownerRoles: ['architect', 'backend_lead'], description: '定義 monorepo、polyrepo 或 mixed。', options: [{ value: 'monorepo', label: 'Monorepo' }, { value: 'polyrepo', label: 'Polyrepo' }, { value: 'mixed', label: 'Mixed' }] },
      { id: 'code_structure', label: '程式碼結構', type: 'single_select', required: true, section: '實作結構', ownerRoles: ['architect'], description: '定義 feature-first、layer-first 等主要結構。', options: [{ value: 'feature_first', label: 'Feature First' }, { value: 'layer_first', label: 'Layer First' }, { value: 'hybrid', label: 'Hybrid' }] },
      { id: 'module_boundary_definition', label: '模組邊界定義', type: 'textarea', required: true, section: '實作結構', ownerRoles: ['architect'], description: '描述模組之間的責任分界與互動方式。' },
      { id: 'ci_cd.workflow', label: 'CI/CD Workflow', type: 'single_select', required: true, section: '工程治理', ownerRoles: ['architect', 'devops'], description: '定義主要 build / test / deploy workflow，作為 AI 生成與 repo 實作基線。', options: [{ value: 'github_actions', label: 'GitHub Actions' }, { value: 'azure_devops', label: 'Azure DevOps Pipelines' }, { value: 'gitlab_ci', label: 'GitLab CI' }, { value: 'manual_with_checks', label: 'Manual with Checks' }] },
      { id: 'logging.strategy', label: 'Logging Strategy', type: 'single_select', required: true, section: '工程治理', ownerRoles: ['architect', 'backend_lead', 'devops'], description: '定義日誌策略，讓後續輸出與 AI coding context 有一致規範。', options: [{ value: 'structured_json', label: 'Structured JSON' }, { value: 'text_logs', label: 'Plain Text Logs' }, { value: 'centralized_logging', label: 'Centralized Logging Pipeline' }] },
      { id: 'monitoring.strategy', label: 'Monitoring Strategy', type: 'single_select', required: true, section: '工程治理', ownerRoles: ['architect', 'devops'], description: '定義監控與告警策略，對應 production readiness 與 AI artifact generation。', options: [{ value: 'apm_dashboard_alerts', label: 'APM + Dashboard + Alerts' }, { value: 'basic_metrics_dashboard', label: 'Basic Metrics Dashboard' }, { value: 'health_checks_only', label: 'Health Checks Only' }] },
      { id: 'test_coverage_target', label: '測試覆蓋率目標', type: 'number', required: true, section: '品質策略', ownerRoles: ['qa_lead', 'backend_lead'], description: '定義整體測試覆蓋率目標。' },
    ],
  },
  {
    key: 's4',
    title: 'S4 Validation',
    phase: 'phase_c',
    summary: '計算治理風險、信心分數與 owner/due 矩陣。',
    outputs: ['validation report', 's5 review packet'],
    fields: [
      { id: 'validation.risk_score', label: 'Risk Score', type: 'number', required: true, section: '治理分數', ownerRoles: ['architect', 'security_lead'], description: '治理與架構風險評分。' },
      { id: 'validation.confidence_score', label: 'Confidence Score', type: 'number', required: true, section: '治理分數', ownerRoles: ['architect'], description: '對目前決策完整度的信心評分。' },
      { id: 'validation.owner_due_matrix', label: 'Owner Due Matrix', type: 'textarea', required: true, section: '治理分數', ownerRoles: ['pm', 'architect'], description: '以 owner / due / item 形式整理待補項。' },
    ],
  },
  {
    key: 's5',
    title: 'S5 Review',
    phase: 'phase_c',
    summary: '進行正式審核、簽核與版本鎖定。',
    outputs: ['approved-review-packet.json', 's6-handoff.json'],
    fields: [
      { id: 'review.architect.decision', label: '架構師決定', type: 'single_select', required: true, section: '正式審核', ownerRoles: ['architect'], description: '架構主審決定。', options: [{ value: 'approved', label: '通過' }, { value: 'approved_with_notes', label: '通過但附註' }, { value: 'return_for_fix', label: '退回修正' }, { value: 'meeting_required', label: '需要會議' }] },
      { id: 'review.architect.reviewer', label: '架構師審核人', type: 'text', required: true, section: '正式審核', ownerRoles: ['architect'], description: '填寫主審角色或姓名。', placeholder: '例如 Architect / 系統架構師' },
      { id: 'review.architect.note', label: '架構師審核意見', type: 'textarea', required: true, section: '正式審核', ownerRoles: ['architect'], description: '紀錄風險、附註或通過理由。', placeholder: '填寫架構風險、需補強決策或同意通過原因' },
      { id: 'review.pm.decision', label: 'PM 決定', type: 'single_select', required: true, section: '正式審核', ownerRoles: ['pm'], description: 'PM 對交付與風險的確認。', options: [{ value: 'confirmed', label: '確認通過' }, { value: 'confirmed_with_notes', label: '確認但附註' }, { value: 'return_for_fix', label: '退回修正' }, { value: 'meeting_required', label: '需要會議' }] },
      { id: 'review.pm.reviewer', label: 'PM 確認人', type: 'text', required: true, section: '正式審核', ownerRoles: ['pm'], description: '填寫確認角色或姓名。', placeholder: '例如 PM / 規劃者' },
      { id: 'review.pm.note', label: 'PM 確認意見', type: 'textarea', required: true, section: '正式審核', ownerRoles: ['pm'], description: '紀錄交付、時程與風險接受意見。', placeholder: '填寫交付影響、時程確認、風險接受或需補件內容' },
      { id: 'review.version_lock.version', label: '版本號', type: 'text', required: true, section: '正式審核', ownerRoles: ['architect', 'pm'], description: '作為正式輸出的核准版本。' },
      { id: 'review.version_lock.status', label: '版本狀態', type: 'single_select', required: true, section: '版本鎖定', ownerRoles: ['architect', 'pm'], description: '反映本次審核後的版本狀態。', options: [{ value: 'draft', label: 'Draft' }, { value: 'approved', label: 'Approved' }, { value: 'approved_with_notes', label: 'Approved With Notes' }, { value: 'return_for_fix', label: 'Return For Fix' }, { value: 'meeting_required', label: 'Meeting Required' }] },
      { id: 'review.version_lock.note', label: '版本鎖定附註', type: 'textarea', required: false, section: '版本鎖定', ownerRoles: ['architect', 'pm'], description: '記錄版本鎖定時的條件、限制與後續追蹤事項。', placeholder: '例如 核准進 S6，但 IaC 與 tracing 須在 Sprint 1 補齊' },
    ],
  },
  {
    key: 's6',
    title: 'S6 Output',
    phase: 'phase_c',
    summary: '產出 repo 與 AI 工具可直接使用的正式文件。',
    outputs: ['tech-stack.json', 'ai-context.md', 'readiness-report.md', 'adr.md', 'cursor-rules.mdc', 'project-architecture.md', 'implementation-checklist.md'],
    fields: [
      { id: 'output.assets.selected', label: '正式輸出', type: 'multi_select', required: true, section: '正式輸出', ownerRoles: ['system'], description: '選擇要產出的正式文件。', options: [{ value: 'tech-stack.json', label: 'tech-stack.json' }, { value: 'ai-context.md', label: 'ai-context.md' }, { value: 'readiness-report.md', label: 'readiness-report.md' }, { value: 'adr.md', label: 'adr.md' }, { value: 'cursor-rules.mdc', label: 'cursor-rules.mdc' }, { value: 'project-architecture.md', label: 'project-architecture.md' }, { value: 'implementation-checklist.md', label: 'implementation-checklist.md' }] },
    ],
  },
  {
    key: 's7',
    title: 'S7 Publish',
    phase: 'phase_c',
    summary: '整理 PR、AI 揭露、reviewer 與發布資訊。',
    outputs: ['pr-body.md', 'ai-disclosure.md', 'publish-manifest.json'],
    fields: [
      { id: 'publish.repo.base_branch', label: 'Base Branch', type: 'text', required: true, section: '發布準備', ownerRoles: ['devops'], description: '目標合併分支。' },
      { id: 'publish.repo.publish_branch', label: 'Publish Branch', type: 'text', required: true, section: '發布準備', ownerRoles: ['devops'], description: '本次發布整理使用的工作分支。' },
      { id: 'publish.release.tag', label: 'Tag / Version', type: 'text', required: true, section: '發布準備', ownerRoles: ['devops', 'architect'], description: '這次發布的版本標記。' },
      { id: 'publish.pr.title', label: 'PR Title', type: 'text', required: true, section: '發布準備', ownerRoles: ['architect', 'pm'], description: '這次發布對應的 pull request 標題。' },
      { id: 'publish.reviewers.list', label: 'Reviewers', type: 'text', required: true, section: '發布準備', ownerRoles: ['architect', 'pm', 'devops'], description: '以逗號分隔 reviewer 名單。', placeholder: '例如 Architect, PM, DevOps' },
      { id: 'publish.ai.disclosure_level', label: 'AI 揭露程度', type: 'single_select', required: true, section: '發布準備', ownerRoles: ['architect', 'pm'], description: '定義 AI 使用揭露強度。', options: [{ value: 'required', label: '必須揭露' }, { value: 'recommended', label: '建議揭露' }, { value: 'minimal', label: '簡化揭露' }] },
      { id: 'publish.ai.tools', label: 'AI Tools', type: 'text', required: true, section: 'AI 揭露', ownerRoles: ['architect', 'pm'], description: '列出參與本次流程的 AI 工具。', placeholder: '例如 Cursor, Claude, GPT' },
      { id: 'publish.ai.disclosure', label: 'AI Disclosure Note', type: 'textarea', required: true, section: 'AI 揭露', ownerRoles: ['architect', 'pm'], description: '說明 AI 參與範圍與人工覆核方式。', placeholder: '說明 AI 協助內容、限制與人工確認方式' },
      { id: 'publish.change.summary', label: 'Change Summary', type: 'textarea', required: true, section: '發布摘要', ownerRoles: ['architect', 'pm'], description: '描述本次發布目的與影響，而非只是列檔名。', placeholder: '例如 發布核准後的治理基線輸出，供 repo 與 AI 開發流程使用。' },
    ],
  },
];
