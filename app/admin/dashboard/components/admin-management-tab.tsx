'use client'

import type React from 'react'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { fetchEmployees, createEmployee, updateEmployee, deleteEmployee, type Employee } from '@/lib/admin-api'
import { Loader2 } from 'lucide-react'

const Plus = ({ className }: { className?: string }) => (
  <svg className={className || "h-4 w-4"} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
)

const Pencil = ({ className }: { className?: string }) => (
  <svg className={className || "h-4 w-4"} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
)

const Trash2 = ({ className }: { className?: string }) => (
  <svg className={className || "h-4 w-4"} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
)

interface AdminManagementTabProps {
  onShowMessage: (message: string) => void
}

export default function AdminManagementTab({ onShowMessage }: AdminManagementTabProps) {
  const [showCreateEmployee, setShowCreateEmployee] = useState(false)
  const [showEditEmployee, setShowEditEmployee] = useState(false)
  const [newEmployeeData, setNewEmployeeData] = useState({
    username: '',
    password: '',
    name: '',
    email: '',
    phone: ''
  })
  const [editEmployeeData, setEditEmployeeData] = useState<Employee | null>(null)
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loadingEmployees, setLoadingEmployees] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [employeeToDelete, setEmployeeToDelete] = useState<{ id: string; username: string } | null>(null)

  useEffect(() => {
    loadEmployees()
  }, [])

  const loadEmployees = async () => {
    try {
      setLoadingEmployees(true)
      setError(null)
      console.log('[Employee Management] Fetching employees from API...')
      const data = await fetchEmployees()
      console.log('[Employee Management] Received employees:', data.employees.length, 'employees')
      console.log('[Employee Management] Employee details:', data.employees.map(e => ({ id: e.id, username: e.username, name: e.name })))
      setEmployees(data.employees)
      console.log('[Employee Management] State updated with', data.employees.length, 'employees')
    } catch (err: any) {
      console.error('[Employee Management] Error loading employees:', err)
      setError(err.message || 'Failed to load employees')
    } finally {
      setLoadingEmployees(false)
    }
  }

  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      // Get current admin user
      const currentUser = localStorage.getItem('currentUser')
      const adminId = currentUser ? JSON.parse(currentUser).id : undefined

      const newEmployee = await createEmployee({
        username: newEmployeeData.username,
        password: newEmployeeData.password,
        name: newEmployeeData.name || undefined,
        email: newEmployeeData.email || undefined,
        phone: newEmployeeData.phone || undefined,
        createdBy: adminId
      })

      console.log('[Employee Management] Employee created, refreshing list...')

      onShowMessage(`Employee '${newEmployeeData.username}' created successfully`)
      setNewEmployeeData({ username: '', password: '', name: '', email: '', phone: '' })
      setShowCreateEmployee(false)

      // Add small delay to ensure database has committed the transaction
      await new Promise(resolve => setTimeout(resolve, 500))

      // Reload employees list
      await loadEmployees()
    } catch (err: any) {
      console.error('[Employee Management] Error creating employee:', err)
      setError(err.message || 'Failed to create employee')
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditEmployee = (employee: Employee) => {
    setEditEmployeeData(employee)
    setEditFormData({
      name: employee.name || '',
      email: employee.email || '',
      phone: employee.phone || '',
      password: '' // Never pre-fill password
    })
    setShowEditEmployee(true)
  }

  const handleUpdateEmployee = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editEmployeeData) return

    setIsLoading(true)
    setError(null)

    try {
      // Get current admin user
      const currentUser = localStorage.getItem('currentUser')
      const adminId = currentUser ? JSON.parse(currentUser).id : undefined

      // Only include fields that have values
      const updateData: any = {
        id: editEmployeeData.id,
        updatedBy: adminId
      }

      if (editFormData.name.trim()) updateData.name = editFormData.name.trim()
      if (editFormData.email.trim()) updateData.email = editFormData.email.trim()
      if (editFormData.phone.trim()) updateData.phone = editFormData.phone.trim()
      if (editFormData.password.trim()) updateData.password = editFormData.password.trim()

      console.log('[Employee Management] Updating employee...', editEmployeeData.username)

      await updateEmployee(updateData)

      onShowMessage(`Employee '${editEmployeeData.username}' updated successfully`)
      setEditFormData({ name: '', email: '', phone: '', password: '' })
      setEditEmployeeData(null)
      setShowEditEmployee(false)

      // Add small delay to ensure database has committed the transaction
      await new Promise(resolve => setTimeout(resolve, 500))

      // Reload employees list
      await loadEmployees()
    } catch (err: any) {
      console.error('[Employee Management] Error updating employee:', err)
      setError(err.message || 'Failed to update employee')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteClick = (employeeId: string, username: string) => {
    setEmployeeToDelete({ id: employeeId, username })
    setShowDeleteConfirm(true)
  }

  const handleDeleteEmployee = async () => {
    if (!employeeToDelete) return

    try {
      setError(null)
      setIsLoading(true)

      // Get current admin user
      const currentUser = localStorage.getItem('currentUser')
      const adminId = currentUser ? JSON.parse(currentUser).id : undefined

      await deleteEmployee({
        id: employeeToDelete.id,
        deletedBy: adminId
      })

      onShowMessage(`Employee '${employeeToDelete.username}' deleted successfully`)
      setShowDeleteConfirm(false)
      setEmployeeToDelete(null)
      await loadEmployees()
    } catch (err: any) {
      console.error('[Employee Management] Error deleting employee:', err)
      setError(err.message || 'Failed to delete employee')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Employee Accounts</h3>
        <Button onClick={() => setShowCreateEmployee(!showCreateEmployee)} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Create Employee
        </Button>
      </div>

      <Dialog open={showCreateEmployee} onOpenChange={setShowCreateEmployee}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create New Employee Account</DialogTitle>
            <DialogDescription>
              Add a new employee to the system. All fields marked with * are required.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateEmployee} className="space-y-4">
            <div className="space-y-4">
              <div>
                <Input
                  placeholder="Employee Name *"
                  value={newEmployeeData.name}
                  onChange={(e) => setNewEmployeeData({ ...newEmployeeData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Input
                  placeholder="Username *"
                  value={newEmployeeData.username}
                  onChange={(e) => setNewEmployeeData({ ...newEmployeeData, username: e.target.value })}
                  required
                />
              </div>
              <div>
                <Input
                  type="password"
                  placeholder="Password *"
                  value={newEmployeeData.password}
                  onChange={(e) => setNewEmployeeData({ ...newEmployeeData, password: e.target.value })}
                  required
                />
              </div>
              <div>
                <Input
                  type="email"
                  placeholder="Email (optional)"
                  value={newEmployeeData.email}
                  onChange={(e) => setNewEmployeeData({ ...newEmployeeData, email: e.target.value })}
                />
              </div>
              <div>
                <Input
                  type="tel"
                  placeholder="Phone (optional)"
                  value={newEmployeeData.phone}
                  onChange={(e) => setNewEmployeeData({ ...newEmployeeData, phone: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" onClick={() => setShowCreateEmployee(false)} variant="outline">
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Employee'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={showEditEmployee} onOpenChange={(open) => {
        if (!open) {
          setShowEditEmployee(false)
          setEditEmployeeData(null)
          setEditFormData({ name: '', email: '', phone: '', password: '' })
        }
      }}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Employee</DialogTitle>
            <DialogDescription>
              Update employee information. Username: <span className="font-semibold">{editEmployeeData?.username}</span>
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateEmployee} className="space-y-4">
            <div className="space-y-4">
              <div>
                <Input
                  placeholder="Employee Name"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                />
              </div>
              <div>
                <Input
                  type="email"
                  placeholder="Email"
                  value={editFormData.email}
                  onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                />
              </div>
              <div>
                <Input
                  type="tel"
                  placeholder="Phone"
                  value={editFormData.phone}
                  onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                />
              </div>
              <div>
                <Input
                  type="password"
                  placeholder="New Password (leave blank to keep current)"
                  value={editFormData.password}
                  onChange={(e) => setEditFormData({ ...editFormData, password: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                onClick={() => {
                  setShowEditEmployee(false)
                  setEditEmployeeData(null)
                  setEditFormData({ name: '', email: '', phone: '', password: '' })
                }}
                variant="outline"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Employee'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Employee</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete employee <span className="font-semibold">{employeeToDelete?.username}</span>?
              This action will soft delete the employee (they will be marked as inactive but data will be preserved).
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              onClick={() => {
                setShowDeleteConfirm(false)
                setEmployeeToDelete(null)
              }}
              variant="outline"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleDeleteEmployee}
              disabled={isLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete Employee'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {error && (
        <Alert className="bg-red-50 border-red-200">
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}

      {loadingEmployees ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          <span className="ml-2 text-gray-600">Loading employees...</span>
        </div>
      ) : employees.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-gray-500">
            No employees found. Create your first employee account above.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {employees.map((employee) => (
            <Card key={employee.id}>
              <CardContent className="p-4 flex justify-between items-center">
                <div>
                  <p className="font-semibold">{employee.name || employee.username}</p>
                  <p className="text-sm text-gray-600">Username: {employee.username}</p>
                  {employee.email && (
                    <p className="text-xs text-gray-500">Email: {employee.email}</p>
                  )}
                  {employee.phone && (
                    <p className="text-xs text-gray-500">Phone: {employee.phone}</p>
                  )}
                  {employee.created_at && (
                    <p className="text-xs text-gray-500">
                      Created: {new Date(employee.created_at).toLocaleDateString()}
                    </p>
                  )}
                  <p className="text-xs">
                    <span className={`inline-block px-2 py-0.5 rounded text-xs ${employee.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                      {employee.status}
                    </span>
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleEditEmployee(employee)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={() => handleDeleteClick(employee.id, employee.username)}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
