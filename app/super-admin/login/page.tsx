'use client'

import type React from 'react'
import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { verifySuperAdminCredentials } from '@/lib/auth-store'

const Shield = () => (
  <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const Lock = () => (
  <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a3 3 0 00-6 0v4" />
  </svg>
)

const ArrowLeft = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
)

const Eye = () => (
  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
)

const EyeOff = () => (
  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-4.803m5.596-3.856a3.375 3.375 0 11-4.753 4.753m4.753-4.753L3.596 3.039m10.318 10.318L21 21" />
  </svg>
)

export default function SuperAdminLoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({ username: '', password: '' })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    console.log("[v0] Attempting super admin login:", formData.username)

    setTimeout(() => {
      const isValid = verifySuperAdminCredentials(formData.username, formData.password)
      
      console.log("[v0] Super admin verification result:", isValid)
      
      if (isValid) {
        // Create session
        const session = {
          username: formData.username,
          role: 'superadmin',
          timestamp: Date.now(),
          expiresAt: Date.now() + (24 * 60 * 60 * 1000)
        }
        
        // Store in multiple places for reliability
        localStorage.setItem('superAdminSession', JSON.stringify(session))
        localStorage.setItem('superAdminUser', formData.username)
        localStorage.setItem('currentUser', JSON.stringify({ username: formData.username, role: 'superadmin' }))
        
        console.log("[v0] Session created, redirecting to dashboard")
        
        // Use both router push and window location for reliability
        router.push('/super-admin/dashboard')
        setTimeout(() => {
          window.location.href = '/super-admin/dashboard'
        }, 100)
      } else {
        setError('Invalid Super Admin credentials. Try superadmin/superadmin123')
        console.log("[v0] Login failed - invalid credentials")
      }
      setIsLoading(false)
    }, 500)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-purple-700 flex items-center justify-center p-4">
      <Button
        onClick={() => router.back()}
        className="fixed top-6 left-6 z-50 bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-sm rounded-full w-12 h-12 p-0"
      >
        <ArrowLeft />
      </Button>

      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-white p-3 rounded-full shadow-lg">
              <Image src="/images/smpi-logo.png" alt="SMPI Logo" width={48} height={48} className="object-contain" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white">Super Admin Portal</h1>
          <p className="text-purple-200">System Administration & Control</p>
        </div>

        <Card className="shadow-2xl border-purple-200">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Super Admin Login</CardTitle>
            <CardDescription className="text-center">
              Full system control and admin management
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
                  Super Admin Username
                </label>
                <div className="relative">
                  <Shield />
                  <Input
                    id="username"
                    type="text"
                    placeholder="Enter super admin username"
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
                  <Lock />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter super admin password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff /> : <Eye />}
                  </button>
                </div>
              </div>

              <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700" disabled={isLoading}>
                {isLoading ? 'Signing in...' : 'Sign In as Super Admin'}
              </Button>
            </form>

            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">
                <strong>Critical Security Area:</strong> Super Admin credentials have the highest access level. Unauthorized access attempts are logged.
              </p>
            </div>

            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">
                <Link href="/admin/login" className="text-blue-600 hover:text-blue-700 font-medium">
                  Go to Admin Login
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
