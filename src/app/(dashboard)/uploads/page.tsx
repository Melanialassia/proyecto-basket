"use client";

import { useState, useCallback } from "react";
import {
  Upload,
  FileText,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useUploadsStore } from "@/store/uploads";
import { formatFileSize, formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

export default function UploadsPage() {
  const { uploads, addUpload, simulateUpload, deleteUpload } =
    useUploadsStore();
  const [isDragging, setIsDragging] = useState(false);

  const handleFiles = useCallback(
    (files: FileList) => {
      Array.from(files).forEach((file) => {
        if (file.type !== "application/pdf") {
          toast.error(`"${file.name}" is not a PDF file.`);
          return;
        }
        if (file.size > MAX_FILE_SIZE) {
          toast.error(`"${file.name}" exceeds the 20MB limit.`);
          return;
        }
        const id = addUpload(file.name, file.size);
        simulateUpload(id);
        toast.info(`Uploading "${file.name}"...`);
      });
    },
    [addUpload, simulateUpload]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (e.dataTransfer.files.length > 0) {
        handleFiles(e.dataTransfer.files);
      }
    },
    [handleFiles]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        handleFiles(e.target.files);
        e.target.value = "";
      }
    },
    [handleFiles]
  );

  const activeUploads = uploads.filter(
    (u) => u.status === "subiendo" || u.status === "procesando"
  );
  const completedUploads = uploads.filter(
    (u) => u.status === "éxito" || u.status === "fallido"
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "uploading":
      case "procesando":
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      case "éxito":
        return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
      case "fallido":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <FileText className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Estadísticas de Subida"
        description="Sube hojas de estadísticas en PDF para procesar"
      />

      {/* Drop Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={cn(
          "relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-16 text-center transition-all",
          isDragging
            ? "border-primary bg-primary/5 scale-[1.01]"
            : "border-border bg-card hover:border-primary/40 hover:bg-muted/30"
        )}
      >
        <div
          className={cn(
            "mb-4 flex h-14 w-14 items-center justify-center rounded-2xl transition-colors",
            isDragging ? "bg-primary/10" : "bg-muted"
          )}
        >
          <Upload
            className={cn(
              "h-6 w-6 transition-colors",
              isDragging ? "text-primary" : "text-muted-foreground"
            )}
          />
        </div>
        <h3 className="mb-1 text-base font-semibold text-foreground">
          {isDragging ? "Suelta los archivos aquí" : "Arrastra y suelta archivos PDF"}
        </h3>
        <p className="mb-4 text-sm text-muted-foreground">
          or click to browse · PDF only · Max 20MB
        </p>
        <label>
          <input
            type="file"
            accept=".pdf,application/pdf"
            multiple
            onChange={handleFileInput}
            className="hidden"
          />
          <Button variant="outline" className="cursor-pointer" render={<span>Buscar Archivos</span>} />
        </label>
      </div>

      {/* Active Uploads */}
      {activeUploads.length > 0 && (
        <Card className="border border-border bg-card shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              Processing ({activeUploads.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {activeUploads.map((upload) => (
              <div
                key={upload.id}
                className="flex items-center gap-4 rounded-lg border border-border bg-muted/30 p-4"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50">
                  <FileText className="h-5 w-5 text-red-500" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center justify-between">
                    <p className="truncate text-sm font-medium text-foreground">
                      {upload.fileName}
                    </p>
                    <span className="ml-2 shrink-0 text-xs text-muted-foreground">
                      {formatFileSize(upload.fileSize)}
                    </span>
                  </div>
                  <Progress value={upload.progress} className="h-1.5" />
                  <p className="mt-1 text-xs text-muted-foreground">
                    {upload.status === "subiendo"
                      ? `Subiendo... ${Math.round(upload.progress)}%`
                      : "Procesando documento..."}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Upload History */}
      <Card className="border border-border bg-card shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Upload History</CardTitle>
        </CardHeader>
        <CardContent>
          {completedUploads.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-sm text-muted-foreground">
                No completed uploads yet
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Archivo</TableHead>
                  <TableHead>Tamaño</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead className="w-[50px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {completedUploads.map((upload) => (
                  <TableRow key={upload.id} className="group">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {getStatusIcon(upload.status)}
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {upload.fileName}
                          </p>
                          {upload.error && (
                            <p className="text-xs text-destructive">
                              {upload.error}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatFileSize(upload.fileSize)}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={upload.status} />
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(upload.uploadedAt)}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 opacity-0 group-hover:opacity-100"
                        onClick={() => {
                          deleteUpload(upload.id);
                          toast.success("Subida eliminada");
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
