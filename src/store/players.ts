import { create } from "zustand";
import type { Player, PlayerStats } from "@/types";
import { mockPlayers } from "@/mock/data";

const defaultStats: PlayerStats = {
  gamesPlayed: 0,
  minutesPerGame: 0,
  pointsPerGame: 0,
  reboundsPerGame: 0,
  assistsPerGame: 0,
  stealsPerGame: 0,
  blocksPerGame: 0,
  turnoversPerGame: 0,
  fieldGoalPercentage: 0,
  threePointPercentage: 0,
  freeThrowPercentage: 0,
};

interface PlayersState {
  players: Player[];
  addPlayer: (player: Omit<Player, "id" | "stats" | "createdAt">) => void;
  updatePlayer: (id: string, data: Partial<Player>) => void;
  deletePlayer: (id: string) => void;
  getPlayerById: (id: string) => Player | undefined;
  getPlayersByTeam: (teamId: string) => Player[];
}

export const usePlayersStore = create<PlayersState>((set, get) => ({
  players: mockPlayers,

  addPlayer: (data) =>
    set((state) => ({
      players: [
        ...state.players,
        {
          ...data,
          id: `player-${Date.now()}`,
          stats: defaultStats,
          createdAt: new Date().toISOString().split("T")[0],
        },
      ],
    })),

  updatePlayer: (id, data) =>
    set((state) => ({
      players: state.players.map((player) =>
        player.id === id ? { ...player, ...data } : player
      ),
    })),

  deletePlayer: (id) =>
    set((state) => ({
      players: state.players.filter((player) => player.id !== id),
    })),

  getPlayerById: (id) => get().players.find((player) => player.id === id),

  getPlayersByTeam: (teamId) =>
    get().players.filter((player) => player.teamId === teamId),
}));
