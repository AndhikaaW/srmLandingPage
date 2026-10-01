import { useCallback, useEffect, useState } from "react";
import { doc, collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { db, firebaseConfigured } from "../lib/firebase";

export interface PublicSettings {
  shopName?: string;
  tagline?: string;
  address?: string;
  mapsUrl?: string;
  phone?: string;
  waNumber?: string;
  operationalHours?: string;
  waTemplate?: string;
}

export interface Service {
  id: string;
  name: string;
  desc?: string;
  price: number;
  unit?: string;
  order?: number;
  active?: boolean;
}

export interface GalleryItem {
  id: string;
  imageUrl: string;
  caption?: string;
  order?: number;
}

export interface Testimonial {
  id: string;
  name: string;
  text: string;
  rating?: number;
  active?: boolean;
}

export function usePublicContent() {
  const [settings, setSettings] = useState<PublicSettings | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);

  useEffect(() => {
    const store = db;
    if (!firebaseConfigured || !store) { setLoading(false); return; }
    setLoading(true);
    setError(null);
    let done = 0;
    const check = () => {
      done += 1;
      if (done >= 4) setLoading(false);
    };
    const onErr = (e: unknown) => {
      setError(e instanceof Error ? e.message : String(e));
      check();
    };

    const unsubs = [
      onSnapshot(
        doc(store, "settings/public"),
        (snap) => {
          setSettings(snap.exists() ? (snap.data() as PublicSettings) : null);
          check();
        },
        onErr
      ),
      onSnapshot(
        query(collection(store, "landing_services"), where("active", "==", true), orderBy("order")),
        (snap) => {
          setServices(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Service, "id">) })));
          check();
        },
        onErr
      ),
      onSnapshot(
        query(collection(store, "gallery"), orderBy("order")),
        (snap) => {
          setGallery(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<GalleryItem, "id">) })));
          check();
        },
        onErr
      ),
      onSnapshot(
        query(collection(store, "testimonials"), where("active", "==", true)),
        (snap) => {
          setTestimonials(
            snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Testimonial, "id">) }))
          );
          check();
        },
        onErr
      ),
    ];
    return () => unsubs.forEach((u) => u());
  }, [attempt]);

  return { settings, services, gallery, testimonials, loading, error, retry };
}
