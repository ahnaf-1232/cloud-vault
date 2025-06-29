"use client"

import { useState, useEffect } from "react"
import { ProtectedRoute } from "@/components/protected-route"
import { Navbar } from "@/components/navbar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
  Users,
  HardDrive,
  Files,
  Activity,
  MoreHorizontal,
  Search,
  Trash2,
  UserX,
  RefreshCw,
  Loader2,
} from "lucide-react"
import { adminService } from "@/services/admin-service"
import { useToast } from "@/hooks/use-toast"

interface AdminStats {
  totalUsers: number
  totalFiles: number
  totalStorage: number
  activeUsers: number
  storageUsed: number
  storageLimit: number
}

interface User {
  suspended: boolean
  id: string
  name: string
  email: string
  role: string
  createdAt: string
  lastActive: string
  storageUsed: number
  fileCount: number
  status: "active" | "suspended" | "deleted"
}

interface SystemActivity {
  id: string
  type: string
  user: string
  action: string
  timestamp: string
  details: string
}

export default function AdminPage() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [activities, setActivities] = useState<SystemActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    loadAdminData()
  }, [])

  const loadAdminData = async () => {
    try {
      setLoading(true);
      const [statsData, usersData, activitiesData] = await Promise.all([
        adminService.getStats(),
        adminService.getUsers(),
        adminService.getSystemActivity(),
      ]);
  
      // Assuming usersData is of type UsersResponse
      setStats(statsData); // Assuming statsData is of the correct type (not shown in your types)
      setUsers(usersData.users); // Extract the users array from UsersResponse
      setActivities(activitiesData.activities); // Extract the activities array from ActivityResponse
  
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load admin data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUserAction = async (userId: string, action: "suspend" | "activate" | "delete") => {
    try {
      await adminService.userAction(userId, action)
      await loadAdminData()
      toast({
        title: "Success",
        description: `User ${action}d successfully.`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${action} user. Please try again.`,
        variant: "destructive",
      })
    }
  }

  const handleDeleteUser = async () => {
    if (userToDelete) {
      await handleUserAction(userToDelete, "delete")
      setUserToDelete(null)
    }
    setDeleteDialogOpen(false)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const storagePercentage = stats ? (stats.storageUsed / stats.storageLimit) * 100 : 0

  if (loading) {
    return (
      <ProtectedRoute adminOnly>
        <div className="min-h-screen bg-background">
          <Navbar />
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute adminOnly>
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">Admin Panel</h1>
              <p className="text-muted-foreground">Monitor and manage your CloudVault instance</p>
            </div>
            <Button onClick={loadAdminData} variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>

          {/* Stats Overview */}
          {stats && (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalUsers}</div>
                  <p className="text-xs text-muted-foreground">{stats.activeUsers} active users</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Files</CardTitle>
                  <Files className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalFiles}</div>
                  <p className="text-xs text-muted-foreground">Across all users</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
                  <HardDrive className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatFileSize(stats.storageUsed)}</div>
                  <p className="text-xs text-muted-foreground">of {formatFileSize(stats.storageLimit)} total</p>
                  <Progress value={storagePercentage} className="mt-2" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">System Health</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">Healthy</div>
                  <p className="text-xs text-muted-foreground">All systems operational</p>
                </CardContent>
              </Card>
            </div>
          )}

          <Tabs defaultValue="users" className="space-y-6">
            <TabsList>
              <TabsTrigger value="users">User Management</TabsTrigger>
              <TabsTrigger value="activity">System Activity</TabsTrigger>
            </TabsList>

            {/* Users Tab */}
            <TabsContent value="users">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>User Management</CardTitle>
                      <CardDescription>Manage user accounts and permissions</CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search users..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10 w-[250px]"
                        />
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Storage Used</TableHead>
                        <TableHead>Files</TableHead>
                        <TableHead>Last Active</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="w-[100px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{user.name}</div>
                              <div className="text-sm text-muted-foreground">{user.email}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={user.role === "admin" ? "default" : "secondary"}>{user.role}</Badge>
                          </TableCell>
                          <TableCell>{formatFileSize(user.storageUsed)}</TableCell>
                          <TableCell>{user.fileCount}</TableCell>
                          <TableCell>{formatDate(user.lastActive)}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                user.status === "active"
                                  ? "default"
                                  : user.status === "suspended"
                                    ? "destructive"
                                    : "secondary"
                              }
                            >
                              {user.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {user.suspended ? (
                                  <DropdownMenuItem onClick={() => handleUserAction(user.id, "suspend")}>
                                    <UserX className="mr-2 h-4 w-4" />
                                    Suspend User
                                  </DropdownMenuItem>
                                ) : (
                                  <DropdownMenuItem onClick={() => handleUserAction(user.id, "activate")}>
                                    <Users className="mr-2 h-4 w-4" />
                                    Activate User
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem
                                  onClick={() => {
                                    setUserToDelete(user.id)
                                    setDeleteDialogOpen(true)
                                  }}
                                  className="text-red-600"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete User
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Activity Tab */}
            <TabsContent value="activity">
              <Card>
                <CardHeader>
                  <CardTitle>System Activity</CardTitle>
                  <CardDescription>Recent system events and user activities</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {activities.map((activity) => (
                      <div key={activity.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-2 h-2 bg-primary rounded-full" />
                          <div>
                            <div className="font-medium">{activity.action}</div>
                            <div className="text-sm text-muted-foreground">
                              {activity.user} • {activity.details}
                            </div>
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground">{formatDate(activity.timestamp)}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the user account and all associated files.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteUser} className="bg-red-600 hover:bg-red-700">
              Delete User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ProtectedRoute>
  )
}
