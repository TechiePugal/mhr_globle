import type { MachineData } from "./firebaseService"

export const calculateInvestmentData = (data: MachineData["investmentData"]) => {
  const machineLifeHours = data.lifeOfMachine * data.workingHoursPerDay * 365

  const depreciation =
    ((data.machineCost - (data.machineCost * data.scrapRate) / 100) / data.lifeOfMachine) *
    (data.lifeOfMachine - data.balanceLifeOfMachine)
  const currentValueOfMachine = data.machineCost - depreciation

  const depreciationPerHour = (data.machineCost - (data.machineCost * data.scrapRate) / 100) / machineLifeHours
  const interestPerHour = (currentValueOfMachine * data.interestRate) / 100 / (data.workingHoursPerDay * 365)

  return {
    ...data,
    machineLifeHours,
    currentValueOfMachine,
    depreciationPerHour,
    interestPerHour,
  }
}

export const calculatePowerData = (data: MachineData["powerData"]) => {
  const gensetUnitRate = (data.dieselConsumptionByGenset * data.dieselCostPerLitre) / data.gensetPower

  return {
    ...data,
    gensetUnitRate,
  }
}

export const calculateWagesSalariesData = (
  toolsWagesData: MachineData["toolsWagesData"],
  overheadsData: MachineData["overheadsData"],
  workingDays = 26,
  workingHours = 8,
) => {
  const monthlyWorkingHours = workingDays * workingHours

  const operatorCostPerHr =
    toolsWagesData.operatorSalaryPerMonth / (monthlyWorkingHours * overheadsData.noOfMachinesHandledByOperator)
  const helperCostPerHr =
    toolsWagesData.helperSalaryPerMonth / (monthlyWorkingHours * overheadsData.noOfMachinesHandledByHelper)
  const qualityInspectorCostPerHr =
    toolsWagesData.qualityInspectorSalaryPerMonth /
    (monthlyWorkingHours * overheadsData.noOfMachinesHandledByQualityInspector)
  const productionSupervisorCostPerHr =
    overheadsData.productionSupervisorSalaryPerMonth /
    (monthlyWorkingHours * overheadsData.noOfMachinesHandledByProductionSupervisor)
  const qualitySupervisorCostPerHr =
    overheadsData.qualitySupervisorSalaryPerMonth /
    (monthlyWorkingHours * overheadsData.noOfMachinesHandledByQualitySupervisor)
  const engineerCostPerHr =
    overheadsData.engineerSalaryPerMonth / (monthlyWorkingHours * overheadsData.noOfMachinesHandledByEngineer)
  const adminCostPerHr = overheadsData.adminStaffSalaryPerMonth / (monthlyWorkingHours * 1) // Assuming 1 machine for admin

  return {
    operatorCostPerHr,
    helperCostPerHr,
    qualityInspectorCostPerHr,
    productionSupervisorCostPerHr,
    qualitySupervisorCostPerHr,
    engineerCostPerHr,
    adminCostPerHr,
  }
}

