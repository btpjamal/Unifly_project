// firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

//JÁ ALTERADO COM O FIREBASE DO PROJETO FINAL
const firebaseConfig = {
  apiKey: "AIzaSyBMY6Tqz81HjUD1qGedZQVnHB26jL8nhjw",
  authDomain: "projetofinal-9a755.firebaseapp.com",
  projectId: "projetofinal-9a755",
  storageBucket: "projetofinal-9a755.firebasestorage.app",
  messagingSenderId: "363109440702",
  appId: "1:363109440702:web:95af9fc5b7f4a46cab12ef",
  measurementId: "G-8QT4KPD7J4",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
