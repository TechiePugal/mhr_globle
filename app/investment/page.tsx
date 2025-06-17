"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, ArrowRight, Calculator, Info } from 'lucide-react'
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { MachineData } from "@/lib/firebaseService"
import { calculateInvestmentData } from "@/lib/calculations"
import Navbar from "@/components/navbar"
import Link from "next/link"
import Image from "next/image"
import { calculateTotalCostPerHour } from "@/lib/total-cost-calculator"
import TotalCostDisplay from "../../components/total-cost-display"

export default function InvestmentPage() {
  const router = useRouter()
  const [formData, setFormData] = useState<MachineData["investmentData"]>({
    machineCost: 0,
    lifeOfMachine: 0,
    workingHoursPerDay: 0,
    balanceLifeOfMachine: 0,
    interestRate: 0,
    scrapRate: 0,
  })
  const [machineName, setMachineName] = useState("")
  const [calculatedData, setCalculatedData] = useState<any>({})
  const [investmentCostPerHour, setInvestmentCostPerHour] = useState<number>(0)
  const [errors, setErrors] = useState<any>({})
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
      setFormData(machineData.investmentData)
      setMachineName(machineData.machineName)
    }
  }, [router])

  useEffect(() => {
    if (formData.machineCost > 0 && formData.lifeOfMachine > 0 && formData.workingHoursPerDay > 0) {
      const calculated = calculateInvestmentData(formData)
      setCalculatedData(calculated)

      // Calculate investment cost per hour using the same logic as calculateFinalMachineHourRate
      const annualDepreciation =
        (formData.machineCost - (formData.machineCost * formData.scrapRate) / 100) / formData.lifeOfMachine

      const annualInterest = (calculated.currentValueOfMachine * formData.interestRate) / 100
      const annualInvestmentCost = annualDepreciation + annualInterest
      const investmentCostPerHour = annualInvestmentCost / (formData.workingHoursPerDay * 365)

      setInvestmentCostPerHour(investmentCostPerHour)
    }
  }, [formData])

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
      machineName,
      investmentData: { ...formData, ...calculatedData }
    }
    
    const totalCost = calculateTotalCostPerHour(currentMachineData)
    setTotalCostBreakdown(totalCost)
  }, [formData, calculatedData, machineName])

  const validateForm = () => {
    const newErrors: any = {}

    if (!machineName.trim()) newErrors.machineName = "Machine name is required"
    if (!formData.machineCost || formData.machineCost <= 0) newErrors.machineCost = "Valid machine cost is required"
    if (!formData.lifeOfMachine || formData.lifeOfMachine <= 0)
      newErrors.lifeOfMachine = "Valid machine life is required"
    if (!formData.workingHoursPerDay || formData.workingHoursPerDay <= 0)
      newErrors.workingHoursPerDay = "Valid working hours is required"
    if (!formData.balanceLifeOfMachine || formData.balanceLifeOfMachine < 0)
      newErrors.balanceLifeOfMachine = "Valid balance life is required"
    if (formData.balanceLifeOfMachine > formData.lifeOfMachine)
      newErrors.balanceLifeOfMachine = "Balance life cannot exceed total life"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: keyof MachineData["investmentData"], value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: Number.parseFloat(value) || 0,
    }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev: any) => ({ ...prev, [field]: null }))
    }
  }

  const handleMachineNameChange = (value: string) => {
    setMachineName(value)
    if (errors.machineName) {
      setErrors((prev: any) => ({ ...prev, machineName: null }))
    }
  }

  const saveAndContinue = () => {
    if (!validateForm()) return

    const machineData: Partial<MachineData> = {
      machineName,
      investmentData: { ...formData, ...calculatedData },
      spaceData: {
        factoryRentPerMonth: 0,
        factorySpaceInSqFt: 0,
        spaceOccupiedByMachine: 0,
        numberOfMachinesInFactory: 0,
        commonSpaceInSqFt: 0,
      },
      powerData: {
        machinePower: 0,
        effectiveRunningTimeOfMotors: 0,
        powerOfFan: 0,
        powerOfLight: 0,
        numberOfFansAroundMachine: 0,
        numberOfLightsAroundMachine: 0,
        compressorPower: 0,
        numberOfMachinesConnectedWithCompressor: 0,
        effectiveRunningTimeOfCompressor: 0,
        powerOfOtherElectricalEquipment: 0,
        utilization: 0,
        ebUnitRate: 0,
        dieselConsumptionByGenset: 0,
        dieselCostPerLitre: 0,
        gensetPower: 0,
        electricityUnitRate: 0,
      },
      consumablesData: {
        coolantOilTopUpPerMonth: 0,
        coolantOilCostPerLitre: 0,
        wasteUsagePerMonth: 0,
        costOfWastePerKg: 0,
        monthlyMaintenanceCost: 0,
        annualMaintenanceCost: 0,
        otherConsumablesPerMonth: 0,
      },
      toolsWagesData: {
        averageToolCostPerMonth: 0,
        operatorSalaryPerMonth: 0,
        helperSalaryPerMonth: 0,
        qualityInspectorSalaryPerMonth: 0,
      },
      overheadsData: {
        productionSupervisorSalaryPerMonth: 0,
        qualitySupervisorSalaryPerMonth: 0,
        engineerSalaryPerMonth: 0,
        managerSalaryPerMonth: 0,
        adminStaffSalaryPerMonth: 0,
        noOfMachinesHandledByOperator: 1,
        noOfMachinesHandledByHelper: 1,
        noOfMachinesHandledByQualityInspector: 1,
        noOfMachinesHandledByProductionSupervisor: 1,
        noOfMachinesHandledByQualitySupervisor: 1,
        noOfMachinesHandledByEngineer: 1,
      },
    }

    // Load existing data and merge
    const existingData = localStorage.getItem("currentMachine")
    if (existingData) {
      const existing: MachineData = JSON.parse(existingData)
      Object.assign(machineData, existing)
    }

    machineData.machineName = machineName
    machineData.investmentData = { ...formData, ...calculatedData }

    localStorage.setItem("currentMachine", JSON.stringify(machineData))
    router.push("/space-expenses")
  }

  const renderInputWithBackgroundImage = (
    id: string,
    label: string,
    value: number | string,
    onChange: (value: string) => void,
    placeholder: string,
    imageUrl: string,
    unit: string,
    error?: string,
    required = false,
    description?: string,
    type = "number",
  ) => (
<div className="space-y-2">
  <div className="rounded-lg overflow-hidden bg-black-50 shadow-lg flex flex-col">
    {/* Top: Image Banner */}
    <div
      className="h-40 bg-cover bg-center"
      style={{
        backgroundImage: `url(${imageUrl})`,
        backgroundBlendMode: "overlay",
        backgroundColor: "rgba(0, 0, 0, 0.4)",
      }}
    ></div>

    {/* Bottom: Form Section */}
    <div className="p-6 space-y-4">
      <Label htmlFor={id} className="text-gray-900 font-semibold text-lg">
        {label} {unit && <span className="text-yellow-600">({unit})</span>}{" "}
        {required && <span className="text-red-600">*</span>}
      </Label>

      <Input
        id={id}
        type={type}
        step={type === "number" ? "0.01" : undefined}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`h-12 text-lg font-medium border text-gray-900 placeholder:text-gray-600 ${
          error ? "border-red-400" : "border-gray-300"
        } focus:border-blue-500 focus:ring-2 focus:ring-blue-200`}
      />

      {description && <p className="text-gray-600 text-sm">{description}</p>}
    </div>
  </div>

  {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
</div>

  )

  const renderCalculationCard = (
    title: string,
    value: number | string,
    unit: string,
    imageUrl: string,
    description?: string,
  ) => {
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
            {typeof value === "number"
              ? title.includes("₹")
                ? `₹${value.toLocaleString()}`
                : value.toLocaleString()
              : value}
          </div>
          <div className="text-white/80 text-sm">{unit}</div>
          {description && <div className="text-white/70 text-xs">{description}</div>}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar title="Investment Details" currentStep={1} totalSteps={7} />

      <main className="md:ml-64 pt-4">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Header */}
