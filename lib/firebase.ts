import { initializeApp, getApps, getApp } from "firebase/app"
import { getFirestore } from "firebase/firestore"
import { getAnalytics } from "firebase/analytics"

const firebaseConfig = {
  apiKey: "AIzaSyDGvtDcFhE9gSQUeKTq8MwaqSuxFHjC13U",
  authDomain: "pugalfolio.firebaseapp.com",
  databaseURL: "https://pugalfolio-default-rtdb.firebaseio.com",
  projectId: "pugalfolio",
  storageBucket: "pugalfolio.firebasestorage.app",
  messagingSenderId: "17589199201",
  appId: "1:17589199201:web:3b2e7f0fd940d812446520",
  measurementId: "G-THXRGHNLYF"
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
