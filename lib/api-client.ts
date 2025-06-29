// Centralized API client with interceptors and error handling
class ApiClient {
  private baseURL: string
  private defaultHeaders: Record<string, string>

  constructor(baseURL: string) {
    this.baseURL = baseURL
    this.defaultHeaders = {
      "Content-Type": "application/json",
    }
  }

  private getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem("token")
    return token ? { Authorization: `Bearer ${token}` } : {}
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      // Handle different error status codes
      if (response.status === 401) {
        localStorage.removeItem("token")
        window.location.href = "/login"
        throw new Error("Authentication required")
      }

      if (response.status === 403) {
        throw new Error("Access forbidden")
      }

      if (response.status === 404) {
        throw new Error("Resource not found")
      }

      if (response.status === 429) {
        throw new Error("Too many requests. Please try again later.")
      }

      if (response.status >= 500) {
        throw new Error("Server error. Please try again later.")
      }

      // Try to get error message from response
      try {
        const errorData = await response.json()
        throw new Error(errorData.message || `HTTP ${response.status}`)
      } catch {
        throw new Error(`HTTP ${response.status}`)
      }
    }

    // Handle empty responses
    const contentType = response.headers.get("content-type")
    if (!contentType || !contentType.includes("application/json")) {
      return response.text() as unknown as T
    }

    return response.json()
  }

  async get<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
    const url = new URL(`${this.baseURL}${endpoint}`)
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value) url.searchParams.append(key, value)
      })
    }

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        ...this.defaultHeaders,
        ...this.getAuthHeaders(),
      },
    })

    return this.handleResponse<T>(response)
  }

  async post<T>(endpoint: string, data?: any, isFormData = false): Promise<T> {
    const headers = isFormData
      ? this.getAuthHeaders() // Don't set Content-Type for FormData
      : { ...this.defaultHeaders, ...this.getAuthHeaders() }

    const body = isFormData ? data : JSON.stringify(data)

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: "POST",
      headers,
      body,
    })

    return this.handleResponse<T>(response)
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: "PUT",
      headers: {
        ...this.defaultHeaders,
        ...this.getAuthHeaders(),
      },
      body: JSON.stringify(data),
    })

    return this.handleResponse<T>(response)
  }

  async delete<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: "DELETE",
      headers: {
        ...this.defaultHeaders,
        ...this.getAuthHeaders(),
      },
    })

    return this.handleResponse<T>(response)
  }

  async downloadFile(endpoint: string): Promise<Blob> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error("Failed to download file")
    }

    return response.blob()
  }
}

// Create and export the API client instance
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"
export const apiClient = new ApiClient(API_BASE_URL)
