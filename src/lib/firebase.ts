import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import firebaseConfig from "../../firebase-applet-config.json";

// 1. Inicializar o app Firebase apenas uma vez.
const app = initializeApp(firebaseConfig);

// 2. Exportar:
export { app };
export const db = getFirestore(app);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();

// Analytics com verificação para não quebrar no SSR/Vercel
export const analytics = typeof window !== "undefined" 
  ? isSupported().then(yes => yes ? getAnalytics(app) : null)
  : Promise.resolve(null);

// Funções auxiliares de Auth
export { onAuthStateChanged };
export const loginWithGoogle = () => signInWithPopup(auth, provider);
export const logout = () => signOut(auth);
