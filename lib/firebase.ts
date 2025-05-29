import { initializeApp, getApps, getApp } from "firebase/app"
import { getFirestore } from "firebase/firestore"
import { getAnalytics } from "firebase/analytics"

const firebaseConfig = {
  apiKey: "AIzaSyDSHZAKsRFrHer7lno6Rknr3w5j-xVglVc",
  authDomain: "employeemanagement-16dba.firebaseapp.com",
  databaseURL: "https://employeemanagement-16dba-default-rtdb.firebaseio.com",
  projectId: "employeemanagement-16dba",
  storageBucket: "employeemanagement-16dba.firebasestorage.app",
  messagingSenderId: "723276151197",
  appId: "1:723276151197:web:5df89d54869fc42dd4d774",
  measurementId: "G-BT1YLST16T",
}

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
