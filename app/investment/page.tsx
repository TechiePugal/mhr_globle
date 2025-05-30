"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, ArrowRight, Calculator, Info } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { MachineData } from "@/lib/firebaseService"
import { calculateInvestmentData } from "@/lib/calculations"
import Navbar from "@/components/navbar"
import Link from "next/link"
import Image from "next/image"
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
  const [errors, setErrors] = useState<any>({})

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
    if (formData.machineCost > 0 && formData.lifeOfMachine > 0) {
      const calculated = calculateInvestmentData(formData)
      setCalculatedData(calculated)
    }
  }, [formData])

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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar title="Investment Details" currentStep={1} totalSteps={7} />

      <main className="md:ml-64 pt-4">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Breadcrumb */}
          {/* <div className="flex items-center space-x-2 text-sm text-gray-600 mb-6"> */}
          {/* <Link href="/dashboard" className="hover:text-blue-600">
              Dashboard
            </Link> */}
          {/* <span className="text-gray-900 font-medium">Investment Details</span> */}
          {/* </div> */}


          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calculator className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Investment Details</h1>
                <p className="text-gray-600">Enter the basic investment information for your machine</p>
              </div>
            </div>
            <div>
              <Image
                src="https://cdn.corporatefinanceinstitute.com/assets/income-investing-1024x576.jpeg"
                alt="Remote Image"
                width={900} // original width for aspect ratio
                height={300} // original height for aspect ratio
                style={{ maxWidth: '900px', maxHeight: '200px', width: '100%', height: 'auto' }}
              />
            </div>
            <Alert className="bg-blue-50 border-blue-200">
              <Info className="w-4 h-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                This information will be used to calculate depreciation, interest costs, and machine life hours.
              </AlertDescription>
            </Alert>
          </div>

          <div className="space-y-6">
            {/* Basic Information */}
<Card>
  <CardHeader>
    <CardTitle>Basic Information</CardTitle>
    <CardDescription>Enter the fundamental details about your machine</CardDescription>
  </CardHeader>
  <CardContent className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Image section */}
      <div className="flex items-center justify-center md:col-span-1">
<img
  src="https://thumbs.dreamstime.com/b/close-up-milling-machine-lots-gold-flakes-ai-332839930.jpg" // <-- Replace with your actual image path
  alt="Machine Info"
  className="h-52 md:h-72 lg:h-80 w-full max-w-md mx-auto object-contain rounded-xl shadow-md"
