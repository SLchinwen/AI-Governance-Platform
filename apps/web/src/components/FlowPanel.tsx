import type { Scenario } from '../types';

interface FlowPanelProps {
  scenario: Scenario;
}

export function FlowPanel({ scenario }: FlowPanelProps) {
  return (
    <section className="flow-panel">
      <h3>情境目標</h3>
      <p>{scenario.objective}</p>

      <h3>本情境驗收條件</h3>
      <ul>
        {scenario.acceptance.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>

      <h3>PRD 拆分提醒</h3>
      <ul>
        <li>一份 PRD 僅涵蓋一個主程式與其子程式。</li>
        <li>主程式先建架構，子程式若未明確則標示待 PRD 補齊。</li>
        <li>交付採最小單元，便於多位工程師平行開發。</li>
      </ul>
    </section>
  );
}
