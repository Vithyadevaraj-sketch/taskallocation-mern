
const BASE = import.meta.env.PROD
  ? 'https://taskallocation-mern.onrender.com/api'
  : 'http://localhost:5000/api';

export const token = {
  get: () => localStorage.getItem('token'),
  set: (t) => localStorage.setItem('token', t),
  clear: () => localStorage.removeItem('token'),
};

// Failed call returns { error, status }. Success returns the JSON data.
export async function api(path, method = 'GET', body, quiet = false) {
  try {
    const res = await fetch(BASE + path, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token.get() ? { Authorization: 'Bearer ' + token.get() } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      if (!quiet) alert(data.error || 'Server error ' + res.status);
      return { error: data.error || 'Server error', status: res.status };
    }

    return data;
  } catch (e) {
    if (!quiet) alert('Cannot reach the server. Please check the backend.');
    return { error: 'Cannot reach the server', status: 0 };
  }
}

// Date helpers (YYYY-MM-DD)
export const d = (n) => {
  const x = new Date();
  x.setDate(x.getDate() + n);
  return x.toISOString().slice(0, 10);
};

export const today = () => d(0);

export const overdue = (t) =>
  t.status !== 'Done' && t.due && t.due < today();
