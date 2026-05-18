import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Validação das variáveis de ambiente
if (!firebaseConfig.apiKey) {
  console.error("❌ ERRO: VITE_FIREBASE_API_KEY não configurada. Verifique as variáveis de ambiente na Vercel ou .env");
}

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
