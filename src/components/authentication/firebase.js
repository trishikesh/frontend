import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCREhSAvJ17TS6C7HftRxIVF3QjdUsA-u4",
  authDomain: "hackcrux-19c24.firebaseapp.com",
  projectId: "hackcrux-19c24",
  storageBucket: "hackcrux-19c24.appspot.com",
  messagingSenderId: "342785946297",
  appId: "1:342785946297:web:699abca59c2f5dd2982168"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);



export { auth, db };