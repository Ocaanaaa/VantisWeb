import type { Unidad } from "../lib/unidades";
import { useSmoothScroll } from "../lib/smoothScroll";
import Cursor from "./Cursor";
import Nav from "./Nav";
import Hero from "./Hero";
import Figures from "./Figures";
import HowItWorks from "./HowItWorks";
import Showreel from "./Showreel";
import Available from "./Available";
import Team from "./Team";
import Deliveries from "./Deliveries";
import Markets from "./Markets";
import Costs from "./Costs";
import OrderForm from "./OrderForm";
import Footer from "./Footer";

export default function Page({ unidades }: { unidades: Unidad[] }) {
  useSmoothScroll();
  return (
    <>
      <Cursor />
      <Nav />
      <main>
        <Hero />
        <Figures />
        <HowItWorks />
        <Showreel />
        <Available unidades={unidades} />
        <Deliveries />
        <Markets />
        <Costs />
        <Team />
        <OrderForm />
      </main>
      <Footer />
    </>
  );
}
