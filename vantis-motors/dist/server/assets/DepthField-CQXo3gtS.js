import { jsx } from "react/jsx-runtime";
import { useRef, useEffect } from "react";
import * as THREE from "three";
import { u as useReducedMotion } from "./index-almtMRab.js";
import "lenis";
import "gsap";
import "gsap/ScrollTrigger";
import "./router-gdhSznwu.js";
import "@tanstack/react-query";
import "@tanstack/react-router";
import "framer-motion";
function DepthField() {
  const mount = useRef(null);
  const reduced = useReducedMotion();
  useEffect(() => {
    if (reduced) return;
    const el = mount.current;
    if (!el) return;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 100);
    camera.position.z = 14;
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    el.appendChild(renderer.domElement);
    const COLS = 46, ROWS = 18;
    const positions = new Float32Array(COLS * ROWS * 3);
    let i = 0;
    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < COLS; x++) {
        positions[i++] = (x - COLS / 2) * 0.62;
        positions[i++] = (y - ROWS / 2) * 0.62;
        positions[i++] = Math.sin(x * 0.35) * Math.cos(y * 0.4) * 1.6;
      }
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({ color: new THREE.Color("#6E7377"), size: 0.035, transparent: true, opacity: 0.5, sizeAttenuation: true });
    const points = new THREE.Points(geo, mat);
    scene.add(points);
    const target = { x: 0, y: 0 };
    const current = { x: 0, y: 0 };
    const onMove = (e) => {
      target.x = (e.clientX / window.innerWidth * 2 - 1) * 0.12;
      target.y = (e.clientY / window.innerHeight * 2 - 1) * 0.08;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    const resize = () => {
      const w = el.clientWidth, h = el.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    const ro = new ResizeObserver(resize);
    ro.observe(el);
    resize();
    let raf = 0, running = true;
    const tick = () => {
      current.x += (target.x - current.x) * 0.06;
      current.y += (target.y - current.y) * 0.06;
      points.rotation.y = current.x;
      points.rotation.x = current.y;
      renderer.render(scene, camera);
      if (running) raf = requestAnimationFrame(tick);
    };
    tick();
    const onVis = () => {
      running = document.visibilityState === "visible";
      if (running) tick();
      else cancelAnimationFrame(raf);
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      running = false;
      cancelAnimationFrame(raf);
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("pointermove", onMove);
      ro.disconnect();
      geo.dispose();
      mat.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === el) el.removeChild(renderer.domElement);
    };
  }, [reduced]);
  if (reduced) return null;
  return /* @__PURE__ */ jsx("div", { ref: mount, "aria-hidden": "true", className: "pointer-events-none absolute inset-0 z-0 opacity-70 [&>canvas]:block [&>canvas]:h-full [&>canvas]:w-full" });
}
export {
  DepthField as default
};
