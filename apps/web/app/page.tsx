'use client';

import { FormEvent, useEffect, useState } from 'react';

interface Account {
  id: string;
  personnelCode: string;
  roles: string[];
  teacher: { id: string } | null;
}
const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3001';

export default function HomePage() {
  const [account, setAccount] = useState<Account | null>(null);
  const [personnelCode, setPersonnelCode] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  useEffect(() => {
    void fetch(`${apiBaseUrl}/api/v1/auth/me`, { credentials: 'include' }).then(async (response) =>
      response.ok
        ? setAccount(((await response.json()) as { account: Account }).account)
        : undefined,
    );
  }, []);
  async function login(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setMessage('');
    const response = await fetch(`${apiBaseUrl}/api/v1/auth/login`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ personnelCode, password }),
    });
    if (!response.ok) {
      setMessage('Sign in failed. Check your credentials and try again.');
      return;
    }
    setAccount(((await response.json()) as { account: Account }).account);
    setPassword('');
  }
  async function logout(): Promise<void> {
    await fetch(`${apiBaseUrl}/api/v1/auth/logout`, { method: 'POST', credentials: 'include' });
    setAccount(null);
  }
  return (
    <main>
      <section aria-labelledby="page-title">
        <p className="eyebrow">Phase 1 · Secure access</p>
        <h1 id="page-title">EduTech</h1>
        {account ? (
          <div className="health">
            <p>
              Signed in as <strong>{account.personnelCode}</strong>.
            </p>
            <p>Roles: {account.roles.join(', ') || 'No roles assigned'}</p>
            <button onClick={() => void logout()}>Sign out</button>
          </div>
        ) : (
          <form onSubmit={login}>
            <p className="description">Sign in with your personnel code and password.</p>
            <label>
              Personnel code
              <input
                value={personnelCode}
                onChange={(event) => setPersonnelCode(event.target.value)}
                autoComplete="username"
                required
              />
            </label>
            <label>
              Password
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                required
              />
            </label>
            <button type="submit">Sign in</button>
            {message && (
              <p className="error" role="alert">
                {message}
              </p>
            )}
          </form>
        )}
      </section>
    </main>
  );
}
