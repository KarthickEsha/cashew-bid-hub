import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserProfile, UserRole, ProductType } from '@/types/user';

interface ProfileState {
  profile: UserProfile | null;
  setProfile: (profile: Partial<UserProfile>) => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  clearProfile: () => void;
}

export const useProfile = create<ProfileState>()(
  persist(
    (set, get) => ({
      profile: null,
      setProfile: (profile) => set({ profile: profile as UserProfile }),
      updateProfile: (updates) => {
        const currentProfile = get().profile;
        if (currentProfile) {
          set({
            profile: {
              ...currentProfile,
              ...updates,
            },
          });
        }
      },
      clearProfile: () => set({ profile: null }),
    }),
    {
      name: 'user-profile-storage',
    }
  )
);