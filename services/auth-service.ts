const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"

interface LoginRequest {
  email: string
  password: string
}

interface RegisterRequest {
  name: string
  email: string
  password: string
}

interface AuthResponse {
  user: {
    id: string
    name: string
    email: string
    role: string
  }
  token: string
}

export const authService = {
  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password } as LoginRequest),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Login failed" }))
      throw new Error(error.message || "Login failed")
    }

    return response.json()
  },

  async register(name: string, email: string, password: string): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, email, password } as RegisterRequest),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Registration failed" }))
      throw new Error(error.message || "Registration failed")
    }

    return response.json()
  },

  async getCurrentUser() {
    const token = localStorage.getItem("token")
    if (!token) {
      throw new Error("No token found")
    }

    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem("token")
        throw new Error("Token expired")
      }
      throw new Error("Failed to get current user")
    }

    return response.json()
  },

  async refreshToken(): Promise<{ token: string }> {
    const token = localStorage.getItem("token")
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      throw new Error("Failed to refresh token")
    }

    return response.json()
  },

  async logout(): Promise<void> {
    const token = localStorage.getItem("token")
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
    } catch (error) {
      // Continue with logout even if API call fails
      console.warn("Logout API call failed:", error)
    } finally {
      localStorage.removeItem("token")
    }
  },
}
