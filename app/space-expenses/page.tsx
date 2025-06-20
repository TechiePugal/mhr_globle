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
import { calculateTotalCostPerHour } from "@/lib/total-cost-calculator"
import TotalCostDisplay from "@/components/total-cost-display"
import { saveMachine } from "@/lib/firebaseService"
import MachineNamePopup from "@/components/machine-name-popup"

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
  const [spaceCostPerHour, setSpaceCostPerHour] = useState<number>(0)
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
      setFormData(machineData.spaceData)
      setMachineName(machineData.machineName)
      setWorkingHoursPerDay(machineData.investmentData.workingHoursPerDay || 8)
    } else {
      router.push("/investment")
    }
  }, [router])

  useEffect(() => {
    // Calculate space cost per hour directly
    const calculateSpaceCostPerHour = () => {
      if (formData.factoryRentPerMonth > 0 && formData.factorySpaceInSqFt > 0 && formData.spaceOccupiedByMachine > 0) {
        const machineSpaceCost =
          formData.factoryRentPerMonth * 12 * (formData.spaceOccupiedByMachine / formData.factorySpaceInSqFt)
        const commonSpaceCost =
          formData.numberOfMachinesInFactory > 0
            ? (formData.factoryRentPerMonth * 12 * (formData.commonSpaceInSqFt / formData.factorySpaceInSqFt)) /
              formData.numberOfMachinesInFactory
            : 0
        const annualSpaceCost = machineSpaceCost + commonSpaceCost
        return annualSpaceCost / (workingHoursPerDay * 365)
      }
      return 0
    }

    const costPerHour = calculateSpaceCostPerHour()
    setSpaceCostPerHour(costPerHour)
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
      spaceData: formData,
    }

    const totalCost = calculateTotalCostPerHour(currentMachineData)
    setTotalCostBreakdown(totalCost)
  }, [formData, workingHoursPerDay])

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
      let machineData: MachineData

      if (existingData) {
        machineData = JSON.parse(existingData)
        machineData.spaceData = formData
      } else {
        // Create new machine data structure
        machineData = {
          machineName,
          spaceData: formData,
          investmentData: {
            machineCost: 0,
            lifeOfMachine: 0,
            workingHoursPerDay: 0,
            balanceLifeOfMachine: 0,
            interestRate: 0,
            scrapRate: 0,
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
      }

      // Save to Firebase
      const id = await saveMachine(machineData)
      machineData.id = id

      // Update local storage
      localStorage.setItem("currentMachine", JSON.stringify(machineData))

      router.push("/power-consumption")
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
    router.push("/investment")
  }

  const renderInputWithBackgroundImage = (
    id: string,
    label: string,
    value: number,
    onChange: (value: string) => void,
    placeholder: string,
    imageUrl: string,
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
            // backgroundColor: "rgba(0, 0, 0, 0.5)",
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

  const renderCalculationCard = (title: string, value: number, imageUrl: string, colorScheme = "blue") => {
    const colorClasses = {
      green: {
        text: "text-green-800",
        valueText: "text-green-900",
        subText: "text-green-600",
      },
      blue: {
        text: "text-blue-800",
        valueText: "text-blue-900",
        subText: "text-blue-600",
      },
    }

    const colors = colorClasses[colorScheme as keyof typeof colorClasses] || colorClasses.blue

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
          <div className="text-3xl font-bold text-white">₹{value.toLocaleString()}</div>
          <div className="text-white/80 text-sm">Per month</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar title="Space Expenses" currentStep={2} totalSteps={6} />

      <main className="md:ml-64 pt-4">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Header */}
          <div className="sticky top-10 z-20 bg-white border-b border-gray-200">
            <div className="px-4 py-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 sm:space-x-6">
                {/* Icon and Text */}
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Building className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Space Expenses</h1>
                    <p className="text-sm text-gray-600">
                      Enter factory space details for <span className="font-medium">{machineName}</span>
                    </p>
                  </div>
                </div>

                {/* Total Cost Display */}
                <div className="w-full sm:w-auto">
                  <TotalCostDisplay
                    totalCost={totalCostBreakdown}
                    currentStep={2}
                    machineName={machineName || "Machine"}
                  />
                </div>
              </div>
            </div>

            {/* Optional Alert below Header */}
            <Alert className="bg-blue-50 border-t border-blue-200">
              <Info className="w-4 h-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                This information will be used to calculate the space cost per hour for your machine.
              </AlertDescription>
            </Alert>
          </div>

          <div className="space-y-8">
            {/* Factory Space Information */}
            <Card>
              <CardHeader>
                <CardTitle>Factory Space Information</CardTitle>
                <CardDescription>Enter details about your factory space and rent</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {renderInputWithBackgroundImage(
                    "factoryRentPerMonth",
                    "Factory Rent Per Month (₹)",
                    formData.factoryRentPerMonth,
                    (value) => handleInputChange("factoryRentPerMonth", value),
                    "e.g., 50000",
                    "https://www.wsm.eu/wp-content/uploads/2023/05/raumsystem-im-innenbereich-2.jpg",
                    errors.factoryRentPerMonth,
                    true,
                  )}

                  {renderInputWithBackgroundImage(
                    "factorySpaceInSqFt",
                    "Total Factory Space (sq ft)",
                    formData.factorySpaceInSqFt,
                    (value) => handleInputChange("factorySpaceInSqFt", value),
                    "e.g., 2000",
                    "https://5.imimg.com/data5/SELLER/Default/2024/2/388164104/RD/JF/CG/205690783/80-000-sqft-warehouse-gowdown-for-rent-lease-at-kompally-hyderabad-tg.jpg",
                    errors.factorySpaceInSqFt,
                    true,
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Machine Space Information */}
            <Card>
              <CardHeader>
                <CardTitle>Machine Space Information</CardTitle>
                <CardDescription>Enter details about the space occupied by your machine</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {renderInputWithBackgroundImage(
                    "spaceOccupiedByMachine",
                    "Space Occupied by Machine (sq ft)",
                    formData.spaceOccupiedByMachine,
                    (value) => handleInputChange("spaceOccupiedByMachine", value),
                    "e.g., 100",
                    "https://www.machinemetrics.com/hs-fs/hubfs/fanuc-robots-factory.jpg?width=918&name=fanuc-robots-factory.jpg",
                    errors.spaceOccupiedByMachine,
                    true,
                  )}

                  {renderInputWithBackgroundImage(
                    "numberOfMachinesInFactory",
                    "Number of Machines in Factory",
                    formData.numberOfMachinesInFactory,
                    (value) => handleInputChange("numberOfMachinesInFactory", value),
                    "e.g., 5",
                    "https://cdn.britannica.com/17/197117-050-E0626858/Rows-computer-numerical-control-milling-machines-factory.jpg",
                    errors.numberOfMachinesInFactory,
                    true,
                  )}

                  {renderInputWithBackgroundImage(
                    "commonSpaceInSqFt",
                    "Common Space (sq ft)",
                    formData.commonSpaceInSqFt,
                    (value) => handleInputChange("commonSpaceInSqFt", value),
                    "e.g., 500",
                    "https://www.dgicommunications.com/wp-content/uploads/2021/10/dgi-office-space-design.jpg",
                    undefined,
                    false,
                    "Common space includes walkways, storage areas, and other shared spaces",
                  )}
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
                    {renderCalculationCard(
                      "Rent per sq ft",
                      Number.parseFloat((formData.factoryRentPerMonth / formData.factorySpaceInSqFt).toFixed(2)),
                      "https://5.imimg.com/data5/SELLER/Default/2024/2/388164104/RD/JF/CG/205690783/80-000-sqft-warehouse-gowdown-for-rent-lease-at-kompally-hyderabad-tg.jpg",
                      "green",
                    )}

                    {renderCalculationCard(
                      "Machine Space Cost",
                      Number.parseFloat(
                        (
                          (formData.factoryRentPerMonth / formData.factorySpaceInSqFt) *
                          formData.spaceOccupiedByMachine
                        ).toFixed(2),
                      ),
                      "https://d3h6k4kfl8m9p0.cloudfront.net/uploads/2014/03/Amy-Shop-from-Top.jpg",
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
                disabled={
                  saving ||
                  !formData.factoryRentPerMonth ||
                  !formData.factorySpaceInSqFt ||
                  !formData.spaceOccupiedByMachine ||
                  !formData.numberOfMachinesInFactory
                }
                className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                {saving ? "Saving..." : "Save & Continue"}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
        <MachineNamePopup
          isOpen={showMachineNamePopup}
          onSave={handleMachineNameSave}
          onCancel={() => setShowMachineNamePopup(false)}
        />
      </main>
    </div>
  )
}
