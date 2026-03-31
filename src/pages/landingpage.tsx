import { Header } from "../components/header"
import { easeInOut, motion, useInView } from "motion/react"
import Pizza from "../assets/pexels-enginakyurt-2260561.webp";
import Pizzaslice from "../assets/omar-hakeem-H6fWzOFw9Yo-unsplash.webp";
import fries from "../assets/farhad-ibrahimzade-TvMWBS6TIsg-unsplash.webp";
import toast from "../assets/pixzolo-photography-ZB8NK8cB4EE-unsplash.webp";
import burger from "../assets/mike-PxJ9zkM2wdA-unsplash.webp";
import { Footer } from "../components/footer";
import { useNavigate } from "react-router";
import { useRef } from "react";
import { BsFillLightningFill } from "react-icons/bs";
import { GiFullPizza } from "react-icons/gi";
import { IoStar } from "react-icons/io5";
import type { IconType } from "react-icons/lib";

const QualityCard = ({
  icon: Icon,
  title,
  description,
  delay,
}: {
  icon:        IconType;
  title:       string;
  description: string;
  delay:       number;
}) => {
  const ref    = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4, transition: { duration: 0.25 } }}
      className="flex flex-col items-center text-center gap-4 bg-white rounded-2xl px-6 py-8 shadow-sm border border-slate-100 hover:shadow-md hover:border-orange-200 transition-all duration-300 flex-1"
    >
      {/* Icon circle */}
      <div className="w-16 h-16 rounded-full flex items-center justify-center text-3xl shrink-0"
        style={{ background: "linear-gradient(135deg, #fff3e8, #ffe0c0)" }}>
       <Icon className="text-ink" />
      </div>

      <div className="flex flex-col gap-2">
        <p className="font-playfair font-bold text-xl text-ink">{title}</p>
        <p className="text-sm text-ink-muted leading-relaxed max-w-xs mx-auto">{description}</p>
      </div>

      {/* Decorative underline accent */}
      <div className="w-8 h-0.5 rounded-full bg-accent opacity-60 mt-1" />
    </motion.div>
  );
};



