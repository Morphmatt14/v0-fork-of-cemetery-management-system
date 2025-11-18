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
import { verifyAdminCredentials } from '@/lib/auth-store'
import { activityStore } from '@/lib/activity-store'

// ... existing SVG icons ...

export default function AdminPortalLoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({ username: '', password: '' })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    console.log("[v0] Attempting Admin login:", formData.username)

    setTimeout(() => {
      const isValid = verifyAdminCredentials(formData.username, formData.password)
      
      console.log("[v0] Admin verification result:", isValid)
      
      if (isValid) {
        const session = {
          username: formData.username,
          role: 'admin',
          timestamp: Date.now(),
          expiresAt: Date.now() + (24 * 60 * 60 * 1000)
        }
        
        localStorage.setItem('adminSession', JSON.stringify(session))
        localStorage.setItem('adminUser', formData.username)
        localStorage.setItem('currentUser', JSON.stringify({ username: formData.username, role: 'admin' }))
        
        activityStore.log(formData.username, 'LOGIN', 'Admin logged in', 'auth')
        
        console.log("[v0] Admin session created, redirecting to dashboard")
        router.push('/super-admin/dashboard')
        setTimeout(() => {
          window.location.href = '/super-admin/dashboard'
        }, 100)
      } else {
        setError('Invalid Admin credentials. Try admin/admin123')
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
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </Button>

      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-white p-3 rounded-full shadow-lg">
              <Image src="/images/smpi-logo.png" alt="SMPI Logo" width={48} height={48} className="object-contain" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white">Admin Portal</h1>
          <p className="text-purple-200">Master Control & Administration</p>
        </div>

        <Card className="shadow-2xl border-purple-200">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Admin Login</CardTitle>
            <CardDescription className="text-center">
              Full system control and operations management
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
                  Admin Username
                </label>
                <div className="relative">
                  <svg className="h-4 w-4 text-gray-400 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Enter admin username"
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
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter admin password"
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
                    {showPassword ? '👁️‍🗨️' : '👁'}
                  </button>
                </div>
              </div>

              <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700" disabled={isLoading}>
                {isLoading ? 'Signing in...' : 'Sign In as Admin'}
              </Button>
            </form>

            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">
                <strong>Admin Access:</strong> Master administrator access. Manage employees, approve transactions, and control system settings.
              </p>
            </div>

            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">
                <Link href="/admin/login" className="text-blue-600 hover:text-blue-700 font-medium">
                  Go to Employee Login
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
