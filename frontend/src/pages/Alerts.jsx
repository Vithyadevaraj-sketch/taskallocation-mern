import { useEffect } from 'react';

export default function Alerts({ S, act }) {
  const hasUnread = S.notes.some((n) => !n.read);

  useEffect(() => {
    if (hasUnread) act('/notes/read');
  }, [hasUnread]);

  return (
    <>
      <div className="row">
        <h1>Alerts</h1>
        <button className="ghost" onClick={() => act('/notes', 'DELETE')}>Clear all</button>
      </div>
      <div className="panel">
        {S.notes.map((n) => (
          <div className="cm" key={n.id}>
            {n.text}
            <div className="sub">{n.time}</div>
          </div>
        ))}
        {!S.notes.length && (
          <div className="empty">No alerts. New assignments and status changes will show here.</div>
        )}
      </div>
    </>
  );
}