export const Landingpage = () => {
  const navigate = useNavigate();

   const menuNavigation = () =>{
        navigate("/menu")
     }

    const aboutNavigation = () => {
        navigate("/about")
      } 

  return (
    <div className="flex-col">
        <div>
            <Header />
        </div>

        <div className="mt-30 p-5 flex flex-col md:flex-row gap-4 bg-canvas">
            <div className="flex flex-col lg:justify-center">
              <h1 className="md: font-playfair font-semibold text-4xl text-ink">Freshly Baked, <span className="text-accent">Home Delivered</span></h1>

               <p className="md: text-wrap  mt-5 max-w-xl text-ink">Chef-crafted meals prepared with the season's best ingredients, delivered to your door before the steam clears.</p>

               <div className="flex flex-row gap-3 mt-5">
                <button className="inline-flex items-center justify-center rounded-full px-5 py-2.5 text-white font-medium bg-linear-to-r from-[rgb(var(--color-accent))] to-[rgb(var(--color-accent-soft))] shadow-md shadow-orange-500/30 transitionhover:brightness-105 active:scale-[0.98]" onClick={menuNavigation}>Check our menu</button>
                <button className="inline-flex items-center justify-center rounded-full px-5 py-2.5 text-ink font-medium bg-transparent hover:border duration-300 ease-in-out hover:border-ink" onClick={aboutNavigation}>Our Story</button>
               </div>
            </div>


            <motion.div className="md: mt-5 lg: ml-0" animate={{y:[0,-10,0]}} transition={{duration: 3, repeat: Infinity, ease:"easeInOut"}}>
              <img src={Pizza} alt="Home-made Pizza" className="w-full h-96 object-cover rounded-xl shadow-xl shadow-black/5" />
            </motion.div>
        </div>

        <div className=" flex flex-col bg-surface-subtle py-16">
           <h2 className="font-playfair text-center font-semibold text-3xl  mb-5 text-ink mt-15">Fan <span className="text-accent">Favourite</span></h2>
     
           <div className="flex flex-col gap-5 items-center justify-center md:flex-row"> 
            <div className="w-1/2 bg-shade  rounded-lg overflow-hidden shadow-lg md:w-60">
            <div className="relative bg-main-white group">
              <motion.img src={Pizzaslice} alt="A pizza slice" className="w-full h-1/2 object-cover rounded-md md:h-1/3 shadow-xl" whileHover={{ scale: 1.02 }} transition={{duration: 0.3, ease: "easeInOut"}}></motion.img>
              <div className="bg-white py-1">
                    <p className="font-playfair text-ink text-lg font-bold mb-3 text-center pt-2">Barbecue Beef</p>
                      <div className="flex gap-2 text-ink text-sm font-small text-center mb-2">
                        <p>Caramalized Onions, bell peppers and beef steaks</p>
                      </div>
               </div>   
            </div>
            </div>

             <div className="w-1/2 bg-shade  rounded-lg overflow-hidden shadow-lg md:w-60">
            <div className="relative bg-main-white group">
              <motion.img src={burger} alt="Beef burger and fries" className="w-full h-1/2 object-cover rounded-md md:h-1/3 shadow-xl" whileHover={{ scale: 1.02 }} transition={{ duration: 0.2, ease: easeInOut}}></motion.img>
              <div className="bg-white py-1">
                    <p className="font-playfair text-ink text-lg font-bold mb-1 text-center pt-2">Beef burger & fries</p>
                      <div className="flex gap-2 text-ink text-sm font-small text-center mb-2">
                        <p>A beef burger with lettuce  accompanied with fries</p>
                      </div>
               </div>   
            </div>
            </div>

             <div className="w-1/2 bg-shade  rounded-lg overflow-hidden shadow-lg md:w-60">
            <div className="relative bg-main-white group">
              <motion.img src={fries} alt="A pizza slice" className="w-full h-1/2 object-cover rounded-md md:h-1/3 shadow-xl" whileHover={{ scale: 1.02 }} transition={{ duration: 0.2, ease: easeInOut}}></motion.img>
              <div className="bg-white py-1">
                    <p className="font-playfair text-ink text-lg font-bold mb-1 text-center pt-2">Classic Beef</p>
                      <div className="flex gap-2 text-ink text-sm font-small text-center mb-2">
                        <p>Fried beef with onions and peppers and fries</p>
                      </div>
               </div>   
            </div>
            </div>

             <div className="w-1/2 bg-shade  rounded-lg overflow-hidden shadow-lg md:w-60">
            <div className="relative bg-main-white group">
              <motion.img src={toast} alt="A pizza slice" className="w-full h-1/2 object-cover rounded-md md:h-1/3 shadow-xl" whileHover={{ scale: 1.02 }} transition={{ duration: 0.2, ease: easeInOut}}></motion.img>
              <div className="bg-white py-1">
                    <p className="font-playfair text-ink text-lg font-bold mb-1 text-center pt-2">Grilled cheese sandwich</p>
                      <div className="flex gap-2 text-ink text-sm font-small text-center mb-2">
                        <p>Toast bread with melted cheese and spread</p>
                      </div>
               </div>   
             </div>
            </div>
           </div>   
        </div>

        {/* ── WHY CUSTOMERS CHOOSE US ── */}
      <div className="flex flex-col items-center bg-canvas px-5 py-16">
        <div className="text-center mb-10">
          <h2 className="font-playfair font-semibold text-3xl text-ink">
            Why Customers <span className="text-accent">Choose Us</span>
          </h2>
          <p className="text-ink-muted text-sm mt-3 max-w-md mx-auto">
            We've built every part of our service around one goal — making your experience as good as the food.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-5 w-full max-w-4xl">
          <QualityCard
            icon= {BsFillLightningFill}
            title="Fast Deliveries"
            description="Hot food should arrive hot. Our delivery riders are always on standby so your order reaches you quickly — every single time."
            delay={0}
          />
          <QualityCard
            icon={GiFullPizza}
            title="Fresh, Tasty Food"
            description="Every dish is made fresh to order using quality ingredients. No shortcuts, no reheated meals — just great food, every time."
            delay={0.1}
          />
          <QualityCard
            icon={IoStar}
            title="Excellent Customer Service"
            description="Have a question or concern? Our friendly team is always ready to help — before, during, and after your order."
            delay={0.2}
          />
        </div>
      </div>

        <div>
          <Footer />
        </div>
       
    </div>
  )
}


