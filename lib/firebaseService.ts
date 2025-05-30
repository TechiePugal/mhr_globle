// Firebase Service - Placeholder for Firebase integration
// Replace with actual Firebase configuration when ready

import { db } from "./firebase"
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  serverTimestamp,
  query,
  where,
} from "firebase/firestore"

// Interfaces
export interface User {
  id?: string
  email: string
  password?: string
  companyName: string
  contactPerson: string
  phone?: string
  address?: string
  createdAt?: any
  updatedAt?: any
}

export interface MachineData {
  imageUrl: string
  id?: string
  userId: string
  companyId: string
  machineName: string
  investmentData: {
    machineCost: number
    lifeOfMachine: number
    workingHoursPerDay: number
    balanceLifeOfMachine: number
    interestRate: number
    scrapRate: number
    machineLifeHours?: number
    currentValueOfMachine?: number
    depreciationPerHour?: number
    interestPerHour?: number
  }
  spaceData: {
    factoryRentPerMonth: number
    factorySpaceInSqFt: number
    spaceOccupiedByMachine: number
    numberOfMachinesInFactory: number
    commonSpaceInSqFt: number
  }
  powerData: {
    machinePower: number
    effectiveRunningTimeOfMotors: number
    powerOfFan: number
    powerOfLight: number
    numberOfFansAroundMachine: number
    numberOfLightsAroundMachine: number
    compressorPower: number
    numberOfMachinesConnectedWithCompressor: number
    effectiveRunningTimeOfCompressor: number
    powerOfOtherElectricalEquipment: number
    utilization: number
    ebUnitRate: number
    dieselConsumptionByGenset: number
    dieselCostPerLitre: number
    gensetPower: number
    electricityUnitRate: number
    gensetUnitRate?: number
  }
  consumablesData: {
    coolantOilTopUpPerMonth: number
    coolantOilCostPerLitre: number
    wasteUsagePerMonth: number
    costOfWastePerKg: number
    monthlyMaintenanceCost: number
    annualMaintenanceCost: number
    otherConsumablesPerMonth: number
  }
  toolsWagesData: {
    averageToolCostPerMonth: number
    operatorSalaryPerMonth: number
    helperSalaryPerMonth: number
    qualityInspectorSalaryPerMonth: number
  }
  overheadsData: {
    productionSupervisorSalaryPerMonth: number
    qualitySupervisorSalaryPerMonth: number
    engineerSalaryPerMonth: number
    managerSalaryPerMonth: number
    adminStaffSalaryPerMonth: number
    noOfMachinesHandledByOperator: number
    noOfMachinesHandledByHelper: number
    noOfMachinesHandledByQualityInspector: number
    noOfMachinesHandledByProductionSupervisor: number
    noOfMachinesHandledByQualitySupervisor: number
    noOfMachinesHandledByEngineer: number
  }
  wagesSalariesData?: {
    operatorCostPerHr: number
    helperCostPerHr: number
    qualityInspectorCostPerHr: number
    productionSupervisorCostPerHr: number
    qualitySupervisorCostPerHr: number
    engineerCostPerHr: number
    adminCostPerHr: number
  }
  calculationData?: {
    investmentCost: number
    spaceCost: number
    powerCost: number
    consumablesCost: number
    toolCost: number
    wages: number
    salary: number
    otherOverheads: number
    profit: number
    machineHourRate: number
  }
  createdAt?: any
  updatedAt?: any
}

const MACHINES_COLLECTION = "machines"
const USERS_COLLECTION = "users"

const isFirebaseAvailable = () => typeof db !== "undefined" && db !== null

// === Auth Functions ===
export const registerUser = async (userData: Omit<User, "id" | "createdAt" | "updatedAt">): Promise<string> => {
  try {
    if (!isFirebaseAvailable()) {
      const users = JSON.parse(localStorage.getItem("registeredUsers") || "[]")
      if (users.find((u: User) => u.email === userData.email)) {
        throw new Error("Email already registered")
      }

      const id = `local-user-${Date.now()}`
      const newUser = { ...userData, id, createdAt: new Date(), updatedAt: new Date() }
      users.push(newUser)
      localStorage.setItem("registeredUsers", JSON.stringify(users))
      return id
    }

    const existingUsers = await getDocs(query(collection(db, USERS_COLLECTION), where("email", "==", userData.email)))
    if (!existingUsers.empty) {
      throw new Error("Email already registered")
    }

    const docRef = await addDoc(collection(db, USERS_COLLECTION), {
      ...userData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
    return docRef.id
  } catch (error) {
    console.error("Error registering user:", error)
    throw error
  }
}

export const loginUser = async (email: string, password: string): Promise<User> => {
  try {
    if (!isFirebaseAvailable()) {
      const users = JSON.parse(localStorage.getItem("registeredUsers") || "[]")
      const user = users.find((u: User) => u.email === email && u.password === password)
      if (!user) throw new Error("Invalid credentials")
      return user
    }

    const usersQuery = query(collection(db, USERS_COLLECTION), where("email", "==", email))
    const querySnapshot = await getDocs(usersQuery)

    if (querySnapshot.empty) throw new Error("Invalid credentials")
    const userDoc = querySnapshot.docs[0]
    const userData = { id: userDoc.id, ...userDoc.data() } as User
    if (userData.password !== password) throw new Error("Invalid credentials")
    return userData
  } catch (error) {
    console.error("Login error:", error)
    throw error
  }
}

export const getCurrentUser = (): User | null => {
  if (typeof window === "undefined") return null
  const userData = localStorage.getItem("currentUser")
  return userData ? JSON.parse(userData) : null
}

export const setCurrentUser = (user: User): void => {
  if (typeof window !== "undefined") {
    localStorage.setItem("currentUser", JSON.stringify(user))
  }
}

export const clearCurrentUser = (): void => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("currentUser")
    localStorage.removeItem("currentMachine")
  }
}

