import { categoryRevenue, dropOffRisks, monthlyRevenue } from './dashboard-data';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

type RequestOptions = {
  token?: string | null;
  region?: string;
};

async function fetchJson<T>(path: string, options: RequestOptions): Promise<T | null> {
  if (!options.token) {
    return null;
  }

  const params = new URLSearchParams();
  if (options.region && options.region !== 'all') {
    params.set('region', options.region);
  }

  try {
    const query = params.toString();
    const response = await fetch(`${API_BASE_URL}${path}${query ? `?${query}` : ''}`, {
      headers: {
        Authorization: `Bearer ${options.token}`,
      },
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as T;
  } catch {
    return null;
  }
}

function unwrapList<T>(payload: unknown): T[] | null {
  if (Array.isArray(payload)) {
    return payload as T[];
  }

  if (payload && typeof payload === 'object') {
    const record = payload as Record<string, unknown>;
    if (Array.isArray(record.data)) {
      return record.data as T[];
    }
    if (record.data && typeof record.data === 'object') {
      const nested = record.data as Record<string, unknown>;
      if (Array.isArray(nested.items)) {
        return nested.items as T[];
      }
      if (Array.isArray(nested.data)) {
        return nested.data as T[];
      }
    }
  }

  return null;
}

export async function loadDashboardData(options: RequestOptions) {
  const [categoryPayload, dropOffPayload, monthlyPayload] = await Promise.all([
    fetchJson('/analytics/revenue-by-category', options),
    fetchJson('/analytics/drop-off-by-course', options),
    fetchJson('/analytics/monthly-revenue', options),
  ]);

  return {
    categoryRevenue: unwrapList<typeof categoryRevenue[number]>(categoryPayload) ?? categoryRevenue,
    dropOffRisks: unwrapList<typeof dropOffRisks[number]>(dropOffPayload) ?? dropOffRisks,
    monthlyRevenue: unwrapList<typeof monthlyRevenue[number]>(monthlyPayload) ?? monthlyRevenue,
    source: (categoryPayload || dropOffPayload || monthlyPayload ? 'api' : 'mock') as
      | 'api'
      | 'mock',
  };
}
