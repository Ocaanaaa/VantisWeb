import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { useState, useEffect, useRef, Suspense, lazy } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { c as copy } from "./router-gdhSznwu.js";
import { motion } from "framer-motion";
const images = {
  master: { id: "master", src: "/media/master.webp", w: 2752, h: 1536, alt: "Porsche 911 GT3 RS en tres cuartos delantero sobre asfalto húmedo de una carretera costera, con el mar al fondo en hora dorada." },
  rearThreeQuarter: { id: "rearThreeQuarter", src: "/media/rearThreeQuarter.webp", w: 2048, h: 1152, alt: "Tres cuartos trasero del gran turismo, zaga ancha y piloto corrido, luz baja de hora dorada." },
  cabin: { id: "cabin", src: "/media/cabin.webp", w: 2048, h: 1152, alt: "Habitáculo visto desde el asiento del conductor, cuero negro y aluminio cepillado con luz lateral dura." },
  wheelDash: { id: "wheelDash", src: "/media/wheelDash.webp", w: 2048, h: 1152, alt: "Volante y salpicadero, cuero con costura y radios de aluminio, centro del volante liso y sin emblema." },
  seat: { id: "seat", src: "/media/seat.webp", w: 2048, h: 1152, alt: "Butaca de cuero negro con costura de contraste y raíl de aluminio, luz rasante." },
  wheelArch: { id: "wheelArch", src: "/media/wheelArch.webp", w: 2048, h: 1152, alt: "Paso de rueda y llanta de aleación oscura sobre asfalto húmedo, flanco gris grafito mate." }
};
const details = {
  brake: { id: "brake", src: "/media/brake.webp", w: 2048, h: 2048, alt: "Pinza de freno y disco perforado en macro, metal mecanizado y sombra dura." }
};
const cutouts = {
  car: { src: "/media/car.webp", w: 2048, h: 1152, alt: "Gran turismo gris grafito mate recortado en tres cuartos, sin fondo." }
};
const film = {
  src: "/media/film.mp4",
  w: 1344,
  h: 768,
  poster: images.master.src
};
const QUERY = "(prefers-reduced-motion: reduce)";
function useMotion() {
  const [state, setState] = useState({ reduced: false, resolved: false });
  useEffect(() => {
    const mq = window.matchMedia(QUERY);
    setState({ reduced: mq.matches, resolved: true });
    const onChange = (e) => setState({ reduced: e.matches, resolved: true });
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return state;
}
function useReducedMotion() {
  return useMotion().reduced;
}
const finePointer = () => typeof window !== "undefined" && window.matchMedia("(pointer: fine)").matches;
let registered = false;
function ensureScrollTrigger() {
  if (!registered && typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
    registered = true;
  }
  return ScrollTrigger;
}
function useSmoothScroll() {
  const { reduced, resolved } = useMotion();
  useEffect(() => {
    ensureScrollTrigger();
    if (!resolved) return;
    if (reduced) {
      ScrollTrigger.refresh();
      return;
    }
    const lenis = new Lenis({ duration: 0.9, easing: (t) => 1 - Math.pow(1 - t, 3), smoothWheel: true });
    lenis.on("scroll", ScrollTrigger.update);
    const raf = (time) => lenis.raf(time * 1e3);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);
    const onClick = (e) => {
      const a = e.target?.closest?.('a[href^="#"]');
      if (!a) return;
      const id = a.getAttribute("href");
      if (!id || id === "#") return;
      const el = document.querySelector(id);
      if (!el) return;
      e.preventDefault();
      lenis.scrollTo(el, { offset: 0 });
    };
    document.addEventListener("click", onClick);
    ScrollTrigger.refresh();
    return () => {
      document.removeEventListener("click", onClick);
      gsap.ticker.remove(raf);
      lenis.destroy();
    };
  }, [reduced, resolved]);
}
function Cursor() {
  const dot = useRef(null);
  const ring = useRef(null);
  const { reduced, resolved } = useMotion();
  useEffect(() => {
    if (!resolved || reduced || !finePointer()) return;
    document.documentElement.classList.add("has-custom-cursor");
    const pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const ringPos = { ...pos };
    let raf = 0;
    const onMove = (e) => {
      pos.x = e.clientX;
      pos.y = e.clientY;
      const interactive = e.target?.closest?.(
        'a, button, input, textarea, select, [role="button"], [data-cursor="grow"]'
      );
      ring.current?.classList.toggle("is-active", Boolean(interactive));
    };
    const tick = () => {
      ringPos.x += (pos.x - ringPos.x) * 0.35;
      ringPos.y += (pos.y - ringPos.y) * 0.35;
      if (dot.current) dot.current.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`;
      if (ring.current) ring.current.style.transform = `translate3d(${ringPos.x}px, ${ringPos.y}px, 0)`;
      raf = requestAnimationFrame(tick);
    };
    const onLeave = () => ring.current?.classList.add("is-hidden");
    const onEnter = () => ring.current?.classList.remove("is-hidden");
    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    document.addEventListener("pointerenter", onEnter);
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("pointerenter", onEnter);
      document.documentElement.classList.remove("has-custom-cursor");
    };
  }, [reduced, resolved]);
  if (reduced) return null;
  return /* @__PURE__ */ jsxs("div", { "aria-hidden": "true", className: "pointer-events-none fixed inset-0 z-[100] hidden md:block", children: [
    /* @__PURE__ */ jsx("span", { ref: dot, className: "absolute -left-[2px] -top-[2px] block h-1 w-1 rounded-full bg-port will-change-transform" }),
    /* @__PURE__ */ jsx("span", { ref: ring, className: "cursor-ring absolute -left-4 -top-4 block h-8 w-8 rounded-full border border-graphite/40 will-change-transform" })
  ] });
}
function Mark({ className = "", accent = true }) {
  return /* @__PURE__ */ jsxs("svg", { viewBox: "10 14 80 73", className, fill: "none", "aria-hidden": "true", focusable: "false", children: [
    /* @__PURE__ */ jsx("polygon", { points: "10,14 27,14 50,87", className: "fill-port" }),
    /* @__PURE__ */ jsx("polygon", { points: "78,14 90,14 50,87", className: "fill-port" }),
    accent ? /* @__PURE__ */ jsx("polygon", { points: "50,16.5 58.5,25 50,33.5 41.5,25", className: "fill-port-soft" }) : null
  ] });
}
function Logo({
  variant = "wordmark",
  className = ""
}) {
  const label = copy.meta.brand;
  if (variant === "mark") return /* @__PURE__ */ jsx(Mark, { className });
  return /* @__PURE__ */ jsxs("span", { className: `inline-flex items-baseline gap-2.5 ${className}`, "aria-label": label, children: [
    /* @__PURE__ */ jsx(Mark, { className: "h-[0.92em] w-[1.01em] shrink-0 translate-y-[0.06em]" }),
    /* @__PURE__ */ jsx("span", { className: "logotype", children: label })
  ] });
}
function Nav() {
  const { nav } = copy;
  const [solid, setSolid] = useState(false);
  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > window.innerHeight * 0.6);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return /* @__PURE__ */ jsxs("header", { className: `fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${solid ? "border-b border-steel/20 bg-bone/85 backdrop-blur-md" : "border-b border-transparent bg-transparent"}`, children: [
    /* @__PURE__ */ jsx("a", { href: "#proceso", className: "sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-graphite focus:px-4 focus:py-2 focus:font-mono focus:text-[11px] focus:text-bone", children: "Saltar al contenido" }),
    /* @__PURE__ */ jsxs("nav", { "aria-label": "Principal", className: "mx-auto flex w-full max-w-[1440px] items-center justify-between px-5 py-4 md:px-10 md:py-5", children: [
      /* @__PURE__ */ jsx("a", { href: "#inicio", className: "flex items-baseline", children: /* @__PURE__ */ jsx(Logo, { className: "text-[15px] md:text-[17px]" }) }),
      /* @__PURE__ */ jsx("ul", { className: "hidden items-center gap-7 md:flex", children: nav.links.map((l) => /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx("a", { href: `#${l.id}`, className: "font-mono text-[10px] uppercase tracking-label text-steel transition-colors hover:text-graphite", children: l.label }) }, l.id)) }),
      /* @__PURE__ */ jsxs("a", { href: "#encargo", className: "inline-flex items-center gap-2 bg-graphite px-4 py-2.5 font-mono text-[10px] uppercase tracking-label text-bone transition-transform duration-300 hover:-translate-y-0.5 md:px-5", children: [
        nav.cta,
        /* @__PURE__ */ jsx("span", { className: "inline-block h-px w-4 bg-port" })
      ] })
    ] })
  ] });
}
const DepthField = lazy(() => import("./DepthField-CQXo3gtS.js"));
function Hero() {
  const { hero } = copy;
  const root = useRef(null);
  const carWrap = useRef(null);
  const type = useRef(null);
  const glare = useRef(null);
  const { reduced, resolved } = useMotion();
  useEffect(() => {
    if (!resolved || reduced || !root.current) return;
    const ctx = gsap.context(() => {
      gsap.from("[data-hero-line]", { yPercent: 108, duration: 0.72, ease: "expo.out", stagger: 0.055, delay: 0.12 });
      gsap.from("[data-hero-meta]", { opacity: 0, y: 14, duration: 0.5, ease: "power3.out", stagger: 0.06, delay: 0.42 });
      gsap.from("[data-hero-car]", { opacity: 0, scale: 1.06, duration: 0.9, ease: "expo.out", delay: 0.1 });
    }, root);
    return () => ctx.revert();
  }, [reduced, resolved]);
  useEffect(() => {
    if (!resolved || reduced || !finePointer()) return;
    const carQx = gsap.quickTo(carWrap.current, "x", { duration: 0.5, ease: "power3.out" });
    const carQy = gsap.quickTo(carWrap.current, "y", { duration: 0.5, ease: "power3.out" });
    const typeQx = gsap.quickTo(type.current, "x", { duration: 0.6, ease: "power3.out" });
    const typeQy = gsap.quickTo(type.current, "y", { duration: 0.6, ease: "power3.out" });
    const onMove = (e) => {
      const nx = e.clientX / window.innerWidth * 2 - 1;
      const ny = e.clientY / window.innerHeight * 2 - 1;
      carQx(nx * 26);
      carQy(ny * 14);
      typeQx(nx * -12);
      typeQy(ny * -7);
      if (glare.current) {
        glare.current.style.setProperty("--gx", `${(nx + 1) / 2 * 100}%`);
        glare.current.style.setProperty("--gy", `${(ny + 1) / 2 * 100}%`);
      }
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [reduced, resolved]);
  const car = cutouts.car;
  return /* @__PURE__ */ jsxs("section", { ref: root, id: "inicio", className: "relative min-h-[100svh] w-full overflow-hidden bg-bone pb-16 pt-24 md:pb-0 md:pt-28", children: [
    /* @__PURE__ */ jsx(Suspense, { fallback: null, children: /* @__PURE__ */ jsx(DepthField, {}) }),
    /* @__PURE__ */ jsx("div", { className: "relative z-20 mx-auto w-full max-w-[1440px] px-5 md:px-10", children: /* @__PURE__ */ jsxs("div", { className: "grid-page items-start", children: [
      /* @__PURE__ */ jsxs("div", { className: "col-span-4 md:col-span-8", children: [
        /* @__PURE__ */ jsx("p", { "data-hero-meta": true, className: "label mb-6 md:mb-10", children: hero.eyebrow }),
        /* @__PURE__ */ jsxs("h1", { ref: type, className: "display text-[13.5vw] md:text-[8vw] xl:text-[118px]", children: [
          hero.headline.map((line) => /* @__PURE__ */ jsx("span", { className: "block overflow-hidden", children: /* @__PURE__ */ jsx("span", { "data-hero-line": true, className: "block", children: line }) }, line)),
          /* @__PURE__ */ jsx("span", { className: "block overflow-hidden", children: /* @__PURE__ */ jsx("span", { "data-hero-line": true, className: "block text-port-ink", children: hero.headlineAccent }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "col-span-4 mt-10 md:col-span-4 md:col-start-9 md:mt-24", children: [
        /* @__PURE__ */ jsx("p", { "data-hero-meta": true, className: "max-w-[46ch] text-[15px] leading-[1.5] text-steel", children: hero.body }),
        /* @__PURE__ */ jsxs("div", { "data-hero-meta": true, className: "mt-8 flex flex-wrap items-center gap-3", children: [
          /* @__PURE__ */ jsxs("a", { href: "#encargo", className: "group inline-flex items-center gap-3 bg-graphite px-6 py-4 font-mono text-[11px] uppercase tracking-label text-bone transition-transform duration-300 hover:-translate-y-0.5", children: [
            hero.ctaPrimary,
            /* @__PURE__ */ jsx("span", { className: "inline-block h-px w-6 bg-port transition-all duration-300 group-hover:w-9" })
          ] }),
          /* @__PURE__ */ jsx("a", { href: "#proceso", className: "inline-flex items-center gap-3 border border-steel/40 px-6 py-4 font-mono text-[11px] uppercase tracking-label text-graphite transition-colors duration-300 hover:border-graphite", children: hero.ctaSecondary })
        ] }),
        /* @__PURE__ */ jsxs("div", { "data-hero-meta": true, className: "rule mt-10 flex items-baseline gap-4 pt-4", children: [
          /* @__PURE__ */ jsx("span", { className: "label", children: hero.plateLabel }),
          /* @__PURE__ */ jsx("span", { className: "font-mono text-[13px] tracking-[0.12em] text-graphite", children: hero.plateValue })
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsx("div", { ref: carWrap, "data-hero-car": true, className: "pointer-events-none relative z-10 mt-10 w-full will-change-transform md:absolute md:bottom-0 md:right-0 md:mt-0 md:w-[58%]", children: /* @__PURE__ */ jsxs("div", { ref: glare, className: "relative w-full", children: [
      /* @__PURE__ */ jsx("img", { src: car.src, alt: car.alt, width: car.w, height: car.h, decoding: "async", className: "h-auto w-full select-none object-contain" }),
      /* @__PURE__ */ jsx("span", { "aria-hidden": "true", className: "glare-sheet" })
    ] }) }),
    /* @__PURE__ */ jsxs("div", { className: "pointer-events-none absolute inset-x-0 bottom-6 z-20 mx-auto hidden max-w-[1440px] items-center gap-3 px-5 md:flex md:px-10", children: [
      /* @__PURE__ */ jsx("span", { className: "label", children: hero.scrollHint }),
      /* @__PURE__ */ jsx("span", { className: "h-px w-16 bg-steel/40" })
    ] })
  ] });
}
function Figures() {
  const { figures } = copy;
  return /* @__PURE__ */ jsx("section", { "aria-label": figures.title, className: "relative z-20 border-y border-steel/20 bg-bone py-14 md:py-20", children: /* @__PURE__ */ jsxs("div", { className: "mx-auto w-full max-w-[1440px] px-5 md:px-10", children: [
    /* @__PURE__ */ jsx("p", { className: "label mb-10", children: figures.title }),
    /* @__PURE__ */ jsx("ul", { className: "grid-page gap-y-12", children: figures.items.map((item, i) => /* @__PURE__ */ jsxs("li", { className: "col-span-4 md:col-span-3", children: [
      /* @__PURE__ */ jsx(Counter, { value: item.value, suffix: item.suffix, index: i }),
      /* @__PURE__ */ jsx("p", { className: "mt-4 max-w-[24ch] text-[13px] leading-[1.45] text-graphite", children: item.label }),
      /* @__PURE__ */ jsx("p", { className: "mt-2 max-w-[26ch] font-mono text-[10px] leading-[1.5] text-steel", children: item.note })
    ] }, item.id)) })
  ] }) });
}
function Counter({ value, suffix, index: index2 }) {
  const el = useRef(null);
  const { reduced, resolved } = useMotion();
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    if (!resolved) return;
    if (reduced) {
      setDisplay(value);
      return;
    }
    const ST = ensureScrollTrigger();
    const node = el.current;
    if (!node) return;
    const obj = { n: 0 };
    const st = ST.create({
      trigger: node,
      start: "top 85%",
      once: true,
      onEnter: () => {
        gsap.to(obj, { n: value, duration: 1, ease: "expo.out", delay: index2 * 0.06, onUpdate: () => setDisplay(Math.round(obj.n)) });
      }
    });
    return () => st.kill();
  }, [value, index2, reduced, resolved]);
  return /* @__PURE__ */ jsxs("p", { ref: el, className: "display flex items-baseline text-[15vw] leading-none md:text-[4.4vw]", children: [
    /* @__PURE__ */ jsx("span", { className: "tabular-nums", children: display }),
    suffix ? /* @__PURE__ */ jsx("span", { className: "text-port-ink", children: suffix }) : null
  ] });
}
const STEP_IMAGES = [images.master, images.rearThreeQuarter, images.wheelArch, images.cabin, images.wheelDash];
function HowItWorks() {
  const { how } = copy;
  const root = useRef(null);
  const layers = useRef([]);
  const { reduced, resolved } = useMotion();
  useEffect(() => {
    if (!resolved || reduced || !root.current) return;
    const ST = ensureScrollTrigger();
    const ctx = gsap.context(() => {
      const setActive = (i) => {
        layers.current.forEach((layer, j) => {
          if (layer) gsap.to(layer, { opacity: j === i ? 1 : 0, duration: 0.18, ease: "none" });
        });
        gsap.to("[data-step-progress]", { scaleY: (i + 1) / STEP_IMAGES.length, duration: 0.35, ease: "power3.out" });
      };
      ST.create({ trigger: "[data-pin-wrap]", start: "top top", end: "bottom bottom", pin: "[data-pin-target]", pinSpacing: false });
      gsap.utils.toArray("[data-step]").forEach((step, i) => {
        ST.create({ trigger: step, start: "top 60%", end: "bottom 60%", onToggle: (self) => {
          if (self.isActive) setActive(i);
        } });
        gsap.from(step, { opacity: 0, y: 26, duration: 0.55, ease: "power3.out", scrollTrigger: { trigger: step, start: "top 88%", once: true } });
      });
    }, root);
    return () => ctx.revert();
  }, [reduced, resolved]);
  return /* @__PURE__ */ jsx("section", { ref: root, id: "proceso", className: "relative bg-bone py-20 md:py-28", children: /* @__PURE__ */ jsxs("div", { className: "mx-auto w-full max-w-[1440px] px-5 md:px-10", children: [
    /* @__PURE__ */ jsxs("header", { className: "mb-14 md:mb-20", children: [
      /* @__PURE__ */ jsx("p", { className: "label mb-5", children: how.eyebrow }),
      /* @__PURE__ */ jsx("h2", { className: "display max-w-[14ch] text-[9vw] md:text-[5.4vw]", children: how.title })
    ] }),
    /* @__PURE__ */ jsxs("div", { "data-pin-wrap": true, className: "grid-page relative items-start", children: [
      /* @__PURE__ */ jsx("div", { className: "col-span-4 md:col-span-6", children: /* @__PURE__ */ jsxs("div", { "data-pin-target": true, className: "relative hidden aspect-[4/5] w-full overflow-hidden bg-graphite md:block", children: [
        STEP_IMAGES.map((img, i) => /* @__PURE__ */ jsx(
          "img",
          {
            ref: (n) => {
              layers.current[i] = n;
            },
            src: img.src,
            alt: img.alt,
            width: img.w,
            height: img.h,
            loading: "lazy",
            decoding: "async",
            className: "absolute inset-0 h-full w-full object-cover",
            style: { opacity: i === 0 ? 1 : 0 }
          },
          img.id
        )),
        /* @__PURE__ */ jsx("div", { className: "pointer-events-none absolute inset-0 border border-bone/10" }),
        /* @__PURE__ */ jsx("div", { className: "absolute bottom-0 left-0 h-full w-px bg-bone/15", children: /* @__PURE__ */ jsx("span", { "data-step-progress": true, className: "block h-full w-full origin-top bg-port", style: { transform: "scaleY(0.2)" } }) })
      ] }) }),
      /* @__PURE__ */ jsx("ol", { className: "col-span-4 md:col-span-5 md:col-start-8", children: how.steps.map((step, i) => /* @__PURE__ */ jsxs("li", { "data-step": true, className: "border-t border-steel/25 py-8 first:border-t-0 md:py-14", children: [
        /* @__PURE__ */ jsx("div", { className: "mb-6 aspect-[16/10] w-full overflow-hidden bg-graphite md:hidden", children: /* @__PURE__ */ jsx("img", { src: STEP_IMAGES[i].src, alt: STEP_IMAGES[i].alt, width: STEP_IMAGES[i].w, height: STEP_IMAGES[i].h, loading: "lazy", decoding: "async", className: "h-full w-full object-cover" }) }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-baseline gap-4", children: [
          /* @__PURE__ */ jsx("span", { className: "font-mono text-[11px] text-port-ink", children: step.n }),
          /* @__PURE__ */ jsx("h3", { className: "display text-[8vw] md:text-[2.4vw]", children: step.title })
        ] }),
        /* @__PURE__ */ jsx("p", { className: "mt-4 max-w-[44ch] text-[15px] leading-[1.55] text-steel", children: step.body }),
        /* @__PURE__ */ jsx("p", { className: "mt-4 font-mono text-[10px] uppercase tracking-label text-graphite", children: step.data })
      ] }, step.n)) })
    ] })
  ] }) });
}
function Showreel() {
  const { showreel } = copy;
  const [reduced, setReduced] = useState(null);
  const video = useRef(null);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  useEffect(() => {
    const el = video.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) void el.play().catch(() => {
        });
        else el.pause();
      },
      { threshold: 0.15 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduced]);
  return /* @__PURE__ */ jsxs("section", { id: "film", "aria-label": showreel.eyebrow, className: "relative isolate overflow-hidden bg-graphite text-bone", children: [
    /* @__PURE__ */ jsxs("div", { className: "absolute inset-0 -z-10", children: [
      reduced === false ? /* @__PURE__ */ jsx(
        "video",
        {
          ref: video,
          src: film.src,
          poster: film.poster,
          width: film.w,
          height: film.h,
          autoPlay: true,
          muted: true,
          loop: true,
          playsInline: true,
          preload: "metadata",
          "aria-hidden": "true",
          className: "h-full w-full object-cover"
        }
      ) : /* @__PURE__ */ jsx("img", { src: film.poster, alt: "", "aria-hidden": "true", className: "h-full w-full object-cover" }),
      /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-graphite/70" }),
      /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-graphite via-transparent to-graphite/80" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mx-auto flex min-h-[66svh] w-full max-w-[1440px] flex-col justify-end px-5 py-24 md:px-10 md:py-32", children: [
      /* @__PURE__ */ jsx("p", { className: "label text-bone/60", children: showreel.eyebrow }),
      /* @__PURE__ */ jsx("h2", { className: "display mt-5 max-w-[18ch] text-[11vw] md:text-[5vw]", children: showreel.title }),
      /* @__PURE__ */ jsx("p", { className: "mt-6 max-w-[52ch] text-[15px] leading-[1.5] text-bone/70", children: showreel.body }),
      /* @__PURE__ */ jsxs("div", { className: "mt-9 flex flex-wrap items-center gap-3", children: [
        /* @__PURE__ */ jsxs("a", { href: "#encargo", className: "group inline-flex items-center gap-3 bg-bone px-6 py-4 font-mono text-[11px] uppercase tracking-label text-graphite transition-transform duration-300 hover:-translate-y-0.5", children: [
          showreel.cta,
          /* @__PURE__ */ jsx("span", { className: "inline-block h-px w-6 bg-port-ink transition-all duration-300 group-hover:w-9" })
        ] }),
        /* @__PURE__ */ jsx("a", { href: "#disponibles", className: "inline-flex items-center gap-3 border border-bone/30 px-6 py-4 font-mono text-[11px] uppercase tracking-label text-bone transition-colors duration-300 hover:border-port hover:text-port", children: showreel.ctaSecondary })
      ] })
    ] })
  ] });
}
function Available() {
  const { available } = copy;
  return /* @__PURE__ */ jsx("section", { id: "disponibles", className: "bg-bone py-20 md:py-28", children: /* @__PURE__ */ jsxs("div", { className: "mx-auto w-full max-w-[1440px] px-5 md:px-10", children: [
    /* @__PURE__ */ jsx("p", { className: "label", children: available.eyebrow }),
    /* @__PURE__ */ jsx("h2", { className: "display mt-4 max-w-[14ch] text-[12vw] md:text-[4.6vw]", children: available.title }),
    /* @__PURE__ */ jsx("p", { className: "mt-6 max-w-[62ch] text-[15px] leading-[1.5] text-steel", children: available.body }),
    /* @__PURE__ */ jsx("ul", { className: "mt-14 border-t border-steel/25", children: available.items.map((u) => /* @__PURE__ */ jsx("li", { className: "rule group border-t-0 border-b border-steel/25 py-6 md:py-7", children: /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-4 items-baseline gap-x-4 gap-y-3 md:grid-cols-12 md:gap-x-6", children: [
      /* @__PURE__ */ jsxs("p", { className: "col-span-4 md:col-span-4", children: [
        /* @__PURE__ */ jsx("span", { className: "mr-3 font-mono text-[10px] uppercase tracking-label text-steel", children: u.id }),
        /* @__PURE__ */ jsx("span", { className: "display text-[19px] md:text-[21px]", children: u.model })
      ] }),
      /* @__PURE__ */ jsx(Cell, { className: "md:col-span-1", label: available.labels.year, value: u.year }),
      /* @__PURE__ */ jsx(Cell, { className: "md:col-span-2", label: available.labels.km, value: u.km }),
      /* @__PURE__ */ jsx(Cell, { className: "md:col-span-2", label: available.labels.market, value: u.market }),
      /* @__PURE__ */ jsx(Cell, { className: "md:col-span-2", label: available.labels.price, value: u.price, strong: true }),
      /* @__PURE__ */ jsx("p", { className: "col-span-4 md:col-span-1 md:text-right", children: /* @__PURE__ */ jsx(
        "span",
        {
          className: `inline-block border px-2 py-1 font-mono text-[10px] uppercase tracking-label ${u.reserved ? "border-steel/40 text-steel" : "border-port-ink/50 text-port-ink"}`,
          children: u.reserved ? available.status.reserved : available.status.available
        }
      ) })
    ] }) }, u.id)) }),
    /* @__PURE__ */ jsxs("div", { className: "mt-10 flex flex-col gap-6 md:flex-row md:items-start md:justify-between", children: [
      /* @__PURE__ */ jsx("p", { className: "max-w-[62ch] font-mono text-[11px] leading-[1.6] text-steel", children: available.note }),
      /* @__PURE__ */ jsxs("a", { href: "#encargo", className: "group inline-flex shrink-0 items-center gap-3 bg-graphite px-6 py-4 font-mono text-[11px] uppercase tracking-label text-bone transition-transform duration-300 hover:-translate-y-0.5", children: [
        available.cta,
        /* @__PURE__ */ jsx("span", { className: "inline-block h-px w-6 bg-port transition-all duration-300 group-hover:w-9" })
      ] })
    ] })
  ] }) });
}
function Cell({ label, value, className = "", strong = false }) {
  return /* @__PURE__ */ jsxs("p", { className: `col-span-2 ${className}`, children: [
    /* @__PURE__ */ jsx("span", { className: "block font-mono text-[9px] uppercase tracking-label text-steel", children: label }),
    /* @__PURE__ */ jsx("span", { className: `mt-1 block text-[14px] ${strong ? "text-graphite" : "text-steel"}`, children: value })
  ] });
}
function Team() {
  const { team } = copy;
  return /* @__PURE__ */ jsx("section", { id: "equipo", className: "bg-graphite py-20 text-bone md:py-28", children: /* @__PURE__ */ jsxs("div", { className: "mx-auto w-full max-w-[1440px] px-5 md:px-10", children: [
    /* @__PURE__ */ jsx("p", { className: "label text-bone/60", children: team.eyebrow }),
    /* @__PURE__ */ jsx("h2", { className: "display mt-4 max-w-[16ch] text-[12vw] md:text-[4.6vw]", children: team.title }),
    /* @__PURE__ */ jsx("p", { className: "mt-6 max-w-[56ch] text-[15px] leading-[1.5] text-bone/70", children: team.body }),
    /* @__PURE__ */ jsx("div", { className: "mt-14 grid gap-px border border-bone/15 bg-bone/15 md:grid-cols-2", children: team.members.map((m, i) => /* @__PURE__ */ jsxs("article", { className: "flex flex-col gap-5 bg-graphite p-8 md:p-10", children: [
      /* @__PURE__ */ jsx("span", { "aria-hidden": "true", className: "flex h-14 w-14 shrink-0 items-center justify-center border border-port/45 font-mono text-[15px] tracking-[0.1em] text-port", children: m.initials }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h3", { className: "display text-[26px] md:text-[30px]", children: m.name }),
        /* @__PURE__ */ jsx("p", { className: "label mt-2 text-port", children: m.role })
      ] }),
      /* @__PURE__ */ jsx("p", { className: "max-w-[46ch] text-[15px] leading-[1.55] text-bone/70", children: m.bio }),
      /* @__PURE__ */ jsx("a", { href: `mailto:${m.email}`, className: "mt-auto inline-block font-mono text-[11px] text-bone/80 underline-offset-4 transition-colors hover:text-port hover:underline", children: m.email })
    ] }, i)) })
  ] }) });
}
const CARD_IMAGES = [images.master, images.cabin, images.wheelArch, images.rearThreeQuarter, details.brake, images.seat];
function Deliveries() {
  const { deliveries } = copy;
  return /* @__PURE__ */ jsx("section", { id: "entregas", className: "relative bg-bone py-20 md:py-28", children: /* @__PURE__ */ jsxs("div", { className: "mx-auto w-full max-w-[1440px] px-5 md:px-10", children: [
    /* @__PURE__ */ jsxs("header", { className: "grid-page mb-12 items-end md:mb-16", children: [
      /* @__PURE__ */ jsxs("div", { className: "col-span-4 md:col-span-7", children: [
        /* @__PURE__ */ jsx("p", { className: "label mb-5", children: deliveries.eyebrow }),
        /* @__PURE__ */ jsx("h2", { className: "display text-[13vw] md:text-[5.4vw]", children: deliveries.title })
      ] }),
      /* @__PURE__ */ jsx("p", { className: "col-span-4 mt-6 max-w-[40ch] text-[14px] leading-[1.5] text-steel md:col-span-4 md:col-start-9 md:mt-0", children: deliveries.body })
    ] }),
    /* @__PURE__ */ jsx("ul", { className: "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3", children: deliveries.items.map((item, i) => /* @__PURE__ */ jsx(TiltCard, { item, img: CARD_IMAGES[i % CARD_IMAGES.length], labels: deliveries.cardLabels }, item.id)) })
  ] }) });
}
function TiltCard({ item, img, labels }) {
  const ref = useRef(null);
  const reduced = useReducedMotion();
  const onMove = (e) => {
    if (reduced || !finePointer()) return;
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `perspective(900px) rotateX(${py * -7}deg) rotateY(${px * 9}deg) translateZ(0)`;
  };
  const reset = () => {
    if (ref.current) ref.current.style.transform = "perspective(900px) rotateX(0deg) rotateY(0deg)";
  };
  return /* @__PURE__ */ jsx(
    motion.li,
    {
      initial: reduced ? false : { opacity: 0, y: 22 },
      whileInView: reduced ? void 0 : { opacity: 1, y: 0 },
      viewport: { once: true, margin: "-12% 0px" },
      transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] },
      className: "group",
      children: /* @__PURE__ */ jsxs(
        "article",
        {
          ref,
          onPointerMove: onMove,
          onPointerLeave: reset,
          tabIndex: 0,
          "data-cursor": "grow",
          className: "h-full border border-steel/25 bg-bone transition-[border-color,transform] duration-300 will-change-transform hover:border-graphite focus-visible:border-graphite",
          style: { transform: "perspective(900px)" },
          children: [
            /* @__PURE__ */ jsxs("div", { className: "relative aspect-[4/3] w-full overflow-hidden bg-graphite", children: [
              /* @__PURE__ */ jsx("img", { src: img.src, alt: img.alt, width: img.w, height: img.h, loading: "lazy", decoding: "async", className: "h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" }),
              /* @__PURE__ */ jsx("span", { className: "absolute left-0 top-0 bg-graphite px-3 py-2 font-mono text-[10px] tracking-[0.12em] text-bone", children: item.id })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "p-5 md:p-6", children: [
              /* @__PURE__ */ jsx("h3", { className: "display text-[6.5vw] leading-none sm:text-[2.6vw] lg:text-[1.6vw]", children: item.title }),
              /* @__PURE__ */ jsxs("dl", { className: "mt-5 space-y-2", children: [
                /* @__PURE__ */ jsx(Row$1, { label: labels.origin, value: item.origin }),
                /* @__PURE__ */ jsx(Row$1, { label: labels.km, value: item.km, mono: true }),
                /* @__PURE__ */ jsx(Row$1, { label: labels.weeks, value: item.weeks, mono: true }),
                /* @__PURE__ */ jsx(Row$1, { label: labels.vin, value: item.vin, mono: true })
              ] })
            ] })
          ]
        }
      )
    }
  );
}
function Row$1({ label, value, mono }) {
  return /* @__PURE__ */ jsxs("div", { className: "flex items-baseline justify-between gap-4 border-t border-steel/15 pt-2", children: [
    /* @__PURE__ */ jsx("dt", { className: "label", children: label }),
    /* @__PURE__ */ jsx("dd", { className: mono ? "font-mono text-[11px] tracking-[0.06em] text-graphite" : "text-[13px] text-graphite", children: value })
  ] });
}
function Markets() {
  const { markets } = copy;
  const reduced = useReducedMotion();
  const [ue, us] = markets.routes;
  return /* @__PURE__ */ jsx("section", { id: "mercados", className: "relative overflow-hidden bg-graphite py-20 text-bone md:py-28", children: /* @__PURE__ */ jsxs("div", { className: "mx-auto w-full max-w-[1440px] px-5 md:px-10", children: [
    /* @__PURE__ */ jsxs("header", { className: "grid-page mb-14 items-end md:mb-20", children: [
      /* @__PURE__ */ jsxs("div", { className: "col-span-4 md:col-span-7", children: [
        /* @__PURE__ */ jsx("p", { className: "label mb-5", children: markets.eyebrow }),
        /* @__PURE__ */ jsx("h2", { className: "display text-[13vw] md:text-[5.4vw]", children: markets.title })
      ] }),
      /* @__PURE__ */ jsx("p", { className: "col-span-4 mt-6 max-w-[42ch] text-[14px] leading-[1.55] text-bone/60 md:col-span-4 md:col-start-9 md:mt-0", children: markets.body })
    ] }),
    /* @__PURE__ */ jsxs("figure", { className: "mb-14 hidden border border-bone/15 md:mb-20 md:block", children: [
      /* @__PURE__ */ jsxs(
        "svg",
        {
          viewBox: "0 0 1000 280",
          preserveAspectRatio: "xMidYMid meet",
          className: "h-auto w-full",
          role: "img",
          "aria-label": `${ue.name} ${ue.transit}, ${us.name} ${us.transit}, con destino ${markets.destination}.`,
          children: [
            /* @__PURE__ */ jsx("path", { d: "M232,68 C420,68 560,140 758,140", className: "stroke-bone/30", strokeWidth: "1", fill: "none" }),
            /* @__PURE__ */ jsx("path", { d: "M232,212 C420,212 560,140 758,140", className: "stroke-bone/30", strokeWidth: "1", fill: "none" }),
            /* @__PURE__ */ jsx("circle", { cx: "232", cy: "68", r: "3", className: "fill-bone/50" }),
            /* @__PURE__ */ jsx("circle", { cx: "232", cy: "212", r: "3", className: "fill-bone/50" }),
            /* @__PURE__ */ jsx("path", { d: "M748,134 L760,140 L748,146 Z", className: "fill-port" }),
            /* @__PURE__ */ jsxs("g", { children: [
              /* @__PURE__ */ jsx("rect", { x: "30", y: "26", width: "202", height: "84", className: "fill-none stroke-bone/25", strokeWidth: "1" }),
              /* @__PURE__ */ jsx("text", { x: "52", y: "70", className: "fill-bone font-display", fontSize: "30", letterSpacing: "1", children: ue.code }),
              /* @__PURE__ */ jsx("text", { x: "52", y: "94", className: "fill-bone/50 font-mono", fontSize: "13", children: ue.name })
            ] }),
            /* @__PURE__ */ jsxs("g", { children: [
              /* @__PURE__ */ jsx("rect", { x: "30", y: "170", width: "202", height: "84", className: "fill-none stroke-bone/25", strokeWidth: "1" }),
              /* @__PURE__ */ jsx("text", { x: "52", y: "214", className: "fill-bone font-display", fontSize: "30", letterSpacing: "1", children: us.code }),
              /* @__PURE__ */ jsx("text", { x: "52", y: "238", className: "fill-bone/50 font-mono", fontSize: "13", children: us.name })
            ] }),
            /* @__PURE__ */ jsx("text", { x: "491", y: "96", textAnchor: "middle", className: "fill-bone/70 font-mono", fontSize: "13", children: ue.transit }),
            /* @__PURE__ */ jsx("text", { x: "491", y: "198", textAnchor: "middle", className: "fill-bone/70 font-mono", fontSize: "13", children: us.transit }),
            /* @__PURE__ */ jsxs("g", { children: [
              /* @__PURE__ */ jsx("rect", { x: "758", y: "98", width: "212", height: "84", className: "fill-none stroke-port/70", strokeWidth: "1" }),
              /* @__PURE__ */ jsx("text", { x: "782", y: "142", className: "fill-port font-display", fontSize: "30", letterSpacing: "1", children: "ES" }),
              /* @__PURE__ */ jsx("text", { x: "782", y: "166", className: "fill-port/70 font-mono", fontSize: "13", children: markets.destination })
            ] })
          ]
        }
      ),
      /* @__PURE__ */ jsx("figcaption", { className: "label border-t border-bone/15 px-5 py-3", children: markets.diagramCaption })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "grid gap-px border border-bone/15 bg-bone/15 md:grid-cols-2", children: markets.routes.map((r, i) => /* @__PURE__ */ jsxs(
      motion.article,
      {
        initial: reduced ? false : { opacity: 0, y: 16 },
        whileInView: reduced ? void 0 : { opacity: 1, y: 0 },
        viewport: { once: true, margin: "-10% 0px" },
        transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1], delay: i * 0.06 },
        className: "bg-graphite p-8 md:p-10",
        children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-baseline justify-between gap-4", children: [
            /* @__PURE__ */ jsx("span", { className: "font-mono text-[11px] text-port", children: r.code }),
            /* @__PURE__ */ jsx("span", { className: "font-mono text-[10px] uppercase tracking-label text-bone/40", children: r.eu ? "UE" : "No UE" })
          ] }),
          /* @__PURE__ */ jsx("h3", { className: "display mt-4 text-[8vw] leading-none md:text-[2.6vw]", children: r.name }),
          /* @__PURE__ */ jsx("p", { className: "mt-5 max-w-[42ch] text-[14px] leading-[1.55] text-bone/60", children: r.note }),
          /* @__PURE__ */ jsxs("dl", { className: "mt-8 border-t border-bone/15", children: [
            /* @__PURE__ */ jsx(Row, { k: markets.labels.transit, v: r.transit, accent: true }),
            /* @__PURE__ */ jsx(Row, { k: markets.labels.duty, v: r.duty }),
            /* @__PURE__ */ jsx(Row, { k: markets.labels.approval, v: r.approval }),
            /* @__PURE__ */ jsx(Row, { k: markets.labels.sourcing, v: r.sourcing })
          ] })
        ]
      },
      r.code
    )) })
  ] }) });
}
function Row({ k, v, accent = false }) {
  return /* @__PURE__ */ jsxs("div", { className: "flex items-baseline justify-between gap-6 border-b border-bone/15 py-3.5", children: [
    /* @__PURE__ */ jsx("dt", { className: "font-mono text-[10px] uppercase tracking-label text-bone/40", children: k }),
    /* @__PURE__ */ jsx("dd", { className: `text-right font-mono text-[12px] ${accent ? "text-port" : "text-bone/80"}`, children: v })
  ] });
}
function Costs() {
  const { costs } = copy;
  const [eu, setEu] = useState(false);
  return /* @__PURE__ */ jsx("section", { id: "coste", className: "bg-bone py-20 md:py-28", children: /* @__PURE__ */ jsxs("div", { className: "mx-auto w-full max-w-[1440px] px-5 md:px-10", children: [
    /* @__PURE__ */ jsxs("header", { className: "grid-page mb-12 items-end", children: [
      /* @__PURE__ */ jsxs("div", { className: "col-span-4 md:col-span-6", children: [
        /* @__PURE__ */ jsx("p", { className: "label mb-5", children: costs.eyebrow }),
        /* @__PURE__ */ jsx("h2", { className: "display text-[13vw] md:text-[5.4vw]", children: costs.title })
      ] }),
      /* @__PURE__ */ jsx("p", { className: "col-span-4 mt-6 max-w-[44ch] text-[14px] leading-[1.55] text-steel md:col-span-5 md:col-start-8 md:mt-0", children: costs.body })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mb-8 flex flex-wrap items-center gap-4", children: [
      /* @__PURE__ */ jsx("span", { className: "label", children: costs.toggle.label }),
      /* @__PURE__ */ jsxs("div", { role: "radiogroup", "aria-label": costs.toggle.label, className: "inline-flex border border-steel/40", children: [
        /* @__PURE__ */ jsx(Toggle, { active: eu, onClick: () => setEu(true), children: costs.toggle.eu }),
        /* @__PURE__ */ jsx(Toggle, { active: !eu, onClick: () => setEu(false), children: costs.toggle.nonEu })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("table", { className: "w-full border-collapse text-left", children: [
      /* @__PURE__ */ jsx("caption", { className: "sr-only", children: costs.title }),
      /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "border-y border-graphite/25", children: [
        /* @__PURE__ */ jsx("th", { scope: "col", className: "label py-3 font-normal", children: costs.columns.concept }),
        /* @__PURE__ */ jsx("th", { scope: "col", className: "label py-3 text-right font-normal md:text-left", children: costs.columns.rate })
      ] }) }),
      /* @__PURE__ */ jsx("tbody", { children: costs.rows.map((row) => {
        const applies = eu ? row.appliesEu : true;
        return /* @__PURE__ */ jsxs("tr", { className: `border-b border-steel/20 align-baseline ${applies ? "opacity-100" : "opacity-30"}`, children: [
          /* @__PURE__ */ jsx("th", { scope: "row", className: "py-5 pr-6 text-[14px] font-normal leading-[1.4] text-graphite md:w-[46%] md:text-[15px]", children: row.concept }),
          /* @__PURE__ */ jsx("td", { className: "py-5 text-right font-mono text-[12px] leading-[1.5] text-graphite md:text-left md:text-[13px]", children: applies ? row.rate : /* @__PURE__ */ jsx("span", { className: "text-steel", children: costs.notApplicable }) })
        ] }, row.id);
      }) })
    ] }),
    /* @__PURE__ */ jsx("p", { className: "mt-8 max-w-[70ch] font-mono text-[10px] leading-[1.7] text-steel", children: costs.legal })
  ] }) });
}
function Toggle({ active, onClick, children }) {
  return /* @__PURE__ */ jsx(
    "button",
    {
      type: "button",
      role: "radio",
      "aria-checked": active,
      onClick,
      className: `px-5 py-3 font-mono text-[10px] uppercase tracking-label transition-colors duration-150 ${active ? "bg-graphite text-bone" : "bg-transparent text-steel hover:text-graphite"}`,
      children
    }
  );
}
async function submitOrder(order) {
  const payload = { ...order, ref: buildRef(), submittedAt: (/* @__PURE__ */ new Date()).toISOString() };
  return { ok: true, ref: payload.ref };
}
function buildRef() {
  return `VNT-${Math.floor(Math.random() * 9e3) + 1e3}`;
}
function whatsappHref(number, prefill) {
  return `https://wa.me/${number.replace(/[^\d]/g, "")}?text=${encodeURIComponent(prefill)}`;
}
const EMPTY = { spec: "", budget: "", timing: "", contact: "" };
function OrderForm() {
  const { form } = copy;
  const [values, setValues] = useState(EMPTY);
  const [touched, setTouched] = useState({});
  const [status, setStatus] = useState("idle");
  const [ref, setRef] = useState(null);
  const set = (k) => (e) => setValues((v) => ({ ...v, [k]: e.target.value }));
  const blur = (k) => () => setTouched((t) => ({ ...t, [k]: true }));
  const missing = Object.keys(EMPTY).filter((k) => !values[k].trim());
  const onSend = async () => {
    if (status === "sending") return;
    if (missing.length) {
      setTouched(Object.fromEntries(Object.keys(EMPTY).map((k) => [k, true])));
      return;
    }
    setStatus("sending");
    const res = await submitOrder(values);
    if (res.ok) {
      setRef(res.ref ?? null);
      setStatus("sent");
      setValues(EMPTY);
      setTouched({});
    } else setStatus("error");
  };
  return /* @__PURE__ */ jsx("section", { id: "encargo", className: "bg-graphite py-20 text-bone md:py-28", children: /* @__PURE__ */ jsx("div", { className: "mx-auto w-full max-w-[1440px] px-5 md:px-10", children: /* @__PURE__ */ jsxs("div", { className: "grid-page", children: [
    /* @__PURE__ */ jsxs("div", { className: "col-span-4 md:col-span-7", children: [
      /* @__PURE__ */ jsx("p", { className: "label mb-5", children: form.eyebrow }),
      /* @__PURE__ */ jsx("h2", { className: "display mb-6 text-[13vw] md:text-[5.4vw]", children: form.title }),
      /* @__PURE__ */ jsx("p", { className: "mb-12 max-w-[44ch] text-[14px] leading-[1.55] text-bone/60", children: form.body }),
      status === "sent" ? /* @__PURE__ */ jsxs("div", { role: "status", "aria-live": "polite", className: "border border-port/60 p-8 md:p-10", children: [
        /* @__PURE__ */ jsx("p", { className: "display text-[9vw] leading-none text-port md:text-[3vw]", children: form.sent }),
        /* @__PURE__ */ jsx("p", { className: "mt-4 max-w-[40ch] text-[14px] leading-[1.5] text-bone/70", children: form.sentBody }),
        ref ? /* @__PURE__ */ jsx("p", { className: "mt-6 font-mono text-[11px] tracking-[0.12em] text-steel", children: ref }) : null
      ] }) : /* @__PURE__ */ jsxs("div", { className: "space-y-7", children: [
        /* @__PURE__ */ jsx(Field, { n: "01", id: "spec", as: "textarea", label: form.fields.spec.label, placeholder: form.fields.spec.placeholder, value: values.spec, onChange: set("spec"), onBlur: blur("spec"), invalid: Boolean(touched.spec) && !values.spec.trim(), required: form.required }),
        /* @__PURE__ */ jsx(Field, { n: "02", id: "budget", label: form.fields.budget.label, placeholder: form.fields.budget.placeholder, value: values.budget, onChange: set("budget"), onBlur: blur("budget"), invalid: Boolean(touched.budget) && !values.budget.trim(), required: form.required }),
        /* @__PURE__ */ jsx(Field, { n: "03", id: "timing", label: form.fields.timing.label, placeholder: form.fields.timing.placeholder, value: values.timing, onChange: set("timing"), onBlur: blur("timing"), invalid: Boolean(touched.timing) && !values.timing.trim(), required: form.required }),
        /* @__PURE__ */ jsx(Field, { n: "04", id: "contact", label: form.fields.contact.label, placeholder: form.fields.contact.placeholder, value: values.contact, onChange: set("contact"), onBlur: blur("contact"), invalid: Boolean(touched.contact) && !values.contact.trim(), required: form.required }),
        /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-5 pt-2", children: [
          /* @__PURE__ */ jsxs(
            "button",
            {
              type: "button",
              onClick: onSend,
              disabled: status === "sending",
              className: "group inline-flex items-center gap-3 bg-bone px-7 py-4 font-mono text-[11px] uppercase tracking-label text-graphite transition-transform duration-300 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40",
              children: [
                status === "sending" ? form.sending : form.submit,
                /* @__PURE__ */ jsx("span", { className: "inline-block h-px w-6 bg-port-ink transition-all duration-300 group-hover:w-9" })
              ]
            }
          ),
          status === "error" ? /* @__PURE__ */ jsx("p", { role: "alert", className: "font-mono text-[11px] text-port", children: form.error }) : null
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("aside", { className: "col-span-4 mt-16 md:col-span-4 md:col-start-9 md:mt-0", children: [
      /* @__PURE__ */ jsxs("div", { className: "border border-bone/20 bg-bone/[0.03]", children: [
        /* @__PURE__ */ jsx("div", { className: "border-b border-bone/15 px-7 py-5", children: /* @__PURE__ */ jsx("p", { className: "label", children: form.whatsapp.label }) }),
        /* @__PURE__ */ jsxs("div", { className: "px-7 py-7", children: [
          /* @__PURE__ */ jsx("p", { className: "font-mono text-[17px] tracking-[0.08em]", children: form.whatsapp.number }),
          /* @__PURE__ */ jsxs(
            "a",
            {
              href: whatsappHref(form.whatsapp.number, form.whatsapp.prefill),
              target: "_blank",
              rel: "noopener noreferrer",
              className: "group mt-6 inline-flex w-full items-center justify-between gap-3 border border-bone/30 px-5 py-3.5 font-mono text-[10px] uppercase tracking-label transition-colors duration-300 hover:border-port hover:text-port",
              children: [
                form.whatsapp.action,
                /* @__PURE__ */ jsx("span", { className: "inline-block h-px w-6 bg-port transition-all duration-300 group-hover:w-9" })
              ]
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsx("p", { className: "mt-7 max-w-[36ch] border-l border-port/40 pl-4 font-mono text-[10px] leading-[1.7] text-steel", children: form.discretion })
    ] })
  ] }) }) });
}
function Field(props) {
  const { n, id, as, label, placeholder, value, onChange, onBlur, invalid, required } = props;
  const errorId = `${id}-error`;
  const cls = [
    "w-full resize-none bg-bone/[0.04] px-4 py-3.5 text-[15px] leading-[1.5] text-bone",
    "border transition-colors duration-200 placeholder:text-bone/25",
    "focus:bg-bone/[0.07] focus:outline-none",
    invalid ? "border-port" : "border-bone/15 hover:border-bone/30 focus:border-port"
  ].join(" ");
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsxs("label", { htmlFor: id, className: "mb-2.5 flex items-baseline gap-3", children: [
      /* @__PURE__ */ jsx("span", { className: "font-mono text-[10px] tracking-label text-port", children: n }),
      /* @__PURE__ */ jsx("span", { className: "label", children: label })
    ] }),
    as === "textarea" ? /* @__PURE__ */ jsx("textarea", { id, name: id, rows: 3, value, onChange, onBlur, placeholder, "aria-invalid": invalid || void 0, "aria-describedby": invalid ? errorId : void 0, className: cls }) : /* @__PURE__ */ jsx("input", { id, name: id, value, onChange, onBlur, placeholder, "aria-invalid": invalid || void 0, "aria-describedby": invalid ? errorId : void 0, className: cls }),
    invalid ? /* @__PURE__ */ jsx("p", { id: errorId, className: "mt-2 font-mono text-[10px] text-port", children: required }) : null
  ] });
}
function Footer() {
  const { footer } = copy;
  const year = (/* @__PURE__ */ new Date()).getFullYear();
  return /* @__PURE__ */ jsx("footer", { className: "border-t border-bone/15 bg-graphite pb-10 pt-16 text-bone", children: /* @__PURE__ */ jsxs("div", { className: "mx-auto w-full max-w-[1440px] px-5 md:px-10", children: [
    /* @__PURE__ */ jsxs("div", { className: "grid-page gap-y-10", children: [
      /* @__PURE__ */ jsxs("div", { className: "col-span-4 md:col-span-5", children: [
        /* @__PURE__ */ jsx(Logo, { className: "block text-[9vw] md:text-[3vw]" }),
        /* @__PURE__ */ jsx("p", { className: "mt-4 max-w-[34ch] text-[13px] leading-[1.5] text-bone/55", children: footer.tagline }),
        /* @__PURE__ */ jsx("p", { className: "mt-6 max-w-[40ch] font-mono text-[10px] leading-[1.7] text-steel", children: footer.note })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "col-span-2 md:col-span-3 md:col-start-8", children: [
        /* @__PURE__ */ jsx("p", { className: "label mb-4", children: "Contacto" }),
        /* @__PURE__ */ jsx("a", { href: `mailto:${footer.email}`, className: "block font-mono text-[11px] text-bone/80 hover:text-port", children: footer.email }),
        /* @__PURE__ */ jsx("p", { className: "mt-3 font-mono text-[11px] text-bone/55", children: footer.address })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "col-span-2 md:col-span-2 md:col-start-11", children: [
        /* @__PURE__ */ jsx("p", { className: "label mb-4", children: "Legal" }),
        /* @__PURE__ */ jsx("ul", { className: "space-y-2", children: footer.links.map((l) => /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx("a", { href: l.href, className: "font-mono text-[11px] text-bone/55 transition-colors hover:text-bone", children: l.label }) }, l.label)) })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mt-16 flex flex-wrap items-center justify-between gap-4 border-t border-bone/15 pt-6", children: [
      /* @__PURE__ */ jsxs("p", { className: "font-mono text-[10px] text-steel", children: [
        "© ",
        year,
        " ",
        footer.legalName,
        " · ",
        footer.vat
      ] }),
      /* @__PURE__ */ jsx("p", { className: "font-mono text-[10px] text-steel", children: footer.rights })
    ] })
  ] }) });
}
function Page() {
  useSmoothScroll();
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(Cursor, {}),
    /* @__PURE__ */ jsx(Nav, {}),
    /* @__PURE__ */ jsxs("main", { children: [
      /* @__PURE__ */ jsx(Hero, {}),
      /* @__PURE__ */ jsx(Figures, {}),
      /* @__PURE__ */ jsx(HowItWorks, {}),
      /* @__PURE__ */ jsx(Showreel, {}),
      /* @__PURE__ */ jsx(Available, {}),
      /* @__PURE__ */ jsx(Deliveries, {}),
      /* @__PURE__ */ jsx(Markets, {}),
      /* @__PURE__ */ jsx(Costs, {}),
      /* @__PURE__ */ jsx(Team, {}),
      /* @__PURE__ */ jsx(OrderForm, {})
    ] }),
    /* @__PURE__ */ jsx(Footer, {})
  ] });
}
function Index() {
  return /* @__PURE__ */ jsx(Page, {});
}
const index = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  component: Index
}, Symbol.toStringTag, { value: "Module" }));
export {
  index as i,
  useReducedMotion as u
};
