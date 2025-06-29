// API endpoints constants
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    ME: "/auth/me",
    REFRESH: "/auth/refresh",
    LOGOUT: "/auth/logout",
  },

  // Files
  FILES: {
    BASE: "/files",
    UPLOAD: "/files/upload",
    SEARCH: "/files/search",
    FILTERS: "/files/filters",
    DOWNLOAD: (id: string) => `/files/${id}/download`,
    SHARE: (id: string) => `/files/${id}/share`,
    BY_ID: (id: string) => `/files/${id}`,
  },

  // Users
  USERS: {
    ME: "/users/me",
    CHANGE_PASSWORD: "/users/change-password",
    SETTINGS: "/users/settings",
    BY_ID: (id: string) => `/users/${id}`,
  },

  // Admin
  ADMIN: {
    STATS: "/admin/stats",
    USERS: "/admin/users",
    ACTIVITY: "/admin/activity",
    SYSTEM_HEALTH: "/admin/system-health",
    SYSTEM_SETTINGS: "/admin/system-settings",
    BACKUP: "/admin/backup",
    LOGS: "/admin/logs",
    USER_ACTION: (id: string, action: string) => `/admin/users/${id}/${action}`,
  },

  // Analytics
  ANALYTICS: {
    STORAGE_USAGE: "/analytics/storage-usage",
    FILE_TYPES: "/analytics/file-types",
    USER_ACTIVITY: "/analytics/user-activity",
  },

  // System
  SYSTEM: {
    INFO: "/system/info",
    HEALTH: "/health",
    BACKUP: "/system/backup",
    LOGS: "/system/logs",
  },
} as const

// HTTP status codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
} as const

// File size limits and types
export const FILE_CONSTRAINTS = {
  MAX_FILE_SIZE: 100 * 1024 * 1024, // 100MB
  ALLOWED_TYPES: [
    "image/*",
    "video/*",
    "audio/*",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "text/*",
    "application/zip",
    "application/x-rar-compressed",
  ],
} as const

// Pagination defaults
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const
