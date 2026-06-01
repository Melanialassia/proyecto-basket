"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { usePlayersStore } from "@/store/players";
import { useTeamsStore } from "@/store/teams";

export default function PlayerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const player = usePlayersStore((s) => s.players.find((p) => p.id === id));
  const teams = useTeamsStore((s) => s.teams);

  if (!player) {
    return (
      <div className="space-y-6">
        <Link href="/players">
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Volver a Jugadores
          </Button>
        </Link>
        <EmptyState
          title="Jugador no encontrado"
          description="El jugador que buscas no existe."
        />
      </div>
    );
  }

  const team = teams.find((t) => t.id === player.teamId);

  const statsData = [
    { name: "PPG", value: player.stats.pointsPerGame },
    { name: "RPG", value: player.stats.reboundsPerGame },
    { name: "APG", value: player.stats.assistsPerGame },
    { name: "SPG", value: player.stats.stealsPerGame },
    { name: "BPG", value: player.stats.blocksPerGame },
  ];

  const shootingData = [
    { name: "FG%", value: player.stats.fieldGoalPercentage },
    { name: "3P%", value: player.stats.threePointPercentage },
    { name: "FT%", value: player.stats.freeThrowPercentage },
  ];

  const statCards = [
    { label: "Puntos", value: player.stats.pointsPerGame, suffix: "PPG" },
    { label: "Rebotes", value: player.stats.reboundsPerGame, suffix: "RPG" },
    { label: "Asistencias", value: player.stats.assistsPerGame, suffix: "APG" },
    { label: "Robos", value: player.stats.stealsPerGame, suffix: "SPG" },
    { label: "Bloqueos", value: player.stats.blocksPerGame, suffix: "BPG" },
    {
      label: "FG%",
      value: player.stats.fieldGoalPercentage,
      suffix: "%",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex items-center gap-4">
        <Link href="/players">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex items-center gap-4">
          <div
            className="flex h-16 w-16 items-center justify-center rounded-2xl text-xl font-bold text-white"
            style={{ backgroundColor: team?.logoColor ?? "#94A3B8" }}
          >
            #{player.number}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">
              {player.firstName} {player.lastName}
            </h2>
            <p className="text-sm text-muted-foreground">
              {team?.name ?? "Equipo Desconocido"} · {player.position} ·{" "}
              {player.height} · {player.weight} kg · Edad {player.age}
            </p>
          </div>
        </div>
      </div>

      {/* Tarjetas de estadísticas */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {statCards.map((stat) => (
          <Card
            key={stat.label}
            className="border border-border bg-card shadow-sm"
          >
            <CardContent className="p-4 text-center">
              <p className="text-xs text-muted-foreground">{stat.label}</p>
              <p className="mt-1 text-2xl font-bold text-foreground">
                {stat.value}
              </p>
              <p className="text-xs text-muted-foreground">{stat.suffix}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Gráficos */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border border-border bg-card shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Promedios por Partido</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={statsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    borderRadius: "12px",
                    border: "1px solid #E2E8F0",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                />
                <Bar
                  dataKey="value"
                  fill="#2563EB"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border border-border bg-card shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Porcentajes de Tiro</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={shootingData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{
                    borderRadius: "12px",
                    border: "1px solid #E2E8F0",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                />
                <Bar
                  dataKey="value"
                  fill="#10B981"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Estadísticas detalladas */}
      <Card className="border border-border bg-card shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Promedios de Temporada</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-border bg-muted/30 p-4">
              <p className="text-sm text-muted-foreground">Partidos Jugados</p>
              <p className="mt-1 text-xl font-bold">
                {player.stats.gamesPlayed}
              </p>
            </div>
            <div className="rounded-xl border border-border bg-muted/30 p-4">
              <p className="text-sm text-muted-foreground">Minutos por Partido</p>
              <p className="mt-1 text-xl font-bold">
                {player.stats.minutesPerGame}
              </p>
            </div>
            <div className="rounded-xl border border-border bg-muted/30 p-4">
              <p className="text-sm text-muted-foreground">Pérdidas</p>
              <p className="mt-1 text-xl font-bold">
                {player.stats.turnoversPerGame}
              </p>
            </div>
            <div className="rounded-xl border border-border bg-muted/30 p-4">
              <p className="text-sm text-muted-foreground">3PT%</p>
              <p className="mt-1 text-xl font-bold">
                {player.stats.threePointPercentage}%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
