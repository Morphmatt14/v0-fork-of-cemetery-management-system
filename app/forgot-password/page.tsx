"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Mail, Phone, Shield, Eye, EyeOff, CheckCircle, Send } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [contactMethod, setContactMethod] = useState("email")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [otpTimer, setOtpTimer] = useState(0)

  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    otp: "",
    newPassword: "",
    confirmPassword: "",
  })

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [otpTimer])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    setError("")
  }

  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    const contact = contactMethod === "email" ? formData.email : formData.phone

    if (!contact) {
      setError(`Please enter your ${contactMethod}`)
      setIsLoading(false)
      return
    }

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000))
      setIsLoading(false)
      setSuccess(`OTP sent to your ${contactMethod}: ${contact}`)
      setStep(2)
      setOtpTimer(60)
    } catch (err) {
      setError("Failed to send OTP. Please try again.")
      setIsLoading(false)
    }
  }

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    if (!formData.otp || formData.otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP")
      setIsLoading(false)
      return
    }

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500))
      setIsLoading(false)

      if (formData.otp === "123456") {
        setSuccess("OTP verified successfully!")
        setStep(3)
      } else {
        setError("Invalid OTP. Please try again.")
      }
    } catch (err) {
      setError("Failed to verify OTP. Please try again.")
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    if (!formData.newPassword || formData.newPassword.length < 8) {
      setError("Password must be at least 8 characters long")
      setIsLoading(false)
      return
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000))
      setIsLoading(false)
      setStep(4)
    } catch (err) {
      setError("Failed to reset password. Please try again.")
    }
  }

  const handleResendOTP = () => {
    if (otpTimer > 0) return

    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      setSuccess(`New OTP sent to your ${contactMethod}`)
      setOtpTimer(60)
    }, 1000)
  }

  const handleBackClick = () => {
    if (step > 1) {
      setStep(step - 1)
      setFormData({ ...formData, otp: "", newPassword: "", confirmPassword: "" })
      setError("")
      setSuccess("")
    } else {
      router.back()
    }
  }

  const handleChangeContactMethod = () => {
    setStep(1)
    setFormData({ email: "", phone: "", otp: "", newPassword: "", confirmPassword: "" })
    setError("")
    setSuccess("")
    setOtpTimer(0)
  }

  const handleContinueToLogin = () => {
    router.push("/login")
  }

  const handleBackToHome = () => {
    router.push("/")
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      {/* Back Button - Floating */}
      <Button
        onClick={handleBackClick}
        className="fixed top-6 left-6 z-50 bg-white/90 hover:bg-white text-gray-700 hover:text-gray-900 shadow-lg backdrop-blur-sm border border-gray-200 rounded-full w-12 h-12 p-0"
        aria-label="Go back"
      >
        <ArrowLeft className="h-5 w-5" />
      </Button>

      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-white p-3 rounded-full shadow-lg">
              <Image src="/images/smpi-logo.png" alt="SMPI Logo" width={48} height={48} className="object-contain" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Surigao Memorial Park</h1>
          <p className="text-gray-600">Password Recovery</p>
        </div>

        <Card className="shadow-lg">
          {/* Step 1: Request OTP */}
          {step === 1 && (
            <>
              <CardHeader className="space-y-1">
                <CardTitle className="text-2xl text-center">Forgot Password?</CardTitle>
                <CardDescription className="text-center">
                  Enter your email or phone number to receive an OTP for password reset
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleRequestOTP} className="space-y-4">
                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-3">
                    <label className="text-sm font-medium text-gray-700">Choose recovery method:</label>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        type="button"
                        variant={contactMethod === "email" ? "default" : "outline"}
                        onClick={() => setContactMethod("email")}
                        className="flex items-center justify-center gap-2"
                      >
                        <Mail className="h-4 w-4" />
                        Email
                      </Button>
                      <Button
                        type="button"
                        variant={contactMethod === "phone" ? "default" : "outline"}
                        onClick={() => setContactMethod("phone")}
                        className="flex items-center justify-center gap-2"
                      >
                        <Phone className="h-4 w-4" />
                        Phone
                      </Button>
                    </div>
                  </div>

                  {contactMethod === "email" && (
                    <div className="space-y-2">
                      <label htmlFor="email" className="text-sm font-medium text-gray-700">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          placeholder="Enter your registered email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="pl-10"
                          disabled={isLoading}
                          required
                        />
                      </div>
                    </div>
                  )}

                  {contactMethod === "phone" && (
                    <div className="space-y-2">
                      <label htmlFor="phone" className="text-sm font-medium text-gray-700">
                        Phone Number
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="phone"
                          name="phone"
                          type="tel"
                          placeholder="Enter your registered phone number"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="pl-10"
                          disabled={isLoading}
                          required
                        />
                      </div>
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Sending OTP...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Send OTP
                      </>
                    )}
                  </Button>
                </form>

                <div className="mt-6 text-center">
                  <p className="text-sm text-gray-600">
                    Remember your password?{" "}
                    <Link href="/login" className="text-green-600 hover:text-green-700 font-medium hover:underline">
                      Back to Login
                    </Link>
                  </p>
                </div>
              </CardContent>
            </>
          )}

          {/* Step 2: Verify OTP */}
          {step === 2 && (
            <>
              <CardHeader className="space-y-1">
                <CardTitle className="text-2xl text-center">Verify OTP</CardTitle>
                <CardDescription className="text-center">
                  Enter the 6-digit code sent to your {contactMethod}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleVerifyOTP} className="space-y-4">
                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  {success && (
                    <Alert>
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>{success}</AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-2">
                    <label htmlFor="otp" className="text-sm font-medium text-gray-700">
                      OTP Code
                    </label>
                    <div className="relative">
                      <Shield className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="otp"
                        name="otp"
                        type="text"
                        placeholder="Enter 6-digit OTP"
                        value={formData.otp}
                        onChange={handleInputChange}
                        className="pl-10 text-center text-lg tracking-widest"
                        maxLength={6}
                        disabled={isLoading}
                        required
                      />
                    </div>
                    <p className="text-xs text-gray-500 text-center">Demo OTP: 123456</p>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Verifying...
                      </>
                    ) : (
                      "Verify OTP"
                    )}
                  </Button>

                  {/* Resend OTP */}
                  <div className="text-center">
                    {otpTimer > 0 ? (
                      <p className="text-sm text-gray-600">
                        Resend OTP in <span className="font-medium text-green-600">{formatTime(otpTimer)}</span>
                      </p>
                    ) : (
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={handleResendOTP}
                        disabled={isLoading}
                        className="text-green-600 hover:text-green-700"
                      >
                        Resend OTP
                      </Button>
                    )}
                  </div>
                </form>

                <div className="mt-6 text-center">
                  <Button
                    variant="ghost"
                    onClick={handleChangeContactMethod}
                    className="text-gray-600 hover:text-gray-700"
                  >
                    ← Change contact method
                  </Button>
                </div>
              </CardContent>
            </>
          )}

          {/* Step 3: Reset Password */}
          {step === 3 && (
            <>
              <CardHeader className="space-y-1">
                <CardTitle className="text-2xl text-center">Reset Password</CardTitle>
                <CardDescription className="text-center">Create a new password for your account</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleResetPassword} className="space-y-4">
                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  {success && (
                    <Alert>
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>{success}</AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-2">
                    <label htmlFor="newPassword" className="text-sm font-medium text-gray-700">
                      New Password
                    </label>
                    <div className="relative">
                      <Shield className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="newPassword"
                        name="newPassword"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter new password"
                        value={formData.newPassword}
                        onChange={handleInputChange}
                        className="pl-10 pr-10"
                        disabled={isLoading}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500">Password must be at least 8 characters long</p>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <Shield className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm new password"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className="pl-10 pr-10"
                        disabled={isLoading}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                        aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Resetting Password...
                      </>
                    ) : (
                      "Reset Password"
                    )}
                  </Button>
                </form>
              </CardContent>
            </>
          )}

          {/* Step 4: Success */}
          {step === 4 && (
            <>
              <CardHeader className="space-y-1">
                <CardTitle className="text-2xl text-center text-green-600">Password Reset Successful!</CardTitle>
                <CardDescription className="text-center">Your password has been successfully updated</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <div className="flex justify-center mb-6">
                  <div className="bg-green-100 p-4 rounded-full">
                    <CheckCircle className="h-16 w-16 text-green-600" />
                  </div>
                </div>

                <p className="text-gray-600 mb-6">
                  You can now use your new password to sign in to your lot owner account.
                </p>

                <Button onClick={handleContinueToLogin} className="w-full bg-green-600 hover:bg-green-700 mb-3">
                  Continue to Login
                </Button>

                <Button onClick={handleBackToHome} variant="outline" className="w-full bg-transparent">
                  Back to Home
                </Button>
              </CardContent>
            </>
          )}
        </Card>

        {/* Security Notice */}
        {step <= 3 && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Security Notice:</strong> For your security, the OTP will expire in 10 minutes. If you don't
              receive the code, please check your spam folder or try again.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
