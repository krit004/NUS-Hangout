import {
  Timestamp,
  addDoc,
  collection,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { db } from "./firebase";

const EVENTS_COLLECTION = "events";

export interface EventData {
  title: string;
  category: string;
  location: string;
  startTime: Timestamp;
  endTime: Timestamp;
  latitude: number;
  longitude: number;
  avatar: string;
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
    startTime: eventData.startTime,
    endTime: eventData.endTime,
    latitude: eventData.latitude,
    longitude: eventData.longitude,
    avatar: eventData.avatar,
    createdBy: createdBy,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function getEvents(): Promise<Event[]> {
  const now = Timestamp.now();
  const q = query(
    collection(db, EVENTS_COLLECTION),
    where("endTime", ">=", now),
    orderBy("endTime", "asc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Omit<Event, "id">),
  }));
}