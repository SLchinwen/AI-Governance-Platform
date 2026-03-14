import type { FieldValue } from '../../types/projectContext';
import type { StageFieldCondition, StageFieldSchema, StageSchema } from '../../schemas/stageSchemas';

function isNonEmpty(value: FieldValue | undefined) {
  if (Array.isArray(value)) return value.length > 0;
  return value !== undefined && value !== null && String(value).trim() !== '';
}

function matchesCondition(condition: StageFieldCondition, answers: Record<string, FieldValue>) {
  const raw = answers[condition.fieldId];
  const value = Array.isArray(raw) ? raw.map(String) : [String(raw ?? '')];
  if (condition.operator === 'equals') {
    return value.some((item) => condition.values.includes(item));
  }
  if (condition.operator === 'in') {
    return value.some((item) => condition.values.includes(item));
  }
  return true;
}

export function getVisibleFields(stageSchema: StageSchema, answers: Record<string, FieldValue>) {
  return stageSchema.fields.filter((field) => {
    if (!field.conditions?.length) return true;
    return field.conditions.every((condition) => matchesCondition(condition, answers));
  });
}

export function getRequiredCompletion(stageSchema: StageSchema, answers: Record<string, FieldValue>) {
  const visibleFields = getVisibleFields(stageSchema, answers);
  const requiredFields = visibleFields.filter((field) => field.required);
  const completedFields = requiredFields.filter((field) => isNonEmpty(answers[field.id]));
  return {
    visibleFields,
    requiredFields,
    completedFields,
    percent: requiredFields.length === 0 ? 100 : Math.round((completedFields.length / requiredFields.length) * 100),
  };
}

export function groupFieldsBySection(fields: StageFieldSchema[]) {
  return fields.reduce<Record<string, StageFieldSchema[]>>((acc, field) => {
    const key = field.section || '未分類';
    acc[key] = acc[key] || [];
    acc[key].push(field);
    return acc;
  }, {});
}
