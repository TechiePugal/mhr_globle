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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar title="Power Consumption" currentStep={3} totalSteps={7} />

      <main className="md:ml-64 pt-4">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
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

            <div className="mb-6">
              <Image
                src="https://m.economictimes.com/thumb/msid-112197120,width-1600,height-900,resizemode-4,imgsize-81962/peak-power-demand.jpg"
                alt="Power Consumption"
                width={900}
                height={300}
                style={{ maxWidth: '900px', maxHeight: '200px', width: '100%', height: 'auto' }}
                className="rounded-lg shadow-md"
              />
            </div>

            <Alert className="bg-blue-50 border-blue-200">
              <Info className="w-4 h-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                This information will be used to calculate the power cost per hour for your machine.
              </AlertDescription>
            </Alert>
          </div>

          <div className="space-y-8">
            {/* Machine Power Information */}
            <Card>
              <CardHeader>
                <CardTitle>Machine Power Information</CardTitle>
                <CardDescription>Enter details about your machine's power consumption</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {renderInputWithBackgroundImage(
                    "machinePower",
                    "Machine Power",
                    formData.machinePower,
                    (value) => handleInputChange("machinePower", value),
                    "e.g., 7.5",
                    "https://electricityplans.com/wp-content/uploads/2017/04/kWh-Kilowatt-hour-definition-meaning.jpg",
                    "kW",
                    errors.machinePower,
                    true
                  )}

                  {renderInputWithBackgroundImage(
                    "effectiveRunningTimeOfMotors",
                    "Effective Running Time of Motors",
                    formData.effectiveRunningTimeOfMotors,
                    (value) => handleInputChange("effectiveRunningTimeOfMotors", value),
                    "e.g., 80",
                    "https://sparkycalc.com/wp-content/uploads/elementor/thumbs/Untitled-design-2023-09-22T231441.225-qcsem5lsuspp5ot6884d2buk417p45jxuabqx9tb1s.png",
                    "%",
                    errors.effectiveRunningTimeOfMotors,
                    true
                  )}

                  {renderInputWithBackgroundImage(
                    "utilization",
                    "Machine Utilization",
                    formData.utilization,
                    (value) => handleInputChange("utilization", value),
                    "e.g., 85",
                    "https://rockwellautomation.scene7.com/is/image/rockwellautomation/16x9-falcon-group-shop-floor-IMG_6490.2400.jpg",
                    "%",
                    errors.utilization,
                    true
                  )}

                  {renderInputWithBackgroundImage(
                    "electricityUnitRate",
                    "Electricity Unit Rate",
                    formData.electricityUnitRate,
                    (value) => handleInputChange("electricityUnitRate", value),
                    "e.g., 8.5",
                    "https://group.met.com/media/omvoe0f3/electricity.jpg?anchor=center&mode=crop&width=1920&rnd=133293326643000000&mode=max&upscale=false",
                    "₹/kWh",
                    errors.electricityUnitRate,
                    true
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Auxiliary Equipment */}
            <Card>
              <CardHeader>
                <CardTitle>Auxiliary Equipment</CardTitle>
                <CardDescription>Enter details about fans, lights, and other equipment</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {renderInputWithBackgroundImage(
                    "powerOfFan",
                    "Power of Fan",
                    formData.powerOfFan,
                    (value) => handleInputChange("powerOfFan", value),
                    "e.g., 60",
                    "https://bigassfans.com/wp-content/uploads/2024/07/big-warehouse-fans-powerfoilx.jpg",
                    "W"
                  )}

                  {renderInputWithBackgroundImage(
                    "numberOfFansAroundMachine",
                    "Number of Fans Around Machine",
                    formData.numberOfFansAroundMachine,
                    (value) => handleInputChange("numberOfFansAroundMachine", value),
                    "e.g., 2",
                    "https://bigassfans.com/wp-content/uploads/2024/07/big-warehouse-fans-powerfoilx.jpg",
                    "units"
                  )}

                  {renderInputWithBackgroundImage(
                    "powerOfLight",
                    "Power of Light",
                    formData.powerOfLight,
                    (value) => handleInputChange("powerOfLight", value),
                    "e.g., 40",
                    "https://www.cooperlighting.com/content/dam/cooper-lighting/markets/warehouse/warehouse-2400x1350.jpg",
                    "W"
                  )}

                  {renderInputWithBackgroundImage(
                    "numberOfLightsAroundMachine",
                    "Number of Lights Around Machine",
                    formData.numberOfLightsAroundMachine,
                    (value) => handleInputChange("numberOfLightsAroundMachine", value),
                    "e.g., 2",
                    "https://xsylights.com/wp-content/uploads/2019/10/15022016-5-1-1024x574.jpg",
                    "units"
                  )}

                  {renderInputWithBackgroundImage(
                    "powerOfOtherElectricalEquipment",
                    "Power of Other Electrical Equipment",
                    formData.powerOfOtherElectricalEquipment,
                    (value) => handleInputChange("powerOfOtherElectricalEquipment", value),
                    "e.g., 100",
                    "https://www.grayfordindustrial.com/images/electrical-equipment.jpg",
                    "W"
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Compressor Information */}
            <Card>
              <CardHeader>
                <CardTitle>Compressor Information</CardTitle>
                <CardDescription>Enter details about compressor if applicable</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {renderInputWithBackgroundImage(
                    "compressorPower",
                    "Compressor Power",
                    formData.compressorPower,
                    (value) => handleInputChange("compressorPower", value),
                    "e.g., 5.5",
                    "https://5.imimg.com/data5/SELLER/Default/2021/7/YE/PM/MF/2390459/agricultural-compressors-500x500.jpg",
                    "kW"
                  )}

                  {renderInputWithBackgroundImage(
                    "numberOfMachinesConnectedWithCompressor",
                    "Number of Machines Connected with Compressor",
                    formData.numberOfMachinesConnectedWithCompressor,
                    (value) => handleInputChange("numberOfMachinesConnectedWithCompressor", value),
                    "e.g., 3",
                    "https://images.assetsdelivery.com/compings_v2/baloncici/baloncici1112/baloncici111200001.jpg",
                    "units"
                  )}

                  {renderInputWithBackgroundImage(
                    "effectiveRunningTimeOfCompressor",
                    "Effective Running Time of Compressor",
                    formData.effectiveRunningTimeOfCompressor,
                    (value) => handleInputChange("effectiveRunningTimeOfCompressor", value),
                    "e.g., 70",
                    "https://smilehvac.ca/wp-content/uploads/2024/05/air-compressor-checking.png",
                    "%"
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Genset Information */}
            <Card>
              <CardHeader>
                <CardTitle>Genset Information</CardTitle>
                <CardDescription>Enter details about generator set if applicable</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {renderInputWithBackgroundImage(
                    "dieselConsumptionByGenset",
                    "Diesel Consumption by Genset",
                    formData.dieselConsumptionByGenset,
                    (value) => handleInputChange("dieselConsumptionByGenset", value),
                    "e.g., 3.5",
                    "https://www.dieselgeneratortech.com/data/upload/ueditor/20250508/681c5001c2ff8.jpg",
                    "litres/hour"
                  )}

                  {renderInputWithBackgroundImage(
                    "dieselCostPerLitre",
                    "Diesel Cost Per Litre",
                    formData.dieselCostPerLitre,
                    (value) => handleInputChange("dieselCostPerLitre", value),
                    "e.g., 90",
                    "https://www.livemint.com/lm-img/img/2023/12/01/1600x900/2-0-498164804-DIESEL157-0_1681036344722_1701405618751.JPG",
                    "₹"
                  )}

                  {renderInputWithBackgroundImage(
                    "gensetPower",
                    "Genset Power",
                    formData.gensetPower,
                    (value) => handleInputChange("gensetPower", value),
                    "e.g., 62.5",
                    "https://multico.com.ph/wp-content/uploads/2023/06/image2-3-1024x683.png",
                    "kVA"
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Power Cost Calculation */}
            {calculatedData.gensetUnitRate && (
              <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
                <CardHeader>
                  <CardTitle className="text-green-800">Power Cost Calculation</CardTitle>
                  <CardDescription className="text-green-700">
                    Calculated power costs based on your inputs
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {renderCalculationCard(
                      "Genset Unit Rate",
                      calculatedData.gensetUnitRate,
                      "Per kWh",
                      "https://www.nicepng.com/png/full/669-6691568_budget-png.png",
                      "green"
                    )}

                    {formData.electricityUnitRate > 0 && renderCalculationCard(
                      "Grid Electricity Rate",
                      formData.electricityUnitRate,
                      "Per kWh",
                      "https://group.met.com/media/omvoe0f3/electricity.jpg?anchor=center&mode=crop&width=1920&rnd=133293326643000000&mode=max&upscale=false",
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
