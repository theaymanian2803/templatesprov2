import { createFileRoute } from '@tanstack/react-router'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { ContactList } from '@/components/admin/ContactList'
import { CouponList } from '@/components/admin/CouponList'
import { DownloadList } from '@/components/admin/DownloadList'
import { OrderDetails } from '@/components/admin/OrderDetails'
import { OrderList } from '@/components/admin/OrderList'
import RefundRequestList from '@/components/admin/RefundRequestList'
import { ReviewList } from '@/components/admin/ReviewList'
import { TemplateForm } from '@/components/admin/TemplateForm'
import { TemplateList } from '@/components/admin/TemplateList'
import Footer from '@/components/Footer'
import Navbar from '@/components/Navbar'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'
import { useAdminRole } from '@/hooks/useAdminRole'
import { useIsMobile } from '@/hooks/use-mobile'
import {
  Order,
  OrderStatus,
  useDeleteOrder,
  useOrders,
  useUpdateOrderStatus,
} from '@/hooks/useOrders'
import { Template, useTemplates } from '@/hooks/useTemplates'
import { adminSaveTemplate, adminDeleteTemplate } from '@/server/functions/admin'
import { getOrderWithItems } from '@/server/functions/orders'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { DollarSign, Loader2, MonitorSmartphone, Package, Plus, Search, ShieldAlert } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from '@/lib/router'

