import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'bizsearch_franchise_compare_ids';
const MAX_COMPARE = 3;

function readStoredIds(): string[] {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((id) => typeof id === 'string').slice(0, MAX_COMPARE) : [];
  } catch {
    return [];
  }
}

function writeStoredIds(ids: string[]) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(ids.slice(0, MAX_COMPARE)));
}

export function useFranchiseCompare() {
  const [compareIds, setCompareIds] = useState<string[]>(() => readStoredIds());

  useEffect(() => {
    writeStoredIds(compareIds);
  }, [compareIds]);

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
    removeCompare,
    clearCompare,
    isCompared,
    maxCompare: MAX_COMPARE,
  };
}
