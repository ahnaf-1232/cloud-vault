"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { File, Download, Trash2, MoreHorizontal, Eye, Loader2 } from "lucide-react"
import Link from "next/link"

interface FileItem {
  _id: string;
  name: string;
  size: number;
  type: string;
  createdAt: string;
  owner: {
    id: string;
    name: string;
    email: string;
  };
}

interface FileTableProps {
  files: FileItem[]
  loading: boolean
  onDelete: (fileId: string) => void
  onDownload: (fileId: string, fileName: string) => void
}

export function FileTable({ files, loading, onDelete, onDownload }: FileTableProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [fileToDelete, setFileToDelete] = useState<string | null>(null)

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getFileTypeColor = (type: string) => {
    if (type.includes("image")) return "bg-green-100 text-green-800"
    if (type.includes("video")) return "bg-purple-100 text-purple-800"
    if (type.includes("audio")) return "bg-blue-100 text-blue-800"
    if (type.includes("pdf")) return "bg-red-100 text-red-800"
    if (type.includes("text") || type.includes("document")) return "bg-yellow-100 text-yellow-800"
    return "bg-gray-100 text-gray-800"
  }

  const handleDeleteClick = (fileId: string) => {
    setFileToDelete(fileId)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = () => {
    if (fileToDelete) {
      onDelete(fileToDelete)
      setFileToDelete(null)
    }
    setDeleteDialogOpen(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (files.length === 0) {
    return (
      <div className="text-center py-8">
        <File className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">No files found</h3>
        <p className="text-muted-foreground">Upload some files to get started</p>
      </div>
    )
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Size</TableHead>
            <TableHead>Uploaded</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {files.map((file, index) => (
            <TableRow key={`${file._id}-${index}`}>  {/* Ensure the key is unique */}
              <TableCell className="font-medium">
                <div className="flex items-center space-x-2">
                  <File className="h-4 w-4 text-muted-foreground" />
                  <span className="truncate max-w-[200px]">{file.name}</span>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="secondary" className={getFileTypeColor(file.type)}>
                  {file.type.split("/")[1]?.toUpperCase() || "FILE"}
                </Badge>
              </TableCell>
              <TableCell>{formatFileSize(file.size)}</TableCell>
              <TableCell>{formatDate(file.createdAt)}</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/files/${file._id}`}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onDownload(file._id, file.name)}>
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDeleteClick(file._id)} className="text-red-600">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>

      </Table>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the file from your storage.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
