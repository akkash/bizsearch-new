import React, { useCallback, useState } from "react";
import { Upload, X, FileText, Image, Video, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface UploadedFile {
  id: string;
  url: string;
  filename: string;
  size: number;
  type: string;
  preview?: string;
}

interface FileUploaderProps {
  accept?: string;
  maxFiles?: number;
  maxSize?: number; // in bytes
  files?: UploadedFile[];
  onFilesChange?: (files: UploadedFile[]) => void;
  onUpload?: (file: File) => Promise<UploadedFile>;
  allowReorder?: boolean;
  showPreview?: boolean;
  className?: string;
  label?: string;
  description?: string;
  required?: boolean;
  error?: string;
}

export function FileUploader({
  accept = "image/*",
  maxFiles = 10,
  maxSize = 5 * 1024 * 1024, // 5MB
  files = [],
  onFilesChange,
  onUpload,
  allowReorder = true,
  showPreview = true,
  className,
  label,
  description,
  required = false,
  error,
}: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState<string[]>([]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const droppedFiles = Array.from(e.dataTransfer.files);
      await handleFiles(droppedFiles);
    },
    [files, maxFiles, maxSize, onUpload, onFilesChange]
  );

  const handleFileInput = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = Array.from(e.target.files || []);
      await handleFiles(selectedFiles);
    },
    [files, maxFiles, maxSize, onUpload, onFilesChange]
  );

  const handleFiles = async (newFiles: File[]) => {
    if (files.length + newFiles.length > maxFiles) {
      alert(`Maximum ${maxFiles} files allowed`);
      return;
    }

    const validFiles = newFiles.filter((file) => {
      if (file.size > maxSize) {
        alert(
          `File ${file.name} is too large. Maximum size is ${formatFileSize(maxSize)}`
        );
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    const uploadPromises = validFiles.map(async (file) => {
      const fileId = `temp-${Date.now()}-${Math.random()}`;
      setUploading((prev) => [...prev, fileId]);

      try {
        if (onUpload) {
          const uploadedFile = await onUpload(file);
          return uploadedFile;
        } else {
          // Mock upload for demo
          const mockFile: UploadedFile = {
            id: fileId,
            url: URL.createObjectURL(file),
            filename: file.name,
            size: file.size,
            type: file.type,
            preview: file.type.startsWith("image/")
              ? URL.createObjectURL(file)
              : undefined,
          };
          return mockFile;
        }
      } catch (error) {
        console.error("Upload failed:", error);
        alert(`Failed to upload ${file.name}`);
        return null;
      } finally {
        setUploading((prev) => prev.filter((id) => id !== fileId));
      }
    });

    const uploadedFiles = (await Promise.all(uploadPromises)).filter(
      Boolean
    ) as UploadedFile[];

    if (uploadedFiles.length > 0) {
      onFilesChange?.([...files, ...uploadedFiles]);
    }
  };

  const removeFile = (fileId: string) => {
    const updatedFiles = files.filter((file) => file.id !== fileId);
    onFilesChange?.(updatedFiles);
  };

  const moveFile = (fromIndex: number, toIndex: number) => {
    if (!allowReorder) return;

    const updatedFiles = [...files];
    const [movedFile] = updatedFiles.splice(fromIndex, 1);
    updatedFiles.splice(toIndex, 0, movedFile);
    onFilesChange?.(updatedFiles);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith("image/")) return <Image className="w-4 h-4" />;

    if (type.startsWith("video/")) return <Video className="w-4 h-4" />;

    return <FileText className="w-4 h-4" />;
  };

  return (
    <div className={cn("space-y-4", className)}>
      {label && (
        <div className="space-y-1">
          <label className="text-sm font-medium">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      )}

      {/* Upload Area */}
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
          isDragging
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25",
          error ? "border-red-500" : "",
          files.length >= maxFiles
            ? "opacity-50 pointer-events-none"
            : "cursor-pointer hover:border-primary/50"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => {
          if (files.length < maxFiles) {
            document.getElementById(`file-input-${label}`)?.click();
          }
        }}
      >
        <Upload className="w-8 h-8 mx-auto mb-4 text-muted-foreground" />

        <div className="space-y-2">
          <p className="text-sm font-medium">
            {files.length >= maxFiles
              ? `Maximum ${maxFiles} files reached`
              : "Drop files here or click to browse"}
          </p>
          <p className="text-xs text-muted-foreground">
            Maximum file size: {formatFileSize(maxSize)} •
            {maxFiles - files.length} files remaining
          </p>
        </div>

        <input
          id={`file-input-${label}`}
          type="file"
          accept={accept}
          multiple={maxFiles > 1}
          onChange={handleFileInput}
          className="hidden"
          disabled={files.length >= maxFiles}
        />
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600">
          <AlertCircle className="w-4 h-4" />

          {error}
        </div>
      )}

      {/* Uploaded Files */}
      {files.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">
              Uploaded Files ({files.length}/{maxFiles})
            </h4>
            {allowReorder && files.length > 1 && (
              <p className="text-xs text-muted-foreground">Drag to reorder</p>
            )}
          </div>

          <div
            className={cn(
              "grid gap-3",
              showPreview
                ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                : "grid-cols-1"
            )}
          >
            {files.map((file, index) => (
              <Card key={file.id} className="overflow-hidden">
                <CardContent className="p-3">
                  <div className="flex items-start gap-3">
                    {showPreview && file.preview ? (
                      <img
                        src={file.preview}
                        alt={file.filename}
                        className="w-12 h-12 object-cover rounded flex-shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-muted rounded flex items-center justify-center flex-shrink-0">
                        {getFileIcon(file.type)}
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {file.filename}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(file.size)}
                      </p>
                      <Badge variant="secondary" className="text-xs mt-1">
                        {file.type.split("/")[0]}
                      </Badge>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(file.id)}
                      className="flex-shrink-0 h-8 w-8 p-0"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  {allowReorder && files.length > 1 && (
                    <div className="flex gap-1 mt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => moveFile(index, Math.max(0, index - 1))}
                        disabled={index === 0}
                        className="h-6 px-2 text-xs"
                      >
                        ←
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          moveFile(index, Math.min(files.length - 1, index + 1))
                        }
                        disabled={index === files.length - 1}
                        className="h-6 px-2 text-xs"
                      >
                        →
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Upload Progress */}
      {uploading.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">
            Uploading {uploading.length} files...
          </p>
          <div className="space-y-1">
            {uploading.map((fileId) => (
              <div
                key={fileId}
                className="h-2 bg-muted rounded-full overflow-hidden"
              >
                <div className="h-full bg-primary animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
