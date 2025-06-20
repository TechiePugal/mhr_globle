"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, ArrowRight, Wrench, Info } from "lucide-react"
import type { MachineData } from "@/lib/firebaseService"
import Navbar from "@/components/navbar"
import { calculateTotalCostPerHour } from "@/lib/total-cost-calculator"
import TotalCostDisplay from "@/components/total-cost-display"

export default function ToolsWagesPage() {
  const router = useRouter()
  const [formData, setFormData] = useState<MachineData["toolsWagesData"]>({
    averageToolCostPerMonth: 0,
    operatorSalaryPerMonth: 0,
    helperSalaryPerMonth: 0,
    qualityInspectorSalaryPerMonth: 0,
  })
  const [errors, setErrors] = useState<any>({})
  const [machineName, setMachineName] = useState("")
  const [toolCostPerHour, setToolCostPerHour] = useState<number>(0)
  const [workingHoursPerDay, setWorkingHoursPerDay] = useState<number>(8)
  const [totalCostBreakdown, setTotalCostBreakdown] = useState<any>({})

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
      if (machineData.toolsWagesData) {
        setFormData(machineData.toolsWagesData)
      }
      setMachineName(machineData.machineName)
      setWorkingHoursPerDay(machineData.investmentData.workingHoursPerDay || 8)
    }
  }, [router])

  useEffect(() => {
    // Calculate tool cost per hour using the same logic as calculateFinalMachineHourRate
    const costPerHour = formData.averageToolCostPerMonth / (workingHoursPerDay * 26) // 26 working days per month
    setToolCostPerHour(costPerHour)
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
      toolsWagesData: formData,
    }

    const totalCost = calculateTotalCostPerHour(currentMachineData)
    setTotalCostBreakdown(totalCost)
  }, [formData, workingHoursPerDay])

  const validateForm = () => {
    const newErrors: any = {}

    if (!formData.operatorSalaryPerMonth || formData.operatorSalaryPerMonth <= 0)
      newErrors.operatorSalaryPerMonth = "Valid operator salary is required"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: keyof MachineData["toolsWagesData"], value: string) => {
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

    const existingData = localStorage.getItem("currentMachine")
    if (!existingData) {
      router.push("/investment")
      return
    }

    const machineData: MachineData = JSON.parse(existingData)
    machineData.toolsWagesData = formData

    localStorage.setItem("currentMachine", JSON.stringify(machineData))
    router.push("/overheads")
  }

  const goBack = () => {
    router.push("/consumables")
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

  const totalMonthlyCost =
    formData.averageToolCostPerMonth +
    formData.operatorSalaryPerMonth +
    formData.helperSalaryPerMonth +
    formData.qualityInspectorSalaryPerMonth

  const totalDirectLabor =
    formData.operatorSalaryPerMonth + formData.helperSalaryPerMonth + formData.qualityInspectorSalaryPerMonth

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar title="Tools & Wages" currentStep={5} totalSteps={7} />

      <main className="md:ml-64 pt-4">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Header */}
<div className="sticky top-10 z-20 bg-white border-b border-gray-200">
  <div className="px-4 py-3">
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 sm:space-x-6">
      {/* Icon and Text */}
      <div className="flex items-center space-x-4">
        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
          <Wrench className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Tools & Direct Labor Costs</h1>
          <p className="text-sm text-gray-600">
            Enter costs for tools and direct labor for <span className="font-medium">{machineName}</span>
          </p>
        </div>
      </div>

      {/* Cost Display */}
      <div className="w-full sm:w-auto">
        <TotalCostDisplay
          totalCost={totalCostBreakdown}
          currentStep={5}
          machineName={machineName || "Machine"}
        />
      </div>
    </div>
  </div>

  {/* Optional Alert below Header */}
  <Alert className="bg-blue-50 border-t border-blue-200">
    <Info className="w-4 h-4 text-blue-600" />
    <AlertDescription className="text-blue-800">
      This information will be used to calculate hourly tool costs and direct labor wages for machine operation.
    </AlertDescription>
  </Alert>
