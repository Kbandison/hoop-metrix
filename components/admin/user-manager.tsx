'use client'

import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { 
  User,
  Edit,
  Trash2,
  X,
  Save,
  Search,
  Filter,
  Mail,
  Calendar,
  Crown,
  Shield,
  UserPlus,
  UserMinus,
  Send
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import ConfirmDialog from '@/components/ui/confirm-dialog'

interface AdminUser {
  id: string
  name: string
  email: string
  plan: string
  joinDate: string
  status: string
  lastLogin?: string
  role?: string
  isAdmin?: boolean
}

interface UserManagerProps {
  users: AdminUser[]
  onRefresh: () => void
}

export default function UserManager({ users, onRefresh }: UserManagerProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterBy, setFilterBy] = useState('all')
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null)
  const [loading, setLoading] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<AdminUser | null>(null)
  const [adminAssignOpen, setAdminAssignOpen] = useState(false)
  const [userToPromote, setUserToPromote] = useState<AdminUser | null>(null)
  const [selectedRole, setSelectedRole] = useState<'admin' | 'editor'>('admin')

  const [inviteEmailOpen, setInviteEmailOpen] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    plan: '',
    status: ''
  })

  const handleEditUser = (user: AdminUser) => {
    setFormData({
      name: user.name,
      email: user.email,
      plan: user.plan,
      status: user.status
    })
    setEditingUser(user)
    setIsEditModalOpen(true)
  }

  const handleSaveUser = async () => {
    if (!formData.name || !formData.email) {
      // TODO: Replace with proper toast notification
      console.error('Please fill in all required fields')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, id: editingUser?.id })
      })

      if (!response.ok) {
        throw new Error('Failed to update user')
      }

      setIsEditModalOpen(false)
      setEditingUser(null)
      onRefresh()
    } catch (error) {
      console.error('Error updating user:', error)
      // TODO: Replace with proper toast notification
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteClick = (user: AdminUser) => {
    setUserToDelete(user)
    setDeleteConfirmOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return

    setLoading(true)
    try {
      const response = await fetch(`/api/admin/users?id=${userToDelete.id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete user')
      }

      onRefresh()
      setUserToDelete(null)
    } catch (error) {
      console.error('Error deleting user:', error)
      // TODO: Replace with proper toast notification
    } finally {
      setLoading(false)
      setDeleteConfirmOpen(false)
    }
  }

  const handlePromoteToAdmin = (user: AdminUser) => {
    setUserToPromote(user)
    setSelectedRole('admin')
    setAdminAssignOpen(true)
  }

  const handleRemoveAdmin = async (user: AdminUser) => {
    if (!user.id) return

    setLoading(true)
    try {
      const response = await fetch('/api/admin/remove-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id })
      })

      if (!response.ok) {
        throw new Error('Failed to remove admin role')
      }

      onRefresh()
    } catch (error) {
      console.error('Error removing admin role:', error)
      // TODO: Replace with proper toast notification
    } finally {
      setLoading(false)
    }
  }

  const handleAssignRole = async () => {
    if (!userToPromote) return

    setLoading(true)
    try {
      const response = await fetch('/api/admin/assign-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: userToPromote.email, 
          role: selectedRole 
        })
      })

      if (!response.ok) {
        throw new Error('Failed to assign admin role')
      }

      setAdminAssignOpen(false)
      setUserToPromote(null)
      onRefresh()
    } catch (error) {
      console.error('Error assigning admin role:', error)
      // TODO: Replace with proper toast notification
    } finally {
      setLoading(false)
    }
  }

  const handleSendInvite = async () => {
    if (!inviteEmail) {
      console.error('Please enter an email address')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/admin/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: inviteEmail,
          role: 'admin'
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('API Error:', errorData)
        throw new Error(errorData.error || 'Failed to send invitation')
      }

      const result = await response.json()
      console.log('Invitation result:', result)
      
      setInviteEmailOpen(false)
      setInviteEmail('')
      // TODO: Replace with proper toast notification
      alert('Invitation sent successfully!')
    } catch (error) {
      console.error('Error sending invitation:', error)
      // TODO: Replace with proper toast notification
      alert(`Failed to send invitation: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case '$10 Membership':
        return 'bg-gradient-to-r from-kentucky-blue-500 to-kentucky-blue-600 text-white'
      case 'Free':
        return 'bg-gradient-to-r from-gray-400 to-gray-500 text-white'
      default:
        return 'bg-gradient-to-r from-gray-400 to-gray-500 text-white'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200'
      case 'inactive':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  // Filter users based on search and filter
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = filterBy === 'all' || 
                         user.status === filterBy ||
                         (filterBy === 'admin' && user.isAdmin)
    return matchesSearch && matchesFilter
  })

  return (
    <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
      <CardHeader className="bg-gradient-to-r from-kentucky-blue-600 to-kentucky-blue-700 text-white rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <User className="h-6 w-6" />
            <CardTitle className="text-xl text-white">User Management</CardTitle>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={() => setInviteEmailOpen(true)}
              className="bg-white/20 hover:bg-white/30 text-white border-white/30"
              variant="outline"
            >
              <Send className="w-4 h-4 mr-2" />
              Invite Admin
            </Button>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/70 w-4 h-4" />
              <Input
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64 bg-white/20 border-white/30 text-white placeholder:text-white/70"
              />
            </div>
            <Select value={filterBy} onValueChange={setFilterBy}>
              <SelectTrigger className="w-32 bg-white/20 border-white/30 text-white">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="admin">Admins</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <div className="space-y-4">
          {filteredUsers.map((user) => (
            <motion.div 
              key={user.id} 
              className="flex items-center justify-between p-4 bg-white border rounded-xl shadow-sm hover:shadow-md transition-all duration-200 hover:border-kentucky-blue-200"
              whileHover={{ scale: 1.01 }}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-kentucky-blue-100 to-kentucky-blue-200 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-kentucky-blue-600" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-900">{user.name}</p>
                    {user.isAdmin && (
                      <Badge className="bg-gradient-to-r from-purple-600 to-purple-700 text-white text-xs px-2 py-1">
                        <Shield className="w-3 h-3 mr-1" />
                        {user.role?.toUpperCase() || 'ADMIN'}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <Mail className="w-3 h-3" />
                    {user.email}
                  </div>
                  {user.lastLogin && (
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Calendar className="w-3 h-3" />
                      Last login: {user.lastLogin}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <Badge className={getPlanColor(user.plan)}>
                    {user.plan === '$10 Membership' && <Crown className="w-3 h-3 mr-1" />}
                    {user.plan}
                  </Badge>
                  <div className="mt-1">
                    <Badge className={getStatusColor(user.status)}>
                      {user.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Joined: {user.joinDate}</p>
                </div>
                <div className="flex items-center gap-2">
                  {user.isAdmin ? (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleRemoveAdmin(user)}
                      className="hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition-colors"
                      title="Remove Admin Role"
                      disabled={loading}
                    >
                      <UserMinus className="w-4 h-4" />
                    </Button>
                  ) : (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handlePromoteToAdmin(user)}
                      className="hover:bg-purple-50 hover:border-purple-300 hover:text-purple-600 transition-colors"
                      title="Promote to Admin"
                    >
                      <UserPlus className="w-4 h-4" />
                    </Button>
                  )}
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleEditUser(user)}
                    className="hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleDeleteClick(user)}
                    className="hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
          {filteredUsers.length === 0 && (
            <motion.div 
              className="text-center py-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No users found</p>
            </motion.div>
          )}
        </div>
      </CardContent>

      {/* Edit User Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5" />
              Edit User
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Full Name *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter full name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-email">Email Address *</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Enter email address"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-plan">Membership Plan</Label>
              <Select
                value={formData.plan}
                onValueChange={(value) => setFormData({ ...formData, plan: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select plan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Free">Free</SelectItem>
                  <SelectItem value="$10 Membership">$10 Membership</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setIsEditModalOpen(false)
                setEditingUser(null)
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveUser}
              disabled={loading}
              className="bg-gradient-to-r from-kentucky-blue-600 to-kentucky-blue-700 hover:from-kentucky-blue-700 hover:to-kentucky-blue-800"
            >
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Saving...' : 'Update User'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Delete User"
        description={`Are you sure you want to delete "${userToDelete?.name}"? This will permanently remove their account and all associated data.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        onConfirm={handleDeleteConfirm}
        loading={loading}
      />

      {/* Admin Role Assignment Modal */}
      <Dialog open={adminAssignOpen} onOpenChange={setAdminAssignOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Assign Admin Role
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <p className="text-sm text-gray-600">
              Assign an admin role to <strong>{userToPromote?.name}</strong> ({userToPromote?.email})
            </p>
            
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={selectedRole} onValueChange={(value: 'admin' | 'editor') => setSelectedRole(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin (Full Access)</SelectItem>
                  <SelectItem value="editor">Editor (Limited Access)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setAdminAssignOpen(false)
                setUserToPromote(null)
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAssignRole}
              disabled={loading}
              className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
            >
              <Shield className="h-4 w-4 mr-2" />
              {loading ? 'Assigning...' : 'Assign Role'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Email Invitation Modal */}
      <Dialog open={inviteEmailOpen} onOpenChange={setInviteEmailOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              Invite Admin
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <p className="text-sm text-gray-600">
              Send an admin invitation to an email address. If the user doesn&apos;t have an account, they&apos;ll be prompted to create one.
            </p>
            
            <div className="space-y-2">
              <Label htmlFor="invite-email">Email Address *</Label>
              <Input
                id="invite-email"
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="admin@example.com"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setInviteEmailOpen(false)
                setInviteEmail('')
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSendInvite}
              disabled={loading || !inviteEmail}
              className="bg-gradient-to-r from-kentucky-blue-600 to-kentucky-blue-700 hover:from-kentucky-blue-700 hover:to-kentucky-blue-800"
            >
              <Send className="h-4 w-4 mr-2" />
              {loading ? 'Sending...' : 'Send Invitation'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  )
}