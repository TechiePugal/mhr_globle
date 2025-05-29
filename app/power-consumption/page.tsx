"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, ArrowRight, Zap, Info } from "lucide-react"
import type { MachineData } from "@/lib/firebaseService"
import { calculatePowerData } from "@/lib/calculations"
import Navbar from "@/components/navbar"
import Link from "next/link"
import Image from "next/image"
export default function PowerConsumptionPage() {
  const router = useRouter()
  const [formData, setFormData] = useState<MachineData["powerData"]>({
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
  })
  const [errors, setErrors] = useState<any>({})
  const [machineName, setMachineName] = useState("")
  const [calculatedData, setCalculatedData] = useState<any>({})

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
      setFormData(machineData.powerData)
      setMachineName(machineData.machineName)
    } else {
      router.push("/investment")
    }
  }, [router])

  useEffect(() => {
    if (formData.dieselConsumptionByGenset > 0 && formData.dieselCostPerLitre > 0 && formData.gensetPower > 0) {
      const calculated = calculatePowerData(formData)
      setCalculatedData(calculated)
    }
  }, [formData])

  const validateForm = () => {
    const newErrors: any = {}

    if (!formData.machinePower || formData.machinePower <= 0) newErrors.machinePower = "Valid machine power is required"
    if (!formData.effectiveRunningTimeOfMotors || formData.effectiveRunningTimeOfMotors <= 0)
      newErrors.effectiveRunningTimeOfMotors = "Valid running time is required"
    if (!formData.utilization || formData.utilization <= 0) newErrors.utilization = "Valid utilization is required"
    if (!formData.electricityUnitRate || formData.electricityUnitRate <= 0)
      newErrors.electricityUnitRate = "Valid electricity rate is required"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: keyof MachineData["powerData"], value: string) => {
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
      machineData.powerData = { ...formData, ...calculatedData }
      localStorage.setItem("currentMachine", JSON.stringify(machineData))
    }

    router.push("/consumables")
  }

  const goBack = () => {
    router.push("/space-expenses")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar title="Power Consumption" currentStep={3} totalSteps={7} />

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
            <Link href="/space-expenses" className="hover:text-blue-600">
              Space
            </Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">Power</span>
          </div> */}

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Power Consumption</h1>
                <p className="text-gray-600">
                  Enter power consumption details for <span className="font-medium">{machineName}</span>
                </p>
              </div>
            </div>
    <div>
      <Image
        src="https://m.economictimes.com/thumb/msid-112197120,width-1600,height-900,resizemode-4,imgsize-81962/peak-power-demand.jpg"
        alt="Remote Image"
        width={900} // original width for aspect ratio
        height={300} // original height for aspect ratio
        style={{ maxWidth: '900px', maxHeight: '200px', width: '100%', height: 'auto' }}
      />
    </div>
            <Alert className="bg-blue-50 border-blue-200">
              <Info className="w-4 h-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                This information will be used to calculate the power cost per hour for your machine.
              </AlertDescription>
            </Alert>
          </div>

          <div className="space-y-6">
            {/* Machine Power Information */}
            <Card>
              <CardHeader>
                <CardTitle>Machine Power Information</CardTitle>
                <CardDescription>Enter details about your machine's power consumption</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="machinePower" className="text-sm font-medium">
                      Machine Power (kW) <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="machinePower"
                      type="number"
                      step="0.01"
                      value={formData.machinePower || ""}
                      onChange={(e) => handleInputChange("machinePower", e.target.value)}
                      placeholder="e.g., 7.5"
                      className={`h-11 ${errors.machinePower ? "border-red-500" : ""}`}
                    />
                    {errors.machinePower && <p className="text-sm text-red-600">{errors.machinePower}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="effectiveRunningTimeOfMotors" className="text-sm font-medium">
                      Effective Running Time of Motors (%) <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="effectiveRunningTimeOfMotors"
                      type="number"
                      step="0.1"
                      value={formData.effectiveRunningTimeOfMotors || ""}
                      onChange={(e) => handleInputChange("effectiveRunningTimeOfMotors", e.target.value)}
                      placeholder="e.g., 80"
                      className={`h-11 ${errors.effectiveRunningTimeOfMotors ? "border-red-500" : ""}`}
                    />
                    {errors.effectiveRunningTimeOfMotors && (
                      <p className="text-sm text-red-600">{errors.effectiveRunningTimeOfMotors}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="utilization" className="text-sm font-medium">
                      Machine Utilization (%) <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="utilization"
                      type="number"
                      step="0.1"
                      value={formData.utilization || ""}
                      onChange={(e) => handleInputChange("utilization", e.target.value)}
                      placeholder="e.g., 85"
                      className={`h-11 ${errors.utilization ? "border-red-500" : ""}`}
                    />
                    {errors.utilization && <p className="text-sm text-red-600">{errors.utilization}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="electricityUnitRate" className="text-sm font-medium">
                      Electricity Unit Rate (₹/kWh) <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="electricityUnitRate"
                      type="number"
                      step="0.01"
                      value={formData.electricityUnitRate || ""}
                      onChange={(e) => handleInputChange("electricityUnitRate", e.target.value)}
                      placeholder="e.g., 8.5"
                      className={`h-11 ${errors.electricityUnitRate ? "border-red-500" : ""}`}
                    />
                    {errors.electricityUnitRate && <p className="text-sm text-red-600">{errors.electricityUnitRate}</p>}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Auxiliary Equipment */}
            <Card>
              <CardHeader>
                <CardTitle>Auxiliary Equipment</CardTitle>
                <CardDescription>Enter details about fans, lights, and other equipment</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="powerOfFan" className="text-sm font-medium">
                      Power of Fan (W)
                    </Label>
                    <Input
                      id="powerOfFan"
                      type="number"
                      step="0.1"
                      value={formData.powerOfFan || ""}
                      onChange={(e) => handleInputChange("powerOfFan", e.target.value)}
                      placeholder="e.g., 60"
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="numberOfFansAroundMachine" className="text-sm font-medium">
                      Number of Fans Around Machine
                    </Label>
                    <Input
                      id="numberOfFansAroundMachine"
                      type="number"
                      value={formData.numberOfFansAroundMachine || ""}
                      onChange={(e) => handleInputChange("numberOfFansAroundMachine", e.target.value)}
                      placeholder="e.g., 2"
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="powerOfLight" className="text-sm font-medium">
                      Power of Light (W)
                    </Label>
                    <Input
                      id="powerOfLight"
                      type="number"
                      step="0.1"
                      value={formData.powerOfLight || ""}
                      onChange={(e) => handleInputChange("powerOfLight", e.target.value)}
                      placeholder="e.g., 40"
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="numberOfLightsAroundMachine" className="text-sm font-medium">
                      Number of Lights Around Machine
                    </Label>
                    <Input
                      id="numberOfLightsAroundMachine"
                      type="number"
                      value={formData.numberOfLightsAroundMachine || ""}
                      onChange={(e) => handleInputChange("numberOfLightsAroundMachine", e.target.value)}
                      placeholder="e.g., 2"
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="powerOfOtherElectricalEquipment" className="text-sm font-medium">
                      Power of Other Electrical Equipment (W)
                    </Label>
                    <Input
                      id="powerOfOtherElectricalEquipment"
                      type="number"
                      step="0.1"
                      value={formData.powerOfOtherElectricalEquipment || ""}
                      onChange={(e) => handleInputChange("powerOfOtherElectricalEquipment", e.target.value)}
                      placeholder="e.g., 100"
                      className="h-11"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Compressor Information */}
            <Card>
              <CardHeader>
                <CardTitle>Compressor Information</CardTitle>
                <CardDescription>Enter details about compressor if applicable</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="compressorPower" className="text-sm font-medium">
                      Compressor Power (kW)
                    </Label>
                    <Input
                      id="compressorPower"
                      type="number"
                      step="0.1"
                      value={formData.compressorPower || ""}
                      onChange={(e) => handleInputChange("compressorPower", e.target.value)}
                      placeholder="e.g., 5.5"
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="numberOfMachinesConnectedWithCompressor" className="text-sm font-medium">
                      Number of Machines Connected with Compressor
                    </Label>
                    <Input
                      id="numberOfMachinesConnectedWithCompressor"
                      type="number"
                      value={formData.numberOfMachinesConnectedWithCompressor || ""}
                      onChange={(e) => handleInputChange("numberOfMachinesConnectedWithCompressor", e.target.value)}
                      placeholder="e.g., 3"
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="effectiveRunningTimeOfCompressor" className="text-sm font-medium">
                      Effective Running Time of Compressor (%)
                    </Label>
                    <Input
                      id="effectiveRunningTimeOfCompressor"
                      type="number"
                      step="0.1"
                      value={formData.effectiveRunningTimeOfCompressor || ""}
                      onChange={(e) => handleInputChange("effectiveRunningTimeOfCompressor", e.target.value)}
                      placeholder="e.g., 70"
                      className="h-11"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Genset Information */}
            <Card>
              <CardHeader>
                <CardTitle>Genset Information</CardTitle>
                <CardDescription>Enter details about generator set if applicable</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="dieselConsumptionByGenset" className="text-sm font-medium">
                      Diesel Consumption by Genset (litres/hour)
                    </Label>
                    <Input
                      id="dieselConsumptionByGenset"
                      type="number"
                      step="0.01"
                      value={formData.dieselConsumptionByGenset || ""}
                      onChange={(e) => handleInputChange("dieselConsumptionByGenset", e.target.value)}
                      placeholder="e.g., 3.5"
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dieselCostPerLitre" className="text-sm font-medium">
                      Diesel Cost Per Litre (₹)
                    </Label>
                    <Input
                      id="dieselCostPerLitre"
                      type="number"
                      step="0.01"
                      value={formData.dieselCostPerLitre || ""}
                      onChange={(e) => handleInputChange("dieselCostPerLitre", e.target.value)}
                      placeholder="e.g., 90"
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gensetPower" className="text-sm font-medium">
                      Genset Power (kVA)
                    </Label>
                    <Input
                      id="gensetPower"
                      type="number"
                      step="0.1"
                      value={formData.gensetPower || ""}
                      onChange={(e) => handleInputChange("gensetPower", e.target.value)}
                      placeholder="e.g., 62.5"
                      className="h-11"
                    />
                  </div>
                </div>

                {calculatedData.gensetUnitRate && (
                  <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
                    <div className="text-sm font-medium text-green-800 mb-1">Calculated Genset Unit Rate</div>
                    <div className="text-2xl font-bold text-green-900">₹{calculatedData.gensetUnitRate.toFixed(2)}</div>
                    <div className="text-xs text-green-600 mt-1">Per kWh</div>
                  </div>
                )}
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
                disabled={
                  !formData.machinePower ||
                  !formData.effectiveRunningTimeOfMotors ||
                  !formData.utilization ||
                  !formData.electricityUnitRate
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
