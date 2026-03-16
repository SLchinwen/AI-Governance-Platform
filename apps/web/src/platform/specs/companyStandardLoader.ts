import type { FieldValue } from '../types/projectContext';
import type { TechStackDimensionId } from '../types/projectContext';

/** 維度 ID 對應顯示名稱（與 company-tech-stack-standard.json dimensions 一致） */
export const DIMENSION_LABELS: Record<string, string> = {
  backend: '後端技術',
  frontend: '前端技術',
  user_auth: '使用者驗證',
  api_security: '服務間驗證 (API Security)',
  api_design: 'API 設計',
  testing: '測試與品質',
  cicd: 'CI/CD 與流程',
};

export interface CompanyStandardDimension {
  id: string;
  name: string;
  spec_ref: string;
  checklist_ref: string;
}

export interface CompanyTechStackStandard {
  version: string;
  updated: string;
  source_docs: string[];
  dimensions: CompanyStandardDimension[];
  field_dimension_map: {
    s2: Record<string, string>;
    s3: Record<string, string>;
  };
  standard_values: {
    s2: Record<string, FieldValue>;
    s3: Record<string, FieldValue>;
  };
  notes: Record<string, string>;
}

const STANDARD_URL = '/specs/company-tech-stack-standard.json';

let cached: CompanyTechStackStandard | null = null;

/**
 * 載入公司技術棧共通標準（會快取）。
 */
export async function loadCompanyTechStackStandard(): Promise<CompanyTechStackStandard> {
  if (cached) return cached;
  const res = await fetch(STANDARD_URL);
  if (!res.ok) throw new Error(`Failed to load company standard: ${res.status}`);
  const data = (await res.json()) as CompanyTechStackStandard;
  cached = data;
  return data;
}

/**
 * 取得 S2/S3 依公司標準的預填值。
 */
export function getStandardValuesForStages(standard: CompanyTechStackStandard): {
  s2: Record<string, FieldValue>;
  s3: Record<string, FieldValue>;
} {
  return {
    s2: { ...standard.standard_values.s2 },
    s3: { ...standard.standard_values.s3 },
  };
}

/**
 * 依「客製維度」篩選出該顯示的 S2 或 S3 欄位 ID。
 * 若 customDimensionIds 為空或未傳，表示全部顯示（無採用標準篩選）。
 */
export function getVisibleFieldIdsForCustomDimensions(
  standard: CompanyTechStackStandard,
  stage: 's2' | 's3',
  customDimensionIds: TechStackDimensionId[],
): string[] {
  const map = standard.field_dimension_map[stage];
  if (!map || customDimensionIds.length === 0) return [];
  return Object.entries(map)
    .filter(([, dimId]) => customDimensionIds.includes(dimId as TechStackDimensionId))
    .map(([fieldId]) => fieldId);
}

/**
 * 取得某階段所有欄位所屬維度對照（fieldId -> dimensionId）。
 */
export function getFieldDimensionMap(
  standard: CompanyTechStackStandard,
  stage: 's2' | 's3',
): Record<string, string> {
  return { ...standard.field_dimension_map[stage] };
}
