import { copy } from "../content";

/** Quien esta detras. Dos personas, sin foto: iniciales en caja de marca. */
export default function Team() {
  const { team } = copy;
  return (
    <section id="equipo" className="bg-graphite py-20 text-bone md:py-28">
      <div className="mx-auto w-full max-w-[1440px] px-5 md:px-10">
        <p className="label text-bone/60">{team.eyebrow}</p>
        <h2 className="display mt-4 max-w-[16ch] text-[12vw] md:text-[4.6vw]">{team.title}</h2>
        <p className="mt-6 max-w-[56ch] text-[15px] leading-[1.5] text-bone/70">{team.body}</p>

        <div className="mt-14 grid gap-px border border-bone/15 bg-bone/15 md:grid-cols-2">
          {team.members.map((m, i) => (
            <article key={i} className="flex flex-col gap-5 bg-graphite p-8 md:p-10">
              <span aria-hidden="true" className="flex h-14 w-14 shrink-0 items-center justify-center border border-port/45 font-mono text-[15px] tracking-[0.1em] text-port">
                {m.initials}
              </span>
              <div>
                <h3 className="display text-[26px] md:text-[30px]">{m.name}</h3>
                <p className="label mt-2 text-port">{m.role}</p>
              </div>
              <p className="max-w-[46ch] text-[15px] leading-[1.55] text-bone/70">{m.bio}</p>
              <a href={`mailto:${m.email}`} className="mt-auto inline-block font-mono text-[11px] text-bone/80 underline-offset-4 transition-colors hover:text-port hover:underline">
                {m.email}
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
