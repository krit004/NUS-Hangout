import { initializeApp } from "firebase/app";
import { initializeAuth, getAuth } from "firebase/auth";
// @ts-ignore — getReactNativePersistence exists at runtime but is missing from TS types
import { getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: "AIzaSyC9aeK2pZaYBlmEb3yoCOSDEP884PE17dU",
  authDomain: "orbital-cd.firebaseapp.com",
  projectId: "orbital-cd",
  storageBucket: "orbital-cd.firebasestorage.app",
  messagingSenderId: "135976908130",
  appId: "1:135976908130:web:b24668a900873ad486283b",
};

const app = initializeApp(firebaseConfig);

let auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage),
  });
} catch (e: any) {
  // During Fast Refresh, auth is already initialized — reuse it
  auth = getAuth(app);
}

export { auth };
export const db = getFirestore(app);