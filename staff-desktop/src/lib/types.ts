export type Role = 'CUSTOMER' | 'MODERATOR' | 'ADMIN';
export type Language = 'fr' | 'ar';

export interface Office {
  id: number;
  code: 'ALGIERS' | 'EL_EULMA';
  name_fr: string;
  name_ar: string;
  wilaya: string;
  address_fr: string;
  address_ar: string;
  phone: string;
}

export interface UserProfile {
  id: number;
  phone_number: string;
  full_name: string;
  role: Role;
  assigned_office?: number | null;
  assigned_office_detail?: Office | null;
  preferred_language: Language;
}

export interface ScanEvent {
  id: number;
  parcel: number;
  event_type: 'INTAKE' | 'DISPATCH' | 'ARRIVAL' | 'PICKUP';
  office: number;
  office_detail?: Office;
  scanned_by: number;
  scanned_by_detail?: UserProfile;
  timestamp: string;
  notes?: string;
}

export interface Parcel {
  id: number;
  tracking_code: string;
  origin_office: number;
  origin_office_detail?: Office;
  destination_office: number;
  destination_office_detail?: Office;
  current_office?: number | null;
  current_office_detail?: Office | null;
  sender_customer?: number | null;
  sender_name: string;
  sender_phone: string;
  sender_address?: string;
  recipient_name: string;
  recipient_phone: string;
  recipient_address?: string;
  preferred_sms_language: 'fr' | 'ar';
  description: string;
  weight_kg: string;
  notes?: string;
  status: 'REQUESTED' | 'RECEIVED_AT_ORIGIN' | 'DISPATCHED' | 'RECEIVED_AT_DESTINATION' | 'DELIVERED' | 'CANCELLED';
  fee_amount: string;
  total_paid: string;
  payment_status: 'UNPAID' | 'PARTIALLY_PAID' | 'PAID';
  barcode_png?: string;
  barcode_svg?: string;
  scan_events?: ScanEvent[];
  created_at: string;
  updated_at: string;
}

export interface PaymentEntry {
  id: number;
  parcel: number;
  tracking_code?: string;
  amount: string;
  payment_method: 'CASH' | 'BARIDIMOB' | 'CHECK' | 'OTHER';
  recorded_by?: number;
  recorded_by_detail?: UserProfile;
  recorded_at: string;
  reference?: string;
  notes?: string;
}

export interface ExpenseEntry {
  id: number;
  amount: string;
  category: 'FUEL' | 'RENT' | 'MAINTENANCE' | 'SALARY' | 'SUPPLIES' | 'OTHER';
  office?: number | null;
  office_detail?: Office | null;
  description: string;
  recorded_by?: number;
  recorded_by_detail?: UserProfile;
  date: string;
  created_at: string;
}

export interface MockSms {
  id: string;
  tracking_code: string;
  recipient_phone: string;
  language: string;
  message_body: string;
  status: 'QUEUED' | 'SENT' | 'FAILED';
  idempotency_key: string;
  queued_at: string;
  sent_at?: string;
  delivery_report?: Record<string, any>;
}

export interface SmsGatewaySettings {
  id: number;
  is_enabled: boolean;
  gateway_url: string;
  username: string;
  password?: string;
  device_name: string;
  template_fr: string;
  template_ar: string;
  default_template_fr: string;
  default_template_ar: string;
  updated_at: string;
  updated_by_name?: string | null;
}
