import { supabase } from './supabase';
import type { Database } from '@/types/supabase';

type Profile = Database['public']['Tables']['profiles']['Row'];
type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];
type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

export class ProfileService {
  static async getProfile(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  }

  static async getProfileByEmail(email: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .single();

    if (error) throw error;
    return data;
  }

  static async createProfile(profile: ProfileInsert) {
    const { data, error } = await supabase
      .from('profiles')
      .insert(profile)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async updateProfile(userId: string, updates: ProfileUpdate) {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async deleteProfile(userId: string) {
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId);

    if (error) throw error;
  }

  static async uploadAvatar(userId: string, file: File) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    // Update profile with avatar URL
    await this.updateProfile(userId, {
      avatar_url: data.publicUrl,
    });

    return data.publicUrl;
  }

  static async uploadDocument(
    profileId: string,
    file: File,
    documentType: 'identity' | 'business' | 'financial' | 'legal'
  ) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${profileId}-${documentType}-${Date.now()}.${fileExt}`;
    const filePath = `documents/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('documents')
      .getPublicUrl(filePath);

    // Create verification document record
    const { data: docData, error: docError } = await supabase
      .from('verification_documents')
      .insert({
        profile_id: profileId,
        document_type: documentType,
        file_name: file.name,
        file_url: data.publicUrl,
        status: 'pending',
      })
      .select()
      .single();

    if (docError) throw docError;
    return docData;
  }

  static async getVerificationDocuments(profileId: string) {
    const { data, error } = await supabase
      .from('verification_documents')
      .select('*')
      .eq('profile_id', profileId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  static async logActivity(
    profileId: string,
    action: string,
    entityType?: string,
    entityId?: string,
    metadata?: any
  ) {
    const { error } = await supabase
      .from('activity_logs')
      .insert({
        profile_id: profileId,
        action,
        entity_type: entityType,
        entity_id: entityId,
        metadata,
      });

    if (error) throw error;
  }

  static async getActivityLogs(profileId: string, limit = 20) {
    const { data, error } = await supabase
      .from('activity_logs')
      .select('*')
      .eq('profile_id', profileId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  }

  static async searchProfiles(query: string, role?: Profile['role']) {
    let queryBuilder = supabase
      .from('profiles')
      .select('*')
      .or(`display_name.ilike.%${query}%,email.ilike.%${query}%,industry.ilike.%${query}%`);

    if (role) {
      queryBuilder = queryBuilder.eq('role', role);
    }

    const { data, error } = await queryBuilder;

    if (error) throw error;
    return data;
  }

  static async getProfilesByRole(role: Profile['role']) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', role)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  static async getVerifiedProfiles() {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('verified', true)
      .order('verification_level', { ascending: false });

    if (error) throw error;
    return data;
  }
}