/>

      </div>

      {/* Form section */}
      <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2 space-y-2">
          <Label htmlFor="machineName" className="text-sm font-medium">
            Machine Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="machineName"
            value={machineName}
            onChange={(e) => handleMachineNameChange(e.target.value)}
            placeholder="e.g., CNC Lathe Machine"
            className={`h-11 ${errors.machineName ? "border-red-500" : ""}`}
          />
          {errors.machineName && <p className="text-sm text-red-600">{errors.machineName}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="machineCost" className="text-sm font-medium">
            Machine Cost (₹) <span className="text-red-500">*</span>
          </Label>
          <Input
            id="machineCost"
            type="number"
            value={formData.machineCost || ""}
            onChange={(e) => handleInputChange("machineCost", e.target.value)}
            placeholder="e.g., 1500000"
            className={`h-11 ${errors.machineCost ? "border-red-500" : ""}`}
          />
          {errors.machineCost && <p className="text-sm text-red-600">{errors.machineCost}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="lifeOfMachine" className="text-sm font-medium">
            Life of Machine (Years) <span className="text-red-500">*</span>
          </Label>
          <Input
            id="lifeOfMachine"
            type="number"
            value={formData.lifeOfMachine || ""}
            onChange={(e) => handleInputChange("lifeOfMachine", e.target.value)}
            placeholder="e.g., 10"
            className={`h-11 ${errors.lifeOfMachine ? "border-red-500" : ""}`}
          />
          {errors.lifeOfMachine && <p className="text-sm text-red-600">{errors.lifeOfMachine}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="workingHoursPerDay" className="text-sm font-medium">
            Working Hours per Day <span className="text-red-500">*</span>
          </Label>
          <Input
            id="workingHoursPerDay"
            type="number"
            value={formData.workingHoursPerDay || ""}
            onChange={(e) => handleInputChange("workingHoursPerDay", e.target.value)}
            placeholder="e.g., 8"
            className={`h-11 ${errors.workingHoursPerDay ? "border-red-500" : ""}`}
          />
          {errors.workingHoursPerDay && <p className="text-sm text-red-600">{errors.workingHoursPerDay}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="balanceLifeOfMachine" className="text-sm font-medium">
            Balance Life of Machine (Years) <span className="text-red-500">*</span>
          </Label>
          <Input
            id="balanceLifeOfMachine"
            type="number"
            value={formData.balanceLifeOfMachine || ""}
            onChange={(e) => handleInputChange("balanceLifeOfMachine", e.target.value)}
            placeholder="e.g., 8"
            className={`h-11 ${errors.balanceLifeOfMachine ? "border-red-500" : ""}`}
          />
          {errors.balanceLifeOfMachine && (
            <p className="text-sm text-red-600">{errors.balanceLifeOfMachine}</p>
          )}
        </div>
      </div>
    </div>
  </CardContent>
</Card>


            {/* Financial Parameters */}
            <Card>
              <CardHeader>
                <CardTitle>Financial Parameters</CardTitle>
                <CardDescription>Enter interest and scrap value information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                  {/* Interest Rate */}
                  <div className="space-y-2">
                    <img
                      src="https://bsmedia.business-standard.com/_media/bs/img/article/2022-05/05/full/1651774950-0305.jpg?im=FeatureCrop,size=(826,465)"
                      alt="Interest Icon"
                      className="w-full h-40 object-contain rounded-md"
                    />
                    <Label htmlFor="interestRate" className="text-sm font-medium">
                      Interest Rate (%)
                    </Label>
                    <Input
                      id="interestRate"
                      type="number"
                      step="0.01"
                      value={formData.interestRate || ""}
                      onChange={(e) => handleInputChange("interestRate", e.target.value)}
                      placeholder="e.g., 12.5"
                      className="h-11 w-full"
                    />
                  </div>

                  {/* Scrap Rate */}
                  <div className="space-y-2">
                    <img
                      src="https://scraprate.in/wp-content/uploads/2023/11/Scrap-rate-logo.webp"
                      alt="Scrap Icon"
                      className="w-full h-40 object-contain rounded-md"
                    />
                    <Label htmlFor="scrapRate" className="text-sm font-medium">
                      Scrap Rate (%)
                    </Label>
                    <Input
                      id="scrapRate"
                      type="number"
                      step="0.01"
                      value={formData.scrapRate || ""}
                      onChange={(e) => handleInputChange("scrapRate", e.target.value)}
                      placeholder="e.g., 10"
                      className="h-11 w-full"
                    />
                  </div>

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

                    {/* Machine Life Hours */}
                    <div className="p-4 bg-white rounded-lg border border-green-200 space-y-2">
                      <img
                        src="https://t4.ftcdn.net/jpg/03/02/26/55/360_F_302265500_HcxnXEWpFghwA9FCjAWJXGtc1jQ0kyhs.jpg" // example machine icon
                        alt="Machine Life Icon"
                        className="w-full h-32 object-contain"
                      />
                      <div className="text-sm font-medium text-green-800">Machine Life (Hours)</div>
                      <div className="text-xl font-bold text-green-900">
                        {calculatedData.machineLifeHours.toLocaleString()}
                      </div>
                      <div className="text-xs text-green-600">
                        {formData.lifeOfMachine} years × {formData.workingHoursPerDay} hrs/day × 365 days
                      </div>
                    </div>

                    {/* Current Value of Machine */}
                    <div className="p-4 bg-white rounded-lg border border-blue-200 space-y-2">
                      <img
                        src="https://www.zintilon.com/wp-content/uploads/2024/06/Precision-machining-process-ongoing.jpg" // example currency/money icon
                        alt="Current Value Icon"
                        className="w-full h-32 object-contain"
                      />
                      <div className="text-sm font-medium text-blue-800">Current Value of Machine</div>
                      <div className="text-xl font-bold text-blue-900">
                        ₹{calculatedData.currentValueOfMachine.toLocaleString()}
                      </div>
                      <div className="text-xs text-blue-600">After depreciation calculation</div>
                    </div>

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
