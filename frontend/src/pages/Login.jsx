import { useState } from 'react';
import { api, token } from '../api';

export default function Login({ onLogin }) {
  const [login, setLogin] = useState('');
  const [pw, setPw] = useState('');
  const [err, setErr] = useState('');

  const submit = async () => {
    const r = await api('/auth/login', 'POST', { login, pw }, true);
    if (r.error) return setErr(r.error);
    token.set(r.token);
    onLogin();
  };

  return (
    <div className="login">
      <h1>Task Allocation System</h1>
      <p>Sign in to see your projects and tasks.</p>
      <label>Username</label>
      <input value={login} onChange={(e) => setLogin(e.target.value)} autoCapitalize="none" spellCheck="false" />
      <label>Password</label>
      <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && submit()} />
      <div className="od" style={{ margin: '8px 0' }}>{err}</div>
      <button onClick={submit}>Sign in</button>
      <div className="hint">Demo logins: admin / admin123, manager / manager123, karthik / 1234 (employee)</div>
    </div>
  );
}