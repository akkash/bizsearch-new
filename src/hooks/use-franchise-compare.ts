import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import {
  COMPARE_STORAGE_KEY,
  MAX_COMPARE,
  isCompareIdToken,
} from '@/lib/franchise-compare';

function readStoredIds(): string[] {
  try {
    const raw = sessionStorage.getItem(COMPARE_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((id) => typeof id === 'string' && id.trim()).slice(0, MAX_COMPARE)
      : [];
  } catch {
    return [];
  }
}

function writeStoredIds(ids: string[]) {
  sessionStorage.setItem(COMPARE_STORAGE_KEY, JSON.stringify(ids.slice(0, MAX_COMPARE)));
}

export function useFranchiseCompare() {
  const { user } = useAuth();
  const [compareIds, setCompareIds] = useState<string[]>(() => readStoredIds());

  useEffect(() => {
    writeStoredIds(compareIds);
  }, [compareIds]);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    const loadRemote = async () => {
      const { data, error } = await supabase
        .from('franchisee_details')
        .select('compare_listing_ids')
        .eq('profile_id', user.id)
        .maybeSingle();
      if (cancelled || error) return;
      const remote = Array.isArray(data?.compare_listing_ids)
        ? data.compare_listing_ids.filter((id: unknown) => typeof id === 'string' && isCompareIdToken(id))
        : [];
      if (!remote.length) return;
      setCompareIds((prev) => (prev.length ? prev : remote.slice(0, MAX_COMPARE)));
    };
    void loadRemote();
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  useEffect(() => {
    if (!user) return;
    const timer = window.setTimeout(() => {
      void supabase
        .from('franchisee_details')
        .upsert(
          {
            profile_id: user.id,
            compare_listing_ids: compareIds.filter(isCompareIdToken).slice(0, MAX_COMPARE),
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'profile_id' }
        )
        .then(({ error }) => {
          if (error) console.warn('Could not persist compare shortlist:', error);
        });
    }, 400);
    return () => window.clearTimeout(timer);
  }, [compareIds, user?.id]);

  const toggleCompare = useCallback((franchiseId: string): boolean => {
    let added = false;
    setCompareIds((prev) => {
      if (prev.includes(franchiseId)) {
        return prev.filter((id) => id !== franchiseId);
      }
      if (prev.length >= MAX_COMPARE) {
        return prev;
      }
      added = true;
      return [...prev, franchiseId];
    });
    return added;
  }, []);

  const replaceCompare = useCallback((franchiseIds: string[]) => {
    setCompareIds(
      [...new Set(franchiseIds.filter((id) => typeof id === 'string' && id.trim()))].slice(0, MAX_COMPARE)
    );
  }, []);

  const removeCompare = useCallback((franchiseId: string) => {
    setCompareIds((prev) => prev.filter((id) => id !== franchiseId));
  }, []);

  const clearCompare = useCallback(() => {
    setCompareIds([]);
  }, []);

  const isCompared = useCallback(
    (franchiseId: string) => compareIds.includes(franchiseId),
    [compareIds]
  );

  return {
    compareIds,
    toggleCompare,
    replaceCompare,
    removeCompare,
    clearCompare,
    isCompared,
    maxCompare: MAX_COMPARE,
  };
}
