import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const fadeUp = {
  initial: { opacity: 1, y: 18 },
  animate: { opacity: 1, y: 1 },
  transition: { duration: 0.4 },
};

const YEAR = new Date().getFullYear();

export default function Home() {
  return (
    <div className="relative min-h-screen bg-[#0f1115] text-white">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="absolute bottom-10 left-1/3 h-56 w-56 rounded-full bg-teal-400/20 blur-3xl" />
        <div className="absolute top-40 -right-20 h-72 w-72 rounded-full bg-cyan-500/20 blur-3xl" />
      </div>

      

      <section className="relative z-10 mx-auto max-w-6xl px-6 pt-8 pb-12 md:pt-16">
        <motion.p {...fadeUp} className="mb-3 text-sm text-slate-300">
          Mobile Barber • House Calls • Clean Cuts
        </motion.p>
        <motion.h1 {...fadeUp} className="text-4xl font-extrabold tracking-tight md:text-6xl">
          Fresh cuts on <span className="bg-gradient-to-r from-cyan-400 to-teal-300 bg-clip-text text-transparent">your time</span>
        </motion.h1>
        <motion.p {...fadeUp} className="mt-4 max-w-xl text-slate-300 md:text-lg">
          Book a premium house‑call cut in seconds. Transparent pricing, real‑time availability, fast confirmations.
        </motion.p>
        <motion.div {...fadeUp} className="mt-6 flex flex-wrap items-center gap-3">
          <Link
            to="/book"
            className="rounded-xl bg-blue-600 px-5 py-3 font-medium shadow-lg shadow-blue-600/25 hover:bg-blue-700"
          >
            Book an Appointment
          </Link>
          <a
            href="https://instagram.com/eric.fadezz"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-slate-200 hover:bg-white/10"
          >
            @eric.fadezz
          </a>
          <a href="tel:15306013529" className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-slate-200 hover:bg-white/10">
            (530) 601‑3529
          </a>
        </motion.div>
      </section>

      <section className="relative z-10 mx-auto max-w-6xl px-6 pb-12 md:pb-16">
        <motion.h2 {...fadeUp} className="mb-6 text-2xl font-semibold md:text-3xl">Services</motion.h2>
      
     
        <div className="mx-auto max-w-5xl grid gap-6 md:grid-cols-3 justify-items-center">
          <ServiceCard
            title="Regular Cut"
            desc="Clean taper/Fade , detailed lineup, styled finish."
            price="$25"
            duration="45 min"
          />
          <ServiceCard
            title="Regular Cut + Beard"
            desc="Full fade with beard shape & hot towel."
            price="$30"
            duration="60 min"
          />
          <ServiceCard
            title="House Call"
            desc="Haircut at your location zero travel on your part."
            price="$50"
            duration="60 min"
          />
        </div>
        <section className="py-12"></section>

        <p className="mt-3 text-xs text-slate-400 text-center">
          Prices may vary by request. Travel area local only.
        </p>
      </section>
      <section className="relative z-10 mx-auto max-w-6xl px-6 pb-16">
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-r from-blue-600/20 to-teal-500/20 p-6 shadow-[0_0_40px_-10px_rgba(37,99,235,0.45)]">
          <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-xl font-semibold">Ready for a fresh cut?</h3>
              <p className="text-sm text-slate-300">Lock in your time now—confirmation in seconds.</p>
            </div>
            <Link to="/book" className="rounded-xl bg-white px-5 py-3 font-semibold text-slate-900 hover:opacity-90">Book Now</Link>
          </div>
        </div>
      </section>

      <footer className="relative z-10 border-t border-white/10 bg-black/20">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 text-slate-300 md:flex-row">
          <span>© {YEAR} ericfadezz — Mobile Barber</span>
          <div className="flex gap-4 text-sm">
            <a href="mailto:booking@ericfadezz.com" className="hover:text-white">booking@ericfadezz.com</a>
            <a href="https://instagram.com/eric.fadezz" target="_blank" rel="noopener noreferrer" className="hover:text-white">Instagram</a>
            <a href="tel:15306013529" className="hover:text-white">(530) 601‑3529</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function ServiceCard({ title, desc, price, duration }) {
  return (
    <motion.div
      initial={fadeUp.initial}
      whileInView={fadeUp.animate}
      transition={fadeUp.transition}
      viewport={{ once: true, amount: 0.2 }}
      className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg transition hover:shadow-blue-700/20"
    >
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-lg font-semibold">{title}</h3>
        <span className="rounded-md bg-white/10 px-2 py-1 text-sm">{price}</span>
      </div>
      <p className="mb-4 text-sm text-slate-300">{desc}</p>
      <div className="flex items-center justify-between text-sm text-slate-300">
        <span>{duration}</span>
        <Link to="/book" className="rounded-lg border border-white/10 bg-white/5 px-3 py-1 text-white hover:bg-white/10">
          Book
        </Link>
      </div>
      <div className="pointer-events-none absolute -bottom-10 -right-10 h-24 w-24 rounded-full bg-blue-600/20 blur-2xl transition group-hover:scale-125" />
    </motion.div>
  );
}
