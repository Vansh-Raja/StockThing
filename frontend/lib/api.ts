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
    credentials: 'include', // Include session cookies
    ...options,
  });

  if (!response.ok) {
    let errorMessage = `HTTP error! status: ${response.status}`;
    try {
      // Clone response to read it without consuming the original
      const clonedResponse = response.clone();
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        const errorData = await clonedResponse.json();
        errorMessage = errorData.error || errorData.message || errorMessage;
      } else {
        const text = await clonedResponse.text();
        errorMessage = text || errorMessage;
      }
    } catch (e) {
      // If all else fails, use status-based message
      if (response.status === 401) {
        errorMessage = 'Invalid username or password';
      } else if (response.status === 400) {
        errorMessage = 'Invalid request. Please check your input.';
      } else if (response.status >= 500) {
        errorMessage = 'Server error. Please try again later.';
      }
    }
    throw new Error(errorMessage);
  }

  return response.json();
}

// Auth API
export const authAPI = {
  register: async (data: { username: string; email: string; password: string; family_name?: string }) => {
    return fetchAPI('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  login: async (username: string, password: string) => {
    return fetchAPI('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  },
  logout: async () => {
    return fetchAPI('/auth/logout', {
      method: 'POST',
    });
  },
  getCurrentUser: async () => {
    return fetchAPI('/auth/me');
  },
};

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

// Portfolio API (family_id comes from session now)
export const portfolioAPI = {
  getScripView: async () => {
    return fetchAPI('/portfolio/scrip-view');
  },
  getHeadView: async () => {
    return fetchAPI('/portfolio/head-view');
  },
  getSummary: async () => {
    return fetchAPI('/portfolio/summary');
  },
};

// Capital Gains API (family_id comes from session now)
export const capitalGainsAPI = {
  getAll: async (filters?: {
    account_id?: number;
    stock_id?: number;
    from_date?: string;
    to_date?: string;
  }) => {
    const params = new URLSearchParams();
    if (filters?.account_id) params.append('account_id', filters.account_id.toString());
    if (filters?.stock_id) params.append('stock_id', filters.stock_id.toString());
    if (filters?.from_date) params.append('from_date', filters.from_date);
    if (filters?.to_date) params.append('to_date', filters.to_date);
    const query = params.toString();
    return fetchAPI(`/capital-gains${query ? `?${query}` : ''}`);
  },
  getSummary: async (filters?: {
    account_id?: number;
    stock_id?: number;
    from_date?: string;
    to_date?: string;
  }) => {
    const params = new URLSearchParams();
    if (filters?.account_id) params.append('account_id', filters.account_id.toString());
    if (filters?.stock_id) params.append('stock_id', filters.stock_id.toString());
    if (filters?.from_date) params.append('from_date', filters.from_date);
    if (filters?.to_date) params.append('to_date', filters.to_date);
    const query = params.toString();
    return fetchAPI(`/capital-gains/summary${query ? `?${query}` : ''}`);
  },
};

