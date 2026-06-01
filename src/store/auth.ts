import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  id: string;
  name: string;
  email: string;
  password: string;
}

interface AuthState {
  isAuthenticated: boolean;
  currentUser: { name: string; email: string } | null;
  users: User[];
  login: (email: string, password: string) => boolean;
  register: (
    name: string,
    email: string,
    password: string,
  ) => { success: boolean; error?: string };
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      currentUser: null,
      users: [
        {
          id: "admin",
          name: "Administrador",
          email: "admin@courtvision.com",
          password: "1234",
        },
      ],
      login: (email, password) => {
        const user = get().users.find(
          (u) =>
            u.email.toLowerCase() === email.trim().toLowerCase() &&
            u.password === password,
        );
        if (user) {
          set({
            isAuthenticated: true,
            currentUser: { name: user.name, email: user.email },
          });
          return true;
        }
        return false;
      },
      register: (name, email, password) => {
        const exists = get().users.some(
          (u) => u.email.toLowerCase() === email.trim().toLowerCase(),
        );
        if (exists) {
          return { success: false, error: "Ya existe una cuenta con ese correo." };
        }
        const newUser: User = {
          id: crypto.randomUUID(),
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
        };
        set((s) => ({ users: [...s.users, newUser] }));
        return { success: true };
      },
      logout: () => set({ isAuthenticated: false, currentUser: null }),
    }),
    { name: "auth-storage" },
  ),
);
