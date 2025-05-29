"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, ArrowRight, Package, Info } from "lucide-react"
import type { MachineData } from "@/lib/firebaseService"
import Navbar from "@/components/navbar"
import Link from "next/link"

import Image from "next/image"
export default function ConsumablesPage() {
  const router = useRouter()
  const [formData, setFormData] = useState<MachineData["consumablesData"]>({
    coolantOilTopUpPerMonth: 0,
    coolantOilCostPerLitre: 0,
    wasteUsagePerMonth: 0,
    costOfWastePerKg: 0,
    monthlyMaintenanceCost: 0,
    annualMaintenanceCost: 0,
    otherConsumablesPerMonth: 0,
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
      setFormData(machineData.consumablesData)
      setMachineName(machineData.machineName)
    } else {
      router.push("/investment")
    }
  }, [router])

  const validateForm = () => {
    // No strict validation required for this page
    return true
  }

  const handleInputChange = (field: keyof MachineData["consumablesData"], value: string) => {
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
      machineData.consumablesData = formData
      localStorage.setItem("currentMachine", JSON.stringify(machineData))
    }

    router.push("/tools-wages")
  }

  const goBack = () => {
    router.push("/power-consumption")
  }

  // Calculate monthly costs
  const coolantCost = formData.coolantOilTopUpPerMonth * formData.coolantOilCostPerLitre
  const wasteCost = formData.wasteUsagePerMonth * formData.costOfWastePerKg
  const annualMaintenanceCostPerMonth = formData.annualMaintenanceCost / 12
  const totalMonthlyCost =
    coolantCost +
    wasteCost +
    formData.monthlyMaintenanceCost +
    annualMaintenanceCostPerMonth +
    formData.otherConsumablesPerMonth

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar title="Consumables" currentStep={4} totalSteps={7} />

      <main className="md:ml-64 pt-4">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Breadcrumb */}
          <div className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
            <Link href="/dashboard" className="hover:text-blue-600">
              Dashboard
            </Link>
            <span>/</span>
            <Link href="/investment" className="hover:text-blue-600">
              Investment
            </Link>
            <span>/</span>
            <span>...</span>
            <span>/</span>
            <Link href="/power-consumption" className="hover:text-blue-600">
              Power
            </Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">Consumables</span>
          </div>

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Consumables & Maintenance</h1>
                <p className="text-gray-600">
                  Enter consumables and maintenance costs for <span className="font-medium">{machineName}</span>
                </p>
              </div>
            </div>
    <div>
      <Image
        src="https://padia.org/wp-content/uploads/2023/10/Industrial-Consumables-Sales.jpg"
        alt="Remote Image"
        width={900} // original width for aspect ratio
        height={300} // original height for aspect ratio
        style={{ maxWidth: '900px', maxHeight: '200px', width: '100%', height: 'auto' }}
      />
    </div>
            <Alert className="bg-blue-50 border-blue-200">
              <Info className="w-4 h-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                This information will be used to calculate the consumables and maintenance cost per hour for your
                machine.
              </AlertDescription>
            </Alert>
          </div>

          <div className="space-y-6">
            {/* Coolant & Waste */}
            <Card>
              <CardHeader>
                <CardTitle>Coolant & Waste</CardTitle>
                <CardDescription>Enter details about coolant oil and waste usage</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="coolantOilTopUpPerMonth" className="text-sm font-medium">
                      Coolant Oil Top-up Per Month (litres)
                    </Label>
                    <Input
                      id="coolantOilTopUpPerMonth"
                      type="number"
                      step="0.01"
                      value={formData.coolantOilTopUpPerMonth || ""}
                      onChange={(e) => handleInputChange("coolantOilTopUpPerMonth", e.target.value)}
                      placeholder="e.g., 5"
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="coolantOilCostPerLitre" className="text-sm font-medium">
                      Coolant Oil Cost Per Litre (₹)
                    </Label>
                    <Input
                      id="coolantOilCostPerLitre"
                      type="number"
                      step="0.01"
                      value={formData.coolantOilCostPerLitre || ""}
                      onChange={(e) => handleInputChange("coolantOilCostPerLitre", e.target.value)}
                      placeholder="e.g., 250"
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="wasteUsagePerMonth" className="text-sm font-medium">
                      Waste Usage Per Month (kg)
                    </Label>
                    <Input
                      id="wasteUsagePerMonth"
                      type="number"
                      step="0.01"
                      value={formData.wasteUsagePerMonth || ""}
                      onChange={(e) => handleInputChange("wasteUsagePerMonth", e.target.value)}
                      placeholder="e.g., 2"
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="costOfWastePerKg" className="text-sm font-medium">
                      Cost of Waste Per Kg (₹)
                    </Label>
                    <Input
                      id="costOfWastePerKg"
                      type="number"
                      step="0.01"
                      value={formData.costOfWastePerKg || ""}
                      onChange={(e) => handleInputChange("costOfWastePerKg", e.target.value)}
                      placeholder="e.g., 50"
                      className="h-11"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Maintenance Costs */}
            <Card>
              <CardHeader>
                <CardTitle>Maintenance Costs</CardTitle>
                <CardDescription>Enter details about maintenance costs</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="monthlyMaintenanceCost" className="text-sm font-medium">
                      Monthly Maintenance Cost (₹)
                    </Label>
                    <Input
                      id="monthlyMaintenanceCost"
                      type="number"
                      step="0.01"
                      value={formData.monthlyMaintenanceCost || ""}
                      onChange={(e) => handleInputChange("monthlyMaintenanceCost", e.target.value)}
                      placeholder="e.g., 2000"
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="annualMaintenanceCost" className="text-sm font-medium">
                      Annual Maintenance Cost (₹)
                    </Label>
                    <Input
                      id="annualMaintenanceCost"
                      type="number"
                      step="0.01"
                      value={formData.annualMaintenanceCost || ""}
                      onChange={(e) => handleInputChange("annualMaintenanceCost", e.target.value)}
                      placeholder="e.g., 24000"
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="otherConsumablesPerMonth" className="text-sm font-medium">
                      Other Consumables Per Month (₹)
                    </Label>
                    <Input
                      id="otherConsumablesPerMonth"
                      type="number"
                      step="0.01"
                      value={formData.otherConsumablesPerMonth || ""}
                      onChange={(e) => handleInputChange("otherConsumablesPerMonth", e.target.value)}
                      placeholder="e.g., 1000"
                      className="h-11"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Cost Summary */}
            <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
              <CardHeader>
                <CardTitle className="text-green-800">Cost Summary</CardTitle>
                <CardDescription className="text-green-700">Monthly consumables and maintenance costs</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-4 bg-white rounded-lg border border-green-200">
                    <div className="text-sm font-medium text-green-800 mb-1">Coolant Cost</div>
                    <div className="text-xl font-bold text-green-900">₹{coolantCost.toFixed(2)}</div>
                    <div className="text-xs text-green-600 mt-1">Per month</div>
                  </div>

                  <div className="p-4 bg-white rounded-lg border border-green-200">
                    <div className="text-sm font-medium text-green-800 mb-1">Waste Cost</div>
                    <div className="text-xl font-bold text-green-900">₹{wasteCost.toFixed(2)}</div>
                    <div className="text-xs text-green-600 mt-1">Per month</div>
                  </div>

                  <div className="p-4 bg-white rounded-lg border border-blue-200">
                    <div className="text-sm font-medium text-blue-800 mb-1">Maintenance Cost</div>
                    <div className="text-xl font-bold text-blue-900">
                      ₹{(formData.monthlyMaintenanceCost + annualMaintenanceCostPerMonth).toFixed(2)}
                    </div>
                    <div className="text-xs text-blue-600 mt-1">Per month</div>
                  </div>

                  <div className="p-4 bg-white rounded-lg border border-blue-200">
                    <div className="text-sm font-medium text-blue-800 mb-1">Total Cost</div>
                    <div className="text-xl font-bold text-blue-900">₹{totalMonthlyCost.toFixed(2)}</div>
                    <div className="text-xs text-blue-600 mt-1">Per month</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex flex-col sm:flex-row justify-between gap-4 pt-6">
              <Button variant="outline" onClick={goBack} className="w-full sm:w-auto">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
              <Button
                onClick={saveAndContinue}
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
