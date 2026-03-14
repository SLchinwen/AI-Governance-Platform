import type { Scenario } from '../types';
import { roleLabels, stageLabels } from '../data/programCatalog';

interface ScenarioSidebarProps {
  scenarios: Scenario[];
  activeScenarioId: string;
  onSelectScenario: (scenarioId: string) => void;
}

export function ScenarioSidebar({
  scenarios,
  activeScenarioId,
  onSelectScenario,
}: ScenarioSidebarProps) {
  return (
    <aside className="sidebar">
      <h2>情境清單</h2>
      <p className="sidebar-hint">以主程式 + 子程式拆分，支援平行開發。</p>
      <ul className="scenario-list">
        {scenarios.map((scenario) => {
          const isActive = scenario.id === activeScenarioId;
          return (
            <li key={scenario.id}>
              <button
                type="button"
                className={isActive ? 'scenario-item active' : 'scenario-item'}
                onClick={() => onSelectScenario(scenario.id)}
              >
                <div className="scenario-title-row">
                  <strong>{scenario.id}</strong>
                  <span>{stageLabels[scenario.stage]}</span>
                </div>
                <p>{scenario.title}</p>
                <small>{roleLabels[scenario.ownerRole]}</small>
              </button>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
