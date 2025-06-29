"use client"

import { useState, useEffect } from "react"
import { ProtectedRoute } from "@/components/protected-route"
import { Navbar } from "@/components/navbar"
import { FileUpload } from "@/components/file-upload"
import { FileTable } from "@/components/file-table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, Search } from "lucide-react"
import { fileService } from "@/services/file-service"
import { useToast } from "@/hooks/use-toast"

interface FileItem {
  _id: string
  name: string
  size: number
  type: string
  createdAt: string
  owner: {
    id: string;
    name: string;
    email: string;
  };
}

export default function FilesPage() {
  const [files, setFiles] = useState<FileItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("uploadedAt")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [viewMode, setViewMode] = useState<"table" | "grid">("table")
  const { toast } = useToast()

  useEffect(() => {
    loadFiles()
  }, [sortBy, sortOrder])

  const loadFiles = async () => {
    try {
      setLoading(true)
      const response = await fileService.getFiles(searchQuery, { sortBy, sortOrder })
      setFiles(response.files || [])
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load files. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    loadFiles()
  }

  const handleFileDelete = async (fileId: string) => {
    try {
      await fileService.deleteFile(fileId)
      setFiles(files.filter((file) => file._id !== fileId))
      toast({
        title: "Success",
        description: "File deleted successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete file. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleFileDownload = async (fileId: string, fileName: string) => {
    try {
      const blob = await fileService.downloadFile(fileId)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = fileName
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download file. Please try again.",
        variant: "destructive",
      })
    }
  }

  const filteredFiles = files.filter((file) => file.name.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">My Files</h1>
            <p className="text-muted-foreground">Manage and organize your uploaded files</p>
          </div>

          <Tabs defaultValue="files" className="space-y-6">
            <TabsList>
              <TabsTrigger value="files">All Files</TabsTrigger>
              <TabsTrigger value="upload">Upload Files</TabsTrigger>
            </TabsList>

            <TabsContent value="upload">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="h-5 w-5" />
                    Upload Files
                  </CardTitle>
                  <CardDescription>Upload new files to your CloudVault storage</CardDescription>
                </CardHeader>
                <CardContent>
                  <FileUpload onUploadComplete={loadFiles} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="files" className="space-y-6">
              {/* Search and Filter Controls */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 flex gap-2">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search files..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10"
                          onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                        />
                      </div>
                      <Button onClick={handleSearch}>
                        <Search className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="flex gap-2">
                      <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger className="w-[140px]">
                          <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="name">Name</SelectItem>
                          <SelectItem value="size">Size</SelectItem>
                          <SelectItem value="uploadedAt">Date</SelectItem>
                          <SelectItem value="type">Type</SelectItem>
                        </SelectContent>
                      </Select>

                      <Select value={sortOrder} onValueChange={(value: "asc" | "desc") => setSortOrder(value)}>
                        <SelectTrigger className="w-[100px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="asc">Asc</SelectItem>
                          <SelectItem value="desc">Desc</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Files Table */}
              <Card>
                <CardHeader>
                  <CardTitle>Files ({filteredFiles.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <FileTable
                    files={filteredFiles}
                    loading={loading}
                    onDelete={handleFileDelete}
                    onDownload={handleFileDownload}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </ProtectedRoute>
  )
}
