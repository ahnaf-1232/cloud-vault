const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"

interface UserProfile {
  id: string
  name: string
  email: string
  role: string
  createdAt: string
  storageUsed: number
  storageLimit: number
  fileCount: number
}

interface UpdateProfileRequest {
  name: string
  email: string
}

interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
}

interface UserSettings {
  darkMode?: boolean
  emailNotifications?: boolean
  autoBackup?: boolean
  language?: string
  timezone?: string
}

const getAuthHeaders = () => {
  const token = localStorage.getItem("token")
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  }
}

export const userService = {
  async getProfile(): Promise<UserProfile> {
    const response = await fetch(`${API_BASE_URL}/users/me`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })

    if (!response.ok) {
      throw new Error("Failed to fetch user profile")
    }

    return response.json()
  },

  async updateProfile(data: UpdateProfileRequest): Promise<UserProfile> {
    const response = await fetch(`${API_BASE_URL}/users/me`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Failed to update profile" }))
      throw new Error(error.message || "Failed to update profile")
    }

    return response.json()
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/users/change-password`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ currentPassword, newPassword } as ChangePasswordRequest),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Failed to change password" }))
      throw new Error(error.message || "Failed to change password")
    }

    return response.json()
  },

  async getSettings(): Promise<UserSettings> {
    const response = await fetch(`${API_BASE_URL}/users/settings`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })

    if (!response.ok) {
      throw new Error("Failed to fetch user settings")
    }

    return response.json()
  },

  async updateSettings(settings: UserSettings): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/users/settings`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(settings),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Failed to update settings" }))
      throw new Error(error.message || "Failed to update settings")
    }

    return response.json()
  },

  async deleteAccount(): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/users/me`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Failed to delete account" }))
      throw new Error(error.message || "Failed to delete account")
    }

    return response.json()
  },

  async getUserById(id: string): Promise<UserProfile> {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })

    if (!response.ok) {
      throw new Error("Failed to fetch user")
    }

    return response.json()
  },
}
