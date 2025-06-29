const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"

interface SystemInfo {
  version: string
  environment: string
  uptime: number
  nodeVersion: string
  platform: string
  architecture: string
  totalMemory: number
  freeMemory: number
  cpuUsage: number
}

interface HealthCheck {
  status: "healthy" | "degraded" | "unhealthy"
  timestamp: string
  services: {
    database: "up" | "down"
    storage: "up" | "down"
    cache: "up" | "down"
    queue: "up" | "down"
  }
  responseTime: number
}

export const systemService = {
  async getSystemInfo(): Promise<SystemInfo> {
    const response = await fetch(`${API_BASE_URL}/system/info`)

    if (!response.ok) {
      throw new Error("Failed to fetch system info")
    }

    return response.json()
  },

  async getHealthCheck(): Promise<HealthCheck> {
    const response = await fetch(`${API_BASE_URL}/health`)

    if (!response.ok) {
      throw new Error("Failed to fetch health check")
    }

    return response.json()
  },

  async createSystemBackup(): Promise<{ message: string; backupId: string }> {
    const token = localStorage.getItem("token")
    const response = await fetch(`${API_BASE_URL}/system/backup`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      throw new Error("Failed to create system backup")
    }

    return response.json()
  },

  async getSystemLogs(
    level?: string,
    limit = 100,
  ): Promise<{
    logs: Array<{
      timestamp: string
      level: string
      message: string
      service: string
    }>
  }> {
    const token = localStorage.getItem("token")
    const params = new URLSearchParams({ limit: limit.toString() })
    if (level) params.append("level", level)

    const response = await fetch(`${API_BASE_URL}/system/logs?${params}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      throw new Error("Failed to fetch system logs")
    }

    return response.json()
  },
}
