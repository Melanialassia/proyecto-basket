"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft, Trophy, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { KPICard } from "@/components/ui/kpi-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { useTeamsStore } from "@/store/teams";
import { usePlayersStore } from "@/store/players";
import { useGamesStore } from "@/store/games";
import { formatDate, getWinPercentage } from "@/lib/utils";

export default function TeamDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const team = useTeamsStore((s) => s.teams.find((t) => t.id === id));
  const players = usePlayersStore((s) =>
    s.players.filter((p) => p.teamId === id)
  );
  const games = useGamesStore((s) =>
    s.games.filter((g) => g.homeTeamId === id || g.awayTeamId === id)
  );
  const allTeams = useTeamsStore((s) => s.teams);

  if (!team) {
    return (
      <div className="space-y-6">
        <Link href="/teams">
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Volver a Equipos
          </Button>
        </Link>
        <EmptyState
          title="Equipo no encontrado"
          description="El equipo que buscas no existe."
        />
      </div>
    );
  }

  const avgPPG =
    players.length > 0
      ? (
          players.reduce((sum, p) => sum + p.stats.pointsPerGame, 0) /
          players.length
        ).toFixed(1)
      : "0";

  const avgRPG =
    players.length > 0
      ? (
          players.reduce((sum, p) => sum + p.stats.reboundsPerGame, 0) /
          players.length
        ).toFixed(1)
      : "0";

  const avgAPG =
    players.length > 0
      ? (
          players.reduce((sum, p) => sum + p.stats.assistsPerGame, 0) /
          players.length
        ).toFixed(1)
      : "0";

  const getTeamName = (teamId: string) =>
    allTeams.find((t) => t.id === teamId)?.abbreviation ?? "???";

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex items-center gap-4">
        <Link href="/teams">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex items-center gap-4">
          <div
            className="flex h-14 w-14 items-center justify-center rounded-2xl text-lg font-bold text-white"
            style={{ backgroundColor: team.logoColor }}
          >
            {team.abbreviation}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">
              {team.city} {team.name}
            </h2>
            <p className="text-sm text-muted-foreground">
              Conferencia {team.conference} · División {team.division}
            </p>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KPICard
          title="Récord"
          value={`${team.wins}-${team.losses}`}
          icon={Trophy}
        />
        <KPICard title="Prom PPG" value={avgPPG} icon={Trophy} />
        <KPICard title="Prom RPG" value={avgRPG} icon={Trophy} />
        <KPICard title="Prom APG" value={avgAPG} icon={Trophy} />
      </div>

      {/* Pestañas */}
      <Tabs defaultValue="players" className="space-y-4">
        <TabsList>
          <TabsTrigger value="players">Jugadores ({players.length})</TabsTrigger>
          <TabsTrigger value="games">Partidos ({games.length})</TabsTrigger>
          <TabsTrigger value="stats">Estadísticas</TabsTrigger>
        </TabsList>

        <TabsContent value="players">
          {players.length === 0 ? (
            <EmptyState
              icon={Users}
              title="Sin jugadores"
              description="Este equipo aún no tiene jugadores."
            />
          ) : (
            <Card className="border border-border bg-card shadow-sm">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>Jugador</TableHead>
                    <TableHead>Posición</TableHead>
                    <TableHead className="text-center">PPG</TableHead>
                    <TableHead className="text-center">RPG</TableHead>
                    <TableHead className="text-center">APG</TableHead>
                    <TableHead className="text-center">FG%</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {players.map((player) => (
                    <TableRow key={player.id}>
                      <TableCell className="font-mono">
                        {player.number}
                      </TableCell>
                      <TableCell>
                        <Link
                          href={`/players/${player.id}`}
                          className="font-medium text-primary hover:underline"
                        >
                          {player.firstName} {player.lastName}
                        </Link>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {player.position}
                      </TableCell>
                      <TableCell className="text-center">
                        {player.stats.pointsPerGame}
                      </TableCell>
                      <TableCell className="text-center">
                        {player.stats.reboundsPerGame}
                      </TableCell>
                      <TableCell className="text-center">
                        {player.stats.assistsPerGame}
                      </TableCell>
                      <TableCell className="text-center">
                        {player.stats.fieldGoalPercentage}%
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="games">
          {games.length === 0 ? (
            <EmptyState
              icon={Trophy}
              title="Sin partidos"
              description="No se encontraron partidos para este equipo."
            />
          ) : (
            <Card className="border border-border bg-card shadow-sm">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Rival</TableHead>
                    <TableHead>Marcador</TableHead>
                    <TableHead>Resultado</TableHead>
                    <TableHead>Sede</TableHead>
                    <TableHead>Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {games.map((game) => {
                    const isHome = game.homeTeamId === id;
                    const opponentId = isHome
                      ? game.awayTeamId
                      : game.homeTeamId;
                    const teamScore = isHome ? game.homeScore : game.awayScore;
                    const opponentScore = isHome
                      ? game.awayScore
                      : game.homeScore;
                    const won =
                      game.status === "completado" && teamScore > opponentScore;

                    return (
                      <TableRow key={game.id}>
                        <TableCell className="text-muted-foreground">
                          {formatDate(game.date)}
                        </TableCell>
                        <TableCell className="font-medium">
                          {isHome ? "vs" : "@"} {getTeamName(opponentId)}
                        </TableCell>
                        <TableCell className="font-mono">
                          {game.status === "completado"
                            ? `${teamScore}-${opponentScore}`
                            : "-"}
                        </TableCell>
                        <TableCell>
                          {game.status === "completado" && (
                            <span
                              className={
                                won ? "text-emerald-600" : "text-red-500"
                              }
                            >
                              {won ? "G" : "P"}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {game.venue}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={game.status} />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="stats">
          <Card className="border border-border bg-card p-6 shadow-sm">
            <CardHeader className="px-0 pt-0">
              <CardTitle className="text-base">Estadísticas del Equipo</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6 px-0 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-xl border border-border bg-muted/30 p-4">
                <p className="text-sm text-muted-foreground">Porcentaje de Victorias</p>
                <p className="mt-1 text-2xl font-bold">
                  {getWinPercentage(team.wins, team.losses)}
                </p>
              </div>
              <div className="rounded-xl border border-border bg-muted/30 p-4">
                <p className="text-sm text-muted-foreground">
                  Total de Partidos Jugados
                </p>
                <p className="mt-1 text-2xl font-bold">
                  {team.wins + team.losses}
                </p>
              </div>
              <div className="rounded-xl border border-border bg-muted/30 p-4">
                <p className="text-sm text-muted-foreground">Tamaño del Plantel</p>
                <p className="mt-1 text-2xl font-bold">{players.length}</p>
              </div>
              <div className="rounded-xl border border-border bg-muted/30 p-4">
                <p className="text-sm text-muted-foreground">Puntos por Partido</p>
                <p className="mt-1 text-2xl font-bold">{avgPPG}</p>
              </div>
              <div className="rounded-xl border border-border bg-muted/30 p-4">
                <p className="text-sm text-muted-foreground">Rebotes por Partido</p>
                <p className="mt-1 text-2xl font-bold">{avgRPG}</p>
              </div>
              <div className="rounded-xl border border-border bg-muted/30 p-4">
                <p className="text-sm text-muted-foreground">Asistencias por Partido</p>
                <p className="mt-1 text-2xl font-bold">{avgAPG}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
