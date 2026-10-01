import { useEffect, useState } from "react";
import { onAuthStateChanged, signInWithEmailAndPassword, type User } from "firebase/auth";
import { auth, firebaseConfigured, firebaseConfigError } from "../lib/firebase";
import AdminPanel from "./AdminPanel";

export default function LoginPage() {
  const [user, setUser] = useState<User | null>(auth?.currentUser ?? null);
  const [checking, setChecking] = useState(Boolean(auth) && auth?.currentUser == null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!auth) { setChecking(false); return; }
    return onAuthStateChanged(auth, (u) => { setUser(u); setChecking(false); });
  }, []);

  if (!firebaseConfigured || !auth) return <p className="center">{firebaseConfigError}</p>;
  if (checking) return <p className="center">Memuat…</p>;
  if (user != null) return <AdminPanel />;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const a = auth;
    if (!a) return setError(firebaseConfigError);
    setError(""); setBusy(true);
    try { await signInWithEmailAndPassword(a, email.trim(), password); }
    catch (err) { setError(err instanceof Error ? err.message : "Login gagal."); }
    finally { setBusy(false); }
  }

  return (
    <form className="login" onSubmit={submit}>
      <h2>Login Admin</h2>
      <label>Email<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></label>
      <label>Password<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required /></label>
      {error && <p className="error">{error}</p>}
      <button className="btn btn-primary" disabled={busy}>{busy ? "Masuk…" : "Masuk"}</button>
    </form>
  );
}
