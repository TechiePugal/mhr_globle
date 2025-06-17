"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Calculator, Mail, Eye, EyeOff, Shield, ArrowLeft } from "lucide-react"
import { loginUser } from "@/lib/firebaseService"

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<any>({})
  const [loading, setLoading] = useState(false)
  const [showOtpVerification, setShowOtpVerification] = useState(false)
  const [otp, setOtp] = useState("")
  const [otpLoading, setOtpLoading] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
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

  const validateOtp = () => {
    if (!otp || otp.length !== 6) {
      setErrors({ otp: "Please enter a valid 6-digit OTP code" })
      return false
    }
    setErrors({})
    return true
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev: any) => ({ ...prev, [field]: null }))
    }
  }

  const handleOtpChange = (value: string) => {
    // Only allow numbers and limit to 6 digits
    const numericValue = value.replace(/\D/g, "").slice(0, 6)
    setOtp(numericValue)
    // Clear error when user starts typing
    if (errors.otp) {
      setErrors((prev: any) => ({ ...prev, otp: null }))
    }
  }

  const sendOtpEmail = async (email: string) => {
    // This is a placeholder function - replace with your actual OTP sending logic
    // You might want to call your backend API or Firebase function here
    try {
      // Example: await sendOtpToEmail(email)
      console.log(`Sending OTP to ${email}`)
      return true
    } catch (error) {
      console.error("Failed to send OTP:", error)
      return false
    }
  }

  const verifyOtpCode = async (email: string, otpCode: string) => {
    // This is a placeholder function - replace with your actual OTP verification logic
    // You might want to call your backend API or Firebase function here
    try {
      // Example: await verifyOtp(email, otpCode)
      console.log(`Verifying OTP ${otpCode} for ${email}`)
      // For demo purposes, accept any 6-digit code
      return otpCode.length === 6
    } catch (error) {
      console.error("Failed to verify OTP:", error)
      return false
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setLoading(true)
    setErrors({})

    try {
      await loginUser(formData.email, formData.password)

      // Send OTP after successful login
      const otpSent = await sendOtpEmail(formData.email)
      if (otpSent) {
        setShowOtpVerification(true)
      } else {
        setErrors({ general: "Failed to send OTP. Please try again." })
      }
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

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateOtp()) return

    setOtpLoading(true)
    setErrors({})

    try {
      const isValidOtp = await verifyOtpCode(formData.email, otp)

      if (isValidOtp) {
        // OTP verified successfully, redirect to dashboard
        router.push("/dashboard")
      } else {
        setErrors({ otp: "Invalid OTP code. Please try again." })
      }
    } catch (error) {
      setErrors({ otp: "OTP verification failed. Please try again." })
    } finally {
      setOtpLoading(false)
    }
  }

  const handleResendOtp = async () => {
    setResendLoading(true)
    setErrors({})

    try {
      const otpSent = await sendOtpEmail(formData.email)
      if (otpSent) {
        setErrors({ success: "OTP has been resent to your email address." })
      } else {
        setErrors({ general: "Failed to resend OTP. Please try again." })
      }
    } catch (error) {
      setErrors({ general: "Failed to resend OTP. Please try again." })
    } finally {
      setResendLoading(false)
    }
  }

  const handleBackToLogin = () => {
    setShowOtpVerification(false)
    setOtp("")
    setErrors({})
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
            {showOtpVerification ? (
              <Shield className="w-8 h-8 text-white" />
            ) : (
              <Calculator className="w-8 h-8 text-white" />
            )}
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {showOtpVerification ? "Verify Your Email" : "Welcome Back"}
          </h1>
          <p className="text-gray-600">
            {showOtpVerification
              ? "Enter the verification code sent to your email"
              : "Sign in to your account to continue"}
          </p>
        </div>

        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl font-semibold">
              {showOtpVerification ? "Email Verification" : "Sign In"}
            </CardTitle>
            <CardDescription>
              {showOtpVerification
                ? `We've sent a 6-digit code to ${formData.email}`
                : "Enter your credentials to access your account"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!showOtpVerification ? (
              // Login Form
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* General Error */}
                {errors.general && (
                  <Alert variant="destructive" className="bg-red-50 border-red-200">
                    <AlertDescription className="text-red-800">{errors.general}</AlertDescription>
                  </Alert>
                )}

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
            ) : (
              // OTP Verification Form
              <form onSubmit={handleOtpSubmit} className="space-y-6">
                {/* Back Button */}
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleBackToLogin}
                  className="mb-4 p-0 h-auto font-normal text-blue-600 hover:text-blue-700"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Back to login
                </Button>

                {/* Success Message */}
                {errors.success && (
                  <Alert className="bg-green-50 border-green-200">
                    <AlertDescription className="text-green-800">{errors.success}</AlertDescription>
                  </Alert>
                )}

                {/* Error Messages */}
                {(errors.otp || errors.general) && (
                  <Alert variant="destructive" className="bg-red-50 border-red-200">
                    <AlertDescription className="text-red-800">{errors.otp || errors.general}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-4">
                  <div className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-3">
                    <Shield className="w-4 h-4" />
                    <span>Verification Code</span>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="otp" className="text-sm font-medium">
                      Enter 6-digit code <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="otp"
                      type="text"
                      value={otp}
                      onChange={(e) => handleOtpChange(e.target.value)}
                      placeholder="000000"
                      className={`h-11 text-center text-lg tracking-widest ${errors.otp ? "border-red-500" : ""}`}
                      maxLength={6}
                    />
                    {errors.otp && <p className="text-sm text-red-600">{errors.otp}</p>}
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  disabled={otpLoading}
                >
                  {otpLoading ? (
                    <div className="flex items-center">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Verifying...
                    </div>
                  ) : (
                    <>
                      <Shield className="w-4 h-4 mr-2" />
                      Verify Code
                    </>
                  )}
                </Button>

                {/* Resend OTP */}
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">{"Didn't receive the code?"}</p>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleResendOtp}
                    disabled={resendLoading}
                    className="text-blue-600 hover:text-blue-700 p-0 h-auto font-medium"
                  >
                    {resendLoading ? "Sending..." : "Resend Code"}
                  </Button>
                </div>
              </form>
            )}

            {/* Forgot Password Link - Only show on login form */}
            {!showOtpVerification && (
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Forgot your password?{" "}
                  <button className="font-medium text-blue-600 hover:text-blue-500">Reset it here</button>
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
