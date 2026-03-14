import { useMemo, useState } from 'react';
import './App.css';
import { DevelopmentWorkbench } from './components/DevelopmentWorkbench';
import { FlowPanel } from './components/FlowPanel';
import { ProgramBoard } from './components/ProgramBoard';
import { ScenarioSidebar } from './components/ScenarioSidebar';
import { programUnits, scenarios, stageLabels } from './data/programCatalog';

function App() {
  const [activeScenarioId, setActiveScenarioId] = useState(scenarios[0].id);

  const activeScenario = useMemo(
    () => scenarios.find((scenario) => scenario.id === activeScenarioId) ?? scenarios[0],
    [activeScenarioId],
  );

  const filteredPrograms = useMemo(
    () => programUnits.filter((program) => program.stage === activeScenario.stage),
    [activeScenario.stage],
  );

  const totalPendingPrd = useMemo(
    () =>
      programUnits.reduce(
        (count, program) =>
          count + program.subPrograms.filter((sub) => sub.includes('待 PRD 補齊')).length,
        0,
      ),
    [],
  );

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <h1>AI 治理問卷 UI 主程式</h1>
          <p>以情境驅動主程式拆分，先做 UI 流程再串接後端 API。</p>
        </div>
        <div className="metrics">
          <span>情境數：{scenarios.length}</span>
          <span>主程式：{programUnits.length}</span>
          <span>待 PRD：{totalPendingPrd}</span>
        </div>
      </header>

      <main className="workspace">
        <ScenarioSidebar
          scenarios={scenarios}
          activeScenarioId={activeScenario.id}
          onSelectScenario={setActiveScenarioId}
        />
        <div className="main-column">
          <DevelopmentWorkbench />
          <section className="stage-strip">
            <strong>目前階段：</strong>
            <span>{stageLabels[activeScenario.stage]}</span>
          </section>
          <ProgramBoard scenario={activeScenario} programs={filteredPrograms} />
        </div>
        <FlowPanel scenario={activeScenario} />
      </main>
    </div>
  );
}

export default App;
