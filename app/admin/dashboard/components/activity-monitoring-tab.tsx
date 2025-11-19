'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination'
import { fetchEmployees, fetchActivityLogs, type Employee, type ActivityLog } from '@/lib/admin-api'
import { Loader2, TrendingUp } from 'lucide-react'

export default function ActivityMonitoringTab() {
  const [activityFilter, setActivityFilter] = useState({ actorUsername: 'all', category: 'all' })
  const [employees, setEmployees] = useState<Employee[]>([])
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([])
  const [filteredLogs, setFilteredLogs] = useState<ActivityLog[]>([])
  const [loadingEmployees, setLoadingEmployees] = useState(true)
  const [loadingLogs, setLoadingLogs] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [employeePage, setEmployeePage] = useState(1)
  const [activitiesPage, setActivitiesPage] = useState(1)
  const employeesPerPage = 3
  const activitiesPerPage = 10

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    // Apply filters whenever logs or filter changes
    applyFilters()
    // Reset activities page to 1 when filters change
    setActivitiesPage(1)
  }, [activityLogs, activityFilter])

  const loadData = async () => {
    await Promise.all([loadEmployees(), loadActivityLogs()])
  }

  const loadEmployees = async () => {
    try {
      setLoadingEmployees(true)
      const data = await fetchEmployees()
      setEmployees(data.employees)
    } catch (err: any) {
      console.error('[Activity Monitoring] Error loading employees:', err)
      setError(err.message || 'Failed to load employees')
    } finally {
      setLoadingEmployees(false)
    }
  }

  const loadActivityLogs = async () => {
    try {
      setLoadingLogs(true)
      setError(null)
      const logs = await fetchActivityLogs({ 
        actorType: 'employee',
        limit: 200 
      })
      setActivityLogs(logs)
    } catch (err: any) {
      console.error('[Activity Monitoring] Error loading activity logs:', err)
      setError(err.message || 'Failed to load activity logs')
    } finally {
      setLoadingLogs(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...activityLogs]

    if (activityFilter.actorUsername && activityFilter.actorUsername !== 'all') {
      filtered = filtered.filter(log => log.actor_username === activityFilter.actorUsername)
    }

    if (activityFilter.category && activityFilter.category !== 'all') {
      filtered = filtered.filter(log => log.category === activityFilter.category)
    }

    setFilteredLogs(filtered)
  }

  const handleFilterChange = async () => {
    setLoadingLogs(true)
    try {
      const logs = await fetchActivityLogs({
        actorType: 'employee',
        actorUsername: activityFilter.actorUsername !== 'all' ? activityFilter.actorUsername : undefined,
        category: activityFilter.category !== 'all' ? activityFilter.category : undefined,
        limit: 200
      })
      setActivityLogs(logs)
    } catch (err: any) {
      console.error('[Activity Monitoring] Error applying filters:', err)
      setError(err.message || 'Failed to apply filters')
    } finally {
      setLoadingLogs(false)
    }
  }

  const getEmployeeStats = (employeeUsername: string) => {
    const employeeLogs = activityLogs.filter(log => log.actor_username === employeeUsername)
    return {
      total: employeeLogs.length,
      payment: employeeLogs.filter(l => l.category === 'payment').length,
      client: employeeLogs.filter(l => l.category === 'client').length,
      lot: employeeLogs.filter(l => l.category === 'lot').length,
      map: employeeLogs.filter(l => l.category === 'map').length,
    }
  }

  // Pagination helpers
  const sortedEmployees = employees
    .map((employee) => ({
      employee,
      stats: getEmployeeStats(employee.username),
    }))
    .sort((a, b) => b.stats.total - a.stats.total)

  const totalEmployeePages = Math.ceil(sortedEmployees.length / employeesPerPage)
  const paginatedEmployees = sortedEmployees.slice(
    (employeePage - 1) * employeesPerPage,
    employeePage * employeesPerPage
  )

  const totalActivitiesPages = Math.ceil(filteredLogs.length / activitiesPerPage)
  const paginatedActivities = filteredLogs.slice(
    (activitiesPage - 1) * activitiesPerPage,
    activitiesPage * activitiesPerPage
  )

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Real-Time Employee Activity Monitoring</h3>
      </div>

      {error && (
        <Alert className="bg-red-50 border-red-200">
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Filter Activities</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select
              value={activityFilter.actorUsername}
              onValueChange={(value) => {
                setActivityFilter({ ...activityFilter, actorUsername: value })
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by Employee" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Employees</SelectItem>
                {employees.map((employee) => (
                  <SelectItem key={employee.id} value={employee.username}>
                    {employee.name || employee.username}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={activityFilter.category}
              onValueChange={(value) => {
                setActivityFilter({ ...activityFilter, category: value })
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="auth">Authentication</SelectItem>
                <SelectItem value="payment">Payments</SelectItem>
                <SelectItem value="client">Clients</SelectItem>
                <SelectItem value="lot">Lots</SelectItem>
                <SelectItem value="burial">Burials</SelectItem>
                <SelectItem value="map">Maps</SelectItem>
                <SelectItem value="inquiry">Inquiries</SelectItem>
                <SelectItem value="password">Password</SelectItem>
                <SelectItem value="user_management">User Management</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>

            <Button onClick={handleFilterChange} variant="outline" disabled={loadingLogs}>
              {loadingLogs ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                'Apply Filters'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {loadingEmployees ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          <span className="ml-2 text-gray-600">Loading employee statistics...</span>
        </div>
      ) : employees.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-gray-500">
            No employees found.
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Top 4 Most Active Employees */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                <CardTitle>Top 4 Most Active Employees</CardTitle>
              </div>
              <CardDescription>Employees with highest activity count</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {employees
                  .map((employee) => ({
                    employee,
                    stats: getEmployeeStats(employee.username),
                  }))
                  .sort((a, b) => b.stats.total - a.stats.total)
                  .slice(0, 4)
                  .map(({ employee, stats }) => (
                    <Card key={employee.id} className="border-2 border-primary/20">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">{employee.name || employee.username}</CardTitle>
                        <CardDescription className="text-xs">@{employee.username}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span>Total Activities:</span>
                          <Badge>{stats.total}</Badge>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span>Payments:</span>
                          <Badge variant="secondary">{stats.payment}</Badge>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span>Clients:</span>
                          <Badge variant="secondary">{stats.client}</Badge>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span>Lots/Maps:</span>
                          <Badge variant="secondary">{stats.lot + stats.map}</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </CardContent>
          </Card>

          {/* All Employees Table */}
          <Card>
            <CardHeader>
              <CardTitle>All Employees Activity Summary</CardTitle>
              <CardDescription>
                Showing {((employeePage - 1) * employeesPerPage) + 1}-{Math.min(employeePage * employeesPerPage, sortedEmployees.length)} of {sortedEmployees.length} employees
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead className="text-center">Username</TableHead>
                    <TableHead className="text-center">Total</TableHead>
                    <TableHead className="text-center">Payments</TableHead>
                    <TableHead className="text-center">Clients</TableHead>
                    <TableHead className="text-center">Lots/Maps</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedEmployees.map(({ employee, stats }) => (
                    <TableRow key={employee.id}>
                      <TableCell className="font-medium">
                        {employee.name || employee.username}
                      </TableCell>
                      <TableCell className="text-center text-muted-foreground">
                        @{employee.username}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge>{stats.total}</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary">{stats.payment}</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary">{stats.client}</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary">{stats.lot + stats.map}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {totalEmployeePages > 1 && (
                <div className="mt-4">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          href="#"
                          onClick={(e) => {
                            e.preventDefault()
                            setEmployeePage(p => Math.max(1, p - 1))
                          }}
                          className={employeePage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        />
                      </PaginationItem>
                      {Array.from({ length: totalEmployeePages }, (_, i) => i + 1).map((page) => (
                        <PaginationItem key={page}>
                          <PaginationLink
                            href="#"
                            onClick={(e) => {
                              e.preventDefault()
                              setEmployeePage(page)
                            }}
                            isActive={employeePage === page}
                            className="cursor-pointer"
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                      <PaginationItem>
                        <PaginationNext 
                          href="#"
                          onClick={(e) => {
                            e.preventDefault()
                            setEmployeePage(p => Math.min(totalEmployeePages, p + 1))
                          }}
                          className={employeePage === totalEmployeePages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Recent Activities</CardTitle>
          <CardDescription>
            {filteredLogs.length > 0 
              ? `Showing ${((activitiesPage - 1) * activitiesPerPage) + 1}-${Math.min(activitiesPage * activitiesPerPage, filteredLogs.length)} of ${filteredLogs.length} filtered activities (${activityLogs.length} total)`
              : `No activities found (${activityLogs.length} total)`
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingLogs ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              <span className="ml-2 text-gray-600">Loading activities...</span>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No activities found. {activityFilter.actorUsername || activityFilter.category ? 'Try adjusting your filters.' : 'Employees haven\'t performed any actions yet.'}
            </div>
          ) : (
            <>
              <div className="space-y-2">
                {paginatedActivities.map((log) => (
                <div key={log.id} className="border-b pb-2">
                  <div className="flex justify-between items-start text-sm">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <Badge variant={log.category === 'payment' ? 'default' : 'secondary'}>
                          {log.category}
                        </Badge>
                        <p className="font-semibold">{log.action}</p>
                      </div>
                      <p className="text-gray-600 text-xs">{log.details || 'No details'}</p>
                      <p className="text-xs text-gray-500">
                        By: {log.actor_username || log.actor_id || 'Unknown'}
                      </p>
                      {log.affected_resources && Array.isArray(log.affected_resources) && log.affected_resources.length > 0 && (
                        <p className="text-xs text-blue-600">
                          Affected: {log.affected_resources.map((r: any) => r.name || r.id).join(', ')}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">
                        {new Date(log.timestamp).toLocaleString()}
                      </p>
                      <Badge variant={log.status === 'success' ? 'default' : 'destructive'}>
                        {log.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
              </div>
              {totalActivitiesPages > 1 && (
                <div className="mt-4">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          href="#"
                          onClick={(e) => {
                            e.preventDefault()
                            setActivitiesPage(p => Math.max(1, p - 1))
                          }}
                          className={activitiesPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        />
                      </PaginationItem>
                      {Array.from({ length: totalActivitiesPages }, (_, i) => i + 1).map((page) => (
                        <PaginationItem key={page}>
                          <PaginationLink
                            href="#"
                            onClick={(e) => {
                              e.preventDefault()
                              setActivitiesPage(page)
                            }}
                            isActive={activitiesPage === page}
                            className="cursor-pointer"
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                      <PaginationItem>
                        <PaginationNext 
                          href="#"
                          onClick={(e) => {
                            e.preventDefault()
                            setActivitiesPage(p => Math.min(totalActivitiesPages, p + 1))
                          }}
                          className={activitiesPage === totalActivitiesPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
