"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

import { ArrowLeft, Edit, Trash2, Plus, Calculator, LayoutGrid, Table2 } from "lucide-react"
import { type MachineData, getAllMachines, deleteMachine } from "@/lib/firebaseService"
import Navbar from "@/components/navbar"

export default function MachineDashboard() {
  const router = useRouter()
  const [machines, setMachines] = useState<MachineData[]>([])
  const [loading, setLoading] = useState(true)
  const [isCardView, setIsCardView] = useState(true)

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn")
    if (isLoggedIn !== "true") {
      router.push("/")
    } else {
      fetchMachines()
    }
  }, [router])

  const fetchMachines = async () => {
    try {
      const machineList = await getAllMachines()
      setMachines(machineList)
    } catch (error) {
      console.error("Error fetching machines:", error)
    } finally {
      setLoading(false)
    }
  }

  const startNewCalculation = () => {
    localStorage.removeItem("currentMachine")
    router.push("/investment")
  }

  const handleEdit = (machine: MachineData) => {
    localStorage.setItem("currentMachine", JSON.stringify(machine))
    router.push("/investment")
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteMachine(id)
      setMachines((prev) => prev.filter((m) => m.id !== id))
    } catch (error) {
      console.error("Failed to delete machine:", error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg text-gray-700">Loading machines...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="md:ml-64 pt-4 px-4">
        <div className="flex justify-between items-center mb-6">
          <Button onClick={startNewCalculation}>
            <Plus className="w-4 h-4 mr-2" />
            Create New Machine
          </Button>
          <Button variant="outline" onClick={() => setIsCardView(!isCardView)}>
            {isCardView ? (
              <>
                <Table2 className="w-4 h-4 mr-2" /> Table View
              </>
            ) : (
              <>
                <LayoutGrid className="w-4 h-4 mr-2" /> Card View
              </>
            )}
          </Button>
        </div>

        {machines.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Calculator className="w-12 h-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No machines found</h3>
              <p className="text-gray-600 mb-4">Start by creating your first machine calculation</p>
              <Button onClick={startNewCalculation}>
                <Plus className="w-4 h-4 mr-2" />
                Create New Machine
              </Button>
            </CardContent>
          </Card>
        ) : isCardView ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {machines.map((machine) => (
              <Card key={machine.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{machine.machineName}</CardTitle>
                      <CardDescription>
                        {machine.investmentData?.machineCost
                          ? `₹${machine.investmentData.machineCost.toLocaleString()}`
                          : "No cost data"}
                      </CardDescription>
                    </div>
                    {machine.calculationData?.machineHourRate && (
                      <Badge variant="secondary">
                        ₹{machine.calculationData.machineHourRate.toFixed(2)}/hr
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Life:</span>
                      <span>{machine.investmentData?.lifeOfMachine || 0} years</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Working Hours:</span>
                      <span>{machine.investmentData?.workingHoursPerDay || 0} hrs/day</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Power:</span>
                      <span>{machine.powerData?.machinePower || 0} kW</span>
                    </div>
                    {machine.calculationData?.profit !== undefined && (
                      <div className="flex justify-between font-medium">
                        <span>Profit:</span>
                        <span>{machine.calculationData.profit}%</span>
                      </div>
                    )}
                  </div>
                  <div className="flex justify-between mt-4 pt-4 border-t">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(machine)}>
                      <Edit className="w-4 h-4 mr-1" />
                      View
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Trash2 className="w-4 h-4 mr-1" />
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete "{machine.machineName}" and its data.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(machine.id!)}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200 rounded-md text-sm">
              <thead>
                <tr className="bg-gray-100 text-left">
                  <th className="p-3">Machine Name</th>
                  <th className="p-3">Cost</th>
                  <th className="p-3">Life (years)</th>
                  <th className="p-3">Working Hours</th>
                  <th className="p-3">Power (kW)</th>
                  <th className="p-3">Rate/hr</th>
                  <th className="p-3">Profit (%)</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {machines.map((machine) => (
                  <tr key={machine.id} className="border-t">
                    <td className="p-3">{machine.machineName}</td>
                    <td className="p-3">
                      ₹{machine.investmentData?.machineCost?.toLocaleString() || "N/A"}
                    </td>
                    <td className="p-3">{machine.investmentData?.lifeOfMachine || 0}</td>
                    <td className="p-3">{machine.investmentData?.workingHoursPerDay || 0}</td>
                    <td className="p-3">{machine.powerData?.machinePower || 0}</td>
                    <td className="p-3">
                      ₹{machine.calculationData?.machineHourRate?.toFixed(2) || "N/A"}
                    </td>
                    <td className="p-3">{machine.calculationData?.profit || 0}</td>
                    <td className="p-3 flex flex-wrap gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleEdit(machine)}>
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="outline">
                            <Trash2 className="w-4 h-4 mr-1" />
                            Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete "{machine.machineName}" and its data.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(machine.id!)}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  )
}
