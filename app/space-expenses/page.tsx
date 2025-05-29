"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, ArrowRight, Building, Info } from "lucide-react"
import type { MachineData } from "@/lib/firebaseService"
import Navbar from "@/components/navbar"
import Link from "next/link"
import Image from "next/image"
export default function SpaceExpensesPage() {
  const router = useRouter()
  const [formData, setFormData] = useState<MachineData["spaceData"]>({
    factoryRentPerMonth: 0,
    factorySpaceInSqFt: 0,
    spaceOccupiedByMachine: 0,
    numberOfMachinesInFactory: 0,
    commonSpaceInSqFt: 0,
  })
  const [errors, setErrors] = useState<any>({})
  const [machineName, setMachineName] = useState("")

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn")
    if (isLoggedIn !== "true") {
      router.push("/")
      return
    }

    // Load existing data if available
    const savedData = localStorage.getItem("currentMachine")
    if (savedData) {
      const machineData: MachineData = JSON.parse(savedData)
      setFormData(machineData.spaceData)
      setMachineName(machineData.machineName)
    } else {
      router.push("/investment")
    }
  }, [router])

  const validateForm = () => {
    const newErrors: any = {}

    if (!formData.factoryRentPerMonth || formData.factoryRentPerMonth <= 0)
      newErrors.factoryRentPerMonth = "Valid factory rent is required"
    if (!formData.factorySpaceInSqFt || formData.factorySpaceInSqFt <= 0)
      newErrors.factorySpaceInSqFt = "Valid factory space is required"
    if (!formData.spaceOccupiedByMachine || formData.spaceOccupiedByMachine <= 0)
      newErrors.spaceOccupiedByMachine = "Valid machine space is required"
    if (!formData.numberOfMachinesInFactory || formData.numberOfMachinesInFactory <= 0)
      newErrors.numberOfMachinesInFactory = "Valid number of machines is required"

    if (formData.spaceOccupiedByMachine > formData.factorySpaceInSqFt)
      newErrors.spaceOccupiedByMachine = "Machine space cannot exceed total factory space"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: keyof MachineData["spaceData"], value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: Number.parseFloat(value) || 0,
    }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev: any) => ({ ...prev, [field]: null }))
    }
  }

  const saveAndContinue = () => {
    if (!validateForm()) return

    // Load existing data and merge
    const existingData = localStorage.getItem("currentMachine")
    if (existingData) {
      const machineData: MachineData = JSON.parse(existingData)
      machineData.spaceData = formData
      localStorage.setItem("currentMachine", JSON.stringify(machineData))
    }

    router.push("/power-consumption")
  }

  const goBack = () => {
    router.push("/investment")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar title="Space Expenses" currentStep={2} totalSteps={7} />

      <main className="md:ml-64 pt-4">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Breadcrumb */}
          {/* <div className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
            <Link href="/dashboard" className="hover:text-blue-600">
              Dashboard
            </Link>
            <span>/</span>
            <Link href="/investment" className="hover:text-blue-600">
              Investment
            </Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">Space Expenses</span>
          </div> */}

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Building className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Space Expenses</h1>
                <p className="text-gray-600">
                  Enter factory space details for <span className="font-medium">{machineName}</span>
                </p>
              </div>
            </div>
    <div>
      <Image
        src="https://estimatorflorida.com/wp-content/uploads/2022/04/cost-to-build-a-warehouse.jpg"
        alt="Remote Image"
        width={900} // original width for aspect ratio
        height={300} // original height for aspect ratio
        style={{ maxWidth: '900px', maxHeight: '200px', width: '100%', height: 'auto' }}
      />
    </div>
            <Alert className="bg-blue-50 border-blue-200">
              <Info className="w-4 h-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                This information will be used to calculate the space cost per hour for your machine.
              </AlertDescription>
            </Alert>
          </div>

          <div className="space-y-6">
            {/* Factory Space Information */}
            <Card>
              <CardHeader>
                <CardTitle>Factory Space Information</CardTitle>
                <CardDescription>Enter details about your factory space and rent</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="factoryRentPerMonth" className="text-sm font-medium">
                      Factory Rent Per Month (₹) <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="factoryRentPerMonth"
                      type="number"
                      value={formData.factoryRentPerMonth || ""}
                      onChange={(e) => handleInputChange("factoryRentPerMonth", e.target.value)}
                      placeholder="e.g., 50000"
                      className={`h-11 ${errors.factoryRentPerMonth ? "border-red-500" : ""}`}
                    />
                    {errors.factoryRentPerMonth && <p className="text-sm text-red-600">{errors.factoryRentPerMonth}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="factorySpaceInSqFt" className="text-sm font-medium">
                      Total Factory Space (sq ft) <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="factorySpaceInSqFt"
                      type="number"
                      value={formData.factorySpaceInSqFt || ""}
                      onChange={(e) => handleInputChange("factorySpaceInSqFt", e.target.value)}
                      placeholder="e.g., 2000"
                      className={`h-11 ${errors.factorySpaceInSqFt ? "border-red-500" : ""}`}
                    />
                    {errors.factorySpaceInSqFt && <p className="text-sm text-red-600">{errors.factorySpaceInSqFt}</p>}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Machine Space Information */}
            <Card>
              <CardHeader>
                <CardTitle>Machine Space Information</CardTitle>
                <CardDescription>Enter details about the space occupied by your machine</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="spaceOccupiedByMachine" className="text-sm font-medium">
                      Space Occupied by Machine (sq ft) <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="spaceOccupiedByMachine"
                      type="number"
                      value={formData.spaceOccupiedByMachine || ""}
                      onChange={(e) => handleInputChange("spaceOccupiedByMachine", e.target.value)}
                      placeholder="e.g., 100"
                      className={`h-11 ${errors.spaceOccupiedByMachine ? "border-red-500" : ""}`}
                    />
                    {errors.spaceOccupiedByMachine && (
                      <p className="text-sm text-red-600">{errors.spaceOccupiedByMachine}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="numberOfMachinesInFactory" className="text-sm font-medium">
                      Number of Machines in Factory <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="numberOfMachinesInFactory"
                      type="number"
                      value={formData.numberOfMachinesInFactory || ""}
                      onChange={(e) => handleInputChange("numberOfMachinesInFactory", e.target.value)}
                      placeholder="e.g., 5"
                      className={`h-11 ${errors.numberOfMachinesInFactory ? "border-red-500" : ""}`}
                    />
                    {errors.numberOfMachinesInFactory && (
                      <p className="text-sm text-red-600">{errors.numberOfMachinesInFactory}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="commonSpaceInSqFt" className="text-sm font-medium">
                      Common Space (sq ft)
                    </Label>
                    <Input
                      id="commonSpaceInSqFt"
                      type="number"
                      value={formData.commonSpaceInSqFt || ""}
                      onChange={(e) => handleInputChange("commonSpaceInSqFt", e.target.value)}
                      placeholder="e.g., 500"
                      className="h-11"
                    />
                    <p className="text-xs text-gray-500">
                      Common space includes walkways, storage areas, and other shared spaces
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Space Cost Calculation */}
            {formData.factoryRentPerMonth > 0 && formData.factorySpaceInSqFt > 0 && (
              <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
                <CardHeader>
                  <CardTitle className="text-green-800">Space Cost Calculation</CardTitle>
                  <CardDescription className="text-green-700">
                    Estimated space cost based on your inputs
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-4 bg-white rounded-lg border border-green-200">
                      <div className="text-sm font-medium text-green-800 mb-1">Rent per sq ft</div>
                      <div className="text-2xl font-bold text-green-900">
                        ₹{(formData.factoryRentPerMonth / formData.factorySpaceInSqFt).toFixed(2)}
                      </div>
                      <div className="text-xs text-green-600 mt-1">Per month</div>
                    </div>

                    <div className="p-4 bg-white rounded-lg border border-blue-200">
                      <div className="text-sm font-medium text-blue-800 mb-1">Machine Space Cost</div>
                      <div className="text-2xl font-bold text-blue-900">
                        ₹
                        {(
                          (formData.factoryRentPerMonth / formData.factorySpaceInSqFt) *
                          formData.spaceOccupiedByMachine
                        ).toFixed(2)}
                      </div>
                      <div className="text-xs text-blue-600 mt-1">Per month</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Navigation */}
            <div className="flex flex-col sm:flex-row justify-between gap-4 pt-6">
              <Button variant="outline" onClick={goBack} className="w-full sm:w-auto">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
              <Button
                onClick={saveAndContinue}
                disabled={
                  !formData.factoryRentPerMonth ||
                  !formData.factorySpaceInSqFt ||
                  !formData.spaceOccupiedByMachine ||
                  !formData.numberOfMachinesInFactory
                }
                className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                Save & Continue
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
