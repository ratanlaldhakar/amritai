import { getSupabaseServiceRole } from '@/lib/supabase';
import { logger } from '@/lib/logger';
import {
  Student,
  StudentInsert,
  Batch,
  FAQ,
  Message,
  MessageInsert,
  Inquiry,
  InquiryInsert,
} from '@/types/database';

export const db = {
  students: {
    async getByPhone(phoneNumber: string): Promise<Student | null> {
      const supabase = getSupabaseServiceRole();
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('phone_number', phoneNumber)
        .maybeSingle();

      if (error) {
        logger.error('db.students.getByPhone error:', { phoneNumber }, error);
        return null;
      }
      return data;
    },

    async upsert(
      student: Omit<StudentInsert, 'status'> & { status?: Student['status'] }
    ): Promise<Student | null> {
      const supabase = getSupabaseServiceRole();
      const { data, error } = await supabase
        .from('students')
        .upsert({ ...student }, { onConflict: 'phone_number' })
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
      const { error } = await supabase
        .from('students')
        .update({ status })
        .eq('phone_number', phoneNumber);

      if (error) {
        logger.error('db.students.updateStatus error:', { phoneNumber, status }, error);
        return false;
      }
      return true;
    },

    async bookTrial(phoneNumber: string, trialDate: string): Promise<boolean> {
      const supabase = getSupabaseServiceRole();
      const { error } = await supabase
        .from('students')
        .update({
          status: 'trial_booked',
          trial_date: trialDate,
        })
        .eq('phone_number', phoneNumber);

      if (error) {
        logger.error('db.students.bookTrial error:', { phoneNumber, trialDate }, error);
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

  batches: {
    async getAll(): Promise<Batch[]> {
      const supabase = getSupabaseServiceRole();
      const { data, error } = await supabase
        .from('batches')
        .select('*')
        .order('start_time', { ascending: true });

      if (error) {
        logger.error('db.batches.getAll error:', {}, error);
        return [];
      }
      return data || [];
    },

    async getById(id: string): Promise<Batch | null> {
      const supabase = getSupabaseServiceRole();
      const { data, error } = await supabase.from('batches').select('*').eq('id', id).maybeSingle();

      if (error) {
        logger.error('db.batches.getById error:', { id }, error);
        return null;
      }
      return data;
    },
  },

  faqs: {
    async getAll(): Promise<FAQ[]> {
      const supabase = getSupabaseServiceRole();
      const { data, error } = await supabase
        .from('faqs')
        .select('*')
        .eq('is_published', true)
        .order('category', { ascending: true });

      if (error) {
        logger.error('db.faqs.getAll error:', {}, error);
        return [];
      }
      return data || [];
    },

    async getByCategory(category: string): Promise<FAQ[]> {
      const supabase = getSupabaseServiceRole();
      const { data, error } = await supabase
        .from('faqs')
        .select('*')
        .eq('category', category)
        .eq('is_published', true);

      if (error) {
        logger.error('db.faqs.getByCategory error:', { category }, error);
        return [];
      }
      return data || [];
    },

    async getAllWithUnpublished(): Promise<FAQ[]> {
      const supabase = getSupabaseServiceRole();
      const { data, error } = await supabase
        .from('faqs')
        .select('*')
        .order('category', { ascending: true });

      if (error) {
        logger.error('db.faqs.getAllWithUnpublished error:', {}, error);
        return [];
      }
      return data || [];
    },

    async create(faq: Omit<FAQ, 'id' | 'created_at' | 'updated_at'>): Promise<FAQ | null> {
      const supabase = getSupabaseServiceRole();
      const { data, error } = await supabase.from('faqs').insert(faq).select('*').single();

      if (error) {
        logger.error('db.faqs.create error:', { faq }, error);
        return null;
      }
      return data;
    },

    async update(
      id: string,
      updates: Partial<Omit<FAQ, 'id' | 'created_at' | 'updated_at'>>
    ): Promise<FAQ | null> {
      const supabase = getSupabaseServiceRole();
      const { data, error } = await supabase
        .from('faqs')
        .update(updates)
        .eq('id', id)
        .select('*')
        .single();

      if (error) {
        logger.error('db.faqs.update error:', { id, updates }, error);
        return null;
      }
      return data;
    },

    async delete(id: string): Promise<boolean> {
      const supabase = getSupabaseServiceRole();
      const { error } = await supabase.from('faqs').delete().eq('id', id);

      if (error) {
        logger.error('db.faqs.delete error:', { id }, error);
        return false;
      }
      return true;
    },
  },

  messages: {
    async save(message: MessageInsert): Promise<Message | null> {
      const supabase = getSupabaseServiceRole();
      const { data, error } = await supabase.from('messages').insert(message).select('*').single();

      if (error) {
        logger.error('db.messages.save error:', { message }, error);
        return null;
      }
      return data;
    },

    async getHistory(phoneNumber: string, limit = 8): Promise<Message[]> {
      const supabase = getSupabaseServiceRole();
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('phone_number', phoneNumber)
        .order('whatsapp_timestamp', { ascending: false })
        .limit(limit);

      if (error) {
        logger.error('db.messages.getHistory error:', { phoneNumber, limit }, error);
        return [];
      }
      return (data || []).reverse(); // Order chronologically ascending
    },

    async getConversations(): Promise<any[]> {
      const supabase = getSupabaseServiceRole();
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .order('whatsapp_timestamp', { ascending: false });

      if (error) {
        logger.error('db.messages.getConversations error:', {}, error);
        return [];
      }

      const chatsMap = new Map<string, any>();
      for (const msg of data || []) {
        const phone = msg.phone_number;
        if (!chatsMap.has(phone)) {
          chatsMap.set(phone, {
            phone_number: phone,
            customer_name: msg.customer_name || 'Unknown WhatsApp User',
            last_message: msg.text,
            last_timestamp: msg.whatsapp_timestamp,
            unread: false,
          });
        }
      }

      return Array.from(chatsMap.values());
    },
  },

  inquiries: {
    async create(inquiry: Omit<InquiryInsert, 'status'>): Promise<Inquiry | null> {
      const supabase = getSupabaseServiceRole();
      const { data, error } = await supabase
        .from('inquiries')
        .insert({
          ...inquiry,
          status: 'pending',
        })
        .select('*')
        .single();

      if (error) {
        logger.error('db.inquiries.create error:', { inquiry }, error);
        return null;
      }
      return data;
    },

    async getPending(): Promise<Inquiry[]> {
      const supabase = getSupabaseServiceRole();
      const { data, error } = await supabase
        .from('inquiries')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: true });

      if (error) {
        logger.error('db.inquiries.getPending error:', {}, error);
        return [];
      }
      return data || [];
    },

    async resolve(id: string, adminId: string): Promise<boolean> {
      const supabase = getSupabaseServiceRole();
      const { error } = await supabase
        .from('inquiries')
        .update({
          status: 'resolved',
          assigned_to: adminId,
        })
        .eq('id', id);

      if (error) {
        logger.error('db.inquiries.resolve error:', { id, adminId }, error);
        return false;
      }
      return true;
    },

    async getAll(): Promise<Inquiry[]> {
      const supabase = getSupabaseServiceRole();
      const { data, error } = await supabase
        .from('inquiries')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        logger.error('db.inquiries.getAll error:', {}, error);
        return [];
      }
      return data || [];
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
