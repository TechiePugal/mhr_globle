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
  const [machineName, setMachineName] = useState("")
  const [overheadCostPerHour, setOverheadCostPerHour] = useState<number>(0)
  const [workingHoursPerDay, setWorkingHoursPerDay] = useState<number>(8)

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
      setMachineName(machineData.machineName)
      setWorkingHoursPerDay(machineData.investmentData.workingHoursPerDay || 8)
    }
  }, [router])

  useEffect(() => {
    // Calculate overhead cost per hour using the same logic as calculateFinalMachineHourRate
    const monthlyWorkingHours = 26 * workingHoursPerDay // 26 working days per month

    const productionSupervisorCostPerHr =
      formData.productionSupervisorSalaryPerMonth /
      (monthlyWorkingHours * formData.noOfMachinesHandledByProductionSupervisor)
    const qualitySupervisorCostPerHr =
      formData.qualitySupervisorSalaryPerMonth / (monthlyWorkingHours * formData.noOfMachinesHandledByQualitySupervisor)
    const engineerCostPerHr =
      formData.engineerSalaryPerMonth / (monthlyWorkingHours * formData.noOfMachinesHandledByEngineer)
    const adminCostPerHr = formData.adminStaffSalaryPerMonth / (monthlyWorkingHours * 1) // Assuming 1 machine for admin

    const totalOverheadCostPerHour =
      productionSupervisorCostPerHr + qualitySupervisorCostPerHr + engineerCostPerHr + adminCostPerHr

    setOverheadCostPerHour(totalOverheadCostPerHour)
  }, [formData, workingHoursPerDay])

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
    min?: number,
  ) => (
<div className="space-y-2">
  <div className="rounded-lg overflow-hidden bg-white shadow-lg flex flex-col">

    {/* Top Image Section */}
    <div
      className="h-48 bg-cover bg-center"
      style={{
        backgroundImage: `url(${imageUrl})`,
        backgroundBlendMode: "overlay",
        backgroundColor: "rgba(0, 0, 0, 0.6)",
      }}
    ></div>

    {/* Input Section */}
    <div className="p-6 space-y-4">
      <Label htmlFor={id} className="text-gray-900 font-semibold text-lg">
        {label} {unit && <span className="text-yellow-600">({unit})</span>}{" "}
        {required && <span className="text-red-600">*</span>}
      </Label>

      <Input
        id={id}
        type="number"
        step="0.01"
        min={min}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`h-12 text-lg font-medium border text-gray-900 placeholder:text-gray-600 ${
          error ? "border-red-400" : "border-gray-300"
        } focus:border-blue-500 focus:ring-2 focus:ring-blue-200`}
      />

      {description && (
        <p className="text-gray-600 text-sm">{description}</p>
      )}
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
    colorScheme = "blue",
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
            {typeof value === "number" ? `₹${value.toFixed(2)}` : value}
          </div>
          <div className="text-white/80 text-sm">{unit}</div>
        </div>
      </div>
    )
  }

  const totalOverheadSalaries =
    formData.productionSupervisorSalaryPerMonth +
    formData.qualitySupervisorSalaryPerMonth +
    formData.engineerSalaryPerMonth +
    formData.managerSalaryPerMonth +
    formData.adminStaffSalaryPerMonth

  const averageMachinesPerPerson = Math.round(
    (formData.noOfMachinesHandledByOperator +
      formData.noOfMachinesHandledByHelper +
      formData.noOfMachinesHandledByQualityInspector +
      formData.noOfMachinesHandledByProductionSupervisor +
      formData.noOfMachinesHandledByQualitySupervisor +
      formData.noOfMachinesHandledByEngineer) /
      6,
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar title="Overheads" currentStep={6} totalSteps={7} />

      <main className="md:ml-64 pt-4">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Overhead Costs & Resource Allocation</h1>
                <p className="text-gray-600">
                  Enter overhead salaries and resource allocation for <span className="font-medium">{machineName}</span>
                </p>
              </div>
            </div>

  <div className="relative mb-6 rounded-lg overflow-hidden shadow-lg max-w-full h-[200px] md:h-[200px]">
    {/* Background Image */}
    <Image
      src="https://buildertrend.com/wp-content/uploads/2023/03/blog-post_VF.png"
      alt="Overhead Costs"
      fill
      className="object-cover w-full h-full"
    />

    {/* Overlay Content */}
    <div className="absolute inset-0 bg-indigo-900 bg-opacity-70 p-4 md:p-6 flex flex-col justify-center">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-white text-sm md:text-base">
        <div>
          <h3 className="text-base md:text-lg font-semibold mb-1">Overhead Cost per Hour</h3>
          <div className="text-2xl md:text-4xl font-bold mb-1">₹{overheadCostPerHour.toFixed(2)}</div>
          <p>per hour</p>
        </div>
        <div className="space-y-1 md:space-y-2">
          <div className="flex justify-between">
            <span>Total Overhead Salaries:</span>
            <span>₹{totalOverheadSalaries.toLocaleString()}/month</span>
          </div>
          <div className="flex justify-between">
            <span>Working Hours/Month:</span>
            <span>{workingHoursPerDay * 26} hours</span>
          </div>
          <div className="flex justify-between">
            <span>Resource Efficiency:</span>
            <span>{averageMachinesPerPerson} machines/person</span>
          </div>
          <div className="flex justify-between font-semibold border-t border-white/30 pt-1 mt-1">
            <span>Allocated per Machine:</span>
            <span>₹{overheadCostPerHour.toFixed(2)}/hour</span>
          </div>
        </div>
      </div>
    </div>
  </div>



            <Alert className="bg-blue-50 border-blue-200">
              <Info className="w-4 h-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                This information will be used to calculate the overhead cost per machine hour based on resource
                allocation and management salaries.
              </AlertDescription>
            </Alert>
          </div>

          <div className="space-y-8">
            {/* Management Salaries */}
            <Card>
              <CardHeader>
                <CardTitle>Management & Supervision Salaries</CardTitle>
                <CardDescription>Enter monthly salaries for management and supervisory roles</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {renderInputWithBackgroundImage(
                    "productionSupervisorSalaryPerMonth",
                    "Production Supervisor Salary",
                    formData.productionSupervisorSalaryPerMonth,
                    (value) => handleInputChange("productionSupervisorSalaryPerMonth", value),
                    "e.g., 45000",
                    "https://www.spherion.com/s3fs-media/sph/public/styles/blog_article/public/2022-07/Production_supervisor_overseeing_a_factory_assembly_line_floor_1600_px.jpg?itok=ZYCYZVr-",
                    "₹",
                    undefined,
                    false,
                    "Oversees production operations",
                  )}

                  {renderInputWithBackgroundImage(
                    "qualitySupervisorSalaryPerMonth",
                    "Quality Supervisor Salary",
                    formData.qualitySupervisorSalaryPerMonth,
                    (value) => handleInputChange("qualitySupervisorSalaryPerMonth", value),
                    "e.g., 40000",
                    "https://higherlogicdownload.s3.amazonaws.com/NACE/cedda8a4-c3c0-4583-b1b6-3b248e6eb1f2/UploadedImages/Education/ecourse/qcs-hero.jpg",
                    "₹",
                    undefined,
                    false,
                    "Manages quality control processes",
                  )}

                  {renderInputWithBackgroundImage(
                    "engineerSalaryPerMonth",
                    "Engineer Salary",
                    formData.engineerSalaryPerMonth,
                    (value) => handleInputChange("engineerSalaryPerMonth", value),
                    "e.g., 50000",
                    "https://media.licdn.com/dms/image/v2/C5612AQF3k2PaJyxNoQ/article-cover_image-shrink_720_1280/article-cover_image-shrink_720_1280/0/1520109530566?e=2147483647&v=beta&t=TdrWN_jK2F1lVFxeV3DaYx8fR6RogpT3EeLMYIbGfo4",
                    "₹",
                    undefined,
                    false,
                    "Technical support and maintenance",
                  )}

                  {renderInputWithBackgroundImage(
                    "managerSalaryPerMonth",
                    "Manager Salary",
                    formData.managerSalaryPerMonth,
                    (value) => handleInputChange("managerSalaryPerMonth", value),
                    "e.g., 75000",
                    "https://img.freepik.com/premium-photo/manager-workers-near-cnc-machines_394555-1482.jpg",
                    "₹",
                    undefined,
                    false,
                    "Overall department management",
                  )}

                  {renderInputWithBackgroundImage(
                    "adminStaffSalaryPerMonth",
                    "Admin Staff Salary",
                    formData.adminStaffSalaryPerMonth,
                    (value) => handleInputChange("adminStaffSalaryPerMonth", value),
                    "e.g., 30000",
                    "https://careertechnical.edu/wp-content/uploads/2018/11/10-Things-to-know-about-Office-Administration.jpg",
                    "₹",
                    undefined,
                    false,
                    "Administrative support staff",
                  )}
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
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {renderInputWithBackgroundImage(
                    "noOfMachinesHandledByOperator",
                    "Machines per Operator",
                    formData.noOfMachinesHandledByOperator,
                    (value) => handleInputChange("noOfMachinesHandledByOperator", value),
                    "e.g., 1",
                    "https://i.ytimg.com/vi/8HFizFNorcE/hq720.jpg?sqp=-oaymwE7CK4FEIIDSFryq4qpAy0IARUAAAAAGAElAADIQj0AgKJD8AEB-AHUBoAC4AOKAgwIABABGGUgXChQMA8=&rs=AOn4CLCtW8YtzVTZ5FJr_KdHho9jDQPvaQ",
                    "machines",
                    errors.noOfMachinesHandledByOperator,
                    true,
                    "Number of machines one operator handles",
                    1,
                  )}

                  {renderInputWithBackgroundImage(
                    "noOfMachinesHandledByHelper",
                    "Machines per Helper",
                    formData.noOfMachinesHandledByHelper,
                    (value) => handleInputChange("noOfMachinesHandledByHelper", value),
                    "e.g., 2",
                    "https://careers.prattindustries.com/media/xywl2sab/copy-of-dsc_5836.jpg?width=1600&height=900&rnd=133421894419970000&width=1600&height=900&rmode=crop&quality=75",
                    "machines",
                    errors.noOfMachinesHandledByHelper,
                    true,
                    "Number of machines one helper supports",
                    1,
                  )}

                  {renderInputWithBackgroundImage(
                    "noOfMachinesHandledByQualityInspector",
                    "Machines per Quality Inspector",
                    formData.noOfMachinesHandledByQualityInspector,
                    (value) => handleInputChange("noOfMachinesHandledByQualityInspector", value),
                    "e.g., 3",
                    "https://www.compliancequest.com/wp-content/uploads/2023/11/automated-quality-control-inspection-768x442.webp",
                    "machines",
                    errors.noOfMachinesHandledByQualityInspector,
                    true,
                    "Number of machines one QC inspector covers",
                    1,
                  )}

                  {renderInputWithBackgroundImage(
                    "noOfMachinesHandledByProductionSupervisor",
                    "Machines per Production Supervisor",
                    formData.noOfMachinesHandledByProductionSupervisor,
                    (value) => handleInputChange("noOfMachinesHandledByProductionSupervisor", value),
                    "e.g., 10",
                    "https://media.istockphoto.com/id/1462139281/photo/two-professional-heavy-industry-engineers-wearing-hard-hats-at-factory-walking-and-discussing.jpg?s=612x612&w=0&k=20&c=FnrNr4HGDxxknumX1o5LYsgaLpH4GjmaNipQ0g7OzRY=",
                    "machines",
                    errors.noOfMachinesHandledByProductionSupervisor,
                    true,
                    "Number of machines supervised",
                    1,
                  )}

                  {renderInputWithBackgroundImage(
                    "noOfMachinesHandledByQualitySupervisor",
                    "Machines per Quality Supervisor",
                    formData.noOfMachinesHandledByQualitySupervisor,
                    (value) => handleInputChange("noOfMachinesHandledByQualitySupervisor", value),
                    "e.g., 15",
                    "https://cashflowinventory.com/blog/wp-content/uploads/2023/03/Quality-Control-and-Inspection-Processes-in-Inventory-Management-1024x683.jpg",
                    "machines",
                    errors.noOfMachinesHandledByQualitySupervisor,
                    true,
                    "Number of machines under quality supervision",
                    1,
                  )}

                  {renderInputWithBackgroundImage(
                    "noOfMachinesHandledByEngineer",
                    "Machines per Engineer",
                    formData.noOfMachinesHandledByEngineer,
                    (value) => handleInputChange("noOfMachinesHandledByEngineer", value),
                    "e.g., 20",
                    "https://cgu-odisha.ac.in/wp-content/uploads/2023/05/1_xqAM05_tfNP7VCcE0VAYzw-2048x1408-1-1024x704.jpeg",
                    "machines",
                    errors.noOfMachinesHandledByEngineer,
                    true,
                    "Number of machines per engineer",
                    1,
                  )}
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
                    {renderCalculationCard(
                      "Total Overhead Salaries",
                      totalOverheadSalaries,
                      "Per month",
                      "https://cdn-icons-png.flaticon.com/512/2921/2921222.png",
                      "green",
                    )}

                    {renderCalculationCard(
                      "Resource Efficiency",
                      `${averageMachinesPerPerson} machines/person`,
                      "Average allocation",
                      "https://cdn-icons-png.flaticon.com/512/18500/18500390.png",
                      "blue",
                    )}
                  </div>

                  {/* Detailed Breakdown */}
                  <div className="mt-6 p-4 bg-white/80 backdrop-blur-sm rounded-lg border border-gray-200">
                    <h4 className="font-medium text-gray-900 mb-3">Salary Breakdown</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-800">
                      <div className="flex justify-between border-b border-gray-200 pb-1">
                        <span>Production Supervisor:</span>
                        <span>₹{formData.productionSupervisorSalaryPerMonth.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between border-b border-gray-200 pb-1">
                        <span>Quality Supervisor:</span>
                        <span>₹{formData.qualitySupervisorSalaryPerMonth.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between border-b border-gray-200 pb-1">
                        <span>Engineer:</span>
                        <span>₹{formData.engineerSalaryPerMonth.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between border-b border-gray-200 pb-1">
                        <span>Manager:</span>
                        <span>₹{formData.managerSalaryPerMonth.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Admin Staff:</span>
                        <span>₹{formData.adminStaffSalaryPerMonth.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Resource Allocation Summary */}
                  <div className="mt-4 p-4 bg-white/80 backdrop-blur-sm rounded-lg border border-gray-200">
                    <h4 className="font-medium text-gray-900 mb-3">Resource Allocation</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-800">
                      <div className="flex justify-between border-b border-gray-200 pb-1">
                        <span>Operator:</span>
                        <span>{formData.noOfMachinesHandledByOperator} machines</span>
                      </div>
                      <div className="flex justify-between border-b border-gray-200 pb-1">
                        <span>Helper:</span>
                        <span>{formData.noOfMachinesHandledByHelper} machines</span>
                      </div>
                      <div className="flex justify-between border-b border-gray-200 pb-1">
                        <span>Quality Inspector:</span>
                        <span>{formData.noOfMachinesHandledByQualityInspector} machines</span>
                      </div>
                      <div className="flex justify-between border-b border-gray-200 pb-1">
                        <span>Production Supervisor:</span>
                        <span>{formData.noOfMachinesHandledByProductionSupervisor} machines</span>
                      </div>
                      <div className="flex justify-between border-b border-gray-200 pb-1">
                        <span>Quality Supervisor:</span>
                        <span>{formData.noOfMachinesHandledByQualitySupervisor} machines</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Engineer:</span>
                        <span>{formData.noOfMachinesHandledByEngineer} machines</span>
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