// === Machine Functions ===
export const saveMachine = async (machineData: Omit<MachineData, "userId" | "companyId">): Promise<string> => {
  try {
    const currentUser = getCurrentUser()
    if (!currentUser) throw new Error("User not authenticated")

    const machineWithUser: MachineData = {
      ...machineData,
      userId: currentUser.id!,
      companyId: currentUser.id!,
    }

    if (!isFirebaseAvailable()) {
      const userMachines = JSON.parse(localStorage.getItem(`machines_${currentUser.id}`) || "[]")
      const id = machineWithUser.id || `local-${Date.now()}`
      const updatedMachine = { ...machineWithUser, id, updatedAt: new Date() }

      if (machineWithUser.id) {
        const index = userMachines.findIndex((m: MachineData) => m.id === machineWithUser.id)
        if (index >= 0) userMachines[index] = updatedMachine
        else userMachines.push(updatedMachine)
      } else {
        updatedMachine.createdAt = new Date()
        userMachines.push(updatedMachine)
      }

      localStorage.setItem(`machines_${currentUser.id}`, JSON.stringify(userMachines))
      return id
    }

    if (machineWithUser.id) {
      const machineRef = doc(db, MACHINES_COLLECTION, machineWithUser.id)
      const existing = await getDoc(machineRef)

      if (!existing.exists() || existing.data().userId !== currentUser.id) {
        throw new Error("Machine not found or access denied")
      }

      await updateDoc(machineRef, { ...machineWithUser, updatedAt: serverTimestamp() })
      return machineWithUser.id
    } else {
      const docRef = await addDoc(collection(db, MACHINES_COLLECTION), {
        ...machineWithUser,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
      return docRef.id
    }
  } catch (error) {
    console.error("Error saving machine:", error)
    throw error
  }
}

export const getMachine = async (id: string): Promise<MachineData | null> => {
  try {
    const currentUser = getCurrentUser()
    if (!currentUser) throw new Error("User not authenticated")

    if (!isFirebaseAvailable()) {
      const machines = JSON.parse(localStorage.getItem(`machines_${currentUser.id}`) || "[]")
      return machines.find((m: MachineData) => m.id === id) || null
    }

    const docRef = doc(db, MACHINES_COLLECTION, id)
    const docSnap = await getDoc(docRef)
    if (!docSnap.exists()) return null

    const data = { id: docSnap.id, ...docSnap.data() } as MachineData
    if (data.userId !== currentUser.id) throw new Error("Access denied")

    return data
  } catch (error) {
    console.error("Get machine error:", error)
    return null
  }
}

export const getAllMachines = async (): Promise<MachineData[]> => {
  try {
    const currentUser = getCurrentUser()
    if (!currentUser) return []

    if (!isFirebaseAvailable()) {
      return JSON.parse(localStorage.getItem(`machines_${currentUser.id}`) || "[]")
    }

    const machinesQuery = query(collection(db, MACHINES_COLLECTION), where("userId", "==", currentUser.id))
    const snapshot = await getDocs(machinesQuery)

    const machines: MachineData[] = []
    snapshot.forEach((doc) => {
      machines.push({ id: doc.id, ...doc.data() } as MachineData)
    })

    return machines
  } catch (error) {
    console.error("Get all machines error:", error)
    const currentUser = getCurrentUser()
    if (currentUser) {
      return JSON.parse(localStorage.getItem(`machines_${currentUser.id}`) || "[]")
    }
    return []
  }
}

export const deleteMachine = async (id: string): Promise<void> => {
  try {
    if (!isFirebaseAvailable()) {
      console.warn("Firebase not available, using local storage")
      const machines = JSON.parse(localStorage.getItem("savedMachines") || "[]")
      const filteredMachines = machines.filter((m: MachineData) => m.id !== id)
      localStorage.setItem("savedMachines", JSON.stringify(filteredMachines))
      return
    }

    await deleteDoc(doc(db, MACHINES_COLLECTION, id))
  } catch (error) {
    console.error("Error deleting machine:", error)
    // Fallback to localStorage
    const machines = JSON.parse(localStorage.getItem("savedMachines") || "[]")
    const filteredMachines = machines.filter((m: MachineData) => m.id !== id)
    localStorage.setItem("savedMachines", JSON.stringify(filteredMachines))
  }
}