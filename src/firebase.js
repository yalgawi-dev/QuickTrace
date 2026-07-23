import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBfrh90P4hr-Ao2e9o-iDMKsjJl56CNTQ0",
  authDomain: "quicktrace-83a6b.firebaseapp.com",
  projectId: "quicktrace-83a6b",
  storageBucket: "quicktrace-83a6b.firebasestorage.app",
  messagingSenderId: "214612299719",
  appId: "1:214612299719:web:e0caf4b671509c2e3913e2"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { db, auth, googleProvider };
