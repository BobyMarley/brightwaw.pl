import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyBC5Fx11DwQU3zo_Rol_x5USKC_Z7fScJA",
  authDomain: "praniebrightwaw.firebaseapp.com",
  projectId: "praniebrightwaw",
  storageBucket: "praniebrightwaw.firebasestorage.app",
  messagingSenderId: "199792015841",
  appId: "1:199792015841:web:2e4b549e1bbf10771f3aa0",
  measurementId: "G-5Y5LDFDE7F"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };