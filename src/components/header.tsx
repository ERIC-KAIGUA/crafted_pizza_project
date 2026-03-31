import {  useState } from "react";
import { GiHamburgerMenu } from "react-icons/gi";
import { IoCloseSharp } from "react-icons/io5";
import { AnimatePresence, motion } from "motion/react"
import { useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import  { UserAvatar } from "./userAvatar";
import { useCart } from "../context/cartContext";
import { HiMiniShoppingCart } from "react-icons/hi2";

const LogoutModal = ({
  onConfirm,
  onCancel,
}: {
  onConfirm: () => void;
  onCancel:  () => void;
}) => (
  <motion.div
    className="fixed inset-0 z-[100] flex items-center justify-center px-4"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.2 }}
  >
    {/* Backdrop */}
    <motion.div
      className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      onClick={onCancel}
    />
 
    {/* Modal card */}
    <motion.div
      className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm flex flex-col items-center gap-4"
      initial={{ scale: 0.92, opacity: 0, y: 12 }}
      animate={{ scale: 1,    opacity: 1, y: 0  }}
      exit={{    scale: 0.92, opacity: 0, y: 12 }}
      transition={{ type: "spring", stiffness: 340, damping: 28 }}
    >
 
     
      <div className="text-center">
        <p className="font-playfair text-xl font-bold text-ink">Signing out?</p>
        <p className="text-sm text-ink-muted mt-1">
          You'll need to sign back in to place orders or view your order history.
        </p>
      </div>
 
      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 w-full mt-1">
        <button
          onClick={onConfirm}
          className="flex-1 rounded-full py-2.5 text-white text-sm font-semibold bg-linear-to-r from-[rgb(var(--color-accent))] to-[rgb(var(--color-accent-soft))] shadow-md shadow-orange-300/30 hover:brightness-105 active:scale-95 transition-all"
        >
          Yes, sign out
        </button>
        <button
          onClick={onCancel}
          className="flex-1 rounded-full py-2.5 text-ink text-sm font-semibold border-2 border-slate-200 hover:border-slate-400 transition-all"
        >
          Stay signed in
        </button>
      </div>
    </motion.div>
  </motion.div>
);


