"use client";

import { useState, useEffect } from "react";
import { ProtectedRoute } from "@/components/protected-route";
import { Navbar } from "@/components/navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { FileUpload } from "@/components/file-upload";
import { useAuth } from "@/contexts/auth-context";
import { HardDrive, Upload, Files, Clock } from "lucide-react";
import Link from "next/link";
import { analyticsService } from "@/services/analytics-service";

// Define the types for the data
interface StorageUsage {
  storageUsed: number;
  storageLimit: number;
  remainingStorage: number;
}

interface FileTypeAnalytics {
  fileTypes: Array<{
    type: string;
    count: number;
    totalSize: number;
  }>;
}

interface UserActivity {
  activities: Array<{
    action: string;
    user: string;
    fileName: string;
    timestamp: string;
    fileSize: number;
  }>;
}

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} bytes`;
  else if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  else if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  else if (bytes < 1024 * 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`;
  else return `${(bytes / 1024 / 1024 / 1024 / 1024).toFixed(2)} TB`;
};

export default function DashboardPage() {
  const { user } = useAuth();

  // States for storing analytics data
  const [storageData, setStorageData] = useState<StorageUsage | null>(null);
  const [fileTypeData, setFileTypeData] = useState<FileTypeAnalytics | null>(null);
  const [userActivityData, setUserActivityData] = useState<UserActivity | null>(null);
  const [recentFiles, setRecentFiles] = useState<any[]>([]);  // Adjust type based on your activity structure
  const [loading, setLoading] = useState<boolean>(false);

  // Converting bytes to GB
  const bytesToGB = (bytes: number) => (bytes / (1024 * 1024 * 1024)).toFixed(2);

  useEffect(() => {
    const loadAnalyticsData = async () => {
      try {
        setLoading(true);
        const [storageUsage, fileTypeAnalytics, userActivity] = await Promise.all([
          analyticsService.getStorageUsageForUser(),
          analyticsService.getFileTypeAnalyticsForUser(),
          analyticsService.getUserActivityForUser(),
        ]);

        // Filter recent uploads from the last 7 days
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        // Filter the activities for recent uploads (within the last 7 days)
        const recentUploads = userActivity.activities.filter((activity: { timestamp: string | number | Date; }) => {
          const activityDate = new Date(activity.timestamp);
          return activityDate >= sevenDaysAgo;
        });

        // Set data to state
        setStorageData(storageUsage);
        setFileTypeData(fileTypeAnalytics);
        setUserActivityData(userActivity);
        setRecentFiles(recentUploads);  // Set filtered recent uploads
      } catch (error) {
        console.error("Error loading analytics data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadAnalyticsData();
  }, []);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Welcome back, {user?.name}!</h1>
            <p className="text-muted-foreground">Here's an overview of your storage</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
                <HardDrive className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {storageData ? bytesToGB(storageData.storageUsed) : 0} GB
                </div>
                <p className="text-xs text-muted-foreground">
                  of {storageData ? bytesToGB(storageData.storageLimit) : 0} GB total
                </p>
                <Progress
                  value={(storageData ? (storageData.storageUsed / storageData.storageLimit) * 100 : 0)}
                  className="mt-2"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Files</CardTitle>
                <Files className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {fileTypeData ? fileTypeData.fileTypes.length : 0}
                </div>
                <p className="text-xs text-muted-foreground">+3 from last week</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Recent Uploads</CardTitle>
                <Upload className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{recentFiles.length}</div>
                <p className="text-xs text-muted-foreground">in the last 7 days</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Last Activity</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {userActivityData && userActivityData.activities.length > 0
                    ? new Date(userActivityData.activities[0].timestamp).toLocaleString()
                    : "No activity"}
                </div>
                <p className="text-xs text-muted-foreground">last activity timestamp</p>
              </CardContent>
            </Card>

          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Quick Upload</CardTitle>
                <CardDescription>Drag and drop files or click to browse</CardDescription>
              </CardHeader>
              <CardContent>
                <FileUpload />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Recent Files</CardTitle>
                  <CardDescription>Your latest uploads</CardDescription>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/files">View All</Link>
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentFiles.map((file) => (
                    <div key={file._id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{file.fileName}</p>
                        <p className="text-sm text-muted-foreground">{formatFileSize(file.fileSize)}</p>
                      </div>
                      <p className="text-sm text-muted-foreground">{new Date(file.timestamp).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}