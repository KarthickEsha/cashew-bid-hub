import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type UserRole = 'buyer' | 'processor' | 'both';

interface RoleState {
  role: UserRole;
  setRole: (role: UserRole) => void;
}

export const useRole = create<RoleState>()(
  persist(
    (set) => ({
      role: 'buyer', // Default to buyer
      setRole: (role) => set({ role }),
    }),
    {
      name: 'user-role-storage',
    }
  )
);