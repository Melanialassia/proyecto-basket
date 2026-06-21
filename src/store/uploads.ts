import { create } from "zustand";
import type { Upload, UploadStatus } from "@/types";

interface UploadsState {
  // uploads en progreso (subiendo / procesando / fallido)
  uploads: Upload[];
  addUpload: (fileName: string, fileSize: number, teamId?: string) => string;
  updateUploadStatus: (id: string, status: UploadStatus, progress: number) => void;
  updateUploadError: (id: string, error: string) => void;
  setCloudinaryUrl: (id: string, url: string) => void;
  removeUpload: (id: string) => void;
  uploadFile: (id: string, file: File, teamId?: string) => Promise<void>;
}

export const useUploadsStore = create<UploadsState>((set, get) => ({
  uploads: [],

  addUpload: (fileName, fileSize, teamId) => {
    const id = `upload-${Date.now()}`;
    set((state) => ({
      uploads: [
        {
          id,
          fileName,
          fileSize,
          teamId,
          status: "inactivo" as UploadStatus,
          progress: 0,
          uploadedAt: new Date().toISOString(),
        },
        ...state.uploads,
      ],
    }));
    return id;
  },

  updateUploadStatus: (id, status, progress) =>
    set((state) => ({
      uploads: state.uploads.map((u) =>
        u.id === id ? { ...u, status, progress } : u,
      ),
    })),

  updateUploadError: (id, error) =>
    set((state) => ({
      uploads: state.uploads.map((u) =>
        u.id === id
          ? { ...u, status: "fallido" as UploadStatus, error, progress: 0 }
          : u,
      ),
    })),

  setCloudinaryUrl: (id, url) =>
    set((state) => ({
      uploads: state.uploads.map((u) =>
        u.id === id ? { ...u, cloudinaryUrl: url } : u,
      ),
    })),

  removeUpload: (id) =>
    set((state) => ({
      uploads: state.uploads.filter((u) => u.id !== id),
    })),

  uploadFile: async (id, file, teamId) => {
    const { updateUploadStatus, updateUploadError, setCloudinaryUrl } = get();

    updateUploadStatus(id, "subiendo", 10);

    const formData = new FormData();
    formData.append("file", file);
    if (teamId) formData.append("teamId", teamId);

    let progress = 10;
    const progressInterval = setInterval(() => {
      progress = Math.min(progress + Math.random() * 15, 90);
      updateUploadStatus(id, "subiendo", Math.round(progress));
    }, 600);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      clearInterval(progressInterval);

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        updateUploadError(id, body?.error ?? `Error del servidor (${res.status})`);
        return;
      }

      const { url } = await res.json();
      updateUploadStatus(id, "procesando", 100);

      setTimeout(() => {
        setCloudinaryUrl(id, url);
        updateUploadStatus(id, "éxito", 100);
      }, 800);
    } catch {
      clearInterval(progressInterval);
      updateUploadError(id, "Error de red al subir el archivo");
    }
  },
}));
