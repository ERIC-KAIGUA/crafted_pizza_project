
import { useRef } from "react";
import { motion, useInView } from "motion/react";
import { Header } from "../components/header";
import { Footer } from "../components/footer";
import owner from "../assets/joseph-ogbonnaya-tK9yv7T0suk-unsplash.webp";
import branch1 from "../assets/jason-leung-poI7DelFiVA-unsplash.webp";
import branch2 from "../assets/nick-karvounis-Ciqxn7FE4vE-unsplash.webp";
import branch3 from "../assets/shawn-nmpW_WwwVSc-unsplash.webp";



const Photo = ({ src, alt, className, label }: {
  src?: string; alt: string; className?: string; label?: string;
}) => {
  if (src) return <img src={src} alt={alt} className={className} />;
  return (
    <div className={`${className} bg-linear-to-br from-orange-50 to-slate-100 flex flex-col items-center justify-center gap-2 border-2 border-dashed border-orange-200`}>
      <span className="text-3xl opacity-40"></span>
      {label && <p className="text-xs text-ink-subtle font-medium text-center px-3 leading-relaxed">{label}</p>}
    </div>
  );
};

// ─── Scroll fade-in ───────────────────────────────────────────────────────────

const FadeIn = ({ children, delay = 0, className }: {
  children: React.ReactNode; delay?: number; className?: string;
}) => {
  const ref    = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.75, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}>
      {children}
    </motion.div>
  );
};

// ─── Section eyebrow ─────────────────────────────────────────────────────────

const Label = ({ text }: { text: string }) => (
  <div className="flex items-center gap-3 mb-4">
    <span className="w-8 h-px bg-accent" />
    <span className="text-xs font-semibold tracking-[0.2em] uppercase text-accent">{text}</span>
  </div>
);

// ─── Branch card ──────────────────────────────────────────────────────────────

