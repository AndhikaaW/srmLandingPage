import { useState } from "react";
import {
  Wrench,
  Cog,
  Droplet,
  Zap,
  Disc3,
  Gauge,
  MapPin,
  Clock,
  MessageCircle,
  ArrowRight,
  Star,
  type LucideIcon,
} from "lucide-react";
import { addDoc, collection } from "firebase/firestore";
import heroImg from "../../assets/hero-workshop.jpg";
import aboutImg from "../../assets/about-mechanic.jpg";
import ctaImg from "../../assets/cta-moto.jpg";
import { Reveal } from "./Reveal";
import { WhatsAppLink } from "./WhatsAppButton";
import { buildWaUrl } from "../../lib/wa";
import { db } from "../../lib/firebase";
import type { GalleryItem, Service, Testimonial } from "../../hooks/usePublicContent";

const icons: LucideIcon[] = [Wrench, Cog, Droplet, Zap, Disc3, Gauge];

function formatPrice(price: number | string, unit?: string): string {
  const num = typeof price === "number" ? price : Number(price);
  const rp = Number.isFinite(num) ? `Rp${num.toLocaleString("id-ID")}` : String(price);
  return unit && unit !== "flat" ? `${unit} ${rp}` : rp;
}

export function Hero({
  shopName,
  tagline,
  waUrl,
}: {
  shopName: string;
  tagline?: string;
  waUrl: string;
}) {
  return (
    <section id="home" className="relative flex min-h-[90vh] items-end lg:h-[85vh]">
      <img
        src={heroImg}
        alt="Motor di dalam bengkel dengan pencahayaan temaram"
        width={1920}
        height={1088}
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/70 to-obsidian/40" />
      <div className="relative mx-auto w-full max-w-7xl px-5 pb-20 pt-32 lg:px-10 lg:pb-24">
        <p className="eyebrow">{shopName}</p>
        <h1 className="mt-6 max-w-4xl text-[2.5rem] leading-[0.95] sm:text-6xl lg:text-7xl">
          Rawat motor Anda.
          <span className="block text-silver">Nikmati setiap perjalanan.</span>
        </h1>
        <p className="mt-7 max-w-xl text-sm leading-relaxed text-steel sm:text-base">
          {tagline ||
            "Solusi perawatan dan servis motor dengan pelayanan profesional, terpercaya, dan mengutamakan kepuasan pelanggan."}
        </p>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <WhatsAppLink href={waUrl}>
            <MessageCircle className="h-4 w-4" aria-hidden="true" />
            Konsultasi Sekarang
          </WhatsAppLink>
          <a
            href="#layanan"
            className="inline-flex items-center justify-center gap-2 border border-border px-6 py-3 font-display text-sm uppercase tracking-[0.18em] transition-colors duration-300 hover:border-silver hover:bg-graphite"
          >
            Lihat Layanan
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  );
}

export function About({
  shopName,
  address,
  waUrl,
}: {
  shopName: string;
  address?: string;
  waUrl: string;
}) {
  const area = address?.split(",")[1]?.trim() || "Pacitan";
  return (
    <section id="tentang" className="border-t border-border py-24 lg:py-32">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 lg:grid-cols-12 lg:gap-20 lg:px-10">
        <Reveal className="lg:col-span-5">
          <img
            src={aboutImg}
            alt="Mekanik sedang mengerjakan mesin motor di bengkel"
            width={1200}
            height={1504}
            loading="lazy"
            className="w-full border border-border object-cover"
          />
        </Reveal>
        <Reveal delay={120} className="lg:col-span-7">
          <p className="eyebrow">Tentang Kami</p>
          <h2 className="mt-4 text-4xl sm:text-5xl lg:text-6xl">
            Lebih dari sekadar bengkel motor.
          </h2>
          <div className="mt-6 h-px w-24 bg-silver/50" />
          <div className="mt-8 space-y-5 text-sm leading-relaxed text-steel sm:text-base">
            <p>
              {shopName} adalah bengkel motor yang melayani perawatan dan
              perbaikan kendaraan harian di {area}. Kami mengerjakan setiap unit
              dengan runtut, mulai dari mendengarkan keluhan pemilik, memeriksa
              kondisi motor, hingga menjelaskan pekerjaan yang dilakukan.
            </p>
            <p>
              Komitmen kami sederhana: pengerjaan yang teliti, komunikasi yang
              jelas, dan motor yang kembali nyaman digunakan. Punya pertanyaan
              sebelum datang? Hubungi kami lewat WhatsApp.
            </p>
          </div>
          <WhatsAppLink href={waUrl} variant="outline" className="mt-9">
            <MessageCircle className="h-4 w-4" aria-hidden="true" />
            Tanya Kondisi Motor
          </WhatsAppLink>
        </Reveal>
      </div>
    </section>
  );
}

