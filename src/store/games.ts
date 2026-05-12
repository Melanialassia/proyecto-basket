import { create } from "zustand";
import type { Game } from "@/types";
import { mockGames } from "@/mock/data";

interface GamesState {
  games: Game[];
  addGame: (game: Omit<Game, "id" | "status" | "createdAt">) => void;
  updateGame: (id: string, data: Partial<Game>) => void;
  deleteGame: (id: string) => void;
  getGameById: (id: string) => Game | undefined;
  getGamesByTeam: (teamId: string) => Game[];
  getGamesBySeason: (seasonId: string) => Game[];
}

export const useGamesStore = create<GamesState>((set, get) => ({
  games: mockGames,

  addGame: (data) =>
    set((state) => ({
      games: [
        ...state.games,
        {
          ...data,
          id: `game-${Date.now()}`,
          status: "programado" as const,
          createdAt: new Date().toISOString().split("T")[0],
        },
      ],
    })),

  updateGame: (id, data) =>
    set((state) => ({
      games: state.games.map((game) =>
        game.id === id ? { ...game, ...data } : game
      ),
    })),

  deleteGame: (id) =>
    set((state) => ({
      games: state.games.filter((game) => game.id !== id),
    })),

  getGameById: (id) => get().games.find((game) => game.id === id),

  getGamesByTeam: (teamId) =>
    get().games.filter(
      (game) => game.homeTeamId === teamId || game.awayTeamId === teamId
    ),

  getGamesBySeason: (seasonId) =>
    get().games.filter((game) => game.seasonId === seasonId),
}));
