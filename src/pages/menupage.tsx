

import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { Header } from "../components/header";
import { Footer } from "../components/footer";
import pizzas from "../assets/ivan-torres-MQUqbmszGGM-unsplash.webp";
import burgers from "../assets/niklas-rhose-FlmXvqlD-nI-unsplash.webp";
import sides  from "../assets/mitchell-luo-ChXHveqrb28-unsplash.webp";
import drinks from "../assets/kobby-mendez-xBFTjrMIC0c-unsplash.webp";
import deserts  from "../assets/serghey-savchuk-kAajTkiUQ74-unsplash.webp";
import { CATEGORIES } from "../types/menu";

// ─── Category visual config ───────────────────────────────────────────────────


const CATEGORY_CONFIG: Record<string, { image: string; tagline: string; bg: string }> = {
  pizzas:   { image: pizzas, tagline: "Wood-fired & oven fresh",      bg: "from-orange-50 to-orange-100"   },
  burgers:  { image: burgers, tagline: "Stacked high, loaded with flavour", bg: "from-yellow-50 to-yellow-100" },
  sides:    { image: sides, tagline: "The perfect companions",        bg: "from-amber-50 to-amber-100"     },
  drinks:   { image: drinks, tagline: "Cold, refreshing & hand-made",  bg: "from-sky-50 to-sky-100"         },
  desserts: { image: deserts, tagline: "Sweet endings to every meal",   bg: "from-pink-50 to-pink-100"       },
};

// ─── Category Card ────────────────────────────────────────────────────────────

const CategoryCard = ({
  categoryId,
  label,
  index,
}: {
  categoryId: string;
  label:      string;
  index:      number;
}) => {
  const navigate = useNavigate();
  const config   = CATEGORY_CONFIG[categoryId] ?? { icon: "🍽️", tagline: "Explore our selection", bg: "from-slate-50 to-slate-100" };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08, ease: "easeOut" }}
      whileHover={{ y: -6, scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      onClick={() => navigate(`/menu/${categoryId}`)}
      className={`cursor-pointer rounded-2xl bg-linear-to-br ${config.bg} border border-white shadow-sm hover:shadow-lg transition-shadow duration-300 flex flex-col items-center justify-center gap-3 p-6 sm:p-8 aspect-square`}
    >
      {/* Image */}
     <img
        src={config.image}
        alt={label}
        className="w-full h-36 object-cover rounded-xl shadow-xl"
      />
      {/* Category name */}
      <p className="font-playfair text-xl sm:text-2xl font-semibold text-ink text-center leading-tight">
        {label}
      </p>

      {/* Tagline */}
      <p className="text-xs sm:text-sm text-ink-muted text-center leading-snug">
        {config.tagline}
      </p>

      {/* CTA */}
      <span className="mt-1 text-xs font-medium text-accent flex items-center gap-1">
        Explore <span className="text-base">→</span>
      </span>
    </motion.div>
  );
};

// ─── Menu Page ────────────────────────────────────────────────────────────────

export const MenuPage = () => {
  return (
    <div className="min-h-screen bg-canvas flex flex-col">
      <Header />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 pt-28 sm:pt-32 pb-16">

        {/* Page heading */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10 sm:mb-14"
        >
          <h1 className="font-playfair text-3xl sm:text-5xl font-semibold text-ink">
            What are you <span className="text-accent">craving?</span>
          </h1>
          <p className="text-ink-muted mt-3 text-sm sm:text-base max-w-md mx-auto">
            Choose a category below to browse our full menu and add items to your cart.
          </p>
        </motion.div>

        {/* 5-card grid — 2 cols on mobile, wraps to show all 5 */}
        {/* On desktop: 3 + 2 layout using CSS grid with centering trick */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-5">
          {CATEGORIES.map((cat, index) => (
            <div
              key={cat.id}
              // The 5th card (index 4) is centred on mobile by spanning 2 cols
              // and using justify-self-center, and on sm+ it sits naturally in col 2
              className={
                index === 4
                  ? "col-span-2 sm:col-span-1 flex justify-center"
                  : ""
              }
            >
              <div className={index === 4 ? "w-1/2 sm:w-full" : "w-full"}>
                <CategoryCard
                  categoryId={cat.id}
                  label={cat.label}
                  index={index}
                />
              </div>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
};