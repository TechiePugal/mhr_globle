"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { getAllMachines, getCurrentUser } from "@/lib/firebaseService"
import Navbar from "@/components/navbar"
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { Calculator, Plus } from "lucide-react"

export default function MachineDashboard() {
  const router = useRouter()
  const [machines, setMachines] = useState([])
  const [selectedMachine, setSelectedMachine] = useState("")
  const [filteredMachine, setFilteredMachine] = useState(null)

  const currentUser = getCurrentUser()

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn")
    if (isLoggedIn !== "true") {
      router.push("/")
    } else {
      fetchMachines()
    }
  }, [router])

  const fetchMachines = async () => {
    try {
      const machineList = await getAllMachines()
      setMachines(machineList)
      if (machineList.length > 0) {
        setSelectedMachine(machineList[0].machineName)
        setFilteredMachine(machineList[0])
      }
    } catch (err) {
      console.error("Error loading machines", err)
    }
  }

  useEffect(() => {
    const selected = machines.find((m) => m.machineName === selectedMachine)
    setFilteredMachine(selected)
  }, [selectedMachine, machines])

  const startNewCalculation = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("currentMachine")
    }
    router.push("/investment")
  }

  const getCostValue = (key) => {
    if (!filteredMachine) return 0
    return parseFloat(parseFloat(filteredMachine.calculationData?.[key] || 0).toFixed(2))
  }

  const handleEdit = (pageName) => {
    const selected = machines.find((m) => m.machineName === selectedMachine)
    localStorage.setItem(
      "currentMachine",
      JSON.stringify({
        ...(selected || {}),
        machineName: selectedMachine,
        fromPage: pageName,
      })
    )
    router.push(`/${pageName}`)
  }

  const renderCard = (title, value, imageUrl, pageName) => {
    return (
      <Card
        onClick={() => handleEdit(pageName)}
        className="p-4 bg-cover bg-center text-white cursor-pointer hover:shadow-lg transition-shadow"
        style={{
          backgroundImage: `url(${imageUrl})`,
          backgroundBlendMode: "overlay",
          backgroundColor: "rgba(0, 0, 0, 0.5)",
        }}
      >
        <CardHeader>
          <CardTitle className="text-md">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-lg font-semibold">₹{value}</div>
        </CardContent>
      </Card>
    )
  }

  const selectedNames = [...new Set(machines.map((m) => m.machineName))]

  const chartData = [
    { name: "Investment", value: getCostValue("investmentCost") },
    { name: "Space", value: getCostValue("spaceCost") },
    { name: "Power", value: getCostValue("powerCost") },
    { name: "Consumables", value: getCostValue("consumablesCost") },
    { name: "Tool", value: getCostValue("toolCost") },
    { name: "Wages", value: getCostValue("wages") },
    { name: "Salaries", value: getCostValue("salary") },
  ]

  const COLORS = [
    "#8884d8",
    "#82ca9d",
    "#ffc658",
    "#ff8042",
    "#8dd1e1",
    "#a4de6c",
    "#d0ed57",
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="md:ml-64 pt-4 px-4">
<div className="mb-4">
  <div
    className="flex flex-col md:flex-row items-start md:items-center gap-4 p-4 rounded-lg bg-cover bg-center"
    style={{
      backgroundImage:
        "url('https://cdn.mos.cms.futurecdn.net/YYUAW9kc7MFKSK6Qb3uBwe.jpg')",
    }}
  >
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
      <Label className="text-black font-bold">Machine:</Label>
      <Select onValueChange={setSelectedMachine} value={selectedMachine}>
        <SelectTrigger className="w-full sm:w-[200px] bg-white">
          <SelectValue placeholder="Select Machine" />
        </SelectTrigger>
        <SelectContent>
          {selectedNames.map((name, index) => (
            <SelectItem key={index} value={name}>
              {name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
    <Button onClick={startNewCalculation} className="w-full sm:w-auto">
      <Plus className="w-4 h-4 mr-2" />
      Create New Machine
    </Button>
  </div>
</div>

        {!filteredMachine && (
          <div className="text-center py-8">
            <Calculator className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No machines yet
            </h3>
            <p className="text-gray-600 mb-4">
              Start by creating your first machine calculation for{" "}
              {currentUser?.companyName}
            </p>
            <Button onClick={startNewCalculation}>
              <Plus className="w-4 h-4 mr-2" />
              Create First Machine
            </Button>
          </div>
        )}

        {/* Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {renderCard(
            "Investment Cost",
            getCostValue("investmentCost"),
            "https://cdn.corporatefinanceinstitute.com/assets/income-investing-1024x576.jpeg",
            "investment"
          )}
          {renderCard(
            "Space Cost",
            getCostValue("spaceCost"),
            "https://estimatorflorida.com/wp-content/uploads/2022/04/cost-to-build-a-warehouse.jpg",
            "space-expenses"
          )}
          {renderCard(
            "Power Cost",
            getCostValue("powerCost"),
            "https://m.economictimes.com/thumb/msid-112197120,width-1600,height-900,resizemode-4,imgsize-81962/peak-power-demand.jpg",
            "power-consumption"
          )}
          {renderCard(
            "Consumables Cost",
            getCostValue("consumablesCost"),
            "https://padia.org/wp-content/uploads/2023/10/Industrial-Consumables-Sales.jpg",
            "consumables"
          )}
          {renderCard(
            "Tool Cost",
            getCostValue("toolCost"),
            "https://blog.allgeo.com/wp-content/uploads/2024/12/How-To-Calculate-Labor-Cost-In-Manufacturing_.jpg",
            "tools-wages"
          )}
          {renderCard(
            "Wages",
            getCostValue("wages"),
            "https://buildertrend.com/wp-content/uploads/2023/03/blog-post_VF.png",
            "tools-wages"
          )}
          {renderCard(
            "Salaries",
            getCostValue("salary"),
            "https://jupiter.money/blog/wp-content/uploads/2023/05/Difference-Between-Wages-and-Salary.jpg",
            "overheads"
          )}
          {renderCard(
            "Total Cost/Hour",
            getCostValue("machineHourRate"),
            "https://www.fastems.com/wp-content/uploads/2021/08/AdobeStock_172041052-scaled.jpeg",
            "calculation"
          )}
        </div>

        {/* Bar Chart */}
        <div className="mt-10 bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-bold mb-4">Cost Distribution</h2>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#8884d8">
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </main>
    </div>
  )
}
