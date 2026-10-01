import { MessageCircle } from "lucide-react";

export function WhatsAppLink({
  children,
  href,
  variant = "solid",
  className = "",
}: {
  children: React.ReactNode;
  href: string;
  variant?: "solid" | "outline";
  className?: string;
}) {
  const base =
    "inline-flex items-center justify-center gap-2 px-6 py-3 font-display text-sm uppercase tracking-[0.18em] transition-colors duration-300";
  const styles =
    variant === "solid"
      ? "bg-primary text-primary-foreground hover:bg-silver"
      : "border border-border text-foreground hover:border-silver hover:bg-graphite";

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`${base} ${styles} ${className}`}
    >
      {children}
    </a>
  );
}

export function FloatingWhatsApp({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Hubungi ${label} via WhatsApp`}
      className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center border border-border bg-charcoal text-foreground transition-colors duration-300 hover:border-silver hover:bg-graphite"
    >
      <MessageCircle className="h-6 w-6" aria-hidden="true" />
    </a>
  );
}
