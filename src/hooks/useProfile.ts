import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserProfile, UserRole, ProductType } from '@/types/user';
import { updateUserProfile, extractBackendUserId, type BackendUserProfileUpdate, getUserProfile } from '@/lib/profile';

interface ProfileState {
  profile: UserProfile | null;
  setProfile: (profile: Partial<UserProfile>) => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  clearProfile: () => void;
  loadProfileFromBackend: (userId?: string) => Promise<void>;
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
    businessType: p.dealingWith && String(p.dealingWith).trim().length > 0 ? p.dealingWith : 'Manufacturer',
    description: p.description,
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
        const current = get().profile || ({} as UserProfile);
        const nextProfile: UserProfile = { ...current, ...(profile as UserProfile) } as UserProfile;
        set({ profile: nextProfile });

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
      loadProfileFromBackend: async (userId?: string) => {
        try {
          const token = localStorage.getItem("auth_token");
          if (!token) return;
          const id = userId || extractBackendUserId() || get().profile?.id || '';
          if (!id) return;
          const data: any = await getUserProfile(id);
          const payload = (data?.data ?? data) as any;
          if (!payload) return;

          // Some APIs return { user: { ...fields } }
          const u = (payload && typeof payload === 'object' && 'user' in payload) ? payload.user : payload;
          const loc = u?.location || {};
          const regType = (u?.registrationType || get().profile?.registrationType) as any;
          const established = String(u?.establishedYear || get().profile?.establishedYear || '');
          const businessType = u?.businessType || get().profile?.businessType;
          const dealingWith = ((): any => {
            const v = (u?.businessType || get().profile?.dealingWith) as any;
            if (!v) return get().profile?.dealingWith;
            const up = String(v).toLowerCase();
            if (up === 'rcn') return 'RCN';
            if (up === 'kernel') return 'Kernel';
            if (up === 'both') return 'Both';
            return get().profile?.dealingWith;
          })();

          const mapped: Partial<UserProfile> = {
            id: u?.id || id,
            email: u?.mail || u?.email || get().profile?.email,
            name: u?.name || get().profile?.name,
            phone: u?.phone || get().profile?.phone,
            city: u?.city || loc?.city || get().profile?.city,
            address: u?.address || loc?.address || get().profile?.address,
            profilePicture: u?.profilePicture || get().profile?.profilePicture,
            companyName: u?.companyName || get().profile?.companyName,
            registrationType: regType,
            officeEmail: u?.officeEmail || get().profile?.officeEmail,
            establishedYear: established,
            businessType,
            dealingWith,
            productType: u?.productType || get().profile?.productType,
            isProfileComplete: u?.isProfileComplete || get().profile?.isProfileComplete,
            description: u?.description || get().profile?.description,
            state: u?.state || loc?.region || get().profile?.state,
            country: u?.country || loc?.country || get().profile?.country,
            pincode: (u?.postalCode || loc?.postalCode || (get().profile as any)?.pincode) as any,
            officeAddress: u?.officeAddress || get().profile?.officeAddress,
            officePhone: u?.officePhone || get().profile?.officePhone,
            role: (u?.role || get().profile?.role) as any,
          };
          const current = get().profile || ({} as UserProfile);
          const next = { ...current, ...mapped } as UserProfile;
          set({ profile: next });
        } catch {
          // ignore failures; keep local profile
        }
      },
    }),
    {
      name: 'user-profile-storage',
    }
  )
);