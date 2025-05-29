"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Plus,
  Calculator,
  List,
  TrendingUp,
  Clock,
  DollarSign,
  BarChart3,
  ArrowRight,
  Zap,
  Settings,
  FileText,
  AlertTriangle,
  Building,
} from "lucide-react"
import Link from "next/link"
import Navbar from "@/components/navbar"
import { getAllMachines, getCurrentUser, type MachineData } from "@/lib/firebaseService"
import { initializeDemoData } from "@/lib/demoData"

export default function Dashboard() {
  const router = useRouter()
  const [machines, setMachines] = useState<MachineData[]>([])
  const [loading, setLoading] = useState(true)
  const [isClient, setIsClient] = useState(false)
  const [firebaseError, setFirebaseError] = useState(false)

  useEffect(() => {
    setIsClient(true)
    // Initialize demo data
    initializeDemoData()
  }, [])

  useEffect(() => {
    if (!isClient) return

    const isLoggedIn = localStorage.getItem("isLoggedIn")
    const currentUser = getCurrentUser()

    if (isLoggedIn !== "true" || !currentUser) {
      router.push("/")
      return
    }

    loadMachines()
  }, [router, isClient])

  const loadMachines = async () => {
    try {
      const machineList = await getAllMachines()
      setMachines(machineList)
      setFirebaseError(false)
    } catch (error) {
      console.error("Error loading machines:", error)
      setFirebaseError(true)
      setMachines([])
    } finally {
      setLoading(false)
    }
  }

  const startNewCalculation = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("currentMachine")
    }
    router.push("/investment")
  }

  const getStats = () => {
    const totalMachines = machines.length
    const completedCalculations = machines.filter((m) => m.calculationData?.machineHourRate).length
    const averageHourRate =
      machines.length > 0
        ? machines.reduce((sum, m) => sum + (m.calculationData?.machineHourRate || 0), 0) / machines.length
        : 0
    const totalInvestment = machines.reduce((sum, m) => sum + (m.investmentData?.machineCost || 0), 0)

    return { totalMachines, completedCalculations, averageHourRate, totalInvestment }
  }

  // Show loading state during SSR and initial client load
  if (!isClient || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-600">Loading...</span>
        </div>
      </div>
    )
  }

  const currentUser = getCurrentUser()
  const stats = getStats()

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="md:ml-64 pt-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Firebase Warning */}
          {firebaseError && (
            <Alert className="mb-6 bg-yellow-50 border-yellow-200">
              <AlertTriangle className="w-4 h-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800">
                <strong>Notice:</strong> Firebase connection unavailable. The app is running in offline mode. Your
                calculations will be saved locally to your device.
              </AlertDescription>
            </Alert>
          )}

          {/* Welcome Section */}
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <Building className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Welcome to {currentUser?.companyName || "Your Company"}
                </h1>
                <p className="text-gray-600">
                  Manage your machine calculations and analyze cost efficiency • {currentUser?.contactPerson}
                </p>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm font-medium">Your Machines</p>
                    <p className="text-3xl font-bold">{stats.totalMachines}</p>
                  </div>
                  <Calculator className="w-8 h-8 text-blue-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm font-medium">Completed</p>
                    <p className="text-3xl font-bold">{stats.completedCalculations}</p>
                  </div>
                  <BarChart3 className="w-8 h-8 text-green-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm font-medium">Avg. Hour Rate</p>
                    <p className="text-3xl font-bold">₹{stats.averageHourRate.toFixed(0)}</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-purple-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100 text-sm font-medium">Total Investment</p>
                    <p className="text-3xl font-bold">₹{(stats.totalInvestment / 100000).toFixed(1)}L</p>
                  </div>
                  <DollarSign className="w-8 h-8 text-orange-200" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Zap className="w-5 h-5 mr-2 text-blue-600" />
                  Quick Actions
                </CardTitle>
                <CardDescription>Get started with common tasks for {currentUser?.companyName}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Button
                    onClick={startNewCalculation}
                    className="h-20 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  >
                    <div className="text-center">
                      <Plus className="w-6 h-6 mx-auto mb-2" />
                      <div className="font-medium">New Calculation</div>
                      <div className="text-xs opacity-90">Start fresh machine analysis</div>
                    </div>
                  </Button>

                  <Link href="/machines">
                    <Button variant="outline" className="h-20 w-full border-2 hover:bg-gray-50">
                      <div className="text-center">
                        <List className="w-6 h-6 mx-auto mb-2 text-gray-600" />
                        <div className="font-medium text-gray-900">View All Machines</div>
                        <div className="text-xs text-gray-500">Manage existing calculations</div>
                      </div>
                    </Button>
                  </Link>

                  <Link href="/reports">
                    <Button variant="outline" className="h-20 w-full border-2 hover:bg-gray-50">
                      <div className="text-center">
                        <FileText className="w-6 h-6 mx-auto mb-2 text-gray-600" />
                        <div className="font-medium text-gray-900">Generate Reports</div>
                        <div className="text-xs text-gray-500">Download PDF reports</div>
                      </div>
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="w-5 h-5 mr-2 text-gray-600" />
                  Calculation Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Completion Rate</span>
                      <span>
                        {stats.totalMachines > 0
                          ? Math.round((stats.completedCalculations / stats.totalMachines) * 100)
                          : 0}
                        %
                      </span>
                    </div>
                    <Progress
                      value={stats.totalMachines > 0 ? (stats.completedCalculations / stats.totalMachines) * 100 : 0}
                      className="h-2"
                    />
                  </div>
                  <div className="text-sm text-gray-600">
                    {stats.completedCalculations} of {stats.totalMachines} machines have complete calculations
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Machines */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center">
                    <Clock className="w-5 h-5 mr-2 text-gray-600" />
                    Your Recent Machines
                  </CardTitle>
                  <CardDescription>Latest machine calculations for {currentUser?.companyName}</CardDescription>
                </div>
                <Link href="/machines">
                  <Button variant="outline" size="sm">
                    View All
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {machines.length === 0 ? (
                <div className="text-center py-8">
                  <Calculator className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No machines yet</h3>
                  <p className="text-gray-600 mb-4">
                    Start by creating your first machine calculation for {currentUser?.companyName}
                  </p>
                  <Button onClick={startNewCalculation}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create First Machine
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {machines.slice(0, 5).map((machine) => (
                    <div
                      key={machine.id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Calculator className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{machine.machineName || "Unnamed Machine"}</h4>
                          <p className="text-sm text-gray-600">
                            Cost: ₹{machine.investmentData?.machineCost?.toLocaleString() || "0"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        {machine.calculationData?.machineHourRate ? (
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            ₹{machine.calculationData.machineHourRate.toFixed(2)}/hr
                          </Badge>
                        ) : (
                          <Badge variant="outline">Incomplete</Badge>
                        )}
                        <Link
                          href={`/investment`}
                          onClick={() => {
                            if (typeof window !== "undefined") {
                              localStorage.setItem("currentMachine", JSON.stringify(machine))
                            }
                          }}
                        >
                          <Button variant="ghost" size="sm">
                            <ArrowRight className="w-4 h-4" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