<div className="sticky top-10 z-20 bg-white border-b border-gray-200">
  <div className="px-4 py-3">
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 sm:space-x-6">
      {/* Icon and Text */}
      <div className="flex items-center space-x-4">
        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
          <Calculator className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Investment Details</h1>
          <p className="text-sm text-gray-600">
            Enter the basic investment information for your machine
          </p>
        </div>
      </div>

      {/* Total Cost Display Component */}
      <div className="w-full sm:w-auto">
        <TotalCostDisplay
          totalCost={totalCostBreakdown}
          currentStep={1}
          machineName={machineName || "Machine"}
        />
      </div>
    </div>
  </div>

  {/* Optional Alert below Header */}
  <Alert className="bg-blue-50 border-t border-blue-200">
    <Info className="w-4 h-4 text-blue-600" />
    <AlertDescription className="text-blue-800">
      This information will be used to calculate depreciation, interest costs, and machine life hours.
    </AlertDescription>
  </Alert>
</div>


          <div className="space-y-8">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>Enter the fundamental details about your machine</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {renderInputWithBackgroundImage(
                    "machineName",
                    "Machine Name",
                    machineName,
                    handleMachineNameChange,
                    "e.g., CNC Lathe Machine",
                    "https://thumbs.dreamstime.com/b/close-up-milling-machine-lots-gold-flakes-ai-332839930.jpg",
                    "",
                    errors.machineName,
                    true,
                    "Enter a descriptive name for your machine",
                    "text",
                  )}

                  {renderInputWithBackgroundImage(
                    "machineCost",
                    "Machine Cost",
                    formData.machineCost,
                    (value) => handleInputChange("machineCost", value),
                    "e.g., 1500000",
                    "https://5.imimg.com/data5/SELLER/Default/2022/9/VY/SB/BO/115365/16-feet-heavy-duty-lathe-machine-500x500.jpg",
                    "₹",
                    errors.machineCost,
                    true,
                    "Total purchase cost of the machine",
                  )}

                  {renderInputWithBackgroundImage(
                    "lifeOfMachine",
                    "Life of Machine",
                    formData.lifeOfMachine,
                    (value) => handleInputChange("lifeOfMachine", value),
                    "e.g., 10",
                    "https://5.imimg.com/data5/IOS/Default/2022/6/JB/VT/HW/98322859/product-jpeg-500x500.png",
                    "years",
                    errors.lifeOfMachine,
                    true,
                    "Expected operational life of the machine",
                  )}

                  {renderInputWithBackgroundImage(
                    "workingHoursPerDay",
                    "Working Hours Per Day",
                    formData.workingHoursPerDay,
                    (value) => handleInputChange("workingHoursPerDay", value),
                    "e.g., 8",
                    "https://plano-wfm.com/en/wp-content/uploads/sites/44/2023/08/Maximale-Arbeitszeit.jpg",
                    "hours",
                    errors.workingHoursPerDay,
                    true,
                    "Daily operational hours of the machine",
                  )}

                  {renderInputWithBackgroundImage(
                    "balanceLifeOfMachine",
                    "Balance Life of Machine",
                    formData.balanceLifeOfMachine,
                    (value) => handleInputChange("balanceLifeOfMachine", value),
                    "e.g., 8",
                    "https://www.brookings.edu/wp-content/uploads/2020/11/shutterstock_15284887.jpg?quality=75&w=1500",
                    "years",
                    errors.balanceLifeOfMachine,
                    true,
                    "Remaining useful life of the machine",
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Financial Parameters */}
            <Card>
              <CardHeader>
                <CardTitle>Financial Parameters</CardTitle>
                <CardDescription>Enter interest and scrap value information</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {renderInputWithBackgroundImage(
                    "interestRate",
                    "Interest Rate",
                    formData.interestRate,
                    (value) => handleInputChange("interestRate", value),
                    "e.g., 12.5",
                    "https://i.cdn.newsbytesapp.com/images/l14520250325190740.jpeg",
                    "%",
                    undefined,
                    false,
                    "Annual interest rate for financing",
                  )}

                  {renderInputWithBackgroundImage(
                    "scrapRate",
                    "Scrap Rate",
                    formData.scrapRate,
                    (value) => handleInputChange("scrapRate", value),
                    "e.g., 10",
                    "https://scraprate.in/wp-content/uploads/2023/11/Scrap-rate-logo.webp",
                    "%",
                    undefined,
                    false,
                    "Percentage of original value as scrap",
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Calculated Values */}
            {calculatedData.machineLifeHours && (
              <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
                <CardHeader>
                  <CardTitle className="text-green-800">Calculated Values</CardTitle>
                  <CardDescription className="text-green-700">
                    These values are automatically calculated based on your inputs
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {renderCalculationCard(
                      "Machine Life",
                      calculatedData.machineLifeHours,
                      "Hours",
                      "https://t4.ftcdn.net/jpg/03/02/26/55/360_F_302265500_HcxnXEWpFghwA9FCjAWJXGtc1jQ0kyhs.jpg",
                      `${formData.lifeOfMachine} years × ${formData.workingHoursPerDay} hrs/day × 365 days`,
                    )}

                    {renderCalculationCard(
                      "Current Value",
                      calculatedData.currentValueOfMachine,
                      "₹",
                      "https://www.zintilon.com/wp-content/uploads/2024/06/Precision-machining-process-ongoing.jpg",
                      "After depreciation calculation",
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Navigation */}
            <div className="flex flex-col sm:flex-row justify-between gap-4 pt-6">
              <Link href="/dashboard">
                <Button variant="outline" className="w-full sm:w-auto">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <Button
                onClick={saveAndContinue}
                disabled={!machineName || !formData.machineCost || !formData.lifeOfMachine}
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
