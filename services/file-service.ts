const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"

interface FileItem {
  _id: string
  name: string
  size: number
  type: string
  createdAt: string
  updatedAt: string
  owner: {
    id: string
    name: string
    email: string
  }
  checksum?: string
  downloadCount?: number
}

interface FilesResponse {
  [x: string]: any
  files: FileItem[]
  total: number
  page: number
  limit: number
}

interface SearchFilters {
  query?: string
  fileTypes?: string[]
  dateRange?: string
  sizeRange?: string
  sortBy?: string
  sortOrder?: "asc" | "desc"
  page?: number
  limit?: number
}

const getAuthHeaders = () => {
  const token = localStorage.getItem("token")
  return {
    Authorization: `Bearer ${token}`,
  }
}

export const fileService = {
  async uploadFile(file: File): Promise<FileItem> {
    const formData = new FormData()
    formData.append("file", file)

    const response = await fetch(`${API_BASE_URL}/files/upload`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: formData,
    })

    console.log(response.status);
    

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "File upload failed" }))
      throw new Error(error.message || "File upload failed")
    }

    return response.json()
  },

  async getFiles(query?: string, filters?: any): Promise<FilesResponse> {
    const params = new URLSearchParams()

    if (query) params.append("query", query)
    if (filters?.sortBy) params.append("sortBy", filters.sortBy)
    if (filters?.sortOrder) params.append("sortOrder", filters.sortOrder)
    if (filters?.fileTypes && filters.fileTypes.length > 0) {
      params.append("fileTypes", filters.fileTypes.join(","))
    }
    if (filters?.dateRange) params.append("dateRange", filters.dateRange)
    if (filters?.sizeRange) params.append("sizeRange", filters.sizeRange)
    if (filters?.page) params.append("page", filters.page.toString())
    if (filters?.limit) params.append("limit", filters.limit.toString())

    const response = await fetch(`${API_BASE_URL}/files?${params}`, {
      headers: getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error("Failed to fetch files")
    }

    return response.json()
  },

  async getFile(id: string): Promise<FileItem> {
    const response = await fetch(`${API_BASE_URL}/files/${id}`, {
      headers: getAuthHeaders(),
    })

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error("File not found")
      }
      throw new Error("Failed to fetch file")
    }

    return response.json()
  },

  async deleteFile(id: string): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/files/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Failed to delete file" }))
      throw new Error(error.message || "Failed to delete file")
    }

    return response.json()
  },

  async downloadFile(id: string): Promise<Blob> {
    
    const response = await fetch(`${API_BASE_URL}/files/${id}/download`, {
      headers: getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error("Failed to download file")
    }

    return response.blob()
  },

  async updateFile(id: string, data: { name?: string }): Promise<FileItem> {
    const response = await fetch(`${API_BASE_URL}/files/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error("Failed to update file")
    }

    return response.json()
  },

  async shareFile(
    id: string,
    options: { expiresIn?: string; password?: string } = {},
  ): Promise<{ shareUrl: string; shareId: string }> {
    const response = await fetch(`${API_BASE_URL}/files/${id}/share`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify(options),
    })

    if (!response.ok) {
      throw new Error("Failed to share file")
    }

    return response.json()
  },

  async searchFiles(filters: SearchFilters): Promise<FilesResponse> {
    const params = new URLSearchParams()

    if (filters.query) params.append("q", filters.query)
    if (filters.fileTypes && filters.fileTypes.length > 0) {
      params.append("fileTypes", filters.fileTypes.join(","))
    }
    if (filters.dateRange) params.append("dateRange", filters.dateRange)
    if (filters.sizeRange) params.append("sizeRange", filters.sizeRange)
    if (filters.sortBy) params.append("sortBy", filters.sortBy)
    if (filters.sortOrder) params.append("sortOrder", filters.sortOrder)
    if (filters.page) params.append("page", filters.page.toString())
    if (filters.limit) params.append("limit", filters.limit.toString())

    const response = await fetch(`${API_BASE_URL}/files/search/user?${params}`, {
      headers: getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error("Failed to search files")
    }

    return response.json()
  },

  async getFilterOptions(): Promise<{
    fileTypes: Array<{ value: string; label: string; count: number }>
    dateRanges: Array<{ value: string; label: string }>
    sizeRanges: Array<{ value: string; label: string }>
  }> {
    const response = await fetch(`${API_BASE_URL}/files/filters`, {
      headers: getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error("Failed to fetch filter options")
    }

    return response.json()
  },
}
