export function buildWaUrl(waNumber: string, template: string, serviceName?: string): string {
  let num = waNumber.replace(/[+\s\-()]/g, "");
  if (num.startsWith("0")) num = "62" + num.slice(1);
  else if (num.startsWith("62")) void 0;
  else if (num.startsWith("8")) num = "62" + num;
  const text = template.replaceAll("{layanan}", serviceName ?? "");
  return `https://wa.me/${num}?text=${encodeURIComponent(text)}`;
}
