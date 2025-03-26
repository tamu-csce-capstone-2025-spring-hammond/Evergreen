import { create } from "zustand";

interface JwtStore {
  token: string | null; // JWT token can be null initially
  setToken: (token: string) => void;
  clearToken: () => void;
  getPayload: <T extends keyof Payload>(key: T) => string | undefined;
  getToken: () => string | null;
}

interface Payload {
  sub: string; // User ID
  email: string;
  name: string;
}

// Create the store
const useJwtStore = create<JwtStore>((set, get) => ({
  token: null,
  setToken: (token: string) => set({ token }),
  clearToken: () => set({ token: null }),

  // Extract aspect from JWT payload
  getPayload: (key) => {
    const token = get().token;
    if (!token) return undefined;

    try {
      const payload = JSON.parse(atob(token.split(".")[1])); // Decode the JWT payload
      return payload[key]; // Return the aspect requested
    } catch (error) {
      console.error("Error parsing JWT token", error);
      return undefined;
    }
  },
  getToken: () => {
    return get().token;
  },
}));

export default useJwtStore;
