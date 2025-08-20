import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: API_KEY,
  authDomain: "projetofinal-9a755.firebaseapp.com",
  projectId: "projetofinal-9a755",
  storageBucket: "projetofinal-9a755.firebasestorage.app",
  messagingSenderId: "363109440702",
  appId: "1:363109440702:web:95af9fc5b7f4a46cab12ef",
  measurementId: "G-8QT4KPD7J4",
};

const app = initializeApp(firebaseConfig);

// Configuração especial para React Native
const auth = getAuth(app);

const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };
