import { useEffect, useState } from "react";
import { Menu, X, MessageCircle } from "lucide-react";
import { WhatsAppLink } from "./WhatsAppButton";

export const navLinks = [
  { label: "Home", href: "#home" },
  { label: "Tentang Kami", href: "#tentang" },
  { label: "Layanan", href: "#layanan" },
  { label: "Keunggulan", href: "#keunggulan" },
  { label: "Galeri", href: "#galeri" },
  { label: "Testimoni", href: "#testimoni" },
  { label: "Kontak", href: "#kontak" },
];

export function Navbar({ shopName, waUrl }: { shopName: string; waUrl: string }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 transition-colors duration-300 ${
        scrolled || open
          ? "border-b border-border bg-obsidian/95 backdrop-blur"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 lg:px-10">
        <a href="#home" className="flex items-center gap-3" aria-label={shopName}>
          <img
            src="/srm_landing_page/srm.png"
            alt={`Logo ${shopName}`}
            width={48}
            height={48}
            className="h-12 w-12 rounded-full object-cover"
          />
          <span className="font-display text-base uppercase tracking-[0.2em]">
            {shopName}
          </span>
        </a>

        <nav aria-label="Navigasi utama" className="hidden items-center gap-8 lg:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="font-display text-sm uppercase tracking-[0.18em] text-steel transition-colors hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden lg:block">
          <WhatsAppLink href={waUrl} variant="outline" className="!px-5 !py-2.5">
            <MessageCircle className="h-4 w-4" aria-hidden="true" />
            Konsultasi
          </WhatsAppLink>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Tutup menu" : "Buka menu"}
          className="flex h-11 w-11 items-center justify-center border border-border text-foreground lg:hidden"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div
          id="mobile-menu"
          className="border-t border-border bg-obsidian px-5 pb-8 pt-4 lg:hidden"
        >
          <nav aria-label="Navigasi mobile" className="flex flex-col">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="border-b border-border py-3 font-display text-sm uppercase tracking-[0.18em] text-foreground"
              >
                {link.label}
              </a>
            ))}
          </nav>
          <WhatsAppLink href={waUrl} className="mt-6 w-full">
            <MessageCircle className="h-4 w-4" aria-hidden="true" />
            Konsultasi Sekarang
          </WhatsAppLink>
        </div>
      )}
    </header>
  );
}
