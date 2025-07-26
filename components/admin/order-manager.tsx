'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  ShoppingBag,
  Edit,
  Eye,
  Package,
  DollarSign,
  Calendar,
  User,
  Save,
  X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

interface AdminOrder {
  id: string
  customer: string
  items: number
  total: number
  status: string
  date: string
  products?: string
}

interface OrderManagerProps {
  orders: AdminOrder[]
  onRefresh: () => void
}

export default function OrderManager({ orders, onRefresh }: OrderManagerProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [editingOrder, setEditingOrder] = useState<AdminOrder | null>(null)
  const [viewingOrder, setViewingOrder] = useState<AdminOrder | null>(null)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    status: ''
  })

  const handleEditOrder = (order: AdminOrder) => {
    setFormData({
      status: order.status
    })
    setEditingOrder(order)
    setIsEditModalOpen(true)
  }

  const handleViewOrder = (order: AdminOrder) => {
    setViewingOrder(order)
    setIsViewModalOpen(true)
  }

  const handleSaveOrder = async () => {
    if (!formData.status) {
      // TODO: Replace with proper toast notification
      console.error('Please select a status')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/admin/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, id: editingOrder?.id })
      })

      if (!response.ok) {
        throw new Error('Failed to update order')
      }

      setIsEditModalOpen(false)
      setEditingOrder(null)
      onRefresh()
    } catch (error) {
      console.error('Error updating order:', error)
      // TODO: Replace with proper toast notification
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200'
      case 'processing':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'shipped':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <Package className="w-3 h-3" />
      case 'processing':
        return <ShoppingBag className="w-3 h-3" />
      case 'shipped':
        return <Package className="w-3 h-3" />
      default:
        return <ShoppingBag className="w-3 h-3" />
    }
  }

  return (
    <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
      <CardHeader className="bg-gradient-to-r from-kentucky-blue-600 to-kentucky-blue-700 text-white rounded-t-lg">
        <div className="flex items-center gap-3">
          <ShoppingBag className="h-6 w-6" />
          <CardTitle className="text-xl">Order Management</CardTitle>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <div className="space-y-4">
          {orders.map((order) => (
            <motion.div 
              key={order.id} 
              className="flex items-center justify-between p-4 bg-white border rounded-xl shadow-sm hover:shadow-md transition-all duration-200 hover:border-kentucky-blue-200"
              whileHover={{ scale: 1.01 }}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full flex items-center justify-center">
                  <ShoppingBag className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Order {order.id}</p>
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <User className="w-3 h-3" />
                    {order.customer}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Calendar className="w-3 h-3" />
                    {order.date}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="flex items-center gap-1 font-semibold text-green-600">
                    <DollarSign className="w-4 h-4" />
                    {order.total.toFixed(2)}
                  </div>
                  <p className="text-sm text-gray-600">{order.items} items</p>
                  <Badge className={`${getStatusColor(order.status)} flex items-center gap-1 mt-1`}>
                    {getStatusIcon(order.status)}
                    {order.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleViewOrder(order)}
                    className="hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleEditOrder(order)}
                    className="hover:bg-green-50 hover:border-green-300 hover:text-green-600 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
          {orders.length === 0 && (
            <motion.div 
              className="text-center py-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <ShoppingBag className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No orders found</p>
            </motion.div>
          )}
        </div>
      </CardContent>

      {/* View Order Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Order Details
            </DialogTitle>
          </DialogHeader>
          
          {viewingOrder && (
            <div className="space-y-4 py-4">
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Order ID:</span>
                  <span className="font-semibold">{viewingOrder.id}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Customer:</span>
                  <span>{viewingOrder.customer}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Date:</span>
                  <span>{viewingOrder.date}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Items:</span>
                  <span>{viewingOrder.items}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Total:</span>
                  <span className="font-semibold text-green-600">${viewingOrder.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Status:</span>
                  <Badge className={getStatusColor(viewingOrder.status)}>
                    {viewingOrder.status}
                  </Badge>
                </div>
                {viewingOrder.products && (
                  <div className="pt-2 border-t border-gray-200">
                    <span className="text-sm font-medium text-gray-600">Products:</span>
                    <p className="text-sm text-gray-700 mt-1">{viewingOrder.products}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <Button
              variant="outline"
              onClick={() => setIsViewModalOpen(false)}
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Order Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5" />
              Update Order Status
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {editingOrder && (
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="text-sm text-gray-600">Order {editingOrder.id}</div>
                <div className="font-semibold">{editingOrder.customer}</div>
                <div className="text-sm text-gray-600">${editingOrder.total.toFixed(2)} • {editingOrder.items} items</div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="edit-status">Order Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setIsEditModalOpen(false)
                setEditingOrder(null)
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveOrder}
              disabled={loading}
              className="bg-gradient-to-r from-kentucky-blue-600 to-kentucky-blue-700 hover:from-kentucky-blue-700 hover:to-kentucky-blue-800"
            >
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Updating...' : 'Update Status'}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  )
}