export const calculateFinalMachineHourRate = (machineData: MachineData, profitPercentage = 10) => {
  // Investment Cost Calculation
  const investmentData = calculateInvestmentData(machineData.investmentData)
  const annualDepreciation =
    (machineData.investmentData.machineCost -
      (machineData.investmentData.machineCost * machineData.investmentData.scrapRate) / 100) /
    machineData.investmentData.lifeOfMachine
  const annualInterest = (investmentData.currentValueOfMachine * machineData.investmentData.interestRate) / 100
  const annualInvestmentCost = annualDepreciation + annualInterest
  const investmentCostPerHour = annualInvestmentCost / (machineData.investmentData.workingHoursPerDay * 365)

  // Space Cost Calculation
  const machineSpaceCost =
    machineData.spaceData.factoryRentPerMonth *
    12 *
    (machineData.spaceData.spaceOccupiedByMachine / machineData.spaceData.factorySpaceInSqFt)
  const commonSpaceCost =
    (machineData.spaceData.factoryRentPerMonth *
      12 *
      (machineData.spaceData.commonSpaceInSqFt / machineData.spaceData.factorySpaceInSqFt)) /
    machineData.spaceData.numberOfMachinesInFactory
  const annualSpaceCost = machineSpaceCost + commonSpaceCost
  const spaceCostPerHour = annualSpaceCost / (machineData.investmentData.workingHoursPerDay * 365)

  // Power Cost Calculation
  const powerData = calculatePowerData(machineData.powerData)
  const motorPowerConsumption =
    (machineData.powerData.machinePower * machineData.powerData.effectiveRunningTimeOfMotors) / 100
  const fanPowerConsumption =
    (machineData.powerData.powerOfFan * machineData.powerData.numberOfFansAroundMachine) / 1000
  const lightPowerConsumption =
    (machineData.powerData.powerOfLight * machineData.powerData.numberOfLightsAroundMachine) / 1000
  const compressorPowerConsumption =
    (machineData.powerData.compressorPower * machineData.powerData.effectiveRunningTimeOfCompressor) /
    100 /
    machineData.powerData.numberOfMachinesConnectedWithCompressor
  const otherEquipmentPowerConsumption = machineData.powerData.powerOfOtherElectricalEquipment / 1000

  const totalPowerConsumption =
    motorPowerConsumption +
    fanPowerConsumption +
    lightPowerConsumption +
    compressorPowerConsumption +
    otherEquipmentPowerConsumption
  const powerCostPerHour =
    (totalPowerConsumption * machineData.powerData.electricityUnitRate * machineData.powerData.utilization) / 100

  // Consumables Cost Calculation
  const monthlyCoolantCost =
    machineData.consumablesData.coolantOilTopUpPerMonth * machineData.consumablesData.coolantOilCostPerLitre
  const monthlyWasteCost = machineData.consumablesData.wasteUsagePerMonth * machineData.consumablesData.costOfWastePerKg
  const totalMonthlyConsumablesCost =
    monthlyCoolantCost +
    monthlyWasteCost +
    machineData.consumablesData.monthlyMaintenanceCost +
    machineData.consumablesData.otherConsumablesPerMonth +
    machineData.consumablesData.annualMaintenanceCost / 12
  const consumablesCostPerHour = totalMonthlyConsumablesCost / (machineData.investmentData.workingHoursPerDay * 26) // 26 working days per month

  // Tool Cost Calculation
  const toolCostPerHour =
    machineData.toolsWagesData.averageToolCostPerMonth / (machineData.investmentData.workingHoursPerDay * 26)

  // Wages and Salaries Calculation
  const wagesSalariesData = calculateWagesSalariesData(machineData.toolsWagesData, machineData.overheadsData)
  const totalWagesPerHour =
    wagesSalariesData.operatorCostPerHr +
    wagesSalariesData.helperCostPerHr +
    wagesSalariesData.qualityInspectorCostPerHr
  const totalSalariesPerHour =
    wagesSalariesData.productionSupervisorCostPerHr +
    wagesSalariesData.qualitySupervisorCostPerHr +
    wagesSalariesData.engineerCostPerHr +
    wagesSalariesData.adminCostPerHr

  // Total Cost Calculation
  const totalCostPerHour =
    investmentCostPerHour +
    spaceCostPerHour +
    powerCostPerHour +
    consumablesCostPerHour +
    toolCostPerHour +
    totalWagesPerHour +
    totalSalariesPerHour

  // Machine Hour Rate with Profit
  const machineHourRate = totalCostPerHour * (1 + profitPercentage / 100)

  return {
    investmentCost: investmentCostPerHour,
    spaceCost: spaceCostPerHour,
    powerCost: powerCostPerHour,
    consumablesCost: consumablesCostPerHour,
    toolCost: toolCostPerHour,
    wages: totalWagesPerHour,
    salary: totalSalariesPerHour,
    otherOverheads: 0,
    profit: profitPercentage,
    machineHourRate: machineHourRate,
    wagesSalariesData,
  }
}
