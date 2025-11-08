"use client";

import { auth, db } from "@/firebase/client";
import {
  signInWithEmailAndPassword,
  User,
  onAuthStateChanged,
} from "firebase/auth";
import { doc, onSnapshot, getDoc, setDoc } from "firebase/firestore";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { removeToken, setToken } from "./actions";
import { useRouter } from "next/navigation";

export interface UserData {
  id: string;
  name: string;
  email: string;
  role: "admin" | "editor" | "viewer" | "master";
  emailVerified: boolean;
  accountApproved: boolean;
  accountStatus: "pending_approval" | "active" | "suspended";
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

interface AuthState {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
  userDataLoading: boolean;
}

type AuthContextType = AuthState & {
  logout: () => Promise<void>;
  loginWithEmailAndPassword: (email: string, password: string) => Promise<void>;
  refreshUserData: () => Promise<void>;
  isAdmin: boolean;
  isMaster: boolean;
  currentUser: User | null;
  hasPermission: (permission: string) => boolean;
  isAuthenticated: boolean;
  appLoading: boolean;
  setAppLoading: (x: boolean) => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    userData: null,
    loading: true,
    userDataLoading: false,
  });
  const [appLoading, setAppLoading] = useState<boolean>(false);
  const router = useRouter();

  const saveUserTokens = useCallback(async (user: User) => {
    try {
      const tokenResult = await user.getIdTokenResult(true);

      if (tokenResult.token && user.refreshToken) {
        await setToken({
          token: tokenResult.token,
          refreshToken: user.refreshToken,
        });
        console.log("✅ Tokens saved");
      }
    } catch (error) {
      console.error("❌ Error saving tokens:", error);
      throw error;
    }
  }, []);

  // User data listener
  useEffect(() => {
    if (!authState.user) {
      console.log("👤 No user, clearing userData");
      setAuthState((prev) => ({
        ...prev,
        userData: null,
        userDataLoading: false,
      }));
      return;
    }

    console.log("🔍 Setting up Firestore listener for:", authState.user.uid);
    setAuthState((prev) => ({ ...prev, userDataLoading: true }));

    const unsubscribe = onSnapshot(
      doc(db, "users", authState.user.uid),
      (doc) => {
        console.log("📄 Firestore snapshot received");
        console.log("Document exists?", doc.exists());
        
        if (doc.exists()) {
          console.log("✅ User data found:", doc.data());
          const rawData = doc.data();
          const userData: UserData = {
            id: rawData?.id || authState.user?.uid || "",
            name: rawData?.name || "",
            email: rawData?.email || authState.user?.email || "",
            role: rawData?.role || "admin",
            emailVerified: rawData?.emailVerified || false,
            accountApproved: rawData?.accountApproved || false,
            accountStatus: rawData?.accountStatus || "pending_approval",
            createdAt: rawData?.createdAt || "",
            updatedAt: rawData?.updatedAt || "",
            createdBy: rawData?.createdBy || "",
          };

          setAuthState((prev) => ({
            ...prev,
            userData,
            userDataLoading: false,
          }));
        } else {
          console.log("❌ User document does not exist in Firestore");
          setAuthState((prev) => ({
            ...prev,
            userData: null,
            userDataLoading: false,
          }));
        }
      },
      (error) => {
        console.error("❌ Firestore error:", error);
        console.error("Error code:", error.code);
        console.error("Error message:", error.message);
        setAuthState((prev) => ({
          ...prev,
          userData: null,
          userDataLoading: false,
        }));
      }
    );

    return () => {
      console.log("🧹 Cleaning up Firestore listener");
      unsubscribe();
    };
  }, [authState.user]);

  // Main auth listener
  useEffect(() => {
    console.log("🔐 Setting up auth state listener");
    
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log("🔐 Auth state changed:", user ? user.uid : "No user");
      setAuthState((prev) => ({ ...prev, loading: true }));

      if (user) {
        try {
          console.log("✅ User authenticated:", user.email);
          setAuthState((prev) => ({ ...prev, user }));
          await saveUserTokens(user);
        } catch (error) {
          console.error("❌ Error setting up auth state:", error);
        }
      } else {
        console.log("👤 No user, removing tokens");
        await removeToken();
        setAuthState((prev) => ({
          ...prev,
          user: null,
          userData: null,
        }));
      }

      setAuthState((prev) => ({ ...prev, loading: false }));
    });

    return () => {
      console.log("🧹 Cleaning up auth listener");
      unsubscribe();
    };
  }, [saveUserTokens]);

  const refreshUserData = useCallback(async () => {
    if (authState.user) {
      await saveUserTokens(authState.user);
    }
  }, [authState.user, saveUserTokens]);

  const logout = async () => {
    try {
      console.log("🚪 Logging out...");
      await auth.signOut();
      await removeToken();
      router.push("/login");
    } catch (error) {
      console.error("❌ Error during logout:", error);
    }
  };

  const loginWithEmailAndPassword = async (
    email: string,
    password: string
  ): Promise<void> => {
    try {
      console.log("🚀 Starting login for:", email);
      const result = await signInWithEmailAndPassword(auth, email, password);
      const user = result.user;

      console.log("✅ Firebase auth successful, checking Firestore...");
      
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        console.log("✅ User document found in Firestore");
        const userData = userDoc.data() as UserData;

        if (!userData.accountApproved) {
          console.log("🚫 Account not approved");
          await auth.signOut();
          await removeToken();
          throw new Error("ACCOUNT_NOT_APPROVED");
        }

        if (userData.accountStatus === "suspended") {
          console.log("🚫 Account suspended");
          await auth.signOut();
          await removeToken();
          throw new Error("ACCOUNT_SUSPENDED");
        }

        console.log("✅ Login successful, user approved");
      } else {
        console.log("⚠️ User document not found, creating one...");
        
        // Cria documento automaticamente
        const newUserData = {
          id: user.uid,
          name: user.displayName || "",
          email: user.email || "",
          role: "admin",
          emailVerified: user.emailVerified,
          accountApproved: true, // Auto-aprovar para simplificar
          accountStatus: "active",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          createdBy: user.uid,
        };

        await setDoc(userDocRef, newUserData);
        console.log("✅ User document created successfully");
      }
    } catch (error) {
      console.error("❌ Login error:", error);
      throw error;
    }
  };

  const hasPermission = useCallback((): boolean => {
    if (!authState.userData) return false;
    if (authState.userData.role === "admin") return true;
    return false;
  }, [authState.userData]);

  const contextValue: AuthContextType = {
    ...authState,
    logout,
    loginWithEmailAndPassword,
    refreshUserData,
    isAdmin: authState.userData?.role === "admin" || false,
    isMaster: authState.userData?.role === "master" || false,
    currentUser: authState.user,
    appLoading,
    setAppLoading,
    hasPermission,
    isAuthenticated: !!authState.user,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const useAuthUser = () => {
  const { user, loading, isAuthenticated } = useAuth();
  return { currentUser: user, loading, isAuthenticated };
};

export const useAuthPermissions = () => {
  const { isMaster, isAdmin, hasPermission } = useAuth();
  return { isMaster, isAdmin, hasPermission };
};