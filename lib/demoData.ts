"use client"

import { registerUser, type User } from "./firebaseService"

// Create demo user data
export const createDemoUser = async (): Promise<void> => {
  try {
    const demoUserData: Omit<User, "id" | "createdAt" | "updatedAt"> = {
      email: "demo@company.com",
      password: "demo123",
      companyName: "Demo Manufacturing Co.",
      contactPerson: "John Demo",
      phone: "+1-555-0123",
      address: "123 Industrial Ave, Manufacturing City, MC 12345",
    }

    // Check if demo user already exists
    const existingUsers = JSON.parse(localStorage.getItem("registeredUsers") || "[]")
    const demoExists = existingUsers.find((u: User) => u.email === demoUserData.email)

    if (!demoExists) {
      await registerUser(demoUserData)
      console.log("Demo user created successfully")
    }
  } catch (error) {
    console.log("Demo user might already exist or Firebase is available")
  }
}

// Initialize demo data on app load
export const initializeDemoData = () => {
  if (typeof window !== "undefined") {
    createDemoUser()
  }
}
