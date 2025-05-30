"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Save, Calculator, Info, TrendingUp, CheckCircle } from "lucide-react"
import { type MachineData, saveMachine } from "@/lib/firebaseService"
import { calculateFinalMachineHourRate } from "@/lib/calculations"
import Navbar from "@/components/navbar"
import ReportGenerator from "@/components/report-generator"
import Link from "next/link"
import Image from "next/image"
export default function CalculationPage() {
  const router = useRouter()
  const [machineData, setMachineData] = useState<MachineData | null>(null)
  const [profitPercentage, setProfitPercentage] = useState(10)
  const [calculationResult, setCalculationResult] = useState<any>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn")
    if (isLoggedIn !== "true") {
      router.push("/")
      return
    }

    // Load existing data
    const savedData = localStorage.getItem("currentMachine")
    if (savedData) {
      const data: MachineData = JSON.parse(savedData)
      setMachineData(data)

      // Calculate machine hour rate
      const result = calculateFinalMachineHourRate(data, profitPercentage)
      setCalculationResult(result)
    } else {
      router.push("/investment")
    }
  }, [router, profitPercentage])

  const handleProfitChange = (value: string) => {
    const profit = Number.parseFloat(value) || 0
    setProfitPercentage(profit)

    if (machineData) {
      const result = calculateFinalMachineHourRate(machineData, profit)
      setCalculationResult(result)
    }
  }

  const saveToFirebase = async () => {
    if (!machineData || !calculationResult) return

    setSaving(true)
    try {
      const finalMachineData: MachineData = {
        ...machineData,
        wagesSalariesData: calculationResult.wagesSalariesData,
        calculationData: {
          investmentCost: calculationResult.investmentCost,
          spaceCost: calculationResult.spaceCost,
          powerCost: calculationResult.powerCost,
          consumablesCost: calculationResult.consumablesCost,
          toolCost: calculationResult.toolCost,
          wages: calculationResult.wages,
          salary: calculationResult.salary,
          otherOverheads: calculationResult.otherOverheads,
          profit: profitPercentage,
          machineHourRate: calculationResult.machineHourRate,
        },
      }

      const id = await saveMachine(finalMachineData)
      setSaved(true)

      // Update local storage with the saved ID
      finalMachineData.id = id
      localStorage.setItem("currentMachine", JSON.stringify(finalMachineData))

      setTimeout(() => setSaved(false), 3000)
    } catch (error) {
      console.error("Error saving machine:", error)
    } finally {
      setSaving(false)
    }
  }

  const goBack = () => {
    router.push("/overheads")
  }

  const startNewCalculation = () => {
    localStorage.removeItem("currentMachine")
    router.push("/investment")
  }

  const goToDashboard = () => {
    router.push("/dashboard")
  }

  if (!machineData || !calculationResult) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-600">Calculating...</span>
        </div>
      </div>
    )
  }

  const totalCostPerHour =
    calculationResult.investmentCost +
    calculationResult.spaceCost +
    calculationResult.powerCost +
    calculationResult.consumablesCost +
    calculationResult.toolCost +
    calculationResult.wages +
    calculationResult.salary

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar title="Final Calculation" currentStep={7} totalSteps={7} />

      <main className="md:ml-64 pt-4">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
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
            <span>...</span>
            <span>/</span>
            <Link href="/overheads" className="hover:text-blue-600">
              Overheads
            </Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">Final Calculation</span>
          </div> */}

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Calculator className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Final Machine Hour Rate Calculation</h1>
                <p className="text-gray-600">Complete calculation with profit margin and cost breakdown</p>
              </div>
            </div>
    <div>
      <Image
        src="https://www.climet.com/images/total_cost_ownership.png"
        alt="Remote Image"
        width={900} // original width for aspect ratio
        height={300} // original height for aspect ratio
        style={{ maxWidth: '900px', maxHeight: '200px', width: '100%', height: 'auto' }}
      />
    </div>
            {saved ? (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Machine data saved successfully! You can now view it in your dashboard.
                </AlertDescription>
              </Alert>
            ) : (
              <Alert className="bg-blue-50 border-blue-200">
                <Info className="w-4 h-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  Review your machine hour rate calculation and adjust profit percentage as needed. Don't forget to save
                  your calculation!
                </AlertDescription>
              </Alert>
            )}
          </div>

          <div className="space-y-6">
            {/* Machine Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
                  Machine Summary
                </CardTitle>
                <CardDescription>Overview of the machine being calculated</CardDescription>
              </CardHeader>

<CardContent>
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
    {/* Machine Name with Image */}
    <div className="p-4 bg-blue-50 rounded-lg flex flex-col items-center">
      <img
        src={machineData.imageUrl || "https://cdn.prod.website-files.com/620c0d2e51cac37f5958848f/64380f86cf354b9a10d0c34f_metalworking-cnc-milling-machine-2021-08-26-22-59-47-utc%20(1).jpg"} // fallback placeholder image
        alt={machineData.machineName}
        className="w-41 h-41 object-contain mb-3 rounded-md shadow-sm"
      />
      <div className="text-sm font-medium text-blue-800 mb-1">Machine Name</div>
      <div className="text-lg font-bold text-blue-900 text-center">{machineData.machineName}</div>
    </div>

    {/* Investment Cost */}
    <div className="p-4 bg-green-50 rounded-lg">
      <img
        src={machineData.imageUrl || "https://cdn.corporatefinanceinstitute.com/assets/income-investing-1024x576.jpeg"} // fallback placeholder image
        alt={machineData.machineName}
        className="w-41 h-41 object-contain mb-3 rounded-md shadow-sm"
      />
      <div className="text-sm font-medium text-green-800 mb-1">Investment Cost</div>
      <div className="text-lg font-bold text-green-900">
        ₹{machineData.investmentData.machineCost.toLocaleString()}
      </div>
    </div>

    {/* Machine Power */}
    <div className="p-4 bg-purple-50 rounded-lg">
      <img
        src={machineData.imageUrl || "https://m.economictimes.com/thumb/msid-112197120,width-1600,height-900,resizemode-4,imgsize-81962/peak-power-demand.jpg"} // fallback placeholder image
        alt={machineData.machineName}
        className="w-41 h-41 object-contain mb-3 rounded-md shadow-sm"
      />
      <div className="text-sm font-medium text-purple-800 mb-1">Machine Power</div>
      <div className="text-lg font-bold text-purple-900">{machineData.powerData.machinePower} kW</div>
    </div>
  </div>
