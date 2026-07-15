export interface AdminProfile {
  id: string; // References auth.users.id
  display_name?: string | null;
  role: 'admin' | 'superadmin';
  created_at: string;
}

export type AdminProfileInsert = Omit<AdminProfile, 'created_at'>;
export type AdminProfileUpdate = Partial<AdminProfileInsert>;

export interface Student {
  id: string;
  phone_number: string; // Canonical E.164
  name: string;
  status: 'active' | 'inactive';
  enrolled_at: string;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export type StudentInsert = Omit<Student, 'id' | 'created_at' | 'updated_at'>;
export type StudentUpdate = Partial<StudentInsert>;

export interface TrialBooking {
  id: string;
  name: string;
  phone: string; // Canonical E.164
  age?: number | null;
  gender?: string | null;
  city?: string | null;
  batch?: string | null;
  goal?: string | null;
  notes?: string | null;
  status?: string | null;
  created_at: string;
  mode?: string | null;
  experience?: string | null;
  source?: string | null;
}

export type TrialBookingInsert = Omit<TrialBooking, 'id' | 'created_at'>;
export type TrialBookingUpdate = Partial<TrialBookingInsert>;

export interface Lead {
  id: string;
  phone_number: string; // Canonical E.164
  name?: string | null;
  interest?: string | null;
  preferred_batch?: string | null;
  goal?: string | null;
  source?: string | null;
  assigned_to?: string | null; // References admin_profiles.id
  status: 'new' | 'contacted' | 'trial_booked' | 'enrolled' | 'lost';
  follow_up_date?: string | null;
  last_contact_at?: string;
  city?: string | null;
  health_notes?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export type LeadInsert = Omit<Lead, 'id' | 'created_at' | 'updated_at'>;
export type LeadUpdate = Partial<LeadInsert>;

export interface ConversationThread {
  id: string;
  phone_number: string; // Canonical E.164
  customer_name?: string | null;
  unread_count?: number;
  last_message?: string | null;
  last_message_at?: string;
  last_ai_response?: string | null;
  last_human_reply?: string | null;
  ai_enabled?: boolean;
  handover_reason?: string | null;
  status?: 'bot_handling' | 'live_chat' | 'human_required';
  assigned_to?: string | null; // References admin_profiles.id
  created_at: string;
  updated_at: string;
}

export type ConversationThreadInsert = Omit<ConversationThread, 'id' | 'created_at' | 'updated_at'>;
export type ConversationThreadUpdate = Partial<ConversationThreadInsert>;

export interface Message {
  id: string;
  thread_id?: string | null; // References conversation_threads.id
  message_id: string;
  phone_number: string;
  direction: 'incoming' | 'outgoing';
  text: string;
  whatsapp_timestamp: string;
  created_at: string;
}

export type MessageInsert = Omit<Message, 'id' | 'created_at'>;

export interface KnowledgeBase {
  id: string;
  category: string;
  question: string;
  answer: string; // Markdown format
  keywords?: string[] | null;
  tags?: string[] | null;
  language?: string;
  is_published?: boolean;
  priority?: number;
  updated_by?: string | null; // References admin_profiles.id
  embedding_status?: 'pending' | 'completed' | 'failed';
  created_at: string;
  updated_at: string;
}

export type KnowledgeBaseInsert = Omit<KnowledgeBase, 'id' | 'created_at' | 'updated_at'>;
export type KnowledgeBaseUpdate = Partial<KnowledgeBaseInsert>;

export interface Setting {
  id: string;
  key: string;
  value: any;
  updated_at: string;
}

export type SettingInsert = Omit<Setting, 'id' | 'updated_at'>;
export type SettingUpdate = Partial<SettingInsert>;
