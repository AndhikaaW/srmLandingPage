import { buildWaUrl } from "../lib/wa";
import { usePublicContent } from "../hooks/usePublicContent";
import { Navbar, navLinks } from "./site/Navbar";
import { FloatingWhatsApp } from "./site/WhatsAppButton";
import {
  About,
  Contact,
  CtaBanner,
  Footer,
  GallerySection,
  Hero,
  Services,
  Testimonials,
} from "./site/Sections";

const FALLBACK = {
  shopName: "Sri Rejeki Motor",
  waNumber: "",
  waTemplate: "Halo Sri Rejeki Motor, saya ingin konsultasi mengenai servis motor saya.",
};

export default function LandingPage() {
  const { settings, services, gallery, testimonials, loading, error, retry } =
    usePublicContent();
  const merged = { ...FALLBACK, ...settings };

  if (loading) return <p className="center">Memuat…</p>;
  if (error && !settings)
    return (
      <div className="center">
        <p>{error}</p>
        <button className="btn btn-primary" onClick={retry}>Coba lagi</button>
      </div>
    );

  // ponytail: section Keunggulan pixel-perfect di-drop (hardcode statis, tanpa koleksi Firestore). Tambah lagi saat admin kelola advantages.
  const waUrl = buildWaUrl(merged.waNumber, merged.waTemplate);
  const waDisplay = merged.phone || merged.waNumber;
  const hoursLines = (merged.operationalHours ?? "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  const embedUrl = merged.address
    ? `https://maps.google.com/maps?q=${encodeURIComponent(merged.address)}&output=embed`
    : undefined;

  return (
    <>
      <Navbar shopName={merged.shopName} waUrl={waUrl} />
      <main>
        <Hero shopName={merged.shopName} tagline={merged.tagline} waUrl={waUrl} />
        <About shopName={merged.shopName} address={merged.address} waUrl={waUrl} />
        <Services services={services} waNumber={merged.waNumber} template={merged.waTemplate} />
        <GallerySection items={gallery} />
        <Testimonials items={testimonials} />
        <CtaBanner shopName={merged.shopName} waUrl={waUrl} mapsUrl={merged.mapsUrl} />
        <Contact
          shopName={merged.shopName}
          address={merged.address}
          waDisplay={waDisplay}
          hoursLines={hoursLines}
          waUrl={waUrl}
          embedUrl={embedUrl}
        />
      </main>
      <Footer
        shopName={merged.shopName}
        address={merged.address}
        waDisplay={waDisplay}
        hoursLines={hoursLines}
        nav={navLinks}
      />
      <FloatingWhatsApp href={waUrl} label={merged.shopName} />
    </>
  );
}
