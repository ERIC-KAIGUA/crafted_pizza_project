import { createContext, useState, useEffect, useContext } from 'react';
import { type User, signInWithPopup,  onAuthStateChanged, signOut } from 'firebase/auth';
import { auth, db, googleProvider } from '../firebase/config';
import { doc, getDoc , setDoc, updateDoc,serverTimestamp } from 'firebase/firestore';


type Role = 'admin' | 'customer';


interface AuthContextType { 
    user : User | null;
    role : Role | null;
    loading : boolean;
    signInWithGoogle : () => Promise<void>;
    logout : () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);



export const useAuth = () => {
    const context = useContext(AuthContext);
    if(!context) throw new Error("useAuth must be used within an AuthProvider");
    return context;
}

// Helper: Creates or updates user document professionally
const ensureUserDocument = async (firebaseUser: User) => {
  const userRef = doc(db, "users", firebaseUser.uid);

  const snapshot = await getDoc(userRef);

  if (!snapshot.exists()) {
    // First-time customer
    await setDoc(userRef, {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: firebaseUser.displayName,
      photoURL: firebaseUser.photoURL,
      role: "customer",
      createdAt: serverTimestamp(),
      lastLoginAt: serverTimestamp(),
    });
  } else {
    // Returning customer — just update last login + profile pic/name
    await updateDoc(userRef, {
      displayName: firebaseUser.displayName,
      photoURL: firebaseUser.photoURL,
      lastLoginAt: serverTimestamp(),
    });
  }

  return (snapshot.data()?.role as Role) 
};

export const AuthProvider = ({ children} : { children : React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [role, setRole] = useState<Role | null>(null);
    const [loading, setLoading] = useState(true);

useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
        try {
            if(!currentUser) {
                setUser(null);
                setRole(null);
                setLoading(false);
                return;
            }
            setUser(currentUser);

            // wait for Firestore read to get role, then set loading false
            const resolvedRole = await ensureUserDocument(currentUser);
            setRole(resolvedRole);
        } catch (error) {
            console.error("Auth initialization error:", error);
           setUser(null);
           setRole(null);
        } finally {
            setLoading(false);
        }
    });

    return unsubscribe;
}, []);

const signinWithGoogle = async () => {
       await signInWithPopup(auth, googleProvider);
    };

const logout = () => signOut(auth);

   return (
    <AuthContext.Provider value = {{ user, role, loading, signInWithGoogle: signinWithGoogle, logout }}>
        {children}
    </AuthContext.Provider>
   );
};