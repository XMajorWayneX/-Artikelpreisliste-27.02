import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, setDoc, doc, deleteDoc, onSnapshot } from "firebase/firestore";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendPasswordResetEmail, onAuthStateChanged, sendEmailVerification } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCKenJqwd0rfVQBde0QJhtpuE-XGr6rlsc",
  authDomain: "kalkulationsliste.firebaseapp.com",
  projectId: "kalkulationsliste",
  storageBucket: "kalkulationsliste.firebasestorage.app",
  messagingSenderId: "87127929729",
  appId: "1:87127929729:web:db5e9b0c2cddc573496e80"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

export const itemsCollection = collection(db, 'items');
export const regionsCollection = collection(db, 'regions');

export { addDoc, setDoc, doc, deleteDoc, onSnapshot, collection, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendPasswordResetEmail, onAuthStateChanged, sendEmailVerification };
