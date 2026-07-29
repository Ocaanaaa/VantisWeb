import { copy } from "../content";

/**
 * Punto unico donde vive la marca. Ni Nav ni Footer saben como se dibuja.
 *
 * El simbolo es la V corporativa: dos astas de grosor desigual que se tocan en
 * un unico punto -- esa union es la separacion fina de la punta, y no debe
 * cerrarse -- con el rombo de acento suspendido entre ambas.
 *
 * Va siempre en oro (`fill-port` / `fill-port-soft`), no en `currentColor`:
 * el oro es legible tanto sobre papel como sobre azul noche, asi que una sola
 * version sirve para toda la pagina. Los valores viven en app/src/styles.css.
 *
 * El viewBox recorta al contenido exacto (x 10..90, y 14..87) para que el
 * simbolo llene su caja sin margenes muertos al escalarlo junto al texto.
 */

export function Mark({ className = "", accent = true }: { className?: string; accent?: boolean }) {
  return (
    <svg viewBox="10 14 80 73" className={className} fill="none" aria-hidden="true" focusable="false">
      <polygon points="10,14 27,14 50,87" className="fill-port" />
      <polygon points="78,14 90,14 50,87" className="fill-port" />
      {accent ? <polygon points="50,16.5 58.5,25 50,33.5 41.5,25" className="fill-port-soft" /> : null}
    </svg>
  );
}

export default function Logo({
  variant = "wordmark",
  className = "",
}: {
  variant?: "wordmark" | "mark";
  className?: string;
}) {
  const label = copy.meta.brand;
  if (variant === "mark") return <Mark className={className} />;
  return (
    <span className={`inline-flex items-baseline gap-2.5 ${className}`} aria-label={label}>
      <Mark className="h-[0.92em] w-[1.01em] shrink-0 translate-y-[0.06em]" />
      <span className="logotype">{label}</span>
    </span>
  );
}
