import { useState, useEffect, useCallback } from 'react';
import { api, token } from './api';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Tasks from './pages/Tasks';
import Projects from './pages/Projects';
import Team from './pages/Team';
import Reports from './pages/Reports';
import Alerts from './pages/Alerts';

const EMPTY = { users: [], projects: [], tasks: [], notes: [] };
const PAGES = { dash: Dashboard, tasks: Tasks, projects: Projects, team: Team, reports: Reports, alerts: Alerts };

export default function App() {
  const [S, setS] = useState(EMPTY);
  const [me, setMe] = useState(null);
  const [view, setView] = useState('dash');
  const [loading, setLoading] = useState(!!token.get());

  const load = useCallback(async () => {
    const j = await api('/state', 'GET', null, true);
    if (j.error) {
      token.clear();
      setMe(null);
      setS(EMPTY);
    } else {
      setS(j);
      setMe(j.me);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (token.get()) load();
  }, [load]);

  // call backend, then refresh all data
  const act = async (path, method = 'POST', body = {}) => {
    const r = await api(path, method, body);
    if (!r.error) await load();
    return r;
  };

  const logout = () => {
    token.clear();
    setMe(null);
    setS(EMPTY);
    setView('dash');
  };

  const onLogin = async () => {
    setLoading(true);
    await load();
    setView('dash');
  };

  if (loading) return <main><p className="sub">Loading...</p></main>;
  if (!me) return <Login onLogin={onLogin} />;

  const isMgr = me.role !== 'Employee';
  const unread = S.notes.filter((n) => !n.read).length;
  const items = [['dash', 'Dashboard'], ['tasks', 'Tasks']]
    .concat(isMgr ? [['projects', 'Projects'], ['team', 'Team'], ['reports', 'Reports']] : [])
    .concat([['alerts', 'Alerts' + (unread ? ' (' + unread + ')' : '')]]);
  const Page = PAGES[view];

  return (
    <>
      <div className="top">
        <b>Task Allocation</b>
        {items.map(([key, label]) => (
          <button key={key} className={'nav ' + (view === key ? 'on' : '')} onClick={() => setView(key)}>
            {label}
          </button>
        ))}
        <span className="sp"></span>
        <span className="sub">{me.name} ({me.role})</span>
        <button className="ghost" onClick={logout}>Sign out</button>
      </div>
      <main>
        <Page S={S} me={me} isMgr={isMgr} act={act} reload={load} />
      </main>
    </>
  );
}