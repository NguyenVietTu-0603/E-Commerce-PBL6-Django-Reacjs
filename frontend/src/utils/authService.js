const API = process.env.REACT_APP_API_URL || '';

function getAuthHeader() {
  const token = localStorage.getItem('access_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function parseJson(res) {
  const text = await res.text();
  try { return JSON.parse(text); } catch { return text; }
}

export async function login(username, password) {
  const res = await fetch(`${API}/api/users/token/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  const data = await parseJson(res);
  if (!res.ok) throw data;

  // handle both shapes: { access, refresh }  OR { tokens: { access, refresh }, user }
  const access = data.access ?? data.tokens?.access;
  const refresh = data.refresh ?? data.tokens?.refresh;
  if (access) localStorage.setItem('access_token', access);
  if (refresh) localStorage.setItem('refresh_token', refresh);

  // optionally store user if returned
  const user = data.user ?? data.user_info ?? null;
  if (user) localStorage.setItem('user', JSON.stringify(user));

  // try to fetch current user if not returned
  if (!user) {
    try {
      const apiUser = await getCurrentUser();
      if (apiUser) localStorage.setItem('user', JSON.stringify(apiUser));
      return { access, refresh, user: apiUser };
    } catch (_) { /* ignore */ }
  }

  return { access, refresh, user };
}

export async function refreshToken() {
  const refresh = localStorage.getItem('refresh_token');
  if (!refresh) throw new Error('No refresh token');
  const res = await fetch(`${API}/api/users/token/refresh/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh }),
  });
  const data = await parseJson(res);
  if (!res.ok) throw data;
  const newAccess = data.access ?? data.tokens?.access;
  if (newAccess) localStorage.setItem('access_token', newAccess);
  return data;
}

export async function register(payload) {
  const res = await fetch(`${API}/api/auth/register/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await parseJson(res);
  if (!res.ok) throw data;
  // try to save tokens if backend returns them
  const access = data.access ?? data.tokens?.access;
  const refresh = data.refresh ?? data.tokens?.refresh;
  if (access) localStorage.setItem('access_token', access);
  if (refresh) localStorage.setItem('refresh_token', refresh);
  const user = data.user ?? null;
  if (user) localStorage.setItem('user', JSON.stringify(user));
  return data;
}

export async function logout() {
  try {
    await fetch(`${API}/api/auth/logout/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    });
  } catch (e) { /* ignore */ }
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user');
}

export async function getCurrentUser() {
  const res = await fetch(`${API}/api/users/me/`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
  });
  if (res.status === 401 || res.status === 403) {
    throw new Error('Unauthorized');
  }
  const data = await parseJson(res);
  if (!res.ok) throw data;
  return data.user ?? data;
}

export default {
  login,
  register,
  logout,
  getCurrentUser,
  refreshToken,
};