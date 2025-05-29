"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { FileText, Download, Loader2, CheckCircle, AlertTriangle } from "lucide-react"
import { getAllMachines, type MachineData } from "@/lib/firebaseService"
import { generateAllMachinesReport, generateSingleMachineReport } from "@/lib/pdfGenerator"

interface ReportGeneratorProps {
  machine?: MachineData
  showAllMachinesReport?: boolean
}

export default function ReportGenerator({ machine, showAllMachinesReport = false }: ReportGeneratorProps) {
  const [generating, setGenerating] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const showSuccess = () => {
    setSuccess(true)
    setTimeout(() => setSuccess(false), 3000)
  }

  const generateSingleReport = async () => {
    if (!machine) return

    setGenerating(true)
    setError(null)

    try {
      const doc = generateSingleMachineReport(machine)
      const fileName = `${machine.machineName?.replace(/[^a-zA-Z0-9]/g, "_") || "Machine"}_Report.pdf`
      doc.save(fileName)
      showSuccess()
    } catch (error) {
      console.error("Error generating report:", error)
      setError("Failed to generate PDF report. Please try again.")
    } finally {
      setGenerating(false)
    }
  }

  const generateAllReport = async () => {
    setGenerating(true)
    setError(null)

    try {
      const machines = await getAllMachines()
      if (machines.length === 0) {
        setError("No machines found to generate report.")
        return
      }

      const doc = generateAllMachinesReport(machines)
      const fileName = `All_Machines_Report_${new Date().toISOString().split("T")[0]}.pdf`
      doc.save(fileName)
      showSuccess()
    } catch (error) {
      console.error("Error generating report:", error)
      setError("Failed to generate summary report. Please try again.")
    } finally {
      setGenerating(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <FileText className="w-5 h-5 mr-2 text-blue-600" />
          Generate Reports
        </CardTitle>
        <CardDescription>Download detailed PDF reports for analysis and documentation</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Success Message */}
        {success && (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <AlertDescription className="text-green-800">
              PDF report generated and downloaded successfully!
            </AlertDescription>
          </Alert>
        )}

        {/* Error Message */}
        {error && (
          <Alert className="bg-red-50 border-red-200">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        {machine && (
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-900 mb-2">Single Machine Report</h4>
            <p className="text-sm text-blue-700 mb-3">
              Comprehensive detailed report for <strong>{machine.machineName}</strong> including all calculations, cost
              breakdowns, and technical specifications.
            </p>
            <Button
              onClick={generateSingleReport}
              disabled={generating}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            >
              {generating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating PDF...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Download Detailed Report
                </>
              )}
            </Button>
          </div>
        )}

        {showAllMachinesReport && (
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <h4 className="font-medium text-green-900 mb-2">All Machines Summary</h4>
            <p className="text-sm text-green-700 mb-3">
              Summary report of all machines with key metrics, investment details, and machine hour rates for quick
              comparison and overview.
            </p>
            <Button
              onClick={generateAllReport}
              disabled={generating}
              variant="outline"
              className="w-full border-green-600 text-green-700 hover:bg-green-50 disabled:opacity-50"
            >
              {generating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating PDF...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Download Summary Report
                </>
              )}
            </Button>
          </div>
        )}

        <div className="text-xs text-gray-500 mt-4">
          <p>
            <strong>Single Machine Report includes:</strong>
          </p>
          <ul className="list-disc list-inside mt-1 space-y-1">
            <li>Complete investment and depreciation details</li>
            <li>Space allocation and rental cost breakdown</li>
            <li>Power consumption analysis</li>
            <li>Consumables and maintenance costs</li>
            <li>Labor costs and overhead allocation</li>
            <li>Final machine hour rate calculation</li>
          </ul>

          <p className="mt-3">
            <strong>All Machines Summary includes:</strong>
          </p>
          <ul className="list-disc list-inside mt-1 space-y-1">
            <li>Summary statistics and totals</li>
            <li>Machine comparison table</li>
            <li>Key metrics for each machine</li>
            <li>Investment and hour rate overview</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
