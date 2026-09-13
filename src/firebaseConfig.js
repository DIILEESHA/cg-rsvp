// Firebase v9 Modular SDK
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
 apiKey: "AIzaSyBerMlEyaytrV8yqsbHDyd2_rfOMHFfUaw",
  authDomain: "guest-bookme.firebaseapp.com",
  databaseURL: "https://guest-bookme-default-rtdb.firebaseio.com",
  projectId: "guest-bookme",
  storageBucket: "guest-bookme.firebasestorage.app",
  messagingSenderId: "330838109657",
  appId: "1:330838109657:web:5cf7846a0c1445d2f4fdc8",
  measurementId: "G-WZESSN1E8W"
};
// Initialize
const app = initializeApp(firebaseConfig);

// Firestore DB export
export const db = getFirestore(app);
