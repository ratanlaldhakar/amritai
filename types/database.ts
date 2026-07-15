export interface Admin {
  id: string;
  email: string;
  name: string | null;
  role: 'superadmin' | 'instructor' | 'coordinator';
  created_at: string;
  updated_at: string;
}

export type AdminInsert = Omit<Admin, 'id' | 'created_at' | 'updated_at'>;
export type AdminUpdate = Partial<AdminInsert>;

export interface Batch {
  id: string;
  name: string;
  start_time: string; // Format: 'HH:MM:SS'
  end_time: string; // Format: 'HH:MM:SS'
  days: string[];
  instructor: string | null;
  capacity: number;
  created_at: string;
  updated_at: string;
}

export type BatchInsert = Omit<Batch, 'id' | 'created_at' | 'updated_at'>;
export type BatchUpdate = Partial<BatchInsert>;

export interface Student {
  id: string;
  phone_number: string;
  name: string;
  status: 'lead' | 'trial_booked' | 'active' | 'inactive';
  trial_date: string | null;
  batch_id: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export type StudentInsert = Omit<Student, 'id' | 'created_at' | 'updated_at'>;
export type StudentUpdate = Partial<StudentInsert>;

export interface FAQ {
  id: string;
  category: string;
  question: string;
  answer: string;
  is_published: boolean;
  priority: number;
  created_at: string;
  updated_at: string;
}

export type FAQInsert = Omit<FAQ, 'id' | 'created_at' | 'updated_at'>;
export type FAQUpdate = Partial<FAQInsert>;

export interface Message {
  id: string;
  message_id: string;
  phone_number: string;
  customer_name: string | null;
  text: string;
  direction: 'incoming' | 'outgoing';
  whatsapp_timestamp: string;
  created_at: string;
}

export type MessageInsert = Omit<Message, 'id' | 'created_at'>;

export interface Inquiry {
  id: string;
  phone_number: string;
  customer_name: string | null;
  message: string;
  status: 'pending' | 'resolved' | 'ignored';
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
}

export type InquiryInsert = Omit<Inquiry, 'id' | 'created_at' | 'updated_at'>;
export type InquiryUpdate = Partial<InquiryInsert>;

export interface Setting {
  id: string;
  key: string;
  value: any; // Dynamic JSON configuration
  updated_at: string;
}

export type SettingInsert = Omit<Setting, 'id' | 'updated_at'>;
export type SettingUpdate = Partial<SettingInsert>;
