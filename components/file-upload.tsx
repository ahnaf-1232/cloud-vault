"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Upload, File, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { fileService } from "@/services/file-service"

interface FileWithPreview extends File {
  preview?: string
}

interface FileUploadProps {
  onUploadComplete?: () => void
}

export function FileUpload({ onUploadComplete }: FileUploadProps = {}) {
  const [files, setFiles] = useState<FileWithPreview[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const { toast } = useToast()

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(
      acceptedFiles.map((file) =>
        Object.assign(file, {
          preview: URL.createObjectURL(file),
        }),
      ),
    )
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
  })

  const removeFile = (fileToRemove: FileWithPreview) => {
    setFiles(files.filter((file) => file !== fileToRemove))
    if (fileToRemove.preview) {
      URL.revokeObjectURL(fileToRemove.preview)
    }
  }

  const uploadFiles = async () => {
    if (files.length === 0) return

    setUploading(true)
    setUploadProgress(0)

    try {
      for (let i = 0; i < files.length; i++) {
        await fileService.uploadFile(files[i])
        setUploadProgress(((i + 1) / files.length) * 100)
      }

      toast({
        title: "Upload Successful",
        description: `${files.length} file(s) uploaded successfully.`,
      })

      // After the toast success message
      if (onUploadComplete) {
        onUploadComplete()
      }

      // Clear files after successful upload
      files.forEach((file) => {
        if (file.preview) {
          URL.revokeObjectURL(file.preview)
        }
      })
      setFiles([])
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "Failed to upload files. Please try again.",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50"
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        {isDragActive ? (
          <p>Drop the files here...</p>
        ) : (
          <div>
            <p className="text-lg font-medium">Drag & drop files here</p>
            <p className="text-sm text-muted-foreground">or click to browse</p>
          </div>
        )}
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium">Selected Files:</h4>
          {files.map((file, index) => (
            <div key={index} className="flex items-center justify-between p-2 border rounded">
              <div className="flex items-center space-x-2">
                <File className="h-4 w-4" />
                <span className="text-sm">{file.name}</span>
                <span className="text-xs text-muted-foreground">({formatFileSize(file.size)})</span>
              </div>
              <Button variant="ghost" size="sm" onClick={() => removeFile(file)} disabled={uploading}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {uploading && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Uploading...</span>
            <span>{Math.round(uploadProgress)}%</span>
          </div>
          <Progress value={uploadProgress} />
        </div>
      )}

      {files.length > 0 && (
        <Button onClick={uploadFiles} disabled={uploading} className="w-full">
          {uploading ? "Uploading..." : `Upload ${files.length} file(s)`}
        </Button>
      )}
    </div>
  )
}
