"use client"

import { useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import {
  Calculator,
  Menu,
  LogOut,
  Home,
  Building,
  Zap,
  Package,
  Wrench,
  Users,
  FileText,
  List,
  ChevronRight,
  User,
} from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { getCurrentUser, clearCurrentUser } from "@/lib/firebaseService"
import Image from "next/image"
import Logo from "./mhrlogo.png"
const navigationItems = [
  { id: "dashboard", label: "Dashboard", icon: Home, href: "/dashboard" },
  { id: "machines", label: "All Machines", icon: List, href: "/machines" },
  { id: "investment", label: "Investment", icon: Calculator, href: "/investment", step: 1 },
  { id: "space-expenses", label: "Space Expenses", icon: Building, href: "/space-expenses", step: 2 },
  { id: "power-consumption", label: "Power Consumption", icon: Zap, href: "/power-consumption", step: 3 },
  { id: "consumables", label: "Consumables", icon: Package, href: "/consumables", step: 4 },
  { id: "tools-wages", label: "Tools & Wages", icon: Wrench, href: "/tools-wages", step: 5 },
  { id: "overheads", label: "Overheads", icon: Users, href: "/overheads", step: 6 },
  { id: "calculation", label: "Final Calculation", icon: FileText, href: "/calculation", step: 7 },
]

interface NavbarProps {
  title?: string
  currentStep?: number
  totalSteps?: number
}

export default function Navbar({ title = "Machine Hour Rate Calculator", currentStep, totalSteps = 7 }: NavbarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = () => {
    clearCurrentUser()
    localStorage.removeItem("isLoggedIn")
    router.push("/")
  }

  const getCurrentMachine = () => {
    if (typeof window === "undefined") return null

    const savedData = localStorage.getItem("currentMachine")
    if (savedData) {
      const machineData = JSON.parse(savedData)
      return machineData.machineName || "Unnamed Machine"
    }
    return null
  }

  const currentUser = getCurrentUser()
  const machineName = getCurrentMachine()

  return (
    <>
      {/* Desktop Navbar */}
      <nav className="bg-blue-800  border-b border-gray-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Title */}
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="flex items-center space-x-3">
                <div className="flex items-center justify-center p-1 sm:p-2 lg:p-3">
            <Image
              src={Logo}
              alt="Logo"
              className="w-[88px] h-[88px] sm:w-24 sm:h-24 lg:w-28 lg:h-28 object-contain transition-all duration-300"
            />
          </div>
                <div className="hidden sm:block">
<h1 className="text-lg sm:text-xl font-bold text-yellow-400 tracking-wide">
              {title}
            </h1>                  {currentUser && (
                    <p className="text-lg sm:text-xl font-bold text-yellow-400 tracking-wide">
                      {currentUser.companyName} {machineName && `• ${machineName}`}
                    </p>
                  )}
                </div>
              </Link>
            </div>

            {/* Progress Indicator */}
            {currentStep && totalSteps && (
              <div className="hidden md:flex items-center space-x-3">
                <div className="font-bold text-yellow-400 tracking-wide">
                  Step {currentStep} of {totalSteps}
                </div>
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                  ></div>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {Math.round((currentStep / totalSteps) * 100)}%
                </Badge>
              </div>
            )}

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center space-x-4">
              {currentUser && (
                <div className="flex items-center space-x-2 text-lg sm:text-xl font-bold text-yellow-400 tracking-wide">
                  <User className="w-8 h-8" />
                  <span>{currentUser.contactPerson}</span>
                </div>
              )}
              <Button variant="outline" onClick={handleLogout} className="text-sm">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>

            {/* Mobile Menu Button */}
<div className="md:hidden">
  <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
    <SheetTrigger asChild>
      <Button variant="ghost" size="sm" className="p-2">
        <Menu className="w-8 h-8 text-yellow-400" /> {/* Twice as large yellow menu icon */}
      </Button>
    </SheetTrigger>
    <SheetContent side="right" className="w-80">
      <MobileNavigation
        navigationItems={navigationItems}
        pathname={pathname}
        onLogout={handleLogout}
        onClose={() => setMobileMenuOpen(false)}
        machineName={machineName}
      />
    </SheetContent>
  </Sheet>
</div>
          </div>
        </div>

        {/* Mobile Progress Bar */}
        {currentStep && totalSteps && (
          <div className="md:hidden px-4 pb-3">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span>
                Step {currentStep} of {totalSteps}
              </span>
              <span>{Math.round((currentStep / totalSteps) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-600 to-indigo-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              ></div>
            </div>
          </div>
        )}
      </nav>

      {/* Desktop Sidebar */}
      <div className="hidden md:block fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-white border-r border-gray-200 overflow-y-auto">
        <DesktopNavigation
          navigationItems={navigationItems}
          pathname={pathname}
          currentUser={currentUser}
          machineName={machineName}
        />
      </div>
    </>
  )
}

function DesktopNavigation({ navigationItems, pathname, currentUser, machineName }: any) {
  return (
    <div className="p-4 space-y-6">
      {/* Company Info */}
      {currentUser && (
        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center space-x-2 mb-2">
            <Building className="w-4 h-4 text-blue-600" />
            <p className="text-xs font-medium text-blue-900">Company</p>
          </div>
          <p className="text-sm text-blue-700 font-medium">{currentUser.companyName}</p>
          <p className="text-xs text-blue-600">{currentUser.contactPerson}</p>
        </div>
      )}

      {/* Current Machine Info */}
      {machineName && (
        <div className="p-3 bg-green-50 rounded-lg border border-green-200">
          <p className="text-xs font-medium text-green-900 mb-1">Current Machine</p>
          <p className="text-sm text-green-700 font-medium">{machineName}</p>
        </div>
      )}

      {/* Navigation Sections */}
      <div className="space-y-6">
        {/* Main Navigation */}
        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Main</h3>
          <div className="space-y-1">
            {navigationItems.slice(0, 2).map((item: any) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link key={item.id} href={item.href}>
                  <div
                    className={cn(
                      "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                      isActive ? "bg-blue-100 text-blue-700 border border-blue-200" : "text-gray-700 hover:bg-gray-100",
                    )}
                  >
                    <Icon className="w-4 h-4 mr-3" />
                    {item.label}
                    {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
                  </div>
                </Link>
              )
            })}
          </div>
        </div>

        {/* Calculation Steps */}
        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Calculation Steps</h3>
          <div className="space-y-1">
            {navigationItems.slice(2).map((item: any) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link key={item.id} href={item.href}>
                  <div
                    className={cn(
                      "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                      isActive ? "bg-blue-100 text-blue-700 border border-blue-200" : "text-gray-700 hover:bg-gray-100",
                    )}
                  >
                    <div className="flex items-center mr-3">
                      <div
                        className={cn(
                          "w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold mr-2",
                          isActive ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600",
                        )}
                      >
                        {item.step}
                      </div>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="flex-1">{item.label}</span>
                    {isActive && <ChevronRight className="w-4 h-4" />}
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
        <footer className="text-center mt-4 pt-4 text-[10px] text-gray-500 px-4 leading-relaxed border-t border-gray-200">
      © 2025 MHR Calculator. <br/> All rights reserved.
          <br />
          Architected by{" "}
          <a
            href="https://www.kannanamirthalingam.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
          >
            Kannan
          </a>
          <br />
          Developed by{" "}
          <a
            href="https://www.linkedin.com/in/techiepugal-in-090135272/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
          >
            Pugal
          </a>
        </footer>

    </div>
  )
}

function MobileNavigation({ navigationItems, pathname, onLogout, onClose, currentUser, machineName }: any) {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
            <Calculator className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">Navigation</h2>
            {currentUser && <p className="text-xs text-gray-500">{currentUser.companyName}</p>}
          </div>
        </div>
      </div>

      {/* Navigation Items - same structure as desktop */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Company Info */}
        {currentUser && (
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center space-x-2 mb-2">
              <Building className="w-4 h-4 text-blue-600" />
              <p className="text-xs font-medium text-blue-900">Company</p>
            </div>
            <p className="text-sm text-blue-700 font-medium">{currentUser.companyName}</p>
            <p className="text-xs text-blue-600">{currentUser.contactPerson}</p>
          </div>
        )}

        {/* Current Machine Info */}
        {machineName && (
          <div className="p-3 bg-green-50 rounded-lg border border-green-200">
            <p className="text-xs font-medium text-green-900 mb-1">Current Machine</p>
            <p className="text-sm text-green-700 font-medium">{machineName}</p>
          </div>
        )}

        {/* Main Navigation */}
        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Main</h3>
          <div className="space-y-2">
            {navigationItems.slice(0, 2).map((item: any) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link key={item.id} href={item.href} onClick={onClose}>
                  <div
                    className={cn(
                      "flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors",
                      isActive ? "bg-blue-100 text-blue-700 border border-blue-200" : "text-gray-700 hover:bg-gray-100",
                    )}
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    {item.label}
                  </div>
                </Link>
              )
            })}
          </div>
        </div>

        {/* Calculation Steps */}
        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Calculation Steps</h3>
          <div className="space-y-2">
            {navigationItems.slice(2).map((item: any) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link key={item.id} href={item.href} onClick={onClose}>
                  <div
                    className={cn(
                      "flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors",
                      isActive ? "bg-blue-100 text-blue-700 border border-blue-200" : "text-gray-700 hover:bg-gray-100",
                    )}
                  >
                    <div className="flex items-center mr-3">
                      <div
                        className={cn(
                          "w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold mr-2",
                          isActive ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600",
                        )}
                      >
                        {item.step}
                      </div>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="flex-1">{item.label}</span>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 space-y-3 text-center text-[10px] text-gray-500 leading-relaxed">
        <div>
          © 2025 MHR Calculator. <br/> All rights reserved.
          <br />
          Architected by{" "}
          <a
            href="https://www.kannanamirthalingam.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
          >
            Kannan
          </a>
          <br />
          Developed by{" "}
          <a
            href="https://www.linkedin.com/in/techiepugal-in-090135272/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
          >
            Pugal
          </a>
        </div>

        <Button variant="outline" onClick={onLogout} className="w-full flex items-center justify-center">
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </div>
      
    </div>
  )
}
