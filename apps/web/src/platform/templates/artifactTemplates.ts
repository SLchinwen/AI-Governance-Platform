export interface ArtifactTemplate {
  id: string;
  title: string;
  outputType: 'json' | 'markdown';
  summary: string;
}

export const artifactTemplates: ArtifactTemplate[] = [
  { id: 'tech-stack', title: 'tech-stack.json', outputType: 'json', summary: '機器可讀技術棧 SSOT。' },
  { id: 'ai-context', title: 'ai-context.md', outputType: 'markdown', summary: '給 AI 工具的專案上下文。' },
  { id: 'readiness-report', title: 'readiness-report.md', outputType: 'markdown', summary: '治理與就緒度報告。' },
  { id: 'approved-review-packet', title: 'approved-review-packet.json', outputType: 'json', summary: '正式審核與版本鎖定結果。' },
  { id: 's6-handoff', title: 's6-handoff.json', outputType: 'json', summary: '給 S6 Output 的審核交接資料。' },
  { id: 'project-architecture', title: 'project-architecture.md', outputType: 'markdown', summary: '專案架構說明文件。' },
  { id: 'implementation-checklist', title: 'implementation-checklist.md', outputType: 'markdown', summary: '實作與搬移檢查清單。' },
  { id: 'publish-manifest', title: 'publish-manifest.json', outputType: 'json', summary: '發布與版本追蹤資料。' },
];
