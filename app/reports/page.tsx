"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, FileText, Download, Eye, Loader2, CheckCircle, AlertTriangle } from "lucide-react"
import { getAllMachines, type MachineData } from "@/lib/firebaseService"
import { generateSingleMachineReport } from "@/lib/pdfGenerator"
import ReportGenerator from "@/components/report-generator"
import Link from "next/link"
import Navbar from "@/components/navbar"

export default function ReportsPage() {
  const router = useRouter()
  const [machines, setMachines] = useState<MachineData[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn")
    if (isLoggedIn !== "true") {
      router.push("/")
      return
    }

    loadMachines()
  }, [router])

  const loadMachines = async () => {
    try {
      const machineList = await getAllMachines()
      setMachines(machineList)
    } catch (error) {
      console.error("Error loading machines:", error)
      setError("Failed to load machines data.")
    } finally {
      setLoading(false)
    }
  }

  const showSuccess = () => {
    setSuccess(true)
    setTimeout(() => setSuccess(false), 3000)
  }

  const generateReport = async (machine: MachineData) => {
    setGenerating(machine.id!)
    setError(null)

    try {
      const doc = generateSingleMachineReport(machine)
      const fileName = `${machine.machineName?.replace(/[^a-zA-Z0-9]/g, "_") || "Machine"}_Report.pdf`
      doc.save(fileName)
      showSuccess()
    } catch (error) {
      console.error("Error generating report:", error)
      setError(`Failed to generate report for ${machine.machineName}. Please try again.`)
    } finally {
      setGenerating(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          <span className="text-gray-600">Loading reports...</span>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="md:ml-64 pt-4">
        <div className="px-4 py-6 sm:px-0">
          {/* Success/Error Messages */}
          {success && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <AlertDescription className="text-green-800">
                PDF report generated and downloaded successfully!
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert className="bg-red-50 border-red-200">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <AlertDescription className="text-red-800">{error}</AlertDescription>
            </Alert>
          )}

          {/* All Machines Report */}
          <ReportGenerator showAllMachinesReport={true} />

          {/* Individual Machine Reports */}
          <Card>
            <CardHeader>
              <CardTitle>Individual Machine Reports</CardTitle>
              <CardDescription>
                Generate detailed reports for specific machines with complete calculations and breakdowns
              </CardDescription>
            </CardHeader>
            <CardContent>
              {machines.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No machines found</h3>
                  <p className="text-gray-600 mb-4">Create some machine calculations to generate reports</p>
                  <Link href="/investment">
                    <Button>Create New Machine</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {machines.map((machine) => (
<div
  key={machine.id}
  className="flex flex-col md:flex-row md:items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors space-y-4 md:space-y-0"
>
  <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
      <FileText className="w-5 h-5 text-blue-600" />
    </div>
    <div>
      <h4 className="font-medium text-gray-900 text-sm sm:text-base">{machine.machineName || "Unnamed Machine"}</h4>
      <div className="flex flex-wrap gap-2 text-xs text-gray-600">
        <span>Cost: ₹{machine.investmentData?.machineCost?.toLocaleString() || "0"}</span>
        <span>Power: {machine.powerData?.machinePower || 0} kW</span>
        {machine.calculationData?.machineHourRate && (
          <span>Rate: ₹{machine.calculationData.machineHourRate.toFixed(2)}/hr</span>
        )}
      </div>
    </div>
  </div>
  <div className="flex flex-wrap justify-start md:justify-end items-center space-x-2 space-y-2 md:space-y-0">
    {machine.calculationData?.machineHourRate ? (
      <Badge variant="secondary" className="bg-green-100 text-green-800">
        Complete
      </Badge>
    ) : (
      <Badge variant="outline">Incomplete</Badge>
    )}
    <Button
      onClick={() => generateReport(machine)}
      disabled={generating === machine.id}
      variant="outline"
      size="sm"
      className="w-full sm:w-auto"
    >
      {generating === machine.id ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Generating...
        </>
      ) : (
        <>
          <Download className="w-4 h-4 mr-2" />
          Download
        </>
      )}
    </Button>
    <Link
      href="/investment"
      onClick={() => {
        localStorage.setItem("currentMachine", JSON.stringify(machine))
      }}
    >
      <Button variant="ghost" size="sm" className="w-full sm:w-auto">
        <Eye className="w-4 h-4" />
      </Button>
    </Link>
  </div>
</div>

                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Report Information */}
          <Card>
            <CardHeader>
              <CardTitle>Report Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Summary Report Includes:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Total machines and completion statistics</li>
                    <li>• Total investment and average hour rates</li>
                    <li>• Machine comparison table</li>
                    <li>• Key metrics for quick analysis</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Detailed Report Includes:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Complete investment and depreciation details</li>
                    <li>• Space allocation and power consumption</li>
                    <li>• Consumables and maintenance breakdown</li>
                    <li>• Labor costs and overhead allocation</li>
                    <li>• Final machine hour rate calculation</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

    </div>
  )
}
