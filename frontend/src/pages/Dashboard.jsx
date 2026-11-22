import { overdue } from '../api';

export default function Dashboard({ S, me, isMgr }) {
  const emps = S.users.filter((u) => u.role === 'Employee');
  const T = S.tasks;
  const done = T.filter((t) => t.status === 'Done').length;
  const prog = T.filter((t) => t.status === 'In Progress').length;
  const od = T.filter(overdue).length;
  const recent = T.slice(-5).reverse();

  return (
    <>
      <h1>Hello, {me.name}</h1>
      <p className="sub">{isMgr ? 'Overview of all projects' : 'Your assigned work'}</p>
      <div className="tiles">
        <div className="tile"><b>{T.length}</b><span>Total tasks</span></div>
        <div className="tile"><b>{prog}</b><span>In progress</span></div>
        <div className="tile"><b>{done}</b><span>Completed</span></div>
        <div className="tile"><b className={od ? 'od' : ''}>{od}</b><span>Overdue</span></div>
      </div>
      <div className="cols">
        <div className="panel">
          <h2>Workload by employee</h2>
          {emps.length ? (
            emps.map((u) => (
              <div className="wl" key={u.id}>
                <span>{u.name}{u.leave ? ' (leave)' : ''}</span>
                <div className="bar"><i style={{ width: Math.min(100, u.open * 20) + '%' }}></i></div>
                <b>{u.open}</b>
              </div>
            ))
          ) : (
            <div className="empty">No employees yet.</div>
          )}
          <p className="sub">Open tasks per person. Auto-allocation uses this.</p>
        </div>
        <div className="panel">
          <h2>Latest tasks</h2>
          <div className="tw">
            <table>
              <thead><tr><th>Task</th><th>Status</th><th>Due</th></tr></thead>
              <tbody>
                {recent.map((t) => (
                  <tr key={t.id}>
                    <td>{t.title}</td>
                    <td>{t.status}</td>
                    <td className={overdue(t) ? 'od' : ''}>{t.due || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!recent.length && <div className="empty">No tasks yet.</div>}
        </div>
      </div>
    </>
  );
}
