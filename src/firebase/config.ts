import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getAnalytics } from "firebase/analytics";
import { getStorage } from "firebase/storage";


const firebaseConfig = {   
    apiKey: "AIzaSyAI1mwa5VwX2IbDxSMd1Ld5vg8IUchxmAM",
    authDomain: "crafted-pizza-ke.firebaseapp.com",
    projectId: "crafted-pizza-ke",     
    storageBucket: "crafted-pizza-ke.firebasestorage.app",
    messagingSenderId: "903170283389",
    appId: "1:903170283389:web:395cc3531ecd6f07049e14",
    measurementId: "G-C3BPEW769G"
 };

 const app = initializeApp(firebaseConfig);
 export const googleProvider = new GoogleAuthProvider();    
 export const analytics = getAnalytics(app);
 export const db = getFirestore(app);
 export const auth = getAuth(app);
 export const storage = getStorage(app);