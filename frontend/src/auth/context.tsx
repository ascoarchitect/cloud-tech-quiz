// src/auth/context.tsx
import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import {
  getCurrentUser,
  fetchAuthSession,
  signInWithRedirect,
  signOut,
} from "@aws-amplify/auth";
import { UserData, AuthStatus } from "./types";

interface AuthContextType {
  user: UserData | null;
  authStatus: AuthStatus;
  isAdmin: boolean;
  login: () => void;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [authStatus, setAuthStatus] = useState<AuthStatus>("checking");
  const [isAdmin, setIsAdmin] = useState(false);

  const loadUserData = async () => {
    try {
      const currentUser = await getCurrentUser();
      const session = await fetchAuthSession();

      if (!session.tokens) {
        throw new Error("No tokens in session");
      }

      const { accessToken, idToken } = session.tokens;

      if (!accessToken || !idToken) {
        throw new Error("Missing required tokens");
      }

      // Get groups from the token
      const groups = (accessToken.payload["cognito:groups"] as string[]) || [];

      // Check if user is an admin
      const adminStatus = groups.includes("Admin");
      setIsAdmin(adminStatus);

      // Get user info from ID token
      const email = idToken.payload.email as string;
      const name = (idToken.payload.name as string) || email;

      const userData: UserData = {
        id: currentUser.userId,
        email,
        name,
        groups,
      };

      setUser(userData);
      setAuthStatus("authenticated");
    } catch (error) {
      console.error("Error loading user data:", error);
      setUser(null);
      setIsAdmin(false);
      setAuthStatus("unauthenticated");
    }
  };

  useEffect(() => {
    loadUserData();
  }, []);

  const login = () => {
    signInWithRedirect();
  };

  const logout = async () => {
    try {
      await signOut();
      setUser(null);
      setIsAdmin(false);
      setAuthStatus("unauthenticated");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const value = {
    user,
    authStatus,
    isAdmin,
    login,
    logout,
    refreshUser: loadUserData,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
