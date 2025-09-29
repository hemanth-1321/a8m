// store/authStore.ts
import { TOKEN } from "@/lib/config";
import { create } from "zustand";

interface AuthState {
  token: string | null;
  setToken: (token: string) => void;
  removeToken: () => void;
  getToken: () => string | null;
  loadToken: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: null,

  setToken: (token) => {
    localStorage.setItem(TOKEN, token);
    set({ token });
  },

  removeToken: () => {
    localStorage.removeItem(TOKEN);
    set({ token: null });
  },

  getToken: () => get().token,

  loadToken: () => {
    const storedToken = localStorage.getItem(TOKEN);
    if (storedToken) {
      set({ token: storedToken });
    }
  },
}));
