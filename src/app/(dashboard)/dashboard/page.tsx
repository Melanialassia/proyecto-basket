"use client";

import Link from "next/link";
import {
  Users,
  UserCircle,
  Trophy,
  TrendingUp,
  Upload,
  ArrowRight,
  BarChart3,
  Plus,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { KPICard } from "@/components/ui/kpi-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { useTeamsStore } from "@/store/teams";
import { usePlayersStore } from "@/store/players";
import { useGamesStore } from "@/store/games";
import { useUploadsStore } from "@/store/uploads";
import { formatDate, formatFileSize } from "@/lib/utils";

export default function DashboardPage() {
  const teams = useTeamsStore((s) => s.teams);
  const players = usePlayersStore((s) => s.players);
  const games = useGamesStore((s) => s.games);
  const uploads = useUploadsStore((s) => s.uploads);

  const completedGames = games.filter((g) => g.status === "completado");
  const totalWins = teams.reduce((sum, t) => sum + t.wins, 0);
  const totalGamesPlayed = teams.reduce(
    (sum, t) => sum + t.wins + t.losses,
    0
  );
  const avgWinRate =
    totalGamesPlayed > 0
      ? ((totalWins / totalGamesPlayed) * 100).toFixed(1)
      : "0";

  const recentGames = [...completedGames]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const recentUploads = [...uploads]
    .sort(
      (a, b) =>
        new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
    )
    .slice(0, 4);

  const getTeamName = (teamId: string) =>
    teams.find((t) => t.id === teamId)?.name ?? "Unknown";
  const getTeamAbbr = (teamId: string) =>
    teams.find((t) => t.id === teamId)?.abbreviation ?? "???";

  return (
    <div className="space-y-6">
      {/* KPI Row */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KPICard
          title="Total de Equipos"
          value={teams.length}
          change={12}
          changeLabel="vs el mes pasado"
          icon={Users}
        />
        <KPICard
          title="Total de Jugadores"
          value={players.length}
          change={8}
          changeLabel="vs el mes pasado"
          icon={UserCircle}
        />
        <KPICard
          title="Partidos Jugados"
          value={completedGames.length}
          change={15}
          changeLabel="vs el mes pasado"
          icon={Trophy}
        />
        <KPICard
          title="Tasa Promedio de Victorias"
          value={`${avgWinRate}%`}
          change={2.3}
          changeLabel="vs el mes pasado"
          icon={TrendingUp}
        />
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link href="/teams" className="group">
          <Card className="border border-border bg-card transition-all hover:border-primary/30 hover:shadow-md">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Plus className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  Add Team
                </p>
                <p className="text-xs text-muted-foreground">
                  Create a new team
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/players" className="group">
          <Card className="border border-border bg-card transition-all hover:border-primary/30 hover:shadow-md">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <Plus className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  Add Player
                </p>
                <p className="text-xs text-muted-foreground">
                  Register a player
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/uploads" className="group">
          <Card className="border border-border bg-card transition-all hover:border-primary/30 hover:shadow-md">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <Upload className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  Upload Stats
                </p>
                <p className="text-xs text-muted-foreground">Subir PDF</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/analytics" className="group">
          <Card className="border border-border bg-card transition-all hover:border-primary/30 hover:shadow-md">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                <BarChart3 className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  Analytics
                </p>
                <p className="text-xs text-muted-foreground">Ver métricas</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Games */}
        <Card className="border border-border bg-card shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-semibold">
              Recent Games
            </CardTitle>
            <Link href="/games">
              <Button variant="ghost" size="sm" className="gap-1 text-xs">
                View all
                <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentGames.map((game) => (
              <div
                key={game.id}
                className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <div className="text-center">
                    <p className="text-xs font-medium text-muted-foreground">
                      {formatDate(game.date)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-foreground">
                      {getTeamAbbr(game.homeTeamId)}
                    </span>
                    <span className="text-lg font-bold text-foreground">
                      {game.homeScore}
                    </span>
                    <span className="text-xs text-muted-foreground">vs</span>
                    <span className="text-lg font-bold text-foreground">
                      {game.awayScore}
                    </span>
                    <span className="text-sm font-semibold text-foreground">
                      {getTeamAbbr(game.awayTeamId)}
                    </span>
                  </div>
                </div>
                <StatusBadge status={game.status} />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Uploads */}
        <Card className="border border-border bg-card shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-semibold">
              Recent Uploads
            </CardTitle>
            <Link href="/uploads">
              <Button variant="ghost" size="sm" className="gap-1 text-xs">
                View all
                <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentUploads.map((upload) => (
              <div
                key={upload.id}
                className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 text-red-500">
                    <Upload className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {upload.fileName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(upload.fileSize)}
                    </p>
                  </div>
                </div>
                <StatusBadge status={upload.status} />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
