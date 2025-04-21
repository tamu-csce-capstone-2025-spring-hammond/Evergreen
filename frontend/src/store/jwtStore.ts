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

const useJwtStore = create<JwtStore>()(
  persist(
    (set, get) => ({
      token: null,

      setToken: (token: string) => {
        set({ token });

        if (typeof window !== "undefined") {
          const expirationTime = Date.now() + 60 * 60 * 1000; // 1 hour
          localStorage.setItem("jwt-expiration", expirationTime.toString());
        }
      },

      clearToken: () => {
        set({ token: null });

        if (typeof window !== "undefined") {
          localStorage.removeItem("jwt-expiration");
        }
      },

      getPayload: (key) => {
        const token = get().getToken();
        if (!token) return undefined;

        try {
          const payload = JSON.parse(atob(token.split(".")[1]));
          return payload[key];
        } catch (error) {
          console.error("Error parsing JWT token", error);
          return undefined;
        }
      },

      getToken: () => {
        const token = get().token;

        if (typeof window === "undefined") return token;

        const expiration = localStorage.getItem("jwt-expiration");

        if (token && expiration) {
          const expirationTime = parseInt(expiration, 10);
          if (Date.now() > expirationTime) {
            get().clearToken();
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
