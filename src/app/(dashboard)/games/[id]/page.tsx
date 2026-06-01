"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft, Trophy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { useGamesStore } from "@/store/games";
import { useTeamsStore } from "@/store/teams";
import { usePlayersStore } from "@/store/players";
import { useSeasonsStore } from "@/store/seasons";
import { formatDate } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function GameDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const game = useGamesStore((s) => s.games.find((g) => g.id === id));
  const teams = useTeamsStore((s) => s.teams);
  const players = usePlayersStore((s) => s.players);
  const seasons = useSeasonsStore((s) => s.seasons);

  if (!game) {
    return (
      <div className="space-y-6">
        <Link href="/games">
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Volver a Partidos
          </Button>
        </Link>
        <EmptyState
          title="Partido no encontrado"
          description="El partido que buscas no existe."
        />
      </div>
    );
  }

  const homeTeam = teams.find((t) => t.id === game.homeTeamId);
  const awayTeam = teams.find((t) => t.id === game.awayTeamId);
  const season = seasons.find((s) => s.id === game.seasonId);
  const homePlayers = players.filter((p) => p.teamId === game.homeTeamId);
  const awayPlayers = players.filter((p) => p.teamId === game.awayTeamId);

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex items-center gap-4">
        <Link href="/games">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-foreground">Detalle del Partido</h2>
          <p className="text-sm text-muted-foreground">
            {formatDate(game.date)} · {game.venue} · {season?.name}
          </p>
        </div>
      </div>

      {/* Resumen del marcador */}
      <Card className="border border-border bg-card shadow-sm">
        <CardContent className="p-8">
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-center">
            {/* Equipo Local */}
            <div className="flex flex-col items-center gap-2">
              <div
                className="flex h-16 w-16 items-center justify-center rounded-2xl text-xl font-bold text-white"
                style={{ backgroundColor: homeTeam?.logoColor ?? "#94A3B8" }}
              >
                {homeTeam?.abbreviation}
              </div>
              <p className="text-sm font-semibold text-foreground">
                {homeTeam?.name}
              </p>
              <p className="text-xs text-muted-foreground">Local</p>
            </div>

            {/* Marcador */}
            <div className="flex items-center gap-4">
              <span className="text-5xl font-bold text-foreground">
                {game.status === "completado" ? game.homeScore : "—"}
              </span>
              <span className="text-2xl text-muted-foreground">:</span>
              <span className="text-5xl font-bold text-foreground">
                {game.status === "completado" ? game.awayScore : "—"}
              </span>
            </div>

            {/* Equipo Visitante */}
            <div className="flex flex-col items-center gap-2">
              <div
                className="flex h-16 w-16 items-center justify-center rounded-2xl text-xl font-bold text-white"
                style={{ backgroundColor: awayTeam?.logoColor ?? "#94A3B8" }}
              >
                {awayTeam?.abbreviation}
              </div>
              <p className="text-sm font-semibold text-foreground">
                {awayTeam?.name}
              </p>
              <p className="text-xs text-muted-foreground">Visitante</p>
            </div>
          </div>

          <div className="mt-6 flex justify-center">
            <StatusBadge status={game.status} />
          </div>
        </CardContent>
      </Card>

      {/* Plantel */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Plantel Local */}
        <Card className="border border-border bg-card shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <div
                className="flex h-6 w-6 items-center justify-center rounded text-[8px] font-bold text-white"
                style={{ backgroundColor: homeTeam?.logoColor ?? "#94A3B8" }}
              >
                {homeTeam?.abbreviation}
              </div>
              Plantel {homeTeam?.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Jugador</TableHead>
                  <TableHead className="text-center">PPG</TableHead>
                  <TableHead className="text-center">RPG</TableHead>
                  <TableHead className="text-center">APG</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {homePlayers.map((player) => (
                  <TableRow key={player.id}>
                    <TableCell className="font-mono text-sm">
                      {player.number}
                    </TableCell>
                    <TableCell className="font-medium">
                      {player.firstName} {player.lastName}
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
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Plantel Visitante */}
        <Card className="border border-border bg-card shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <div
                className="flex h-6 w-6 items-center justify-center rounded text-[8px] font-bold text-white"
                style={{ backgroundColor: awayTeam?.logoColor ?? "#94A3B8" }}
              >
                {awayTeam?.abbreviation}
              </div>
              Plantel {awayTeam?.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Jugador</TableHead>
                  <TableHead className="text-center">PPG</TableHead>
                  <TableHead className="text-center">RPG</TableHead>
                  <TableHead className="text-center">APG</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {awayPlayers.map((player) => (
                  <TableRow key={player.id}>
                    <TableCell className="font-mono text-sm">
                      {player.number}
                    </TableCell>
                    <TableCell className="font-medium">
                      {player.firstName} {player.lastName}
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
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
