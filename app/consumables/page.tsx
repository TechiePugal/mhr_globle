"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, ArrowRight, Package, Info } from 'lucide-react'
import type { MachineData } from "@/lib/firebaseService"
import Navbar from "@/components/navbar"
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
  const [consumablesCostPerHour, setConsumablesCostPerHour] = useState<number>(0)
  const [workingHoursPerDay, setWorkingHoursPerDay] = useState<number>(8)

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
    const totalMonthlyConsumablesCost = monthlyCoolantCost + monthlyWasteCost + formData.monthlyMaintenanceCost + formData.otherConsumablesPerMonth + (formData.annualMaintenanceCost / 12)
    const costPerHour = totalMonthlyConsumablesCost / (workingHoursPerDay * 26) // 26 working days per month

    setConsumablesCostPerHour(costPerHour)
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

  const renderInputWithBackgroundImage = (
    id: string,
    label: string,
    value: number,
    onChange: (value: string) => void,
    placeholder: string,
    imageUrl: string,
    unit: string,
    error?: string,
    required: boolean = false,
    description?: string
  ) => (
    <div className="space-y-2">
      <div
        className="relative p-6 bg-cover bg-center text-white rounded-lg min-h-[200px] flex flex-col justify-between hover:shadow-lg transition-shadow duration-200"
        style={{
          backgroundImage: `url(${imageUrl})`,
          backgroundBlendMode: "overlay",
          backgroundColor: "rgba(0, 0, 0, 0.6)",
        }}
      >
        <div className="space-y-4">
          <Label htmlFor={id} className="text-white font-semibold text-lg">
            {label} {unit && <span className="text-yellow-300">({unit})</span>} {required && <span className="text-red-300">*</span>}
          </Label>
          
          <Input
            id={id}
            type="number"
            step="0.01"
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={`h-12 text-lg font-medium bg-white/90 backdrop-blur-sm border-white/50 text-gray-900 placeholder:text-gray-600 ${
              error ? "border-red-400" : "border-white/50"
            } focus:border-white focus:bg-white`}
          />
          
          {description && (
            <p className="text-white/80 text-sm">{description}</p>
          )}
        </div>
      </div>
      {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
    </div>
  )

  const renderCalculationCard = (title: string, value: number, unit: string, imageUrl: string, colorScheme: string = "blue") => {
    return (
      <div
        className="relative p-6 bg-cover bg-center text-white rounded-lg min-h-[200px] flex flex-col justify-end"
        style={{
          backgroundImage: `url(${imageUrl})`,
          backgroundBlendMode: "overlay",
          backgroundColor: "rgba(0, 0, 0, 0.5)",
        }}
      >
        <div className="space-y-2">
          <div className="text-white font-medium text-lg">{title}</div>
          <div className="text-3xl font-bold text-white">
            ₹{value.toFixed(2)}
          </div>
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

            {/* Consumables Cost Per Hour Display */}

  <div className="relative mb-6 rounded-lg overflow-hidden shadow-lg max-w-full h-[200px] md:h-[200px]">
    {/* Background Image */}
    <Image
      src="https://padia.org/wp-content/uploads/2023/10/Industrial-Consumables-Sales.jpg"
      alt="Industrial Consumables"
      fill
      className="object-cover w-full h-full"
    />

    {/* Overlay Content */}
    <div className="absolute inset-0 bg-purple-900 bg-opacity-70 p-4 md:p-6 flex flex-col justify-center">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-white text-sm md:text-base">
        <div>
          <h3 className="text-base md:text-lg font-semibold mb-1">Consumables Cost per Hour</h3>
          <div className="text-2xl md:text-4xl font-bold mb-1">₹{consumablesCostPerHour.toFixed(2)}</div>
          <p>per hour</p>
        </div>
        <div className="space-y-1 md:space-y-2">
          <div className="flex justify-between">
            <span>Coolant Cost:</span>
            <span>₹{coolantCost?.toLocaleString() || "0"}/month</span>
          </div>
          <div className="flex justify-between">
            <span>Waste Cost:</span>
            <span>₹{wasteCost?.toLocaleString() || "0"}/month</span>
          </div>
          <div className="flex justify-between">
            <span>Maintenance Cost:</span>
            <span>₹{(formData.monthlyMaintenanceCost + annualMaintenanceCostPerMonth).toLocaleString()}/month</span>
          </div>
          <div className="flex justify-between font-semibold border-t border-white/30 pt-1 mt-1">
            <span>Total Monthly Cost:</span>
            <span>₹{totalMonthlyCost?.toLocaleString() || "0"}</span>
          </div>
        </div>
      </div>
    </div>
  </div>



            <Alert className="bg-blue-50 border-blue-200">
              <Info className="w-4 h-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                This information will be used to calculate the consumables and maintenance cost per hour for your machine.
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
                    "litres"
                  )}

                  {renderInputWithBackgroundImage(
                    "coolantOilCostPerLitre",
                    "Coolant Oil Cost Per Litre",
                    formData.coolantOilCostPerLitre,
                    (value) => handleInputChange("coolantOilCostPerLitre", value),
                    "e.g., 250",
                    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTBmJz4oZO2jzob9D__mtm8wrjfPzJWDFY_UAHaXyGGOir2NMoR2UkAEYy5FbAFcI56RII&usqp=CAU",
                    "₹"
                  )}

                  {renderInputWithBackgroundImage(
                    "wasteUsagePerMonth",
                    "Waste Usage Per Month",
                    formData.wasteUsagePerMonth,
                    (value) => handleInputChange("wasteUsagePerMonth", value),
                    "e.g., 2",
                    "https://t3.ftcdn.net/jpg/10/04/22/34/360_F_1004223473_DPNanYErcQOwxy8IPZgU9yfcUcSjEAdA.jpg",
                    "kg"
                  )}

                  {renderInputWithBackgroundImage(
                    "costOfWastePerKg",
                    "Cost of Waste Per Kg",
                    formData.costOfWastePerKg,
                    (value) => handleInputChange("costOfWastePerKg", value),
                    "e.g., 50",
                    "https://revnew.com/hubfs/cost-revenue-ratio.jpg",
                    "₹"
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
                    "₹"
                  )}

                  {renderInputWithBackgroundImage(
                    "annualMaintenanceCost",
                    "Annual Maintenance Cost",
                    formData.annualMaintenanceCost,
                    (value) => handleInputChange("annualMaintenanceCost", value),
                    "e.g., 24000",
                    "https://antmyerp.com/wp-content/uploads/2021/12/AMC-Management-Software.webp",
                    "₹"
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
                    "Include other consumables like cutting tools, lubricants, etc."
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
                    {coolantCost > 0 && renderCalculationCard(
                      "Coolant Cost",
                      coolantCost,
                      "Per month",
                      "https://cdn-icons-png.flaticon.com/512/7751/7751861.png",
                      "green"
                    )}

                    {wasteCost > 0 && renderCalculationCard(
                      "Waste Cost",
                      wasteCost,
                      "Per month",
                      "https://cdn-icons-png.flaticon.com/512/9028/9028526.png",
                      "green"
                    )}

                    {(formData.monthlyMaintenanceCost + annualMaintenanceCostPerMonth) > 0 && renderCalculationCard(
                      "Maintenance Cost",
                      formData.monthlyMaintenanceCost + annualMaintenanceCostPerMonth,
                      "Per month",
                      "https://www.scnsoft.com/blog-pictures/crm-pics/customer-service-costs.png",
                      "blue"
                    )}

                    {renderCalculationCard(
                      "Total Cost",
                      totalMonthlyCost,
                      "Per month",
                      "https://cdn-icons-png.flaticon.com/512/3191/3191648.png",
                      "blue"
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
