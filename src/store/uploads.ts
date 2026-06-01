import { create } from "zustand";
import type { Upload, UploadStatus } from "@/types";
import { mockUploads } from "@/mock/data";

interface UploadsState {
  uploads: Upload[];
  addUpload: (fileName: string, fileSize: number) => string;
  updateUploadStatus: (
    id: string,
    status: UploadStatus,
    progress: number,
  ) => void;
  updateUploadError: (id: string, error: string) => void;
  deleteUpload: (id: string) => void;
  simulateUpload: (id: string) => void;
}

export const useUploadsStore = create<UploadsState>((set, get) => ({
  uploads: mockUploads,

  addUpload: (fileName, fileSize) => {
    const id = `upload-${Date.now()}`;
    set((state) => ({
      uploads: [
        {
          id,
          fileName,
          fileSize,
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
      uploads: state.uploads.map((upload) =>
        upload.id === id ? { ...upload, status, progress } : upload,
      ),
    })),

  updateUploadError: (id, error) =>
    set((state) => ({
      uploads: state.uploads.map((upload) =>
        upload.id === id
          ? { ...upload, status: "fallido" as UploadStatus, error, progress: 0 }
          : upload,
      ),
    })),

  deleteUpload: (id) =>
    set((state) => ({
      uploads: state.uploads.filter((upload) => upload.id !== id),
    })),

  simulateUpload: (id) => {
    const { updateUploadStatus } = get();

    // Start uploading
    updateUploadStatus(id, "subiendo", 0);

    // Simulate upload progress
    let progress = 0;
    const uploadInterval = setInterval(() => {
      progress += Math.random() * 25 + 10;
      if (progress >= 100) {
        progress = 100;
        clearInterval(uploadInterval);
        updateUploadStatus(id, "procesando", 100);

        // Simulate Cargando
        setTimeout(() => {
          const success = Math.random() > 0.15; // 85% success rate
          if (success) {
            updateUploadStatus(id, "éxito", 100);
          } else {
            set((state) => ({
              uploads: state.uploads.map((upload) =>
                upload.id === id
                  ? {
                      ...upload,
                      status: "fallido" as UploadStatus,
                      error:
                        "El procesamiento falló: no se pudo analizar el documento",
                      progress: 0,
                    }
                  : upload,
              ),
            }));
          }
        }, 2000);
      } else {
        updateUploadStatus(id, "subiendo", Math.min(progress, 99));
      }
    }, 500);
  },
}));
