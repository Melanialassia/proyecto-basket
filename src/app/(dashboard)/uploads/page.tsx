"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
  Upload,
  FileText,
  X,
  AlertCircle,
  Loader2,
  ExternalLink,
  FolderOpen,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/ui/page-header";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useUploadsStore } from "@/store/uploads";
import { useTeamsStore } from "@/store/teams";
import { formatFileSize, formatDate, truncateFileName } from "@/lib/utils";
import { cn } from "@/lib/utils";

const MAX_FILE_SIZE = 20 * 1024 * 1024;

const ACCEPTED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

interface CloudinaryFile {
  id: string;
  fileName: string;
  fileSize: number;
  format: string;
  cloudinaryUrl: string;
  uploadedAt: string;
}

export default function UploadsPage() {
  const { uploads, addUpload, uploadFile, removeUpload } = useUploadsStore();
  const teams = useTeamsStore((s) => s.teams);

  const [selectedTeamId, setSelectedTeamId] = useState<string>(() => teams[0]?.id ?? "");
  const [isDragging, setIsDragging] = useState(false);
  const [teamFiles, setTeamFiles] = useState<CloudinaryFile[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<CloudinaryFile | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!selectedTeamId) { setTeamFiles([]); return; }
    setIsFetching(true);
    fetch(`/api/upload?teamId=${selectedTeamId}`)
      .then((r) => r.json())
      .then((data) => setTeamFiles(data.files ?? []))
      .catch(() => toast.error("No se pudieron cargar los archivos del equipo"))
      .finally(() => setIsFetching(false));
  }, [selectedTeamId]);

  const refreshTeamFiles = useCallback(() => {
    if (!selectedTeamId) return;
    fetch(`/api/upload?teamId=${selectedTeamId}`)
      .then((r) => r.json())
      .then((data) => setTeamFiles(data.files ?? []))
      .catch(() => {});
  }, [selectedTeamId]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const res = await fetch("/api/upload", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publicId: deleteTarget.id }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        toast.error(body?.error ?? "Error al eliminar el archivo");
        return;
      }
      setTeamFiles((prev) => prev.filter((f) => f.id !== deleteTarget.id));
      toast.success(`"${truncateFileName(deleteTarget.fileName)}" eliminado`);
    } catch {
      toast.error("Error de red al eliminar");
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  };

  const handleFiles = useCallback(
    (files: FileList) => {
      Array.from(files).forEach((file) => {
        if (!ACCEPTED_TYPES.has(file.type)) {
          toast.error(`"${file.name}" no es válido. Solo se aceptan imágenes (JPG, PNG, WEBP, GIF).`);
          return;
        }
        if (file.size > MAX_FILE_SIZE) {
          toast.error(`"${file.name}" supera el límite de 20MB.`);
          return;
        }
        if (!selectedTeamId) {
          toast.error("Seleccioná un equipo antes de subir.");
          return;
        }
        const id = addUpload(file.name, file.size, selectedTeamId);
        toast.info(`Subiendo "${file.name}"...`);
        uploadFile(id, file, selectedTeamId)
          .then(() => {
            toast.success(`"${file.name}" subido correctamente`);
            setTimeout(refreshTeamFiles, 1200);
          })
          .catch(() => toast.error(`Error al subir "${file.name}"`));
      });
    },
    [addUpload, uploadFile, selectedTeamId, refreshTeamFiles],
  );

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length > 0) handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
      e.target.value = "";
    }
  }, [handleFiles]);

  const activeUploads = uploads.filter(
    (u) => u.status === "subiendo" || u.status === "procesando",
  );
  const failedUploads = uploads.filter((u) => u.status === "fallido");
  const selectedTeam = teams.find((t) => t.id === selectedTeamId);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Archivos"
        description="Subí y gestioná los archivos de estadísticas por equipo"
      />

      {/* Selector + zona compacta */}
      <Card className="border border-border bg-card shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            {/* Selector de equipo */}
            <div className="flex flex-col gap-1 min-w-[200px]">
              <Label className="text-xs text-muted-foreground">Equipo</Label>
              <Select value={selectedTeamId} onValueChange={(v) => setSelectedTeamId(v ?? "")}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Seleccionar equipo">
                    {selectedTeam ? selectedTeam.name : "Seleccionar equipo"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {teams.map((team) => (
                    <SelectItem key={team.id} value={team.id}>
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Zona de drop compacta */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.webp,.gif,image/*"
              multiple
              onChange={handleFileInput}
              className="hidden"
            />
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={cn(
                "flex flex-1 items-center gap-3 rounded-xl border-2 border-dashed px-4 py-3 transition-all",
                isDragging
                  ? "border-primary bg-primary/5"
                  : "border-border bg-muted/20 hover:border-primary/40 hover:bg-muted/30",
              )}
            >
              <div className={cn(
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors",
                isDragging ? "bg-primary/10" : "bg-muted",
              )}>
                <Upload className={cn(
                  "h-4 w-4 transition-colors",
                  isDragging ? "text-primary" : "text-muted-foreground",
                )} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">
                  {isDragging ? "Soltá aquí" : "Arrastrá archivos o hacé clic"}
                </p>
                <p className="text-xs text-muted-foreground">JPG, PNG, WEBP, GIF · Máx 20MB</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="shrink-0"
              >
                Buscar
              </Button>
            </div>
          </div>

          {!selectedTeamId && (
            <p className="mt-2 text-xs text-amber-500 font-medium">
              Seleccioná un equipo para habilitar la subida
            </p>
          )}
        </CardContent>
      </Card>

      {/* Subidas activas */}
      {activeUploads.length > 0 && (
        <Card className="border border-border bg-card shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              Subiendo ({activeUploads.length})
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
                      {truncateFileName(upload.fileName)}
                    </p>
                    <span className="ml-2 shrink-0 text-xs text-muted-foreground">
                      {formatFileSize(upload.fileSize)}
                    </span>
                  </div>
                  <Progress value={upload.progress} className="h-1.5" />
                  <p className="mt-1 text-xs text-muted-foreground">
                    {upload.status === "subiendo"
                      ? `Subiendo... ${Math.round(upload.progress)}%`
                      : "Procesando..."}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Subidas fallidas */}
      {failedUploads.length > 0 && (
        <Card className="border border-destructive/30 bg-card shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base text-destructive">
              <AlertCircle className="h-4 w-4" />
              Fallidos ({failedUploads.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {failedUploads.map((upload) => (
              <div
                key={upload.id}
                className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-4 w-4 shrink-0 text-destructive" />
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {truncateFileName(upload.fileName)}
                    </p>
                    {upload.error && (
                      <p className="text-xs text-destructive">{upload.error}</p>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={() => removeUpload(upload.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Archivos del equipo */}
      <Card className="border border-border bg-card shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
            {selectedTeam ? `Archivos de ${selectedTeam.name}` : "Archivos del equipo"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!selectedTeamId ? (
            <div className="py-10 text-center">
              <FolderOpen className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">
                Seleccioná un equipo para ver sus archivos
              </p>
            </div>
          ) : isFetching ? (
            <div className="flex items-center justify-center py-10 gap-2 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-sm">Cargando archivos...</span>
            </div>
          ) : teamFiles.length === 0 ? (
            <div className="py-10 text-center">
              <FileText className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">
                Este equipo no tiene archivos subidos aún
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Archivo</TableHead>
                  <TableHead>Tamaño</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead className="w-[100px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {teamFiles.map((file) => {
                  const isImage = ["jpg", "jpeg", "png", "webp", "gif", "svg"].includes(file.format);
                  return (
                    <TableRow key={file.id} className="group">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {isImage ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={file.cloudinaryUrl}
                              alt={file.fileName}
                              className="h-8 w-8 rounded object-cover border border-border"
                            />
                          ) : (
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50">
                              <FileText className="h-4 w-4 text-red-500" />
                            </div>
                          )}
                          <span className="text-sm font-medium text-foreground" title={file.fileName}>
                            {truncateFileName(file.fileName)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {formatFileSize(file.fileSize)}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {formatDate(file.uploadedAt)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-primary"
                            onClick={() => window.open(file.cloudinaryUrl, "_blank")}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => setDeleteTarget(file)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Confirmación de eliminación */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
        title="Eliminar archivo"
        description={`¿Eliminás "${deleteTarget ? truncateFileName(deleteTarget.fileName) : ""}" de Cloudinary? Esta acción no se puede deshacer.`}
        onConfirm={handleDelete}
      />

      {/* Overlay de eliminando */}
      {isDeleting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/60 backdrop-blur-sm">
          <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-6 py-4 shadow-lg">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <span className="text-sm font-medium">Eliminando...</span>
          </div>
        </div>
      )}
    </div>
  );
}