const Admin = () => {
  const { user, loading: authLoading } = useAuth()
  const { data: isAdmin, isLoading: roleLoading } = useAdminRole()
  const { data: templates = [], isLoading: templatesLoading } = useTemplates()
  const { data: orders = [], isLoading: ordersLoading } = useOrders()

  const [activeTab, setActiveTab] = useState('templates')
  const [showForm, setShowForm] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [deletingOrderId, setDeletingOrderId] = useState<string | null>(null)

  const navigate = useNavigate()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const isMobile = useIsMobile()

  const updateOrderStatus = useUpdateOrderStatus()
  const deleteOrder = useDeleteOrder()

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth')
    }
  }, [user, authLoading, navigate])

  const createMutation = useMutation({
    mutationFn: async (data: Partial<Template>) => {
      await adminSaveTemplate({ data })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] })
      toast({ title: 'Template created successfully!' })
      setShowForm(false)
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to create template',
        description: error.message,
        variant: 'destructive',
      })
    },
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Template> }) => {
      await adminSaveTemplate({ data: { ...data, id } })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] })
      toast({ title: 'Template updated successfully!' })
      setEditingTemplate(null)
      setShowForm(false)
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to update template',
        description: error.message,
        variant: 'destructive',
      })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      setDeletingId(id)
      await adminDeleteTemplate({ data: id })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] })
      toast({ title: 'Template deleted successfully!' })
      setDeletingId(null)
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to delete template',
        description: error.message,
        variant: 'destructive',
      })
      setDeletingId(null)
    },
  })

  const handleSubmit = async (data: Partial<Template>) => {
    if (editingTemplate) {
      await updateMutation.mutateAsync({ id: editingTemplate.id, data })
    } else {
      await createMutation.mutateAsync(data)
    }
  }

  const handleEdit = (template: Template) => {
    setEditingTemplate(template)
    setShowForm(true)
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingTemplate(null)
  }

  const handleUpdateOrderStatus = (orderId: string, status: OrderStatus) => {
    updateOrderStatus.mutate(
      { orderId, status },
      {
        onSuccess: () => toast({ title: 'Order status updated!' }),
        onError: (error) =>
          toast({
            title: 'Failed to update order',
            description: error.message,
            variant: 'destructive',
          }),
      }
    )
  }

  const handleDeleteOrder = (orderId: string) => {
    setDeletingOrderId(orderId)
    deleteOrder.mutate(orderId, {
      onSuccess: () => {
        toast({ title: 'Order deleted successfully!' })
        setDeletingOrderId(null)
      },
      onError: (error) => {
        toast({ title: 'Failed to delete order', description: error.message, variant: 'destructive' })
        setDeletingOrderId(null)
      },
    })
  }

  const handleViewOrderDetails = async (order: Order) => {
    const result = await getOrderWithItems({ data: order.id })
    setSelectedOrder({ ...result, items: result.items || [] })
  }

  const filteredTemplates = templates.filter(
    (t) =>
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredOrders = orders.filter(
    (o) =>
      o.user_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.id.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const totalRevenue = orders.reduce(
    (sum, o) => (o.status === 'completed' ? sum + o.total_amount : sum),
    0
  )
  const pendingOrders = orders.filter((o) => o.status === 'pending').length

  const isLoading = authLoading || roleLoading

  if (isLoading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </main>
    )
  }

  if (isMobile) {
    return (
      <main className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-9 pb-16">
          <div className="container mx-auto">
            <div className="max-w-md mx-auto text-center">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <MonitorSmartphone className="w-10 h-10 text-primary" />
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-2">Not available on mobile</h1>
              <p className="text-muted-foreground mb-6">
                The admin panel is only accessible on tablet and desktop
                (768px and above).
              </p>
              <Button onClick={() => navigate('/')}>Back to home</Button>
            </div>
          </div>
        </div>
        <Footer />
      </main>
    )
  }

  if (!isAdmin) {
    return (
      <main className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-9 pb-16">
          <div className="container mx-auto">
            <div className="max-w-md mx-auto text-center">
              <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShieldAlert className="w-10 h-10 text-destructive" />
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-2">Access denied</h1>
              <p className="text-muted-foreground mb-6">
                You don't have the required permissions to access the dashboard.
              </p>
              <Button onClick={() => navigate('/')}>Back to home</Button>
            </div>
          </div>
        </div>
        <Footer />
      </main>
    )
  }

  const sectionTitle: Record<string, string> = {
    templates: 'Templates',
    downloads: 'Downloads',
    orders: 'Orders',
    coupons: 'Coupons',
    reviews: 'Reviews',
    contacts: 'Messages',
    refunds: 'Refunds',
  }

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-16">
        <SidebarProvider>
          <div className="min-h-[calc(100vh-4rem)] flex w-full">
            <AdminSidebar activeTab={activeTab} onTabChange={setActiveTab} />

            <div className="flex-1 flex flex-col min-w-0">
              {/* Top bar */}
              <div className="sticky top-16 z-30 bg-background border-b border-border/50 px-4 md:px-6 py-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <SidebarTrigger />
                  <Breadcrumb>
                    <BreadcrumbList>
                      <BreadcrumbItem>
                        <span className="text-muted-foreground text-sm font-medium">Administration</span>
                      </BreadcrumbItem>
                      <BreadcrumbSeparator />
                      <BreadcrumbItem>
                        <span className="text-muted-foreground text-sm">Management</span>
                      </BreadcrumbItem>
                      <BreadcrumbSeparator />
                      <BreadcrumbItem>
                        <BreadcrumbPage className="font-semibold">
                          {sectionTitle[activeTab] || 'Dashboard'}
                        </BreadcrumbPage>
                      </BreadcrumbItem>
                    </BreadcrumbList>
                  </Breadcrumb>
                </div>
                {activeTab === 'templates' && !showForm && (
                  <Button onClick={() => setShowForm(true)} size="sm" className="gap-2 shrink-0">
                    <Plus className="w-4 h-4" />
                    Add
                  </Button>
                )}
              </div>

              {/* Stats bar */}
              <div className="px-4 md:px-6 py-4 border-b border-border/30">
                <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                  <StatCard label="Templates" value={templates.length} />
                  <StatCard label="Featured" value={templates.filter((t) => t.featured).length} />
                  <StatCard label="Sales" value={templates.reduce((a, t) => a + t.sales, 0)} />
                  <StatCard
                    label="Orders"
                    value={orders.length}
                    icon={<Package className="w-4 h-4" />}
                  />
                  <StatCard label="Pending" value={pendingOrders} className="text-accent" />
                  <StatCard
                    label="Revenue"
                    value={`$${totalRevenue.toFixed(0)}`}
                    icon={<DollarSign className="w-4 h-4" />}
                    className="text-primary"
                  />
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 p-4 md:p-6">
                {activeTab === 'templates' &&
                  (showForm ? (
                    <div className="glass-card p-6 rounded-2xl border border-border/50">
                      <h2 className="text-xl font-semibold mb-6">
                        {editingTemplate ? 'Edit template' : 'Create a template'}
                      </h2>
                      <TemplateForm
                        template={editingTemplate}
                        onSubmit={handleSubmit}
                        onCancel={handleCancel}
                        isLoading={createMutation.isPending || updateMutation.isPending}
                      />
                    </div>
                  ) : (
                    <>
                      <SearchBar
                        value={searchQuery}
                        onChange={setSearchQuery}
                        placeholder="Search..."
                      />
                      {templatesLoading ? (
                        <LoadingState />
                      ) : (
                        <TemplateList
                          templates={filteredTemplates}
                          onEdit={handleEdit}
                          onDelete={(id) => deleteMutation.mutate(id)}
                          isDeleting={deletingId}
                        />
                      )}
                    </>
                  ))}

                {activeTab === 'orders' && (
                  <>
                    <SearchBar
                      value={searchQuery}
                      onChange={setSearchQuery}
                      placeholder="Search..."
                    />
                    {ordersLoading ? (
                      <LoadingState />
                    ) : (
                      <OrderList
                        orders={filteredOrders}
                        onViewDetails={handleViewOrderDetails}
                        onUpdateStatus={handleUpdateOrderStatus}
                        onDelete={handleDeleteOrder}
                        isUpdating={updateOrderStatus.isPending}
                        isDeleting={deletingOrderId}
                      />
                    )}
                  </>
                )}

                {activeTab === 'coupons' && <CouponList />}
                {activeTab === 'reviews' && <ReviewList />}
                {activeTab === 'contacts' && <ContactList />}
                {activeTab === 'downloads' && <DownloadList />}
                {activeTab === 'refunds' && (
                  <div className="glass-card p-6 rounded-2xl border border-border/50">
                    <RefundRequestList />
                  </div>
                )}
              </div>
            </div>
          </div>
        </SidebarProvider>
      </div>

      {/* Order Details Modal */}
      <OrderDetails order={selectedOrder} onClose={() => setSelectedOrder(null)} />
    </main>
  )
}

/* --- Small helper components --- */

const StatCard = ({
  label,
  value,
  icon,
  className,
}: {
  label: string
  value: string | number
  icon?: React.ReactNode
  className?: string
}) => (
  <div className="glass-card p-3 rounded-xl border border-border/50 text-center">
    <div
      className={`text-lg font-bold flex items-center justify-center gap-1 ${className || 'text-foreground'}`}>
      {icon}
      {value}
    </div>
    <div className="text-[11px] text-muted-foreground">{label}</div>
  </div>
)

const SearchBar = ({
  value,
  onChange,
  placeholder,
}: {
  value: string
  onChange: (v: string) => void
  placeholder: string
}) => (
  <div className="mb-6">
    <div className="relative max-w-md">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
      <Input
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-10"
      />
    </div>
  </div>
)

const LoadingState = () => (
  <div className="flex items-center justify-center py-12">
    <Loader2 className="w-8 h-8 animate-spin text-primary" />
  </div>
)

export const Route = createFileRoute('/admin')({ component: Admin })
