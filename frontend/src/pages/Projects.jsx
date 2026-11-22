import { useState } from 'react';
import Modal from '../Modal';
import { d } from '../api';

const STATUSES = ['Active', 'On hold', 'Completed'];

function ProjectForm({ project, act, onClose }) {
  const [f, setF] = useState({
    name: project ? project.name : '',
    desc: project ? project.desc : '',
    start: project ? project.start : d(0),
    end: project ? project.end : d(30),
    status: project ? project.status : 'Active',
  });
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const save = async () => {
    if (!f.name.trim()) return alert('Enter a project name.');
    const r = project ? await act('/projects/' + project.id, 'PUT', f) : await act('/projects', 'POST', f);
    if (!r.error) onClose();
  };

  return (
    <Modal onClose={onClose}>
      <h2>{project ? 'Edit' : 'New'} project</h2>
      <label>Name</label>
      <input value={f.name} onChange={set('name')} />
      <label>Description</label>
      <textarea rows="2" value={f.desc} onChange={set('desc')} />
      <div className="g2">
        <div>
          <label>Start</label>
          <input type="date" value={f.start} onChange={set('start')} />
        </div>
        <div>
          <label>End</label>
          <input type="date" value={f.end} onChange={set('end')} />
        </div>
      </div>
      <div className="acts" style={{ marginTop: 16 }}>
        <button onClick={save}>{project ? 'Save changes' : 'Create project'}</button>
        <button className="ghost" onClick={onClose}>Cancel</button>
      </div>
    </Modal>
  );
}

export default function Projects({ S, act }) {
  const [form, setForm] = useState(null); // null or { project }

  return (
    <>
      <div className="row">
        <h1>Projects</h1>
        <button onClick={() => setForm({ project: null })}>New project</button>
      </div>
      {S.projects.map((p) => {
        const T = S.tasks.filter((t) => t.pid === p.id);
        const done = T.filter((t) => t.status === 'Done').length;
        const pc = T.length ? Math.round((done / T.length) * 100) : 0;
        return (
          <div className="panel" key={p.id}>
            <div className="r">
              <div>
                <h3>{p.name}</h3>
                <div className="sub">{p.desc}</div>
                <div className="sub">{p.start} to {p.end}, {p.status}</div>
              </div>
              <div className="acts" style={{ margin: 0 }}>
                <select value={p.status} onChange={(e) => act('/projects/' + p.id + '/status', 'PATCH', { status: e.target.value })}>
                  {STATUSES.map((s) => <option key={s}>{s}</option>)}
                </select>
                <button className="ghost" onClick={() => setForm({ project: p })}>Edit</button>
                <button
                  className="dng"
                  onClick={() => window.confirm('Delete this project and its tasks?') && act('/projects/' + p.id, 'DELETE')}
                >
                  Delete
                </button>
              </div>
            </div>
            <div className="bar" style={{ marginTop: 10 }}><i style={{ width: pc + '%' }}></i></div>
            <div className="sub">{pc}% done, {done} of {T.length} tasks</div>
          </div>
        );
      })}
      {!S.projects.length && <div className="empty">No projects yet. Create one to start adding tasks.</div>}
      {form && <ProjectForm project={form.project} act={act} onClose={() => setForm(null)} />}
    </>
  );
}