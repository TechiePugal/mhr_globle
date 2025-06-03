"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
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
import { getAllMachines } from "@/lib/firebaseService"
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

export default function MachineDashboard() {
  const router = useRouter()
  const [machines, setMachines] = useState([])
  const [selectedMachine, setSelectedMachine] = useState("All")
  const [filteredMachines, setFilteredMachines] = useState([])

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn")
    if (isLoggedIn !== "true") {
      router.push("/")
    } else {
      fetchMachines()
    }
  }, [router])

  useEffect(() => {
    if (selectedMachine === "All") {
      setFilteredMachines(machines)
    } else {
      setFilteredMachines(machines.filter((m) => m.machineName === selectedMachine))
    }
  }, [selectedMachine, machines])

  const fetchMachines = async () => {
    try {
      const machineList = await getAllMachines()
      setMachines(machineList)
    } catch (err) {
      console.error("Error loading machines", err)
    }
  }

  const calculateAverage = (key) => {
    if (filteredMachines.length === 0) return 0
    const sum = filteredMachines.reduce((acc, m) => acc + (parseFloat(m.calculationData?.[key] || 0)), 0)
    return parseFloat((sum / filteredMachines.length).toFixed(2))
  }

  const renderCard = (title, value, imageUrl) => (
    <Card
      className="p-4 bg-cover bg-center text-white"
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

  const selectedNames = [...new Set(machines.map((m) => m.machineName))]

  const chartData = [
    { name: "Investment", value: calculateAverage("investmentCost") },
    { name: "Space", value: calculateAverage("spaceCost") },
    { name: "Power", value: calculateAverage("powerCost") },
    { name: "Consumables", value: calculateAverage("consumablesCost") },
    { name: "Tool", value: calculateAverage("toolCost") },
    { name: "Wages", value: calculateAverage("wages") },
    { name: "Salaries", value: calculateAverage("salary") },
  ]

  const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#8dd1e1", "#a4de6c", "#d0ed57"]

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="md:ml-64 pt-4 px-4">
        <div className="mb-4 flex items-center justify-between">
          <div
            className="flex items-center gap-4 p-4 rounded-lg bg-cover bg-center"
            style={{
              backgroundImage: "url('https://cdn.mos.cms.futurecdn.net/YYUAW9kc7MFKSK6Qb3uBwe.jpg')",
            }}
          >
            <Label className="text-black font-bold">Machine:</Label>
            <Select onValueChange={setSelectedMachine} value={selectedMachine}>
              <SelectTrigger className="w-[200px] bg-white">
                <SelectValue placeholder="Select Machine" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Machines</SelectItem>
                {selectedNames.map((name, index) => (
                  <SelectItem key={index} value={name}>
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {renderCard("Investment Cost", calculateAverage("investmentCost"), "https://cdn.corporatefinanceinstitute.com/assets/income-investing-1024x576.jpeg")}
          {renderCard("Space Cost", calculateAverage("spaceCost"), "https://estimatorflorida.com/wp-content/uploads/2022/04/cost-to-build-a-warehouse.jpg")}
          {renderCard("Power Cost", calculateAverage("powerCost"), "https://m.economictimes.com/thumb/msid-112197120,width-1600,height-900,resizemode-4,imgsize-81962/peak-power-demand.jpg")}
          {renderCard("Consumables Cost", calculateAverage("consumablesCost"), "https://padia.org/wp-content/uploads/2023/10/Industrial-Consumables-Sales.jpg")}
          {renderCard("Tool Cost", calculateAverage("toolCost"), "https://blog.allgeo.com/wp-content/uploads/2024/12/How-To-Calculate-Labor-Cost-In-Manufacturing_.jpg")}
          {renderCard("Wages", calculateAverage("wages"), "https://buildertrend.com/wp-content/uploads/2023/03/blog-post_VF.png")}
          {renderCard("Salaries", calculateAverage("salary"), "https://jupiter.money/blog/wp-content/uploads/2023/05/Difference-Between-Wages-and-Salary.jpg")}
          {renderCard("Total Cost/Hour", calculateAverage("machineHourRate"), "https://www.fastems.com/wp-content/uploads/2021/08/AdobeStock_172041052-scaled.jpeg")}
        </div>

        {/* Bar Chart */}
        <div className="mt-10 bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-bold mb-4">Cost Distribution</h2>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#8884d8">
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </main>
    </div>
  )
}
