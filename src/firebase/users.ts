import { doc, getDoc, setDoc } from "firebase/firestore";
import { db, auth } from "./firebase";
import { signInAnonymously } from "firebase/auth";

const USERS_COLLECTION = "users";

export async function ensureAuthenticated() {
  if (!auth.currentUser) {
    try {
      await signInAnonymously(auth);
    } catch (error) {
      console.warn("Anonymous auth failed. Enable it in Firebase Console > Authentication > Sign-in method.", error);
      return null;
    }
  }
  return auth.currentUser;
}

export async function updateUserAvatar(avatarKey: string): Promise<void> {
  const user = await ensureAuthenticated();
  if (!user) return;
  
  const userRef = doc(db, USERS_COLLECTION, user.uid);
  await setDoc(userRef, { avatar: avatarKey }, { merge: true });
}

export async function getUserAvatar(): Promise<string | null> {
  const user = await ensureAuthenticated();
  if (!user) return null;

  const userRef = doc(db, USERS_COLLECTION, user.uid);
  const snap = await getDoc(userRef);
  if (snap.exists()) {
    return snap.data().avatar as string;
  }
  return null;
}
