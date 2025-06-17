"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Calculator, Lock, Eye, EyeOff, Mail, ArrowLeft, Shield } from "lucide-react"
import { loginUser, setCurrentUser } from "@/lib/firebaseService"
import { generateOTP, sendOTPEmail, validateOTP } from "./otpService"

type AuthStep = "login" | "otp"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [otp, setOtp] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [authStep, setAuthStep] = useState<AuthStep>("login")
  const [generatedOTP, setGeneratedOTP] = useState("")
  const [otpTimer, setOtpTimer] = useState(0)
  const [userDetails, setUserDetails] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn")
    const licenseExpiry = localStorage.getItem("licenseExpiry")
    if (isLoggedIn === "true" && licenseExpiry) {
      const expiryDate = new Date(licenseExpiry)
      if (new Date() > expiryDate) {
        localStorage.clear()
        setError("Your license has expired. Please contact the administrator.")
        return
      }
      router.push("/home")
    }
  }, [router])

  // OTP Timer countdown
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [otpTimer])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      if (!email || !password) {
        setError("Please enter both email and password")
        setLoading(false)
        return
      }

      const user = await loginUser(email, password)

      if (!user.isActive) {
        setError("Your account is not active. Please contact the administrator.")
        setLoading(false)
        return
      }

      const expiry = user.licenseExpiry?.toDate?.() || new Date(user.licenseExpiry)

      if (isNaN(expiry.getTime())) {
        setError("Invalid license expiry date. Please contact admin.")
        setLoading(false)
        return
      }

      if (expiry < new Date()) {
        setError("Your license has expired. Please contact the administrator.")
        setLoading(false)
        return
      }

      // Store user details for later use
      setUserDetails({ ...user, licenseExpiry: expiry })

      // Generate and send OTP
      try {
        console.log("Attempting to send OTP to email:", email)
        const newOTP = generateOTP()
        setGeneratedOTP(newOTP)
        console.log("Generated OTP:", newOTP)

        const otpSent = await sendOTPEmail(email, newOTP, user.name || "User")

        if (otpSent) {
          console.log("OTP sent successfully")
          setAuthStep("otp")
          setOtpTimer(300) // 5 minutes timer
          setError("")
        } else {
          throw new Error("Failed to send OTP")
        }
      } catch (otpError) {
        console.error("OTP sending failed:", otpError)
        setError(`Failed to send OTP: ${otpError.message || otpError}`)
        setLoading(false)
        return
      }
    } catch (error: any) {
      setError(error.message || "Login failed. Please check your credentials.")
    } finally {
      setLoading(false)
    }
  }

  const handleOTPVerification = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      if (!otp) {
        setError("Please enter the OTP")
        setLoading(false)
        return
      }

      if (otpTimer <= 0) {
        setError("OTP has expired. Please request a new one.")
        setLoading(false)
        return
      }

      if (!validateOTP(otp, generatedOTP)) {
        setError("Invalid OTP. Please check and try again.")
        setLoading(false)
        return
      }

      // OTP is valid, complete the login process
      localStorage.setItem("isLoggedIn", "true")
      localStorage.setItem("licenseExpiry", userDetails.licenseExpiry.toISOString())
      setCurrentUser(userDetails)
      router.push("/dashboard")
    } catch (error: any) {
      setError(error.message || "OTP verification failed.")
    } finally {
      setLoading(false)
    }
  }

  const handleResendOTP = async () => {
    if (otpTimer > 0) return

    setLoading(true)
    setError("")

    try {
      console.log("Resending OTP to:", email)
      const newOTP = generateOTP()
      setGeneratedOTP(newOTP)

      const otpSent = await sendOTPEmail(email, newOTP, userDetails?.name || "User")

      if (otpSent) {
        setOtpTimer(300) // Reset timer to 5 minutes
        setOtp("") // Clear current OTP input
        setError("")
        console.log("OTP resent successfully")
      } else {
        throw new Error("Failed to resend OTP")
      }
    } catch (otpError) {
      console.error("OTP resend failed:", otpError)
      setError(`Failed to resend OTP: ${otpError.message || otpError}`)
    } finally {
      setLoading(false)
    }
  }

  const handleBackToLogin = () => {
    setAuthStep("login")
    setOtp("")
    setGeneratedOTP("")
    setOtpTimer(0)
    setError("")
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Calculator className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Machine Hour Rate</h1>
          <p className="text-gray-600">Professional Cost Calculator</p>
        </div>

        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-4">
            {authStep === "login" ? (
              <>
                <CardTitle className="text-xl font-semibold">Welcome Back</CardTitle>
                <CardDescription>Sign in to your company account</CardDescription>
              </>
            ) : (
              <>
                <CardTitle className="text-xl font-semibold flex items-center justify-center gap-2">
                  <Shield className="w-5 h-5" />
                  Verify Your Identity
                </CardTitle>
                <CardDescription>We've sent a 6-digit code to {email}</CardDescription>
              </>
            )}
          </CardHeader>
          <CardContent>
            {authStep === "login" ? (
              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="h-11"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="h-11 pr-10"
                      required
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
                </div>

                {error && (
                  <Alert variant="destructive" className="bg-red-50 border-red-200">
                    <AlertDescription className="text-red-800">{error}</AlertDescription>
                  </Alert>
                )}

                <Button
                  type="submit"
                  className="w-full h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Signing in...
                    </div>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 mr-2" />
                      Sign In
                    </>
                  )}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleOTPVerification} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="otp" className="text-sm font-medium">
                    Enter 6-Digit Code
                  </Label>
                  <Input
                    id="otp"
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    placeholder="000000"
                    className="h-11 text-center text-lg tracking-widest"
                    maxLength={6}
                    required
                  />
                </div>

                {otpTimer > 0 && (
                  <div className="text-center text-sm text-gray-600">Code expires in {formatTime(otpTimer)}</div>
                )}

                {error && (
                  <Alert variant="destructive" className="bg-red-50 border-red-200">
                    <AlertDescription className="text-red-800">{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-3">
                  <Button
                    type="submit"
                    className="w-full h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                    disabled={loading || otp.length !== 6}
                  >
                    {loading ? (
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

                  <div className="flex justify-between items-center">
                    <Button type="button" variant="ghost" onClick={handleBackToLogin} className="text-sm">
                      <ArrowLeft className="w-4 h-4 mr-1" />
                      Back to Login
                    </Button>

                    <Button
                      type="button"
                      variant="ghost"
                      onClick={handleResendOTP}
                      disabled={otpTimer > 0 || loading}
                      className="text-sm"
                    >
                      <Mail className="w-4 h-4 mr-1" />
                      {otpTimer > 0 ? `Resend (${formatTime(otpTimer)})` : "Resend Code"}
                    </Button>
                  </div>
                </div>
              </form>
            )}
          </CardContent>
        </Card>

        <div className="text-center mt-6 text-sm text-gray-500">
          © 2024 Machine Hour Rate Calculator. All rights reserved.
        </div>
      </div>
    </div>
  )
}
