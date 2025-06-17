import Image from "next/image"
import type { TotalCostBreakdown } from "@/lib/total-cost-calculator"

interface TotalCostDisplayProps {
  totalCost: TotalCostBreakdown
  currentStep: number
  machineName: string
}

export default function TotalCostDisplay({ totalCost, currentStep, machineName }: TotalCostDisplayProps) {
  const getStepName = (step: number) => {
    const steps = ["Investment", "Space", "Power", "Consumables", "Tools", "Wages", "Overheads"]
    return steps[step - 1] || "Calculation"
  }

  const getCurrentCost = () => {
    switch (currentStep) {
      case 1:
        return totalCost.investmentCost > 0 ? { name: "Investment", value: totalCost.investmentCost } : null
      case 2:
        return totalCost.spaceCost > 0 ? { name: "Space", value: totalCost.spaceCost } : null
      case 3:
        return totalCost.powerCost > 0 ? { name: "Power", value: totalCost.powerCost } : null
      case 4:
        return totalCost.consumablesCost > 0 ? { name: "Consumables", value: totalCost.consumablesCost } : null
      case 5:
        return totalCost.toolCost > 0 ? { name: "Tools", value: totalCost.toolCost } : null
      case 6:
        return totalCost.wagesCost > 0 ? { name: "Wages", value: totalCost.wagesCost } : null
      case 7:
        return totalCost.overheadsCost > 0 ? { name: "Overheads", value: totalCost.overheadsCost } : null
      default:
        return null
    }
  }

  const currentCost = getCurrentCost()

  return (
   <div className="relative  rounded-xl overflow-hidden  w-auto h-auto">
  {/* Overlay */}
  <div className=" p-4 flex flex-col sm:flex-row items-center sm:justify-between text-white space-y-4 sm:space-y-0 sm:space-x-4">
    
{/* Left Side */}
<div className="flex flex-col sm:flex-row justify-between items-center bg-white p-4 rounded-xl shadow-md space-y-4 sm:space-y-0 sm:space-x-4">

  {/* Left Side */}
  <div className="flex flex-col bg-blue-200 px-4 py-2 rounded-lg justify-center space-y-1 text-center sm:text-left w-full sm:w-1/2">
    <h3 className="text-sm font-bold text-gray-900">MHR</h3>
    <div className="text-base font-bold text-yellow-700">
      ₹{(totalCost.totalCostPerHour || 0).toFixed(2)}
    </div>
  </div>

  {/* Right Side */}
  <div className="flex flex-col bg-green-200 px-4 py-2 rounded-lg justify-center space-y-1 text-center sm:text-right w-full sm:w-1/2">
    {currentCost && (
      <>
        <h3 className="text-sm font-bold text-gray-900">{currentCost.name}</h3>
        <div className="text-base font-bold text-yellow-700">
          ₹{currentCost.value.toFixed(2)}
        </div>
      </>
    )}
  </div>

</div>



  </div>
</div>

  )
}
