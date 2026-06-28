import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC9aeK2pZaYBlmEb3yoCOSDEP884PE17dU",
  authDomain: "orbital-cd.firebaseapp.com",
  projectId: "orbital-cd",
  storageBucket: "orbital-cd.firebasestorage.app",
  messagingSenderId: "135976908130",
  appId: "1:135976908130:web:b24668a900873ad486283b",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);