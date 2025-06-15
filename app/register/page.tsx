"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Calculator, Mail, Eye, EyeOff } from "lucide-react"
import { loginUser } from "@/lib/firebaseService"

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<any>({})
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const validateForm = () => {
    const newErrors: any = {}

    // Email validation
    if (!formData.email) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address"
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev: any) => ({ ...prev, [field]: null }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setLoading(true)
    setErrors({})

    try {
      await loginUser(formData.email, formData.password)
      // Redirect to dashboard or main page after successful login
      router.push("/dashboard")
    } catch (error: any) {
      if (error.message === "Invalid credentials") {
        setErrors({ general: "Invalid email or password. Please try again." })
      } else if (error.message === "User not found") {
        setErrors({ general: "No account found with this email address." })
      } else {
        setErrors({ general: "Login failed. Please try again." })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Calculator className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
          <p className="text-gray-600">Sign in to your account to continue</p>
        </div>

        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl font-semibold">Sign In</CardTitle>
            <CardDescription>Enter your credentials to access your account</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* General Error */}
              {errors.general && (
                <Alert variant="destructive" className="bg-red-50 border-red-200">
                  <AlertDescription className="text-red-800">{errors.general}</AlertDescription>
                </Alert>
              )}

              {/* Login Form */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-3">
                  <Mail className="w-4 h-4" />
                  <span>Account Information</span>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">
                      Email Address <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      placeholder="Enter your email address"
                      className={`h-11 ${errors.email ? "border-red-500" : ""}`}
                    />
                    {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium">
                      Password <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={(e) => handleInputChange("password", e.target.value)}
                        placeholder="Enter your password"
                        className={`h-11 pr-10 ${errors.password ? "border-red-500" : ""}`}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-11 px-3 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                    {errors.password && <p className="text-sm text-red-600">{errors.password}</p>}
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Signing In...
                  </div>
                ) : (
                  <>
                    <Mail className="w-4 h-4 mr-2" />
                    Sign In
                  </>
                )}
              </Button>
            </form>

            {/* Forgot Password Link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Forgot your password?{" "}
                <button className="font-medium text-blue-600 hover:text-blue-500">
                  Reset it here
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}