import { supabase } from '@/lib/supabase';

export interface SavedSearch {
  id: string;
  userId: string;
  name: string;
  query: string | null;
  industry: string | null;
  city: string | null;
  budgetMax: number | null;
  createdAt: string;
  lastNotifiedAt: string | null;
}

export interface SavedSearchInput {
  name: string;
  query?: string;
  industry?: string;
  city?: string;
  budgetMax?: number;
}

function mapRow(row: Record<string, unknown>): SavedSearch {
  return {
    id: String(row.id),
    userId: String(row.user_id),
    name: String(row.name),
    query: row.query ? String(row.query) : null,
    industry: row.industry ? String(row.industry) : null,
    city: row.city ? String(row.city) : null,
    budgetMax: row.budget_max != null ? Number(row.budget_max) : null,
    createdAt: String(row.created_at),
    lastNotifiedAt: row.last_notified_at ? String(row.last_notified_at) : null,
  };
}

export class SavedSearchService {
  static async list(userId: string): Promise<SavedSearch[]> {
    const { data, error } = await supabase
      .from('saved_searches')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map((row) => mapRow(row as Record<string, unknown>));
  }

  static async findExisting(
    userId: string,
    input: SavedSearchInput
  ): Promise<SavedSearch | null> {
    let query = supabase
      .from('saved_searches')
      .select('*')
      .eq('user_id', userId);

    query = input.query ? query.eq('query', input.query) : query.is('query', null);
    query = input.industry ? query.eq('industry', input.industry) : query.is('industry', null);
    query = input.city ? query.eq('city', input.city) : query.is('city', null);
    query =
      input.budgetMax != null
        ? query.eq('budget_max', input.budgetMax)
        : query.is('budget_max', null);

    const { data, error } = await query.limit(1);
    if (error) throw error;
    const row = data?.[0];
    return row ? mapRow(row as Record<string, unknown>) : null;
  }

  static async create(userId: string, input: SavedSearchInput): Promise<SavedSearch> {
    const existing = await this.findExisting(userId, input);
    if (existing) return existing;

    const { data, error } = await supabase
      .from('saved_searches')
      .insert({
        user_id: userId,
        name: input.name,
        query: input.query || null,
        industry: input.industry || null,
        city: input.city || null,
        budget_max: input.budgetMax ?? null,
      })
      .select('*')
      .single();

    if (error) throw error;
    return mapRow(data as Record<string, unknown>);
  }

  static async remove(id: string): Promise<void> {
    const { error } = await supabase.from('saved_searches').delete().eq('id', id);
    if (error) throw error;
  }
}
