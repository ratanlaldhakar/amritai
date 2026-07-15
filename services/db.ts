import { getSupabaseServiceRole } from '@/lib/supabase';
import { logger } from '@/lib/logger';
import { memoryCache } from '@/utils/cache';
import {
  Student,
  StudentInsert,
  TrialBooking,
  TrialBookingInsert,
  Lead,
  LeadInsert,
  ConversationThread,
  Message,
  MessageInsert,
  KnowledgeBase,
  KnowledgeBaseInsert,
  Setting,
} from '@/types/database';

// Global Phone Number Normalizer to E.164 Format
export function normalizePhoneNumber(phone: string): string {
  // Remove all characters except digits and a leading '+'
  let cleaned = phone.replace(/[^\d+]/g, '');

  if (cleaned.startsWith('+')) {
    return cleaned;
  }

  // Handle standard Indian numbers starting with '0'
  if (cleaned.startsWith('0') && cleaned.length === 11) {
    return '+91' + cleaned.substring(1);
  }

  // Handle standard 10 digit Indian numbers
  if (cleaned.length === 10) {
    return '+91' + cleaned;
  }

  // Prepend '+' for generic international numbers
  return '+' + cleaned;
}

export const db = {
  students: {
    async getByPhone(phoneNumber: string): Promise<Student | null> {
      const supabase = getSupabaseServiceRole();
      const canonical = normalizePhoneNumber(phoneNumber);
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('phone_number', canonical)
        .maybeSingle();

      if (error) {
        logger.error('db.students.getByPhone error:', { phoneNumber, canonical }, error);
        return null;
      }
      return data;
    },

    async upsert(
      student: Omit<StudentInsert, 'status'> & { status?: Student['status'] }
    ): Promise<Student | null> {
      const supabase = getSupabaseServiceRole();
      const canonicalPhone = normalizePhoneNumber(student.phone_number);
      const { data, error } = await supabase
        .from('students')
        .upsert({ ...student, phone_number: canonicalPhone }, { onConflict: 'phone_number' })
        .select('*')
        .single();

      if (error) {
        logger.error('db.students.upsert error:', { student }, error);
        return null;
      }
      return data;
    },

    async updateStatus(phoneNumber: string, status: Student['status']): Promise<boolean> {
      const supabase = getSupabaseServiceRole();
      const canonical = normalizePhoneNumber(phoneNumber);
      const { error } = await supabase
        .from('students')
        .update({ status })
        .eq('phone_number', canonical);

      if (error) {
        logger.error('db.students.updateStatus error:', { phoneNumber, status }, error);
        return false;
      }
      return true;
    },

    async getAll(): Promise<Student[]> {
      const supabase = getSupabaseServiceRole();
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        logger.error('db.students.getAll error:', {}, error);
        return [];
      }
      return data || [];
    },

    async update(
      id: string,
      updates: Partial<Omit<Student, 'id' | 'phone_number' | 'created_at'>>
    ): Promise<Student | null> {
      const supabase = getSupabaseServiceRole();
      const { data, error } = await supabase
        .from('students')
        .update(updates)
        .eq('id', id)
        .select('*')
        .single();

      if (error) {
        logger.error('db.students.update error:', { id, updates }, error);
        return null;
      }
      return data;
    },
  },

  trial_bookings: {
    async create(booking: TrialBookingInsert): Promise<TrialBooking | null> {
      const supabase = getSupabaseServiceRole();
      const canonicalPhone = normalizePhoneNumber(booking.phone);
      const { data, error } = await supabase
        .from('trial_bookings')
        .insert({ ...booking, phone: canonicalPhone })
        .select('*')
        .single();

      if (error) {
        logger.error('db.trial_bookings.create error:', { booking }, error);
        return null;
      }
      return data;
    },

    async getAll(): Promise<TrialBooking[]> {
      const supabase = getSupabaseServiceRole();
      const { data, error } = await supabase
        .from('trial_bookings')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        logger.error('db.trial_bookings.getAll error:', {}, error);
        return [];
      }
      return data || [];
    },
  },

  leads: {
    async getByPhone(phoneNumber: string): Promise<Lead | null> {
      const supabase = getSupabaseServiceRole();
      const canonical = normalizePhoneNumber(phoneNumber);
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('phone_number', canonical)
        .maybeSingle();

      if (error) {
        logger.error('db.leads.getByPhone error:', { phoneNumber, canonical }, error);
        return null;
      }
      return data;
    },

    async upsert(
      lead: Omit<LeadInsert, 'status'> & { status?: Lead['status'] }
    ): Promise<Lead | null> {
      const supabase = getSupabaseServiceRole();
      const canonicalPhone = normalizePhoneNumber(lead.phone_number);
      const { data, error } = await supabase
        .from('leads')
        .upsert({ ...lead, phone_number: canonicalPhone }, { onConflict: 'phone_number' })
        .select('*')
        .single();

      if (error) {
        logger.error('db.leads.upsert error:', { lead }, error);
        return null;
      }
      return data;
    },

    async updateStatus(phoneNumber: string, status: Lead['status']): Promise<boolean> {
      const supabase = getSupabaseServiceRole();
      const canonical = normalizePhoneNumber(phoneNumber);
      const { error } = await supabase
        .from('leads')
        .update({ status, last_contact_at: new Date().toISOString() })
        .eq('phone_number', canonical);

      if (error) {
        logger.error('db.leads.updateStatus error:', { phoneNumber, status }, error);
        return false;
      }
      return true;
    },

    async create(lead: LeadInsert): Promise<Lead | null> {
      const supabase = getSupabaseServiceRole();
      const canonicalPhone = normalizePhoneNumber(lead.phone_number);
      const { data, error } = await supabase
        .from('leads')
        .insert({ ...lead, phone_number: canonicalPhone })
        .select('*')
        .single();

      if (error) {
        logger.error('db.leads.create error:', { lead }, error);
        return null;
      }
      return data;
    },

    async getPending(): Promise<Lead[]> {
      const supabase = getSupabaseServiceRole();
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('status', 'new')
        .order('created_at', { ascending: true });

      if (error) {
        logger.error('db.leads.getPending error:', {}, error);
        return [];
      }
      return data || [];
    },

    async resolve(id: string, adminId: string): Promise<boolean> {
      const supabase = getSupabaseServiceRole();
      const { error } = await supabase
        .from('leads')
        .update({
          status: 'contacted',
          assigned_to: adminId,
          last_contact_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) {
        logger.error('db.leads.resolve error:', { id, adminId }, error);
        return false;
      }
      return true;
    },

    async getAll(): Promise<Lead[]> {
      const supabase = getSupabaseServiceRole();
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        logger.error('db.leads.getAll error:', {}, error);
        return [];
      }
      return data || [];
    },
  },

  messages: {
    async save(message: Omit<MessageInsert, 'thread_id'> & { thread_id?: string; customer_name?: string }): Promise<Message | null> {
      const supabase = getSupabaseServiceRole();
      const canonicalPhone = normalizePhoneNumber(message.phone_number);

      let threadId = message.thread_id;

      // Ensure thread exists
      if (!threadId) {
        const { data: thread, error: threadError } = await supabase
          .from('conversation_threads')
          .select('id, unread_count')
          .eq('phone_number', canonicalPhone)
          .maybeSingle();

        if (threadError) {
          logger.error('db.messages.save thread query error:', { canonicalPhone }, threadError);
        }

        if (thread) {
          threadId = thread.id;
          
          // Update last message metadata on the thread
          const threadUpdates: any = {
            last_message: message.text,
            last_message_at: message.whatsapp_timestamp || new Date().toISOString(),
          };
          if (message.direction === 'outgoing') {
            threadUpdates.last_ai_response = message.text;
          } else {
            threadUpdates.unread_count = (thread.unread_count || 0) + 1;
          }
          
          await supabase
            .from('conversation_threads')
            .update(threadUpdates)
            .eq('id', threadId);
        } else {
          // Create new thread session
          const { data: newThread, error: createThreadError } = await supabase
            .from('conversation_threads')
            .insert({
              phone_number: canonicalPhone,
              customer_name: message.customer_name || 'Customer',
              last_message: message.text,
              last_message_at: message.whatsapp_timestamp || new Date().toISOString(),
              unread_count: message.direction === 'incoming' ? 1 : 0,
              last_ai_response: message.direction === 'outgoing' ? message.text : null,
              status: 'bot_handling',
            })
            .select('*')
            .single();

          if (createThreadError) {
            logger.error('db.messages.save thread create error:', {}, createThreadError);
          } else {
            threadId = newThread.id;
          }
        }
      } else {
        // Simple update
        const threadUpdates: any = {
          last_message: message.text,
          last_message_at: message.whatsapp_timestamp || new Date().toISOString(),
        };
        if (message.direction === 'outgoing') {
          threadUpdates.last_ai_response = message.text;
        }
        await supabase
          .from('conversation_threads')
          .update(threadUpdates)
          .eq('id', threadId);
      }

      // Save message details
      const { data, error } = await supabase
        .from('messages')
        .insert({
          thread_id: threadId,
          message_id: message.message_id,
          phone_number: canonicalPhone,
          direction: message.direction,
          text: message.text,
          whatsapp_timestamp: message.whatsapp_timestamp,
        })
        .select('*')
        .single();

      if (error) {
        logger.error('db.messages.save error:', { message }, error);
        return null;
      }
      return data;
    },

    async getHistory(phoneNumber: string, limit = 8): Promise<Message[]> {
      const supabase = getSupabaseServiceRole();
      const canonical = normalizePhoneNumber(phoneNumber);
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('phone_number', canonical)
        .order('whatsapp_timestamp', { ascending: false })
        .limit(limit);

      if (error) {
        logger.error('db.messages.getHistory error:', { phoneNumber, canonical, limit }, error);
        return [];
      }
      return (data || []).reverse(); // Order chronologically ascending for the AI
    },

    async getConversations(): Promise<ConversationThread[]> {
      const supabase = getSupabaseServiceRole();
      const { data, error } = await supabase
        .from('conversation_threads')
        .select('*')
        .order('last_message_at', { ascending: false });

      if (error) {
        logger.error('db.messages.getConversations error:', {}, error);
        return [];
      }
      return data || [];
    },
  },

  knowledge_base: {
    async getAll(): Promise<KnowledgeBase[]> {
      const supabase = getSupabaseServiceRole();
      const { data, error } = await supabase
        .from('knowledge_base')
        .select('*')
        .eq('is_published', true)
        .order('priority', { ascending: false })
        .order('category', { ascending: true });

      if (error) {
        logger.error('db.knowledge_base.getAll error:', {}, error);
        return [];
      }
      return data || [];
    },

    async getByCategory(category: string): Promise<KnowledgeBase[]> {
      const supabase = getSupabaseServiceRole();
      const { data, error } = await supabase
        .from('knowledge_base')
        .select('*')
        .eq('category', category)
        .eq('is_published', true)
        .order('priority', { ascending: false });

      if (error) {
        logger.error('db.knowledge_base.getByCategory error:', { category }, error);
        return [];
      }
      return data || [];
    },

    async getAllWithUnpublished(): Promise<KnowledgeBase[]> {
      const supabase = getSupabaseServiceRole();
      const { data, error } = await supabase
        .from('knowledge_base')
        .select('*')
        .order('priority', { ascending: false })
        .order('category', { ascending: true });

      if (error) {
        logger.error('db.knowledge_base.getAllWithUnpublished error:', {}, error);
        return [];
      }
      return data || [];
    },

    async create(
      kb: Omit<KnowledgeBase, 'id' | 'created_at' | 'updated_at'>
    ): Promise<KnowledgeBase | null> {
      const supabase = getSupabaseServiceRole();
      const { data, error } = await supabase.from('knowledge_base').insert(kb).select('*').single();

      if (error) {
        logger.error('db.knowledge_base.create error:', { kb }, error);
        return null;
      }
      memoryCache.delete('knowledge_faqs');
      return data;
    },

    async update(
      id: string,
      updates: Partial<Omit<KnowledgeBase, 'id' | 'created_at' | 'updated_at'>>
    ): Promise<KnowledgeBase | null> {
      const supabase = getSupabaseServiceRole();
      const { data, error } = await supabase
        .from('knowledge_base')
        .update(updates)
        .eq('id', id)
        .select('*')
        .single();

      if (error) {
        logger.error('db.knowledge_base.update error:', { id, updates }, error);
        return null;
      }
      memoryCache.delete('knowledge_faqs');
      return data;
    },

    async delete(id: string): Promise<boolean> {
      const supabase = getSupabaseServiceRole();
      const { error } = await supabase.from('knowledge_base').delete().eq('id', id);

      if (error) {
        logger.error('db.knowledge_base.delete error:', { id }, error);
        return false;
      }
      memoryCache.delete('knowledge_faqs');
      return true;
    },
  },

  settings: {
    async get<T>(key: string): Promise<T | null> {
      const supabase = getSupabaseServiceRole();
      const { data, error } = await supabase
        .from('settings')
        .select('value')
        .eq('key', key)
        .maybeSingle();

      if (error) {
        logger.error('db.settings.get error:', { key }, error);
        return null;
      }
      return data ? (data.value as T) : null;
    },

    async set(key: string, value: any): Promise<boolean> {
      const supabase = getSupabaseServiceRole();
      const { error } = await supabase
        .from('settings')
        .upsert({ key, value }, { onConflict: 'key' });

      if (error) {
        logger.error('db.settings.set error:', { key, value }, error);
        return false;
      }
      return true;
    },
  },
};
export default db;
