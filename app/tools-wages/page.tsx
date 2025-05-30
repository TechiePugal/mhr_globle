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
import Link from "next/link"
import Image from "next/image"
export default function ToolsWagesPage() {
  const router = useRouter()
  const [formData, setFormData] = useState<MachineData["toolsWagesData"]>({
    averageToolCostPerMonth: 0,
    operatorSalaryPerMonth: 0,
    helperSalaryPerMonth: 0,
    qualityInspectorSalaryPerMonth: 0,
  })
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
      if (machineData.toolsWagesData) {
        setFormData(machineData.toolsWagesData)
      }
    }
  }, [router])

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
              Space Expenses
            </Link>
            <span>/</span>
            <Link href="/power-consumption" className="hover:text-blue-600">
              Power Consumption
            </Link>
            <span>/</span>
            <Link href="/consumables" className="hover:text-blue-600">
              Consumables
            </Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">Tools & Wages</span>
          </div> */}

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Wrench className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Tools & Direct Labor Costs</h1>
                <p className="text-gray-600">
                  Enter costs for tools and direct labor associated with machine operation
                </p>
              </div>
            </div>
    <div>
      <Image
        src="https://blog.allgeo.com/wp-content/uploads/2024/12/How-To-Calculate-Labor-Cost-In-Manufacturing_.jpg"
        alt="Remote Image"
        width={900} // original width for aspect ratio
        height={300} // original height for aspect ratio
        style={{ maxWidth: '900px', maxHeight: '200px', width: '100%', height: 'auto' }}
      />
    </div>
            <Alert className="bg-blue-50 border-blue-200">
              <Info className="w-4 h-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                This information will be used to calculate hourly tool costs and direct labor wages for machine
                operation.
              </AlertDescription>
            </Alert>
          </div>

          <div className="space-y-6">
            {/* Tool Costs */}
<Card>
  <CardHeader>
    <CardTitle>Tool Costs</CardTitle>
    <CardDescription>Enter average monthly tool and equipment costs</CardDescription>
  </CardHeader>
  <CardContent className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      
      {/* Average Tool Cost Per Month */}
      <div className="space-y-2">
        <img
          src="https://cdn-icons-png.flaticon.com/512/4531/4531781.png"
          alt="Tool Costs"
          className="w-full h-40 object-contain rounded-md"
        />
        <Label htmlFor="averageToolCostPerMonth" className="text-sm font-medium">
          Average Tool Cost / Month (₹)
        </Label>
        <Input
          id="averageToolCostPerMonth"
          type="number"
          value={formData.averageToolCostPerMonth || ""}
          onChange={(e) => handleInputChange("averageToolCostPerMonth", e.target.value)}
          placeholder="e.g., 8000"
          className="h-11"
        />
        <p className="text-xs text-gray-500">
          Include cutting tools, measuring instruments, and other consumable tools
        </p>
      </div>

    </div>
  </CardContent>
</Card>


<Card>
  <CardHeader>
    <CardTitle>Direct Labor Wages</CardTitle>
    <CardDescription>Enter monthly salaries for direct labor involved in machine operation</CardDescription>
  </CardHeader>
  <CardContent className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

      {/* Operator Salary */}
      <div className="space-y-2">
        <img
          src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQQ6liuCXghxTJ4ZTD1wpcBBg-_RmrIUe7-fA&s"
          alt="Operator"
          className="w-full h-40 object-contain rounded-md"
        />
        <Label htmlFor="operatorSalaryPerMonth" className="text-sm font-medium">
          Operator Salary / Month (₹) <span className="text-red-500">*</span>
        </Label>
        <Input
          id="operatorSalaryPerMonth"
          type="number"
          value={formData.operatorSalaryPerMonth || ""}
          onChange={(e) => handleInputChange("operatorSalaryPerMonth", e.target.value)}
          placeholder="e.g., 25000"
          className={`h-11 ${errors.operatorSalaryPerMonth ? "border-red-500" : ""}`}
        />
        {errors.operatorSalaryPerMonth && (
          <p className="text-sm text-red-600">{errors.operatorSalaryPerMonth}</p>
        )}
        <p className="text-xs text-gray-500">Primary machine operator salary</p>
      </div>

      {/* Helper Salary */}
      <div className="space-y-2">
        <img
          src="https://media.graphassets.com/resize=fit:crop,width:1200,height:630/pIMFIKY0SnG2tfY9HncN"
          alt="Helper"
          className="w-full h-40 object-contain rounded-md"
        />
        <Label htmlFor="helperSalaryPerMonth" className="text-sm font-medium">
          Helper Salary / Month (₹)
        </Label>
        <Input
          id="helperSalaryPerMonth"
          type="number"
          value={formData.helperSalaryPerMonth || ""}
          onChange={(e) => handleInputChange("helperSalaryPerMonth", e.target.value)}
          placeholder="e.g., 18000"
          className="h-11"
        />
        <p className="text-xs text-gray-500">Assistant/helper salary (if applicable)</p>
      </div>

      {/* Quality Inspector Salary */}
      <div className="space-y-2">
        <img
          src="https://careertraining.uis.edu/common/images/1/18310/qualitylarge.jpg"
          alt="Quality Inspector"
          className="w-full h-40 object-contain rounded-md"
        />
        <Label htmlFor="qualityInspectorSalaryPerMonth" className="text-sm font-medium">
          Quality Inspector Salary / Month (₹)
        </Label>
        <Input
          id="qualityInspectorSalaryPerMonth"
          type="number"
          value={formData.qualityInspectorSalaryPerMonth || ""}
          onChange={(e) => handleInputChange("qualityInspectorSalaryPerMonth", e.target.value)}
          placeholder="e.g., 22000"
          className="h-11"
        />
        <p className="text-xs text-gray-500">Quality control inspector salary</p>
      </div>

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

        {/* Tool Costs */}
        <div className="p-4 bg-white rounded-lg border border-green-200 space-y-2">
          <img
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR843YBdkBdZ8UIPPFGnPxqKtEqcE0LhOglJw&s" // tools icon
            alt="Tools Icon"
            className="w-full h-32 object-contain"
          />
          <div className="text-sm font-medium text-green-800">Tool Costs/Month</div>
          <div className="text-xl font-bold text-green-900">
            ₹{formData.averageToolCostPerMonth.toLocaleString()}
          </div>
          <div className="text-xs text-green-600">Equipment and consumables</div>
        </div>

        {/* Direct Labor */}
        <div className="p-4 bg-white rounded-lg border border-blue-200 space-y-2">
          <img
            src="https://cdn-icons-png.flaticon.com/512/1995/1995532.png" // labor icon
            alt="Labor Icon"
            className="w-full h-32 object-contain"
          />
          <div className="text-sm font-medium text-blue-800">Direct Labor/Month</div>
          <div className="text-xl font-bold text-blue-900">₹{totalDirectLabor.toLocaleString()}</div>
          <div className="text-xs text-blue-600">Operator + Helper + QC Inspector</div>
        </div>

        {/* Total Monthly Cost */}
        <div className="p-4 bg-white rounded-lg border border-purple-200 space-y-2">
          <img
            src="https://cdn-icons-png.freepik.com/512/8435/8435647.png" // total cost icon
            alt="Total Cost Icon"
            className="w-full h-32 object-contain"
          />
          <div className="text-sm font-medium text-purple-800">Total Monthly Cost</div>
          <div className="text-xl font-bold text-purple-900">₹{totalMonthlyCost.toLocaleString()}</div>
          <div className="text-xs text-purple-600">Tools + Direct Labor</div>
        </div>
      </div>

      {/* Detailed Breakdown */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
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
