import { buildAiDisclosureMd, buildPrBody, buildPublishManifest } from '../../platform/engines/publish/publishEngine';
import type { ProjectContext, RecommendationRecord } from '../../platform/types/projectContext';

export interface PublishSummary {
  baseBranch: string;
  publishBranch: string;
  tag: string;
  reviewersCount: number;
  outputCount: number;
  publishReady: boolean;
}

export function buildPublishSummary(context: ProjectContext): PublishSummary {
  return {
    baseBranch: context.publish.base_branch,
    publishBranch: context.publish.publish_branch,
    tag: context.publish.tag,
    reviewersCount: context.publish.reviewers.length,
    outputCount: Object.keys(context.artifacts).length,
    publishReady: context.publish.publish_ready,
  };
}

export function buildPublishRecommendations(context: ProjectContext): RecommendationRecord[] {
  const recommendations: RecommendationRecord[] = [];

  if (!context.review.ready_for_handoff) {
    recommendations.push({
      id: 'REC-S7-001',
      stage: 's7',
      title: '先確認 S5 / S6 已完成交接，再整理發布資訊',
      rationale: '目前 review 尚未完成 handoff，發布資料應先視為草稿。',
      confidence: 0.95,
      targets: ['review.version_lock.version', 'output.assets.selected'],
    });
  }

  if (Object.keys(context.artifacts).length < 3) {
    recommendations.push({
      id: 'REC-S7-002',
      stage: 's7',
      title: '正式輸出檔數偏少，建議至少保留 3 份 artifact',
      rationale: `目前只有 ${Object.keys(context.artifacts).length} 份 artifact，可能不足以支撐完整治理發布。`,
      confidence: 0.89,
      targets: ['output.assets.selected'],
    });
  }

  if (context.publish.reviewers.length === 0) {
    recommendations.push({
      id: 'REC-S7-003',
      stage: 's7',
      title: '補上 reviewers 清單',
      rationale: '發布階段需要明確指定 reviewers，才能讓後續 PR / release 流程可追蹤。',
      confidence: 0.98,
      targets: ['publish.reviewers.list'],
    });
  }

  if (!context.publish.publish_ready) {
    recommendations.push({
      id: 'REC-S7-004',
      stage: 's7',
      title: '先補齊 checklist 再建立正式發布包',
      rationale: '目前 publish checklist 尚未全部通過，建議先補齊再建立正式 PR / manifest。',
      confidence: 0.92,
      targets: ['publish.repo.base_branch', 'publish.pr.title', 'publish.change.summary'],
    });
  }

  if (!recommendations.length) {
    recommendations.push({
      id: 'REC-S7-000',
      stage: 's7',
      title: '發布資料已完整，可進入 PR / release 準備',
      rationale: '目前 publish checklist 已通過，可把 PR body、AI disclosure 與 publish manifest 用於正式發布流程。',
      confidence: 0.79,
      targets: ['publish.repo.publish_branch', 'publish.release.tag'],
    });
  }

  return recommendations;
}

export function buildPublishPacketPreview(context: ProjectContext) {
  return {
    pr_body: buildPrBody(context),
    ai_disclosure: buildAiDisclosureMd(context),
    publish_manifest: buildPublishManifest(context),
  };
}