export function Services({
  services,
  waNumber,
  template,
}: {
  services: Service[];
  waNumber: string;
  template: string;
}) {
  return (
    <section id="layanan" className="border-t border-border py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-5 lg:px-10">
        <Reveal>
          <p className="eyebrow">Layanan</p>
          <h2 className="mt-4 text-4xl sm:text-5xl lg:text-6xl">Our Services</h2>
          <p className="mt-5 max-w-md text-sm text-steel sm:text-base">
            Perawatan tepat, perjalanan lebih nyaman.
          </p>
        </Reveal>

        {services.length === 0 ? (
          <p className="mt-14 border border-border bg-charcoal p-8 text-sm text-steel">
            Daftar layanan belum diisi admin.
          </p>
        ) : (
          <ul className="mt-14 grid grid-cols-1 gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service, index) => {
              const Icon = icons[index % icons.length];
              return (
                <Reveal as="li" key={service.id} delay={(index % 6) * 60}>
                  <div className="group flex h-full flex-col bg-obsidian p-8 transition-colors duration-500 hover:bg-charcoal lg:p-10">
                    <Icon
                      className="h-7 w-7 text-steel transition-colors duration-500 group-hover:text-silver"
                      strokeWidth={1.25}
                      aria-hidden="true"
                    />
                    <h3 className="mt-7 text-xl tracking-[0.06em]">{service.name}</h3>
                    {service.desc && (
                      <p className="mt-3 text-sm leading-relaxed text-steel">
                        {service.desc}
                      </p>
                    )}
                    <p className="mt-4 font-display text-sm uppercase tracking-[0.18em] text-silver">
                      {formatPrice(service.price, service.unit)}
                    </p>
                    <a
                      href={buildWaUrl(waNumber, template, service.name)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-6 inline-flex items-center gap-2 font-display text-sm uppercase tracking-[0.18em] text-steel transition-colors hover:text-foreground"
                    >
                      Booking {service.name}
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </a>
                  </div>
                </Reveal>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}

export function GallerySection({ items }: { items: GalleryItem[] }) {
  return (
    <section id="galeri" className="border-t border-border py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-5 lg:px-10">
        <Reveal>
          <p className="eyebrow">Galeri</p>
          <h2 className="mt-4 max-w-2xl text-4xl sm:text-5xl lg:text-6xl">
            Inside Our Workshop
          </h2>
        </Reveal>

        {items.length === 0 ? (
          <p className="mt-14 border border-border bg-charcoal p-8 text-sm text-steel">
            Foto galeri belum diisi admin.
          </p>
        ) : (
          <div className="mt-14 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4">
            {items.map((image, index) => (
              <Reveal
                key={image.id}
                delay={(index % 4) * 80}
                className={index === 0 ? "md:col-span-2 md:row-span-2" : index === 3 ? "md:col-span-2" : ""}
              >
                <div className="group relative block h-full w-full overflow-hidden border border-border">
                  <img
                    src={image.imageUrl}
                    alt={image.caption || "Foto bengkel"}
                    loading="lazy"
                    className="h-64 w-full object-cover transition-transform duration-700 group-hover:scale-105 md:h-full md:min-h-64"
                  />
                  <span className="absolute inset-0 bg-obsidian/20 transition-opacity duration-500 group-hover:opacity-0" />
                  {image.caption && (
                    <span className="absolute inset-x-0 bottom-0 bg-obsidian/70 px-4 py-2 text-xs text-silver">
                      {image.caption}
                    </span>
                  )}
                </div>
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export function Testimonials({ items }: { items: Testimonial[] }) {
  return (
    <section id="testimoni" className="border-t border-border py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-5 lg:px-10">
        <Reveal>
          <p className="eyebrow">Testimoni</p>
          <h2 className="mt-4 max-w-2xl text-4xl sm:text-5xl lg:text-6xl">
            Kata Pelanggan
          </h2>
        </Reveal>

        {items.length === 0 ? (
          <p className="mt-14 border border-border bg-charcoal p-8 text-sm text-steel">
            Testimoni belum diisi admin.
          </p>
        ) : (
          <ul className="mt-14 grid grid-cols-1 gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
            {items.map((t, index) => (
              <Reveal as="li" key={t.id} delay={(index % 6) * 60}>
                <div className="flex h-full flex-col bg-obsidian p-8 lg:p-10">
                  {typeof t.rating === "number" && (
                    <div className="flex gap-1" aria-label={`Rating ${t.rating} dari 5`}>
                      {Array.from({ length: Math.min(5, Math.max(1, t.rating)) }).map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-silver text-silver" aria-hidden="true" />
                      ))}
                    </div>
                  )}
                  <p className="mt-5 flex-1 text-sm leading-relaxed text-steel">
                    “{t.text}”
                  </p>
                  <p className="mt-6 font-display text-sm uppercase tracking-[0.18em]">
                    {t.name}
                  </p>
                </div>
              </Reveal>
            ))}
          </ul>
        )}
        <ReviewForm />
      </div>
    </section>
  );
}

function ReviewForm() {
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [rating, setRating] = useState("5");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(""); setMsg("");
    const r = Number(rating);
    if (!name.trim()) return setErr("Nama wajib diisi.");
    if (!text.trim()) return setErr("Isi testimoni wajib diisi.");
    if (!Number.isInteger(r) || r < 1 || r > 5) return setErr("Rating harus 1–5.");
    if (!db) return setErr("Firebase belum dikonfigurasi.");
    setBusy(true);
    try {
      // ponytail: publik selalu active:false, tampil setelah admin centang Aktif. Tanpa captcha —
      // tambah saat spam muncul.
      await addDoc(collection(db, "testimonials"), { name: name.trim(), text: text.trim(), rating: r, active: false });
      setName(""); setText(""); setRating("5");
      setMsg("Terima kasih atas ulasan anda!");
    } catch (e) { setErr(e instanceof Error ? e.message : "Gagal mengirim ulasan."); }
    finally { setBusy(false); }
  }

  return (
    <form onSubmit={submit} className="mx-auto mt-14 max-w-2xl border border-border bg-charcoal p-6 lg:p-8" aria-label="Form ulasan pelanggan">
      <h3 className="font-display text-xl uppercase tracking-[0.12em]">Tulis Ulasan</h3>
      <label className="mt-5 block text-sm font-semibold text-silver">Nama *
        <input value={name} onChange={(e) => setName(e.target.value)} required maxLength={60}
          className="mt-2 w-full border border-white/20 bg-obsidian p-3 font-normal text-white placeholder:text-steel" placeholder="Nama kamu" />
      </label>
      <label className="mt-4 block text-sm font-semibold text-silver">Ulasan *
        <textarea value={text} onChange={(e) => setText(e.target.value)} required rows={4} maxLength={1000}
          className="mt-2 w-full border border-white/20 bg-obsidian p-3 font-normal text-white placeholder:text-steel" placeholder="Ceritakan pengalaman servismu…" />
      </label>
      <label className="mt-4 block text-sm font-semibold text-silver">Rating (1–5)
        <input type="number" min={1} max={5} value={rating} onChange={(e) => setRating(e.target.value)}
          className="mt-2 w-full border border-white/20 bg-obsidian p-3 font-normal text-white" />
      </label>
      {err && <p className="mt-3 text-sm text-red-400">{err}</p>}
      {msg && <p className="mt-3 text-sm text-green-400">{msg}</p>}
      <button type="submit" disabled={busy} className="mt-5 bg-off-white text-silver px-8 py-3.5 font-display text-sm uppercase tracking-[0.18em]  hover:bg-white hover:text-black disabled:opacity-60">
        {busy ? "Mengirim…" : "Kirim Ulasan"}
      </button>
    </form>
  );
}

export function CtaBanner({
  shopName,
  waUrl,
  mapsUrl,
}: {
  shopName: string;
  waUrl: string;
  mapsUrl?: string;
}) {
  return (
    <section className="relative border-t border-border">
      <img
        src={ctaImg}
        alt="Detail roda depan motor di dalam bengkel"
        width={1920}
        height={912}
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-obsidian/80" />
      <div className="relative mx-auto max-w-7xl px-5 py-24 lg:px-10 lg:py-32">
        <Reveal>
          <h2 className="max-w-3xl text-4xl sm:text-5xl lg:text-6xl">
            Motor Anda membutuhkan perawatan?
          </h2>
          <p className="mt-6 max-w-xl text-sm leading-relaxed text-silver sm:text-base">
            Ceritakan keluhan motor Anda kepada {shopName}. Kami siap membantu
            lewat WhatsApp atau Anda bisa langsung datang ke bengkel kami.
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <WhatsAppLink href={waUrl}>
              <MessageCircle className="h-4 w-4" aria-hidden="true" />
              Chat WhatsApp
            </WhatsAppLink>
            {mapsUrl && (
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 border border-silver/60 px-6 py-3 font-display text-sm uppercase tracking-[0.18em] transition-colors duration-300 hover:bg-graphite"
              >
                <MapPin className="h-4 w-4" aria-hidden="true" />
                Buka Google Maps
              </a>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export function Contact({
  shopName,
  address,
  waDisplay,
  hoursLines,
  waUrl,
  embedUrl,
}: {
  shopName: string;
  address?: string;
  waDisplay: string;
  hoursLines: string[];
  waUrl: string;
  embedUrl?: string;
}) {
  return (
    <section id="kontak" className="border-t border-border py-24 lg:py-32">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 lg:grid-cols-2 lg:gap-20 lg:px-10">
        <Reveal>
          <p className="eyebrow">Kontak</p>
          <h2 className="mt-4 text-4xl sm:text-5xl">Kunjungi Bengkel Kami</h2>

          <dl className="mt-12 space-y-10">
            {address && (
              <div className="flex gap-5">
                <MapPin className="mt-1 h-5 w-5 shrink-0 text-steel" strokeWidth={1.25} aria-hidden="true" />
                <div>
                  <dt className="eyebrow">Alamat</dt>
                  <dd className="mt-2 text-sm leading-relaxed text-foreground sm:text-base">
                    {address}
                  </dd>
                </div>
              </div>
            )}
            {waDisplay && (
              <div className="flex gap-5">
                <MessageCircle className="mt-1 h-5 w-5 shrink-0 text-steel" strokeWidth={1.25} aria-hidden="true" />
                <div>
                  <dt className="eyebrow">WhatsApp</dt>
                  <dd className="mt-2 text-sm text-foreground sm:text-base">
                    {waDisplay}
                  </dd>
                </div>
              </div>
            )}
            {hoursLines.length > 0 && (
              <div className="flex gap-5">
                <Clock className="mt-1 h-5 w-5 shrink-0 text-steel" strokeWidth={1.25} aria-hidden="true" />
                <div>
                  <dt className="eyebrow">Jam Buka</dt>
                  <dd className="mt-2 space-y-1 text-sm text-foreground sm:text-base">
                    {hoursLines.map((line) => (
                      <div key={line}>{line}</div>
                    ))}
                  </dd>
                </div>
              </div>
            )}
          </dl>

          <WhatsAppLink href={waUrl} className="mt-12">
            <MessageCircle className="h-4 w-4" aria-hidden="true" />
            Hubungi Kami
          </WhatsAppLink>
        </Reveal>

        {embedUrl && (
          <Reveal delay={120}>
            <div className="h-full min-h-80 border border-border">
              <iframe
                title={`Lokasi ${shopName} di Google Maps`}
                src={embedUrl}
                loading="lazy"
                className="h-full min-h-80 w-full"
              />
            </div>
          </Reveal>
        )}
      </div>
    </section>
  );
}

export function Footer({
  shopName,
  address,
  waDisplay,
  hoursLines,
  nav,
}: {
  shopName: string;
  address?: string;
  waDisplay: string;
  hoursLines: string[];
  nav: Array<{ label: string; href: string }>;
}) {
  return (
    <footer className="border-t border-border bg-charcoal">
      <div className="mx-auto max-w-7xl px-5 py-16 lg:px-10">
        <div className="grid gap-12 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-3">
              <img
                src="/srm.png"
                alt={`Logo ${shopName}`}
                width={56}
                height={56}
                loading="lazy"
                className="h-12 w-12 rounded-full object-cover"
              />
              <span className="font-display text-base uppercase tracking-[0.2em]">
                {shopName}
              </span>
            </div>
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-steel">
              Perawatan dan servis motor dengan pengerjaan teliti dan pelayanan
              ramah.
            </p>
          </div>

          <nav aria-label="Navigasi footer">
            <p className="eyebrow">Navigasi</p>
            <ul className="mt-5 space-y-3">
              {nav.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-sm text-steel transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <p className="eyebrow">Kontak</p>
            <ul className="mt-5 space-y-3 text-sm text-steel">
              {address && <li>{address}</li>}
              {waDisplay && <li>WhatsApp: {waDisplay}</li>}
              {hoursLines.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-14 border-t border-border pt-6">
          <p className="text-xs tracking-[0.1em] text-steel">
            © {new Date().getFullYear()} {shopName}. Seluruh hak cipta
            dilindungi.
          </p>
        </div>
      </div>
    </footer>
  );
}
