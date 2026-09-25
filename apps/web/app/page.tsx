'use client';

import { useEffect, useState } from 'react';

interface HealthStatus {
  status: 'ok' | 'degraded';
  version: string;
  environment: string;
  database: 'connected' | 'disconnected';
}

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3001';

export default function HomePage() {
  const [health, setHealth] = useState<HealthStatus>();
  const [error, setError] = useState<string>();

  useEffect(() => {
    const controller = new AbortController();

    async function loadHealth(): Promise<void> {
      try {
        const response = await fetch(`${apiBaseUrl}/health`, { signal: controller.signal });
        if (!response.ok) throw new Error(`API request failed (${response.status})`);
        setHealth((await response.json()) as HealthStatus);
      } catch (requestError) {
        if (!controller.signal.aborted) {
          setError(requestError instanceof Error ? requestError.message : 'API request failed');
        }
      }
    }

    void loadHealth();
    return () => controller.abort();
  }, []);

  return (
    <main>
      <section aria-labelledby="page-title">
        <p className="eyebrow">Phase 0 · Foundation</p>
        <h1 id="page-title">EduTech Web is running.</h1>
        <p className="description">
          This intentionally minimal page verifies communication with the API. No business feature
          is implemented yet.
        </p>
        <div className="health" aria-live="polite">
          <h2>API health</h2>
          {health ? (
            <dl>
              <div>
                <dt>Status</dt>
                <dd>{health.status}</dd>
              </div>
              <div>
                <dt>Database</dt>
                <dd>{health.database}</dd>
              </div>
              <div>
                <dt>Version</dt>
                <dd>{health.version}</dd>
              </div>
              <div>
                <dt>Environment</dt>
                <dd>{health.environment}</dd>
              </div>
            </dl>
          ) : error ? (
            <p className="error">Unavailable: {error}</p>
          ) : (
            <p>Checking API and database connectivity…</p>
          )}
        </div>
      </section>
    </main>
  );
}
