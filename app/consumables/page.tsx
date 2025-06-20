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
import { calculateTotalCostPerHour } from "@/lib/total-cost-calculator"
import TotalCostDisplay from "@/components/total-cost-display"
import { saveMachine } from "@/lib/firebaseService"
import MachineNamePopup from "@/components/machine-name-popup"

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
  const [consumablesCostPerHour, setConsumablesCostPerHour] = useState<number>(0)
  const [workingHoursPerDay, setWorkingHoursPerDay] = useState<number>(8)
  const [totalCostBreakdown, setTotalCostBreakdown] = useState<any>({})
  const [showMachineNamePopup, setShowMachineNamePopup] = useState(false)
  const [saving, setSaving] = useState(false)

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
      setWorkingHoursPerDay(machineData.investmentData.workingHoursPerDay || 8)
    } else {
      router.push("/investment")
    }
  }, [router])

  useEffect(() => {
    // Calculate consumables cost per hour using the same logic as calculateFinalMachineHourRate
    const monthlyCoolantCost = formData.coolantOilTopUpPerMonth * formData.coolantOilCostPerLitre
    const monthlyWasteCost = formData.wasteUsagePerMonth * formData.costOfWastePerKg
    const totalMonthlyConsumablesCost =
      monthlyCoolantCost +
      monthlyWasteCost +
      formData.monthlyMaintenanceCost +
      formData.otherConsumablesPerMonth +
      formData.annualMaintenanceCost / 12
    const costPerHour = totalMonthlyConsumablesCost / (workingHoursPerDay * 26) // 26 working days per month

    setConsumablesCostPerHour(costPerHour)
  }, [formData, workingHoursPerDay])

  useEffect(() => {
    // Calculate total cost breakdown
    const savedData = localStorage.getItem("currentMachine")
    let machineData = {}
    if (savedData) {
      machineData = JSON.parse(savedData)
    }

    // Update with current form data
    const currentMachineData = {
      ...machineData,
      consumablesData: formData,
    }

    const totalCost = calculateTotalCostPerHour(currentMachineData)
    setTotalCostBreakdown(totalCost)
  }, [formData, workingHoursPerDay])

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

  const saveAndContinue = async () => {
    if (!validateForm()) return

    // Check if machine name exists
    if (!machineName.trim()) {
      setShowMachineNamePopup(true)
      return
    }

    await saveToDatabase()
  }

  const saveToDatabase = async () => {
    setSaving(true)
    try {
      // Load existing data and merge
      const existingData = localStorage.getItem("currentMachine")
      if (existingData) {
        const machineData: MachineData = JSON.parse(existingData)
        machineData.consumablesData = formData

        // Save to Firebase
        const id = await saveMachine(machineData)
        machineData.id = id

        localStorage.setItem("currentMachine", JSON.stringify(machineData))
      }

      router.push("/tools-wages")
    } catch (error) {
      console.error("Error saving machine:", error)
      alert("Error saving data. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  const handleMachineNameSave = (name: string) => {
    setMachineName(name)
    setShowMachineNamePopup(false)
    // Trigger save after setting machine name
    setTimeout(() => saveToDatabase(), 100)
  }

  const goBack = () => {
    router.push("/power-consumption")
  }

  const renderInputWithBackgroundImage = (
    id: string,
    label: string,
    value: number,
    onChange: (value: string) => void,
    placeholder: string,
    imageUrl: string,
    unit: string,
    error?: string,
    required = false,
    description?: string,
  ) => (
    <div className="space-y-2">
      <div className="rounded-lg overflow-hidden bg-white shadow-lg flex flex-col">
        {/* Top: Image Banner */}
        <div
          className="h-48 bg-cover bg-center"
          style={{
            backgroundImage: `url(${imageUrl})`,
            backgroundBlendMode: "overlay",
            backgroundColor: "",
          }}
        ></div>

        {/* Bottom: Form Section */}
        <div className="p-6 space-y-4">
          <Label htmlFor={id} className="text-gray-900 font-semibold text-lg">
            {label} {required && <span className="text-red-600">*</span>}
          </Label>

          <Input
            id={id}
            type="number"
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={`h-12 text-lg font-medium bg-white border ${
              error ? "border-red-400" : "border-gray-300"
            } text-gray-900 placeholder:text-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-200`}
          />

          {description && <p className="text-gray-600 text-sm">{description}</p>}
        </div>
      </div>

      {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
    </div>
  )

  const renderCalculationCard = (
    title: string,
    value: number,
    unit: string,
    imageUrl: string,
    colorScheme = "blue",
  ) => {
    return (
      <div
        className="relative p-6 bg-cover bg-center text-white rounded-lg min-h-[200px] flex flex-col justify-end"
        style={{
          backgroundImage: `url(${imageUrl})`,
          backgroundBlendMode: "overlay",
          backgroundColor: "",
        }}
      >
        <div className="space-y-2">
          <div className="text-white font-medium text-lg">{title}</div>
          <div className="text-3xl font-bold text-white">₹{value.toFixed(2)}</div>
          <div className="text-white/80 text-sm">{unit}</div>
        </div>
      </div>
    )
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
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Header */}
          <div className="sticky top-10 z-20 bg-white border-b border-gray-200">
            <div className="px-4 py-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 sm:space-x-6">
                {/* Icon and Text */}
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Package className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Consumables & Maintenance</h1>
                    <p className="text-sm text-gray-600">
                      Enter consumables and maintenance costs for <span className="font-medium">{machineName}</span>
                    </p>
                  </div>
                </div>

                {/* Cost Display */}
                <div className="w-full sm:w-auto">
                  <TotalCostDisplay
                    totalCost={totalCostBreakdown}
                    currentStep={4}
                    machineName={machineName || "Machine"}
                  />
                </div>
              </div>
            </div>

            {/* Optional Alert below Header */}
            <Alert className="bg-blue-50 border-t border-blue-200">
              <Info className="w-4 h-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                This information will be used to calculate the consumables and maintenance cost per hour for your
                machine.
              </AlertDescription>
            </Alert>
          </div>

          <div className="space-y-8">
            {/* Coolant & Waste */}
            <Card>
              <CardHeader>
                <CardTitle>Coolant & Waste</CardTitle>
                <CardDescription>Enter details about coolant oil and waste usage</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {renderInputWithBackgroundImage(
                    "coolantOilTopUpPerMonth",
                    "Coolant Oil Top-up Per Month",
                    formData.coolantOilTopUpPerMonth,
                    (value) => handleInputChange("coolantOilTopUpPerMonth", value),
                    "e.g., 5",
                    "https://www.shutterstock.com/shutterstock/videos/3678613201/thumb/1.jpg?ip=x480",
                    "litres",
                  )}

                  {renderInputWithBackgroundImage(
                    "coolantOilCostPerLitre",
                    "Coolant Oil Cost Per Litre",
                    formData.coolantOilCostPerLitre,
                    (value) => handleInputChange("coolantOilCostPerLitre", value),
                    "e.g., 250",
                    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTBmJz4oZO2jzob9D__mtm8wrjfPzJWDFY_UAHaXyGGOir2NMoR2UkAEYy5FbAFcI56RII&usqp=CAU",
                    "₹",
                  )}

                  {renderInputWithBackgroundImage(
                    "wasteUsagePerMonth",
                    "Waste Usage Per Month",
                    formData.wasteUsagePerMonth,
                    (value) => handleInputChange("wasteUsagePerMonth", value),
                    "e.g., 2",
                    "https://t3.ftcdn.net/jpg/10/04/22/34/360_F_1004223473_DPNanYErcQOwxy8IPZgU9yfcUcSjEAdA.jpg",
                    "kg",
                  )}

                  {renderInputWithBackgroundImage(
                    "costOfWastePerKg",
                    "Cost of Waste Per Kg",
                    formData.costOfWastePerKg,
                    (value) => handleInputChange("costOfWastePerKg", value),
                    "e.g., 50",
                    "https://revnew.com/hubfs/cost-revenue-ratio.jpg",
                    "₹",
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Maintenance Costs */}
            <Card>
              <CardHeader>
                <CardTitle>Maintenance Costs</CardTitle>
                <CardDescription>Enter details about maintenance costs</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {renderInputWithBackgroundImage(
                    "monthlyMaintenanceCost",
                    "Monthly Maintenance Cost",
                    formData.monthlyMaintenanceCost,
                    (value) => handleInputChange("monthlyMaintenanceCost", value),
                    "e.g., 2000",
                    "https://assets-news.housing.com/news/wp-content/uploads/2017/06/25095820/Maintenance-charges-that-buyers-need-to-be-aware-of-FB-1200x700-compressed.jpg",
                    "₹",
                  )}

                  {renderInputWithBackgroundImage(
                    "annualMaintenanceCost",
                    "Annual Maintenance Cost",
                    formData.annualMaintenanceCost,
                    (value) => handleInputChange("annualMaintenanceCost", value),
                    "e.g., 24000",
                    "https://antmyerp.com/wp-content/uploads/2021/12/AMC-Management-Software.webp",
                    "₹",
                  )}

                  {renderInputWithBackgroundImage(
                    "otherConsumablesPerMonth",
                    "Other Consumables Per Month",
                    formData.otherConsumablesPerMonth,
                    (value) => handleInputChange("otherConsumablesPerMonth", value),
                    "e.g., 1000",
                    "https://www.avsengineering.sg/wp-content/uploads/2024/11/Consumables.jpg",
                    "₹",
                    undefined,
                    false,
                    "Include other consumables like cutting tools, lubricants, etc.",
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Cost Summary */}
            {totalMonthlyCost > 0 && (
              <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
                <CardHeader>
                  <CardTitle className="text-green-800">Cost Summary</CardTitle>
                  <CardDescription className="text-green-700">
                    Monthly consumables and maintenance costs breakdown
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {coolantCost > 0 &&
                      renderCalculationCard(
                        "Coolant Cost",
                        coolantCost,
                        "Per month",
                        "https://cdn-icons-png.flaticon.com/512/7751/7751861.png",
                        "green",
                      )}

                    {wasteCost > 0 &&
                      renderCalculationCard(
                        "Waste Cost",
                        wasteCost,
                        "Per month",
                        "https://cdn-icons-png.flaticon.com/512/9028/9028526.png",
                        "green",
                      )}

                    {formData.monthlyMaintenanceCost + annualMaintenanceCostPerMonth > 0 &&
                      renderCalculationCard(
                        "Maintenance Cost",
                        formData.monthlyMaintenanceCost + annualMaintenanceCostPerMonth,
                        "Per month",
                        "https://www.scnsoft.com/blog-pictures/crm-pics/customer-service-costs.png",
                        "blue",
                      )}

                    {renderCalculationCard(
                      "Total Cost",
                      totalMonthlyCost,
                      "Per month",
                      "https://cdn-icons-png.flaticon.com/512/3191/3191648.png",
                      "blue",
                    )}
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
                className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                disabled={saving}
              >
                {saving ? "Saving..." : "Save & Continue"}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </main>
      <MachineNamePopup
        isOpen={showMachineNamePopup}
        onSave={handleMachineNameSave}
        onCancel={() => setShowMachineNamePopup(false)}
      />
    </div>
  )
}