</CardContent>

            </Card>

            {/* Profit Configuration */}
<Card>
  <CardHeader>
    <CardTitle>Profit Configuration</CardTitle>
    <CardDescription>Adjust profit percentage to see final machine hour rate</CardDescription>
  </CardHeader>
  <CardContent>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
      
      
      <div className="p-4 bg-red-50 rounded-lg flex flex-col border-2 border-red-200 items-center text-center">
        <img
          src="https://qndqdermacare.com/public/storage/Blogs/0ZCYa3Lkpgt0rTc1z1yXQBJhgMQ3xHctPkZJoVI3.jpeg" 
          alt="Total Cost"
          className="w-39 h-39 object-contain mb-3 rounded-md shadow-sm"
        /><Label htmlFor="profit" className="text-sm font-medium">
          Profit Percentage (%)
        </Label>
        <Input
          id="profit"
          type="number"
          step="0.1"
          value={profitPercentage}
          onChange={(e) => handleProfitChange(e.target.value)}
          placeholder="Enter profit percentage"
          className="h-7"
        />
      </div>

      {/* Total Cost/Hour with Image */}
      <div className="p-4 bg-blue-50 rounded-lg flex flex-col border-2 border-blue-200 items-center text-center">
        <img
          src="https://cdn.corporatefinanceinstitute.com/assets/income-investing-1024x576.jpeg" 
          alt="Total Cost"
          className="w-41 h-41 object-contain mb-3 rounded-md shadow-sm"
        /><br/>
        <div className="text-sm text-blue-600 mb-1">Total Cost/Hour</div>
        <div className="text-2xl font-bold text-blue-900">₹{totalCostPerHour.toFixed(2)}</div>
      </div>

      {/* Machine Hour Rate with Image */}
      <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg text-center border-2 border-green-200 flex flex-col items-center">
        <img
          src="https://cdn.prod.website-files.com/620c0d2e51cac37f5958848f/64380f86cf354b9a10d0c34f_metalworking-cnc-milling-machine-2021-08-26-22-59-47-utc%20(1).jpg" 
          alt="Machine Hour Rate"
          className="w-41 h-41 object-contain mb-3 rounded-md shadow-sm"
        />
        <div className="text-sm text-green-600 mb-1">Machine Hour Rate<div className="text-xs text-green-600 mt-1">Including {profitPercentage}% profit</div></div>
        <div className="text-3xl font-bold text-green-900">
          ₹{calculationResult.machineHourRate.toFixed(2)}
        </div>
        
      </div>
    </div>
  </CardContent>
