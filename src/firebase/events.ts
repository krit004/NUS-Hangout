import {
    addDoc,
    collection,
    getDocs,
    orderBy,
    query,
    serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";
const EVENTS_COLLECTION = "events";

export interface EventData {
  title: string;
  category: string;
  location: string;
  time: string;
}

export interface Event extends EventData {
  id: string;
  createdBy: string;
  createdAt?: any;
}

export async function addEvent(eventData: EventData, createdBy: string): Promise<string> {
  const docRef = await addDoc(collection(db, EVENTS_COLLECTION), {
    title: eventData.title,
    category: eventData.category,
    location: eventData.location,
    time: eventData.time,
    createdBy: createdBy,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function getEvents(): Promise<Event[]> {
  const q = query(
    collection(db, EVENTS_COLLECTION),
    orderBy("createdAt", "desc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Omit<Event, "id">),
  }));
}