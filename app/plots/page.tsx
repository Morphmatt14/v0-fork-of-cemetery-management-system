"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, MapPin, Plus, Filter } from "lucide-react"
import Link from "next/link"

export default function PlotsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const plots = [
    { id: "A-001", section: "A", row: 1, position: 1, status: "available", price: 2500, size: "Standard" },
    {
      id: "A-002",
      section: "A",
      row: 1,
      position: 2,
      status: "occupied",
      occupant: "John Smith",
      burialDate: "2023-05-15",
      price: 2500,
      size: "Standard",
    },
    {
      id: "A-003",
      section: "A",
      row: 1,
      position: 3,
      status: "reserved",
      reservedBy: "Mary Johnson",
      reservationDate: "2024-01-10",
      price: 2500,
      size: "Standard",
    },
    { id: "B-001", section: "B", row: 1, position: 1, status: "available", price: 3000, size: "Premium" },
    {
      id: "B-002",
      section: "B",
      row: 1,
      position: 2,
      status: "occupied",
      occupant: "Robert Davis",
      burialDate: "2023-08-22",
      price: 3000,
      size: "Premium",
    },
    { id: "C-001", section: "C", row: 1, position: 1, status: "available", price: 4000, size: "Family" },
    {
      id: "C-002",
      section: "C",
      row: 1,
      position: 2,
      status: "reserved",
      reservedBy: "Wilson Family",
      reservationDate: "2024-01-05",
      price: 4000,
      size: "Family",
    },
    { id: "D-001", section: "D", row: 1, position: 1, status: "maintenance", price: 2500, size: "Standard" },
  ]

  const filteredPlots = plots.filter((plot) => {
    const matchesSearch =
      plot.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (plot.occupant && plot.occupant.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (plot.reservedBy && plot.reservedBy.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesStatus = statusFilter === "all" || plot.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "default"
      case "occupied":
        return "secondary"
      case "reserved":
        return "outline"
      case "maintenance":
        return "destructive"
      default:
        return "default"
    }
  }

  const statusCounts = {
    available: plots.filter((p) => p.status === "available").length,
    occupied: plots.filter((p) => p.status === "occupied").length,
    reserved: plots.filter((p) => p.status === "reserved").length,
    maintenance: plots.filter((p) => p.status === "maintenance").length,
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Plot Management</h1>
              <p className="text-gray-600">Manage cemetery plots and assignments</p>
            </div>
            <div className="flex space-x-4">
              <Button asChild>
                <Link href="/">← Dashboard</Link>
              </Button>
              <Button variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add Plot
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">{statusCounts.available}</div>
              <p className="text-sm text-gray-600">Available</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-gray-600">{statusCounts.occupied}</div>
              <p className="text-sm text-gray-600">Occupied</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">{statusCounts.reserved}</div>
              <p className="text-sm text-gray-600">Reserved</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-red-600">{statusCounts.maintenance}</div>
              <p className="text-sm text-gray-600">Maintenance</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Search & Filter
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by plot ID, occupant, or reserved by..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="occupied">Occupied</SelectItem>
                  <SelectItem value="reserved">Reserved</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Plots Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlots.map((plot) => (
            <Card key={plot.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {plot.id}
                    </CardTitle>
                    <CardDescription>
                      Section {plot.section} • Row {plot.row} • Position {plot.position}
                    </CardDescription>
                  </div>
                  <Badge variant={getStatusColor(plot.status)}>{plot.status}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Size:</span>
                    <span className="text-sm font-medium">{plot.size}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Price:</span>
                    <span className="text-sm font-medium">${plot.price.toLocaleString()}</span>
                  </div>

                  {plot.status === "occupied" && plot.occupant && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Occupant:</span>
                        <span className="text-sm font-medium">{plot.occupant}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Burial Date:</span>
                        <span className="text-sm font-medium">{plot.burialDate}</span>
                      </div>
                    </>
                  )}

                  {plot.status === "reserved" && plot.reservedBy && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Reserved By:</span>
                        <span className="text-sm font-medium">{plot.reservedBy}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Reserved Date:</span>
                        <span className="text-sm font-medium">{plot.reservationDate}</span>
                      </div>
                    </>
                  )}
                </div>

                <div className="flex gap-2 mt-4">
                  <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                    View Details
                  </Button>
                  {plot.status === "available" && (
                    <Button size="sm" className="flex-1">
                      Reserve
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredPlots.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-gray-500">No plots found matching your search criteria.</p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
