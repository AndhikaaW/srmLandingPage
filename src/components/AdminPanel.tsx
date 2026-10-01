import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { auth, db, firebaseConfigured, firebaseConfigError } from "../lib/firebase";
import { buildWaUrl } from "../lib/wa";

type Tab = "profil" | "layanan" | "galeri" | "testimoni";

const TABS: { id: Tab; label: string }[] = [
  { id: "profil", label: "Profil & WA" },
  { id: "layanan", label: "Layanan" },
  { id: "galeri", label: "Galeri" },
  { id: "testimoni", label: "Testimoni" },
];

type Service = { id: string; name: string; desc?: string; price: number; unit?: string; order?: number; active?: boolean };
type GalleryItem = { id: string; imageUrl: string; caption?: string; order?: number };
type Testimonial = { id: string; name: string; text: string; rating: number; active?: boolean };

const emptyService = { name: "", desc: "", price: "", unit: "mulai dari", order: "0", active: true };
const emptyGallery = { imageUrl: "", caption: "", order: "0" };
const emptyTesti = { name: "", text: "", rating: "5", active: true };

function validWa(n: string) {
  return /^[0-9]{9,15}$/.test(n.replace(/[\s+\-]/g, "").replace(/^08/, "628"));
}

export default function AdminPanel() {
  const [user, setUser] = useState<User | null>(auth?.currentUser ?? null);
  const [checking, setChecking] = useState(auth?.currentUser == null);
  const [tab, setTab] = useState<Tab>("profil");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const [shopName, setShopName] = useState("");
  const [tagline, setTagline] = useState("");
  const [address, setAddress] = useState("");
  const [mapsUrl, setMapsUrl] = useState("");
  const [phone, setPhone] = useState("");
  const [waNumber, setWaNumber] = useState("");
  const [hours, setHours] = useState("");
  const [waTemplate, setWaTemplate] = useState("");

  const [services, setServices] = useState<Service[]>([]);
  const [svcForm, setSvcForm] = useState(emptyService);
  const [svcEdit, setSvcEdit] = useState<string | null>(null);

  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [galForm, setGalForm] = useState(emptyGallery);
  const [galEdit, setGalEdit] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const [testis, setTestis] = useState<Testimonial[]>([]);
  const [tesForm, setTesForm] = useState(emptyTesti);
  const [tesEdit, setTesEdit] = useState<string | null>(null);

  useEffect(() => { if (!auth) { setChecking(false); return; } return onAuthStateChanged(auth, (u) => { setUser(u); setChecking(false); }); }, []);
  useEffect(() => { if (user) void loadAll(); }, [user]);

  async function loadAll() {
    setErr("");
    const store = db;
    if (!store) { setErr(firebaseConfigError); return; }
    try {
      const s = await getDoc(doc(store, "settings", "public"));
      if (s.exists()) {
        const d = s.data();
        setShopName(d.shopName ?? ""); setTagline(d.tagline ?? ""); setAddress(d.address ?? "");
        setMapsUrl(d.mapsUrl ?? ""); setPhone(d.phone ?? ""); setWaNumber(d.waNumber ?? "");
        setHours(d.operationalHours ?? ""); setWaTemplate(d.waTemplate ?? "");
      }
      const sv = await getDocs(query(collection(store, "landing_services"), orderBy("order")));
      setServices(sv.docs.map((x) => ({ id: x.id, ...(x.data() as Omit<Service, "id">) })));
      const g = await getDocs(query(collection(store, "gallery"), orderBy("order")));
      setGallery(g.docs.map((x) => ({ id: x.id, ...(x.data() as Omit<GalleryItem, "id">) })));
      const t = await getDocs(collection(store, "testimonials"));
      setTestis(t.docs.map((x) => ({ id: x.id, ...(x.data() as Omit<Testimonial, "id">) })));
    } catch (e) { setErr(e instanceof Error ? e.message : "Gagal memuat data."); }
  }

  if (!firebaseConfigured || !auth || !db) return <p className="center">{firebaseConfigError}</p>;
  if (checking) return <p className="center">Memuat…</p>;
  if (user == null) return <p className="center">Belum login.</p>;

  async function saveProfile() {
    setErr("");
    if (!shopName.trim()) return setErr("Nama bengkel wajib diisi.");
    if (!waNumber.trim() || !validWa(waNumber.trim())) return setErr("Nomor WA harus 9–15 digit.");
    if (!waTemplate.trim()) return setErr("Template WA wajib diisi.");
    const store = db;
    if (!store) return setErr(firebaseConfigError);
    setBusy(true);
    try {
      await setDoc(doc(store, "settings", "public"),
        { shopName: shopName.trim(), tagline, address, mapsUrl, phone, waNumber: waNumber.trim(), operationalHours: hours, waTemplate },
        { merge: true });
    } catch (e) { setErr(e instanceof Error ? e.message : "Gagal menyimpan profil."); }
    finally { setBusy(false); }
  }

  async function saveService() {
    setErr("");
    const price = Number(svcForm.price);
    if (!svcForm.name.trim()) return setErr("Nama layanan wajib diisi.");
    if (svcForm.price === "" || Number.isNaN(price) || price < 0) return setErr("Harga harus angka ≥ 0.");
    setBusy(true);
    try {
      const data = { name: svcForm.name.trim(), desc: svcForm.desc, price, unit: svcForm.unit, order: Number(svcForm.order) || 0, active: svcForm.active };
      const store = db;
      if (!store) { setBusy(false); return setErr(firebaseConfigError); }
      if (svcEdit) await updateDoc(doc(store, "landing_services", svcEdit), data);
      else await addDoc(collection(store, "landing_services"), data);
      setSvcForm(emptyService); setSvcEdit(null); await loadAll();
    } catch (e) { setErr(e instanceof Error ? e.message : "Gagal menyimpan layanan."); }
    finally { setBusy(false); }
  }

  // ponytail: base64 langsung ke Firestore, tanpa Storage. Ceiling: foto >700KB
  // bikin dokumen >1MiB dan gagal tulis — kompres dulu sebelum pilih.
  async function onFile(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) return setErr("File harus gambar.");
    if (file.size > 700 * 1024) return setErr("Foto kebesaran (maks 700KB). Kompres dulu.");
    setUploading(true); setErr("");
    try {
      const url = await new Promise<string>((res, rej) => {
        const r = new FileReader();
        r.onload = () => res(String(r.result));
        r.onerror = () => rej(new Error("Gagal membaca file."));
        r.readAsDataURL(file);
      });
      setGalForm((f) => ({ ...f, imageUrl: url }));
    } catch (e) { setErr(e instanceof Error ? e.message : "Gagal membaca foto."); }
    finally { setUploading(false); }
  }

  async function saveGallery() {
    setErr("");
    if (!galForm.imageUrl.trim()) return setErr("Foto wajib dipilih dulu.");
    setBusy(true);
    try {
      const data = { imageUrl: galForm.imageUrl.trim(), caption: galForm.caption, order: Number(galForm.order) || 0 };
      const store = db;
      if (!store) { setBusy(false); return setErr(firebaseConfigError); }
      if (galEdit) await updateDoc(doc(store, "gallery", galEdit), data);
      else await addDoc(collection(store, "gallery"), data);
      setGalForm(emptyGallery); setGalEdit(null); await loadAll();
    } catch (e) { setErr(e instanceof Error ? e.message : "Gagal menyimpan galeri."); }
    finally { setBusy(false); }
  }

  async function saveTesti() {
    setErr("");
    const rating = Number(tesForm.rating);
    if (!tesForm.name.trim()) return setErr("Nama wajib diisi.");
    if (!tesForm.text.trim()) return setErr("Isi testimoni wajib diisi.");
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) return setErr("Rating harus 1–5.");
    setBusy(true);
    try {
      const data = { name: tesForm.name.trim(), text: tesForm.text.trim(), rating, active: tesForm.active };
      const store = db;
      if (!store) { setBusy(false); return setErr(firebaseConfigError); }
      if (tesEdit) await updateDoc(doc(store, "testimonials", tesEdit), data);
      else await addDoc(collection(store, "testimonials"), data);
      setTesForm(emptyTesti); setTesEdit(null); await loadAll();
    } catch (e) { setErr(e instanceof Error ? e.message : "Gagal menyimpan testimoni."); }
    finally { setBusy(false); }
  }
  async function approveTesti(id: string) {
    setErr("");
    const store = db;
    if (!store) return setErr(firebaseConfigError);
    try { await updateDoc(doc(store, "testimonials", id), { active: true }); await loadAll(); }
    catch (e) { setErr(e instanceof Error ? e.message : "Gagal menyetujui."); }
  }


  async function remove(col: string, id: string) {
    setErr("");
    const store = db;
    if (!store) return setErr(firebaseConfigError);
    try { await deleteDoc(doc(store, col, id)); await loadAll(); }
    catch (e) { setErr(e instanceof Error ? e.message : "Gagal menghapus."); }
  }

  const waPreview = waNumber.trim() && waTemplate.trim() ? buildWaUrl(waNumber.trim(), waTemplate, "Contoh Layanan") : "";
  const F = (v: string, set: (v: string) => void) => ({ value: v, onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => set(e.target.value) });

  return (
    <div className="admin">
      <div className="admin-head">
        <h2>Admin — SRM Motor</h2>
        <button className="btn btn-outline" onClick={() => auth && signOut(auth)}>Logout</button>
      </div>
      <div className="tabs">
        {TABS.map((t) => (
          <button key={t.id} className={tab === t.id ? "tab active" : "tab"} onClick={() => { setTab(t.id); setErr(""); }}>{t.label}</button>
        ))}
      </div>
      {err && <p className="error">{err}</p>}

      {tab === "profil" && (
        <div className="card">
          <label>Nama bengkel *<input {...F(shopName, setShopName)} /></label>
          <label>Tagline<input {...F(tagline, setTagline)} /></label>
          <label>Alamat<textarea {...F(address, setAddress)} /></label>
          <label>Link Google Maps<input {...F(mapsUrl, setMapsUrl)} /></label>
          <label>Telepon<input {...F(phone, setPhone)} /></label>
          <label>Nomor WA * (cth 628123456789)<input {...F(waNumber, setWaNumber)} /></label>
          <label>Jam operasional<textarea {...F(hours, setHours)} /></label>
          <label>Template WA * (gunakan {"{layanan}"})<textarea {...F(waTemplate, setWaTemplate)} rows={4} /></label>
          {waPreview && <p className="preview">Preview: {waPreview}</p>}
          <button className="btn btn-primary" onClick={saveProfile} disabled={busy}>{busy ? "Menyimpan…" : "Simpan Profil"}</button>
        </div>
      )}

      {tab === "layanan" && (
        <div className="card">
          {services.map((x) => (
            <div key={x.id} className="row">
              <div className="row-main"><strong>{x.name} — Rp{x.price}</strong> {!x.active && "(nonaktif)"}<p>{x.desc}</p></div>
              <button onClick={() => { setSvcEdit(x.id); setSvcForm({ name: x.name, desc: x.desc ?? "", price: String(x.price), unit: x.unit ?? "mulai dari", order: String(x.order ?? 0), active: x.active ?? true }); }}>Ubah</button>
              <button onClick={() => remove("landing_services", x.id)}>Hapus</button>
            </div>
          ))}
          <label>Nama *<input value={svcForm.name} onChange={(e) => setSvcForm((f) => ({ ...f, name: e.target.value }))} /></label>
          <label>Deskripsi<textarea value={svcForm.desc} onChange={(e) => setSvcForm((f) => ({ ...f, desc: e.target.value }))} /></label>
          <label>Harga * (angka ≥ 0)<input type="number" min={0} value={svcForm.price} onChange={(e) => setSvcForm((f) => ({ ...f, price: e.target.value }))} /></label>
          <label>Satuan (mulai dari / flat)<input value={svcForm.unit} onChange={(e) => setSvcForm((f) => ({ ...f, unit: e.target.value }))} /></label>
          <label>Urutan<input type="number" value={svcForm.order} onChange={(e) => setSvcForm((f) => ({ ...f, order: e.target.value }))} /></label>
          <label className="check"><input type="checkbox" checked={svcForm.active} onChange={(e) => setSvcForm((f) => ({ ...f, active: e.target.checked }))} /> Aktif</label>
          <button className="btn btn-primary" onClick={saveService} disabled={busy}>{svcEdit ? "Update" : "Tambah"} Layanan</button>
          {svcEdit && <button onClick={() => { setSvcEdit(null); setSvcForm(emptyService); }}>Batal</button>}
        </div>
      )}

      {tab === "galeri" && (
        <div className="card">
          {gallery.map((x) => (
            <div key={x.id} className="row">
              <img src={x.imageUrl} alt={x.caption ?? ""} className="thumb" loading="lazy" />
              <div className="row-main"><strong>{x.caption || "(tanpa caption)"}</strong></div>
              <button onClick={() => { setGalEdit(x.id); setGalForm({ imageUrl: x.imageUrl, caption: x.caption ?? "", order: String(x.order ?? 0) }); }}>Ubah</button>
              <button onClick={() => remove("gallery", x.id)}>Hapus</button>
            </div>
          ))}
          <label>Pilih foto (maks 700KB)<input type="file" accept="image/*" disabled={uploading} onChange={(e) => onFile(e.target.files?.[0])} /></label>
          {uploading && <p>Membaca foto…</p>}
          {galForm.imageUrl && <img src={galForm.imageUrl} alt="pratinjau" className="thumb" />}
          <label>Caption<input value={galForm.caption} onChange={(e) => setGalForm((f) => ({ ...f, caption: e.target.value }))} /></label>
          <label>Urutan<input type="number" value={galForm.order} onChange={(e) => setGalForm((f) => ({ ...f, order: e.target.value }))} /></label>
          <button className="btn btn-primary" onClick={saveGallery} disabled={busy}>{galEdit ? "Update" : "Tambah"} Foto</button>
          {galEdit && <button onClick={() => { setGalEdit(null); setGalForm(emptyGallery); }}>Batal</button>}
        </div>
      )}

      {tab === "testimoni" && (
        <div className="card">
          {testis.filter((x) => !x.active).length > 0 && (
            <p className="preview">Menunggu persetujuan: {testis.filter((x) => !x.active).length} ulasan.</p>
          )}
          {testis.map((x) => (
            <div key={x.id} className="row">
              <div className="row-main"><strong>{x.name} — ★{x.rating}</strong> {!x.active && "(menunggu persetujuan)"}<p>{x.text}</p></div>
              {!x.active && <button onClick={() => approveTesti(x.id)}>Setujui</button>}
              <button onClick={() => { setTesEdit(x.id); setTesForm({ name: x.name, text: x.text, rating: String(x.rating), active: x.active ?? true }); }}>Ubah</button>
              <button onClick={() => remove("testimonials", x.id)}>Hapus</button>
            </div>
          ))}
          <label>Nama *<input value={tesForm.name} onChange={(e) => setTesForm((f) => ({ ...f, name: e.target.value }))} /></label>
          <label>Isi *<textarea value={tesForm.text} onChange={(e) => setTesForm((f) => ({ ...f, text: e.target.value }))} rows={3} /></label>
          <label>Rating (1–5)<input type="number" min={1} max={5} value={tesForm.rating} onChange={(e) => setTesForm((f) => ({ ...f, rating: e.target.value }))} /></label>
          <label className="check"><input type="checkbox" checked={tesForm.active} onChange={(e) => setTesForm((f) => ({ ...f, active: e.target.checked }))} /> Aktif (tampil di landing)</label>
          <button className="btn btn-primary" onClick={saveTesti} disabled={busy}>{tesEdit ? "Update" : "Tambah"} Testimoni</button>
          {tesEdit && <button onClick={() => { setTesEdit(null); setTesForm(emptyTesti); }}>Batal</button>}
        </div>
      )}
    </div>
  );
}
