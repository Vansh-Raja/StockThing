// Use relative URL in production to avoid mixed content issues
// Next.js rewrites will proxy /api/* to the backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || (typeof window !== 'undefined' ? '/api' : 'http://localhost:5000/api');

async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

// Stock API
export const stockAPI = {
  search: async (query: string, exchange: string = 'NSE', signal?: AbortSignal) => {
    return fetchAPI(`/stocks/search?q=${encodeURIComponent(query)}&exchange=${exchange}`, {
      signal,
    });
  },
  getById: async (id: number) => {
    return fetchAPI(`/stocks/${id}`);
  },
  getPrice: async (id: number) => {
    return fetchAPI(`/stocks/${id}/price`);
  },
  getInfo: async (id: number) => {
    return fetchAPI(`/stocks/${id}/info`);
  },
};

// Account API
export const accountAPI = {
  getAll: async () => {
    return fetchAPI('/accounts');
  },
  getById: async (id: number) => {
    return fetchAPI(`/accounts/${id}`);
  },
};

// Transaction API
export const transactionAPI = {
  getAll: async (filters?: { account_id?: number; stock_id?: number }) => {
    const params = new URLSearchParams();
    if (filters?.account_id) params.append('account_id', filters.account_id.toString());
    if (filters?.stock_id) params.append('stock_id', filters.stock_id.toString());
    const query = params.toString();
    return fetchAPI(`/transactions${query ? `?${query}` : ''}`);
  },
  create: async (data: {
    account_id: number;
    stock_id: number;
    quantity: number;
    price: number;
    transaction_type: 'buy' | 'sell';
    transaction_date?: string;
    notes?: string;
  }) => {
    return fetchAPI('/transactions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  getById: async (id: number) => {
    return fetchAPI(`/transactions/${id}`);
  },
  update: async (id: number, data: Partial<{
    quantity: number;
    price: number;
    transaction_date: string;
    notes: string;
  }>) => {
    return fetchAPI(`/transactions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  delete: async (id: number) => {
    return fetchAPI(`/transactions/${id}`, {
      method: 'DELETE',
    });
  },
};

// Portfolio API
export const portfolioAPI = {
  getScripView: async (familyId: number = 1) => {
    return fetchAPI(`/portfolio/scrip-view?family_id=${familyId}`);
  },
  getHeadView: async (familyId: number = 1) => {
    return fetchAPI(`/portfolio/head-view?family_id=${familyId}`);
  },
  getSummary: async (familyId: number = 1) => {
    return fetchAPI(`/portfolio/summary?family_id=${familyId}`);
  },
};

// Capital Gains API
export const capitalGainsAPI = {
  getAll: async (filters?: {
    family_id?: number;
    account_id?: number;
    stock_id?: number;
    from_date?: string;
    to_date?: string;
  }) => {
    const params = new URLSearchParams();
    if (filters?.family_id) params.append('family_id', filters.family_id.toString());
    if (filters?.account_id) params.append('account_id', filters.account_id.toString());
    if (filters?.stock_id) params.append('stock_id', filters.stock_id.toString());
    if (filters?.from_date) params.append('from_date', filters.from_date);
    if (filters?.to_date) params.append('to_date', filters.to_date);
    const query = params.toString();
    return fetchAPI(`/capital-gains${query ? `?${query}` : ''}`);
  },
  getSummary: async (filters?: {
    family_id?: number;
    account_id?: number;
    stock_id?: number;
    from_date?: string;
    to_date?: string;
  }) => {
    const params = new URLSearchParams();
    if (filters?.family_id) params.append('family_id', filters.family_id.toString());
    if (filters?.account_id) params.append('account_id', filters.account_id.toString());
    if (filters?.stock_id) params.append('stock_id', filters.stock_id.toString());
    if (filters?.from_date) params.append('from_date', filters.from_date);
    if (filters?.to_date) params.append('to_date', filters.to_date);
    const query = params.toString();
    return fetchAPI(`/capital-gains/summary${query ? `?${query}` : ''}`);
  },
};

