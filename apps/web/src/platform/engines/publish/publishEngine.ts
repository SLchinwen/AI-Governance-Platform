import type { ProjectContext, PublishState } from '../../types/projectContext';

function splitCommaList(value: unknown) {
  return String(value ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function buildReviewerSuggestions(context: ProjectContext) {
  const suggestions = [
    'Architect：確認技術棧、治理輸出與 PR 內容未偏移',
    'PM：確認交付範圍、用途與後續流程一致',
  ];

  if (context.stages.s2.answers['deployment.model'] || context.stages.s2.answers['architecture.hosting.platform']) {
    suggestions.push('DevOps：若要直接進 repo / PR / release，建議一起 review');
  }
  if (context.validation.risk_score >= 60 || context.validation.blockers.length > 0) {
    suggestions.push('Security Lead：當風險分數偏高或有敏感資料議題時建議一併覆核');
  }

  return suggestions;
}

function buildChecklist(context: ProjectContext, publish: Omit<PublishState, 'reviewer_suggestions' | 'checklist' | 'publish_ready'>) {
  return [
    { id: 'publish-check-1', pass: context.review.version_status === 'approved', label: 'S5 / S6 來源已核准' },
    { id: 'publish-check-2', pass: Object.keys(context.artifacts).length >= 3, label: `至少已有 3 個正式輸出檔（目前 ${Object.keys(context.artifacts).length} 個）` },
    { id: 'publish-check-3', pass: publish.base_branch !== '', label: '已指定 base branch' },
    { id: 'publish-check-4', pass: publish.publish_branch !== '', label: '已指定 publish branch' },
    { id: 'publish-check-5', pass: publish.tag !== '', label: '已指定版本 tag' },
    { id: 'publish-check-6', pass: publish.pr_title !== '', label: '已填寫 PR title' },
    { id: 'publish-check-7', pass: publish.reviewers.length > 0, label: '已指定 reviewers' },
    { id: 'publish-check-8', pass: publish.ai_disclosure !== '', label: '已填寫 AI 使用揭露' },
    { id: 'publish-check-9', pass: publish.change_summary !== '', label: '已填寫變更摘要' },
  ];
}

export function computePublishState(context: ProjectContext): PublishState {
  const s7 = context.stages.s7.answers;
  const defaultTag = context.review.review_version;
  const defaultBranch = `release/${context.project_id.toLowerCase()}-${defaultTag.toLowerCase()}`;

  const publishBase: Omit<PublishState, 'reviewer_suggestions' | 'checklist' | 'publish_ready'> = {
    base_branch: String(s7['publish.repo.base_branch'] ?? context.publish.base_branch ?? 'master'),
    publish_branch: String(s7['publish.repo.publish_branch'] ?? context.publish.publish_branch ?? defaultBranch),
    tag: String(s7['publish.release.tag'] ?? context.publish.tag ?? defaultTag),
    pr_title: String(s7['publish.pr.title'] ?? context.publish.pr_title ?? `docs: publish approved governance assets for ${context.project_id}`),
    reviewers: splitCommaList(s7['publish.reviewers.list'] ?? context.publish.reviewers.join(', ')),
    ai_tools: String(s7['publish.ai.tools'] ?? context.publish.ai_tools ?? 'Cursor, Claude, GPT'),
    ai_disclosure_level: String(s7['publish.ai.disclosure_level'] ?? context.publish.ai_disclosure_level ?? 'recommended') as PublishState['ai_disclosure_level'],
    ai_disclosure: String(
      s7['publish.ai.disclosure'] ??
        context.publish.ai_disclosure ??
        `本次發布包含 AI 協助整理與生成的治理文件草稿，但所有正式輸出均依 ${defaultTag} 核准版本整理，並由 Architect / PM 人工確認後發布。`,
    ),
    change_summary: String(
      s7['publish.change.summary'] ??
        context.publish.change_summary ??
        `發布 ${context.project_id} 的核准治理輸出資產，供 repo 與 AI 開發流程使用。`,
    ),
  };

  const reviewer_suggestions = buildReviewerSuggestions(context);
  const checklist = buildChecklist(context, publishBase);

  return {
    ...publishBase,
    reviewer_suggestions,
    checklist,
    publish_ready: checklist.every((item) => item.pass),
  };
}

export function buildPrBody(context: ProjectContext) {
  const publish = computePublishState(context);

  return `## Summary
- 發布 ${context.project_id} 的核准治理輸出資產，供 repo 與 AI 開發流程使用。
- 本次輸出版本：${publish.tag}
- 包含檔案：${Object.keys(context.artifacts).join(', ')}

## Change summary
${publish.change_summary}

## AI disclosure
- 揭露程度：${publish.ai_disclosure_level}
- 使用工具：${publish.ai_tools}
- 說明：${publish.ai_disclosure}

## Reviewers
${publish.reviewers.map((item) => `- ${item}`).join('\n')}

## Notes
${context.review.notes.length > 0 ? context.review.notes.map((note) => `- ${note}`).join('\n') : '- None'}
`;
}

export function buildAiDisclosureMd(context: ProjectContext) {
  const publish = computePublishState(context);

  return `# AI Disclosure

## Release Context
- Project: ${context.project_id}
- Version: ${publish.tag}
- Disclosure level: ${publish.ai_disclosure_level}

## AI Tools
- ${publish.ai_tools.split(',').map((item) => item.trim()).filter(Boolean).join('\n- ')}

## Disclosure Note
${publish.ai_disclosure}
`;
}

export function buildPublishManifest(context: ProjectContext) {
  const publish = computePublishState(context);

  return {
    project_id: context.project_id,
    stage: 'S7',
    generated_at: context.meta.last_updated_at,
    publish_ready: publish.publish_ready,
    repo: {
      base_branch: publish.base_branch,
      publish_branch: publish.publish_branch,
    },
    release: {
      tag: publish.tag,
      pr_title: publish.pr_title,
    },
    output_targets: Object.keys(context.artifacts),
    reviewers: publish.reviewers,
    ai_disclosure: {
      level: publish.ai_disclosure_level,
      tools: publish.ai_tools,
      note: publish.ai_disclosure,
    },
    change_summary: publish.change_summary,
  };
}
