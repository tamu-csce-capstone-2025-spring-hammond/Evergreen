import { create } from "zustand";
import { persist } from "zustand/middleware";

interface JwtStore {
  token: string | null;
  setToken: (token: string) => void;
  clearToken: () => void;
  getPayload: <T extends keyof Payload>(key: T) => string | undefined;
  getToken: () => string | null;
}

interface Payload {
  sub: string;
  email: string;
  name: string;
}

// Create the store with expiration logic
const useJwtStore = create<JwtStore>()(
  persist(
    (set, get) => ({
      token: null,

      setToken: (token: string) => {
        const expirationTime = Date.now() + 60 * 60 * 1000; // 1 hour from now
        set({ token });
        localStorage.setItem("jwt-expiration", expirationTime.toString()); // Store expiration timestamp
      },

      clearToken: () => {
        set({ token: null });
        localStorage.removeItem("jwt-expiration");
      },

      getPayload: (key) => {
        const token = get().getToken();
        if (!token) return undefined;

        try {
          const payload = JSON.parse(atob(token.split(".")[1])); // Decode JWT payload
          return payload[key];
        } catch (error) {
          console.error("Error parsing JWT token", error);
          return undefined;
        }
      },

      getToken: () => {
        const token = get().token;
        const expiration = localStorage.getItem("jwt-expiration");

        if (token && expiration) {
          const expirationTime = parseInt(expiration, 10);
          if (Date.now() > expirationTime) {
            get().clearToken(); // Token expired, clear it
            return null;
          }
        }

        return token;
      },
    }),
    {
      name: "jwt-storage",
    }
  )
);

export default useJwtStore;
