const API_BASE = '/api';

export interface Office {
  code: string;
  name_fr: string;
  name_ar: string;
  address_fr: string;
  address_ar: string;
  phone: string;
}

export interface ScanEvent {
  id: number;
  event_type: string;
  office: string;
  office_name_fr: string;
  office_name_ar: string;
  performed_by_name: string;
  timestamp: string;
  notes: string;
}

export interface Parcel {
  id: number;
  tracking_number: string;
  barcode_data: string;
  origin_office: string;
  origin_name_fr: string;
  origin_name_ar: string;
  destination_office: string;
  destination_name_fr: string;
  destination_name_ar: string;
  current_office?: string;
  current_name_fr?: string;
  current_name_ar?: string;
  sender_name: string;
  sender_phone: string;
  recipient_name: string;
  recipient_phone: string;
  recipient_notes: string;
  description: string;
  weight_kg: string;
  fee: string;
  status: 'PENDING_DROPOFF' | 'INTAKE' | 'DISPATCHED' | 'ARRIVED' | 'DELIVERED' | 'CANCELLED';
  is_paid: boolean;
  total_paid: number;
  created_at: string;
  updated_at: string;
  scan_events?: ScanEvent[];
  barcode_svg?: string;
}

export interface FinanceSummary {
  total_received: number;
  total_spent: number;
  net_balance: number;
  currency: string;
  offices: {
    code: string;
    name_fr: string;
    name_ar: string;
    received: number;
    spent: number;
    balance: number;
  }[];
  recent_payments: any[];
  recent_expenses: any[];
}

export interface SmsMessage {
  id: number;
  tracking_number: string;
  recipient_phone: string;
  language: string;
  message_body: string;
  status: string;
  created_at: string;
  sent_at: string;
}

export const api = {
  async getOffices(): Promise<Office[]> {
    const res = await fetch(`${API_BASE}/offices/`);
    return res.json();
  },

  async getParcels(params?: Record<string, string>): Promise<Parcel[]> {
    const url = new URL(`${API_BASE}/parcels/`, window.location.origin);
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v) url.searchParams.set(k, v);
      });
    }
    const res = await fetch(url.toString());
    return res.json();
  },

  async trackParcel(code: string): Promise<Parcel> {
    const res = await fetch(`${API_BASE}/parcels/track/?code=${encodeURIComponent(code)}`);
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Erreur lors du suivi');
    }
    return res.json();
  },

  async createParcel(data: Partial<Parcel>): Promise<Parcel> {
    const res = await fetch(`${API_BASE}/parcels/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(JSON.stringify(err));
    }
    return res.json();
  },

  async intakeParcel(trackingNumber: string, payload: { fee?: number; weight_kg?: number; notes?: string }): Promise<any> {
    const res = await fetch(`${API_BASE}/parcels/${trackingNumber}/intake/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Erreur lors de l\'enregistrement');
    }
    return res.json();
  },

  async dispatchParcel(trackingNumber: string, notes?: string): Promise<any> {
    const res = await fetch(`${API_BASE}/parcels/${trackingNumber}/dispatch/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notes }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Erreur lors de l\'expédition');
    }
    return res.json();
  },

  async arriveParcel(trackingNumber: string, payload: { notes?: string; language?: string }): Promise<any> {
    const res = await fetch(`${API_BASE}/parcels/${trackingNumber}/arrive/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Erreur lors de l\'arrivée');
    }
    return res.json();
  },

  async pickupParcel(trackingNumber: string, notes?: string): Promise<any> {
    const res = await fetch(`${API_BASE}/parcels/${trackingNumber}/pickup/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notes }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Erreur lors de la remise');
    }
    return res.json();
  },

  async getPrintBon(trackingNumber: string, type: 'ticket' | 'sender' | 'recipient', lang: 'fr' | 'ar'): Promise<any> {
    const res = await fetch(`${API_BASE}/parcels/${trackingNumber}/print_bon/?type=${type}&lang=${lang}`);
    return res.json();
  },

  async getFinanceSummary(): Promise<FinanceSummary> {
    const res = await fetch(`${API_BASE}/finance/summary/`);
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Accès financier refusé');
    }
    return res.json();
  },

  async addPayment(payload: { tracking_number: string; amount: number; payment_method: string; notes?: string }): Promise<any> {
    const res = await fetch(`${API_BASE}/finance/payments/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Erreur lors du paiement');
    }
    return res.json();
  },

  async addExpense(payload: { office: string; amount: number; category: string; description: string }): Promise<any> {
    const res = await fetch(`${API_BASE}/finance/expenses/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Erreur lors de la dépense');
    }
    return res.json();
  },

  async getSmsOutbox(): Promise<SmsMessage[]> {
    const res = await fetch(`${API_BASE}/sms-outbox/`);
    return res.json();
  },

  async queryAi(query: string, language: string): Promise<any> {
    const res = await fetch(`${API_BASE}/ai/query/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, language }),
    });
    return res.json();
  },
};