</Card>


            {/* Cost Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Cost Breakdown (Per Hour)</CardTitle>
                  <CardDescription>Detailed breakdown of all cost components</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium">Investment Cost:</span>
                      <span className="font-bold">₹{calculationResult.investmentCost.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium">Space Cost:</span>
                      <span className="font-bold">₹{calculationResult.spaceCost.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium">Power Cost:</span>
                      <span className="font-bold">₹{calculationResult.powerCost.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium">Consumables Cost:</span>
                      <span className="font-bold">₹{calculationResult.consumablesCost.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium">Tool Cost:</span>
                      <span className="font-bold">₹{calculationResult.toolCost.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium">Wages:</span>
                      <span className="font-bold">₹{calculationResult.wages.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium">Salaries:</span>
                      <span className="font-bold">₹{calculationResult.salary.toFixed(2)}</span>
                    </div>
                    <hr className="my-4" />
                    <div className="flex justify-between items-center p-4 bg-blue-100 rounded-lg">
                      <span className="text-lg font-semibold">Total Cost/Hour:</span>
                      <span className="text-xl font-bold text-blue-900">₹{totalCostPerHour.toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Wages Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle>Wages & Salaries (Per Hour)</CardTitle>
                  <CardDescription>Hourly cost breakdown for different roles</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium">Operator:</span>
                      <span className="font-bold">
                        ₹{calculationResult.wagesSalariesData.operatorCostPerHr.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium">Helper:</span>
                      <span className="font-bold">
                        ₹{calculationResult.wagesSalariesData.helperCostPerHr.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium">Quality Inspector:</span>
                      <span className="font-bold">
                        ₹{calculationResult.wagesSalariesData.qualityInspectorCostPerHr.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium">Production Supervisor:</span>
                      <span className="font-bold">
                        ₹{calculationResult.wagesSalariesData.productionSupervisorCostPerHr.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium">Quality Supervisor:</span>
                      <span className="font-bold">
                        ₹{calculationResult.wagesSalariesData.qualitySupervisorCostPerHr.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium">Engineer:</span>
                      <span className="font-bold">
                        ₹{calculationResult.wagesSalariesData.engineerCostPerHr.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium">Admin:</span>
                      <span className="font-bold">
                        ₹{calculationResult.wagesSalariesData.adminCostPerHr.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Report Generation */}
            <ReportGenerator machine={machineData} />

            {/* Navigation */}
            <div className="flex flex-col sm:flex-row justify-between gap-4 pt-6">
              <Button variant="outline" onClick={goBack} className="w-full sm:w-auto">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button variant="outline" onClick={startNewCalculation} className="w-full sm:w-auto">
                  New Calculation
                </Button>
                <Button
                  onClick={saveToFirebase}
                  disabled={saving}
                  className="w-full sm:w-auto bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? "Saving..." : "Save to Database"}
                </Button>
                {saved && (
                  <Button
                    onClick={goToDashboard}
                    className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  >
                    Go to Dashboard
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
