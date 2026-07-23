import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "./firebase";

const USERS_COLLECTION = "users";


export async function updateUserAvatar(avatarKey: string): Promise<void> {
  const user = auth.currentUser;
  if (!user) return;
  
  const userRef = doc(db, USERS_COLLECTION, user.uid);
  await setDoc(userRef, { avatar: avatarKey }, { merge: true });
}

export async function getUserAvatar(): Promise<string | null> {
  const user = auth.currentUser;
  if (!user) return null;

  const userRef = doc(db, USERS_COLLECTION, user.uid);
  const snap = await getDoc(userRef);
  if (snap.exists()) {
    return snap.data().avatar as string;
  }
  return null;
}
