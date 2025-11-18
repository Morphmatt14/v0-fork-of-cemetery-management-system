"use client"

import type React from "react"
import { verifyEmployeeCredentials } from "@/lib/auth-store"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"
import { useRouter } from 'next/navigation'
import Image from "next/image"
import { activityStore } from "@/lib/activity-store"

// ... existing SVG icons ...

export default function EmployeePortalLoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [logoClicks, setLogoClicks] = useState(0)
  const [showAdminLink, setShowAdminLink] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    setTimeout(() => {
      if (verifyEmployeeCredentials(formData.username, formData.password)) {
        localStorage.setItem("employeeUser", formData.username)
        localStorage.setItem("employeeSession", JSON.stringify({ username: formData.username, timestamp: Date.now() }))
        localStorage.setItem("currentUser", JSON.stringify({ username: formData.username, role: 'employee' }))
        
        activityStore.log(formData.username, 'LOGIN', 'Employee logged in', 'auth')
        
        router.push("/admin/dashboard")
      } else {
        setError("Invalid username or password. Try employee/emp123")
      }
      setIsLoading(false)
    }, 1000)
  }

  const handleLogoClick = () => {
    const newClickCount = logoClicks + 1
    setLogoClicks(newClickCount)
    if (newClickCount === 3) {
      setShowAdminLink(true)
      setLogoClicks(0)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-700 flex items-center justify-center p-4">
      <Button
        onClick={() => router.back()}
        className="fixed top-6 left-6 z-50 bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-sm rounded-full w-12 h-12 p-0"
      >
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </Button>

      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <button
              type="button"
              onClick={handleLogoClick}
              className="bg-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all cursor-pointer"
              title={showAdminLink ? "🔓 Admin Access Unlocked!" : `Click ${3 - logoClicks} more times...`}
            >
              <Image src="/images/smpi-logo.png" alt="SMPI Logo" width={48} height={48} className="object-contain" />
            </button>
          </div>
          <h1 className="text-2xl font-bold text-white">Employee Portal</h1>
          <p className="text-slate-300">Staff Operations & Client Management</p>
          
          {showAdminLink && (
            <Button asChild className="mt-4 bg-purple-600 hover:bg-purple-700 animate-pulse">
              <Link href="/super-admin/login">🔓 Admin Access</Link>
            </Button>
          )}
        </div>

        <Card className="shadow-2xl border-slate-200">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Employee Login</CardTitle>
            <CardDescription className="text-center">
              Enter your credentials to access the employee management system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <label htmlFor="username" className="text-sm font-medium text-gray-700">
                  Username
                </label>
                <div className="relative">
                  <svg className="h-4 w-4 text-gray-400 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Enter employee username"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="relative">
                  <svg className="h-4 w-4 text-gray-400 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a3 3 0 00-6 0v4" />
                  </svg>
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter employee password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 flex items-center justify-center"
                  >
                    {showPassword ? '👁️‍🗨️' : '👁'}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center space-x-2 text-sm">
                  <input type="checkbox" className="rounded border-gray-300" />
                  <span className="text-gray-600">Remember me</span>
                </label>
                <Link href="/admin/forgot-password" className="text-sm text-blue-600 hover:text-blue-700">
                  Forgot password?
                </Link>
              </div>

              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign In as Employee"}
              </Button>
            </form>

            <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-800">
                <strong>Employee Access:</strong> Submit client records, lot assignments, and transactions for admin approval.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
