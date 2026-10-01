import { initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";

const apiKey = import.meta.env.VITE_FB_API_KEY as string | undefined;

// ponytail: tanpa apiKey semua export null dan UI tampil pesan konfigurasi, bukan blank. Isi .env + restart vite.
export const firebaseConfigured = Boolean(apiKey);

const app: FirebaseApp | null = firebaseConfigured
  ? initializeApp({
      apiKey: apiKey as string,
      authDomain: import.meta.env.VITE_FB_AUTH_DOMAIN as string,
      projectId: (import.meta.env.VITE_FB_PROJECT_ID as string) || "srmmotor-4e708",
      storageBucket: import.meta.env.VITE_FB_STORAGE_BUCKET as string,
      messagingSenderId: import.meta.env.VITE_FB_MESSAGING_SENDER_ID as string,
      appId: import.meta.env.VITE_FB_APP_ID as string,
    })
  : null;

export const db: Firestore | null = app ? getFirestore(app) : null;
export const auth: Auth | null = app ? getAuth(app) : null;
export const storage: FirebaseStorage | null = app ? getStorage(app) : null;

export const firebaseConfigError =
  "Firebase belum dikonfigurasi. Isi file .env (VITE_FB_*) dari Firebase console, lalu restart npm run dev.";
