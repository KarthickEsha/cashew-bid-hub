import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserProfile, UserRole, ProductType } from '@/types/user';
import { updateUserProfile, extractBackendUserId, type BackendUserProfileUpdate } from '@/lib/profile';

interface ProfileState {
  profile: UserProfile | null;
  setProfile: (profile: Partial<UserProfile>) => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  clearProfile: () => void;
}

function toUpperSnake(v?: string) {
  return String(v || '').toUpperCase().replace(/[^A-Z]+/g, '_');
}

function mapToBackendPayload(p: UserProfile): BackendUserProfileUpdate {
  return {
    name: p.name,
    role: p.role,
    mail: p.email,
    phone: p.phone,
    city: p.city,
    address: p.address,
    profilePicture: p.profilePicture,
    companyName: p.companyName,
    registrationType: toUpperSnake(p.registrationType as unknown as string),
    officeEmail: p.officeEmail,
    
    establishedYear: String(p.establishedYear || ''),
    // Backend requires BusinessType; provide a sensible default if empty
    businessType: p.dealingWith && String(p.dealingWith).trim().length > 0 ? p.dealingWith : 'Manufacturer',
    description: p.description,
    // Backend requires Location; provide coordinates default until UI provides real values
    location: { latitude: 0, longitude: 0 },
    state: p.state,
    country: p.country,
    postalCode: (p as any).pincode,
    officeAddress: p.officeAddress,
    officePhone: p.officePhone
  };
}

export const useProfile = create<ProfileState>()(
  persist(
    (set, get) => ({
      profile: null,
      setProfile: (profile) => {
        // Merge with current profile if exists to form a complete object
        const current = get().profile || ({} as UserProfile);
        const nextProfile: UserProfile = { ...current, ...(profile as UserProfile) } as UserProfile;
        set({ profile: nextProfile });

        // Fire-and-forget backend update
        try {
          const backendUserId = extractBackendUserId() || (nextProfile as any).id;
          const payload = mapToBackendPayload(nextProfile);
          updateUserProfile(backendUserId, payload).catch(() => {});
        } catch {
          // ignore
        }
      },
      updateProfile: (updates) => {
        const currentProfile = get().profile;
        if (currentProfile) {
          const nextProfile: UserProfile = {
            ...currentProfile,
            ...updates,
          } as UserProfile;
          set({ profile: nextProfile });

          // Fire-and-forget backend update
          try {
            const backendUserId = extractBackendUserId() || (nextProfile as any).id;
            const payload = mapToBackendPayload(nextProfile);
            updateUserProfile(backendUserId, payload).catch(() => {});
          } catch {
            // ignore
          }
        }
      },
      clearProfile: () => set({ profile: null }),
    }),
    {
      name: 'user-profile-storage',
    }
  )
);