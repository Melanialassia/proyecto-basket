import { create } from "zustand";
import type { Team } from "@/types";
import { mockTeams } from "@/mock/data";

interface TeamsState {
  teams: Team[];
  addTeam: (team: Omit<Team, "id" | "wins" | "losses" | "createdAt">) => void;
  updateTeam: (id: string, data: Partial<Team>) => void;
  deleteTeam: (id: string) => void;
  getTeamById: (id: string) => Team | undefined;
}

export const useTeamsStore = create<TeamsState>((set, get) => ({
  teams: mockTeams,

  addTeam: (data) =>
    set((state) => ({
      teams: [
        ...state.teams,
        {
          ...data,
          id: `team-${Date.now()}`,
          wins: 0,
          losses: 0,
          createdAt: new Date().toISOString().split("T")[0],
        },
      ],
    })),

  updateTeam: (id, data) =>
    set((state) => ({
      teams: state.teams.map((team) =>
        team.id === id ? { ...team, ...data } : team
      ),
    })),

  deleteTeam: (id) =>
    set((state) => ({
      teams: state.teams.filter((team) => team.id !== id),
    })),

  getTeamById: (id) => get().teams.find((team) => team.id === id),
}));
