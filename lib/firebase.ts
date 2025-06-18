import { initializeApp, getApps, getApp } from "firebase/app"
import { getFirestore } from "firebase/firestore"
import { getAnalytics } from "firebase/analytics"

const firebaseConfig = {
  apiKey: "AIzaSyDYH53hJzsMVtggnMh9GwsqWg4AKWWo_-I",
  authDomain: "mhrcalc.firebaseapp.com",
  projectId: "mhrcalc",
  storageBucket: "mhrcalc.firebasestorage.app",
  messagingSenderId: "530441998915",
  appId: "1:530441998915:web:70f12c59c6ec69b86a7af6",
  measurementId: "G-CSS3LSY3Z9"
};

// Initialize Firebase only if it hasn't been initialized
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp()

// Initialize Firestore
let db: any = null
try {
  db = getFirestore(app)
} catch (error) {
  console.error("Error initializing Firestore:", error)
}

// Initialize analytics only in browser environment
let analytics: any = null
if (typeof window !== "undefined") {
  try {
    analytics = getAnalytics(app)
  } catch (error) {
    console.error("Error initializing Analytics:", error)
  }
}

export { db, analytics }