const BranchCard = ({ name, area, description, imageSrc, index }: {
  name: string; area: string; description: string; imageSrc?: string; index: number;
}) => (
  <FadeIn delay={index * 0.12}>
    <div className="group bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-orange-100/60 hover:-translate-y-1.5 transition-all duration-500 flex flex-col h-full">
      <div className="relative h-52 overflow-hidden shrink-0">
        <Photo src={imageSrc} alt={`${name} branch`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          label={`Add ${name} branch photo here`} />
        <div className="absolute inset-0 bg-linear-to-t from-black/55 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 p-4">
          <p className="font-playfair text-white text-xl font-semibold drop-shadow">{name}</p>
          <p className="text-white/75 text-xs mt-0.5">{area}</p>
        </div>
        <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1.5 shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs font-semibold text-ink">Open Daily</span>
        </div>
      </div>
      <div className="p-5 flex flex-col gap-4 flex-1">
        <p className="text-sm text-ink-muted leading-relaxed flex-1">{description}</p>
        <div className="flex items-center gap-3 bg-orange-50 rounded-2xl px-4 py-3 border border-orange-100">
          <span className="text-base">🕙</span>
          <div>
            <p className="text-[10px] text-ink-muted uppercase tracking-wide font-medium">Opening Hours</p>
            <p className="text-sm font-bold text-ink">10:30 AM — 8:00 PM</p>
          </div>
        </div>
        <div className="flex items-center justify-between pt-1 border-t border-slate-100">
          <div className="flex items-center gap-1.5 text-xs text-ink-muted">
            <span>📍</span><span>{area}</span>
          </div>
          <span className="text-xs font-semibold text-accent flex items-center gap-1 group-hover:gap-2 transition-all duration-200">
            Walk in welcome <span>→</span>
          </span>
        </div>
      </div>
    </div>
  </FadeIn>
);

// ─── Page ─────────────────────────────────────────────────────────────────────

export const AboutPage = () => {
  const branches = [
    { name: "Tasty Trail Rongai", area: "Ongata Rongai Town",
      description: "Our flagship location in the heart of Ongata Rongai town. A warm, welcoming space where families and friends come together over fresh, handcrafted meals made from scratch every single day.",
       imageSrc: branch2},
    { name: "Tasty Trail Juja", area: "Juja",
      description: "Serving the vibrant Juja community with the same quality and passion that started it all. Perfect for a quick lunch break or a relaxed evening meal with the people you love.",
       imageSrc: branch1 },
    { name: "Tasty Trail Ngong", area: "Ngong",
      description: "Our newest location, bringing the Tasty Trail experience to Ngong. Whether you're stopping in after work or planning a weekend treat, we're always ready to serve.",
      imageSrc:branch3 },
  ];

  

  return (
    <div className="min-h-screen bg-canvas flex flex-col">
      <Header />

      {/* ── Hero ── */}
      <section className="relative pt-36 pb-20 px-4 overflow-hidden">
        <div className="absolute top-16 right-0 w-80 h-80 rounded-full bg-orange-100/50 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-60 h-60 rounded-full bg-slate-100/70 blur-2xl pointer-events-none" />
        <div className="relative max-w-3xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="flex items-center justify-center gap-3 mb-5">
            <span className="w-10 h-px bg-accent" />
            <span className="text-xs font-semibold tracking-[0.2em] uppercase text-accent">Our Story</span>
            <span className="w-10 h-px bg-accent" />
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="font-playfair text-4xl sm:text-5xl lg:text-6xl font-bold text-ink leading-tight">
            Food Made With<br /><span className="text-accent">Passion & Pride</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.2 }}
            className="mt-5 text-ink-muted text-lg max-w-xl mx-auto leading-relaxed">
            From a single kitchen to three beloved locations across Kiambu County,
            Tasty Trail has been on one mission — serve food so good, it feels like home.
          </motion.p>
        </div>
      </section>

      {/* ── About the Business ── */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <FadeIn>
            <Label text="Who We Are" />
            <h2 className="font-playfair text-3xl sm:text-4xl font-bold text-ink leading-snug mb-6">
              Fast Food, Zero<br /><span className="text-accent">Compromises</span>
            </h2>
            <div className="flex flex-col gap-4 text-ink-muted leading-relaxed text-[15px]">
              <p>Tasty Trail was built on a belief that fast food doesn't have to mean average food. Every item on our menu is prepared fresh — using carefully sourced ingredients, real recipes, and genuine care for the people sitting across the counter from us.</p>
              <p>We don't cut corners. From our hand-stretched pizza dough to our seasoned beef patties and golden crispy fries, every dish that leaves our kitchen meets a standard we're proud of. Because our customers deserve nothing less.</p>
              <p>That commitment to quality is what keeps regulars coming back — and what turns first-time visitors into familiar faces.</p>
            </div>
            <div className="flex gap-8 mt-8 pt-6 border-t border-slate-100">
              {[{ value: "3", label: "Locations" }, { value: "100%", label: "Fresh Daily" }, { value: "5★", label: "Customer Love" }].map((s) => (
                <div key={s.label}>
                  <p className="font-playfair text-3xl font-bold text-accent">{s.value}</p>
                  <p className="text-xs text-ink-muted font-medium mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </FadeIn>
          <FadeIn delay={0.15}>
            <div className="relative">
              <Photo alt="Inside Crafted Pizza"
                  src={branch1}
                className="w-full h-80 lg:h-[420px] object-cover rounded-3xl shadow-xl shadow-orange-100/50"
                label="Add a restaurant or food photo here" />
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, duration: 0.4 }}
                className="absolute -bottom-5 -left-4 sm:-left-8 bg-white rounded-2xl shadow-xl shadow-slate-200/60 px-5 py-4 border border-slate-100 flex items-center gap-3">
                <span className="text-2xl">🍕</span>
                <div>
                  <p className="font-semibold text-ink text-sm">Handcrafted Daily</p>
                  <p className="text-xs text-ink-muted">No frozen shortcuts. Ever.</p>
                </div>
              </motion.div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── Divider ── */}
      <div className="max-w-6xl mx-auto px-4 py-2">
        <div className="w-full h-px bg-linear-to-r from-transparent via-slate-200 to-transparent" />
      </div>

      {/* ── Founder ── */}
      <section className="py-16 px-4 bg-surface-subtle">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

          {/* Portrait */}
          <FadeIn className="order-2 lg:order-1 flex justify-center">
            <div className="relative flex items-center justify-center w-72 h-72 sm:w-80 sm:h-80">
              <div className="absolute inset-0 rounded-full border-2 border-dashed border-orange-200" />
              <Photo alt="Jane Doe — Founder of Crafted Pizza"
                  src={owner}
                className="w-56 h-56 sm:w-64 sm:h-64 object-cover rounded-full shadow-2xl shadow-orange-200/50 border-4 border-white"
                label="Add Jane Doe portrait photo here" />
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-white rounded-2xl shadow-lg px-5 py-3 border border-slate-100 text-center whitespace-nowrap">
                <p className="font-playfair font-bold text-ink text-sm">Jane Doe</p>
                <p className="text-xs text-accent font-semibold">Founder & Owner</p>
              </div>
            </div>
          </FadeIn>

          {/* Story */}
          <FadeIn delay={0.15} className="order-1 lg:order-2">
            <Label text="Meet the Founder" />
            <h2 className="font-playfair text-3xl sm:text-4xl font-bold text-ink leading-snug mb-6">
              From Banking Halls<br /><span className="text-accent">to the Kitchen</span>
            </h2>
            <div className="flex flex-col gap-4 text-ink-muted leading-relaxed text-[15px]">
              <p>Before Tasty Trail, Jane Doe spent years building a successful career in banking. She was good at it — but something was always missing. After long days at her desk, it was always the kitchen she returned to, cooking for family and friends, and feeling more like herself than she ever did at the office.</p>
              <p>Food wasn't just a hobby for Jane. It was her calling. After years of careful planning, she made the bold decision to leave banking behind and build something of her own — a fast food business rooted in quality, warmth, and the kind of food people genuinely love to eat.</p>
              <p>Today Jane remains actively involved in every branch. She oversees recipes, trains her team personally, and regularly visits each location to ensure the standard she built from day one never slips.</p>
            </div>
            <div className="mt-8 border-l-4 border-accent pl-5">
              <p className="font-playfair text-lg sm:text-xl italic text-ink leading-relaxed">
                "I didn't leave banking to run a restaurant. I left to build something people would genuinely love — and that's what gets me out of bed every morning."
              </p>
              <p className="text-sm text-accent font-semibold mt-3">— Jane Doe, Founder</p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── Branches ── */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <FadeIn className="text-center mb-12">
            <Label text="Find Us" />
            <h2 className="font-playfair text-3xl sm:text-4xl font-bold text-ink">
              Three Locations, <span className="text-accent">One Standard</span>
            </h2>
            <p className="text-ink-muted mt-4 max-w-xl mx-auto leading-relaxed text-[15px]">
              Whether you're in Ongata Rongai, Juja, or in Ngong Town — there's a Tasty Trail near you.
              Walk in any day between 10:30 AM and 8:00 PM and we'll have something hot and fresh waiting.
            </p>
          </FadeIn>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
            {branches.map((b, i) => <BranchCard key={b.name} {...b} index={i} />)}
          </div>
          <FadeIn delay={0.3}>
            <div className="mt-10 flex justify-center">
              <div className="inline-flex items-center gap-3 bg-orange-50 border border-orange-200 rounded-full px-6 py-3.5">
                <span className="text-lg">👋</span>
                <p className="text-sm text-ink-muted">No reservation needed — just walk in and we'll be happy to serve you.</p>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      <Footer />
    </div>
  );
};