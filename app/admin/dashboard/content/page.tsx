"use client"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AdminContentEditor } from "@/components/admin-content-editor"
import { AdminPricingEditor } from "@/components/admin-pricing-editor"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function AdminContentPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost" size="icon">
              <Link href="/admin/dashboard">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Content Management</h1>
              <p className="text-sm text-gray-600">Edit prices, captions, and homepage content</p>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="pricing" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pricing">Pricing</TabsTrigger>
            <TabsTrigger value="homepage">Homepage</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
          </TabsList>

          <TabsContent value="pricing" className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-2">Manage Lot Prices</h2>
              <p className="text-gray-600 mb-6">Update prices and descriptions for all lot types</p>
            </div>
            <AdminPricingEditor />
          </TabsContent>

          <TabsContent value="homepage" className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-2">Homepage Content</h2>
              <p className="text-gray-600 mb-6">Edit the main homepage titles and descriptions</p>
            </div>
            <AdminContentEditor category="homepage" title="Homepage" />
          </TabsContent>

          <TabsContent value="services" className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-2">Services Content</h2>
              <p className="text-gray-600 mb-6">Edit the services page content and captions</p>
            </div>
            <AdminContentEditor category="services" title="Services" />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
