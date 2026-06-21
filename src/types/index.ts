// ============================================
// Basketball Estadísticas SaaS — Core Types
// ============================================

export interface Team {
  id: string;
  name: string;
  abbreviation: string;
  city: string;
  conference: "Este" | "Oeste";
  division: string;
  logoColor: string;
  wins: number;
  losses: number;
  createdAt: string;
}

export interface Player {
  id: string;
  firstName: string;
  lastName: string;
  teamId: string;
  number: number;
  position: "PG" | "SG" | "SF" | "PF" | "C";
  height: string;
  weight: number;
  age: number;
  stats: PlayerStats;
  createdAt: string;
}

export interface PlayerStats {
  gamesPlayed: number;
  minutesPerGame: number;
  pointsPerGame: number;
  reboundsPerGame: number;
  assistsPerGame: number;
  stealsPerGame: number;
  blocksPerGame: number;
  turnoversPerGame: number;
  fieldGoalPercentage: number;
  threePointPercentage: number;
  freeThrowPercentage: number;
}

export interface Season {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
}

export interface Game {
  id: string;
  seasonId: string;
  homeTeamId: string;
  awayTeamId: string;
  homeScore: number;
  awayScore: number;
  date: string;
  status: "programado" | "en_progreso" | "completado";
  venue: string;
  createdAt: string;
}

export type UploadStatus =
  | "inactivo"
  | "subiendo"
  | "procesando"
  | "éxito"
  | "fallido";

export interface Upload {
  id: string;
  fileName: string;
  fileSize: number;
  status: UploadStatus;
  progress: number;
  teamId?: string;
  gameId?: string;
  cloudinaryUrl?: string;
  error?: string;
  uploadedAt: string;
}

export interface KPIMetric {
  label: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: string;
}

export interface EstadísticasFilters {
  teamId: string | null;
  seasonId: string | null;
  dateRange: [string, string] | null;
}

// Form schemas will be in separate files
export type TeamFormData = Omit<Team, "id" | "wins" | "losses" | "createdAt">;
export type PlayerFormData = Omit<Player, "id" | "stats" | "createdAt">;
export type SeasonFormData = Omit<Season, "id" | "createdAt">;
export type GameFormData = Omit<Game, "id" | "status" | "createdAt">;
