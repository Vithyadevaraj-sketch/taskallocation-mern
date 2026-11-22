import { useState } from 'react';
import Modal from '../Modal';
import { d, overdue } from '../api';

const STATUSES = ['To Do', 'In Progress', 'Done'];
const PRIS = ['High', 'Medium', 'Low'];

function TaskForm({ task, projects, emps, act, onClose }) {
  const [f, setF] = useState({
    title: task ? task.title : '',
    project: task ? task.pid : projects[0].id,
    desc: task ? task.desc : '',
    pri: task ? task.pri : 'Medium',
    due: task ? task.due : d(7),
    skills: task ? task.skills.join(', ') : '',
    assignee: task && task.assignee ? task.assignee : 'auto',
  });
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const save = async () => {
    if (!f.title.trim()) return alert('Enter a task title.');
    const r = task ? await act('/tasks/' + task.id, 'PUT', f) : await act('/tasks', 'POST', f);
    if (!r.error) onClose();
  };

  return (
    <Modal onClose={onClose}>
      <h2>{task ? 'Edit' : 'New'} task</h2>
      <label>Title</label>
      <input value={f.title} onChange={set('title')} />
      <label>Project</label>
      <select value={f.project} onChange={set('project')}>
        {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
      </select>
      <label>Description</label>
      <textarea rows="2" value={f.desc} onChange={set('desc')} />
      <div className="g2">
        <div>
          <label>Priority</label>
          <select value={f.pri} onChange={set('pri')}>
            {PRIS.map((x) => <option key={x}>{x}</option>)}
          </select>
        </div>
        <div>
          <label>Deadline</label>
          <input type="date" value={f.due} onChange={set('due')} />
        </div>
      </div>
      <label>Skills needed (comma separated)</label>
      <input placeholder="react, sql" value={f.skills} onChange={set('skills')} />
      <label>Assign to</label>
      <select value={f.assignee} onChange={set('assignee')}>
        <option value="auto">Auto-allocate (skills and workload)</option>
        {emps.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
      </select>
      <div className="acts" style={{ marginTop: 16 }}>
        <button onClick={save}>{task ? 'Save changes' : 'Create task'}</button>
        <button className="ghost" onClick={onClose}>Cancel</button>
      </div>
    </Modal>
  );
}

function TaskDetails({ task, S, act, onClose }) {
  const [text, setText] = useState('');
  const project = S.projects.find((p) => p.id === task.pid);
  const assignee = S.users.find((u) => u.id === task.assignee);

  const post = async () => {
    if (!text.trim()) return;
    const r = await act('/tasks/' + task.id + '/comments', 'POST', { text });
    if (!r.error) setText('');
  };

  return (
    <Modal onClose={onClose}>
      <h2>{task.title}</h2>
      <p className="sub">
        {project ? project.name : '-'}, assigned to {assignee ? assignee.name : 'nobody'}, due {task.due || '-'}
      </p>
      <p>{task.desc || 'No description.'}</p>
      <h3>Comments</h3>
      {task.comments.map((c, i) => (
        <div className="cm" key={i}>
          <b>{c.by}</b> <span className="sub">{c.at}</span>
          <br />
          {c.text}
        </div>
      ))}
      {!task.comments.length && <div className="empty">No comments yet.</div>}
      <label>Add comment</label>
      <input value={text} onChange={(e) => setText(e.target.value)} />
      <div className="acts" style={{ marginTop: 12 }}>
        <button onClick={post}>Post comment</button>
        <button className="ghost" onClick={onClose}>Close</button>
      </div>
    </Modal>
  );
}

export default function Tasks({ S, isMgr, act }) {
  const [pf, setPf] = useState('all');
  const [form, setForm] = useState(null); // null or { task }
  const [detailId, setDetailId] = useState(null);

  const emps = S.users.filter((u) => u.role === 'Employee');
  const tasks = pf === 'all' ? S.tasks : S.tasks.filter((t) => t.pid === pf);
  const detailTask = S.tasks.find((t) => t.id === detailId);

  const newTask = () => {
    if (!S.projects.length) return alert('Create a project first.');
    setForm({ task: null });
  };

  const card = (t) => {
    const project = S.projects.find((p) => p.id === t.pid);
    const assignee = S.users.find((u) => u.id === t.assignee);
    return (
      <div className="card" key={t.id}>
        <div className="r">
          <b>{t.title}</b>
          <span className={'pri ' + t.pri}>{t.pri}</span>
        </div>
        <div className="sub">{project ? project.name : '-'}</div>
        <div className="sub">
          {assignee ? assignee.name : 'Unassigned'}, due{' '}
          <span className={overdue(t) ? 'od' : ''}>
            {t.due || '-'}{overdue(t) ? ' (overdue)' : ''}
          </span>
        </div>
        <div>{t.skills.map((s) => <span className="chip" key={s}>{s}</span>)}</div>
        {t.reason && <div className="sub">Why: {t.reason}</div>}
        <div className="acts">
          <select value={t.status} onChange={(e) => act('/tasks/' + t.id + '/status', 'PATCH', { status: e.target.value })}>
            {STATUSES.map((s) => <option key={s}>{s}</option>)}
          </select>
          <button className="ghost" onClick={() => setDetailId(t.id)}>Details ({t.comments.length})</button>
          {isMgr && (
            <>
              <select value="" onChange={(e) => e.target.value && act('/tasks/' + t.id + '/assign', 'POST', { assignee: e.target.value })}>
                <option value="">Reassign</option>
                <option value="auto">Auto-pick</option>
                {emps.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
              <button className="ghost" onClick={() => setForm({ task: t })}>Edit</button>
              <button className="dng" onClick={() => window.confirm('Delete this task?') && act('/tasks/' + t.id, 'DELETE')}>Delete</button>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="row">
        <h1>Tasks</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <select value={pf} onChange={(e) => setPf(e.target.value)}>
            <option value="all">All projects</option>
            {S.projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          {isMgr && <button onClick={newTask}>New task</button>}
        </div>
      </div>
      <div className="cols">
        {STATUSES.map((s) => {
          const list = tasks.filter((t) => t.status === s);
          return (
            <div className="col" key={s}>
              <h3>{s} ({list.length})</h3>
              {list.map(card)}
              {!list.length && <div className="empty">Nothing here.</div>}
            </div>
          );
        })}
      </div>
      {form && (
        <TaskForm task={form.task} projects={S.projects} emps={emps} act={act} onClose={() => setForm(null)} />
      )}
      {detailTask && <TaskDetails task={detailTask} S={S} act={act} onClose={() => setDetailId(null)} />}
    </>
  );
}