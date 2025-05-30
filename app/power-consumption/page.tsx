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

      {/* Machine Power */}
      <div className="space-y-2">
        <img
          src="https://electricityplans.com/wp-content/uploads/2017/04/kWh-Kilowatt-hour-definition-meaning.jpg"
          alt="Machine Power"
          className="w-full h-45 object-contain rounded-md"
        />
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

      {/* Effective Running Time of Motors */}
      <div className="space-y-2">
        <img
          src="https://sparkycalc.com/wp-content/uploads/elementor/thumbs/Untitled-design-2023-09-22T231441.225-qcsem5lsuspp5ot6884d2buk417p45jxuabqx9tb1s.png"
          alt="Running Time"
          className="w-full h-45 object-contain rounded-md"
        />
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

      {/* Machine Utilization */}
      <div className="space-y-2">
        <img
          src="https://rockwellautomation.scene7.com/is/image/rockwellautomation/16x9-falcon-group-shop-floor-IMG_6490.2400.jpg"
          alt="Utilization"
          className="w-full h-45 object-contain rounded-md"
        />
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

      {/* Electricity Unit Rate */}
      <div className="space-y-2">
        <img
          src="https://group.met.com/media/omvoe0f3/electricity.jpg?anchor=center&mode=crop&width=1920&rnd=133293326643000000&mode=max&upscale=false"
          alt="Electricity Rate"
          className="w-full h-45 object-contain rounded-md"
        />
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

      {/* Power of Fan */}
      <div className="space-y-2">
        <img
          src="https://bigassfans.com/wp-content/uploads/2024/07/big-warehouse-fans-powerfoilx.jpg"
          alt="Power of Fan"
          className="w-full h-45 object-contain rounded-md"
        />
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

      {/* Number of Fans Around Machine */}
      <div className="space-y-2">
        <img
          src="data:image/jpeg;base64,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"
          alt="Number of Fans Around Machine"
          className="w-full h-45 object-contain rounded-md"
        />
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

      {/* Power of Light */}
      <div className="space-y-2">
        <img
          src="https://www.cooperlighting.com/content/dam/cooper-lighting/markets/warehouse/warehouse-2400x1350.jpg"
         alt="Power of Light"
          className="w-full h-45 object-contain rounded-md"
        />
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

      {/* Number of Lights Around Machine */}
      <div className="space-y-2">
        <img
          src="https://xsylights.com/wp-content/uploads/2019/10/15022016-5-1-1024x574.jpg"
          alt="Number of Lights Around Machine"
          className="w-full h-45 object-contain rounded-md"
        />
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

      {/* Power of Other Electrical Equipment */}
      <div className="space-y-2">
        <img
          src="https://www.grayfordindustrial.com/images/electrical-equipment.jpg"
          alt="Other Electrical Equipment Power"
          className="w-full h-45 object-contain rounded-md"
        />
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

      {/* Compressor Power */}
      <div className="space-y-2">
        <img
          src="https://5.imimg.com/data5/SELLER/Default/2021/7/YE/PM/MF/2390459/agricultural-compressors-500x500.jpg"
          alt="Compressor Power"
          className="w-full h-45 object-contain rounded-md"
        />
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

      {/* Number of Machines Connected with Compressor */}
      <div className="space-y-2">
        <img
          src="https://images.assetsdelivery.com/compings_v2/baloncici/baloncici1112/baloncici111200001.jpg"
          alt="Machines Connected"
          className="w-full h-45 object-contain rounded-md"
        />
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

      {/* Effective Running Time */}
      <div className="space-y-2">
        <img
          src="https://smilehvac.ca/wp-content/uploads/2024/05/air-compressor-checking.png"
          alt="Running Time Percentage"
          className="w-full h-45 object-contain rounded-md"
        />
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

      {/* Diesel Consumption */}
      <div className="space-y-2">
        <img
          src="https://www.dieselgeneratortech.com/data/upload/ueditor/20250508/681c5001c2ff8.jpg"
          alt="Diesel Consumption"
          className="w-full h-45 object-contain rounded-md"
        />
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

      {/* Diesel Cost */}
      <div className="space-y-2">
        <img
          src="https://www.livemint.com/lm-img/img/2023/12/01/1600x900/2-0-498164804-DIESEL157-0_1681036344722_1701405618751.JPG"
          alt="Diesel Cost"
          className="w-full h-45 object-contain rounded-md"
        />
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

      {/* Genset Power */}
      <div className="space-y-2">
        <img
          src="https://multico.com.ph/wp-content/uploads/2023/06/image2-3-1024x683.png"
          alt="Genset Power"
          className="w-full h-45 object-contain rounded-md"
        />
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

    {/* Genset Unit Rate Display */}
{calculatedData.gensetUnitRate && (
  <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200 space-y-2 max-w-full mx-auto">
    <img
      src="https://www.nicepng.com/png/full/669-6691568_budget-png.png" // example energy/electricity icon
      alt="Genset Unit Rate Icon"
      className="w-full h-28 object-contain"
    />
    <div className="text-sm font-medium text-green-800">Calculated Genset Unit Rate</div>
    <div className="text-xl font-bold text-green-900">₹{calculatedData.gensetUnitRate.toFixed(2)}</div>
    <div className="text-xs text-green-600">Per kWh</div>
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
