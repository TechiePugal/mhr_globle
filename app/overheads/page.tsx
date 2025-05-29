"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, ArrowRight, Users, Info } from "lucide-react"
import type { MachineData } from "@/lib/firebaseService"
import Navbar from "@/components/navbar"
import Link from "next/link"
import Image from "next/image"
export default function OverheadsPage() {
  const router = useRouter()
  const [formData, setFormData] = useState<MachineData["overheadsData"]>({
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
      if (machineData.overheadsData) {
        setFormData(machineData.overheadsData)
      }
    }
  }, [router])

  const validateForm = () => {
    const newErrors: any = {}

    // Validate machine counts are at least 1
    if (formData.noOfMachinesHandledByOperator < 1) newErrors.noOfMachinesHandledByOperator = "Must be at least 1"
    if (formData.noOfMachinesHandledByHelper < 1) newErrors.noOfMachinesHandledByHelper = "Must be at least 1"
    if (formData.noOfMachinesHandledByQualityInspector < 1)
      newErrors.noOfMachinesHandledByQualityInspector = "Must be at least 1"
    if (formData.noOfMachinesHandledByProductionSupervisor < 1)
      newErrors.noOfMachinesHandledByProductionSupervisor = "Must be at least 1"
    if (formData.noOfMachinesHandledByQualitySupervisor < 1)
      newErrors.noOfMachinesHandledByQualitySupervisor = "Must be at least 1"
    if (formData.noOfMachinesHandledByEngineer < 1) newErrors.noOfMachinesHandledByEngineer = "Must be at least 1"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: keyof MachineData["overheadsData"], value: string) => {
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
    machineData.overheadsData = formData

    localStorage.setItem("currentMachine", JSON.stringify(machineData))
    router.push("/calculation")
  }

  const goBack = () => {
    router.push("/tools-wages")
  }

  const totalOverheadSalaries =
    formData.productionSupervisorSalaryPerMonth +
    formData.qualitySupervisorSalaryPerMonth +
    formData.engineerSalaryPerMonth +
    formData.managerSalaryPerMonth +
    formData.adminStaffSalaryPerMonth

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar title="Overheads" currentStep={6} totalSteps={7} />

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
            <Link href="/tools-wages" className="hover:text-blue-600">
              Tools & Wages
            </Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">Overheads</span>
          </div> */}

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Overhead Costs & Resource Allocation</h1>
                <p className="text-gray-600">Enter overhead salaries and specify how many machines each role handles</p>
              </div>
            </div>
    <div>
      <Image
        src="https://buildertrend.com/wp-content/uploads/2023/03/blog-post_VF.png"
        alt="Remote Image"
        width={900} // original width for aspect ratio
        height={300} // original height for aspect ratio
        style={{ maxWidth: '900px', maxHeight: '200px', width: '100%', height: 'auto' }}
      />
    </div>
            <Alert className="bg-blue-50 border-blue-200">
              <Info className="w-4 h-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                This information will be used to calculate the overhead cost per machine hour based on resource
                allocation and management salaries.
              </AlertDescription>
            </Alert>
          </div>

          <div className="space-y-6">
            {/* Management Salaries */}
            <Card>
              <CardHeader>
                <CardTitle>Management & Supervision Salaries</CardTitle>
                <CardDescription>Enter monthly salaries for management and supervisory roles</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="productionSupervisorSalaryPerMonth" className="text-sm font-medium">
                      Production Supervisor Salary / Month (₹)
                    </Label>
                    <Input
                      id="productionSupervisorSalaryPerMonth"
                      type="number"
                      value={formData.productionSupervisorSalaryPerMonth || ""}
                      onChange={(e) => handleInputChange("productionSupervisorSalaryPerMonth", e.target.value)}
                      placeholder="e.g., 45000"
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="qualitySupervisorSalaryPerMonth" className="text-sm font-medium">
                      Quality Supervisor Salary / Month (₹)
                    </Label>
                    <Input
                      id="qualitySupervisorSalaryPerMonth"
                      type="number"
                      value={formData.qualitySupervisorSalaryPerMonth || ""}
                      onChange={(e) => handleInputChange("qualitySupervisorSalaryPerMonth", e.target.value)}
                      placeholder="e.g., 40000"
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="engineerSalaryPerMonth" className="text-sm font-medium">
                      Engineer Salary / Month (₹)
                    </Label>
                    <Input
                      id="engineerSalaryPerMonth"
                      type="number"
                      value={formData.engineerSalaryPerMonth || ""}
                      onChange={(e) => handleInputChange("engineerSalaryPerMonth", e.target.value)}
                      placeholder="e.g., 50000"
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="managerSalaryPerMonth" className="text-sm font-medium">
                      Manager Salary / Month (₹)
                    </Label>
                    <Input
                      id="managerSalaryPerMonth"
                      type="number"
                      value={formData.managerSalaryPerMonth || ""}
                      onChange={(e) => handleInputChange("managerSalaryPerMonth", e.target.value)}
                      placeholder="e.g., 75000"
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="adminStaffSalaryPerMonth" className="text-sm font-medium">
                      Admin Staff Salary / Month (₹)
                    </Label>
                    <Input
                      id="adminStaffSalaryPerMonth"
                      type="number"
                      value={formData.adminStaffSalaryPerMonth || ""}
                      onChange={(e) => handleInputChange("adminStaffSalaryPerMonth", e.target.value)}
                      placeholder="e.g., 30000"
                      className="h-11"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Resource Allocation */}
            <Card>
              <CardHeader>
                <CardTitle>Resource Allocation</CardTitle>
                <CardDescription>
                  Specify how many machines each role handles to calculate per-machine overhead costs
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="noOfMachinesHandledByOperator" className="text-sm font-medium">
                      No of Machines Handled by Operator
                    </Label>
                    <Input
                      id="noOfMachinesHandledByOperator"
                      type="number"
                      min="1"
                      value={formData.noOfMachinesHandledByOperator || ""}
                      onChange={(e) => handleInputChange("noOfMachinesHandledByOperator", e.target.value)}
                      placeholder="e.g., 1"
                      className={`h-11 ${errors.noOfMachinesHandledByOperator ? "border-red-500" : ""}`}
                    />
                    {errors.noOfMachinesHandledByOperator && (
                      <p className="text-sm text-red-600">{errors.noOfMachinesHandledByOperator}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="noOfMachinesHandledByHelper" className="text-sm font-medium">
                      No of Machines Handled by Helper
                    </Label>
                    <Input
                      id="noOfMachinesHandledByHelper"
                      type="number"
                      min="1"
                      value={formData.noOfMachinesHandledByHelper || ""}
                      onChange={(e) => handleInputChange("noOfMachinesHandledByHelper", e.target.value)}
                      placeholder="e.g., 2"
                      className={`h-11 ${errors.noOfMachinesHandledByHelper ? "border-red-500" : ""}`}
                    />
                    {errors.noOfMachinesHandledByHelper && (
                      <p className="text-sm text-red-600">{errors.noOfMachinesHandledByHelper}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="noOfMachinesHandledByQualityInspector" className="text-sm font-medium">
                      No of Machines Handled by Quality Inspector
                    </Label>
                    <Input
                      id="noOfMachinesHandledByQualityInspector"
                      type="number"
                      min="1"
                      value={formData.noOfMachinesHandledByQualityInspector || ""}
                      onChange={(e) => handleInputChange("noOfMachinesHandledByQualityInspector", e.target.value)}
                      placeholder="e.g., 3"
                      className={`h-11 ${errors.noOfMachinesHandledByQualityInspector ? "border-red-500" : ""}`}
                    />
                    {errors.noOfMachinesHandledByQualityInspector && (
                      <p className="text-sm text-red-600">{errors.noOfMachinesHandledByQualityInspector}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="noOfMachinesHandledByProductionSupervisor" className="text-sm font-medium">
                      No of Machines Handled by Production Supervisor
                    </Label>
                    <Input
                      id="noOfMachinesHandledByProductionSupervisor"
                      type="number"
                      min="1"
                      value={formData.noOfMachinesHandledByProductionSupervisor || ""}
                      onChange={(e) => handleInputChange("noOfMachinesHandledByProductionSupervisor", e.target.value)}
                      placeholder="e.g., 10"
                      className={`h-11 ${errors.noOfMachinesHandledByProductionSupervisor ? "border-red-500" : ""}`}
                    />
                    {errors.noOfMachinesHandledByProductionSupervisor && (
                      <p className="text-sm text-red-600">{errors.noOfMachinesHandledByProductionSupervisor}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="noOfMachinesHandledByQualitySupervisor" className="text-sm font-medium">
                      No of Machines Handled by Quality Supervisor
                    </Label>
                    <Input
                      id="noOfMachinesHandledByQualitySupervisor"
                      type="number"
                      min="1"
                      value={formData.noOfMachinesHandledByQualitySupervisor || ""}
                      onChange={(e) => handleInputChange("noOfMachinesHandledByQualitySupervisor", e.target.value)}
                      placeholder="e.g., 15"
                      className={`h-11 ${errors.noOfMachinesHandledByQualitySupervisor ? "border-red-500" : ""}`}
                    />
                    {errors.noOfMachinesHandledByQualitySupervisor && (
                      <p className="text-sm text-red-600">{errors.noOfMachinesHandledByQualitySupervisor}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="noOfMachinesHandledByEngineer" className="text-sm font-medium">
                      No of Machines Handled by Engineer
                    </Label>
                    <Input
                      id="noOfMachinesHandledByEngineer"
                      type="number"
                      min="1"
                      value={formData.noOfMachinesHandledByEngineer || ""}
                      onChange={(e) => handleInputChange("noOfMachinesHandledByEngineer", e.target.value)}
                      placeholder="e.g., 20"
                      className={`h-11 ${errors.noOfMachinesHandledByEngineer ? "border-red-500" : ""}`}
                    />
                    {errors.noOfMachinesHandledByEngineer && (
                      <p className="text-sm text-red-600">{errors.noOfMachinesHandledByEngineer}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Overhead Summary */}
            {totalOverheadSalaries > 0 && (
              <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
                <CardHeader>
                  <CardTitle className="text-green-800">Overhead Cost Summary</CardTitle>
                  <CardDescription className="text-green-700">
                    Monthly overhead costs and resource allocation summary
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-4 bg-white rounded-lg border border-green-200">
                      <div className="text-sm font-medium text-green-800 mb-1">Total Overhead Salaries</div>
                      <div className="text-3xl font-bold text-green-900">₹{totalOverheadSalaries.toLocaleString()}</div>
                      <div className="text-xs text-green-600 mt-1">Per month</div>
                    </div>

                    <div className="p-4 bg-white rounded-lg border border-blue-200">
                      <div className="text-sm font-medium text-blue-800 mb-1">Resource Efficiency</div>
                      <div className="text-lg font-bold text-blue-900">
                        Avg:{" "}
                        {Math.round(
                          (formData.noOfMachinesHandledByOperator +
                            formData.noOfMachinesHandledByHelper +
                            formData.noOfMachinesHandledByQualityInspector +
                            formData.noOfMachinesHandledByProductionSupervisor +
                            formData.noOfMachinesHandledByQualitySupervisor +
                            formData.noOfMachinesHandledByEngineer) /
                            6,
                        )}{" "}
                        machines/person
                      </div>
                      <div className="text-xs text-blue-600 mt-1">Average machines per role</div>
                    </div>
                  </div>

                  {/* Detailed Breakdown */}
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-3">Salary Breakdown</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="flex justify-between">
                        <span>Production Supervisor:</span>
                        <span>₹{formData.productionSupervisorSalaryPerMonth.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Quality Supervisor:</span>
                        <span>₹{formData.qualitySupervisorSalaryPerMonth.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Engineer:</span>
                        <span>₹{formData.engineerSalaryPerMonth.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Manager:</span>
                        <span>₹{formData.managerSalaryPerMonth.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Admin Staff:</span>
                        <span>₹{formData.adminStaffSalaryPerMonth.toLocaleString()}</span>
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
