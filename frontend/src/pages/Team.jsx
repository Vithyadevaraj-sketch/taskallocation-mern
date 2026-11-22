import { useState } from 'react';
import Modal from '../Modal';

function UserForm({ act, onClose }) {
  const [f, setF] = useState({ name: '', login: '', pw: '', email: '', role: 'Employee', skills: '' });
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const save = async () => {
    const r = await act('/users', 'POST', f);
    if (!r.error) onClose();
  };

  return (
    <Modal onClose={onClose}>
      <h2>Add user</h2>
      <label>Name</label>
      <input value={f.name} onChange={set('name')} />
      <div className="g2">
        <div>
          <label>Username</label>
          <input value={f.login} onChange={set('login')} />
        </div>
        <div>
          <label>Password</label>
          <input value={f.pw} onChange={set('pw')} />
        </div>
      </div>
      <label>Email</label>
      <input type="email" placeholder="name@gmail.com" value={f.email} onChange={set('email')} />
      <label>Role</label>
      <select value={f.role} onChange={set('role')}>
        <option>Employee</option>
        <option>Manager</option>
        <option>Admin</option>
      </select>
      <label>Skills (comma separated)</label>
      <input value={f.skills} onChange={set('skills')} />
      <div className="acts" style={{ marginTop: 16 }}>
        <button onClick={save}>Add user</button>
        <button className="ghost" onClick={onClose}>Cancel</button>
      </div>
    </Modal>
  );
}

export default function Team({ S, me, act }) {
  const [adding, setAdding] = useState(false);

  const setEmail = (u) => {
    const email = window.prompt('Email for ' + u.name, u.email || '');
    if (email !== null) act('/users/' + u.id + '/email', 'PATCH', { email });
  };

  const editSkills = (u) => {
    const skills = window.prompt('Skills for ' + u.name + ' (comma separated)', u.skills.join(', '));
    if (skills !== null) act('/users/' + u.id + '/skills', 'PATCH', { skills });
  };

  return (
    <>
      <div className="row">
        <h1>Team and skills</h1>
        {me.role === 'Admin' && <button onClick={() => setAdding(true)}>Add user</button>}
      </div>
      <div className="panel tw">
        <table>
          <thead>
            <tr><th>Name</th><th>Role</th><th>Email</th><th>Skills</th><th>Open tasks</th><th>Availability</th></tr>
          </thead>
          <tbody>
            {S.users.map((u) => (
              <tr key={u.id}>
                <td>{u.name}</td>
                <td>{u.role}</td>
                <td>
                  {u.email || <span className="sub">not set</span>}{' '}
                  <button className="ghost" style={{ padding: '2px 8px', fontSize: 12 }} onClick={() => setEmail(u)}>
                    {u.email ? 'Change' : 'Set email'}
                  </button>
                </td>
                <td>
                  {u.skills.length ? u.skills.map((s) => <span className="chip" key={s}>{s}</span>) : '-'}{' '}
                  {u.role === 'Employee' && (
                    <button className="ghost" style={{ padding: '2px 8px', fontSize: 12 }} onClick={() => editSkills(u)}>
                      Edit skills
                    </button>
                  )}
                </td>
                <td>{u.role === 'Employee' ? u.open : '-'}</td>
                <td>
                  {u.role === 'Employee' && (
                    <button className="ghost" onClick={() => act('/users/' + u.id + '/leave')}>
                      {u.leave ? 'On leave, mark available' : 'Available, mark on leave'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {adding && <UserForm act={act} onClose={() => setAdding(false)} />}
    </>
  );
}