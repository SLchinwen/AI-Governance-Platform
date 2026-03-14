import { groupFieldsBySection } from '../../platform/engines/questionnaire/questionnaireEngine';
import type { FieldValue, StageKey } from '../../platform/types/projectContext';
import type { StageSchema } from '../../platform/schemas/stageSchemas';

interface QuestionnaireFormProps {
  stage: StageKey;
  stageSchema: StageSchema;
  answers: Record<string, FieldValue>;
  onChange: (stage: StageKey, fieldId: string, value: FieldValue) => void;
}

export function QuestionnaireForm({ stage, stageSchema, answers, onChange }: QuestionnaireFormProps) {
  const sectionMap = groupFieldsBySection(stageSchema.fields);

  return (
    <div className="form-sections">
      {Object.entries(sectionMap).map(([sectionTitle, fields]) => (
        <section key={sectionTitle} className="form-section">
          <div className="form-section-head">
            <h3>{sectionTitle}</h3>
            <span>{fields.length} 題</span>
          </div>

          <div className="workbench-grid">
            {fields.map((field) => {
              const value = answers[field.id];
              const selectedValues = Array.isArray(value) ? value.map((item) => String(item)) : [];
              const isVisible = !field.conditions?.length || field.conditions.every((condition) => {
                const raw = answers[condition.fieldId];
                const values = Array.isArray(raw) ? raw.map(String) : [String(raw ?? '')];
                return values.some((item) => condition.values.includes(item));
              });

              if (!isVisible) return null;

              return (
                <article key={field.id} className="work-card">
                  <h3>{field.label}</h3>
                  <p className="hint">{field.description}</p>
                  <div className="field-meta">
                    <span>{field.required ? '必填' : '選填'}</span>
                    <span>{field.ownerRoles.join(' / ')}</span>
                  </div>

                  {field.type === 'textarea' ? (
                    <textarea
                      value={String(value ?? '')}
                      placeholder={field.placeholder}
                      onChange={(event) => onChange(stage, field.id, event.target.value)}
                    />
                  ) : field.type === 'single_select' && field.options ? (
                    <select
                      value={String(value ?? '')}
                      onChange={(event) => onChange(stage, field.id, event.target.value)}
                    >
                      <option value="">請選擇</option>
                      {field.options.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  ) : field.type === 'multi_select' && field.options ? (
                    <div className="checkbox-group">
                      {field.options.map((option) => {
                        const selected = selectedValues.includes(option.value);
                        return (
                          <label key={option.value} className="checkbox-item">
                            <input
                              type="checkbox"
                              checked={selected}
                              onChange={(event) => {
                                const next = event.target.checked
                                  ? [...selectedValues, option.value]
                                  : selectedValues.filter((item) => item !== option.value);
                                onChange(stage, field.id, next);
                              }}
                            />
                            <span>{option.label}</span>
                          </label>
                        );
                      })}
                    </div>
                  ) : (
                    <input
                      type={field.type === 'number' ? 'number' : 'text'}
                      value={String(value ?? '')}
                      placeholder={field.placeholder}
                      onChange={(event) =>
                        onChange(stage, field.id, field.type === 'number' ? Number(event.target.value || 0) : event.target.value)
                      }
                    />
                  )}
                </article>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
