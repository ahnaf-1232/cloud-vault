const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"

interface AdminStats {
  totalUsers: number
  totalFiles: number
  totalStorage: number
  activeUsers: number
  storageUsed: number
  storageLimit: number
  newUsersToday: number
  newFilesToday: number
  systemHealth: "healthy" | "warning" | "critical"
}

interface AdminUser {
  id: string
  name: string
  email: string
  role: string
  createdAt: string
  lastActive: string
  storageUsed: number
  fileCount: number
  suspended: boolean
  status: "active" | "suspended" | "deleted"
}

interface SystemActivity {
  id: string
  type: "user_action" | "file_action" | "system_event" | "security_event"
  user: string
  action: string
  timestamp: string
  details: string
  ipAddress?: string
  userAgent?: string
}

interface UsersResponse {
  users: AdminUser[]
  total: number
  page: number
  limit: number
}

interface ActivityResponse {
  activities: SystemActivity[]
  total: number
  page: number
  limit: number
}

interface SystemHealth {
  status: "healthy" | "warning" | "critical"
  uptime: number
  memoryUsage: number
  diskUsage: number
  activeConnections: number
  lastBackup: string
}

interface SystemSettings {
  maxFileSize: number
  allowedFileTypes: string[]
  storageQuotaPerUser: number
  enableRegistration: boolean
  enableFileSharing: boolean
  backupFrequency: string
}

const getAuthHeaders = () => {
  const token = localStorage.getItem("token")
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  }
}

export const adminService = {
  async getStats(): Promise<AdminStats> {
    const response = await fetch(`${API_BASE_URL}/admin/stats`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })

    if (!response.ok) {
      throw new Error("Failed to fetch admin stats")
    }

    return response.json()
  },

  async getUsers(page = 1, limit = 20, search = ""): Promise<UsersResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    })

    if (search) {
      params.append("search", search)
    }

    const response = await fetch(`${API_BASE_URL}/admin/users?${params}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })

    if (!response.ok) {
      throw new Error("Failed to fetch users")
    }

    return response.json()
  },

  async getSystemActivity(page = 1, limit = 50, type?: string): Promise<ActivityResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    })

    if (type) {
      params.append("type", type)
    }

    const response = await fetch(`${API_BASE_URL}/admin/activity?${params}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })

    if (!response.ok) {
      throw new Error("Failed to fetch system activity")
    }

    return response.json()
  },

  async userAction(userId: string, action: "suspend" | "activate" | "delete"): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/${action}`, {
      method: "POST",
      headers: getAuthHeaders(),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: `Failed to ${action} user` }))
      throw new Error(error.message || `Failed to ${action} user`)
    }

    return response.json()
  },

  async getSystemHealth(): Promise<SystemHealth> {
    const response = await fetch(`${API_BASE_URL}/admin/system-health`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })

    if (!response.ok) {
      throw new Error("Failed to fetch system health")
    }

    return response.json()
  },

  async getSystemSettings(): Promise<SystemSettings> {
    const response = await fetch(`${API_BASE_URL}/admin/system-settings`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })

    if (!response.ok) {
      throw new Error("Failed to fetch system settings")
    }

    return response.json()
  },

  async updateSystemSettings(settings: Partial<SystemSettings>): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/admin/system-settings`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(settings),
    })

    if (!response.ok) {
      throw new Error("Failed to update system settings")
    }

    return response.json()
  },

  async createBackup(): Promise<{ message: string; backupId: string }> {
    const response = await fetch(`${API_BASE_URL}/admin/backup`, {
      method: "POST",
      headers: getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error("Failed to create backup")
    }

    return response.json()
  },

  async getSystemLogs(
    page = 1,
    limit = 100,
    level?: string,
  ): Promise<{
    logs: Array<{
      id: string
      level: "info" | "warn" | "error" | "debug"
      message: string
      timestamp: string
      service: string
      metadata?: any
    }>
    total: number
    page: number
    limit: number
  }> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    })

    if (level) {
      params.append("level", level)
    }

    const response = await fetch(`${API_BASE_URL}/admin/logs?${params}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })

    if (!response.ok) {
      throw new Error("Failed to fetch system logs")
    }

    return response.json()
  },
}
