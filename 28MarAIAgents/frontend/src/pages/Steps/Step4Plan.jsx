import { FileDown } from 'lucide-react';
import { planApi } from '../../api';

export default function Step4Plan({ plan, historyId }) {
  if (!plan) return <div className="card" style={{textAlign:'center', padding:'3rem'}}><p>No test plan generated yet.</p></div>;

  const downloadDocx = () => {
    window.open(planApi.downloadDocxUrl(historyId), "_blank");
  };

  return (
    <div>
      <div className="card">
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1rem'}}>
          <h2 className="card-title" style={{margin:0}}>Generated Test Plan</h2>
          <button className="btn btn-primary" onClick={downloadDocx}><FileDown size={18}/> Download .DOCX</button>
        </div>

        <div className="markdown-preview" style={{padding:'1rem', background:'var(--bg-color)', border:'1px solid var(--border-color)', borderRadius:'8px'}}>
          <h3>1. Overview</h3>
          <p>{plan.overview}</p>
          
          <h3>2. Scope</h3>
          <p>{plan.scope}</p>
          
          <h3>3. Objectives</h3>
          <ul>{plan.objectives?.map((o, i) => <li key={i}>{o}</li>)}</ul>

          <h3>4. Test Strategy</h3>
          <p>{plan.test_strategy}</p>

          <h3>5. Test Types</h3>
          <ul>{plan.test_types?.map((o, i) => <li key={i}>{o}</li>)}</ul>

          <h3>6. Entry & Exit Criteria</h3>
          <h4>Entry</h4><ul>{plan.entry_criteria?.map((o, i) => <li key={i}>{o}</li>)}</ul>
          <h4>Exit</h4><ul>{plan.exit_criteria?.map((o, i) => <li key={i}>{o}</li>)}</ul>

          <h3>7. Test Cases</h3>
          <div style={{overflowX:'auto'}}>
            <table width="100%" border="1" cellPadding="8">
              <thead><tr><th>ID</th><th>Jira Ref</th><th>Title</th><th>Priority</th><th>Preconditions</th><th>Steps</th><th>Expected</th></tr></thead>
              <tbody>
                {plan.test_cases?.map((tc, k) => (
                  <tr key={k}>
                     <td>{tc.id}</td>
                     <td style={{fontWeight:600}}>{tc.jira_ref}</td>
                     <td>{tc.title}</td>
                     <td><span className="issue-badge">{tc.priority}</span></td>
                     <td>{tc.preconditions}</td>
                     <td>
                       <ol style={{margin:0, paddingLeft:'1.2em'}}>
                         {tc.steps?.map((s, si) => <li key={si}>{s}</li>)}
                       </ol>
                     </td>
                     <td>{tc.expected_result}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h3>8. Risks & Mitigations</h3>
          <ul>{plan.risks?.map((o, i) => <li key={i}>{o}</li>)}</ul>

          <h3>9. Timeline</h3>
          <p>{plan.timeline}</p>
        </div>
      </div>
    </div>
  );
}
