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
