export interface Office {
  id: number;
  name_fr: string;
  name_ar: string;
  code: 'ALGIERS' | 'EL_EULMA';
  address: string;
  phone: string;
  opening_hours?: string;
}

export interface User {
  id: number;
  phone_number: string;
  full_name: string;
  role: 'CUSTOMER' | 'MODERATOR' | 'ADMIN';
  preferred_language: 'fr' | 'ar';
}

export interface ScanEvent {
  id: number;
  event_type: 'INTAKE' | 'DISPATCH' | 'ARRIVAL' | 'DELIVERY';
  office: number;
  office_detail?: Office;
  operator_name?: string;
  timestamp: string;
  notes?: string;
}

export interface Parcel {
  id: number;
  tracking_code: string;
  status: 'REQUESTED' | 'RECEIVED_AT_ORIGIN' | 'DISPATCHED' | 'RECEIVED_AT_DESTINATION' | 'DELIVERED';
  origin_office: number;
  destination_office: number;
  origin_office_detail?: Office;
  destination_office_detail?: Office;
  sender_name: string;
  sender_phone: string;
  sender_address?: string;
  recipient_name: string;
  recipient_phone: string;
  recipient_address?: string;
  description: string;
  weight_kg: string | number;
  fee_amount: number;
  payment_status: 'UNPAID' | 'PAID';
  preferred_sms_language: 'fr' | 'ar';
  barcode_svg?: string;
  barcode_png?: string;
  created_at: string;
  scan_events?: ScanEvent[];
}

export interface NewParcelPayload {
  origin_office: number;
  destination_office: number;
  sender_name: string;
  sender_phone: string;
  sender_address?: string;
  recipient_name: string;
  recipient_phone: string;
  recipient_address?: string;
  description: string;
  weight_kg: string | number;
  preferred_sms_language: 'fr' | 'ar';
}
