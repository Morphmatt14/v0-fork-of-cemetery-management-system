"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, User, Calendar, MapPin, Phone, Mail, Plus } from "lucide-react"
import Link from "next/link"

export default function RecordsPage() {
  const [searchTerm, setSearchTerm] = useState("")

  const records = [
    {
      id: 1,
      name: "John Smith",
      dateOfBirth: "1945-03-15",
      dateOfDeath: "2023-05-10",
      burialDate: "2023-05-15",
      plotId: "A-002",
      nextOfKin: "Jane Smith",
      phone: "(555) 123-4567",
      email: "jane.smith@email.com",
      relationship: "Spouse",
      serviceType: "Traditional Burial",
    },
    {
      id: 2,
      name: "Robert Davis",
      dateOfBirth: "1938-08-22",
      dateOfDeath: "2023-08-18",
      burialDate: "2023-08-22",
      plotId: "B-002",
      nextOfKin: "Michael Davis",
      phone: "(555) 987-6543",
      email: "michael.davis@email.com",
      relationship: "Son",
      serviceType: "Memorial Service",
    },
    {
      id: 3,
      name: "Margaret Wilson",
      dateOfBirth: "1952-12-03",
      dateOfDeath: "2023-11-28",
      burialDate: "2023-12-02",
      plotId: "A-045",
      nextOfKin: "Sarah Wilson",
      phone: "(555) 456-7890",
      email: "sarah.wilson@email.com",
      relationship: "Daughter",
      serviceType: "Cremation",
    },
    {
      id: 4,
      name: "Thomas Anderson",
      dateOfBirth: "1941-07-11",
      dateOfDeath: "2024-01-05",
      burialDate: "2024-01-08",
      plotId: "C-012",
      nextOfKin: "Linda Anderson",
      phone: "(555) 321-0987",
      email: "linda.anderson@email.com",
      relationship: "Spouse",
      serviceType: "Traditional Burial",
    },
  ]

  const filteredRecords = records.filter(
    (record) =>
      record.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.plotId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.nextOfKin.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const calculateAge = (birthDate: string, deathDate: string) => {
    const birth = new Date(birthDate)
    const death = new Date(deathDate)
    return death.getFullYear() - birth.getFullYear()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Deceased Records</h1>
              <p className="text-gray-600">Manage burial records and family information</p>
            </div>
            <div className="flex space-x-4">
              <Button asChild>
                <Link href="/">← Dashboard</Link>
              </Button>
              <Button variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add Record
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Search Records
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name, plot ID, or next of kin..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Records List */}
        <div className="space-y-6">
          {filteredRecords.map((record) => (
            <Card key={record.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={`/placeholder.svg?height=48&width=48`} />
                      <AvatarFallback>
                        {record.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-xl">{record.name}</CardTitle>
                      <CardDescription>
                        {new Date(record.dateOfBirth).toLocaleDateString()} -{" "}
                        {new Date(record.dateOfDeath).toLocaleDateString()} (Age{" "}
                        {calculateAge(record.dateOfBirth, record.dateOfDeath)})
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant="outline">{record.serviceType}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Burial Information */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm text-gray-700 uppercase tracking-wide">Burial Information</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">Plot:</span>
                        <span className="font-medium">{record.plotId}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">Burial Date:</span>
                        <span className="font-medium">{new Date(record.burialDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Next of Kin */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm text-gray-700 uppercase tracking-wide">Next of Kin</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">Name:</span>
                        <span className="font-medium">{record.nextOfKin}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-gray-600 ml-6">Relationship:</span>
                        <span className="font-medium">{record.relationship}</span>
                      </div>
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm text-gray-700 uppercase tracking-wide">Contact Information</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span className="font-medium">{record.phone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <span className="font-medium">{record.email}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 mt-6 pt-4 border-t">
                  <Button variant="outline" size="sm">
                    View Full Record
                  </Button>
                  <Button variant="outline" size="sm">
                    Edit Record
                  </Button>
                  <Button variant="outline" size="sm">
                    Print Certificate
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredRecords.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-gray-500">No records found matching your search criteria.</p>
            </CardContent>
          </Card>
        )}

        {/* Summary Stats */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Records Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{records.length}</div>
                <p className="text-sm text-gray-600">Total Records</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {records.filter((r) => r.serviceType === "Traditional Burial").length}
                </div>
                <p className="text-sm text-gray-600">Traditional Burials</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {records.filter((r) => r.serviceType === "Cremation").length}
                </div>
                <p className="text-sm text-gray-600">Cremations</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {records.filter((r) => r.serviceType === "Memorial Service").length}
                </div>
                <p className="text-sm text-gray-600">Memorial Services</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
