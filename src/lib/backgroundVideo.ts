import { useEffect, type RefObject } from "react";

/**
 * Reproduce un video de fondo y lo pausa cuando sale de pantalla.
 *
 * En movil no basta con `autoPlay` + `muted` + `playsInline`. `play()` devuelve
 * una promesa que puede rechazarse por varios motivos -- todavia no hay datos
 * suficientes, ahorro de energia, politica de reproduccion -- y si solo se
 * intenta una vez, el video se queda congelado en el poster sin ningun aviso.
 *
 * Por eso aqui se intenta en cuatro momentos: al entrar en pantalla, cuando el
 * elemento avisa de que ya tiene datos, y como ultimo recurso en la primera
 * interaccion del usuario, que es lo unico que desbloquea la reproduccion en los
 * navegadores mas restrictivos.
 *
 * `el.muted = true` antes de cada intento no es redundante: iOS mira la
 * propiedad en el momento de reproducir, no el atributo del HTML, y React
 * asigna esa propiedad despues de insertar el elemento.
 */
export function useBackgroundVideo(
  ref: RefObject<HTMLVideoElement | null>,
  enabled: boolean,
) {
  useEffect(() => {
    const el = ref.current;
    if (!el || !enabled) return;

    let visible = false;
    const tryPlay = () => {
      if (!visible) return;
      el.muted = true;
      void el.play().catch(() => {});
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible) tryPlay();
        else el.pause();
      },
      { threshold: 0.1 },
    );
    io.observe(el);

    const ready = ["loadeddata", "canplay", "canplaythrough"] as const;
    for (const e of ready) el.addEventListener(e, tryPlay);

    const onGesture = () => tryPlay();
    window.addEventListener("touchstart", onGesture, { passive: true });
    window.addEventListener("pointerdown", onGesture, { passive: true });

    tryPlay();

    return () => {
      io.disconnect();
      for (const e of ready) el.removeEventListener(e, tryPlay);
      window.removeEventListener("touchstart", onGesture);
      window.removeEventListener("pointerdown", onGesture);
    };
  }, [ref, enabled]);
}
