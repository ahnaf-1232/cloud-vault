const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    Authorization: `Bearer ${token}`,
  };
};

export const analyticsService = {
  async getStorageUsageForUser() {
    const response = await fetch(`${API_BASE_URL}/analytics/user/storage-usage`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch user storage usage");
    }

    return response.json();
  },

  async getFileTypeAnalyticsForUser() {
    const response = await fetch(`${API_BASE_URL}/analytics/user/file-types`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch user file type analytics");
    }

    return response.json();
  },

  async getUserActivityForUser(timeRange = "30d") {
    const response = await fetch(`${API_BASE_URL}/analytics/user/user-activity?timeRange=${timeRange}`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch user activity analytics");
    }

    return response.json();
  },
};
