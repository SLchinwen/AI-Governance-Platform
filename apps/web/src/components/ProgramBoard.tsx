import type { ProgramUnit, Scenario } from '../types';
import { roleLabels, stageLabels } from '../data/programCatalog';

interface ProgramBoardProps {
  scenario: Scenario;
  programs: ProgramUnit[];
}

const statusLabel: Record<ProgramUnit['status'], string> = {
  ready: '可開發',
  in_progress: '進行中',
  pending_prd: '待 PRD',
};

export function ProgramBoard({ scenario, programs }: ProgramBoardProps) {
  return (
    <section className="content-panel">
      <header className="panel-header">
        <div>
          <h3>
            {scenario.id} - {scenario.title}
          </h3>
          <p>{scenario.summary}</p>
        </div>
        <div className="panel-meta">
          <span>{stageLabels[scenario.stage]}</span>
          <span>{roleLabels[scenario.ownerRole]}</span>
        </div>
      </header>

      <div className="program-grid">
        {programs.map((program) => (
          <article className="program-card" key={program.code}>
            <div className="program-card-head">
              <strong>{program.code}</strong>
              <span className={`status ${program.status}`}>{statusLabel[program.status]}</span>
            </div>
            <h4>{program.name}</h4>
            <p>{program.description}</p>

            <dl>
              <dt>API</dt>
              <dd>{program.apis.join(' | ')}</dd>
              <dt>UI</dt>
              <dd>{program.uiScreens.join(' / ')}</dd>
              <dt>資料表</dt>
              <dd>{program.dataTables.join(' / ')}</dd>
            </dl>

            <div className="subprograms">
              <strong>子程式預留</strong>
              <ul>
                {program.subPrograms.map((subProgram) => (
                  <li key={subProgram}>{subProgram}</li>
                ))}
              </ul>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
