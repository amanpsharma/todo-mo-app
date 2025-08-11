"use client";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import {
  getFirebaseAuth,
  googleProvider,
  firebaseConfigStatus,
} from "../lib/firebaseClient";
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const status = firebaseConfigStatus();
  let auth = null;
  try {
    if (status.valid) auth = getFirebaseAuth();
    if (auth && typeof window !== "undefined") window.__firebaseAuth = auth;
  } catch (e) {
    // swallow until config provided
  }

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("auth:state"));
      }
    });
    return unsub;
  }, [auth]);

  const loginGoogle = useCallback(async () => {
    setError(null);
    if (!auth) return setError(new Error("Firebase config incomplete"));
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (e) {
      // Popup errors fallback to redirect
      if (e?.code && /popup/i.test(e.code)) {
        const { signInWithRedirect } = await import("firebase/auth");
        try {
          await signInWithRedirect(auth, googleProvider);
          return;
        } catch (e2) {
          setError(e2);
        }
      } else {
        setError(e);
      }
    }
  }, [auth]);

  const logout = useCallback(async () => {
    if (!auth) return;
    await signOut(auth);
  }, [auth]);

  const signupEmail = useCallback(
    async (email, password) => {
      await createUserWithEmailAndPassword(auth, email, password);
    },
    [auth]
  );

  const loginEmail = useCallback(
    async (email, password) => {
      await signInWithEmailAndPassword(auth, email, password);
    },
    [auth]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        loginGoogle,
        logout,
        signupEmail,
        loginEmail,
        firebaseConfig: status,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