</div>


          <div className="space-y-8">
            {/* Tool Costs */}
            <Card>
              <CardHeader>
                <CardTitle>Tool Costs</CardTitle>
                <CardDescription>Enter average monthly tool and equipment costs</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {renderInputWithBackgroundImage(
                    "averageToolCostPerMonth",
                    "Average Tool Cost Per Month",
                    formData.averageToolCostPerMonth,
                    (value) => handleInputChange("averageToolCostPerMonth", value),
                    "e.g., 8000",
                    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR843YBdkBdZ8UIPPFGnPxqKtEqcE0LhOglJw&s",
                    "₹",
                    undefined,
                    false,
                    "Include cutting tools, measuring instruments, and other consumable tools",
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Direct Labor Wages */}
            <Card>
              <CardHeader>
                <CardTitle>Direct Labor Wages</CardTitle>
                <CardDescription>Enter monthly salaries for direct labor involved in machine operation</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {renderInputWithBackgroundImage(
                    "operatorSalaryPerMonth",
                    "Operator Salary Per Month",
                    formData.operatorSalaryPerMonth,
                    (value) => handleInputChange("operatorSalaryPerMonth", value),
                    "e.g., 25000",
                    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQQ6liuCXghxTJ4ZTD1wpcBBg-_RmrIUe7-fA&s",
                    "₹",
                    errors.operatorSalaryPerMonth,
                    true,
                    "Primary machine operator salary",
                  )}

                  {renderInputWithBackgroundImage(
                    "helperSalaryPerMonth",
                    "Helper Salary Per Month",
                    formData.helperSalaryPerMonth,
                    (value) => handleInputChange("helperSalaryPerMonth", value),
                    "e.g., 18000",
                    "https://media.graphassets.com/resize=fit:crop,width:1200,height:630/pIMFIKY0SnG2tfY9HncN",
                    "₹",
                    undefined,
                    false,
                    "Assistant/helper salary (if applicable)",
                  )}

                  {renderInputWithBackgroundImage(
                    "qualityInspectorSalaryPerMonth",
                    "Quality Inspector Salary Per Month",
                    formData.qualityInspectorSalaryPerMonth,
                    (value) => handleInputChange("qualityInspectorSalaryPerMonth", value),
                    "e.g., 22000",
                    "https://careertraining.uis.edu/common/images/1/18310/qualitylarge.jpg",
                    "₹",
                    undefined,
                    false,
                    "Quality control inspector salary",
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Cost Summary */}
            {totalMonthlyCost > 0 && (
              <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
                <CardHeader>
                  <CardTitle className="text-green-800">Tools & Wages Summary</CardTitle>
                  <CardDescription className="text-green-700">
                    Monthly cost breakdown for tools and direct labor
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {formData.averageToolCostPerMonth > 0 &&
                      renderCalculationCard(
                        "Tool Costs",
                        formData.averageToolCostPerMonth,
                        "Per month",
                        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR843YBdkBdZ8UIPPFGnPxqKtEqcE0LhOglJw&s",
                        "green",
                      )}

                    {totalDirectLabor > 0 &&
                      renderCalculationCard(
                        "Direct Labor",
                        totalDirectLabor,
                        "Per month",
                        "https://cdn-icons-png.flaticon.com/512/1995/1995532.png",
                        "blue",
                      )}

                    {renderCalculationCard(
                      "Total Cost",
                      totalMonthlyCost,
                      "Per month",
                      "https://cdn-icons-png.freepik.com/512/8435/8435647.png",
                      "purple",
                    )}
                  </div>

                  {/* Detailed Breakdown */}
                  <div className="mt-6 p-4 bg-white/80 backdrop-blur-sm rounded-lg border border-gray-200">
                    <h4 className="font-medium text-gray-900 mb-3">Detailed Breakdown</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-800">
                      <div className="flex justify-between border-b border-gray-200 pb-1">
                        <span>Tool Costs:</span>
                        <span>₹{formData.averageToolCostPerMonth.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between border-b border-gray-200 pb-1">
                        <span>Operator Salary:</span>
                        <span>₹{formData.operatorSalaryPerMonth.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between border-b border-gray-200 pb-1">
                        <span>Helper Salary:</span>
                        <span>₹{formData.helperSalaryPerMonth.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>QC Inspector Salary:</span>
                        <span>₹{formData.qualityInspectorSalaryPerMonth.toLocaleString()}</span>
                      </div>
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
                disabled={!formData.operatorSalaryPerMonth}
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
