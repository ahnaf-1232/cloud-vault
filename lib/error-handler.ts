// Centralized error handling utilities
export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string,
  ) {
    super(message)
    this.name = "ApiError"
  }
}

export const handleApiError = (error: unknown): string => {
  if (error instanceof ApiError) {
    return error.message
  }

  if (error instanceof Error) {
    return error.message
  }

  return "An unexpected error occurred"
}

export const isNetworkError = (error: unknown): boolean => {
  return error instanceof TypeError && error.message.includes("fetch")
}

export const getErrorMessage = (error: unknown): string => {
  if (isNetworkError(error)) {
    return "Network error. Please check your connection and try again."
  }

  return handleApiError(error)
}
