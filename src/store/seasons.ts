import { create } from "zustand";
import type { Season } from "@/types";
import { mockSeasons } from "@/mock/data";

interface SeasonsState {
  seasons: Season[];
  addSeason: (season: Omit<Season, "id" | "createdAt">) => void;
  updateSeason: (id: string, data: Partial<Season>) => void;
  deleteSeason: (id: string) => void;
  getSeasonById: (id: string) => Season | undefined;
  getActiveSeason: () => Season | undefined;
}

export const useSeasonsStore = create<SeasonsState>((set, get) => ({
  seasons: mockSeasons,

  addSeason: (data) =>
    set((state) => ({
      seasons: [
        ...state.seasons,
        {
          ...data,
          id: `season-${Date.now()}`,
          createdAt: new Date().toISOString().split("T")[0],
        },
      ],
    })),

  updateSeason: (id, data) =>
    set((state) => ({
      seasons: state.seasons.map((season) =>
        season.id === id ? { ...season, ...data } : season
      ),
    })),

  deleteSeason: (id) =>
    set((state) => ({
      seasons: state.seasons.filter((season) => season.id !== id),
    })),

  getSeasonById: (id) => get().seasons.find((season) => season.id === id),

  getActiveSeason: () => get().seasons.find((season) => season.isActive),
}));
