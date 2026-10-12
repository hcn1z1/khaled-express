const API_BASE = 'http://localhost:8000/api';

export function getStaffToken(): string | null {
  return localStorage.getItem('khaled_staff_token');
}

export function setStaffToken(token: string | null) {
  if (token) {
    localStorage.setItem('khaled_staff_token', token);
  } else {
    localStorage.removeItem('khaled_staff_token');
  }
}

export function getStaffUser() {
  const raw = localStorage.getItem('khaled_staff_user');
  return raw ? JSON.parse(raw) : null;
}

export function setStaffUser(user: any) {
  if (user) {
    localStorage.setItem('khaled_staff_user', JSON.stringify(user));
  } else {
    localStorage.removeItem('khaled_staff_user');
  }
}

async function request(endpoint: string, options: RequestInit = {}) {
  const token = getStaffToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Token ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    if (res.status === 401 && !endpoint.includes('/core/auth/login')) {
      // Clear invalid credentials and notify app to display login
      setStaffToken(null);
      setStaffUser(null);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('staff:unauthorized'));
      }
    }
    let msg = data.error || data.detail || data.message || (data.report && data.report.error);
    if (!msg && typeof data === 'object') {
      const stringValues = Object.values(data).filter((v) => typeof v === 'string');
      msg = stringValues.length > 0 ? stringValues[0] : 'Erreur API';
    }
    throw new Error(typeof msg === 'string' ? msg : 'Erreur API');
  }

  return data;
}

// Authentication
export async function staffLogin(phone_number: string, password: string) {
  const res = await request('/core/auth/login/', {
    method: 'POST',
    body: JSON.stringify({ phone_number, password }),
  });
  setStaffToken(res.token);
  setStaffUser(res.user);
  return res;
}

export async function getStaffMe() {
  return request('/core/auth/me/');
}

// Offices
export async function getOffices() {
  return request('/core/offices/');
}

// Parcels
export async function getParcels(params: Record<string, any> = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') {
      query.append(k, String(v));
    }
  });
  const qs = query.toString() ? `?${query.toString()}` : '';
  return request(`/parcels/${qs}`);
}

export async function getParcelById(id: number) {
  return request(`/parcels/${id}/`);
}

export async function createParcelStaff(data: any) {
  return request('/parcels/', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateParcelFee(id: number, fee_amount: string) {
  return request(`/parcels/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify({ fee_amount }),
  });
}

// Scanner Action
export async function executeScan(data: {
  tracking_code: string;
  event_type: 'INTAKE' | 'DISPATCH' | 'ARRIVAL' | 'PICKUP';
  office_id?: number;
  notes?: string;
}) {
  return request('/parcels/scan/', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// Finance (Admin Only)
export async function getFinanceSummary() {
  return request('/finance/summary/');
}

export async function getPayments() {
  return request('/finance/payments/');
}

export async function createPayment(data: {
  parcel: number;
  amount: string;
  payment_method: string;
  reference?: string;
  notes?: string;
}) {
  return request('/finance/payments/', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getExpenses() {
  return request('/finance/expenses/');
}

export async function createExpense(data: {
  amount: string;
  category: string;
  office?: number | null;
  description: string;
}) {
  return request('/finance/expenses/', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// AI Assistant
export async function queryAiAssistant(query: string) {
  return request('/ai/assistant/', {
    method: 'POST',
    body: JSON.stringify({ query }),
  });
}

// SMS Outbox & Gateway Settings
export async function getSmsOutbox() {
  return request('/notifications/outbox/');
}

export async function getSmsSettings() {
  return request('/notifications/settings/');
}

export async function updateSmsSettings(data: Record<string, any>) {
  return request('/notifications/settings/', {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function sendTestSms(phoneNumber: string, message?: string) {
  return request('/notifications/settings/test-sms/', {
    method: 'POST',
    body: JSON.stringify({ phone_number: phoneNumber, message }),
  });
}

export async function resetSmsTemplates() {
  return request('/notifications/settings/reset-templates/', {
    method: 'POST',
  });
}
