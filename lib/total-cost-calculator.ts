import type { MachineData } from "@/lib/firebaseService"

export interface TotalCostBreakdown {
  investmentCost: number
  spaceCost: number
  powerCost: number
  consumablesCost: number
  toolCost: number
  wagesCost: number
  overheadsCost: number
  totalCostPerHour: number
}

export function calculateTotalCostPerHour(machineData: Partial<MachineData>): TotalCostBreakdown {
  const workingHoursPerDay = machineData.investmentData?.workingHoursPerDay || 8
  const monthlyWorkingHours = 26 * workingHoursPerDay

  // Investment Cost Per Hour
  let investmentCost = 0
  if (machineData.investmentData) {
    const { machineCost, lifeOfMachine, scrapRate, interestRate, balanceLifeOfMachine } = machineData.investmentData
    if (machineCost && lifeOfMachine && workingHoursPerDay) {
      const annualDepreciation = (machineCost - (machineCost * scrapRate) / 100) / lifeOfMachine
      const currentValueOfMachine = machineCost - ((machineCost - (machineCost * scrapRate) / 100) * (lifeOfMachine - balanceLifeOfMachine)) / lifeOfMachine
      const annualInterest = (currentValueOfMachine * interestRate) / 100
      const annualInvestmentCost = annualDepreciation + annualInterest
      investmentCost = annualInvestmentCost / (workingHoursPerDay * 365)
    }
  }

  // Space Cost Per Hour
  let spaceCost = 0
  if (machineData.spaceData) {
    const { factoryRentPerMonth, factorySpaceInSqFt, spaceOccupiedByMachine, numberOfMachinesInFactory, commonSpaceInSqFt } = machineData.spaceData
    if (factoryRentPerMonth && factorySpaceInSqFt && spaceOccupiedByMachine) {
      const machineSpaceCost = factoryRentPerMonth * 12 * (spaceOccupiedByMachine / factorySpaceInSqFt)
      const commonSpaceCost = numberOfMachinesInFactory > 0 
        ? (factoryRentPerMonth * 12 * (commonSpaceInSqFt / factorySpaceInSqFt)) / numberOfMachinesInFactory
        : 0
      const annualSpaceCost = machineSpaceCost + commonSpaceCost
      spaceCost = annualSpaceCost / (workingHoursPerDay * 365)
    }
  }

  // Power Cost Per Hour
  let powerCost = 0
  if (machineData.powerData) {
    const { machinePower, effectiveRunningTimeOfMotors, powerOfFan, numberOfFansAroundMachine, powerOfLight, numberOfLightsAroundMachine, compressorPower, effectiveRunningTimeOfCompressor, numberOfMachinesConnectedWithCompressor, powerOfOtherElectricalEquipment, utilization, electricityUnitRate } = machineData.powerData
    
    if (machinePower && effectiveRunningTimeOfMotors && utilization && electricityUnitRate) {
      const motorPowerConsumption = (machinePower * effectiveRunningTimeOfMotors) / 100
      const fanPowerConsumption = (powerOfFan * numberOfFansAroundMachine) / 1000
      const lightPowerConsumption = (powerOfLight * numberOfLightsAroundMachine) / 1000
      const compressorPowerConsumption = numberOfMachinesConnectedWithCompressor > 0 
        ? (compressorPower * effectiveRunningTimeOfCompressor) / 100 / numberOfMachinesConnectedWithCompressor
        : 0
      const otherEquipmentPowerConsumption = powerOfOtherElectricalEquipment / 1000

      const totalPowerConsumption = motorPowerConsumption + fanPowerConsumption + lightPowerConsumption + compressorPowerConsumption + otherEquipmentPowerConsumption
      powerCost = (totalPowerConsumption * electricityUnitRate * utilization) / 100
    }
  }

  // Consumables Cost Per Hour
  let consumablesCost = 0
  if (machineData.consumablesData) {
    const { coolantOilTopUpPerMonth, coolantOilCostPerLitre, wasteUsagePerMonth, costOfWastePerKg, monthlyMaintenanceCost, annualMaintenanceCost, otherConsumablesPerMonth } = machineData.consumablesData
    
    const monthlyCoolantCost = coolantOilTopUpPerMonth * coolantOilCostPerLitre
    const monthlyWasteCost = wasteUsagePerMonth * costOfWastePerKg
    const totalMonthlyConsumablesCost = monthlyCoolantCost + monthlyWasteCost + monthlyMaintenanceCost + otherConsumablesPerMonth + (annualMaintenanceCost / 12)
    consumablesCost = totalMonthlyConsumablesCost / monthlyWorkingHours
  }

  // Tool Cost Per Hour
  let toolCost = 0
  if (machineData.toolsWagesData) {
    toolCost = machineData.toolsWagesData.averageToolCostPerMonth / monthlyWorkingHours
  }

  // Wages Cost Per Hour (Direct Labor)
  let wagesCost = 0
  if (machineData.toolsWagesData) {
    const { operatorSalaryPerMonth, helperSalaryPerMonth, qualityInspectorSalaryPerMonth } = machineData.toolsWagesData
    const totalDirectLabor = operatorSalaryPerMonth + helperSalaryPerMonth + qualityInspectorSalaryPerMonth
    wagesCost = totalDirectLabor / monthlyWorkingHours
  }

  // Overheads Cost Per Hour
  let overheadsCost = 0
  if (machineData.overheadsData) {
    const { productionSupervisorSalaryPerMonth, qualitySupervisorSalaryPerMonth, engineerSalaryPerMonth, adminStaffSalaryPerMonth, noOfMachinesHandledByProductionSupervisor, noOfMachinesHandledByQualitySupervisor, noOfMachinesHandledByEngineer } = machineData.overheadsData

    const productionSupervisorCostPerHr = productionSupervisorSalaryPerMonth / (monthlyWorkingHours * noOfMachinesHandledByProductionSupervisor)
    const qualitySupervisorCostPerHr = qualitySupervisorSalaryPerMonth / (monthlyWorkingHours * noOfMachinesHandledByQualitySupervisor)
    const engineerCostPerHr = engineerSalaryPerMonth / (monthlyWorkingHours * noOfMachinesHandledByEngineer)
    const adminCostPerHr = adminStaffSalaryPerMonth / (monthlyWorkingHours * 1)

    overheadsCost = productionSupervisorCostPerHr + qualitySupervisorCostPerHr + engineerCostPerHr + adminCostPerHr
  }

  const totalCostPerHour = investmentCost + spaceCost + powerCost + consumablesCost + toolCost + wagesCost + overheadsCost

  return {
    investmentCost,
    spaceCost,
    powerCost,
    consumablesCost,
    toolCost,
    wagesCost,
    overheadsCost,
    totalCostPerHour
  }
}
