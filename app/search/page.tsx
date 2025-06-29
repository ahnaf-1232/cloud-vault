"use client"

import { useState } from "react"
import { ProtectedRoute } from "@/components/protected-route"
import { Navbar } from "@/components/navbar"
import { FileTable } from "@/components/file-table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Search, Filter, X } from "lucide-react"
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
  }
}

interface SearchFilters {
  query: string
  fileTypes: string[]
  dateRange: string
  sizeRange: string
  sortBy: string
  sortOrder: "asc" | "desc"
}

export default function SearchPage() {
  const [files, setFiles] = useState<FileItem[]>([])
  const [loading, setLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const { toast } = useToast()

  const [filters, setFilters] = useState<SearchFilters>({
    query: "",
    fileTypes: [],
    dateRange: "",
    sizeRange: "",
    sortBy: "uploadedAt",
    sortOrder: "desc",
  })

  const fileTypeOptions = [
    { value: "image", label: "Images" },
    { value: "video", label: "Videos" },
    { value: "audio", label: "Audio" },
    { value: "document", label: "Documents" },
    { value: "pdf", label: "PDF" },
    { value: "text", label: "Text" },
    { value: "archive", label: "Archives" },
  ]

  const dateRangeOptions = [
    { value: "today", label: "Today" },
    { value: "week", label: "This Week" },
    { value: "month", label: "This Month" },
    { value: "year", label: "This Year" },
  ]

  const sizeRangeOptions = [
    { value: "small", label: "< 1 MB" },
    { value: "medium", label: "1 MB - 10 MB" },
    { value: "large", label: "10 MB - 100 MB" },
    { value: "xlarge", label: "> 100 MB" },
  ]

  const handleSearch = async () => {
    try {
      setLoading(true)
      setHasSearched(true)
      const response = await fileService.searchFiles({
        query: filters.query,
        fileTypes: filters.fileTypes,
        dateRange: filters.dateRange,  // Adjust based on your API's expected parameters
        sizeRange: filters.sizeRange,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
      })

      console.log(response.files);
      
      setFiles(response.files || [])
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to search files. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }  

  const handleFileTypeChange = (fileType: string, checked: boolean) => {
    setFilters((prev) => ({
      ...prev,
      fileTypes: checked ? [...prev.fileTypes, fileType] : prev.fileTypes.filter((type) => type !== fileType),
    }))
  }

  const clearFilters = () => {
    setFilters({
      query: "",
      fileTypes: [],
      dateRange: "",  // Reset to default value or an empty state
      sizeRange: "",
      sortBy: "uploadedAt",
      sortOrder: "desc",
    })
    setFiles([])  // Clear the files shown
    setHasSearched(false)  // Reset search status
  }

  const handleFileDelete = async (fileId: string) => {
    try {
      await fileService.deleteFile(fileId)  // Replace with actual delete logic
      setFiles(files.filter((file) => file._id !== fileId))  // Remove deleted file from state
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
      const blob = await fileService.downloadFile(fileId)  // Adjust for actual download API
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = fileName  // Filename will be used for the download
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

  const activeFiltersCount = [filters.fileTypes.length > 0, filters.dateRange !== "", filters.sizeRange !== ""].filter(
    Boolean,
  ).length

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Search & Filter</h1>
            <p className="text-muted-foreground">Find your files quickly with advanced search and filtering</p>
          </div>

          <div className="grid gap-6 lg:grid-cols-4">
            {/* Search and Filters Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              {/* Search Input */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Search</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="search">File name</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="search"
                        placeholder="Search files..."
                        value={filters.query}
                        onChange={(e) => setFilters((prev) => ({ ...prev, query: e.target.value }))}
                        className="pl-10"
                        onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                      />
                    </div>
                  </div>
                  <Button onClick={handleSearch} className="w-full" disabled={loading}>
                    <Search className="mr-2 h-4 w-4" />
                    Search
                  </Button>
                </CardContent>
              </Card>

              {/* Filters */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Filter className="h-4 w-4" />
                      Filters
                      {activeFiltersCount > 0 && (
                        <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                          {activeFiltersCount}
                        </span>
                      )}
                    </CardTitle>
                    {activeFiltersCount > 0 && (
                      <Button variant="ghost" size="sm" onClick={clearFilters}>
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* File Types */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">File Types</Label>
                    <div className="space-y-2">
                      {fileTypeOptions.map((option) => (
                        <div key={option.value} className="flex items-center space-x-2">
                          <Checkbox
                            id={option.value}
                            checked={filters.fileTypes.includes(option.value)}
                            onCheckedChange={(checked) => handleFileTypeChange(option.value, checked as boolean)}
                          />
                          <Label htmlFor={option.value} className="text-sm">
                            {option.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Date Range */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Date Range</Label>
                    <Select
                      value={filters.dateRange}
                      onValueChange={(value) => {
                        setFilters((prev) => ({
                          ...prev,
                          dateRange: value === "all" ? "" : value,
                        }));
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select date range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        {dateRangeOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                  </div>

                  <Separator />

                  {/* Size Range */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">File Size</Label>
                    <Select
                      value={filters.sizeRange}
                      onValueChange={(value) => setFilters((prev) => ({ ...prev, sizeRange: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select size range" />
                      </SelectTrigger>
                      <SelectContent>
                        {sizeRangeOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator />

                  {/* Sort Options */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Sort By</Label>
                    <Select
                      value={filters.sortBy}
                      onValueChange={(value) => setFilters((prev) => ({ ...prev, sortBy: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="name">Name</SelectItem>
                        <SelectItem value="size">Size</SelectItem>
                        <SelectItem value="uploadedAt">Date</SelectItem>
                        <SelectItem value="type">Type</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select
                      value={filters.sortOrder}
                      onValueChange={(value: "asc" | "desc") => setFilters((prev) => ({ ...prev, sortOrder: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="asc">Ascending</SelectItem>
                        <SelectItem value="desc">Descending</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Search Results */}
            <div className="lg:col-span-3">
              <Card>
                <CardHeader>
                  <CardTitle>
                    Search Results
                    {hasSearched && (
                      <span className="text-base font-normal text-muted-foreground ml-2">
                        ({files.length} files found)
                      </span>
                    )}
                  </CardTitle>
                  {!hasSearched && <CardDescription>Use the search and filters to find your files</CardDescription>}
                </CardHeader>
                <CardContent>
                  {hasSearched ? (
                    <FileTable
                      files={files}
                      loading={loading}
                      onDelete={handleFileDelete}
                      onDownload={handleFileDownload}
                    />
                  ) : (
                    <div className="text-center py-12">
                      <Search className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">Start searching</h3>
                      <p className="text-muted-foreground">Enter a search term or apply filters to find your files</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
