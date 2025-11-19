import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { SavedListingsService } from '@/lib/saved-listings-service';

interface SavedListingsContextType {
  savedCount: number;
  refreshSavedCount: () => Promise<void>;
  isListingSaved: (listingType: 'business' | 'franchise', listingId: string) => boolean;
  toggleSave: (listingType: 'business' | 'franchise', listingId: string) => Promise<void>;
}

const SavedListingsContext = createContext<SavedListingsContextType | undefined>(undefined);

export function SavedListingsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [savedCount, setSavedCount] = useState(0);
  const [savedSet, setSavedSet] = useState<Set<string>>(new Set());

  const refreshSavedCount = useCallback(async () => {
    if (!user) {
      setSavedCount(0);
      setSavedSet(new Set());
      return;
    }

    try {
      const count = await SavedListingsService.getSavedListingsCount(user.id);
      setSavedCount(count);
      
      // Also fetch the list to build the set
      const listings = await SavedListingsService.getSavedListings(user.id);
      const newSet = new Set(
        listings.map(item => `${item.listing_type}-${item.listing_id}`)
      );
      setSavedSet(newSet);
    } catch (error) {
      console.error('Error refreshing saved count:', error);
    }
  }, [user]);

  useEffect(() => {
    refreshSavedCount();
  }, [refreshSavedCount]);

  const isListingSaved = useCallback(
    (listingType: 'business' | 'franchise', listingId: string) => {
      return savedSet.has(`${listingType}-${listingId}`);
    },
    [savedSet]
  );

  const toggleSave = useCallback(
    async (listingType: 'business' | 'franchise', listingId: string) => {
      if (!user) return;

      const key = `${listingType}-${listingId}`;
      const isSaved = savedSet.has(key);

      try {
        if (isSaved) {
          await SavedListingsService.unsaveListing(user.id, listingType, listingId);
          setSavedSet(prev => {
            const newSet = new Set(prev);
            newSet.delete(key);
            return newSet;
          });
          setSavedCount(prev => Math.max(0, prev - 1));
        } else {
          await SavedListingsService.saveListing(user.id, listingType, listingId);
          setSavedSet(prev => new Set(prev).add(key));
          setSavedCount(prev => prev + 1);
        }
      } catch (error) {
        console.error('Error toggling save:', error);
        // Revert on error
        await refreshSavedCount();
      }
    },
    [user, savedSet, refreshSavedCount]
  );

  return (
    <SavedListingsContext.Provider
      value={{
        savedCount,
        refreshSavedCount,
        isListingSaved,
        toggleSave,
      }}
    >
      {children}
    </SavedListingsContext.Provider>
  );
}

export function useSavedListings() {
  const context = useContext(SavedListingsContext);
  if (context === undefined) {
    throw new Error('useSavedListings must be used within a SavedListingsProvider');
  }
  return context;
}
