import { useEffect, useState } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

export interface MotionState {
  /** false hasta que se resuelve en cliente, para casar con el render de servidor. */
  reduced: boolean;
  /** true una vez leída la preferencia real. Ninguna animación arranca antes. */
  resolved: boolean;
}

/**
 * La página se renderiza en servidor, donde no hay matchMedia. Si dejáramos que
 * las animaciones arrancasen con el valor provisional, GSAP movería nodos del
 * DOM (pin-spacer) y React fallaría al desmontar ese árbol al corregir el flag.
 * Por eso los efectos esperan a `resolved`.
 */
export function useMotion(): MotionState {
  const [state, setState] = useState<MotionState>({ reduced: false, resolved: false });
  useEffect(() => {
    const mq = window.matchMedia(QUERY);
    setState({ reduced: mq.matches, resolved: true });
    const onChange = (e: MediaQueryListEvent) => setState({ reduced: e.matches, resolved: true });
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return state;
}

export function useReducedMotion(): boolean {
  return useMotion().reduced;
}

export const finePointer = () =>
  typeof window !== "undefined" && window.matchMedia("(pointer: fine)").matches;
