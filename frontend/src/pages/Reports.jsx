import { overdue } from '../api';

export default function Reports({ S }) {
  const emps = S.users.filter((u) => u.role === 'Employee');

  return (
    <>
      <div className="row">
        <h1>Reports</h1>
        <button className="ghost" onClick={() => window.print()}>Print report</button>
      </div>
      <div className="panel tw">
        <h2>Project-wise</h2>
        <table>
          <thead><tr><th>Project</th><th>Tasks</th><th>Done</th><th>Overdue</th></tr></thead>
          <tbody>
            {S.projects.map((p) => {
              const T = S.tasks.filter((t) => t.pid === p.id);
              return (
                <tr key={p.id}>
                  <td>{p.name}</td>
                  <td>{T.length}</td>
                  <td>{T.filter((t) => t.status === 'Done').length}</td>
                  <td>{T.filter(overdue).length}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="panel tw">
        <h2>Employee-wise</h2>
        <table>
          <thead><tr><th>Employee</th><th>Assigned</th><th>Done</th><th>Overdue</th><th>Completion</th></tr></thead>
          <tbody>
            {emps.map((u) => {
              const T = S.tasks.filter((t) => t.assignee === u.id);
              const dn = T.filter((t) => t.status === 'Done').length;
              return (
                <tr key={u.id}>
                  <td>{u.name}</td>
                  <td>{T.length}</td>
                  <td>{dn}</td>
                  <td>{T.filter(overdue).length}</td>
                  <td>{T.length ? Math.round((dn / T.length) * 100) : 0}%</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}