export const Header = () => {


    const [ sideNavOpen, setSideNavOpen] = useState(false)
    const navigate = useNavigate()
    const { signInWithGoogle } = useAuth();
    const { user, logout } = useAuth();
    const { totalItems } = useCart();
   

// Toggling sidenav on small screens
    const toggleSideNav = () => {
        setSideNavOpen(!sideNavOpen)
    }
     const [showLogout,    setShowLogout]    = useState(false);
     const menuNavigation = () =>{
        navigate("/menu")
     }
     const homeNavigation = () =>{
        navigate("/")
     }
     const aboutNavigation = () => {
        navigate("/about")
     }
     const cartNavigation = () => {
        navigate("/cart")
     }
     const ordersNavigation = () => {
        navigate("/orders")
     } 
    
 
  const handleLogout = async () => {
    setShowLogout(false);
    await logout();
  };
 

  return (
    <>
   <header className="fixed top-0 left-0 w-full z-50 bg-black/20 backdrop-blur-lg border-b border-white/10  ring-1 ring-white/5 shadow-lg shadow-black/40 rounded-b-2xl">
      <nav className=" relative md:mx-auto max-w-7xl px-6 py-4 flex items-center justify-between text-foreground">
        <div className="">
         <p className="text-foreground text-ink text-2xl font-semibold">Crafted Pizza.</p>
       </div>

        <ul className=" hidden md:flex gap-6 absolute left-1/2 -translate-x-1/2">
          <li className="cursor-pointer text-ink-muted hover:text-black transition-all duration-150 font-sans" onClick={homeNavigation}>Home</li>
          <li className="cursor-pointer text-ink-muted hover:text-black transition-all duration-150 font-sans" onClick={menuNavigation}>Menu</li>
          <li className="cursor-pointer text-ink-muted hover:text-black transition-all duration-150 font-sans" onClick={aboutNavigation}>About</li>
          <li className="cursor-pointer text-ink-muted hover:text-black transition-all duration-150 font-sans" onClick={ordersNavigation}>Order</li>
        </ul>
        
           
      

     <div className="flex items-center gap-3 sm:gap-5">

      <button onClick={cartNavigation} className="relative flex items-center justify-center w-10 h-10 rounded-full hover:bg-white/20 transition-all duration-150" aria-label="View-cart">
                   <HiMiniShoppingCart size={24} className="text-ink" />
                  <AnimatePresence>
                    {totalItems > 0 && (
                      <motion.span
                         key="badge"
                         initial={{scale:0, opacity:0}}
                         animate={{scale:1, opacity:1}}
                         exit={{scale:0, opacity:0}}
                         transition={{ type:"spring", stiffness: 500, damping: 25 }}
                         className="absolute -top-1 -right-1 min-w-4.5 flex items-center justify-center bg-accent text-white text-xs font-bold rounded-full px-1 shadow-sm"
                      >
                        {totalItems > 99 ? "99+" : totalItems}
                      </motion.span>
                    )}
                    </AnimatePresence>   
      </button>
      {user ? (
        <>

         <button className="hidden md:inline-flex items-center justify-center rounded-full px-6 py-3 text-white font-medium bg-linear-to-r from-[rgb(var(--color-accent))] to-[rgb(var(--color-accent-soft))] shadow-md shadow-orange-500/30 transitionhover:brightness-105 active:scale-[0.98]
          "   onClick={menuNavigation}>
            Order Now
          </button>

        <div className="cursor-pointer shrink-0"
                  onClick={() => setShowLogout(true)}
                >
                  <UserAvatar size="10" />
                </div>

        
        </>
      ) : (
        <>
            <button  onClick={async () => {
              try {
                await signInWithGoogle();
              } catch (error) {
                console.error("Error signing in with Google:", error);
              }
            }} className="inline-flex items-center justify-center rounded-full
                    px-3 py-2 text-xs
                    xs:px-5 xs:py-2.5 xs:text-sm
                    sm:px-6 sm:py-3 sm:text-base
                    text-white font-medium
                    bg-linear-to-r from-[rgb(var(--color-accent))] to-[rgb(var(--color-accent-soft))]
                    shadow-md shadow-orange-500/30 hover:brightness-105 active:scale-[0.98] transition-all
                    whitespace-nowrap"
          >
              Sign In
          </button>
        
        </>
      )}
        

        <button className="md:hidden text-foreground hover:text-accent transition-all duration-150" onClick={toggleSideNav}>
          {sideNavOpen ?  <IoCloseSharp  className="text-3xl"/> : <GiHamburgerMenu className="text-3xl"/> }
        </button>
         <AnimatePresence>
        {sideNavOpen && (
            <motion.div className="md:hidden absolute top-full left-0 w-full bg-white rounded-md border-b border-white/10 shadow-lg shadow-black/40 px-6 py-4" initial={{opacity:0, y: -5}} animate={{opacity:1, y: 0}} transition={{duration:1, ease:"easeInOut"}} exit={{opacity:0, y:-5}}>
                 <ul className="flex flex-col gap-4">
                    <li className="cursor-pointer text-ink-muted hover:text-black transition-all duration-150 font-sans" onClick={homeNavigation}>Home</li>
                    <li className="cursor-pointer text-ink-muted hover:text-black transition-all duration-150 font-sans" onClick={menuNavigation}>Menu</li>
                    <li className="cursor-pointer text-ink-muted hover:text-black transition-all duration-150 font-sans" onClick={aboutNavigation}>About</li>
                    <li className="cursor-pointer text-ink-muted hover:text-black transition-all duration-150 font-sans" onClick={ordersNavigation}>Order</li>
                  </ul>

                    <button className="mt-4 w-full inline-flex items-center justify-center rounded-full px-6 py-3 text-white font-medium bg-linear-to-r from-[rgb(var(--color-accent))] to-[rgb(var(--color-accent-soft))] shadow-md shadow-orange-500/30 transitionhover:brightness-105 active:scale-[0.98]
                                      " onClick={menuNavigation}>
            Order Now
          </button>
            </motion.div>
        )}
        </AnimatePresence>
      </div> 
      </nav>
    
    </header>


     <AnimatePresence>
        {showLogout && (
          <LogoutModal
            onConfirm={handleLogout}
            onCancel={() => setShowLogout(false)}
          />
        )}
      </AnimatePresence>
</>
    
  )
}


